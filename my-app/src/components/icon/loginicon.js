import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt  } from '@fortawesome/free-solid-svg-icons';

const Lbutton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1px',
        cursor: 'pointer',
        color: ' "#0077b6",', // Facebook-style delete red
        fontSize: '20px',
    
        borderRadius: '8px',
        userSelect: 'none',
        transition: 'background 0.2s ease',
         //   marginBottom :'30px'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fbe9ea')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <FontAwesomeIcon icon={faSignInAlt } />
     
    </div>
  );
};

export default Lbutton;
