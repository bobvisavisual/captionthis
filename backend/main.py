# backend/main.py

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64
import os

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("OPENROUTER_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.post("/generate")
async def generate_caption(
    image: UploadFile = File(...),
    type: str = Form(...),
    language: str = Form(...)
):
    try:
        # Read and encode the image as base64
        image_bytes = await image.read()
        base64_img = base64.b64encode(image_bytes).decode("utf-8")
        image_data_uri = f"data:image/jpeg;base64,{base64_img}"

        lang_map = {"en": "English", "ms": "Malay"}
        lang = lang_map.get(language, "English")

        prompt = f"Generate a {type} caption in {lang} for this image."

        payload = {
            "model": "deepseek/deepseek-vl",
            "messages": [
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data_uri}}
                ]}
            ],
            "max_tokens": 100
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(API_URL, json=payload, headers=headers)
        data = response.json()

        # Log the response for debugging
        print("🔍 OpenRouter response:", data)

        if "choices" not in data:
            # Error from OpenRouter, return message for debugging
            error_msg = data.get("error", {}).get("message", "Unknown error")
            return JSONResponse(content={"caption": f"API Error: {error_msg}"}, status_code=500)

        # Check for valid response
        caption = data["choices"][0]["message"]["content"].strip()
        return JSONResponse(content={"caption": caption})

    except Exception as e:
        return JSONResponse(content={"caption": f"Error: {str(e)}"}, status_code=500)
