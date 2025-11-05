// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Results from "./components/Results";
import Signup from "./components/Signup";
import Booking from "./components/Booking";
import Explore from "./components/Explore";
import BestTimeToTravel from "./components/BestTimeToTravel";
import HiddenGems from "./components/HiddenGems";
import Trips from "./components/Trips";
import BudgetPlanner from "./components/BudgetPlanner";
import LocalGuides from "./components/LocalGuides";
import AmazingAdventure from "./components/AmazingAdventure";
import SunsetEscapes from "./components/SunsetEscapes";
import Checklist from "./components/Checklist";
import CityAndSea from "./components/CityAndSea";
import SubscribeModal from "./components/SubscribeModal";
import MoodTripPlanner from "./components/MoodTripPlanner";
import Saved from "./components/Saved";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";

// ✅ Correct ProtectedRoute using "currentUser"
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Please login or signup to continue.");
    return <Navigate to="/signup" replace />;
  }
  return children;
}

export default function App() {
  const [showSignup, setShowSignup] = useState(false);

  const handleSignupSubmit = (data) => {
    console.log("Signup data:", data);
    alert(`Thanks, ${data.name || data.email}! (signup simulated)`);
  };

  return (
    <>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<Home openSignup={() => setShowSignup(true)} />} />
        <Route path="/results" element={<Results />} />
        <Route path="/explore/:id" element={<Explore />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/best-time" element={<BestTimeToTravel />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/hidden-gems" element={<HiddenGems />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/local-guides" element={<LocalGuides />} />
        <Route path="/amazing-adventure" element={<AmazingAdventure />} />
        <Route path="/sunset-escapes" element={<SunsetEscapes />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/city-and-sea" element={<CityAndSea />} />

        {/* ✅ Protected FULL PAGE Subscribe Route */}
        <Route
          path="/subscribe"
          element={
            <ProtectedRoute>
              <SubscribeModal />   {/* ✅ No modal props, loads as full page */}
            </ProtectedRoute>
          }
        />

        <Route path="/mood-trip" element={<MoodTripPlanner />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      {/* Floating signup button */}
      <button
        aria-label="Open sign up"
        onClick={() => setShowSignup(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(90deg,#40E0D0,#FFA62B)",
          color: "#00251f",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(64,224,208,0.12)",
          zIndex: 60,
        }}
      >
        Sign Up
      </button>

      {/* Signup modal */}
      {typeof Signup === "function" ? (
        <Signup
          open={showSignup}
          onClose={() => setShowSignup(false)}
          onSubmit={handleSignupSubmit}
          defaultMode="signup"
        />
      ) : null}
    </>
  );
}
