# backend/main.py

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64
import os

app = FastAPI()

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
    language: str = Form(...),
    context: str = Form("")  # Optional user-provided detail
):
    try:
        image_data = await image.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")

        lang_map = {"en": "English", "ms": "Malay"}
        lang = lang_map.get(language, "English")

        base_prompt = f"Generate a {type} caption in {lang} for the given image."
        if context:
            base_prompt += f" Additional details: {context}"

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        # Generate 3 captions
        captions = []
        for _ in range(3):
            payload = {
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": "You are a caption generator."},
                    {"role": "user", "content": base_prompt}
                ],
                "max_tokens": 80
            }
            response = requests.post(API_URL, json=payload, headers=headers)
            data = response.json()
            caption = data["choices"][0]["message"]["content"].strip()
            captions.append(caption)

        return JSONResponse(content={"captions": captions})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
