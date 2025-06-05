// frontend/src/App.jsx
import { useState } from 'react';
import './App.css';

const captionStyles = ['funny', 'inspiring', 'emotional', 'witty', 'romantic', 'random'];
const languages = [
  { label: 'English', code: 'en' },
  { label: 'Malay', code: 'ms' }
];

function App() {
  const [image, setImage] = useState(null);
  const [style, setStyle] = useState('funny');
  const [language, setLanguage] = useState('en');
  const [captions, setCaptions] = useState([]);
  const [extraDetails, setExtraDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setCaptions([]);
  };

  const generateCaptions = async () => {
    if (!image) return;
    setLoading(true);
    setCaptions([]);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', style);
    formData.append('language', language);
    formData.append('details', extraDetails);

    try {
      const response = await fetch('https://your-backend-url.com/generate', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setCaptions(data.captions || ['No captions generated.']);
    } catch (err) {
      setCaptions(['Error generating captions.']);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Caption It!</h1>
      <p className="text-lg text-gray-500 mb-6">Turn any photo into scroll-stopping captions</p>

      <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-6"
      />

      <h2 className="text-xl font-semibold text-gray-700 mb-2">Caption Style</h2>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {captionStyles.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-4 py-2 rounded font-medium ${
              s === style ? 'bg-blue-600 text-white' : s === 'random' ? 'bg-yellow-300 text-black' : 'bg-white text-gray-700 border'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-2">Language</h2>
      <div className="mb-6">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 mx-1 rounded font-medium ${
              lang.code === language ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-2">Additional Info</h2>
      <textarea
        placeholder="Add extra details about the photo (optional)"
        value={extraDetails}
        onChange={(e) => setExtraDetails(e.target.value)}
        className="w-full max-w-md p-2 border border-gray-300 rounded mb-6"
        rows={3}
      ></textarea>

      <button
        onClick={generateCaptions}
        className="bg-indigo-600 text-white px-6 py-2 rounded shadow-md hover:bg-indigo-700 mb-6"
      >
        {loading ? 'Generating...' : 'Generate Captions'}
      </button>

      <div className="space-y-4 w-full max-w-xl">
        {captions.map((caption, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="text-gray-800">{caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
