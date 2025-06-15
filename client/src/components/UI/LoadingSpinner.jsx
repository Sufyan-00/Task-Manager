import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ overlay, size = 'medium' }) => {
  return (
    <div className={`spinner-container ${overlay ? 'overlay' : ''} ${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;