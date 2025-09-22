import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const CloseButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        color: '#03010bff', // Facebook-style delete red
        fontSize: '20px',
        padding: '4px 8px',
        borderRadius: '8px',
        userSelect: 'none',
        transition: 'background 0.2s ease',
   
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fbe9ea')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <FontAwesomeIcon icon={faXmark} />
     
    </div>
  );
};

export default CloseButton;
