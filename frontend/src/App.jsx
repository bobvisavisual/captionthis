import React, { useState } from 'react';

const App = () => {
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
      const res = await fetch("https://captionthis.onrender.com/generate", {
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
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>AI Caption Generator</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && <img src={preview} alt="Preview" style={{ width: "100%", marginTop: "1rem" }} />}
      <select value={captionType} onChange={(e) => setCaptionType(e.target.value)} style={{ width: "100%", marginTop: "1rem" }}>
        <option value="funny">Funny</option>
        <option value="romantic">Romantic</option>
        <option value="poetic">Poetic</option>
        <option value="sarcastic">Sarcastic</option>
        <option value="inspirational">Inspirational</option>
      </select>
      <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", marginTop: "0.5rem" }}>
        <option value="en">English</option>
        <option value="ms">Malay</option>
      </select>
      <button onClick={handleGenerateCaption} disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
        {loading ? "Generating..." : "Generate Caption"}
      </button>
      {caption && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <p>{caption}</p>
          <button onClick={() => navigator.clipboard.writeText(caption)} style={{ marginTop: "0.5rem" }}>
            Copy Caption
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
