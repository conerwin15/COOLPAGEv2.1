import React, { useState } from 'react';

import { AnimatePresence, color, motion } from 'framer-motion';
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
import OnlineUsersSidebar from './OnlineUsersSidebar'; // ✅ no {}

// This is a placeholder for your actual reply item component.
// It assumes `reply`, `user`, `userLiked`, `likes`, `handleLike`, `handleDeleteReply`
// and a new `onNewReplyCreated` prop are passed down.
function Replytoreply({
  reply, // The current reply object
  user, // The logged-in user object
  userLiked, // State for tracking likes
  likes, // Object holding like counts
  handleLike, // Function to handle liking
  handleDeleteReply, // Function to handle deleting replies
  onNewReplyCreated, // Callback to update parent state after a new reply
  postId // The ID of the main post this reply belongs to
}) {
  const [replyingToReplyId, setReplyingToReplyId] = useState(null);
  const [newReplyContent, setNewReplyContent] = useState('');

  // Function to submit a new reply to an existing reply
  const submitNestedReply = async (e) => {
    e.preventDefault();
    if (!newReplyContent.trim()) {
      alert('Reply cannot be empty.');
      return;
    }
    if (!user) {
      alert('You must be logged in to reply.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('post_id', postId); // The ID of the main post
      formData.append('user_id', user.id); // The ID of the logged-in user
      formData.append('content', newReplyContent.trim());
      formData.append('parent_reply_id', replyingToReplyId); // The ID of the reply being replied to

      // Make sure this URL points to your new backend script for creating nested replies
      const response = await fetch('http://localhost/coolpage/my-app/backend/add_replytoreply.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        setNewReplyContent(''); // Clear the input
        setReplyingToReplyId(null); // Close the reply form
        // Call a callback to inform the parent component to refresh or add the new reply
        if (onNewReplyCreated) {
          onNewReplyCreated(result.newReply); // Pass the newly created reply if returned by backend
        }
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Failed to submit nested reply:", error);
      alert("Failed to submit reply. Please try again.");
    }
  };

  return (
    <div style={{
      border: '1px solid #eee',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '10px',
      marginLeft: reply.parent_reply_id ? '30px' : '0px', // Indent nested replies
      backgroundColor: reply.parent_reply_id ? '#f9f9f9' : '#fff'
    }}>
      <p>{reply.content}</p>
      <small>By: {reply.username || 'Anonymous'}</small> {/* Assuming reply has a username */}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px',
        marginTop: '10px'
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

        {/* Reply to Reply Button */}
        <button
          onClick={() => setReplyingToReplyId(replyingToReplyId === reply.id ? null : reply.id)}
          style={{
            fontSize: '13px',
            color: '#0077b6',
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
          <span role="img" aria-label="reply">↩️</span>
          Reply
        </button>

        {/* Delete button (conditionally rendered for author or admin) */}
        {(user && (Number(user.id) === Number(reply.user_id) || user.role === 'admin')) && (
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
            <span role="img" aria-label="delete">🗑️</span>
            Delete
          </button>
        )}
      </div>

      {/* Reply Input Form (conditionally rendered) */}
      {replyingToReplyId === reply.id && (
        <form onSubmit={submitNestedReply} style={{ marginTop: '15px' }}>
          <textarea
            value={newReplyContent}
            onChange={(e) => setNewReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              resize: 'vertical'
            }}
          ></textarea>
          <button
            type="submit"
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '5px'
            }}
          >
            Submit Reply
          </button>
          <button
            type="button"
            onClick={() => {
              setReplyingToReplyId(null);
              setNewReplyContent('');
            }}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: '10px',
              marginTop: '5px'
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

// Example usage in a parent component (e.g., PostDetail or RepliesList)
// You would render this component for each reply in your `replies` array.
/*
function RepliesList({ replies, user, postId, onReplyAdded }) {
  const [allReplies, setAllReplies] = useState(replies); // Manage replies in state if you want to update dynamically

  const handleNewReplyCreated = (newReply) => {
    // You might want to add the new reply to the existing list and re-sort if necessary
    // setAllReplies([...allReplies, newReply]);
    // Or just trigger a full refresh of replies for the post
    onReplyAdded(); // This would be a prop from a higher-level component to refetch replies
  };

  return (
    <div>
      {allReplies.map(reply => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          user={user}
          postId={postId}
          // Pass other necessary props like userLiked, likes, handleLike, handleDeleteReply
          onNewReplyCreated={handleNewReplyCreated}
        />
      ))}
    </div>
  );
}
*/

export default Replytoreply;
