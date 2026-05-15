import React from 'react';

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '24px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  padding: '20px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  minHeight: '150px',
  width: '100%',
  maxWidth: '200px',
  border: '4px solid #EAEAEA',
};

export function AnimalCard({ count, animal, onClick, isWrong }) {
  const emojis = Array.from({ length: count }, (_, i) => (
    <span key={i} style={{ fontSize: '3rem', animation: 'float 3s ease-in-out infinite' }}>
      {animal}
    </span>
  ));

  return (
    <div 
      className={`animate-pop-in ${isWrong ? 'animate-shake' : ''}`}
      style={{
        ...cardStyle,
        borderColor: isWrong ? '#FF6B6B' : '#EAEAEA'
      }}
      onClick={() => onClick(count)}
      onTouchStart={(e) => {
        // Prevent default to handle touch instantly without delay
        e.preventDefault();
        onClick(count);
      }}
    >
      {emojis}
    </div>
  );
}
