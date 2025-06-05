import React, { useState } from "react";
// import axios from "axios"; // Commented out for now

function App() {
  const [image, setImage] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [captions, setCaptions] = useState([]);
  const [details, setDetails] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate caption response for styling demo
    setCaptions([
      "This is a sample caption to preview styling.",
      "Another creative take for your image.",
      "A third witty caption just in case!"
    ]);
    /* Uncomment and use this when Axios is ready
    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", captionType);
    formData.append("language", language);
    formData.append("details", details);

    try {
      const response = await axios.post("https://captionthis.onrender.com/generate", formData);
      setCaptions(response.data.captions || []);
    } catch (error) {
      setCaptions(["API Error: " + error.message]);
    }
    */
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-1 text-center">Caption It!</h1>
      <h2 className="text-sm md:text-1xl font-semibold mb-8 text-black-50 uppercase text-center">Stop guessing. Start captioning.</h2>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-100 p-6 rounded-2xl shadow-md space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium">Upload an image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
            required
          />
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
          <h2 className="text-xl font-bold mb-2">Generated Captions:</h2>
          {captions.map((cap, idx) => (
            <p key={idx} className="bg-white border rounded-xl p-4 shadow text-lg">{cap}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
