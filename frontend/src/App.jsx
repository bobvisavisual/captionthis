import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [captions, setCaptions] = useState([]);
  const [details, setDetails] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const inputRef = useRef();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCopy = (fullText, index) => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  const handleRemoveImage = () => {
    setImage(null);
    inputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", captionType);
    formData.append("language", language);
    formData.append("details", details);

    try {
  const response = await axios.post("https://captionthis.onrender.com/generate", formData);
  const result = response.data.captions;

  // Normalize in case it's an array of strings
  const safeCaptions = result.map((c) =>
    typeof c === "string" ? { caption: c, hashtags: "" } : c
  );

  setCaptions(safeCaptions);
} catch (error) {
  setCaptions([{ caption: "API Error: " + error.message, hashtags: "" }]);
}
    
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"} min-h-screen flex flex-col items-center justify-center px-4 py-8 transition-colors duration-500`}>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 px-4 py-2 rounded-md border text-sm font-medium transition hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      <h1 className="text-4xl md:text-6xl font-bold mb-1 text-center">Caption It!</h1>
      <h2 className="text-sm md:text-1xl font-semibold mb-8 uppercase text-center opacity-70">Stop guessing. Start captioning.</h2>

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-gray-100"} p-6 rounded-2xl shadow-md space-y-6 transition-colors duration-500`}
      >
        <div>
          <label className="block mb-2 font-medium">Upload an image:</label>
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`flex flex-col items-center justify-center w-full border-2 border-dashed ${darkMode ? "border-gray-600 hover:border-blue-400" : "border-gray-300 hover:border-blue-500"} rounded-xl p-6 text-center cursor-pointer transition`}
          >
            <svg
              className="w-10 h-10 mb-2 text-gray-400 transition-transform duration-300 transform hover:scale-110"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            <span className="text-gray-500">Click to upload or drag & drop</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={inputRef}
              required
            />
          </label>
          {image && (
            <div className="mt-4 relative">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Caption Style:</label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {["funny", "inspiring", "emotional", "witty", "romantic", "executive", "random"].map((style, index) => (
              <button
                key={style}
                type="button"
                onClick={() => setCaptionType(style)}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition-colors duration-300
                  ${captionType === style ? 'bg-blue-700' : style === 'random' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-500 hover:bg-blue-600'}
                  ${index === 6 ? 'col-span-3 text-center' : ''}`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Language:</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-xl font-semibold border transition ${
                language === "en"
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-400'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ms")}
              className={`px-4 py-2 rounded-xl font-semibold border transition ${
                language === "ms"
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-400'
              }`}
            >
              Malay
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Additional Details:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add extra info about the photo (optional)"
            className="w-full p-2 rounded-xl border border-gray-300"
            rows={3}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
        >
          Generate Captions
        </button>
      </form>

      {captions.length > 0 && (
        <div className="mt-8 max-w-xl text-center space-y-4">
          <h2 className="text-xl font-bold mb-4">Generated Captions:</h2>
          {captions.map((cap, idx) => (
            <div key={idx} className="bg-white border rounded-xl p-4 shadow text-left relative animate-fade-in-up">
              <p className="text-lg font-medium mb-1">{cap.caption}</p>
              <p className="text-sm text-gray-500 mb-2">{cap.hashtags}</p>
              <button
                onClick={() => handleCopy(`${cap.caption}\n${cap.hashtags}`, idx)}
                className="absolute top-2 right-2 text-sm text-blue-600 hover:underline"
              >
                {copiedIndex === idx ? "Copied!" : "📋 Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-12 max-w-xl text-center text-sm text-gray-500 px-6">
        <p className="mb-2">
          <strong>Caption It!</strong> helps you turn your photos into scroll-stopping social media posts using AI.
          Choose your style, language, and give it a little context — we’ll do the rest.
        </p>
        <p className="mb-2">
          <strong>Privacy first:</strong> Your uploaded photo is never stored or saved. It is processed temporarily to generate the captions.
        </p>
        <p className="mb-10 italic">
          AI isn't perfect — always review the captions before posting. Some outputs may be inaccurate or unexpected.
        </p>
        <p>
          Built with ❤️ using FastAPI, Vite, and Tailwind.<br />Enjoy and tag us when you share your AI captions!
        </p>
      </footer>

      <style>
        {`@keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }`}
      </style>
    </div>
  );
}

export default App;
