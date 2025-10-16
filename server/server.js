// Import necessary modules
import express from 'express';
import axios from 'axios';
import cors from 'cors';

// --- Basic Server Setup ---
const app = express();
const PORT = 3001; // Port for the backend server

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) to allow requests
// from your React frontend (which runs on a different port).
app.use(cors());

// --- In-Memory Cache for Problemset ---
// This avoids repeatedly fetching the large problemset from the Codeforces API.
let problemsetCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 1000 * 60 * 60; // Cache is valid for 1 hour

// --- API Routes ---

/**
 * @route GET /api/cf/problemset
 * @description Fetches the entire Codeforces problemset.
 * Caches the result for 1 hour to reduce API calls.
 */
app.get('/api/cf/problemset', async (req, res) => {
  const now = Date.now();
  // If a valid cache exists, serve data from the cache.
  if (problemsetCache && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    console.log('Serving problemset from cache.');
    return res.json(problemsetCache);
  }

  try {
    console.log('Fetching fresh problemset from Codeforces API...');
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    
    // Store the new data and update the timestamp.
    problemsetCache = response.data;
    cacheTimestamp = now;
    
    res.json(problemsetCache);
  } catch (error) {
    console.error('Error fetching Codeforces problemset:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch problemset from Codeforces' });
  }
});

/**
 * @route GET /api/cf/user.info
 * @description Proxies requests to the Codeforces user.info endpoint.
 * @query {string} handles - A single Codeforces handle.
 */
app.get('/api/cf/user.info', async (req, res) => {
  const { handles } = req.query;
  if (!handles) {
    return res.status(400).json({ status: 'error', message: 'The "handles" query parameter is required.' });
  }
  
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handles}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user info from Codeforces' });
  }
});

/**
 * @route GET /api/cf/user.status
 * @description Proxies requests to the Codeforces user.status endpoint.
 * @query {string} handle - A single Codeforces handle.
 */
app.get('/api/cf/user.status', async (req, res) => {
  const { handle } = req.query;
  if (!handle) {
    return res.status(400).json({ status: 'error', message: 'The "handle" query parameter is required.' });
  }
  
  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user status:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user status from Codeforces' });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});

