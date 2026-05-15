import React from 'react';

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '24px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  padding: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  minHeight: '150px',
  width: '100%',
  maxWidth: '200px',
  border: '4px solid #EAEAEA',
};

export function NumberTile({ number, onClick, isWrong }) {
  return (
    <div 
      className={`animate-pop-in ${isWrong ? 'animate-shake' : ''}`}
      style={{
        ...cardStyle,
        borderColor: isWrong ? '#FF6B6B' : '#EAEAEA'
      }}
      onClick={() => onClick(number)}
      onTouchStart={(e) => {
        // Prevent default to handle touch instantly without delay
        e.preventDefault();
        onClick(number);
      }}
    >
      <span style={{ 
        fontSize: '5rem', 
        fontWeight: '900', 
        color: '#2C3E50',
        lineHeight: 1
      }}>
        {number}
      </span>
    </div>
  );
}
