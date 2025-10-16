import React, { useState, useEffect, useRef } from "react";
import * as Tone from 'tone';

import alarmSound from '../assets/sound.mp3';

const quotes = [
  "Sometimes life is like this dark tunnel. You can't always see the light at the end of the tunnel, but if you just keep moving... you will come to a better place.",
  "When you're in your darkest place, you give yourself hope and that's inner strength.",
  "In the darkest times, hope is something you give yourself. That is the meaning of inner strength.",
  "Failure is only the opportunity to begin again. Only this time, more wisely.",
  "Good times become good memories, but bad times become good lessons.",
  "You will find that if you look for the light, you can often find it. but if you look for the dark, that is all you will ever see.",
  "Sometimes the best way to solve your own problems is to help someone else.",
  "Life happens wherever you are, whether you make it or not.",
  "Perfection and power are overrated. I think you were very wise to choose happiness and love instead.",
  "You must never give in to despair. Allow yourself to slip down that road and you surrender to your lowest instincts.",
  "There is nothing wrong with a life of peace and prosperity.",
  "The best tea tastes delicious whether it comes in a porcelain pot or a tin cup.",
  "Many things that seem threatening in the dark become welcoming when we shine light on them.",
  "Even in the material world, you will find that if you look for the light, you can often find it.",
  "There's nothing wrong with letting the people who love you help you.",
  "While it is always best to believe in oneself, a little help from others can be a great blessing.",
  "The wise man lets go of all results, whether good or bad, and is focused on the action alone.",
  "Protection and power are overrated. I think you were very wise to choose happiness and love.",
  "A man needs his rest.",
  "You must look within yourself to save yourself from your other self. Only then will your true self reveal itself.",
  "Destiny is a funny thing. You never know how things are going to work out.",
  "You are not the man you used to be. You are stronger and wiser and freer than you ever used to be.",
  "Life is like tea: if it is bitter, no amount of sugar can make it sweet. But if it is sweet, even the smallest amount makes it sweeter.",
  "Years of hard work and training have brought you to this moment. It is not luck.",
  "The only time you should be looking down on someone is when you're helping them up.",
  "I'd rather live like there's no tomorrow than live like there's no today.",
  

];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];


const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function ContestView({ contestData, onContestFinish }) {
  const { problems, duration, type } = contestData;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFinished, setIsFinished] = useState(false);
  const [finishReason, setFinishReason] = useState("");
 
  const [quote] = useState(getRandomQuote());

  const alarmPlayer = useRef(null);
  const isAudioInitialized = useRef(false);

 
  const initializeAudio = async () => {
    if (isAudioInitialized.current) return;
    try {
        await Tone.start();
        alarmPlayer.current = new Tone.Player(alarmSound).toDestination();
        await Tone.loaded();
        isAudioInitialized.current = true;
        console.log("Contest Audio Context Initialized");
    } catch (e) {
        console.error("Could not start contest audio", e);
    }
  };


  const playAlarm = () => {
    if (alarmPlayer.current && alarmPlayer.current.loaded) {
      alarmPlayer.current.start();
    }
  };
  
 
  useEffect(() => {
    
    initializeAudio();
  }, []); 

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      playAlarm();
      setIsFinished(true);
      setFinishReason("Time's Up!");
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isFinished]);

  const handleEndContest = () => {
    setIsFinished(true);
    setFinishReason("Contest Finished!");
  };

  return (
    <div className="contest-overlay">
      <div className="contest-view-content">
        {!isFinished ? (
          <>
            <h2>Contest in Progress</h2>
            <div className="timer-large" style={{ color: timeLeft < 300 ? "#dc3545" : "#ffc107" }}>
              {formatTime(timeLeft)}
            </div>
            <table className="contest-problem-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Problems</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, index) => (
                  <tr key={`${p.contestId}${p.index}`}>
                    <td>{String.fromCharCode(65 + index)}</td>
                    <td>
                      <a href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`} target="_blank" rel="noopener noreferrer">
                        {p.name}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={handleEndContest}>
              End Contest
            </button>
          </>
        ) : (
          <div className="contest-finished">
            <h2>{finishReason}</h2>
            <p>Thank you for participating!</p>
          
            <blockquote className="contest-quote">
              "{quote}"
              <footer>— Uncle Iroh</footer>
            </blockquote>
            <button className="btn btn-primary" onClick={onContestFinish}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


