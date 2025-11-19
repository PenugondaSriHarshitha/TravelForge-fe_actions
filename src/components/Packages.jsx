// src/components/Packages.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Packages.css";

// 🌄 IMAGES — your imported assets
import Santorini from "../images/Santorini.png";
import Kyoto from "../images/Kyoto.png";
import Lisbon from "../images/Lisbon.png";
import Beaches from "../images/beaches.png";
import Resorts from "../images/Resorts.png";
import Bali from "../images/Bali.png";
import Dubai from "../images/Dubai.png";
import Swiss from "../images/Swiss.png";
import Paris from "../images/Paris.png";
import Singapore from "../images/Singapore.png";

export default function Packages() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🧳 Packages Data
  const packages = [
    {
      id: "pkg1",
      title: "Greek Islands – Santorini",
      nights: 3,
      price: "₹32,000",
      rating: 4.8,
      img: Santorini,
      tags: ["romantic", "friends", "family"],
      highlights: [
        "Relax on breathtaking beaches",
        "Scenic drives along the coast",
        "Savor local cuisine and wines",
      ],
      metrics: { family: 85, kids: 60, friends: 95 },
      offer: "6 Days Left for 25% Discount!",
      weather: "25°C ☀️",
    },
    {
      id: "pkg2",
      title: "Kyoto Cultural Escape",
      nights: 5,
      price: "₹45,000",
      rating: 4.7,
      img: Kyoto,
      tags: ["culture", "solo", "family"],
      highlights: [
        "Temple walks & cherry blossoms",
        "Traditional tea ceremonies",
        "Authentic ryokan stay experience",
      ],
      metrics: { family: 80, kids: 50, friends: 70 },
      offer: "Early Bird Deal — Save ₹3000",
      weather: "18°C 🌸",
    },
    {
      id: "pkg3",
      title: "Lisbon Coastal Adventure",
      nights: 4,
      price: "₹39,000",
      rating: 4.6,
      img: Lisbon,
      tags: ["friends", "adventure", "romantic"],
      highlights: [
        "Historic tram rides",
        "Atlantic cliff views",
        "Portuguese tapas tour",
      ],
      metrics: { family: 70, kids: 40, friends: 90 },
      offer: "3 Days Left for 20% Off!",
      weather: "22°C 🌤️",
    },
    {
      id: "pkg4",
      title: "Maldives Beach Retreat",
      nights: 5,
      price: "₹58,000",
      rating: 4.9,
      img: Beaches,
      tags: ["romantic", "luxury", "family"],
      highlights: [
        "Private overwater villas",
        "Scuba diving experience",
        "Sunset dinner on beach",
      ],
      metrics: { family: 90, kids: 75, friends: 80 },
      offer: "Limited Offer — Free Spa Voucher",
      weather: "28°C 🌴",
    },
    {
      id: "pkg5",
      title: "Goa Family Getaway",
      nights: 3,
      price: "₹24,000",
      rating: 4.5,
      img: Resorts,
      tags: ["family", "kids", "budget"],
      highlights: [
        "Beach shacks & water sports",
        "Evening flea markets",
        "Family movie night",
      ],
      metrics: { family: 95, kids: 85, friends: 70 },
      offer: "Kids Stay Free this Week!",
      weather: "30°C ☀️",
    },
    {
      id: "pkg6",
      title: "Bali Adventure Retreat",
      nights: 6,
      price: "₹49,000",
      rating: 4.9,
      img: Bali,
      tags: ["adventure", "friends", "romantic"],
      highlights: [
        "Surfing & cliff temples",
        "Waterfalls & jungle swings",
        "Sunset yoga & beach cafes",
      ],
      metrics: { family: 70, kids: 60, friends: 95 },
      offer: "Hot Deal — ₹5000 Cashback!",
      weather: "27°C 🌴",
    },
    {
      id: "pkg7",
      title: "Swiss Alps Experience",
      nights: 5,
      price: "₹75,000",
      rating: 5.0,
      img: Swiss,
      tags: ["family", "luxury", "romantic"],
      highlights: [
        "Cable cars & snow treks",
        "Luxury chalet stays",
        "Alpine lake cruise",
      ],
      metrics: { family: 95, kids: 80, friends: 75 },
      offer: "Exclusive: Free Mountain Pass",
      weather: "-2°C ❄️",
    },
    {
      id: "pkg8",
      title: "Dubai Luxury Escape",
      nights: 4,
      price: "₹55,000",
      rating: 4.8,
      img: Dubai,
      tags: ["luxury", "friends", "shopping"],
      highlights: [
        "Desert safari with BBQ",
        "Burj Khalifa & fountain show",
        "Luxury shopping malls",
      ],
      metrics: { family: 85, kids: 65, friends: 90 },
      offer: "Limited Offer — Free Desert Safari!",
      weather: "33°C ☀️",
    },
    {
      id: "pkg9",
      title: "Paris Romantic Sojourn",
      nights: 5,
      price: "₹68,000",
      rating: 4.9,
      img: Paris,
      tags: ["romantic", "luxury", "culture"],
      highlights: [
        "Eiffel Tower dinner night",
        "Art walks at the Louvre",
        "Seine river cruise",
      ],
      metrics: { family: 70, kids: 55, friends: 85 },
      offer: "Valentine Special — 15% Off",
      weather: "20°C 🌤️",
    },
    {
      id: "pkg10",
      title: "Singapore City Lights",
      nights: 4,
      price: "₹48,000",
      rating: 4.7,
      img: Singapore,
      tags: ["family", "kids", "culture"],
      highlights: [
        "Marina Bay SkyPark",
        "Universal Studios fun",
        "Night Safari adventure",
      ],
      metrics: { family: 90, kids: 90, friends: 70 },
      offer: "Early Bird — Save ₹4000",
      weather: "29°C 🌦️",
    },
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "family", label: "👨‍👩‍👧 Family" },
    { id: "friends", label: "👯 Friends" },
    { id: "kids", label: "🧒 Kids" },
    { id: "solo", label: "🕯 Solo" },
    { id: "romantic", label: "💞 Romantic" },
    { id: "luxury", label: "💼 Luxury" },
    { id: "adventure", label: "🎢 Adventure" },
  ];

  const filteredPackages =
    filter === "all" ? packages : packages.filter((p) => p.tags.includes(filter));

  // 🎡 Spin Wheel
  const spinDestinations = packages.map((p) => p.title);
  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    const rand = Math.floor(Math.random() * spinDestinations.length);
    setTimeout(() => {
      setSpinResult(spinDestinations[rand]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="packages-page">
      {/* Header */}
      <motion.header
        className="packages-hero"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="hero-title">🌍 Discover Our Premium Packages</h1>
        <p className="hero-sub">
          Find your perfect getaway — curated for every traveler.
        </p>
      </motion.header>
      {/* 🔙 Back to Home Button */}
<div className="back-to-home-wrap">
  <motion.button
    className="btn-ghost back-to-home"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate("/")}
  >
    ← Back to Home
  </motion.button>
</div>


      {/* Filters */}
      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`filter-btn ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 🎡 Spin Wheel */}
      <div className="spin-wheel-section">
        <motion.div
          className={`spin-wheel ${spinning ? "spinning" : ""}`}
          onClick={spinWheel}
          whileTap={{ scale: 0.9 }}
        >
          🎡
        </motion.div>
        {spinResult && <p className="spin-result">🎯 You got: {spinResult}!</p>}
        <p className="spin-sub">Tap the wheel to spin & reveal a random package!</p>
      </div>

      {/* Packages Grid */}
      <div className="packages-grid">
        <AnimatePresence>
          {filteredPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              className="package-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="pkg-image-wrap">
                <img src={pkg.img} alt={pkg.title} className="pkg-img" />
                <div className="pkg-overlay">
                  <div className="pkg-weather">{pkg.weather}</div>
                  <div className="pkg-rating">⭐ {pkg.rating}</div>
                </div>
              </div>

              <div className="pkg-body">
                <h3>{pkg.title}</h3>
                <p className="pkg-sub">
                  {pkg.nights} Nights · From <strong>{pkg.price}</strong>
                </p>

                <ul className="pkg-highlights">
                  {pkg.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>

                <div className="pkg-metrics">
                  <div>👨‍👩‍👧 {pkg.metrics.family}% Family</div>
                  <div>🧒 {pkg.metrics.kids}% Kids</div>
                  <div>👯 {pkg.metrics.friends}% Friends</div>
                </div>

                <div className="pkg-offer">{pkg.offer}</div>

                <div className="pkg-actions">
                  <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/view/${pkg.id}`, { state: { item: pkg } })}
                  >
                    View Package
                  </motion.button>

                  <motion.button
                    className="btn-ghost"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/book/${pkg.id}`, { state: { item: pkg } })}
                  >
                    🧳 Book Directly
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
