import React, { useState } from "react";
export default function Tagsearch({ unsolvedProblemsByRating, allTags }) {
  const [searchInput, setSearchInput] = useState("");
  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(3500);
  const [searchResults, setSearchResults] = useState(null);
  const [showTags, setShowTags] = useState(false);

  const handleSearch = () => {
 
  setShowTags(false);

  if (!searchInput.trim()) {
    let results = [];

    for (let r = minRating; r <= maxRating; r += 100) {
      const problemsAtRating = unsolvedProblemsByRating.get(r) || [];
      results.push(...problemsAtRating);
    }
    results.sort((a, b) => a.rating - b.rating);

    setSearchResults(results);
    return;
  }

  const searchTags = searchInput
    .toLowerCase()
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let results = [];

  for (let r = minRating; r <= maxRating; r += 100) {
    const problemsAtRating = unsolvedProblemsByRating.get(r) || [];

    for (const p of problemsAtRating) {
      const hasTopic =
        p.tags && searchTags.some((topic) => p.tags.includes(topic));

      if (hasTopic) {
        results.push(p);
      }
    }
  }

  results.sort((a, b) => b.contestId - a.contestId);
  setSearchResults(results);
};

  const handleTagClick = (tag) => {
    const currentTags = searchInput
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const TagsSet = new Set(currentTags);

    let newTagsArray;
    if (TagsSet.has(tag)) {
      newTagsArray = currentTags.filter((t) => t !== tag);
    } else {
      newTagsArray = [...currentTags, tag];
    }

    setSearchInput(newTagsArray.join(", "));
  };

  const selectedTags = new Set(
    searchInput
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );

  return (
    <div className="component-section">
      <h2>Tag Search</h2>
      <div className="form-group">
        <label style={{ gridColumn: "1 / -1" }}>
          Tag(s):
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g., dp, graphs"
            className="form-control"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </label>
        <label>
          Min Rating:
          <input
            type="number"
            step="100"
            value={minRating}
            onChange={(e) => setMinRating(parseInt(e.target.value, 10) )}
            className="form-control"
          />
        </label>
        <label>
          Max Rating:
          <input
            type="number"
            step="100"
            value={maxRating}
            onChange={(e) => setMaxRating(parseInt(e.target.value, 10) )}
            className="form-control"
          />
        </label>
      </div>

      <div className="action-buttons">
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowTags(!showTags)}
        >
          {showTags ? "Hide Tags" : "Show All Tags"}
        </button>
      </div>

      {showTags && (
        <div className="tag-container">
          <div className="tag-box">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${
                  selectedTags.has(tag) ? "selected" : ""
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {searchResults && (
        <div className="search-results" style={{ marginTop: "20px" }}>
          <h4>{searchResults.length} problems found</h4>
          {searchResults.length > 0 ? (
            <ul className="problem-list">
              {searchResults.slice(0, 15).map((p) => (
                <li key={`${p.contestId}${p.index}`}>
                  <a
                    href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {p.name} ({p.rating})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="error-message">
              No unsolved problems found with these criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}