import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
  const API_URL= process.env.REACT_APP_API_URL;
const ffmpeg = new FFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.12.15/dist/ffmpeg-core.js"
});

const getFullPicUrl = (pic) => {
  if (!pic || typeof pic !== 'string' || pic.trim() === '') {
    return '/Logo/default-avatar.png';
  }
  return pic.startsWith('http')
    ? pic
    : `${API_URL}/uploads/${pic.replace(/^\/+/, '')}`;
};

function GroupPostForm({ user, groupId, onRefresh }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files) => setMediaFiles((prev) => [...prev, ...files]);
  const removeFile = (idx) => setMediaFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleFileChange = (e) => addFiles(Array.from(e.target.files));
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || !groupId) return alert("Login and group context required.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("group_id", groupId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("category", category);
      formData.append("username", user.username || "");
      formData.append("country", user.country || "");

      for (const file of mediaFiles) {
        if (file.type.startsWith("image/")) {
          try {
            const compressed = await imageCompression(file, {
              maxSizeMB: 1.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            });
            formData.append("media[]", compressed, compressed.name);
          } catch {
            formData.append("media[]", file);
          }
        } else if (file.type.startsWith("video/")) {
          formData.append("media[]", file);
        }
      }

      const { data } = await axios.post(
        `${API_URL}/create_group_post.php`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      if (data.success) {
        alert("Group post submitted!");
        setTitle("");
        setContent("");
        setMediaFiles([]);
        setShowModal(false);
        onRefresh?.();
      } else {
        alert(data.message || "Post failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setLoading(false);
    }
  };

  const Preview = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {mediaFiles.map((f, i) => {
        const url = URL.createObjectURL(f);
        return (
          <div key={i} style={{ position: "relative" }}>
            <button
              onClick={() => removeFile(i)}
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                cursor: "pointer"
              }}
            >×</button>
            {f.type.startsWith("image/") ? (
              <img src={url} alt="" style={{ width: 100, height: 100, borderRadius: 6, objectFit: "cover" }} />
            ) : (
              <video src={url} controls style={{ width: 100, height: 100, borderRadius: 6 }} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 'a', margin: "10px" }}>
      {/* Trigger */}
      <div onClick={() => setShowModal(true)} style={{
        background: "#fff", border: "1px solid #ccc", borderRadius: 10, padding: 10, cursor: "pointer"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={getFullPicUrl(user?.profile_pic)} alt="avatar"
            style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", marginRight: 10 }} />
          <span style={{
            background: "#f1f1f1", padding: "8px 12px", borderRadius: 10,
            width: "100%", fontSize: 14
          }}>
            What's on your mind in this group, {user?.username}?
          </span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", padding: 20, borderRadius: 10,
            width: "100%", maxWidth: 600, position: "relative"
          }}>
            <button onClick={() => setShowModal(false)}
              style={{ position: "absolute", right: 20, top: 10, fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>×</button>
            <h2 style={{ textAlign: "center", marginBottom: 10 }}>Create Group Post</h2>

            <form onSubmit={handleSubmit}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Title" required style={inputStyle} />
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..." required style={{ ...inputStyle, minHeight: 80 }} />
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                {["General", "Announcement", "Discussion", "Event"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div
                onClick={() => document.getElementById("mediaInput").click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: isDragging ? "2px dashed #007bff" : "2px dashed #ccc",
                  borderRadius: 5, padding: 20, textAlign: "center", background: "#f9f9f9", marginBottom: 10
                }}
              >
                Drag and drop media here or <strong>click to select</strong>
              </div>
              <input
                type="file"
                id="mediaInput"
                accept="image/*,video/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <Preview />

              <button type="submit" disabled={loading} style={{
                background: "#28a745", color: "#fff", border: "none", borderRadius: 5,
                padding: "10px 20px", width: "100%", cursor: loading ? "not-allowed" : "pointer"
              }}>
                {loading ? "Posting…" : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  fontSize: 14,
  borderRadius: 5,
  border: "1px solid #ccc",
  marginBottom: 20
};

export default GroupPostForm;
