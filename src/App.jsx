// src/App.jsx
import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";


// Component Imports
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
import Help from "./pages/Help";
import About from "./pages/About";
import Packages from "./components/Packages";
import ViewPackage from "./components/ViewPackage";
import Dream from "./components/Dream";
import SmartItinerary from "./components/SmartItinerary";

// PROTECTED ROUTE
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return <Navigate to="/signup" replace />;
  return children;
}

const transitionVariant = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.6, ease: "easeInOut" },
};

export default function App() {
  const [showSignup, setShowSignup] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* 👇 NAVBAR MUST BE HERE */}
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div {...transitionVariant}>
                <Home openSignup={() => setShowSignup(true)} />
              </motion.div>
            }
          />

          <Route path="/results" element={<motion.div {...transitionVariant}><Results /></motion.div>} />

          <Route
            path="/packages"
            element={
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Packages />
              </motion.div>
            }
          />

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
          <Route path="/about" element={<About />} />
          <Route path="/view/:id" element={<ViewPackage />} />
          <Route path="/help" element={<Help />} />

          <Route
            path="/subscribe"
            element={
              <ProtectedRoute>
                <SubscribeModal />
              </ProtectedRoute>
            }
          />

          <Route path="/mood-trip" element={<MoodTripPlanner />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dream" element={<Dream />} />
          <Route path="/smart-itinerary" element={<SmartItinerary />} />
        </Routes>
      </AnimatePresence>

      {/* Floating Signup Button */}
      <button
        onClick={() => setShowSignup(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          padding: "12px 16px",
          borderRadius: 12,
          background: "linear-gradient(90deg,#40E0D0,#FFA62B)",
          border: "none",
          cursor: "pointer",
          zIndex: 100,
        }}
      >
        Sign Up
      </button>

      {showSignup && (
        <Signup
          open={showSignup}
          onClose={() => setShowSignup(false)}
          defaultMode="signup"
        />
      )}
    </>
  );
}
