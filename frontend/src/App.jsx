import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = async () => {
    if (!image) return alert("Please upload an image.");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", captionType);
    formData.append("language", language);

    setLoading(true);
    try {
      const res = await axios.post("https://captionthis.onrender.com/generate", formData);
      setCaption(res.data.caption);
    } catch (err) {
      setCaption("Error generating caption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-4 py-10 font-sans">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center">
        CaptionThis.
      </h1>

      <div className="w-full max-w-md bg-gray-50 p-6 rounded-2xl shadow-xl">
        <label className="block mb-3 text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-md p-2 mb-4"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="mb-4 rounded-lg shadow"
          />
        )}

        <div className="mb-4">
          <p className="text-sm font-semibold mb-1 text-gray-700">Caption Style:</p>
          <div className="flex gap-2 flex-wrap">
            {["funny", "serious", "witty"].map((type) => (
              <button
                key={type}
                onClick={() => setCaptionType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  captionType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold mb-1 text-gray-700">Language:</p>
          <div className="flex gap-2">
            {[
              { code: "en", label: "English" },
              { code: "ms", label: "Malay" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  language === lang.code
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          {loading ? "Generating..." : "Generate Caption"}
        </button>

        {caption && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center font-medium text-gray-800 shadow-inner">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
