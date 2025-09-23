import React, { useState,useEffect } from "react";
import "./CreatePost.css";

export default function CreatePost({ userId, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };


 const [news, setNews] = useState([]);

const fetchNews = async () => {
  try {
    const res = await fetch("http://localhost/coolpage/my-app/backend/get_news.php");
    const data = await res.json();
    if (data.success) {
      setNews(data.news); // update news state
    }
  } catch (err) {
    console.error("Error fetching news:", err);
  }
    };

    useEffect(() => {
  fetchNews();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!content && files.length === 0) {
    alert("Please add content or media.");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("title", title);
  formData.append("content", content);
  formData.append("category", category);
  files.forEach((file) => formData.append("media[]", file));

  try {
    const res = await fetch("http://localhost/coolpage/my-app/backend/add_postnews.php", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      alert("Post created successfully!");
      setTitle("");
      setContent("");
      setFiles([]);
      setCategory("General");
      if (onClose) onClose();
      
      fetchNews(); // <-- Refresh news after adding
    } else {
      alert(result.message || "Failed to create post.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("An error occurred while creating the post.");
  }
  setLoading(false);
};

  return (
    <div className="modal">
      <div className="modal-content">
        {/* Close button triggers onClose */}
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2 className="modal-title">News Post</h2>

        <input
          type="text"
          className="input-title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="input-textarea"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <select
          className="input-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>General</option>
          <option>Announcement</option>
          <option>Event</option>
        </select>

        <div className="upload-box">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="mediaInput"
          />
          <label htmlFor="mediaInput" className="click-text">
            Drag & drop photos/videos or click to add
          </label>
          {files.length > 0 && (
            <div>
              {files.map((file, i) => (
                <p key={i}>{file.name}</p>
              ))}
            </div>
          )}
        </div>

        <button className="post-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
