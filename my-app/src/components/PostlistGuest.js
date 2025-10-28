import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LikeButtons from './icon/LikeButton';
import ReplyButton from './icon/replybutton';
import UnLikeButtons from './icon/unlikebutton';
import DeleteButtons from './icon/deleteicon';
import ShareButton from './icon/shareicome';

const PostListGuest = ({ posts, onReply, user, onRefresh }) => {
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
    const [likedPosts, setLikedPosts] = useState([]); // ✅ Declare here
  const [expandedContent, setExpandedContent] = useState({});
const [showDropdown, setShowDropdown] = useState({});
const [showAllImages, setShowAllImages] = useState({}); // key by reply.id
  const [popupPhoto, setPopupPhoto] = useState(null);
  const closePopup = () => setPopupPhoto(null);

const [replies, setReplies] = useState({});
const [searchTerm, setSearchTerm] = useState('ALL');



  const [editPost, setEditPost] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});


  const [isDragging, setIsDragging] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
const [sortType, setSortType] = useState('latest'); // NEW
  const API_URL= process.env.REACT_APP_API_URL;


useEffect(() => {
  const fetchLikes = async () => {
    try {
      const userId = user?.id ? `?user_id=${user.id}` : '';
      const res = await fetch(`${API_URL}/get_likesguest.php${userId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error ' + res.status);
      const data = await res.json();
      console.log('get_likes response', data); // check shape in console
      if (data.success) {
        setLikes(data.total_likes || {});       // likes is an object keyed by post id strings
        if (user?.id) setUserLiked(data.user_liked || {});
      } else {
        console.warn('get_likes returned success=false', data);
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  fetchLikes();
}, [posts.length, user?.id]);


  // Toggle like/unlike
  const handleLikeToggle = async (postId) => {
    const isLiked = likedPosts.includes(postId);

    // Optimistic UI update
    setLikes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1),
    }));

    const updatedLikedPosts = isLiked
      ? likedPosts.filter((id) => id !== postId)
      : [...likedPosts, postId];

    setLikedPosts(updatedLikedPosts);
    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));

    try {
      await fetch(`${API_URL}/likeguest.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, action: isLiked ? 'unlike' : 'like' }),
      });
    } catch (err) {
      console.error('Error toggling like:', err.message);
    }
  };
const handleShare = (id) => {
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


  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const currentPosts = sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

const formatDate = (timestamp, fixedTimeZone = null) => {
  // Decide which timezone to use: user’s local or fixed
  const timeZone = fixedTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert timestamp from UTC to chosen time zone
  const localDate = new Date(
    new Date(timestamp).toLocaleString("en-US", { timeZone })
  );

  const localNow = new Date(
    new Date().toLocaleString("en-US", { timeZone })
  );

  const diff = (localNow.getTime() - localDate.getTime()) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  // Format date in chosen time zone
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone
  }).format(localDate);
};

// Example usage:
// Auto-adjust to user’s local time
console.log(formatDate("2025-08-13T06:30:00Z"));

// Force Singapore time
console.log(formatDate("2025-08-13T06:30:00Z", "Asia/Singapore"));


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

  const isImage = (filePath) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
  const isVideo = (filePath) => /\.(mp4|webm|ogg)$/i.test(filePath);

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
    maxWidth: '100%',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '10px 5px 80px 5px' : '20px 10px 100px 5px',
    boxSizing: 'border-box'
  }}
>

  
   <div
    style={{
      display: 'flex',
      alignItems: 'flex-start', // Align to top
      marginBottom: '10px',
      gap: '10px',
      flexWrap: 'wrap',
    }}
  >
    {/* Post Form */}
  
  
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
              padding: '11px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            minWidth:  '70px',
          }}
        />
  
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '11px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            minWidth: '180px',
              display: window.innerWidth <= 768 ? "none" : "block"
          }}
        >
          <option value="">All Categories</option>
          {[...new Set(posts.map((p) => p.category))].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
  
        {/* Sort Dropdown */}
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          style={{
              padding: '11px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            minWidth: '180px',
              display: window.innerWidth <= 768 ? "none" : "block"
          }}
        >
          <option value="latest">Latest</option>
          <option value="top">Top</option>
        </select>
      </div>
  
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
      <div key={post.id} className="post-card" style={{ borderRadius: '16px', padding: '20px', marginBottom: '20px', backgroundColor: '#fff', boxShadow: '20px 20px 20px rgba(5, 4, 4, 0.05)', border: '1px solid #eaeaea', transition: 'all 0.3s ease' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#102a43', marginBottom: '16px' }}>{post.title}</h2>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <img src={post.profile_picture || 'Logo/default-avatar.png'} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginRight: '12px' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{post.first_name} {post.last_name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(post.created_at)} · {post.category} · {post.country}</div>
          </div>
        </div>

        <p style={{ fontSize: '15px', color: '#374151', marginBottom: '8px' }}>
          {expandedContent[post.id] || post.content.split(' ').length <= 50 ? post.content : post.content.split(' ').slice(0, 50).join(' ') + '...'}
        </p>

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
                   <video-
                     controls
                     style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover',
                     }}
                   >
                     <source src={file.url} type={`video/${file.url.split('.').pop()}`} />
                   </video->
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
    

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
  <button
  onClick={() => handleLikeToggle(post.id)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent', // no background
    border: 'none',            // no border
    borderRadius: '20px',
    padding: '6px 14px',
    color: '#2563eb',
    fontWeight: 500,
    cursor: 'pointer'
  }}
>
  {likedPosts.includes(post.id) ? <LikeButtons /> : <UnLikeButtons />}
  <span>{likes[String(post.id)] ?? 0}</span>
</button>

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

          {post.replies && post.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              style={{
                background: 'transparent',
                 border: 'none',
                 borderRadius: '20px',
                 
                 color: '#1d4ed8',
                 fontWeight: '500',
                 cursor: 'pointer',
                 objectFit: 'contain'
              }}
            >
              {showReplies[post.id] ? 'Hide replies' : `View replies (${post.replies.length})`}
            </button>
          )}
        </div>

        {showReplies[post.id] && (
          <div style={{ marginTop: '20px' }}>
            <AnimatePresence>
              {(post.replies || []).map((reply, i) => (
                <motion.div
                  key={i}
                  ref={i === (post.replies.length - 1) ? scrollRef : null}
                  initial={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}
                >
                  <img src={reply.profile_picture || '/default-avatar.png'} alt="avatar" style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
                  <div>
                    <strong>{reply.username}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(reply.created_at)}</div>
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

                    {(Array.isArray(reply.media) ? reply.media : []).map((item, idx) => (
                      isImage(item.url) ? (
                        <img key={idx} src={item.url} alt="reply media" style={{ maxWidth: '50%', borderRadius: '4px', marginTop: '10px' }} />
                      ) : isVideo(item.url) ? (
                        <video key={idx} controls style={{ maxWidth: '50%', borderRadius: '4px', marginTop: '10px' }}>
                          <source src={item.url} type={`video/${item.url.split('.').pop()}`} />
                        </video>
                      ) : null
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    ))}

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
export default PostListGuest;
