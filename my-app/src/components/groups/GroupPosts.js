import React, { useState, useEffect, useRef } from 'react';
import GroupPostForm from './GroupPostForm';
import { useParams } from 'react-router-dom';
import GroupPostCard from './GroupPostcard';
import LikeButtons from '../icon/LikeButton'
import UnLikeButtons from '../icon/unlikebutton';
import Replybutton from '../icon/replybutton';
import InviteUser from './InviteUser';
import DeleteButtons from '../icon/deleteicon';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from 'react-modal';

const ReplyForm = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    onSubmit(text, files);
    setText("");
    setFiles([]);
    e.target.reset();
  };

  return (
    <form
      onSubmit={submit}
      style={{
        marginTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Write a reply..."
  style={{
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    width: '100%', // Optional: add width for better display
    minHeight: '80px', // Optional: set a minimum height
    resize: 'vertical', // Optional: allow user to resize vertically
  }}
/>

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: "2px dashed #aaa",
          padding: 20,
          textAlign: "center",
          borderRadius: 10,
          cursor: "pointer",
          backgroundColor: "#f9f9f9",
        }}
      >
        Drag & drop media files here, or click to select
        <input
          type="file"
          name="media[]"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>

      {/* File preview */}
      {files.length > 0 && (
        <div style={{ fontSize: 14 }}>
          <strong>Selected files:</strong>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            {files.map((file, index) => {
              const isImage = file.type.startsWith("image/");
              const isVideo = file.type.startsWith("video/");

              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "6px",
                    width: "100px",
                    height: "100px",
                    textAlign: "center",
                  }}
                >
                  {isImage && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}

                  {isVideo && (
                    <video
                      src={URL.createObjectURL(file)}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                      controls
                    />
                  )}

                  {!isImage && !isVideo && (
                    <div style={{ fontSize: "12px", padding: "20px 0" }}>
                      📄 {file.name}
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Submit Reply
      </button>
    </form>
  );
};

const GroupPosts = ({ user, onRefresh }) => {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
const [visibleReplyForms, setVisibleReplyForms] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [likes, setLikes] = useState({});
 const [userLiked, setUserLiked] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [loadingReply, setLoadingReply] = useState(false);
const [popupPhoto, setPopupPhoto] = useState(null);
  const [showFullContent, setShowFullContent] = useState(false);
const [expandedPostId, setExpandedPostId] = useState(null);
  const closePopup = () => setPopupPhoto(null);
const toggleContent = () => setShowFullContent(prev => !prev);
   const [popupImage, setPopupImage] = useState(null);
const [repliesByPostId, setRepliesByPostId] = useState({});

  const openImagePopup = (url) => setPopupImage(url);


  const [showDropdown, setShowDropdown] = useState({});
  
   const API_URL= process.env.REACT_APP_API_URL;

const Arrow = ({ onClick, direction }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      [direction]: 10,
      transform: 'translateY(-50%)',
      zIndex: 2,
      backgroundColor: '#fff',
      borderRadius: '50%',
      padding: 8,
      boxShadow: '0 0 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
    }}
  >
    {direction === 'left' ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
  </div>
);


  const toggleReplies = (postId) => {
  setShowReplies((prev) => ({
    ...prev,
    [postId]: !prev[postId],
  }));
};
  const toggleReplyForm = (postId) => {
  setVisibleReplyForms((prev) => ({
    ...prev,
    [postId]: !prev[postId],
  }));
};
  // ✅ Main fetchPosts function (now exists!)
 const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_URL}/get_group_posts.php?group_id=${groupId}&user_id=${user.id}`);
    const data = await res.json();

    if (data.success) {
      setPosts(data.posts);

      const likeCounts = {};
      const likedStatus = {};
      const repliesMap = {};

      for (const post of data.posts) {
        const postKey = `post_${post.id}`;
        likeCounts[postKey] = post.like_count || 0;
        likedStatus[postKey] = post.user_liked || false;

        // Replies (if they are already included in the response)
        const replies = post.replies || [];
        repliesMap[post.id] = replies;

        for (const reply of replies) {
          const replyKey = `reply_${reply.id}`;
          likeCounts[replyKey] = reply.like_count || 0;
          likedStatus[replyKey] = reply.user_liked || false;
        }
      }

      setLikes(likeCounts);
      setUserLiked(likedStatus);
      setRepliesByPostId(repliesMap);
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
  }
};

useEffect(() => {
  if (groupId && user?.id) {
    fetchPosts();
  }
}, [groupId, user]);


const handleDeleteReply = async (replyId, groupId) => {
  if (window.confirm("Are you sure you want to delete this reply?")) {
    try {
      const formData = new FormData();
      formData.append('reply_id', replyId);
      // New line to send the group_id to the backend
      formData.append('group_id', groupId);

      const response = await fetch(`${API_URL}/delete_reply_group.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message); fetchPosts(); // ✅ now this works!
        onRefresh();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Failed to delete reply:", error);
   
    }
  }
};

  // ✅ Handle reply
  const handleReply = async (postId, replyContent, files) => {
    if (!user) return alert("Login required to reply.");

    try {
      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("group_id", groupId);
      formData.append("user_id", user.id);
      formData.append("content", replyContent);
      formData.append("username", user.username);
      formData.append("country", user.country);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("media[]", file);
        });
      }

      const res = await fetch(`${API_URL}/group_post_reply.php`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) fetchPosts(); // ✅ now this works!
      else alert(data.message || "Reply failed.");
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };



const formatDate = (timestamp) => {
  const targetTimeZone = "Asia/Manila";
  const date = new Date(timestamp); // let JS parse it

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: targetTimeZone
  }).format(date);
};



const handleLike = async (id, groupId, type = 'post') => {
  const key = `${type}_${id}`;
  const liked = userLiked[key];
  const url = liked ? 'unlike_group_post.php' : 'like_group_post.php';

  try {
    const res = await fetch(`${API_URL}/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        user_id: user.id,
        target_id: id,
        group_id: groupId,
        target_type: type
      })
    });

    const data = await res.json();
    if (data.success) {
      setLikes(prev => ({
        ...prev,
        [key]: liked ? Math.max(0, (prev[key] || 1) - 1) : (prev[key] || 0) + 1
      }));
      setUserLiked(prev => ({
        ...prev,
        [key]: !liked
      }));
    } else {
      console.warn(data.message);
    }
  } catch (err) {
    console.error('Like/unlike request failed:', err.message);
  }
};
const handleDelete = async (postId) => {
  if (!postId || isNaN(postId)) {
    alert("❌ Invalid post ID.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const formData = new FormData();
    formData.append('post_id', postId);

    const response = await fetch(`${API_URL}/delete_groupPost.php`, {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      console.error("❌ Response is not valid JSON. Raw response:");
      console.error(text); // likely HTML error
      alert("❌ Server returned an invalid response. Check console for details.");
      return;
    }

    if (result.success) {

      
     alert("Post deleted successfully!");
      fetchPosts(); // ✅ refresh posts after deletion
    } else {
      alert("❌ Delete failed: " + (result.message || "Unknown error."));
    }
  } catch (err) {
    console.error("❌ Error while deleting post:", err);
    alert("❌ A network error occurred. See console for details.");
  }
};

  const isImage = (filePath) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
  const isVideo = (filePath) => /\.(mp4|webm|ogg)$/i.test(filePath);

const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
  );
};


  return (
<div className="post-list" style={{ maxWidth: '800px', margin: 'auto', padding: '20px 10px 100px 5px' }}>

  <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-start', maxWidth: 'auto' }}>

  {user && groupId ? (
    <GroupPostForm user={user} groupId={groupId} onRefresh={fetchPosts} />
  ) : (
    <p style={{ color: 'red' }}>Please log in and select a group to post.</p>
  )}
</div>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
         <div
        key={post.id}
        className="post-card"
        style={{
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '20px 20px 20px rgba(5, 4, 4, 0.05)',
          border: '1px solid #eaeaea',
          transition: 'all 0.3s ease'
        }}
      >

      <div style={{ position: 'relative' }}>
      
      
     {user && (Number(user.id) === Number(post.user_id) || user.role === "admin") && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setShowDropdown((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#555',
                padding: '6px',
              }}
            >
              ⋮
            </button>
      
            {showDropdown?.[post.id] && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '30px',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  minWidth: '120px',
                  zIndex: 1001,
                }}
              >
      
               
                <button
                  onClick={() => {
                    handleDelete(post.id);
                    setShowDropdown((prev) => ({ ...prev, [post.id]: false }));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onMouseOver={(e) => (e.target.style.background = '#fef2f2')}
                  onMouseOut={(e) => (e.target.style.background = 'none')}
                >
                Delete
                </button>
                
                
                
              </div>
            )}
          </div>
        </div>
      )}
      
            {/* Header */}
            <div>
       <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#102a43',
        marginBottom: '16px'
      }}>
  
              {post.title}

              
     
      </h2>
              <div style={{ fontSize: 12, color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <img
  src={post.profile_picture || `${API_URL}/uploads/default-avatar.png`}
  alt="avatar"
  style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '12px',
  }}
  onError={(e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = `${API_URL}/uploads/default-avatar.png`;
  }}
/>
                   <div>
                     <div style={{ fontWeight: 600 }}>{post.username} {post.lastname}</div>
                     <div style={{ fontSize: '12px', color: '#6b7280' }}>
                       {formatDate(post.created_at)} · {post.category} · {post.country}
                     </div>
                   </div>
                 </div>
            </div>

        {/* 🔹Content */}
          <p
          style={{
            fontSize: "15px",
            color: "#374151",
            marginBottom: "8px",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{
            __html:
              expandedContent[post.id] || post.content.split(" ").length <= 50
                ? createLinkifiedText(String(post.content))
                : createLinkifiedText(
                    String(post.content).split(" ").slice(0, 50).join(" ") + "..."
                  ),
          }}
        ></p>
      
      {post.content.split(' ').length > 50 && (
        <button
          onClick={() =>
            setExpandedContent((prev) => ({
              ...prev,
              [post.id]: expandedContent[post.id] ? null : post.content
            }))
          }
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '14px',
            padding: 0
          }}
        >
          {expandedContent[post.id] ? 'See less' : 'See more'}
        </button>
      )}
  <>
<div>
      {/* Single media */}
      {Array.isArray(post.media) && post.media.length === 1 && (
        <div
          style={{
            borderRadius: '10px',
            overflow: 'hidden',
            marginTop: '12px',
            height: '500px',
            maxwidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
            position: 'relative',
            cursor: isImage(post.media[0].url) ? 'pointer' : 'default',
          }}
          onClick={() => isImage(post.media[0].url) && setPopupPhoto(post.media[0].url)}
        >
          {isImage(post.media[0].url) ? (
            <>
              <img
                src={post.media[0].url}
                alt="media"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              <div
                className="hover-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  pointerEvents: 'none',
                }}
              >
                View Photo
              </div>
            </>
          ) : isVideo(post.media[0].url) ? (
            <video controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}>
              <source src={post.media[0].url} type={`video/${post.media[0].url.split('.').pop()}`} />
            </video>
          ) : null}
          <style>
            {`
              div:hover > .hover-overlay {
                opacity: 1;
                pointer-events: auto;
              }
            `}
          </style>
          {popupPhoto && (
  <div
    onClick={() => setPopupPhoto(null)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      cursor: 'pointer',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ position: 'relative', cursor: 'default' }}
    >
      <img
        src={popupPhoto}
        alt="popup"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          display: 'block',
        }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPopupPhoto(null);
        }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '8px 12px',
          fontSize: '24px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '0 10px 0 10px',
          userSelect: 'none',
          zIndex: 1001,
        }}
      >
       ❌
      </button>
    </div>
  </div>
)}


        </div>
      )}

       {/* double media */}
     {Array.isArray(post.media) && post.media.length === 2 && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',   // ⇦ two equal columns
      height: 400,                      // ⇦ total height (change to 500, 600…)
      gap: 12,
      marginTop: 12,
      width: '100%',
    }}
  >
    {post.media.map((file, idx) => {
      const isImg = isImage(file.url);
      const isVid = isVideo(file.url);

      return (
        <div
          key={idx}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#f9f9f9',
            cursor: isImg ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => isImg && setPopupPhoto(file.url)}
        >
          {isImg ? (
            <>
              <img
                src={file.url}
                alt={`media-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',    // fill the box
                }}
              />
              <div className="hover" />
            </>
          ) : isVid ? (
            <video
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src={file.url} type={`video/${file.url.split('.').pop()}`} />
            </video>
          ) : null}
        </div>
      );
    })}

    {/* hover effect */}
    <style>{`
      .hover {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.35);
        color: #fff;
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity .25s;
        border-radius: 10px;
        pointer-events: none;
      }
      div:hover > .hover {
        opacity: 1;
        pointer-events: auto;
      }
    `}</style>

    {popupPhoto && (
      <div
        onClick={() => setPopupPhoto(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer',
        }}
      >
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
          <img
            src={popupPhoto}
            alt="popup"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 10,
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          />
          <button
            onClick={() => setPopupPhoto(null)}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ❌
          </button>
        </div>
      </div>
    )}
  </div>
)}


{Array.isArray(post.media) && post.media.length === 3 && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gridTemplateAreas: `
        "leftTop  right"
        "leftBot  right"
      `,
      gap: 12,
      marginTop: 12,
      width: '100%',
      height: '600px', // Change to 500px, etc. if needed
    }}
  >
    {post.media.map((file, idx) => {
      const isImg = isImage(file.url);
      const isVid = isVideo(file.url);

      const area =
        idx === 0 ? 'leftTop' :
        idx === 1 ? 'leftBot' : 'right';

      return (
        <div
          key={idx}
          style={{
            gridArea: area,
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#eee',
            cursor: isImg ? 'pointer' : 'default',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => isImg && setPopupPhoto(file.url)}
        >
          {isImg ? (
            <>
              <img
                src={file.url}
                alt={`media-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div className="hover" />
            </>
          ) : isVid ? (
            <video
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src={file.url} type={`video/${file.url.split('.').pop()}`} />
            </video>
          ) : null}
        </div>
      );
    })}

    {/* Hover effect */}
    <style>{`
      .hover {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.35);
        color: #fff;
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity .25s;
        border-radius: 10px;
        pointer-events: none;
      }
      div:hover > .hover {
        opacity: 1;
        pointer-events: auto;
      }
    `}</style>

    {/* Popup viewer */}
    {popupPhoto && (
      <div
        onClick={() => setPopupPhoto(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'relative' }}
        >
          <img
            src={popupPhoto}
            alt="popup"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 10,
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPopupPhoto(null);
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ❌
          </button>
        </div>
      </div>
    )}
  </div>
)}





      {/* Multiple media */}
      {Array.isArray(post.media) && post.media.length > 3 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {(expandedPostId === post.id ? post.media : post.media.slice(0, 4)).map((mediaItem, idx) => {
            const isLast = idx === 3 && post.media.length > 4 && expandedPostId !== post.id;
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: isImage(mediaItem.url) ? 'pointer' : 'default',
                }}
                onClick={() => isImage(mediaItem.url) && setPopupPhoto(mediaItem.url)}
              >
                {isImage(mediaItem.url) ? (
                  <>
                    <img
                      src={mediaItem.url}
                      alt="media"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <div
                      className="hover-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        pointerEvents: 'none',
                      }}
                    >
                      View Photo
                    </div>
                  </>
                ) : isVideo(mediaItem.url) ? (
                  <video controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}>
                    <source src={mediaItem.url} type={`video/${mediaItem.url.split('.').pop()}`} />
                  </video>
                ) : null}

                {isLast && (
                  <div
                    onClick={() => setExpandedPostId(post.id)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      fontSize: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: '10px',
                    }}
                  >
                    +{post.media.length - 4}
                  </div>
                )}
                <style>
                  {`
                    div:hover > .hover-overlay {
                      opacity: 1;
                      pointer-events: auto;
                    }
                  `}
                </style>
              </div>
            );
          })}
        </div>
      )}

      {/* Show less */}
      {post.media && (
  <>
    {/* Display only 4 media items initially */}
    

    {/* Show the "See more" or "Show less" button if there are more than 4 media items */}
    {post.media.length > 4 && (
      <button
        onClick={() => setExpandedPostId(prev => (prev === post.id ? null : post.id))}
        style={{
          marginTop: '10px',
          background: 'none',
          border: 'none',
          color: '#0077cc',
          fontSize: '14px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {expandedPostId === post.id ? 'Show less' : 'See more photos'}
      </button>
    )}
  </>
)}

      {/* Popup */}
      {popupPhoto && (
        <div
          onClick={closePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <img
            src={popupPhoto}
            alt="popup"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
    </>
 {/* Like and Share */}

            
     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 15 }}>
  {/* Reply Button */}
  <button
    onClick={() => toggleReplyForm(post.id)}
    style={{
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      padding: 0,
      margin: 0,
    }}
  >
    <Replybutton />
  </button>

  {/* Like Button */}
  <button
    onClick={() => handleLike(post.id, post.group_id)}
    style={{
      background: 'transparent',
      color: userLiked[`post_${post.id}`] ? '#0284c7' : '#374151',
      border: 'none',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      padding: '4px 8px',
    }}
  >
    {userLiked[`post_${post.id}`] ? <LikeButtons /> : <UnLikeButtons />}
    {likes[`post_${post.id}`] || 0}
  </button>
</div>

{/* Reply Form */}
{visibleReplyForms[post.id] && (
  <div style={{ margin:30 }}>
    <ReplyForm onSubmit={(text, file) => handleReply(post.id, text, file)} />
  </div>
)}

{/* View/Hide Replies */}
{post.replies && post.replies.length > 0 && (
  <div style={{ marginTop: 10 }}>
    <button
      onClick={() => toggleReplies(post.id)}
      style={{
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        padding: 0,
        fontSize: 14,
      }}
    >
      {showReplies[post.id]
        ? 'Hide Replies'
        : `View Replies (${post.replies.length})`}
    </button>
  </div>
)}


{/* Replies List */}
{showReplies[post.id] &&
  post.replies.map((reply) => (
    <div
      key={reply.id}
      style={{
        marginTop: 10,
        paddingLeft: 10,
        borderLeft: '3px solid #eee',
        marginBottom: 16,
      }}
    >
      {/* Reply Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
        <img
          src={reply.profile_picture}
          alt="avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: 8,
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              `${API_URL}/uploads/default-avatar.png`;
          }}
        />
       <div>
  <div style={{ fontSize: "0.8rem", color: "gray" }}>    

<strong>{reply.username}</strong>
  </div>
   {formatDate(reply.created_at)} 
</div>

        
      </div>

      {/* Reply Content */}

<p
  style={{
    fontSize: "15px",
    color: "#374151",
    marginBottom: "8px",
    whiteSpace: "pre-wrap",
  }}
  dangerouslySetInnerHTML={{
    __html:
      expandedContent[reply.id] || reply.content.split(" ").length <= 50
        ? createLinkifiedText(String(reply.content))
        : createLinkifiedText(
            String(reply.content).split(" ").slice(0, 50).join(" ") + "..."
          ),
  }}
></p>

{reply.content.split(" ").length > 50 && (
  <button
    onClick={() =>
      setExpandedContent((prev) => ({
        ...prev,
        [reply.id]: prev[reply.id] ? false : true, // store as boolean
      }))
    }
    style={{
      background: "none",
      border: "none",
      color: "#2563eb",
      cursor: "pointer",
      fontSize: "14px",
      padding: 0,
    }}
  >
    {expandedContent[reply.id] ? "See less" : "See more"}
  </button>
)}



      {/* Reply Media */}
      {Array.isArray(reply.media) && reply.media.length > 0 && (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 5 }}>
    {reply.media.map((mediaItem, index) => {
      const mediaUrl =
        mediaItem.url ||
        `${API_URL}/${mediaItem.media_url?.replace(/^\/+/, '')}`;

      const isImage =
        mediaItem.media_type?.startsWith('image') ||
        /\.(jpg|jpeg|png|gif)$/i.test(mediaUrl);

      const isVideo =
        mediaItem.media_type?.startsWith('video') ||
        /\.(mp4|webm|ogg)$/i.test(mediaUrl);

      if (isImage) {
        return (
          <img
            key={index}
            src={mediaUrl}
            alt="reply media"
            style={{ width: 600, borderRadius: 8 }}
          />
        );
      } else if (isVideo) {
        return (
          <video
            key={index}
            controls
            style={{ width: 600, borderRadius: 8 }}
          >
            <source src={mediaUrl} type={mediaItem.media_type || "video/mp4"} />
            Your browser does not support the video tag.
          </video>
        );
      }

      return null; // Ignore unsupported formats
    })}
  </div>
)}


      {/* Like Button for Reply */}
     <div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1px'
}}>
  {/* Like button */}
  <button      onClick={() => handleLike(reply.id, post.group_id, 'reply')}

    style={{
      fontSize: '13px',
      color: userLiked[`reply_${reply.id}`] ? '#0077b6' : '#555',
      fontWeight: 'bold',
      background: 'transparent',
      border: 'none',
      padding: '4px 10px',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}
  >
    <span style={{ fontSize: '15px' }}></span>
    <span>
      {userLiked[`reply_${reply.id}`] ? <LikeButtons /> : <UnLikeButtons />}
    </span>
    <span style={{ color: '#666' }}>
      {likes[`reply_${reply.id}`] || 0}
    </span>
  </button>

  {/* Delete button (conditionally rendered) */}
  {
    (user && (Number(user.id) === Number(reply.user_id) || user.role === 'admin')) && (
      <button
        onClick={() => handleDeleteReply(reply.id, post.group_id)}
        style={{
          fontSize: '13px',
          color: '#d9534f',
          fontWeight: 'bold',
          background: 'transparent',
          border: 'none',
          padding: '4px 10px',
          borderRadius: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <DeleteButtons/>
      </button>
    )
  }
</div>
    </div>
  ))}

      </div>
         
          </div>       </div>
        ))
      )}
    </div>
  );
};

export default GroupPosts;
