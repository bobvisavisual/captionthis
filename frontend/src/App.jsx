import React, { useState, useRef } from "react";
import axios from "axios";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [image, setImage] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [captions, setCaptions] = useState([]);
  const [details, setDetails] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);
  const captionsRef = useRef(null);

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
  
  const handleDownload = (fullText, idx) => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `caption-${idx + 1}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRemoveImage = () => {
    setImage(null);
    inputRef.current.value = null;
  };
  
  const handleReset = () => {
	setImage(null);
	setCaptions([]);
	setDetails("");
	inputRef.current.value = null;
	window.scrollTo({ top: 0, behavior: "smooth" });
	};


  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!image) {
    alert("Please upload an image first.");
    return;
  }

  setLoading(true); // show spinner
  setCaptions([]);
  // Delay scroll into view by 100ms
  setTimeout(() => {
    captionsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);

  const formData = new FormData();
  formData.append("image", image);
  formData.append("type", captionType);
  formData.append("language", language);
  formData.append("details", details);

  try {
    const response = await axios.post("https://captionthis.onrender.com/generate", formData);
    const result = response.data.captions;
    const safeCaptions = result.map((c) =>
      typeof c === "string" ? { caption: c, hashtags: "" } : c
    );
    setCaptions(safeCaptions);
  } catch (error) {
    setCaptions([{ caption: "API Error: " + error.message, hashtags: "" }]);
  } finally {
    setLoading(false); // hide spinner
  }
};

	const captionStyles = [
		"funny",
		"relatable",
		"inspiring",
		"trendy",
		"sassy",
		"aesthetic"
	];

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
              name="image"
              onChange={handleImageChange}
              className="hidden"
              ref={inputRef}
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
            {captionStyles.map((style, index) => (
              <button
                key={style}
                type="button"
                onClick={() => setCaptionType(style)}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition-colors duration-300
                  ${captionType === style ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCaptionType("random")}
              className={`col-span-3 px-4 py-2 rounded-xl text-white font-semibold transition-colors duration-300
                ${captionType === "random" ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              Random
            </button>
          </div>
        </div>

        <div>
			<label className="block mb-2 font-medium">Language:</label>
			<select
				value={language}
				onChange={(e) => setLanguage(e.target.value)}
				className="w-full p-3 rounded-xl border border-gray-300 bg-white dark:bg-gray-800 dark:text-white"
			>
				<option value="en-us">🇺🇸 English (US)</option>
				<option value="en-gb">🇬🇧 English (UK)</option>
				<option value="ms">🇲🇾 Malay</option>
				<option value="zh">🇨🇳 Chinese</option>
				<option value="ta">🇮🇳 Tamil</option>
			</select>
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

      {loading && (
        <div ref={captionsRef} className="mt-8 text-center text-lg font-medium animate-pulse">
          Generating captions...
        </div>
      )}

      {captions.length > 0 && (
		<div ref={captionsRef} className="mt-8 max-w-xl text-center space-y-4">
			{loading ? (
			<p className="text-center text-gray-500">Generating captions...</p>
			) : (
			<>
				<h2 className="text-xl font-bold mb-4">Generated Captions:</h2>
				{captions.map((cap, idx) => (
				<div key={idx} className="bg-white border rounded-xl p-4 shadow text-left animate-fade-in-up">
					<p className="text-sm font-medium mb-1">{cap.caption}</p>
					<p className="text-sm text-gray-600 mb-3">{cap.hashtags}</p>
					<div className="flex justify-end gap-4 mt-2">
					{/* WhatsApp */}
					<button
						onClick={() =>
							window.open(
								`https://wa.me/?text=${encodeURIComponent(`${cap.caption}\n${cap.hashtags}\nhttps://captionthis.aimusebox.com`)}`,
								"_blank"
							)
						}
						title="Share on WhatsApp"
						className="hover:opacity-80"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="#25D366" viewBox="0 0 24 24" width="20" height="20">
							<path d="M20.52 3.48a11.81 11.81 0 00-16.7 0 11.81 11.81 0 00-1.51 14.9L2 22l3.65-1.02a11.82 11.82 0 0014.87-1.5 11.81 11.81 0 000-16.7zm-5.52 13c-.7.78-1.56.9-2.66.53-1.1-.36-2.35-1.23-3.56-2.43s-2.07-2.46-2.43-3.56c-.37-1.1-.25-1.96.53-2.66.47-.43.9-.68 1.27-.72.36-.03.74.05 1.12.23.26.13.5.36.73.68.23.33.4.57.5.72.13.2.17.4.12.6-.05.2-.2.42-.43.66l-.53.56c-.1.1-.16.2-.17.3s.03.23.14.36c.5.65 1.07 1.23 1.7 1.74.5.4.9.6 1.2.6.1 0 .21-.06.33-.17l.47-.44c.22-.2.44-.3.65-.27.21.03.44.2.7.52.26.3.46.62.6.93.3.73.18 1.32-.34 1.86z"/>
						</svg>
					</button>
					{/* Twitter/X */}
					<button
						onClick={() =>
							window.open(
								`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${cap.caption}\n${cap.hashtags}\nhttps://captionthis.aimusebox.com`)}`,
								"_blank"
							)
						}
						title="Share on X"
						className="hover:opacity-80"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24" width="20" height="20">
							<path d="M4 4h4l5 7 5-7h4l-7.5 10L20 20h-4l-5-7-5 7H4l7.5-10L4 4z" />
						</svg>
					</button>
					{/* Download */}
					<button
						onClick={() => handleDownload(`${cap.caption}\n${cap.hashtags}`, idx)}
						title="Download caption"
						className="hover:opacity-80"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="#4B5563" viewBox="0 0 24 24" width="20" height="20">
							<path d="M12 16l4-5h-3V4h-2v7H8l4 5zm8 4H4v-2h16v2z"/>
						</svg>
					</button>
					{/* Copy */}
					<button
						onClick={() => handleCopy(`${cap.caption}\n${cap.hashtags}`, idx)}
						title="Copy to clipboard"
						className="hover:opacity-80"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="#4B5563" viewBox="0 0 24 24" width="20" height="20">
							<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
						</svg>
					</button>
					</div>
				</div>
				))}
				<div className="mt-6 flex justify-center">
					<button
						onClick={handleReset}
						className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition flex items-center gap-2"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 24 24" width="20" height="20">
							<path d="M10 10 L 30 10 M 10 30 L 30 30 M 20 20 L 20 20" stroke="black" stroke-width="3" />
							<circle cx="20" cy="20" r="10" fill="white" stroke="black" stroke-width="2" />
						</svg>
						Caption another image
					</button>
				</div>
			</>
			)}
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
	<Analytics />
    </div>
  );
}

export default App;
