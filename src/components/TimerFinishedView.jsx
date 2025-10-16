import React from 'react';

export default function TimerFinishedView({ onClose }) {
  const quote = "It is important to draw wisdom from many different places. If you take it from only one place, it becomes rigid and stale. Understanding others, the other elements and the other nations will help you become whole.";
  
  const adviceMessage = "If you were stuck on a problem, now is a great time to review the solution. See what you missed, learn a new method, and expand your skills.";

  return (
    <div className="contest-overlay">
      <div className="contest-view-content">
        <div className="contest-finished">
          <h2>Time's Up!</h2>
          <p>{adviceMessage}</p>
          
          <blockquote className="contest-quote">
            "{quote}"
            <footer>— Uncle Iroh</footer>
          </blockquote>

          <button className="btn btn-primary" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
