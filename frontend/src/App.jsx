// frontend/src/App.jsx

import { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [style, setStyle] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [context, setContext] = useState("");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", style);
    formData.append("language", language);
    formData.append("context", context);

    setLoading(true);
    setCaptions([]);

    const res = await fetch("https://captionthis.onrender.com/generate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCaptions(data.captions || [`Error: ${data.error}`]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-2">Caption It!</h1>
      <p className="text-gray-600 mb-6">Instant captions for your moments ✨</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4"
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        {["funny", "inspiring", "emotional", "witty", "romantic"].map((s) => (
          <button
            key={s}
            className={`py-2 px-4 rounded ${
              style === s ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setStyle(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          className={`py-2 px-4 rounded col-span-1 ${
            style === "random" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setStyle("random")}
        >
          Random
        </button>
      </div>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="en">English</option>
        <option value="ms">Malay</option>
      </select>

      <textarea
        placeholder="Add any extra details (optional)"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="w-full max-w-md p-2 mb-4 border rounded"
        rows={2}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded mb-6"
      >
        {loading ? "Generating..." : "Generate Caption"}
      </button>

      {captions.length > 0 && (
        <div className="w-full max-w-md space-y-4">
          {captions.map((caption, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded">
              <p>{caption}</p>
              <button
                className="mt-2 text-sm text-blue-500"
                onClick={() => navigator.clipboard.writeText(caption)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
