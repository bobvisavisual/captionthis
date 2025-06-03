// caption_generator_app - Standalone React App with DeepSeek API Integration

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const CaptionGenerator = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateCaption = async () => {
    if (!image) return;
    setLoading(true);
    setCaption("");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", captionType);
    formData.append("language", language);

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCaption(data.caption);
    } catch (error) {
      setCaption("Failed to generate caption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">AI Caption Generator</h2>

          <Input type="file" accept="image/*" onChange={handleImageUpload} />

          {preview && (
            <img src={preview} alt="Preview" className="w-full rounded" />
          )}

          <select
            value={captionType}
            onChange={(e) => setCaptionType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="funny">Funny</option>
            <option value="romantic">Romantic</option>
            <option value="poetic">Poetic</option>
            <option value="sarcastic">Sarcastic</option>
            <option value="inspirational">Inspirational</option>
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="en">English</option>
            <option value="ms">Malay</option>
          </select>

          <Button onClick={handleGenerateCaption} disabled={loading}>
            {loading ? "Generating..." : "Generate Caption"}
          </Button>

          {caption && (
            <div className="p-4 bg-white border rounded shadow">
              <p className="text-center text-lg">{caption}</p>
              <Button
                className="mt-2 w-full"
                onClick={() => navigator.clipboard.writeText(caption)}
              >
                Copy Caption
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptionGenerator;
