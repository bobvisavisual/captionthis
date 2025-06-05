# backend/main.py

import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import base64

load_dotenv()

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

@app.post("/generate")
async def generate_caption(
    image: UploadFile = File(...),
    type: str = Form("funny"),
    language: str = Form("en"),
    details: str = Form("")
):
    # Read and encode image
    image_bytes = await image.read()
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Prompt for Gemini (tuned for captioning with user-provided style and language)
    prompt = f"Generate a {type} social media caption in {language.upper()} for the image. {details if details else ''}"

    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {"role": "system", "content": "You are a creative caption generator for social media images."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        )

        caption = response.choices[0].message.content.strip()
        return {"caption": caption}

    except Exception as e:
        return {"error": str(e)}
