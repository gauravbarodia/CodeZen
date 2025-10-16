import React from "react";

export default function DailyChallenges({ unsolvedProblemsByRating, userRating }) {
  
 
  const getBucket = (rating) => Math.max(800, Math.floor(rating / 100) * 100);

  const getProblems = (targetRating) => {

    const problems = unsolvedProblemsByRating.get(targetRating) || [];
 
    problems.sort((a, b) => b.contestId - a.contestId);
    return problems.slice(0, 2).map((p) => ({
      name: p.name,
      link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      rating: p.rating,
      code: `${p.contestId}${p.index}`,
    }));
  };

  const bucket = getBucket(userRating);
  const challenges = {
    "Breathwork": getProblems(bucket),
    "Mindful State": getProblems(bucket + 100),
    "Deep Focus": getProblems(bucket + 200),
    "Koan": getProblems(bucket + 300),
  };

  return (
    <div className="component-section">
      <h2>Daily Challenges</h2>
      {Object.entries(challenges).map(([section, probs]) => (
        <div key={section} className="challenge-section">
          <h3>{section}</h3>
          {probs.length > 0 ? (
            <ul className="problem-list">
              {probs.map((p) => (
                <li key={p.code}>
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    {p.code}: {p.name} ({p.rating})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No new problems found in this range. Great job! </p>
          )}
        </div>
      ))}
    </div>
  );
}