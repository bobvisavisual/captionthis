# backend/main.py - FastAPI server for AI Caption Generator

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64
import io
from PIL import Image

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your DeepSeek or OpenRouter key
API_KEY = "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"
API_URL = "https://openrouter.ai/api/v1/chat/completions"  # or DeepSeek API URL

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
        lang = lang_map.get(language, "English")

        # Prompt for AI
        prompt = f"Generate a {type} caption in {lang} for the given image."

        # Example using OpenRouter (you may adjust for DeepSeek directly)
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
        data = response.json()

        caption = data["choices"][0]["message"]["content"].strip()
        return JSONResponse(content={"caption": caption})

    except Exception as e:
        return JSONResponse(content={"caption": f"Error: {str(e)}"}, status_code=500)
