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
            f"<image>\nGenerate 3 {type.lower()} social media captions in {lang} for the photo above. "
            f"Each caption should be followed by 2–3 relevant hashtags."
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
            "max_tokens": 400
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
            return JSONResponse(content={"captions": [{"caption": f"API Error: {error_msg}", "hashtags": ""}]}, status_code=500)

        full_text = data["choices"][0]["message"]["content"].strip()

        # Clean and filter lines
        blocks = [line.strip("-• ") for line in full_text.split("\n") if line.strip()]

        # Skip the intro if it looks like a description
        if blocks and ("caption" in blocks[0].lower() or "here are" in blocks[0].lower()):
            blocks = blocks[1:]

        # Group each block into a dict (caption and hashtags split from the line)
        grouped = []
        for line in blocks:
            parts = line.rsplit("#", 1)
            if "#" in line:
                caption_part, hashtags_part = parts[0], "#" + parts[1]
                grouped.append({
                    "caption": caption_part.strip(),
                    "hashtags": hashtags_part.strip()
                })
            else:
                grouped.append({
                    "caption": line.strip(),
                    "hashtags": ""
                })

        return JSONResponse(content={"captions": grouped})

    except Exception as e:
        return JSONResponse(content={"captions": [{"caption": f"Error: {str(e)}", "hashtags": ""}]}, status_code=500)
