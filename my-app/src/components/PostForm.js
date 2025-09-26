import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const ffmpeg = new FFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.12.15/dist/ffmpeg-core.js"
});
  const API_URL= process.env.REACT_APP_API_URL;




const getFullPicUrl = (pic) => {
  if (!pic || typeof pic !== 'string' || pic.trim() === '') {
    return '/Logo/default-avatar.png'; // fallback to default
  }


  return pic.startsWith('http')
    ? pic
    : `${ API_URL}/uploads/${pic.replace(/^\/+/, '')}`;
}

function PostForm({ onSubmit, user, onRefresh }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files) => setMediaFiles((prev) => [...prev, ...files]);
  const removeFile = (idx) =>
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);
  const handleFileChange = (e) => addFiles(Array.from(e.target.files));
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const compressVideo = async (file) => {
    if (!ffmpeg.loaded) await ffmpeg.load();

    const inName = `input.${file.name.split(".").pop()}`;
    const outName = "output.mp4";

    await ffmpeg.writeFile(inName, await file.arrayBuffer());
    await ffmpeg.exec([
      "-i",
      inName,
      "-vf",
      "scale=-2:720",
      "-c:v",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outName
    ]);

    const data = await ffmpeg.readFile(outName);
    await ffmpeg.deleteFile([inName, outName]);

    const blob = new Blob([data.buffer], { type: "video/mp4" });
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".mp4", {
      type: "video/mp4"
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user?.firstname && !user?.email) return alert("You must be logged in");

  setLoading(true);
  try {
    const formData = new FormData();

    // 👇 now sending firstname instead of username
    user.firstname && formData.append("firstname", user.firstname);
    user.lastname && formData.append("lastname", user.lastname);
    user.email && formData.append("email", user.email);
    user.country && formData.append("country", user.country);

    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("category", category);

    for (const file of mediaFiles) {
      const type = file.type;

      if (type.startsWith("image/")) {
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          formData.append("media[]", compressed, compressed.name);
        } catch (err) {
          console.warn("Image compression failed, uploading original:", err);
          formData.append("media[]", file);
        }
      } else if (type.startsWith("video/")) {
        formData.append("media[]", file);
      } else {
        console.warn("Unsupported file type skipped:", file.name);
      }
    }

    const { data } = await axios.post(
      `${API_URL}/create_post.php`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (data.success) {
      alert("Post submitted!");
      onSubmit?.(data.post);
      setTitle("");
      setContent("");
      setMediaFiles([]);
      setCategory("General");
      setShowModal(false);
      onRefresh?.();
    } else {
      alert(data.message || "Post failed");
    }
  } catch (err) {
    console.error(err);
    alert("Upload error: " + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};


  const handleInput = (e) => {
    setContent(e.target.innerHTML); // Keeps HTML formatting
  };
  const Preview = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
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
                cursor: "pointer",
                fontSize: 12,
                lineHeight: "20px"
              }}
            >
              ×
            </button>
            {f.type.startsWith("image/") ? (
              <img
                src={url}
                alt=""
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 6
                }}
              />
            ) : (
              <video
                src={url}
                controls
                style={{ width: 100, height: 100, borderRadius: 6 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ width: "auto", maxWidth: '100%', margin: "auto", marginBottom:'10px'}}>
      {/* Facebook-style post bar */}
      <div
        onClick={() => setShowModal(true)}
         style={{
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 10,
        padding: "5px",
      }}
      >
      <div style={{ display: "flex", alignItems: "center" }}>
  <img
    src={getFullPicUrl(user?.profile_pic)}
    alt="avatar"
    style={{
      width: 50,
      height: 50,
      borderRadius: "60%",
      objectFit: "cover",
  marginRight: 10,
      border: "1px solid #ccc",
    }}
  />
  <span
    style={{
      color: "#555",
      fontSize: "12px",
      border: "1px solid #ccc",
      borderRadius: 10,
      backgroundColor: "#f5f5f5",
      padding: "6px 10px",
      display: "inline-block",
      width: "400px"
    }}
  >
    What's on your mind, {user?.firstname || "User"}?
  </span>
</div>
   

      {/* Optional post icons */}
      <div
      style={{
          marginTop: 5,
          paddingTop: 5,
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "flex-start",
          fontSize: "10px",
        }}
      >

        <div style={{ color: "#43a047", cursor: "pointer" }}>
<div> </div>
          
       <div
  onClick={() => {
    const input = document.getElementById("mediaInputTrigger");
    if (input) {
      input.value = ""; // Clear previous selection
      input.click();
    }
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f5e9")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}

>
  📷 Click to Select Photo/Video
</div>

{/* Hidden input just to trigger modal */}
<input
  type="file"
  id="mediaInputTrigger"
  accept="image/*,video/*"
  multiple
  style={{ display: "none" }}
  onChange={(e) => {
    if (e.target.files.length > 0) {
      handleFileChange(e); // set files
      setShowModal(true);  // show the form
    }
  }}
/>
   </div>


          
        </div>

      </div>

      {/* Post Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              width: "100%",
              maxWidth: 600,
              padding: 20,
              position: "relative"
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 10 }}>Create Post</h2>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 20,
                border: "none",
                background: "none",
                fontSize: 22,
                cursor: "pointer"
              }}
            >
              ×
            </button>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                style={inputStyle}
              />
              <textarea
               contentEditable
                onInput={handleInput}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required
           rows={6}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 10,
          fontSize: 16,
          lineHeight: 1.4,
          resize: "none",
          outline: "none",
           whiteSpace: "pre-wrap", // ✅ preserves line breaks
        }}
              />

  
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                {["General", "Really Lesson", "COOL", "ReallyAvatar", "Coursera", "TechTree"].map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>

           <div
  onClick={() => document.getElementById("mediaInput").click()}
  onDragOver={(e) => {
    e.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={(e) => {
    e.preventDefault();
    setIsDragging(false);
  }}
  onDrop={(e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      // Check if mixing images and videos
      const hasImage = files.some((f) => f.type.startsWith("image/"));
      const hasVideo = files.some((f) => f.type.startsWith("video/"));

      if (hasImage && hasVideo) {
        alert("You can only upload photos OR videos, not both at the same time.");
        return;
      }

      handleFileChange({ target: { files } });
      e.dataTransfer.clearData();
    }
  }}
  style={{
    border: isDragging ? "2px dashed #0077b6" : "2px dashed #ccc",
    borderRadius: 5,
    padding: 20,
    marginBottom: 10,
    textAlign: "center",
    background: isDragging ? "#e0f7fa" : "#f9f9f9",
    cursor: "pointer"
  }}
>
  Drag & drop photos/videos or <strong>click to add</strong>
</div>

<input
  id="mediaInput"
  type="file"
  accept="image/*,video/*"
  multiple
  style={{ display: "none" }}
  onChange={(e) => {
    const files = Array.from(e.target.files);

    // Check if mixing images and videos
    const hasImage = files.some((f) => f.type.startsWith("image/"));
    const hasVideo = files.some((f) => f.type.startsWith("video/"));

    if (hasImage && hasVideo) {
      alert("You can only upload photos OR videos, not both at the same time.");
      e.target.value = ""; // reset input
      return;
    }

    handleFileChange(e);
  }}
/>
<Preview />

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#0091c2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "10px 20px",
                  width: "100%",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
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
  fontSize: 16,
  borderRadius: 5,
  border: "1px solid #ccc",
  marginBottom: 10
  
};

export default PostForm;
