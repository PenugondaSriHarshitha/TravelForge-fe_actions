// src/components/SmartItinerary.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./SmartItinerary.css";

export default function SmartItinerary() {
  const [days, setDays] = useState(4);
  const [itinerary, setItinerary] = useState(null);

  const generateItinerary = () => {
    const list = [];
    const spots = [
      "Ancient Temple",
      "Sunset Viewpoint",
      "Local Market",
      "Mountain Trail",
      "Beach Walk",
      "Skyline Observatory",
      "Old Town Square",
      "Hidden Waterfall",
      "Coastal Lighthouse",
    ];

    for (let d = 1; d <= days; d++) {
      list.push({
        day: d,
        morning: spots[Math.floor(Math.random() * spots.length)],
        afternoon: spots[Math.floor(Math.random() * spots.length)],
        evening: spots[Math.floor(Math.random() * spots.length)],
      });
    }

    setItinerary(list);
  };

  return (
    <div className="itx-root">
      {/* 🌌 Floating background animation */}
      <div className="itx-bg-gradient"></div>
      <div className="itx-stars"></div>

      {/* 🚀 HERO */}
      <motion.div
        className="itx-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="itx-title">🧭 Smart Itinerary</h1>
        <p className="itx-sub">AI-generated days, routes & curated adventures.</p>

        <motion.div
          className="itx-floating-icon"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✨
        </motion.div>
      </motion.div>

      {/* ⚙️ INPUT PANEL */}
      <motion.div
        className="itx-panel glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <label>How many days is your trip?</label>

        <input
          type="number"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        />

        <motion.button
          className="itx-btn"
          onClick={generateItinerary}
          whileHover={{ scale: 1.04 }}
        >
          Generate Plan ✨
        </motion.button>
      </motion.div>

      {/* 📅 RESULTS */}
      {itinerary && (
        <motion.div
          className="itx-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="itx-section-title">Your Personalized Adventure</h2>

          {itinerary.map((d) => (
            <motion.div
              key={d.day}
              className="itx-day-card glass"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="itx-day-header">Day {d.day}</div>

              <div className="itx-timeline">
                <div className="itx-node">
                  <div className="itx-node-dot"></div>
                  <span>🌅 Morning</span>
                  <p>{d.morning}</p>
                </div>

                <div className="itx-node">
                  <div className="itx-node-dot"></div>
                  <span>🏙 Afternoon</span>
                  <p>{d.afternoon}</p>
                </div>

                <div className="itx-node">
                  <div className="itx-node-dot"></div>
                  <span>🌆 Evening</span>
                  <p>{d.evening}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 💡 AI Tips */}
      <motion.div
        className="itx-tips glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3>✨ AI Travel Tips</h3>
        <ul>
          <li>Mornings are best for long-distance trips.</li>
          <li>Afternoons are perfect for food & culture.</li>
          <li>Evenings work great for scenic points & sunsets.</li>
        </ul>
      </motion.div>
    </div>
  );
}
