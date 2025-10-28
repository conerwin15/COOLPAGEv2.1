import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

const CommentButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0f2f5')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
  gap: '6px',
        padding: '10px 0',
     fontSize: '20px',
        color: '#606770',
        background: 'transparent',  // transparent inside
        border: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: '8px',
        transition: 'background 0.2s ease',
        marginLeft: '10px', // space between buttons
      }}
    >
      
      <FontAwesomeIcon icon={faComment} />
      <span>Reply</span>
    </div>
  );
};

export default CommentButton;
