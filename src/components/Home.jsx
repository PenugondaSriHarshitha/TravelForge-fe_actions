// src/components/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
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
import besttime from "../images/besttime.png";
import exploreImg from "../images/explore.png";
import trip from "../images/trip.png";

import Signup from "./Signup";
import MoodTripPlanner from "./MoodTripPlanner";
import Footer from "./Footer";
import "./Home.css";
import SubscribeModal from "./SubscribeModal";

const API_BASE = "http://localhost:8083";

// ---- small animation configs
const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.04 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const heroVariants = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const cardVariants = { hidden: { opacity: 0, y: 12, scale: 0.995 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42 } } };

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

  const [currentUser, setCurrentUser] = useState(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false); // kept, but not auto-used

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subPlan, setSubPlan] = useState(null);

  const navigate = useNavigate();

  // ✅ SINGLE LOGIC FOR LOCKED ACCESS (with plan in state)
  const handleLockedAccess = (path) => {
  if (!currentUser) {
    try { sessionStorage.setItem("LOCK_INTENT_PATH", path); } catch {}
    setSignupOpen(true);
    return;
  }

  if (!isSubscribed) {
    navigate("/subscribe", { state: { email: currentUser.email, from: path, plan: "premium" } });
    return;
  }

  // ✅ Already logged in + subscribed -> open requested page
  navigate(path);
};

  const STORAGE_KEY = "travel_home_top_deals_v1";
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

  const story1 = adv;
  const story2 = sunset;
  const story3 = city;

  // ------- UI INIT + USER INIT
  useEffect(() => {
    const saved = localStorage.getItem("tm_dark_mode");
    if (saved) setDarkMode(saved === "true");

    const rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch {
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
      } catch {}
    }
    setResults(defaultInitialDeals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialDeals));
    const t = setTimeout(() => setInitialLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("tm_dark_mode", darkMode);
  }, [darkMode]);

  // reflect changes to currentUser from other tabs and subscription keys
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "currentUser") {
        if (!e.newValue) setCurrentUser(null);
        else {
          try { setCurrentUser(JSON.parse(e.newValue)); }
          catch { setCurrentUser({ email: e.newValue }); }
        }
      }
      if (e.key === "travelforge_sub_plan" || e.key === "travelforge_sub_email") {
        checkSubscription();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---- subscription check by email (tries /check first; falls back to list)
  const checkSubscription = async () => {
    try {
      const raw = localStorage.getItem("currentUser");
      const parsed = raw ? (JSON.parse(raw) || {}) : {};
      const email = parsed?.email || (typeof raw === "string" ? raw : null);

      if (!email) {
        setIsSubscribed(false);
        setSubPlan(null);
        return;
      }

      let ok = false;
      let plan = null;
      try {
        const r = await fetch(`${API_BASE}/api/subscribe/check?email=${encodeURIComponent(email)}`);
        if (r.ok) {
          const data = await r.json();
          ok = !!data?.subscribed;
          plan = data?.plan || null;
        }
      } catch {}

      if (!ok) {
        const r2 = await fetch(`${API_BASE}/api/subscribe`);
        if (r2.ok) {
          const arr = await r2.json();
          const found = (arr || []).find((x) => (x?.email || "").toLowerCase() === email.toLowerCase());
          ok = !!found;
          plan = found?.plan || null;
        }
      }

      setIsSubscribed(ok);
      setSubPlan(plan);
      if (ok) {
        localStorage.setItem("travelforge_sub_email", email);
        if (plan) localStorage.setItem("travelforge_sub_plan", plan);
      }
    } catch {
      setIsSubscribed(false);
      setSubPlan(null);
    }
  };

  // run on mount & when user changes
  useEffect(() => {
    checkSubscription();
  }, [currentUser?.email]);

  // search
  const simulateSearch = (e) => {
    e?.preventDefault();
    if (!query?.trim()) {
      document.querySelector(".search-input")?.focus();
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
    const params = new URLSearchParams({ from: query, tab, guests: "2" });
    setTimeout(() => { setSearching(false); navigate(`/results?${params.toString()}`); }, 700);
  };

  const curated = useMemo(() => ([
    { id: 101, city: "Lisbon", price: "$199", img: Lisbon },
    { id: 102, city: "Santorini", price: "$299", img: Santorini },
    { id: 103, city: "Kyoto", price: "$349", img: Kyoto },
  ]), []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const footerOnSubscribe = async (email) => {
    if (!validateEmail(email)) return { ok: false };
    navigate("/subscribe", { state: { from: "footer", email } });
    return { ok: true };
  };

  const handleLogout = () => {
  try { localStorage.removeItem("currentUser"); } catch {}
  setCurrentUser(null);
  setSignupOpen(false); // ✅ close signup modal if open
  navigate("/");        // ✅ go to Home page
};

  const goExplore = (item) => navigate(`/explore/${item.id}`, { state: { item } });
  const goBook = (item) => navigate(`/book/${item.id}`, { state: { item } });

  return (
    <div className={`home-root ${darkMode ? "dark" : "light"}`}>
      <AnimatePresence mode="wait">
        <motion.main className="home-page" variants={pageVariants} initial="hidden" animate="enter" exit="exit">
          <Helmet><title>TravelForge — Home</title></Helmet>

          <div className="home-inner">
            {/* NAV */}
            <nav className="nav glass" aria-label="Main navigation">
              <div className="nav-left">
                <img src={logo} alt="TravelForge logo" className="logo" />
              </div>

              <div className="nav-right">
                {currentUser ? (
                  <div
                    className="profile-pill"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 12,
                      background: "linear-gradient(90deg,#ffffff,#fbfdfc)",
                      padding: "8px 14px", borderRadius: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginRight: 8,
                    }}
                  >
                    <span className="avatar" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} aria-hidden>👤</span>
                    <span className="profile-email" style={{ fontWeight: 900, color: "var(--text)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={currentUser.email || currentUser.name}>
                      {currentUser.email || currentUser.name}
                    </span>

                    {isSubscribed && (
                      <span className="sub-badge" style={{ fontWeight: 800, fontSize: 12, background: "#d7ffea", color: "#014d3e", padding: "4px 8px", borderRadius: 10, marginRight: 8 }}>
                        SUBSCRIBED{subPlan ? ` • ${subPlan}` : ""}
                      </span>
                    )}

                    <button onClick={handleLogout} className="profile-logout" style={{ padding: "6px 10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, background: "linear-gradient(90deg,#38ef7d,#ffb86b)", color: "#00251f" }}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    className="signup-btn"
                    onClick={() => setSignupOpen(true)}
                    style={{
                      background: "linear-gradient(90deg,#38ef7d,#ffb86b)",
                      border: "none", padding: "8px 18px", borderRadius: "12px",
                      fontWeight: "800", color: "#00251f", cursor: "pointer",
                      marginRight: 12, boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
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
  {["flights", "stays", "cars", "packages"].map((t) => (
    <button
      key={t}
      role="tab"
      aria-selected={tab === t}
      className={`tab ${tab === t ? "active" : ""}`}
      onClick={() => {
        if (t === "packages") {
          // ✅ Navigate to Packages page
          navigate("/packages");
        } else {
          // ✅ Keep same behavior for other tabs
          setTab(t);
        }
      }}
    >
      {t === "flights" && "✈️ Flights"}
      {t === "stays" && "🏝 Stays"}
      {t === "cars" && "🚙 Cars"}
      {t === "packages" && "🌍 Packages"}
    </button>
  ))}
</div>


                  <form className="search-form" onSubmit={simulateSearch}>
                    <div className="search-row">
                      <input className="search-input" placeholder={tab === "flights" ? "From (city or airport)" : "Destination"} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search destination" />
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
                  <motion.div className="feature-card" initial={{ y: 8 }} animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} whileHover={{ scale: 1.02 }}>
                    <img src={Santorini} alt="Island View" className="feature-img" />
                    <div className="feature-overlay">
                      <h4>Tropical Bliss 🌺</h4>
                      <p>Plan your dream island escape</p>
                      <div style={{ marginTop: 8 }}>
                        <button className="btn-primary" onClick={() => navigate(`/explore/p-santorini`, { state: { item: { id: "p-santorini", city: "Santorini", price: "$399", img: Santorini } } })}>Explore</button>
                        <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={() => navigate(`/book/p-santorini`, { state: { item: { id: "p-santorini", city: "Santorini", price: "$399", img: Santorini } } })}>Book</button>
                        <button className="btn-ghost" style={{ marginLeft: 10 }} onClick={() => navigate("/saved")}>♥ Save</button>
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

            {/* MoodTripPlanner */}
            <MoodTripPlanner />

            {/* Top Deals */}
            <div className="results-wrap" aria-live="polite">
              <div className="section-heading ribbon-heading">
                <span className="heading-emoji">🔥</span>
                <h2>Top Deals</h2>
                <span className="heading-emoji">🏝️</span>
              </div>

              <div className="top-deals-grid">
                {defaultInitialDeals.slice(0, 6).map((r) => (
                  <motion.article key={r.id} className="card" variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -10, boxShadow: "0 30px 70px rgba(0, 0, 0, 0.33)", scale: 1.01 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
                    <img src={r.img} alt={r.city} className="card-media" />
                    <div className="card-body">
                      <h4 className="city-gradient">{r.city}</h4>
                      <p className="price">Starting from <strong>{r.price}</strong></p>
                      <div className="card-actions">
                        <button className="btn-primary" onClick={() => goExplore(r)}>Explore</button>
                        <button className="btn-ghost" onClick={() => goBook(r)}>Book</button>
                        <button className="btn-ghost" onClick={() => navigate("/saved")} aria-label={`Save ${r.city}`}>♥ Save</button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            {/* For Travel Pros */}
            <div className="dark-strip">
              <div className="pros-wrap">
                <div className="section-heading">
                  <span className="heading-emoji">🌍</span>
                  <h2>For Travel Pros</h2>
                  <span className="heading-emoji">✈️</span>
                </div>

                <div className="pros-grid cute-grid pros-3x2">
                  {[
                    { title: "Best Time to Travel", emoji: "⏰", hint: "Know when to save on your trips", img: besttime, slug: "best-time", locked: true },
                    { title: "Trips", emoji: "🚐", hint: "Keep all your plans in one place", img: trip, slug: "trips", locked: false },
                    { title: "Hidden Gems", emoji: "✨", hint: "Discover secret spots locals love", img: Beaches, slug: "hidden-gems", locked: true },
                    { title: "Budget Planner", emoji: "💰", hint: "Track and manage travel costs", img: Resorts, slug: "budget", locked: false },
                    { title: "Local Guides", emoji: "🗺️", hint: "Insider tips for your trip", img: night, slug: "local-guides", locked: false },
                  ].map((p, idx) => {
                    const isLocked = p.locked && !isSubscribed;
                    const path = `/${p.slug}`;

                    return (
                      <motion.div
                        key={p.slug}
                        className={`pro-card boutique ${isLocked ? "locked-card" : ""}`}
                        onClick={() => isLocked ? handleLockedAccess(path) : navigate(path)}
                        whileHover={{ y: -10, rotate: -0.6 }}
                        whileTap={{ scale: 0.995 }}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.06 * idx, duration: 0.46, ease: "easeOut" } }}
                        role="button"
                        tabIndex={0}
                        aria-label={p.title}
                      >
                        {isLocked && (
                          <div className="lock-overlay" onClick={() => handleLockedAccess(path)}>
                            <div className="lock-pill">🔒 Subscribe to unlock</div>
                          </div>
                        )}

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
  onClick={(e) => {
    e.stopPropagation();
    if (isLocked) return handleLockedAccess(path);
    navigate(path); // ✅ open directly for unlocked features
  }}
>
  {isLocked ? "Unlock" : "Open"}
</button>

                              <button className="pro-save" onClick={(e) => { e.stopPropagation(); navigate("/saved"); }} aria-label={`Save ${p.title}`}>
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
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Traveler Stories */}
            <section className="results-wrap stories-wrap" aria-labelledby="stories-title">
              <div className="minimal-heading">
                <span className="heading-emoji">📖</span>
                <h2>Traveler Stories</h2>
                <span className="heading-emoji">🌍</span>
              </div>

              <div className="stories-grid" role="list">
                {[
                  { key: "story1", img: story1, title: "Amazing Adventure", excerpt: "A traveler shares their journey across blue coasts.", author: "Subbu", date: "Dec 3", read: "7 min", path: "/amazing-adventure", locked: false },
                  { key: "story2", img: story2, title: "Sunset Escapes", excerpt: "Sunsets and cobbled streets — a dreamy weekend.", author: "Bhavya", date: "May 27", read: "3 min", path: "/sunset-escapes", locked: true },
                  { key: "story3", img: story3, title: "City & Sea", excerpt: "How I found hidden cafes by the harbor.", author: "Harshi", date: "June 1", read: "6 min", path: "/city-and-sea", locked: true },
                ].map((s, i) => {
                  const isLocked = s.locked && !isSubscribed;
                  return (
                    <motion.article
                      key={s.key}
                      className={`story-card ${isLocked ? "locked-card" : ""}`}
                      role="article"
                      aria-label={`${s.title} by ${s.author}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.42 }}
                      whileHover={{ y: -8, scale: 1.01 }}
                    >
                      {isLocked && (
                        <div className="lock-overlay" onClick={() => handleLockedAccess(s.path)}>
                          <div className="lock-pill">🔒 Subscribe to read</div>
                        </div>
                      )}
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
                            <button
                              className="btn-primary small"
                              onClick={() => {
                                if (isLocked) return handleLockedAccess(s.path);
                                navigate(s.path);
                              }}
                            >
                              Read
                            </button>

                            <button className="btn-ghost small" style={{ marginLeft: 8 }} onClick={() => navigate("/saved")} aria-label={`Save story ${s.title}`}>
                              ♥ Save
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="polaroid-shadow" aria-hidden />
                    </motion.article>
                  );
                })}
              </div>
            </section>

            {/* CTA */}
            <motion.div className="floating-card glass" initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} style={{ marginTop: 22, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>✨ Ready to plan your dream trip?</div>
              <div><button className="btn-primary" style={{ marginLeft: 8 }} onClick={() => navigate("/results")}>Start Now</button></div>
            </motion.div>

            {/* FOOTER */}
            <Footer onSubscribe={footerOnSubscribe} />
          </div>
        </motion.main>
      </AnimatePresence>

      {/* Floating Sign-Up */}
      {!currentUser && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => setSignupOpen(true)}
          style={{
            position: "fixed", bottom: 20, right: 20,
            background: "linear-gradient(90deg,#38ef7d,#ffb86b)",
            border: "none", padding: "12px 18px", borderRadius: 16,
            fontWeight: 800, color: "#00251f", cursor: "pointer",
            boxShadow: "0 12px 36px rgba(0,0,0,0.14)", zIndex: 1200,
          }}
        >
          Sign Up
        </motion.button>
      )}

      {/* Signup modal with AUTO-REDIRECT to /subscribe if there was a locked intent */}
      <Signup
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSuccess={(user) => {
          localStorage.setItem("currentUser", JSON.stringify(user));
          setCurrentUser(user);
          setSignupOpen(false);
          setIsSubscribed(false);
          setSubPlan(null);
          localStorage.removeItem("travelforge_sub_email");
          localStorage.removeItem("travelforge_sub_plan");

          // ✅ Auto-redirect to subscribe if user clicked a locked feature before login
          try {
            const pending = sessionStorage.getItem("LOCK_INTENT_PATH");
            if (pending) {
              sessionStorage.removeItem("LOCK_INTENT_PATH");
              navigate("/subscribe", { state: { email: user.email, from: pending, plan: "premium" } });
              return;
            }
          } catch {}
        }}
      />

      {/* Subscribe Modal (kept, but not auto-opened; optional use) */}
      {subscribeOpen && (
        <SubscribeModal
          open={subscribeOpen}
          onClose={() => setSubscribeOpen(false)}
        />
      )}
    </div>
  );
}
