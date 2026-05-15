import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateRound } from './utils/gameLogic';
import { AnimalCard } from './components/AnimalCard';

// Simple sound effects using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (type === 'success') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'error') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  }
};

const speakNumber = (number) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(number.toString());
    utterance.rate = 0.9; // slightly slower
    utterance.pitch = 1.2; // slightly higher pitch
    window.speechSynthesis.speak(utterance);
  }
};

function App() {
  const [round, setRound] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState(new Set());
  const [isCelebrating, setIsCelebrating] = useState(false);

  const startNewRound = useCallback(() => {
    const newRound = generateRound(5, 3);
    setRound(newRound);
    setWrongAnswers(new Set());
    setIsCelebrating(false);

    // Speak the new target number, slight delay for UI to update
    setTimeout(() => {
      speakNumber(newRound.targetNumber);
    }, 100);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleCardClick = (count) => {
    if (isCelebrating) return; // Prevent clicks during celebration

    // Initialize audio context on first user interaction if needed
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (count === round.targetNumber) {
      // Success!
      setIsCelebrating(true);
      playSound('success');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2C3E50']
      });

      // Wait a bit, then start a new round
      setTimeout(() => {
        startNewRound();
      }, 2000);
    } else {
      // Wrong answer
      playSound('error');
      setWrongAnswers(prev => new Set(prev).add(count));
      
      // Remove the shake class after animation completes so it can be triggered again
      setTimeout(() => {
        setWrongAnswers(prev => {
          const newSet = new Set(prev);
          newSet.delete(count);
          return newSet;
        });
      }, 500);
    }
  };

  if (!round) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      height: '100%',
      width: '100%',
    }}>
      
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          margin: 0, 
          color: '#2C3E50',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Count the {round.animal}
        </h1>
        <div 
          onClick={() => speakNumber(round.targetNumber)}
          className={isCelebrating ? 'animate-bounce' : ''}
          style={{ 
            fontSize: '8rem', 
            fontWeight: '900',
            lineHeight: '1',
            color: '#FF6B6B',
            textShadow: '4px 4px 0px #FFE66D, 8px 8px 0px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
        >
          {round.targetNumber}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '20px',
        width: '100%',
        maxWidth: '800px',
        padding: '20px'
      }}>
        {round.options.map((optionCount, index) => (
          <AnimalCard 
            key={`${round.animal}-${index}`} 
            count={optionCount} 
            animal={round.animal}
            onClick={handleCardClick}
            isWrong={wrongAnswers.has(optionCount)}
          />
        ))}
      </div>

    </div>
  );
}

export default App;
