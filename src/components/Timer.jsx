import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import alarmSound from '/src/assets/ss.mp3'; 

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function Timer({ onTimerFinish }) {
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const alarmPlayer = useRef(null);
  const isAudioInitialized = useRef(false);


  const initializeAudio = async () => {
    if (isAudioInitialized.current) return;
    try {
        await Tone.start();
       
        alarmPlayer.current = new Tone.Player(alarmSound).toDestination();
      
        await Tone.loaded();
        isAudioInitialized.current = true;
        console.log("Audio Context and Player Initialized");
    } catch (e) {
        console.error("Could not start or load audio", e);
    }
  };

  const playAlarm = () => {
    if (alarmPlayer.current && alarmPlayer.current.loaded) {
        alarmPlayer.current.start();
    }
  };


  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        setIsRunning(false);
        playAlarm();
        if (onTimerFinish) {
          onTimerFinish();
        }
       
        setTimeLeft(0);
        setInputValue('');
        
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, timeLeft, onTimerFinish]);


  const handleStart = () => {
    initializeAudio();
    const minutes = parseInt(inputValue, 10);
    if (minutes > 0 && minutes <= 1440) {
      setTimeLeft(minutes * 60);
      setIsRunning(true);
    } else {
        setInputValue(''); 
    }
  };

  const handlePauseResume = () => {
    setIsRunning(prevIsRunning => !prevIsRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setInputValue('');
  };

  return (
    <div className="global-timer">
      {isRunning || timeLeft > 0 ? (
        <>
          <div className="timer-display">{formatTime(timeLeft)}</div>
          <button className="btn btn-secondary" onClick={handlePauseResume}>
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
        </>
      ) : (
        <>
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mins"
            className="form-control"
          />
          <button className="btn btn-primary" onClick={handleStart}>Start Timer</button>
        </>
      )}
    </div>
  );
}

