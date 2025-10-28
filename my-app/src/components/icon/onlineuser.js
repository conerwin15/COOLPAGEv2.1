import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle  } from '@fortawesome/free-solid-svg-icons';

const OnlineUsers = () => {
  const [liked, setLiked] = useState(false);

  return (
    <div
      onClick={() => setLiked(prev => !prev)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1px',
        cursor: 'pointer',
      
  fontSize: '25px',
        
        borderRadius: '8px',
        userSelect: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0f2f5')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <FontAwesomeIcon icon={faUserCircle} />
       
    </div>
  );
};

export default OnlineUsers;
