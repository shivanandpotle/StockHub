import React from 'react';

const LoadingSpinner = ({ size = 40, color = 'var(--accent-blue)' }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    width: '100%',
  };

  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: `4px solid rgba(255, 255, 255, 0.1)`,
    borderLeftColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
    </div>
  );
};

export default LoadingSpinner;
