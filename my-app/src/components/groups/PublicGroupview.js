import React, { useState, useEffect, useRef } from 'react';
import GroupPostForm from './GroupPostForm';
import { useParams } from 'react-router-dom';
import GroupPostCard from './GroupPostcard';
import LikeButtons from '../icon/LikeButton'
import UnLikeButtons from '../icon/unlikebutton';
import Replybutton from '../icon/replybutton';
import InviteUser from './InviteUser';
import Slider from 'react-slick';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Modal from 'react-modal';

const ReplyForm = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [files, setFiles, ] = useState([]);
  const fileInputRef = useRef();
  const API_URL= process.env.REACT_APP_API_URL;

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
    if (!text.trim()) return;
    onSubmit(text, files);
    setText('');
    setFiles([]);
    e.target.reset();
  };


  return (
    <form onSubmit={submit} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        style={{
          padding: 10,
          borderRadius: 5,
          border: '1px solid #ccc',
        }}
      />

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #aaa',
          padding: 20,
          textAlign: 'center',
          borderRadius: 10,
          cursor: 'pointer',
          backgroundColor: '#f9f9f9',
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
          style={{ display: 'none' }}
        />
      </div>

      {/* File list preview */}
      {files.length > 0 && (
        <div style={{ fontSize: 14 }}>
          <strong>Selected files:</strong>
          <ul style={{ paddingLeft: 20 }}>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        Submit Reply
      </button>
    </form>
  );
};
const GroupPosts = ({ user }) => {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
const [repliesByPostId, setRepliesByPostId] = useState({});
const [visibleReplyForms, setVisibleReplyForms] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [likes, setLikes] = useState({});
 const [userLiked, setUserLiked] = useState({});
  const [showReplies, setShowReplies] = useState({});

   const [popupImage, setPopupImage] = useState(null);

  const openImagePopup = (url) => setPopupImage(url);
  const closePopup = () => setPopupImage(null);
    const API_URL= process.env.REACT_APP_API_URL;
  const fetchReplies = async (postId) => {
    const res = await fetch(`${API_URL}/get_group_post_replies.php?post_id=${postId}`);
    const data = await res.json();
    return data.success ? data.replies : [];
  };
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

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  prevArrow: <Arrow direction="left" />,
  nextArrow: <Arrow direction="right" />,
};
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
useEffect(() => {
  if (groupId) {
    fetchPosts();
  }
}, [groupId]);  // <-- remove user here for public view

const fetchPosts = async () => {
  try {
    const res = await fetch(
      `${API_URL}/get_group_posts.php?group_id=${groupId}`
    );
    const data = await res.json();

    if (data.success) {
      setPosts(data.posts); // data.posts should be an array of all posts in the group

      const likeCounts = {};
      const likedStatus = {};
      const repliesMap = {};

      for (const post of data.posts) {
        const postKey = `post_${post.id}`;
        likeCounts[postKey] = post.like_count || 0;
        likedStatus[postKey] = false; // set false for public (no user login)

        const replies = post.replies || [];
        repliesMap[post.id] = replies;

        for (const reply of replies) {
          const replyKey = `reply_${reply.id}`;
          likeCounts[replyKey] = reply.like_count || 0;
          likedStatus[replyKey] = false; // public no user
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
const formatTimeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
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


  return (
<div className="post-list" style={{ maxWidth: '800px', margin: 'auto', padding: '20px 10px 100px 5px' }}>

  <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-start', maxWidth: 'auto' }}>

  {user && groupId ? (
    <GroupPostForm user={user} groupId={groupId} onRefresh={fetchPosts} />
  ) : (
    <p style={{ color: 'red' }}></p>
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
                       {formatTimeAgo(post.created_at)} · {post.category} · {post.country}
                     </div>
                   </div>
                 </div>
            </div>

        {/* 🔹Content */}
            <p style={{ fontSize: '15px', color: '#374151', marginBottom: '8px' }}>
        {expandedContent[post.id] || post.content.split(' ').length <= 50
          ?  String(post.content)
          :  String(post.content).split(' ').slice(0, 50).join(' ') + '...'}
      </p>
      
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
 {post.media?.length > 0 && (
        <div
          style={{
            maxWidth: 500,
            width: '100%',
            height: '300px',
            margin: '10px auto',
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <Slider {...sliderSettings}>
            {(() => {
              const uniqueMedia = [...new Map(post.media.map(m => [m.url, m])).values()];
              return uniqueMedia.map((media, i) => {
                const url = media?.url;
                const isImage = media?.type?.startsWith('image') || url?.match(/\.(jpg|jpeg|png|gif)$/i);
                if (!url) return null;

                return (
                  <div
                    key={i}
                    style={{
                      width: '100%',
                      height: '300px',
                      position: 'relative',
                    }}
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt={`Post media ${i + 1}`}
                        onClick={() => openImagePopup(url)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          cursor: 'pointer',
                        }}
                      />
                    ) : (
                      <video
                        controls
                        src={url}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    )}
                  </div>
                );
              });
            })()}
          </Slider>
        </div>
      )}

      {/* Modal Popup for Image */}
      {popupImage && (
        <Modal
          isOpen={!!popupImage}
          onRequestClose={closePopup}
          contentLabel="Image Preview"
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
            },
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'hidden',
            },
          }}
        >
          <img
            src={popupImage}
            alt="Full View"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 8,
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
            onClick={closePopup}
          />
        </Modal>
      )}
    
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
  <div style={{ marginTop: 15 }}>
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
        <strong>{reply.username}</strong>
      </div>

      {/* Reply Content */}
      <p style={{ marginTop: 5 }}>{reply.content}</p>

      {/* Reply Media */}
      {Array.isArray(reply.media) && reply.media.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 5 }}>
          {reply.media.map((mediaItem, index) => {
            const mediaUrl =
              mediaItem.url ||
              `${API_URL}/${mediaItem.media_url?.replace(
                /^\/+/,
                ''
              )}`;
            const isImage =
              mediaItem.media_type?.startsWith('image') ||
              mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i);

            return isImage ? (
              <img
                key={index}
                src={mediaUrl}
                alt="reply media"
                style={{ width: 150, borderRadius: 8 }}
              />
            ) : (
              <video
                key={index}
                controls
                src={mediaUrl}
                style={{ width: 200, borderRadius: 8 }}
              />
            );
          })}
        </div>
      )}

      {/* Like Button for Reply */}
      <button
        onClick={() => handleLike(reply.id, post.group_id, 'reply')}
        style={{
          background: 'transparent',
          color: userLiked[`reply_${reply.id}`] ? '#0284c7' : '#374151',
          border: 'none',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '4px 8px',
          marginTop: 8,
        }}
      >
        {userLiked[`reply_${reply.id}`] ? <LikeButtons /> : <UnLikeButtons />}
        {likes[`reply_${reply.id}`] || 0}
      </button>
    </div>
  ))}


         
          </div>       </div>
        ))
      )}
    </div>
  );
};

export default GroupPosts;
