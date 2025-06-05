import React, { useState } from "react";
// import axios from "axios"; // Commented out for now

function App() {
  const [image, setImage] = useState(null);
  const [captionType, setCaptionType] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [caption, setCaption] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate caption response for styling demo
    setCaption("This is a sample caption to preview styling.");
    // Uncomment and use the code below when Axios is ready
    /*
    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", captionType);
    formData.append("language", language);

    try {
      const response = await axios.post("https://your-api-url.com/generate", formData);
      setCaption(response.data.caption);
    } catch (error) {
      setCaption("API Error: " + error.message);
    }
    */
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-1 text-center">Caption It!</h1>
	  <h2 className="text-sm md:text-1xl font-semibold mb-8 text-gray-100 uppercase text-center">Caption This</h2>

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
			<label className="block mb-2 font-medium">Choose caption style:</label>
			<div className="grid grid-cols-3 gap-3 mb-6">
			{['funny', 'inspiring', 'emotional', 'witty', 'romantic', 'professional', 'random'].map((style, index) => (
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

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition"
        >
          Generate Caption
        </button>
      </form>

      {caption && (
        <div className="mt-8 max-w-xl text-center p-4 border rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">Generated Caption:</h2>
          <p className="text-lg">{caption}</p>
        </div>
      )}
    </div>
  );
}

export default App;
