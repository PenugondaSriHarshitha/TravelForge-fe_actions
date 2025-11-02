// src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";


import logo from "../images/logo1.png";
import Beaches from "../images/beaches.png";
import Resorts from "../images/Resorts.png";
import Kyoto from "../images/Kyoto.png";
import Lisbon from "../images/Lisbon.png";
import Santorini from "../images/Santorini.png";
import night from "../images/night.png";
import adv from "../images/adv.png";
import sunset from "../images/sunset.png";
import city from "../images/city.png";
// new thumbs
import besttime from "../images/besttime.png";
import exploreImg from "../images/explore.png";
import trip from "../images/trip.png";

import Signup from "./Signup";
import MoodTripPlanner from "./MoodTripPlanner";
import Footer from "./Footer";
import "./Home.css";

/* animations (unchanged) */
const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.04 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const heroVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42 } },
};

/* tiny countup hook (same) */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({ icon, value, suffix = "", label, note }) {
  const count = useCountUp(value);
  return (
    
    <motion.div
      className="stat-card"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      role="listitem"
      aria-label={`${label} ${count}${suffix}`}
    >
      <div className="stat-left"><span className="emoji">{icon}</span></div>
      <div className="stat-right">
        <div className="stat-number">{count}{suffix}</div>
        <div className="stat-label">{label}</div>
        {note && <div className="stat-note">{note}</div>}
      </div>
      <div className="sparkle" aria-hidden />
    </motion.div>
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("flights");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // AUTH / signup modal state
  const [currentUser, setCurrentUser] = useState(null);
  const [signupOpen, setSignupOpen] = useState(false);

  const navigate = useNavigate();

  const STORAGE_KEY = "travel_home_top_deals_v1";
  const SAVES_KEY = "travel_saved_items_v1";

  const defaultInitialDeals = [
    { id: 201, city: "Beaches", price: "$199", img: Beaches },
    { id: 202, city: "Resorts", price: "$299", img: Resorts },
    { id: 203, city: "Nightlife", price: "$349", img: night },
    { id: 204, city: "Lisbon", price: "$249", img: Lisbon },
    { id: 205, city: "Santorini", price: "$399", img: Santorini },
    { id: 206, city: "Kyoto", price: "$319", img: Kyoto },
    { id: 207, city: "Pernem", price: "$183", img: Beaches },
    { id: 208, city: "Visakhapatnam", price: "$199", img: Resorts },
    { id: 209, city: "Hidden Cove", price: "$149", img: Santorini },
  ];

  const creativeBadges = [
    { label: "✈️ Fast fares" },
    { label: "🏨 Curated stays" },
    { label: "🔎 Insider tips" },
    { label: "💡 Smart bundles" },
    { label: "✨ Flash deals" },
  ];

  const story1 = adv;
  const story2 = sunset;
  const story3 = city;

  // load persisted UI and current user
  useEffect(() => {
    const saved = localStorage.getItem("tm_dark_mode");
    if (saved) setDarkMode(saved === "true");

    const rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch (e) {
        // fallback to raw string (email)
        setCurrentUser({ email: rawUser });
      }
    }

    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResults(parsed);
          const t = setTimeout(() => setInitialLoading(false), 420);
          return () => clearTimeout(t);
        }
      } catch (err) {
        console.warn("failed to parse persisted top deals", err);
      }
    }

    setResults(defaultInitialDeals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialDeals));
    const t = setTimeout(() => setInitialLoading(false), 420);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("tm_dark_mode", darkMode);
  }, [darkMode]);

  // Listen for changes to localStorage (useful if Signup writes currentUser or another tab changes it)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "currentUser") {
        if (!e.newValue) {
          setCurrentUser(null);
        } else {
          try {
            setCurrentUser(JSON.parse(e.newValue));
          } catch {
            setCurrentUser({ email: e.newValue });
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // When signup modal closes, re-read localStorage in case Signup saved the user
  useEffect(() => {
    if (!signupOpen) {
      const rawUser = localStorage.getItem("currentUser");
      if (rawUser) {
        try {
          setCurrentUser(JSON.parse(rawUser));
        } catch {
          setCurrentUser({ email: rawUser });
        }
      } else {
        setCurrentUser(null);
      }
    }
  }, [signupOpen]);

  // save helper
 // replace your existing saveItemAndGo with this ready-to-paste function
const saveItemAndGo = async (item) => {
  const SAVES_KEY = "travel_saved_items_v1";

  // normalize / ensure id
  const safeId = item.id ?? `${item.city ?? "item"}-${Date.now()}`;
  const normalized = {
    id: safeId,
    city: item.city || item.title || "Unknown",
    img: item.img || "",
    kind: item.kind || "deal",
    price: item.price || "—",
    title: item.title || item.city || "",
    userId: 1, // change to logged-in user id when available
    saved_at: new Date().toISOString(),
  };

  // 1) write to localStorage so Saved page updates immediately
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    // avoid duplicate by id
    const exists = existing.some((it) => it.id === normalized.id);
    const updated = exists ? existing : [normalized, ...existing];
    localStorage.setItem(SAVES_KEY, JSON.stringify(updated));
    // notify same-tab listeners (Saved.jsx listens for this)
    window.dispatchEvent(new Event("saved-updated"));
  } catch (e) {
    console.warn("local save failed", e);
  }

  // 2) also attempt to persist to backend (best-effort)
  try {
    // adjust URL if your backend port differs
    const res = await fetch("http://localhost:8083/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: normalized.city,
        img: normalized.img,
        kind: normalized.kind,
        price: normalized.price,
        title: normalized.title,
        userId: normalized.userId,
      }),
    });

    // optional: if backend returns created resource, you could merge/replace local copy
    if (res.ok) {
      try {
        const serverItem = await res.json();
        // if server returns id or saved_at, update local copy to reflect authoritative data
        const raw2 = localStorage.getItem(SAVES_KEY);
        const cur = raw2 ? JSON.parse(raw2) : [];
        const merged = cur.map((it) => (it.id === normalized.id ? { ...it, ...serverItem } : it));
        localStorage.setItem(SAVES_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event("saved-updated"));
      } catch (err) {
        // ignore JSON parse errors — not critical
      }
    } else {
      console.warn("Backend save responded with", res.status);
    }
  } catch (e) {
    console.warn("Backend save failed (network/error). Local save preserved.", e);
  }

  // navigate to saved page
  navigate("/saved");
};

  // SEARCH / NAVIGATION
  const simulateSearch = (e) => {
    e?.preventDefault();

    if (!query?.trim()) {
      const el = document.querySelector(".search-input");
      el?.focus();
      return;
    }

    setSearching(true);
    setResults([]);

    const sampleResults = [
      { id: 1, city: "Lisbon", price: "$249", img: Lisbon },
      { id: 2, city: "Santorini", price: "$399", img: Santorini },
      { id: 3, city: "Kyoto", price: "$319", img: Kyoto },
      { id: 4, city: "Visakhapatnam", price: "$199", img: Resorts },
      { id: 5, city: "Pernem", price: "$183", img: Beaches },
    ];
    localStorage.setItem("tm_search_results_cache", JSON.stringify(sampleResults));

    const params = new URLSearchParams({
      from: query,
      tab,
      guests: "2",
    });

    setTimeout(() => {
      setSearching(false);
      navigate(`/results?${params.toString()}`);
    }, 700);
  };

  const curated = [
    { id: 101, city: "Lisbon", price: "$199", img: Lisbon },
    { id: 102, city: "Santorini", price: "$299", img: Santorini },
    { id: 103, city: "Kyoto", price: "$349", img: Kyoto },
  ];

  // PRO navigation
  const handleProClick = (slug) => {
    const routeMap = {
      "best-time": "/best-time",
      explore: "/explore",
      trips: "/trips",
      "hidden-gems": "/hidden-gems",
      budget: "/budget",
      "local-guides": "/local-guides",
    };
    navigate(routeMap[slug] || `/${slug}`);
  };

  // pass object via state
  const goExplore = (item) => navigate(`/explore/${item.id}`, { state: { item } });
  const goBook = (item) => navigate(`/book/${item.id}`, { state: { item } });

  // Footer subscribe (kept minimal — unchanged)
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleFooterSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !validateEmail(newsletterEmail)) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    setNewsletterError("");
    navigate("/subscribe", { state: { from: "footer", email: newsletterEmail } });
  };

  // wrapper to pass into Footer component: Footer will call onSubscribe(email) and expect a Promise<{ok: boolean}>
  const footerOnSubscribe = async (email) => {
    if (!validateEmail(email)) return { ok: false };
    navigate("/subscribe", { state: { from: "footer", email } });
    return { ok: true };
  };

  // --- LOGOUT handler: clear currentUser and show only Signup button, open signup and navigate to /signup
  const handleLogout = () => {
    try {
      localStorage.removeItem("currentUser");
    } catch (e) {
      console.warn("Could not remove currentUser", e);
    }
    setCurrentUser(null);

    // open signup modal and navigate to the signup route so user lands on signup
    setSignupOpen(true);
    try {
      navigate("/signup");
    } catch (e) {
      // ignore navigation errors (e.g. if route doesn't exist)
    }
  };

  return (
    
    <div className={`home-root ${darkMode ? "dark" : "light"}`}>
      <AnimatePresence mode="wait">
        <motion.main className="home-page" variants={pageVariants} initial="hidden" animate="enter" exit="exit">
          <div className="home-inner">
            {/* NAV */}
            <nav className="nav glass" aria-label="Main navigation">
              <div className="nav-left">
                <img src={logo} alt="TravelForge logo" className="logo" />
                <div className="brand"></div>
              </div>

              <div className="nav-right">
                {/* show profile if logged in, otherwise only Sign Up */}
                {currentUser ? (
                  <div
                    className="profile-pill"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      background: "linear-gradient(90deg,#ffffff,#fbfdfc)",
                      padding: "8px 14px",
                      borderRadius: 28,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      marginRight: 8,
                    }}
                  >
                    <span
                      className="avatar"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 14, background: "rgba(0,0,0,0.06)" }}
                      aria-hidden
                    >
                      👤
                    </span>

                    {/* bold, readable email/name (uses CSS variable so visible in dark/light) */}
                    <span
                      className="profile-email"
                      style={{
                        fontWeight: 900,
                        color: "var(--text)",
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={currentUser.email || currentUser.name}
                    >
                      {currentUser.email || currentUser.name}
                    </span>

                    <button
                      onClick={handleLogout}
                      className="profile-logout"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 800,
                        background: "linear-gradient(90deg,#38ef7d,#ffb86b)",
                        color: "#00251f",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    className="signup-btn"
                    onClick={() => setSignupOpen(true)}
                    style={{
                      background: "linear-gradient(90deg,#38ef7d,#ffb86b)",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      fontWeight: "800",
                      color: "#00251f",
                      cursor: "pointer",
                      marginRight: 12,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    }}
                  >
                    Sign Up
                  </button>
                )}

                <button onClick={() => setDarkMode((s) => !s)} className="mode-toggle" aria-pressed={darkMode}>
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>
            </nav>

            {/* HERO */}
            <motion.section className="hero-wrapper" variants={heroVariants} initial="hidden" animate="visible" aria-labelledby="hero-title">
              <div className="hero glass">
                <div className="hero-left">
                  <h1 id="hero-title" className="hero-title">
                  <span className="accent"> Where your next story begins</span> 
                  </h1>
                  <p className="hero-sub">Every journey begins with a spark of wonder.</p>

                  <div className="tabs" role="tablist" aria-label="Booking tabs">
                    {["flights","stays","cars","packages"].map(t => (
                      <button
                        key={t}
                        role="tab"
                        aria-selected={tab===t}
                        className={`tab ${tab===t ? "active" : ""}`}
                        onClick={() => setTab(t)}
                      >
                        {t==="flights" && "✈️ Flights"}
                        {t==="stays" && "🏝 Stays"}
                        {t==="cars" && "🚙 Cars"}
                        {t==="packages" && "🌍 Packages"}
                      </button>
                    ))}
                  </div>

                  <form className="search-form" onSubmit={simulateSearch}>
                    <div className="search-row">
                      <input
                        className="search-input"
                        placeholder={tab==="flights" ? "From (city or airport)" : "Destination"}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        aria-label="Search destination"
                      />
                      <input className="search-input date" type="date" aria-label="Start date" />
                      <input className="search-input date" type="date" aria-label="End date" />
                      <select className="search-input" aria-label="Rooms and guests">
                        <option>1 room, 2 guests</option>
                        <option>2 rooms, 4 guests</option>
                      </select>
                      <motion.button className="btn-search" type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} aria-label="Search">
                        {searching ? "Searching…" : "Search"}
                      </motion.button>
                    </div>

                    <div className="stats-cards" role="list" aria-label="Key metrics">
                      <StatCard icon="🌴" value={150000} suffix="+" label="Happy travelers" note="Trusted by many" />
                      <StatCard icon="⭐" value={48} suffix=".0" label="Avg rating" note="Based on reviews" />
                      <StatCard icon="🏝️" value={70} suffix="+" label="Islands" note="Tropical & hidden" />
                    </div>
                  </form>
                </div>

                <div className="hero-right" aria-hidden>
                  <motion.div
                    className="feature-card"
                    initial={{ y: 8 }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img src={Santorini} alt="Island View" className="feature-img" />
                    <div className="feature-overlay">
                      <h4>Tropical Bliss 🌺</h4>
                      <p>Plan your dream island escape</p>
                      <div style={{ marginTop: 8 }}>
                        <button className="btn-primary" onClick={() => goExplore({ id: "p-santorini", city: "Santorini", price: "$399", img: Santorini })}>Explore</button>
                        <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={() => goBook({ id: "p-santorini", city: "Santorini", price: "$399", img: Santorini })}>Book</button>

                        

                        {/* Save (heart) on feature */}
                        <button
                          className="btn-ghost"
                          style={{ marginLeft: 10 }}
                          onClick={() => saveItemAndGo({ id: "p-santorini", city: "Santorini", price: "$399", img: Santorini })}
                          aria-label="Save Santorini"
                        >
                          ♥ Save
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <div className="thumbs circle-thumbs">
                    <motion.img src={Lisbon} alt="Lisbon" className="thumb circle" whileHover={{ scale: 1.08, y: -6 }} />
                    <motion.img src={Kyoto} alt="Kyoto" className="thumb circle" whileHover={{ scale: 1.08, y: -6 }} />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Insert MoodTripPlanner inline (widget/overlay) */}
            <MoodTripPlanner />

            {/* Top Deals */}
            <div className="results-wrap" aria-live="polite">
              <div className="section-heading ribbon-heading">
                <span className="heading-emoji">🔥</span>
                <h2>Top Deals</h2>
                <span className="heading-emoji">🏝️</span>
              </div>

              <div className="top-deals-grid">
                {[ ...defaultInitialDeals.slice(0,6) ].map((r) => (
                  <motion.article
                    key={r.id}
                    className="card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -10, boxShadow: "0 30px 70px rgba(0, 0, 0, 0.33)", scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 160, damping: 14 }}
                  >
                    <img src={r.img} alt={r.city} className="card-media" />
                    <div className="card-body">
                      <h4 className="city-gradient">{r.city}</h4>
                      <p className="price">Starting from <strong>{r.price}</strong></p>
                      <div className="card-actions">
                        <button className="btn-primary" onClick={() => goExplore(r)}>Explore</button>
                        <button className="btn-ghost" onClick={() => goBook(r)}>Book</button>
                        <button
                          className="btn-ghost"
                          onClick={() => saveItemAndGo(r)}
                          aria-label={`Save ${r.city}`}
                        >
                          ♥ Save
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))} 
              </div>
            </div>

            {/* Mid-page dark strip around For Travel Pros */}
            <div className="dark-strip">
              <div className="pros-wrap">
                <div className="section-heading">
                  <span className="heading-emoji">🌍</span>
                  <h2>For Travel Pros</h2>
                  <span className="heading-emoji">✈️</span>
                </div>

                <div className="pros-grid cute-grid pros-3x2">
                  {[ 
                    { title: "Best Time to Travel", emoji: "⏰", hint: "Know when to save on your trips", img: besttime, slug: "best-time" },
                    { title: "Trips", emoji: "🚐", hint: "Keep all your plans in one place", img: trip, slug: "trips" },
                    { title: "Hidden Gems", emoji: "✨", hint: "Discover secret spots locals love", img: Beaches, slug: "hidden-gems" },
                    { title: "Budget Planner", emoji: "💰", hint: "Track and manage travel costs", img: Resorts, slug: "budget" },
                    { title: "Local Guides", emoji: "🗺️", hint: "Insider tips for your trip", img: night, slug: "local-guides" },
                  ].map((p, idx) => (
                    <motion.div
                      key={p.slug}
                      className="pro-card boutique"
                      onClick={() => handleProClick(p.slug)}
                      whileHover={{ y: -10, rotate: -0.6 }}
                      whileTap={{ scale: 0.995 }}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.06 * idx, duration: 0.46, ease: "easeOut" } }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleProClick(p.slug);
                        }
                      }}
                      aria-label={p.title}
                    >
                      <div className="pro-header-pill" aria-hidden><span className="pill-dot">✦</span></div>
                      <div className="pro-inner">
                        <div className="pro-text">
                          <div className="title-row">
                            <h4 className="pro-title">{p.title}</h4>
                            <span className="pro-emoji" aria-hidden>{p.emoji}</span>
                          </div>
                          <p className="pro-hint">{p.hint}</p>
                          <div className="pro-cta-row">
                            <button
                              className="pro-open"
                              onClick={(e) => { e.stopPropagation(); handleProClick(p.slug); }}
                            >
                              Open
                            </button>
                            <button
                              className="pro-save"
                              onClick={(e) => {
                                e.stopPropagation();
                                const toSave = { id: `pro-${p.slug}`, city: p.title, price: "—", img: p.img };
                                saveItemAndGo(toSave);
                              }}
                              aria-label={`Save ${p.title}`}
                            >
                              ♥
                            </button>
                          </div>
                        </div>
                        <div className="pro-media" aria-hidden>
                          <motion.div className="media-wrap" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                            <div className="media-halo" />
                            <img src={p.img} alt={p.title} className="media-img pro-media-img" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            {/* end dark-strip */}

            {/* Traveler Stories */}
            <section className="results-wrap stories-wrap" aria-labelledby="stories-title">
              <div className="minimal-heading">
                <span className="heading-emoji">📖</span>
                <h2>Traveler Stories</h2>
                <span className="heading-emoji">🌍</span>
              </div>

              <div className="stories-grid" role="list">
                {[
                  { img: story1, title: "Amazing Adventure", excerpt: "A traveler shares their journey across blue coasts.", author: "Subbu", date: "Dec 3", read: "7 min" },
                  { img: story2, title: "Sunset Escapes", excerpt: "Sunsets and cobbled streets — a dreamy weekend.", author: "Bhavya", date: "May 27", read: "3 min" },
                  { img: story3, title: "City & Sea", excerpt: "How I found hidden cafes by the harbor.", author: "Harshi", date: "June 1", read: "6 min" },
                ].map((s, i) => (
                  <motion.article key={i} className="story-card" role="article" aria-label={`${s.title} by ${s.author}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i, duration: 0.42 }} whileHover={{ y: -8, scale: 1.01 }}>
                    <div className="story-ribbon" aria-hidden><span className="ribbon-dot">✨</span><span className="ribbon-text">Story</span></div>
                    <div className="story-media-wrap" tabIndex={-1}>
                      <img src={s.img} alt={s.title} className="story-img" />
                      <div className="story-media-overlay" aria-hidden>
                        <button
                          className="story-like"
                          aria-label={`Like ${s.title}`}
                          onClick={(e) => {
                            const card = e.currentTarget.closest(".story-card");
                            if (card) card.toggleAttribute("data-liked");
                          }}
                        >
                          ♡
                        </button>
                        <div className="story-meta-pill">{s.date} • {s.read}</div>
                      </div>
                    </div>
                    <div className="story-body">
                      <h4 className="story-title">{s.title}</h4>
                      <p className="story-excerpt">{s.excerpt}</p>
                      <div className="story-footer">
                        <div className="story-author">
                          <div className="author-avatar" aria-hidden><img src={s.img} alt={`${s.author} avatar`} /></div>
                          <div className="author-meta"><div className="author-name">{s.author}</div><div className="author-sub">{s.date} • {s.read}</div></div>
                        </div>

                        <div className="story-actions">
                          {s.author === "Subbu" ? (
                            <button className="btn-primary small" onClick={() => navigate("/amazing-adventure")}>Read</button>
                          ) : s.author === "Bhavya" ? (
                            <button className="btn-primary small" onClick={() => navigate("/sunset-escapes")}>Read</button>
                          ) : s.author === "Harshi" ? (
                            <button className="btn-primary small" onClick={() => navigate("/city-and-sea")}>Read</button>
                          ) : (
                            <button className="btn-primary small" onClick={() => navigate(`/story/${i}`, { state: { story: s } })}>Read</button>
                          )}

                          <button
                            className="btn-ghost small"
                            style={{ marginLeft: 8 }}
                            onClick={() => saveItemAndGo({ id: `story-${i}`, city: s.title, price: "—", img: s.img })}
                            aria-label={`Save story ${s.title}`}
                          >
                            ♥ Save
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="polaroid-shadow" aria-hidden />
                  </motion.article>
                ))}
              </div>
            </section>

            {/* small CTA */}
            <motion.div className="floating-card glass" initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} style={{ marginTop: 22, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>✨ Ready to plan your dream trip?</div>
              <div><button className="btn-primary" style={{ marginLeft: 8 }} onClick={() => navigate("/results")}>Start Now</button></div>
            </motion.div>

            {/* Footer (moved to Footer.jsx) — using the Footer component here (keeps your existing footer handlers) */}
            <Footer onSubscribe={footerOnSubscribe} />

          </div> {/* .home-inner */}
        </motion.main>
      </AnimatePresence>

      {/* Floating Sign-Up button — visible only when user NOT logged in */}
      {!currentUser && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => setSignupOpen(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "linear-gradient(90deg,#38ef7d,#ffb86b)",
            border: "none",
            padding: "12px 18px",
            borderRadius: 16,
            fontWeight: 800,
            color: "#00251f",
            cursor: "pointer",
            boxShadow: "0 12px 36px rgba(0,0,0,0.14)",
            zIndex: 1200,
          }}
        >
          Sign Up
        </motion.button>
      )}

      {/* Signup modal (opens when signupOpen === true). Props: open, onClose */}
      <Signup open={signupOpen} onClose={() => setSignupOpen(false)} />
        <Signup
  open={signupOpen}
  onClose={() => setSignupOpen(false)}
  onSuccess={(user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setSignupOpen(false);
  }}
/>


    </div>
  );
}