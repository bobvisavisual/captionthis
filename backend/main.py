# backend/main.py - FastAPI server for AI Caption Generator

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64
import os

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load from environment for safety
API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.post("/generate")
async def generate_caption(
    image: UploadFile = File(...),
    type: str = Form(...),
    language: str = Form(...)
):
    try:
        # Convert image to base64
        image_data = await image.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")

        # Language mapping
        lang_map = {"en": "English", "ms": "Malay"}
        lang = lang_map.get(language.lower(), "English")

        # Prompt
        prompt = f"Generate a {type} caption in {lang} for the given image."

        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a caption generator."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 80
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(API_URL, json=payload, headers=headers)

        if response.status_code != 200:
            print("❌ OpenRouter API error:", response.status_code, response.text)
            return JSONResponse(status_code=500, content={"caption": "Failed to generate caption. (API error)"})

        data = response.json()

        # Check if 'choices' exists
        if "choices" not in data or not data["choices"]:
            print("⚠️ Unexpected response format:", data)
            return JSONResponse(status_code=500, content={"caption": "Failed to generate caption. (Invalid API response)"})

        caption = data["choices"][0]["message"]["content"].strip()
        return JSONResponse(content={"caption": caption})

    except Exception as e:
        print("❌ Exception occurred:", str(e))
        return JSONResponse(status_code=500, content={"caption": f"Error: {str(e)}"})
