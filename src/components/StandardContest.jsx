import React, { useState, useEffect } from "react";

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function StandardContest({ unsolvedProblemsByRating, userRating, onContestStart, onBack }) {
  const [error, setError] = useState('');

  useEffect(() => {
    const generateContest = () => {
      try {
        const baseRating = Math.max(800, Math.floor(userRating / 100) * 100);
        const maxProblemRating = baseRating + 500;
        const ratingSteps = [
          Math.max(800, baseRating - 200), Math.max(800, baseRating),
          baseRating + 100, baseRating + 200, baseRating + 300,
        ];

        let problems = [];
        let excludedCodes = new Set();
        let lastRating = 0;

        const findProblem = (target, prevRating) => {
          let currentRating = Math.max(target, prevRating);
          while(currentRating <= maxProblemRating) {
            const candidates = (unsolvedProblemsByRating.get(currentRating) || []).filter(
              p => !excludedCodes.has(`${p.contestId}${p.index}`)
            );
            if (candidates.length > 0) return getRandomElement(candidates);
            currentRating += 100;
          }
          return null;
        };
        
        for (const targetRating of ratingSteps) {
          const problem = findProblem(targetRating, lastRating);
          if (problem) {
            problems.push(problem);
            excludedCodes.add(`${problem.contestId}${problem.index}`);
            lastRating = problem.rating;
          }
        }
        
        if (problems.length < 5) {
          throw new Error("Could not find enough unique problems. Please solve more problems to expand the pool!");
        }

        onContestStart({
            problems: problems,
            duration: 5400, 
            type: 'Standard'
        });

      } catch (err) {
        setError(err.message);
      }
    };

    generateContest();
  }, []);

  if (error) {
    return (
        <div className="error-message">
            {error}
            <button className="btn btn-secondary" onClick={onBack} style={{marginLeft: '15px'}}>Back</button>
        </div>
    );
  }

  return <div className="loading-message">Generating your contest...</div>;
}