import React, { useState } from "react";

export default function CustomContest({
  unsolvedProblemsByRating,
  allTags,
  onContestStart,
  onBack,
}) {
  const [error, setError] = useState("");
  const [customConfig, setCustomConfig] = useState({
    minRating: 800,
    maxRating: 3500,
    Tag: "",
    duration: 120,
  });
  const [showTags, setShowTags] = useState(false);

  const generateAndStart = () => {
    setError("");
    try {
      const { minRating, maxRating, Tag, duration } = customConfig;
      if (minRating > maxRating) {
        throw new Error("Min rating cannot be greater than max rating.");
      }
      if (!duration || duration <= 0) {
        throw new Error("Contest duration must be greater than 0.");
      }

      const searchTag = Tag.toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      let problems = [];

      for (let r = minRating; r <= maxRating; r += 100) {
        let candidates = unsolvedProblemsByRating.get(r) || [];
        if (searchTag.length > 0) {
          candidates = candidates.filter(
            (p) =>
              p.tags && searchTag.some((topic) => p.tags.includes(topic))
          );
        }
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.contestId - a.contestId);
          problems.push(candidates[0]);
        }
      }

      if (problems.length === 0) {
        throw new Error(
          "No unsolved problems found with the selected criteria."
        );
      }

      onContestStart({
        problems: problems,
        duration: duration * 60,
        type: "Custom",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTagClick = (tag) => {
    const currentTag = customConfig.Tag.toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const TagSet = new Set(currentTag);

    let newTagArray;
    if (TagSet.has(tag)) {
      newTagArray = currentTag.filter((t) => t !== tag);
    } else {
      newTagArray = [...currentTag, tag];
    }

    setCustomConfig((prev) => ({ ...prev, Tag: newTagArray.join(", ") }));
  };

  const selectedTag = new Set(
    customConfig.Tag.toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );

  return (
    <div className="component-section">
      <h2>Create Contest</h2>
      <div className="form-group">
        <label>
          Min Rating:
          <input
            type="number"
            step="100"
            min="800"
            max="3500"
            value={customConfig.minRating}
            onChange={(e) =>
              setCustomConfig({
                ...customConfig,
                minRating: parseInt(e.target.value, 10),
              })
            }
            className="form-control"
          />
        </label>
        <label>
          Max Rating:
          <input
            type="number"
            step="100"
            min="800"
            max="3500"
            value={customConfig.maxRating}
            onChange={(e) =>
              setCustomConfig({
                ...customConfig,
                maxRating: parseInt(e.target.value, 10),
              })
            }
            className="form-control"
          />
        </label>
        <label>
          Duration (mins):
          <input
            type="number"
            step="15"
            min="10"
            value={customConfig.duration}
            onChange={(e) =>
              setCustomConfig({
                ...customConfig,
                duration: parseInt(e.target.value, 10),
              })
            }
            className="form-control"
          />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Tag(s):
          <input
            type="text"
            placeholder="Enter or select Tag"
            value={customConfig.Tag}
            onChange={(e) =>
              setCustomConfig({ ...customConfig, Tag: e.target.value })
            }
            className="form-control"
          />
        </label>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => setShowTags(!showTags)}
        >
          {showTags ? "Hide Tags" : "Show All Tags"}
        </button>
        <button className="btn btn-primary" onClick={generateAndStart}>
          Start
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="tag-container">
        {showTags && (
          <div className="tag-box">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${
                  selectedTag.has(tag) ? "selected" : ""
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}