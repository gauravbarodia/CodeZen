import { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY_PREFIX = "cf_user_data_";


function loadFromLocalStorage(cfHandle) {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + cfHandle);
    if (!data) return null;
    const parsed = JSON.parse(data);
    
    const cacheTime = parsed.timestamp || 0;
    if (Date.now() - cacheTime > 24 * 60 * 60 * 1000) {
        console.log("Cache is older than 24 hours. Triggering a full refresh.");
        return null;
    }

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
      unsolvedProblemsByRating: Array.from(state.unsolvedProblemsByRating.entries()),
      solvedSet: Array.from(state.solvedSet.values()),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PREFIX + cfHandle, JSON.stringify(cacheableState));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}



export function useCodeforcesData(cfHandle) {
  const [unsolvedProblemsByRating, setUnsolvedProblemsByRating] = useState(new Map());
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
        console.log("Starting background cache update...");
        try {

            const userInfoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${cfHandle}`);
            if (userInfoRes.data.status === "FAILED") {
                console.error("Background rating update failed:", userInfoRes.data.comment);
              
            } else {
                const newRating = userInfoRes.data.result[0].rating || cachedData.userRating || 800;
                if (newRating !== cachedData.userRating) {
                    console.log(`Rating updated: ${cachedData.userRating} -> ${newRating}`);
                    setUserRating(newRating); 
                    cachedData.userRating = newRating;
                }
            }

 
            let from = 1;
            const count = 50;
            let newlySolvedProblems = [];
            let foundOverlap = false;

            while (!foundOverlap) {
                const res = await axios.get(`https://codeforces.com/api/user.status?handle=${cfHandle}&from=${from}&count=${count}`);
                const submissions = res.data.result;
                if (submissions.length === 0) break;

                for (const sub of submissions) {
                    const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                    if (sub.verdict === "OK") {
                        if (cachedData.solvedSet.has(problemId)) {
                            foundOverlap = true;
                            break;
                        }
                        if (!newlySolvedProblems.find(p => `${p.problem.contestId}${p.problem.index}` === problemId)) {
                            newlySolvedProblems.push(sub);
                        }
                    }
                }
                if (!foundOverlap) from += count;
            }

            if (newlySolvedProblems.length > 0) {
                console.log(`Found ${newlySolvedProblems.length} new solved problems. Updating cache.`);
                const newUnsolvedMap = new Map(cachedData.unsolvedProblemsByRating);
                const newSolvedSet = new Set(cachedData.solvedSet);

                newlySolvedProblems.forEach(sub => {
                    const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                    const rating = sub.problem.rating;
                    newSolvedSet.add(problemId);

                    if (rating && newUnsolvedMap.has(rating)) {
                        const updatedProblems = newUnsolvedMap.get(rating).filter(p => `${p.contestId}${p.index}` !== problemId);
                        if (updatedProblems.length > 0) {
                            newUnsolvedMap.set(rating, updatedProblems);
                        } else {
                            newUnsolvedMap.delete(rating);
                        }
                    }
                });

                setUnsolvedProblemsByRating(newUnsolvedMap); 
                saveToLocalStorage(cfHandle, { ...cachedData, solvedSet: newSolvedSet, unsolvedProblemsByRating: newUnsolvedMap });
            } else {
                console.log("Cache is up to date.");
                
                saveToLocalStorage(cfHandle, cachedData);
            }
        } catch (err) {
            console.error("Background cache update failed:", err);
        }
    };


    const loadData = async () => {
      setIsLoading(true);
      setError("");

      const cached = loadFromLocalStorage(cfHandle);
      if (cached) {
        setUserRating(cached.userRating);
        setUnsolvedProblemsByRating(cached.unsolvedProblemsByRating);
        setAllTags(cached.allTags);
        setIsLoading(false);
        updateCacheInBackground(cached); 
        return;
      }

      console.log("No valid cache found. Performing a full data fetch...");
      try {
        const [problemsetRes, contestListRes, userInfoRes, userStatusRes] =
          await Promise.all([
            axios.get("https://codeforces.com/api/problemset.problems"),
            axios.get("https://codeforces.com/api/contest.list"),
            axios.get(`https://codeforces.com/api/user.info?handles=${cfHandle}`),
            axios.get(`https://codeforces.com/api/user.status?handle=${cfHandle}`),
          ]);

        if (userInfoRes.data.status === "FAILED") throw new Error(userInfoRes.data.comment);

        const rating = userInfoRes.data.result[0].rating || 800;
   
        const exclusionKeywords = [
            'kotlin heroes',
            'olympiad in informatics',
            'european championship',
            'asia pacific championship'
        ];

     
        const excludedContestIds = new Set(
          contestListRes.data.result
            .filter(c => {
                const contestNameLower = c.name.toLowerCase();
                return exclusionKeywords.some(keyword => contestNameLower.includes(keyword));
            })
            .map(c => c.id)
        );
       

        const solvedSet = new Set(
          userStatusRes.data.result
            .filter((sub) => sub.verdict === "OK")
            .map((sub) => `${sub.problem.contestId}${sub.problem.index}`)
        );

        const allProblems = problemsetRes.data.result.problems;
        const unsolvedMap = new Map();
        for (const p of allProblems) {
          const isUnsolved = !solvedSet.has(`${p.contestId}${p.index}`);
          
          const isNotExcluded = !excludedContestIds.has(p.contestId);
          
          if (p.rating && isUnsolved && isNotExcluded) {
            if (!unsolvedMap.has(p.rating)) unsolvedMap.set(p.rating, []);
            unsolvedMap.get(p.rating).push(p);
          }
          
        }
        
        const hardcodedTags = ["implementation", "dp", "math", "greedy", "data structures", "brute force", "constructive algorithms", "dfs and similar", "sortings", "binary search", "graphs", "trees", "strings", "number theory", "combinatorics", "geometry", "bitmasks", "two pointers", "dsu", "hashing", "probabilities", "shortest paths", "divide and conquer", "games", "flows", "matrices"];
        
        setUserRating(rating);
        setUnsolvedProblemsByRating(unsolvedMap);
        setAllTags(hardcodedTags);

        saveToLocalStorage(cfHandle, {
          userRating: rating,
          unsolvedProblemsByRating: unsolvedMap,
          allTags: hardcodedTags,
          solvedSet: solvedSet,
        });
      } catch (err) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cfHandle]);

  return { userRating, unsolvedProblemsByRating, allTags, isLoading, error };
}
