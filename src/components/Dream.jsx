// src/components/Dream.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dream.css";

export default function Dream() {
  const navigate = useNavigate();

  return (
    <div className="dream-root">
      {/* Title */}
      <div className="dream-header">
        <h1>✨ Your Future Trip Starts Here</h1>
        <p className="dream-sub">
          I am your <strong>AI Journey Architect</strong>.  
          Let's craft something extraordinary.
        </p>
      </div>

      {/* Features Grid */}
      <div className="dream-grid">

        {/* AI Mood Planner */}
        <div className="dream-card">
          <div className="dream-icon">🤖</div>

          <h2>AI Mood Planner</h2>
          <p>Tell me how you feel — I’ll choose the destination.</p>

          <button 
            className="dream-open-btn"
            onClick={() => navigate("/mood-trip")}
          >
            Open →
          </button>
        </div>

        {/* Budget Optimizer */}
        <div className="dream-card">
          <div className="dream-icon">💸</div>

          <h2>Budget Optimizer</h2>
          <p>Let me build the perfect trip within your budget.</p>

          <button 
            className="dream-open-btn"
            onClick={() => navigate("/budget")}
          >
            Open →
          </button>
        </div>

        {/* Hidden Worlds */}
        <div className="dream-card">
          <div className="dream-icon">🗺️</div>

          <h2>Hidden Worlds</h2>
          <p>Discover secret locations no human recommends.</p>

          <button 
            className="dream-open-btn"
            onClick={() => navigate("/hidden-gems")}
          >
            Open →
          </button>
        </div>

        {/* Smart Itinerary */}
        <div className="dream-card">
          <div className="dream-icon">🧭</div>

          <h2>Smart Itinerary</h2>
          <p>AI-generated days, routes & experiences.</p>

          <button 
            className="dream-open-btn"
            onClick={() => navigate("/smart-itinerary")}

          >
            Open →
          </button>
        </div>

      </div>
    </div>
  );
}
