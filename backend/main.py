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

        lang_map = {
            "en-us": "English (US)",
            "en-gb": "English (UK)",
            "ms": "Malay",
            "zh": "Chinese",
            "ta": "Tamil"
        }
        lang = lang_map.get(language, "English (US)")

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
        
        import re

        # Attempt to trim intro before "1." or "**Caption 1:**"
        caption_start = re.search(r"(?:\*\*?Caption\s*1\*\*?:?|^1\.)", full_text, re.IGNORECASE | re.MULTILINE)
        if caption_start:
            full_text = full_text[caption_start.start():]

        # Try to split based on either markdown-style or number-style headings
        blocks = re.split(r"(?:\*\*?Caption\s*\d\*\*?:?|^\d\.\s*)", full_text, flags=re.IGNORECASE | re.MULTILINE)
        blocks = [block.strip() for block in blocks if block.strip()]

        grouped = []
        for block in blocks:
            lines = block.splitlines()
            caption_lines = []
            hashtags = []

            for line in lines:
                if "#" in line or re.search(r"#\w+", line):
                    hashtags.append(line.strip())
                else:
                    caption_lines.append(line.strip())

            grouped.append({
                "caption": " ".join(caption_lines).strip(),
                "hashtags": " ".join(hashtags).strip()
            })

        # Final fallback
        if not grouped:
            grouped = [{"caption": full_text.strip(), "hashtags": ""}]

        return JSONResponse(content={"captions": grouped})

    except Exception as e:
        return JSONResponse(content={"captions": [{"caption": f"Error: {str(e)}", "hashtags": ""}]}, status_code=500)
