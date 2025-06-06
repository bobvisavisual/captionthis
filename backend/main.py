import os
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import base64
import re

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

        # Updated language map for more granularity
        lang_map = {
            "en-US": "English (US)",
            "en-UK": "English (UK)",
            "ms": "Malay",
            "zh": "Chinese",
            "ta": "Tamil"
        }
        lang = lang_map.get(language, "English")

        prompt = (
            f"You are an expert caption generator."
            f" Generate exactly 3 {type.lower()} social media captions in {lang} for the given photo."
            f" Each caption should be numbered (1., 2., 3.) and followed by 2–3 relevant hashtags on the next line."
            f" Respond only with the captions and hashtags, no explanations."
        )

        if details:
            prompt += f"\nAdditional context: {details.strip()}"

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
            return JSONResponse(content={"captions": [f"API Error: {error_msg}"]}, status_code=500)

        full_text = data["choices"][0]["message"]["content"].strip()

        # Parsing logic with multilingual tolerance (supports 1./２．/١. etc)
        parts = re.split(r"(?:(?<=\n)|^)[\d１２٣一二三١٢٣][\.:、\-)]\s*", full_text)
        grouped = []

        for part in parts:
            if not part.strip():
                continue
            lines = part.strip().split("\n")
            caption = lines[0].strip()
            hashtags = " ".join(lines[1:]).strip() if len(lines) > 1 else ""
            grouped.append({"caption": caption, "hashtags": hashtags})

        return JSONResponse(content={"captions": grouped})

    except Exception as e:
        return JSONResponse(content={"captions": [{"caption": f"API Error: {str(e)}", "hashtags": ""}]}, status_code=500)
