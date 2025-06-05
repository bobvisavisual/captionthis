import os
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64

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
    details: str = Form("")
):
    try:
        image_data = await image.read()
        base64_image = base64.b64encode(image_data).decode("utf-8")

        lang_map = {"en": "English", "ms": "Malay"}
        lang = lang_map.get(language, "English")

        prompt = (
            f"<image>\nGenerate 3 {type.lower()} social media captions in {lang} for the photo above."
        )
        if details:
            prompt += f" Additional context: {details.strip()}"

        payload = {
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                        {"type": "text", "text": prompt}
                    ]
                }
            ],
            "max_tokens": 300
        }

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(API_URL, json=payload, headers=headers)
        data = response.json()
        print("🔍 OpenRouter raw response:", data)

        if "choices" not in data:
            error_msg = data.get("error", {}).get("message", "Unknown error")
            return JSONResponse(content={"captions": [f"API Error: {error_msg}"]}, status_code=500)

        full_text = data["choices"][0]["message"]["content"].strip()

        # Try to split into 3 lines or parts
        parts = [line.strip("-\u2022. ") for line in full_text.split("\n") if line.strip()]
        captions = parts[:3] if len(parts) >= 3 else [full_text]

        return JSONResponse(content={"captions": captions})

    except Exception as e:
        return JSONResponse(content={"captions": [f"Error: {str(e)}"]}, status_code=500)
