import React, { useState } from 'react';
import StandardContest from './StandardContest';
import CustomContest from './CustomContest';

export default function Contest({ unsolvedProblemsByRating, userRating, allTags, onContestStart }) {
  const [activeContest, setActiveContest] = useState('idle');

  if (activeContest === 'standard') {
    return (
      <StandardContest
        unsolvedProblemsByRating={unsolvedProblemsByRating}
        userRating={userRating}
        onContestStart={onContestStart}
        onBack={() => setActiveContest('idle')}
      />
    );
  }

  if (activeContest === 'custom') {
    return (
      <CustomContest
        unsolvedProblemsByRating={unsolvedProblemsByRating}
        allTags={allTags}
        onContestStart={onContestStart}
        onBack={() => setActiveContest('idle')}
      />
    );
  }

  return (
    <div className="component-section">
      <h2 className="form-label-large text-gold">Contest Mode</h2>
     
      <div className="action-buttons">
        <button
          className="btn btn-primary text-gold"
          onClick={() => setActiveContest('standard')}
        >
          Start Standard Contest
        </button>
        <button
          className="btn btn-primary text-gold"
          onClick={() => setActiveContest('custom')}
        >
          Create Custom Contest
        </button>
      </div>
    </div>
  );
}
