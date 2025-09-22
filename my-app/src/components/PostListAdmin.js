import React, { useState, useEffect, useRef} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PostForm from './PostForm';
import Editpost from './editform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import LikeButtons from './icon/LikeButton';
import ReplyButton from './icon/replybutton';
import UnLikeButtons from './icon/unlikebutton';
import DeleteButtons from './icon/deleteicon';
import ShareButton from './icon/shareicome';
import { Link } from 'react-router-dom';



const PostList = ({ posts, onReply, user, onRefresh, }) => {
  const [replyContents, setReplyContents] = useState({});
  const [mediaFiles, setMediaFiles] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [likes, setLikes] = useState({});
  const [userLiked, setUserLiked] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const scrollRef = useRef(null);
  const postsPerPage = 15;
  const [expandedContent, setExpandedContent] = useState({});
  const [visibleReplies, setVisibleReplies] = useState({});
  const [popupPhoto, setPopupPhoto] = useState(null);
  const closePopup = () => setPopupPhoto(null);
  const [isDragging, setIsDragging] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
const [showDropdown, setShowDropdown] = useState({});
const [searchTerm, setSearchTerm] = useState('');

const [reloadTime, setReloadTime] = useState(null);
const [replies, setReplies] = useState({});
const [showAllImages, setShowAllImages] = useState({}); // key by reply.id
const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const API_URL= process.env.REACT_APP_API_URL;
const [sortType, setSortType] = useState('latest');


const ReplyText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  const words = text.split(' ');
  const isLong = words.length > 50;
  const visibleText = isLong && !expanded ? words.slice(0, 50).join(' ') + '...' : text;

  return (
    <div>
      <p style={{ marginBottom: '4px' }}>{visibleText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            padding: 0,
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
};


useEffect(() => {
  // fetchReplies or fetchPost again here
}, [reloadTime]);

  useEffect(() => {
    if (!posts?.id) return;
  
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
  }, [API_URL,user?.id, posts?.id]);
  

// Handles like/unlike action
  async function handleLike(targetId, type = 'post') {
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
      alert('Network error: ' + err.message);
    }
  }

/// end of like buttons
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid date';

  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 10) return 'Just now';                     // Less than 10 seconds
  if (diff < 60) return `${Math.floor(diff)}s ago`;     // Seconds ago
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`; // Minutes ago
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`; // Hours ago

  const daysAgo = Math.floor(diff / 86400);
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo}d ago`;

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const handleReplyChange = (postId, value) => {
  setReplyContents((prev) => ({ ...prev, [postId]: value }));
  setErrors((prev) => ({ ...prev, [postId]: '' }));
};


const handleReplySubmit = async (postId) => {
  const replyText = replyContents[postId]?.trim();
  const hasMedia = mediaFiles[postId] && mediaFiles[postId].length > 0;

  if (!replyText && !hasMedia) {
    setErrors((prev) => ({ ...prev, [postId]: 'Please write a reply or attach media.' }));
    return;
  }

  setLoading((prev) => ({ ...prev, [postId]: true }));

  const formData = new FormData();
  formData.append('post_id', postId);
  formData.append('user_id', user.id);
  formData.append('text', replyText || '');

  if (hasMedia) {
    mediaFiles[postId].forEach((file) => {
      formData.append('media[]', file); // ✅ use media[] for multiple files
    });
  }

  try {
  const res = await fetch(`${API_URL}/add_reply.php`, {
    method: 'POST',
    body: formData,
  });

  const rawText = await res.text();

  // Debugging log (optional):
  console.log("Raw server response:", rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseError) {
    console.error("Invalid JSON returned from server:", rawText);
    alert("Server returned invalid response. Check console for details.");
    return;
  }

  if (data && data.success) {
    // Update reply UI
   // onReply(postId, data.reply
   
 
   
    setReplyContents(prev => ({ ...prev, [postId]: '' }));
    setMediaFiles(prev => ({ ...prev, [postId]: null }));
    setShowReplyBox(prev => ({ ...prev, [postId]: false }));
    setShowReplies(prev => ({ ...prev, [postId]: true }));

onRefresh(); // ✅ Call onRefresh to update posts 
    // Scroll to reply after slight delay
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    console.warn("Reply failed with message:", data?.message);
    alert(data?.message || "Reply failed. No error message provided.");
  }
} catch (err) {
  console.error('Network or server error:', err);
  alert('Network error: ' + err.message);
} finally {
  setLoading(prev => ({ ...prev, [postId]: false }));
}

};
  const isImage = (filePath) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
  const isVideo = (filePath) => /\.(mp4|webm|ogg)$/i.test(filePath);

  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const currentPosts = sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

const [expandedPostId, setExpandedPostId] = useState(null);


  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


const handleDeleteReply = async (replyId) => {
  if (window.confirm("Are you sure you want to delete this reply?")) {
    try {
      const formData = new FormData();
      formData.append('reply_id', replyId);

      // Make sure this URL points to your specific reply deletion script (e.g., delete_reply.php)
      const response = await fetch(`${API_URL}/delete_reply.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
            onRefresh();
        // This is where you update your component's state to remove the reply from the UI.
        // For example, if your replies are stored in a state variable called 'replies':
        // setReplies(prevReplies => prevReplies.filter(reply => reply.id !== replyId));
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Failed to delete reply:", error);
      alert("Failed to delete reply. Please try again.");
    }
  } 
};


useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown-trigger')) {
      setOpenDropdownId(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

 



//delete post" const PostList = ({ posts, onReply, user, onRefresh }) => {
const handleDelete = async (postId) => {
  if (!postId || isNaN(postId)) {
    alert("❌ Invalid post ID.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    const formData = new FormData();
    formData.append('post_id', postId);

    const response = await fetch(`${API_URL}/delete_post.php`, {
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
      alert("✅ Post deleted successfully.");
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } else {
      alert("❌ Delete failed: " + (result.message || "Unknown error."));
    }
  } catch (err) {
    console.error("❌ Error while deleting post:", err);
    alert("❌ A network error occurred. See console for details.");
  }
};





// ✅ optional for clean contrast
<div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
  <input
    type="text"
    placeholder="Search posts..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      flex: 1
    }}
  />

 <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    style={{
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #ccc'
    }}
  >
    <option value="All">All</option>
    <option value="News">News</option>
    <option value="Events">Events</option>
    <option value="Announcements">Announcements</option>
    {/* Add more categories as needed */}
  </select>
</div>
  

const createLinkifiedText = (text) => {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb">$1</a>'
  );
};

return (

<div
  className="post-list"
  style={{
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '10px 5px 80px 5px' : '20px 10px 100px 5px',
    boxSizing: 'border-box'
  }}
>
{/* Post Form */}




   

 
  {/* Column 2 */}
<div
  style={{
    display: 'flex',
    flexWrap: 'wrap', // allows wrapping on small screens
    gap: '5px',
    minWidth: '200px',
    width: '100%',
    marginBottom: '10px',
    justifyContent: 'space-between', // spreads elements evenly
  }}
>
    
    {/* Row 1 - Search Input */}
    <input
      type="text"
      placeholder="Search posts..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
          style={{
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '12px',
      width: '50%',
      height: '40px', // fixed height
      boxSizing: 'border-box',
    }}
  />


    {/* Row 2 - Dropdowns side-by-side */}

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
    style={{
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '12px',
      width: '100%',
      height: '40px', // same height as input
      boxSizing: 'border-box',
    }}
      >
        <option value="">All Categories</option>
        {[...new Set(posts.map((p) => p.category))].map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={sortType}
        onChange={(e) => setSortType(e.target.value)}
     style={{
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '12px',
      width: '100%',
      height: '40px', // same height as input
      boxSizing: 'border-box',
    }}
      >
        <option value="latest">Latest</option>
        <option value="top">Top</option>
      </select>
    </div>
   

 <PostForm onSubmit={onRefresh} user={user} style={{ flex: 1, minWidth: '600px', marginBottom: '10px', width :'500px' }}> </PostForm>
    {/* Filtered and Sorted Posts */}
    {currentPosts
      .filter((post) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.username?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === '' ||
          post.category?.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortType === 'latest') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortType === 'top') {
          return (b.likes_count || 0) - (a.likes_count || 0);
        }
        return 0;
      })

    .map((post) => (
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
          transition: 'all 0.3s ease',
        }}
      >
    

      <div style={{ position: 'relative' }}>


 {/* ⋮ Dropdown for Post Author OR Admin */}
{user && (Number(user.id) === Number(post.user_id) || user.role === 'admin') && (
  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Toggle button (three‑dot icon) */}
      <button
        onClick={() =>
          setShowDropdown((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
        }
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

      
      {/* 🔹Title */}
     
<h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#102a43',
        marginBottom: '16px'
      }}>
   <Link to={`/home/post/${post.id}`} style={{ textDecoration: 'none', color: '#102a43',  fontSize: '20px',
        fontWeight: '700', }}>
              {post.title}
            </Link>
      </h2>
      {/* 🔹User Info */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <img
          src={post.profile_picture || 'Logo/default-avatar.png'}
          alt="avatar"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '12px'
          }}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{post.username} {post.lastname}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {formatDate(post.created_at)} · {post.category} · {post.country}
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
   {/* Always show first media */}

{/* Show the rest, but limit to 3 by default */}
{(expandedPostId === post.id 
  ? post.media.slice(1) // show all after first
  : post.media.slice(1, 4) // show only next 3 after first
).map((mediaUrl, index) => (
  <img 
    
   

    style={{ width: '100%', borderRadius: '5px', marginBottom: '5px' }} 
  />
))}

{/* Show toggle button if there are more than 4 total */}
{post.media.length > 4 && (
  <button
    onClick={() =>
      setExpandedPostId(prev => (prev === post.id ? null : post.id))
    }
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

      </div>
    



    
     {/* like icon and reply  */}
     
 
<div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
 <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // increased gap for clarity
    fontSize: '20px',
    marginLeft: '10px',
    width: '100%',
  }}
>

  {/* 🔹Reply & View Replies (Left) */}



    <button
      onClick={() =>
        setShowReplyBox((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
      }
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: '20px',
        color: '#1d4ed8',
        fontWeight: '500',
        cursor: 'pointer',
      }}
    >
      {showReplyBox[post.id] ? 'Cancel Reply' : <ReplyButton />}
    </button>
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    fontSize: '20px',
    marginLeft: '10px',
  }}
>
    {post.replies && post.replies.length > 0 && (
      <button
        onClick={() =>
          setShowReplies((prev) => ({
            ...prev,
            [post.id]: !prev[post.id],
          }))
        }
        style={{
          background: 'transparent',
          border: 'none',
          borderRadius: '20px',
          color: '#1d4ed8',
          fontWeight: '500',
          cursor: 'pointer',
        }}
      >
        {showReplies[post.id]
          ? 'Hide replies'
          : `View replies (${post.replies.length})`}
      </button>
    )}
  </div>

  {/* 🔹Like (Center with auto margin) */}
  <button
    onClick={() => handleLike(post.id, 'post')}
    style={{
      background: 'transparent',
      color: userLiked[`post_${post.id}`] ? '#0284c7' : '#374151',
      border: 'none',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      margin: 'auto', // Center this button between left and right
    }}
  >
    
    {userLiked[`post_${post.id}`] ? <LikeButtons /> : <UnLikeButtons />} {likes[`post_${post.id}`] || 0}
  </button>

  {/* 🔹Share (Right-aligned) */}
  <button
  onClick={() => {
   const shareUrl = `${window.location.origin}/home/public/${post.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'ReallyLesson Post',
          url: shareUrl,
        })
        .catch((err) => console.error('Share failed:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link.'));
    }
  }}
  style={{
    background: 'transparent',
    color: '#374151',
    border: 'none',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    marginLeft: 'auto', // Push to far right
  }}
>
  <ShareButton />
</button>

</div>
</div>

 {/* Like & Share Buttons - end */}




       {showReplyBox[post.id] && (
  <div
    style={{
      marginTop: '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: '#f9f9f9'
    }}
  >
    {/* ✏️ Textarea */}
    <textarea
      placeholder="Write a reply..."
      value={replyContents[post.id] || ''}
      onChange={(e) => handleReplyChange(post.id, e.target.value)}
      style={{
        width: '100%',
        minHeight: '60px',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px'
      }}
    />

    {/* ❗ Error */}
    {errors[post.id] && (
      <div style={{ color: 'red', fontSize: '13px', marginBottom: '8px' }}>
        {errors[post.id]}
      </div>
    )}

    {/* 🖼️ Media Previews */}
    {mediaFiles[post.id]?.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
        {mediaFiles[post.id].map((file, idx) => {
          const url = URL.createObjectURL(file);
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');

          return (
            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => {
                  const updated = [...mediaFiles[post.id]];
                  updated.splice(idx, 1);
                  setMediaFiles(prev => ({ ...prev, [post.id]: updated }));
                }}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 1
                }}
              >
                ❌
              </button>
              {isImage && (
                <img src={url} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
              )}
              {isVideo && (
                <video src={url} controls style={{ width: '100px', height: '100px', borderRadius: '5px' }} />
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* 🧲 Drag-and-drop Zone */}
    <div
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setMediaFiles(prev => ({
          ...prev,
          [post.id]: prev[post.id] ? [...prev[post.id], ...files] : files
        }));
        setIsDragging(prev => ({ ...prev, [post.id]: false }));
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(prev => ({ ...prev, [post.id]: true }));
      }}
      onDragLeave={() => {
        setIsDragging(prev => ({ ...prev, [post.id]: false }));
      }}
      onClick={() => document.getElementById(`mediaInput-${post.id}`).click()}
      style={{
        border: isDragging[post.id] ? '2px dashed #0077b6' : '2px dashed #ccc',
        borderRadius: '5px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: isDragging[post.id] ? '#e0f7fa' : '#f9f9f9',
        color: '#555',
        cursor: 'pointer',
        marginBottom: '10px'
      }}
    >
      Drag & drop media here or <strong>click to browse</strong>
    </div>

    {/* 🔍 Hidden Input */}
    <input
      id={`mediaInput-${post.id}`}
      type="file"
      accept="image/*,video/*"
      multiple
      onChange={(e) => {
        const files = Array.from(e.target.files);
        setMediaFiles(prev => ({
          ...prev,
          [post.id]: prev[post.id] ? [...prev[post.id], ...files] : files
        }));
      }}
      style={{ display: 'none' }}
    />

    {/* 🚀 Submit Button */}
    <button
      onClick={() => handleReplySubmit(post.id)}
      disabled={loading[post.id]}
      style={{
        backgroundColor: '#0077b6',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        fontSize: '15px'
      }}
    >
      {loading[post.id] ? 'Submitting...' : 'Submit Reply'}
    </button>
    
  </div>

  
)}




          {showReplies[post.id] && (
  <div style={{ marginTop: '20px' }}>
    <AnimatePresence>
      {(post.replies || [])
        .slice(0, visibleReplies[post.id] ?? 7) // 🔹 Only show 7 initially
        .map((reply, i) => (
          <motion.div
            key={reply.id || i}
            ref={
              i === ((visibleReplies[post.id] ?? 7) - 1)
                ? scrollRef
                : null
            }
            initial={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid #eee',
              paddingTop: '10px',
              marginTop: '10px',
            }}
          >
            <img
              src={reply.profile_picture || '/default-avatar.png'}
              alt="avatar"
              style={{ width: '35px', height: '35px', borderRadius: '50%' }}
            />
            <div>
              <strong>{reply.username}</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formatDate(reply.created_at)}
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


              {/* Media */}
              {Array.isArray(reply.media) && (
                <>
                  {reply.media
                    .slice(0, showAllImages[reply.id] ? reply.media.length : 2)
                    .map((item, idx) =>
                      isImage(item.url) ? (
                        <img
                          key={idx}
                          src={item.url}
                          alt="reply media"
                          style={{
                            margin: '15px',
                            maxWidth: '50%',
                            borderRadius: '4px',
                            marginTop: '10px',
                          }}
                        />
                      ) : isVideo(item.url) ? (
                        <video
                          key={idx}
                          controls
                          style={{
                            background: 'none',
                            border: 'none',
                            margin: '15px',
                            maxWidth: '50%',
                            borderRadius: '4px',
                            marginTop: '10px',
                          }}
                        >
                          <source
                            src={item.url}
                            type={`video/${item.url.split('.').pop()}`}
                          />
                        </video>
                      ) : null
                    )}

                  {reply.media.length > 2 && (
                    <button
                      onClick={() =>
                        setShowAllImages((prev) => ({
                          ...prev,
                          [reply.id]: !prev[reply.id],
                        }))
                      }
                      style={{
                        width: '120px',
                        border: 'none',
                        background: '#f9f9f9',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#0077b6',
                        marginTop: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      {showAllImages[reply.id]
                        ? 'Show less'
                        : 'See more photos'}
                    </button>
                  )}
                </>
              )}

              {/* Like button */}
           <div style={{
  display: 'flex',
 
  alignItems: 'flex-start',
  gap: '1px'
}}>
  {/* Like button */}
  <button
    onClick={() => handleLike(reply.id, 'reply')}
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
        onClick={() => handleDeleteReply(reply.id)}
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
        <span role="img" aria-label="delete"><DeleteButtons/></span>
    
      </button>
 
    )
  }   
</div>
            </div>

            
           </motion.div>
        ))}
    </AnimatePresence>

    {/* See More Replies Button */}
    {post.replies &&
      (visibleReplies[post.id] ?? 7) < post.replies.length && (
        <div style={{ marginTop: '15px', marginLeft: '45px' }}>
          <button
            onClick={() =>
              setVisibleReplies((prev) => ({
                ...prev,
                [post.id]: (prev[post.id] ?? 7) + 5,
              }))
            }
            style={{
              border: 'none',
              background: '#f0f0f0',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#0077b6',
            }}
          >
            See more replies
          </button>
        </div>
      )}
  </div>
)}
      </div>
    ))}

    
    
{/* Pagination controls*/}




     {totalPages > 1 && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      gap: '10px',
      flexWrap: 'wrap'
    }}
  >
    <button
      disabled={currentPage === 1}
      onClick={() => handlePageChange(currentPage - 1)}
      style={{
        background: 'transparent',
        border: '2px solid #4a90e2',
        color: '#4a90e2',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        opacity: currentPage === 1 ? 0.5 : 1,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (currentPage !== 1) {
          e.target.style.background = '#4a90e2';
          e.target.style.color = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (currentPage !== 1) {
          e.target.style.background = 'transparent';
          e.target.style.color = '#4a90e2';
        }
      }}
    >
      &laquo; Prev
    </button>

    <span style={{ alignSelf: 'center', fontSize: '14px', color: '#555' }}>
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => handlePageChange(currentPage + 1)}
      style={{
        background: 'transparent',
        border: '2px solid #4a90e2',
        color: '#4a90e2',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        opacity: currentPage === totalPages ? 0.5 : 1,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (currentPage !== totalPages) {
          e.target.style.background = '#4a90e2';
          e.target.style.color = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (currentPage !== totalPages) {
          e.target.style.background = 'transparent';
          e.target.style.color = '#4a90e2';
        }
      }}
    >
      Next &raquo;
    </button>
  </div>
)}
    </div>
  );
}









export default PostList;