import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        color: '#f02849', // Facebook-style delete red
        fontSize: '14px',
        padding: '4px 8px',
        borderRadius: '8px',
        userSelect: 'none',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fbe9ea')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <FontAwesomeIcon icon={faTrash} />
      <span></span>
    </div>
  );
};

export default DeleteButton;
