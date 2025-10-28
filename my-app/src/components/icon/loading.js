// src/components/Loading.js
import React from 'react';
import LoadingGif from '../icon/LoadingGear.gif'; // Ensure path is correct

const Loading = () => {
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'transparent', // <-- Transparent background
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      pointerEvents: 'none', // Optional: allows clicks to pass through
    },
    image: {
      width: '40px',
      height: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <img src={LoadingGif} alt="Loading..." style={styles.image} />
    </div>
  );
};

export default Loading;
