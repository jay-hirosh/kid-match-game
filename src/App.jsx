import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateRound } from './utils/gameLogic';
import { NumberTile } from './components/NumberTile';

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

const speakPhrase = (number) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(`Please select number ${number}`);
    utterance.rate = 0.9; // slightly slower
    utterance.pitch = 1.2; // slightly higher pitch
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0];
    }
    window.speechSynthesis.speak(utterance);
  }
};

const speakGenius = () => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance("You are a genius!");
    utterance.rate = 1.0; 
    utterance.pitch = 1.2; 
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0];
    }
    window.speechSynthesis.speak(utterance);
  }
};

function App() {
  const [round, setRound] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState(new Set());
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showFlashScreen, setShowFlashScreen] = useState(false);

  const startNewRound = useCallback(() => {
    // Generate numbers 1-10, with 3 options
    const newRound = generateRound(10, 3);
    setRound(newRound);
    setWrongAnswers(new Set());
    setIsCelebrating(false);
    setShowFlashScreen(false);

    // Speak the new target phrase synchronously to avoid iOS auto-play blocking
    speakPhrase(newRound.targetNumber);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleTileClick = (number) => {
    if (isCelebrating) return; // Prevent clicks during celebration

    // Initialize audio context on first user interaction if needed
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (number === round.targetNumber) {
      // Success!
      setIsCelebrating(true);
      setShowFlashScreen(true);
      playSound('success');
      speakGenius();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2C3E50']
      });

      // Wait a bit, then start a new round
      setTimeout(() => {
        startNewRound();
      }, 3000);
    } else {
      // Wrong answer
      playSound('error');
      setWrongAnswers(prev => new Set(prev).add(number));
      
      // Remove the shake class after animation completes so it can be triggered again
      setTimeout(() => {
        setWrongAnswers(prev => {
          const newSet = new Set(prev);
          newSet.delete(number);
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
          Please select number
        </h1>
        <div 
          onClick={() => {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            speakPhrase(round.targetNumber);
          }}
          className={isCelebrating ? 'animate-bounce' : ''}
          style={{ 
            fontSize: '8rem', 
            fontWeight: '900',
            lineHeight: '1',
            color: '#FF6B6B',
            textShadow: '4px 4px 0px #FFE66D, 8px 8px 0px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}
        >
          <span>{round.targetNumber}</span>
          <span style={{ fontSize: '3rem' }}>🔊</span>
        </div>
        <p style={{ color: '#666', marginTop: '10px', fontSize: '1.2rem' }}>
          Tap the number to hear it!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%',
        maxWidth: '800px',
        padding: '20px'
      }}>
        {round.options.map((optionNumber, index) => (
          <NumberTile 
            key={`tile-${index}`} 
            number={optionNumber} 
            onClick={handleTileClick}
            isWrong={wrongAnswers.has(optionNumber)}
          />
        ))}
      </div>

      {showFlashScreen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <div style={{ fontSize: '10rem', animation: 'float 3s ease-in-out infinite' }}>🌟</div>
          <h1 style={{ fontSize: '5rem', color: '#FF6B6B', margin: 0, textTransform: 'uppercase', textShadow: '4px 4px 0px #FFE66D, 8px 8px 0px rgba(0,0,0,0.1)' }}>
            Genius!
          </h1>
        </div>
      )}

    </div>
  );
}

export default App;
