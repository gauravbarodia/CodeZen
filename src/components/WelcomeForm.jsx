import React, { useState } from "react";
import axios from "axios";

export default function WelcomeForm({ onLogin }) {
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle.trim()}`
      );

      if (res.data.status === "OK") {
        onLogin(handle.trim());
      } else {
        setError(res.data.comment || "Invalid handle provided.");
      }
    } catch (err) {
      console.error("Error validating handle:", err);
      setError("Could not connect to Codeforces. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setHandle(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (

    <div className="container"> 
      <div className="card welcome-form">
      
        <h2>Codeforces Handle</h2> 
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={handle}
            onChange={handleChange}
            required
            className="form-control"
            style={{ flexGrow: 1 }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner-light"></div> : "Go"}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}