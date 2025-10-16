import React, { useState, useEffect } from "react";
import { CodeforcesData } from "./hooks/CodeforcesData";
import WelcomeForm from "./components/WelcomeForm";
import DailyChallenges from "./components/DailyChallenges";
import TagSearch from "./components/TagSearch";
import Contest from "./components/Contest";
import ContestView from "./components/ContestView";
import Timer from "./components/Timer";
import TimerFinishedView from "./components/TimerFinishedView"; 
import "./App.css";

export default function App() {
  const [cfHandle, setCfHandle] = useState("");
  const { userRating, unsolvedProblemsByRating, allTags, isLoading, error } =
    CodeforcesData(cfHandle);
  const [activeContest, setActiveContest] = useState(null);
  const [isTimerFinished, setIsTimerFinished] = useState(false); 

  useEffect(() => {
    const savedHandle = localStorage.getItem("cfHandle");
    if (savedHandle) {
      setCfHandle(savedHandle);
    }
  }, []);

  const handleLogin = (handle) => {
    localStorage.setItem("cfHandle", handle);
    setCfHandle(handle);
  };

  const handleLogout = () => {
    localStorage.removeItem("cfHandle");
    setCfHandle("");
  };

  const handleContestStart = (contestData) => {
    setActiveContest(contestData);
  };

  const handleContestFinish = () => {
    setActiveContest(null);
  };


  const handleTimerFinish = () => {
    setIsTimerFinished(true); 
  };


  const handleCloseTimerView = () => {
    setIsTimerFinished(false);
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>CodeZen 🧘</h1>
       
        {cfHandle && <Timer onTimerFinish={handleTimerFinish} />}
        {cfHandle && (
          <div className="user-info">
            <span>
              <strong>{cfHandle}</strong>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Change Handle
            </button>
          </div>
        )}
      </header>

     
      {isTimerFinished ? (
        <TimerFinishedView onClose={handleCloseTimerView} />
      ) : activeContest ? (
        <ContestView
          contestData={activeContest}
          onContestFinish={handleContestFinish}
        />
      ) : (
        <main>
          {cfHandle ? (
            <>
              {isLoading && (
                <div className="loading-bar">
                  Loading all data for {cfHandle}...
                </div>
              )}
              {error && <div className="error-message main-error">{error}</div>}
              {!isLoading && !error && (
                <div className="grid-container">
                  <div className="grid-item card">
                    <DailyChallenges
                      unsolvedProblemsByRating={unsolvedProblemsByRating}
                      userRating={userRating}
                    />
                  </div>
                  <div className="grid-item card">
                    <TagSearch
                      unsolvedProblemsByRating={unsolvedProblemsByRating}
                      allTags={allTags}
                    />
                  </div>
                  <div className="grid-item card">
                    <Contest
                      unsolvedProblemsByRating={unsolvedProblemsByRating}
                      userRating={userRating}
                      allTags={allTags}
                      onContestStart={handleContestStart}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
             
              <WelcomeForm onLogin={handleLogin} />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
