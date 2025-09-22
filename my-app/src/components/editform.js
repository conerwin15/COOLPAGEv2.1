// src/components/editform.js
import React, { useState } from 'react';
import axios            from 'axios';
import imageCompression from 'browser-image-compression';
import { FFmpeg }       from '@ffmpeg/ffmpeg';

/* ─────────────────────────────────────────────────────────────
   1️⃣  ONE lazy‑initialised FFmpeg instance (module‑scope, NO hooks)
   ───────────────────────────────────────────────────────────── */
let ffmpeg = null;
async function getFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg({
      corePath: 'https://unpkg.com/@ffmpeg/core@0.12.15/dist/ffmpeg-core.js',
      log: false,
    });
    await ffmpeg.load();
  }
  return ffmpeg;
}

/* ─────────────────────────────────────────────────────────────
   2️⃣  EditPostForm
   ───────────────────────────────────────────────────────────── */
export default function EditPostForm({ post, user, onSuccess }) {
  /* -----------------------------------------------------------
     Always call hooks – even if ‟post” is missing.
     We’ll fall back to empty values instead of early‑returning.
  ----------------------------------------------------------- */
  const safePost = post ?? {};          // never undefined inside hooks

  /* state (hooks always at top, no conditions) */
  const [title,     setTitle]     = useState(safePost.title    ?? '');
  const [content,   setContent]   = useState(safePost.text     ?? '');
  const [category,  setCategory]  = useState(safePost.category ?? 'General');
  const [country,   setCountry]   = useState(safePost.country  ?? '');
  const [loading,   setLoading]   = useState(false);

  /* existing media coming from server */
  const [keepMedia, setKeepMedia] = useState(
    Array.isArray(safePost.media)
      ? safePost.media.map((m) => ({ ...m, keep: true }))
      : []
  );

  /* new uploads */
  const [newFiles,   setNewFiles]   = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  /* -----------------------------------------------------------
     Helper functions
  ----------------------------------------------------------- */
  const addFiles = (files) => setNewFiles((prev) => [...prev, ...files]);

  async function compressVideo(file) {
    const ff = await getFFmpeg();
    const inName  = `in.${file.name.split('.').pop()}`;
    const outName = 'out.mp4';

    await ff.writeFile(inName, await file.arrayBuffer());
    await ff.exec([
      '-i', inName,
      '-vf', 'scale=-2:720',
      '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast',
      '-c:a', 'aac',    '-b:a', '128k',
      outName,
    ]);
    const data = await ff.readFile(outName);
    await ff.deleteFile([inName, outName]);

    return new File([data.buffer], file.name.replace(/\.[^.]+$/, '') + '.mp4', {
      type: 'video/mp4',
    });
  }

  /* -----------------------------------------------------------
     Submit
  ----------------------------------------------------------- */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Not logged in');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('post_id', safePost.id);
      formData.append('title',    title.trim());
      formData.append('content',  content.trim());
      formData.append('category', category);
      formData.append('country',  country);

      /* media to KEEP from server */
      formData.append(
        'keep_media',
        JSON.stringify(keepMedia.filter((m) => m.keep).map((m) => m.url))
      );

      /* new uploads */
      for (const f of newFiles) {
        if (f.type.startsWith('image/')) {
          const img = await imageCompression(f, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          formData.append('media[]', img, img.name);
        } else if (f.type.startsWith('video/')) {
          formData.append('media[]', f);                  // or await compressVideo(f)
        }
      }

      const { data } = await axios.post(
        'http://localhost/coolpage/my-app/backend/update_post.php',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (data.success) {
        alert('Post updated!');
        onSuccess?.();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     Optional guard AFTER hooks – safe because hooks already ran
  ----------------------------------------------------------- */
  if (!post) {
    return <p style={{ padding: 20 }}>Select a post to edit.</p>;
  }

  /* -----------------------------------------------------------
     Render
  ----------------------------------------------------------- */
  return (
    <form onSubmit={handleSave} style={styles.wrapper}>
      <h3>Edit Post</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        style={styles.input}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        required
        style={{ ...styles.input, minHeight: 100 }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={styles.input}
      >
        {['General', 'Really Lesson', 'COOL', 'ReallyAvatar', 'Coursera', 'TechTree']
          .map((c) => (
            <option key={c}>{c}</option>
        ))}
      </select>

      {/* Existing media thumbnails */}
      <div style={{ marginBottom: 12 }}>
        {keepMedia.map((m, i) => (
          <div key={i} style={styles.mediaItem}>
            {m.type === 'image' ? (
              <img src={m.url} alt="" style={styles.thumb} />
            ) : (
              <video src={m.url} style={styles.thumb} />
            )}
            <label style={{ fontSize: 12 }}>
              <input
                type="checkbox"
                checked={m.keep}
                onChange={() =>
                  setKeepMedia((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, keep: !x.keep } : x
                    )
                  )
                }
              />{' '}
              keep
            </label>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <DropZone
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        onFiles={addFiles}
      />

      {/* New uploads preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {newFiles.map((f, idx) => (
          <div key={idx} style={styles.mediaItem}>
            <button
              type="button"
              onClick={() =>
                setNewFiles((prev) => prev.filter((_, i) => i !== idx))
              }
              style={styles.removeBtn}
            >
              ✕
            </button>
            {f.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(f)} alt="" style={styles.thumb} />
            ) : (
              <video src={URL.createObjectURL(f)} style={styles.thumb} />
            )}
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading} style={styles.saveBtn}>
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

/* -----------------------------------------------------------
   Re‑usable drop‑zone component (keeps EditPostForm shorter)
----------------------------------------------------------- */
function DropZone({ isDragging, setIsDragging, onFiles }) {
  return (
    <div
      onClick={() => document.getElementById('editMediaInput').click()}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      style={{
        border: isDragging ? '2px dashed #0077b6' : '2px dashed #ccc',
        padding: 20,
        marginBottom: 12,
        textAlign: 'center',
        background: isDragging ? '#e0f7fa' : '#f9f9f9',
        cursor: 'pointer',
      }}
    >
      Drag & drop media or <strong>click to add</strong>
      <input
        id="editMediaInput"
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => onFiles(Array.from(e.target.files))}
      />
    </div>
  );
}

/* -----------------------------------------------------------
   Inline styles
----------------------------------------------------------- */
const styles = {
  wrapper: {
    maxWidth: 600,
    background: '#fff',
    padding: 20,
    borderRadius: 8,
  },
  input: {
    width: '100%',
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    border: '1px solid #ccc',
    marginBottom: 12,
  },
  mediaItem: { position: 'relative' },
  thumb: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: 6,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: '20px',
  },
  saveBtn: {
    background: '#0091c2',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 5,
    width: '100%',
    fontSize: 16,
    cursor: 'pointer',
  },
};
