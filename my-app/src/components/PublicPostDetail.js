import React, { useEffect, useState,  } from 'react';
import { useParams } from 'react-router-dom';
import LikeButtons from './icon/LikeButton';
import UnLikeButtons from './icon/unlikebutton';
import ShareButton from './icon/shareicome';
import { useNavigate } from 'react-router-dom';
import Loading  from './icon/loading';

import LoginButtons from './icon/loginicon';


const PublicPostDetail = (user) => {
      const navigate = useNavigate();


  const { id } = useParams();
   const [expandedContent, setExpandedContent] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);      // ✅ Add this
  const [error, setError] = useState(null);   
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
const [popupPhoto, setPopupPhoto] = useState(null);
 const [showFullContent, setShowFullContent] = useState({}); 
const [expandedPostId, setExpandedPostId] = useState(null);
  const closePopup = () => setPopupPhoto(null);

  const API_URL= process.env.REACT_APP_API_URL;

    const toggleContent = (postId) => {
    setShowFullContent((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

// Utility to truncate by word
const getShortContent = (text, wordLimit = 100) => {
  const words = text.split(/\s+/);
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(' ') + '...'
    : text;
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



useEffect(() => {
  let isCancelled = false;

  const fetchPost = async () => {
    setPost(null);
    setReplies([]);
    setLikes({});
    setUserLiked({});
    setError(null);
    setLoading(true);

    // ✅ Ensure numeric ID
    const numericId = parseInt(id, 10);
    console.log("Fetching post ID:", numericId);

    if (isNaN(numericId)) {
      setError("Invalid post ID.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Cache-busting query param
      const res = await fetch(
        `${API_URL}/get_publicpost.php?post_id=${numericId}`
      );
      const data = await res.json();

      if (!isCancelled) {
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPost(data.posts[0]);
          setLikes(data.total_likes || {});
          setUserLiked(data.user_liked || {});
          if (Array.isArray(data.posts[0].replies)) {
            setReplies(data.posts[0].replies);
          }
        } else {
          setError("Post not found.");
        }
      }
    } catch (err) {
      if (!isCancelled) {
        setError("Error fetching post.");
      }
    } finally {
      if (!isCancelled) {
        setLoading(false);
      }
    }
  };

  fetchPost();

  return () => {
    isCancelled = true;
  };
}, [id]);



 useEffect(() => {
  if (!post?.id) return;

  const fetchLikes = async () => {
    try {
      const userId = user?.id || 0; // fallback to 0 if user not logged in
      const res = await fetch(`${API_URL}/get_likes.php?user_id=${userId}`);
      const data = await res.json();

      if (data.success) {
        setLikes(data.total_likes || {});
        setUserLiked(data.user_liked || {});
      } else {
        console.warn('Failed to load like data');
      }
    } catch (err) {
      console.error('Error fetching likes:', err.message);
    }
  };

  fetchLikes();
}, [user?.id, post?.id]);






if (loading) return <p><Loading /></p>;
if (error) return <p>{error}</p>;
if (!post) return null;

const handleShare = (id) => {
    console.log("Sharing post ID:", id);
  const shareUrl = `${window.location.origin}/home/public/${id}`;

  if (navigator.share) {
    navigator
      .share({
        title: 'Check out this post!',
        url: shareUrl,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((err) => console.error('Error sharing', err));
  } else {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  }
};


const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
const isVideo = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);


 const handleLike = async (targetId, type = 'post') => {
  const key = `${type}_${targetId}`;
  const liked = userLiked[key]; // is it already liked?
  const url = liked ? 'unlike.php' : 'like.php';

  try {
    const res = await fetch(`${API_URL}/${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        user_id: user.id,
        target_id: targetId,
        target_type: type,
      }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Update like count
      setLikes((prev) => ({
        ...prev,
        [key]: liked ? Math.max(0, (prev[key] || 1) - 1) : (prev[key] || 0) + 1,
      }));

      // ✅ Toggle userLiked state
      setUserLiked((prev) => ({
        ...prev,
        [key]: !liked,
      }));
    } else {
      // ✅ Silently ignore 'Already liked'
      if (!liked && data.message !== 'Already liked') {
        alert(data.message || 'Like failed');
      }
    }
  } catch (err) {
    console.error('Like/unlike request failed:', err.message);
    alert('Please log in first to like this post.');
  }
};

const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
  );
};




  return (
    <div style={{ background: '#f5f7fa', padding: '40px 20px', minHeight: '100vh' }}>
      <div
        style={{
          background: '#fff',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        }}
      >
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            fontWeight: 'bold',
            marginBottom: '24px',
            cursor: 'pointer',
          }}
        >
        <LoginButtons />Please log in to join the discussion.
        </button>

        <h1 style={{ fontSize: '1.75rem', color: '#222' }}>{post.title}</h1>

        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // spacing between profile and name
    fontSize: '0.95rem',
    color: '#777',
    margin: '10px 0 20px',
  }}
>
  {/* Profile Picture */}
  <img
    src={post.profile_picture || '/default-avatar.png'}
    alt="avatar"
    style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
    }}
  />

  {/* Username + metadata */}
  <div>
    <strong style={{ color: '#222' }}>{post.username}</strong><br />
    <span style={{ fontSize: '12px', color: '#666' }}>
      {post.category} · {new Date(post.created_at).toLocaleString()}
    </span>
  </div>
</div>

  <div style={{ marginBottom: '20px' }}>
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
     
     {post.content.split(" ").length > 50 && (
       <button
         onClick={() =>
           setExpandedContent((prev) => ({
             ...prev,
             [post.id]: expandedContent[post.id] ? null : post.content,
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
         {expandedContent[post.id] ? "See less" : "See more"}
        </button>
      )}
    </div>
       
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

      <hr style={{
  border: 'none',
  borderTop: '2px solid #ddd',
  margin: '5px 0'
}} />
  <div style={{
  display: 'flex',
 
  gap: '12px',
    
}}>

  {/* Like Button */}
  <button
    onClick={() => handleLike(post.id, 'post')}
    style={{
      background: 'transparent',
      color: userLiked[`post_${post.id}`] ? '#0284c7' : '#374151',
      border: 'none',
      fontWeight: '500',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
    }}
  >
    {userLiked[`post_${post.id}`] ? <LikeButtons /> : <UnLikeButtons />}
    {likes[`post_${post.id}`] || 0}
  </button>

  {/* Share Button */}
  <button
    onClick={() => handleShare(post.id)}
    style={{
      fontSize: '14px',
      color: '#28a745',
      fontWeight: 'bold',
      background: 'transparent',
      border: 'none',
      padding: '4px 10px',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
 
    }}
  >
    <ShareButton />

  </button>

</div>
     <hr style={{
  border: 'none',
  borderTop: '2px solid #ddd',
  margin: '5px 0'
}} />    
<div style={{ marginTop: '40px' }}>
  <h3>Replies</h3>

  {/* Textarea */}

  {/* Replies List */}
  <div style={{ marginTop: '20px' }}>
    {replies.length === 0 && (
      <div style={{ color: '#888' }}>No replies yet.</div>
    )}

   {replies.slice(0, visibleCount).map((reply) => (
      <div key={reply.id} style={{ marginTop: '15px' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <img
    src={reply.profile_picture || '/default-avatar.png'}
    alt="avatar"
    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
  />

  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <strong style={{ fontSize: '14px' }}>{reply.username}</strong>
    <span style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
      {formatTimeAgo(reply.created_at)} · {reply.category || 'General'} · {reply.location || 'Philippines'}
    </span>
  </div>
</div>

<p
  style={{
    fontSize: "15px",
    color: "#374151",
    marginBottom: "8px",
    whiteSpace: "pre-wrap",
  }}
  dangerouslySetInnerHTML={{
    __html: expandedContent[reply.id] || reply.text.split(" ").length <= 50
      ? createLinkifiedText(String(reply.text))
      : createLinkifiedText(
          String(reply.text).split(" ").slice(0, 50).join(" ") + "..."
        ),
  }}
></p>

{reply.text.split(" ").length > 50 && (
  <button
    onClick={() =>
      setExpandedContent((prev) => ({
        ...prev,
        [reply.id]: prev[reply.id] ? null : reply.text,
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


        {/* Show media */}
        {Array.isArray(reply.media) &&
          reply.media.map((item, idx) =>
            item.url.endsWith('.mp4') || item.url.includes('video')
              ? (
                <video
                  key={idx}
                  controls
                  style={{ width: '100%', maxWidth: '300px', marginBottom: '10px' }}
                >
                  <source src={item.url} type="video/mp4" />
                </video>
              )
              : (
                <img
                  key={idx}
                  src={item.url}
                  alt="media"
                  style={{ width: '100%', maxWidth: '300px', marginBottom: '10px', borderRadius: '6px' }}
                />
              )
          )}

        {/* Like button */}
        <button
          onClick={() => handleLike(reply.id, 'reply')}
          style={{
            marginTop: '15px',
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
            gap: '4px',
          }}
        >
          <span>{userLiked[`reply_${reply.id}`] ? <LikeButtons /> : <UnLikeButtons />}</span>
          <span style={{ color: '#666' }}>{likes[`reply_${reply.id}`] || 0}</span>
        </button>


        <hr style={{
  border: 'none',
  borderTop: '1px solid #ccc',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  margin: '25px 0'
}} />

      </div>
    ))}
  </div>
</div>

{replies.length > visibleCount && (
  <button
    onClick={() => setVisibleCount(prev => prev + 5)}
    style={{
  marginTop: '15px',
  backgroundColor: '#ffffffff',
  border: 'none', // ✅ removed border
  borderRadius: '6px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#007bff'
}}
  >
    Show more replies
  </button>
)}



        
      </div>
    </div>
  );
}
;
export default PublicPostDetail;
