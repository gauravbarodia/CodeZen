import { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY_PREFIX = "cf_user_data_";
const FULL_REFRESH_INTERVAL = 3 * 24 * 60 * 60 * 1000; 

function loadFromLocalStorage(cfHandle) {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + cfHandle);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      ...parsed,
      solvedSet: new Set(parsed.solvedSet),
      unsolvedProblemsByRating: new Map(parsed.unsolvedProblemsByRating),
    };
  } catch (e) {
    console.error("Failed to parse localStorage data", e);
    return null;
  }
}

function saveToLocalStorage(cfHandle, state) {
  try {
    const cacheableState = {
      ...state,
      unsolvedProblemsByRating: Array.from(
        state.unsolvedProblemsByRating.entries()
      ),
      solvedSet: Array.from(state.solvedSet.values()),
      timestamp: Date.now(),
    };

    localStorage.setItem(
      STORAGE_KEY_PREFIX + cfHandle,
      JSON.stringify(cacheableState)
    );
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

function isCacheStale(cachedData) {
  if (!cachedData?.timestamp) return true;
  return Date.now() - cachedData.timestamp > FULL_REFRESH_INTERVAL;
}


export function CodeforcesData(cfHandle) {
  const [unsolvedProblemsByRating, setUnsolvedProblemsByRating] = useState(
    new Map()
  );
  const [userRating, setUserRating] = useState(800);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cfHandle) {
      setIsLoading(false);
      return;
    }

 

    const updateCacheInBackground = async (cachedData) => {
      try {
    
        const userInfoRes = await axios.get(
          `https://codeforces.com/api/user.info?handles=${cfHandle}`
        );

        if (userInfoRes.data.status === "OK") {
          const newRating =
            userInfoRes.data.result[0].rating ||
            cachedData.userRating ||
            800;

          if (newRating !== cachedData.userRating) {
            setUserRating(newRating);
            cachedData.userRating = newRating;
          }
        }

        let from = 1;
        const count = 200;
        let foundOverlap = false;
        let newlySolved = [];

        while (!foundOverlap) {
          const res = await axios.get(
            `https://codeforces.com/api/user.status?handle=${cfHandle}&from=${from}&count=${count}`
          );

          const subs = res.data.result;
          if (!subs.length) break;

          for (const sub of subs) {
            if (sub.verdict !== "OK") continue;

            const pid = `${sub.problem.contestId}${sub.problem.index}`;
            if (cachedData.solvedSet.has(pid)) {
              foundOverlap = true;
              break;
            }
            newlySolved.push(sub);
          }

          if (!foundOverlap) from += count;
        }

        if (!newlySolved.length) {
          saveToLocalStorage(cfHandle, cachedData);
          return;
        }

        const newSolvedSet = new Set(cachedData.solvedSet);
        const newMap = new Map(cachedData.unsolvedProblemsByRating);

        newlySolved.forEach((sub) => {
          const pid = `${sub.problem.contestId}${sub.problem.index}`;
          const rating = sub.problem.rating;

          newSolvedSet.add(pid);
          if (rating && newMap.has(rating)) {
            const filtered = newMap
              .get(rating)
              .filter((p) => `${p.contestId}${p.index}` !== pid);

            filtered.length
              ? newMap.set(rating, filtered)
              : newMap.delete(rating);
          }
        });

        setUnsolvedProblemsByRating(newMap);
        saveToLocalStorage(cfHandle, {
          ...cachedData,
          solvedSet: newSolvedSet,
          unsolvedProblemsByRating: newMap,
        });
      } catch (e) {
        console.error("Background update failed", e);
      }
    };



    const loadData = async () => {
      setIsLoading(true);
      setError("");

      const cached = loadFromLocalStorage(cfHandle);

      if (cached && !isCacheStale(cached)) {
      
        setUserRating(cached.userRating);
        setUnsolvedProblemsByRating(cached.unsolvedProblemsByRating);
        setAllTags(cached.allTags);
        setIsLoading(false);

        updateCacheInBackground(cached);
        return;
      }

      console.log(
        cached
          ? "Cache stale (>3 days). Performing full refresh..."
          : "No cache found. Performing full refresh..."
      );

      try {
        const [
          problemsetRes,
          contestListRes,
          userInfoRes,
          userStatusRes,
        ] = await Promise.all([
          axios.get("https://codeforces.com/api/problemset.problems"),
          axios.get("https://codeforces.com/api/contest.list"),
          axios.get(
            `https://codeforces.com/api/user.info?handles=${cfHandle}`
          ),
          axios.get(
            `https://codeforces.com/api/user.status?handle=${cfHandle}`
          ),
        ]);

        if (userInfoRes.data.status === "FAILED") {
          throw new Error(userInfoRes.data.comment);
        }

        const rating = userInfoRes.data.result[0].rating || 800;

        const exclusionKeywords = [
          "kotlin heroes",
          "olympiad in informatics",
          "european championship",
          "asia pacific championship",
          "VK Cup 2022 - Квалификация",
        ];

        const excludedContestIds = new Set(
          contestListRes.data.result
            .filter((c) =>
              exclusionKeywords.some((k) =>
                c.name.toLowerCase().includes(k)
              )
            )
            .map((c) => c.id)
        );

        const solvedSet = new Set(
          userStatusRes.data.result
            .filter((s) => s.verdict === "OK")
            .map(
              (s) => `${s.problem.contestId}${s.problem.index}`
            )
        );

        const unsolvedMap = new Map();
        for (const p of problemsetRes.data.result.problems) {
          const pid = `${p.contestId}${p.index}`;
          if (
            p.rating &&
            !solvedSet.has(pid) &&
            !excludedContestIds.has(p.contestId)
          ) {
            if (!unsolvedMap.has(p.rating))
              unsolvedMap.set(p.rating, []);
            unsolvedMap.get(p.rating).push(p);
          }
        }

        const hardcodedTags = [
          "implementation",
          "dp",
          "math",
          "greedy",
          "data structures",
          "brute force",
          "constructive algorithms",
          "dfs and similar",
          "binary search",
          "graphs",
          "trees",
          "strings",
          "number theory",
          "combinatorics",
          "geometry",
          "bitmasks",
          "two pointers",
          "dsu",
          "hashing",
          "probabilities",
          "shortest paths",
          "divide and conquer",
          "games",
          "flows",
          "matrices",
        ];

        setUserRating(rating);
        setUnsolvedProblemsByRating(unsolvedMap);
        setAllTags(hardcodedTags);

        saveToLocalStorage(cfHandle, {
          userRating: rating,
          unsolvedProblemsByRating: unsolvedMap,
          allTags: hardcodedTags,
          solvedSet,
        });
      } catch (e) {
        setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cfHandle]);

  return {
    userRating,
    unsolvedProblemsByRating,
    allTags,
    isLoading,
    error,
  };
}
