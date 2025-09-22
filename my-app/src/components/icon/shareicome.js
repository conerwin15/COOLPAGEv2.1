import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane    } from '@fortawesome/free-solid-svg-icons';

const ShareButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = '#f0f2f5')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      style={{
        flex: 1,
    
      
           
        padding: '10px 0',
        fontSize: '20px',
        color: '#606770',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: '8px',
        transition: 'background 0.2s ease',
      }}
    >
   
      <FontAwesomeIcon icon={faPaperPlane   } />        <span>Share</span>
   
    </div>
  );
};

export default ShareButton;
