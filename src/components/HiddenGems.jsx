// src/components/HiddenGems.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Heart, X, ArrowLeftCircle, ArrowRightCircle, ZoomIn, Download } from "lucide-react";
import "./HiddenGems.css";

import hidden1 from "../images/hidden1.png";
import hidden2 from "../images/hidden2.png";
import hidden3 from "../images/hidden3.png";
import hidden4 from "../images/hidden4.png";
import hidden5 from "../images/hidden5.png";
import hidden6 from "../images/hidden6.png";
import hidden7 from "../images/hidden7.png";
import hidden8 from "../images/hidden8.png";
import hidden9 from "../images/hidden9.png";
import hidden10 from "../images/hidden10.png";

/* --- data --- */
const GEMS = [
  {
    id: "hidden1",
    title: "Hidden Waterfall Grove",
    subtitle: "Trek, dip, repeat",
    desc: "A small waterfall tucked in a jungle grove. The trail is short but steep — bring water shoes.",
    image: hidden1,
    tags: ["trek", "waterfall", "nature"],
    bestMonths: "Jun - Sep (lush green)",
    difficulty: "Moderate (trail)",
    tips: "Wear water shoes and insect repellent.",
    rating: 4.9,
  },
  {
    id: "hidden2",
    title: "Sky Lantern Valley",
    subtitle: "Lantern nights",
    desc: "A valley where locals release sky lanterns during festivals — best visited after dusk on full-moon nights.",
    image: hidden2,
    tags: ["festival", "night"],
    bestMonths: "Aug - Nov (festival season)",
    difficulty: "Easy",
    tips: "Bring a light jacket; join a local group for lanterns.",
    rating: 4.8,
  },
  {
    id: "hidden3",
    title: "Secret Cliff Café",
    subtitle: "Sunset coffees & ocean breezes",
    desc: "Tiny local cafe on a cliff — fresh brews and the best sunset in town. Access via a small walking path.",
    image: hidden3,
    tags: ["cafe", "sunset", "local"],
    bestMonths: "Nov - Feb",
    difficulty: "Easy (walk)",
    tips: "Arrive 30 mins before sunset, bring cash.",
    rating: 4.7,
  },
  {
    id: "hidden4",
    title: "Underground Temple",
    subtitle: "Candles & echoes",
    desc: "An ancient cave temple visited mostly by nearby villagers — bring quiet respect and a small offering.",
    image: hidden4,
    tags: ["temple", "spiritual"],
    bestMonths: "All year (dry season best)",
    difficulty: "Moderate (steps)",
    tips: "Modest clothing, no flash photography inside.",
    rating: 4.6,
  },
  {
    id: "hidden5",
    title: "Floating Market Lane",
    subtitle: "Colors & spices on river boats",
    desc: "Early-morning floating markets with spicy snacks and handcrafted souvenirs. Arrive early for the best stalls.",
    image: hidden5,
    tags: ["market", "food", "local"],
    bestMonths: "Nov - Apr",
    difficulty: "Easy (boat)",
    tips: "Bargain politely, taste the grilled squid.",
    rating: 4.5,
  },
  {
    id: "hidden6",
    title: "Emerald Cascade",
    subtitle: "Tiered falls & cool pools",
    desc: "A lesser-known cascade with a string of small pools perfect for a refreshing dip. The short trail winds through dense ferns.",
    image: hidden6,
    tags: ["waterfall", "nature", "swim"],
    bestMonths: "Jun - Sep (post-rains)",
    difficulty: "Moderate (uneven trail)",
    tips: "Wear grip shoes; there are slippery rocks near the pools.",
    rating: 4.8,
  },
  {
    id: "hidden7",
    title: "Lanternlight Terrace",
    subtitle: "Floating lights & local songs",
    desc: "A scenic terrace overlooking a valley where locals release thousands of lanterns during seasonal celebrations.",
    image: hidden7,
    tags: ["festival", "lanterns", "night"],
    bestMonths: "Aug - Nov (festival nights)",
    difficulty: "Easy (walk)",
    tips: "Bring a camera with low-light capability; arrive early to secure a spot.",
    rating: 4.7,
  },
  {
    id: "hidden8",
    title: "Seaview Sun Café",
    subtitle: "Rooftop sunsets & single-origin brews",
    desc: "A cozy rooftop café that faces due west — perfect for watching the sun melt into the ocean while sipping a hand-brewed pour-over.",
    image: hidden8,
    tags: ["cafe", "sunset", "scenic"],
    bestMonths: "Nov - Mar",
    difficulty: "Easy (stairs)",
    tips: "Reserve a table on weekends; try the house spiced latte.",
    rating: 4.6,
  },
  {
    id: "hidden9",
    title: "Hilltop Shrine",
    subtitle: "Ancient stones & morning chants",
    desc: "A serene hilltop shrine with carved stonework and a quiet courtyard. Locals often perform morning offerings here.",
    image: hidden9,
    tags: ["temple", "spiritual", "history"],
    bestMonths: "All year (dry season best)",
    difficulty: "Moderate (stairs)",
    tips: "Be respectful: cover shoulders and remove hats inside the sanctuary.",
    rating: 4.5,
  },
  {
    id: "hidden10",
    title: "Mango Row Boats",
    subtitle: "Floating fruit stalls & morning chatter",
    desc: "A lively stretch of narrow waterways where vendors sell fresh fruits from small boats — colorful, aromatic, and a great photo subject.",
    image: hidden10,
    tags: ["market", "food", "boat", "fruit"],
    bestMonths: "Year-round (peak harvest: Jun - Sep)",
    difficulty: "Easy (boat)",
    tips: "Bring small change; sample the seasonal mangoes and sticky rice snacks.",
    rating: 4.6,
  },
];

const buildShareText = (g) => `${g.title} — ${g.subtitle}\n${g.desc}\n\nCheck it out: ${window.location.origin}/gems/${g.id}`;

export default function HiddenGems() {
  const [selected, setSelected] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareGem, setShareGem] = useState(null);
  const [toast, setToast] = useState(null);

  const [idx, setIdx] = useState(0);
  const autoplayRef = useRef(null);
  const gestureRef = useRef({ startX: 0, dx: 0 });
  const carouselRef = useRef(null);
  const AUTOPLAY_MS = 4200;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const images = GEMS.map((g) => g.image);

  const [plans, setPlans] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingGem, setBookingGem] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: "", people: 2, note: "" });

  // NEW: processing state while sending booking to backend
  const [processingBooking, setProcessingBooking] = useState(false);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const visibleGems = GEMS
    .filter((g) => {
      if (activeTag && !g.tags.includes(activeTag)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.tags.join(" ").toLowerCase().includes(q)
      );
    })
    .slice()
    .sort((a, b) => (sortBy === "rating" ? b.rating - a.rating : b.rating - a.rating));

  const next = useCallback(() => setIdx((i) => (i + 1) % GEMS.length), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + GEMS.length) % GEMS.length), []);

  useEffect(() => {
    autoplayRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(autoplayRef.current);
  }, [next]);

  const pauseAutoplay = () => clearInterval(autoplayRef.current);
  const resumeAutoplay = () => {
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(next, AUTOPLAY_MS);
  };

  function onTouchStart(e) {
    pauseAutoplay();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    gestureRef.current.startX = x;
    gestureRef.current.dx = 0;
  }
  function onTouchMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    gestureRef.current.dx = x - gestureRef.current.startX;
  }
  function onTouchEnd() {
    const dx = gestureRef.current.dx;
    if (dx > 60) prev();
    else if (dx < -60) next();
    gestureRef.current.dx = 0;
    resumeAutoplay();
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") {
        setSelected(null);
        setLightboxOpen(false);
        setShareModalOpen(false);
        setBookingOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const quickShare = async (g) => {
    const url = `${window.location.origin}/gems/${g.id}`;
    const text = buildShareText(g);
    if (navigator.share) {
      try {
        await navigator.share({ title: g.title, text, url });
        setToast("Shared via native share");
        setTimeout(() => setToast(null), 2000);
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard — paste anywhere to share 💫");
      setTimeout(() => setToast(null), 2200);
    } catch (e) {
      alert(`Share link: ${url}`);
    }
  };

  const openShareModal = (g) => {
    setShareGem(g);
    setShareModalOpen(true);
  };

  const openLightbox = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const downloadImage = (url, filename = "image.png") => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const allTags = Array.from(new Set(GEMS.flatMap((g) => g.tags))).sort();

  const startBooking = (g) => {
    setBookingGem(g);
    setBookingForm({ date: "", people: 2, note: "" });
    setBookingOpen(true);
  };

  // UPDATED: send booking to backend and add server response to plans
  const confirmBooking = async () => {
    if (!bookingForm.date) {
      setToast("Pick a date to book ✨");
      setTimeout(() => setToast(null), 1600);
      return;
    }

    // create local plan item for UI (price calculation same as before)
    const price = Math.round(800 + Math.random() * 1200);

    // Build booking payload expected by your Spring Boot Booking entity
    const payload = {
      userId: 1, // replace with real user id when you have auth
      type: "guide",
      city: bookingGem.title,
      checkin: bookingForm.date, // backend will receive e.g. "2025-10-09" - your entity uses LocalDateTime; backend may parse/adjust
      nights: 1,
      guests: bookingForm.people,
      perUnit: price,
      extrasCost: 0,
      subtotal: price,
      discount: 0,
      taxes: 0,
      total: price,
      status: "confirmed",
      // latitude/longitude left null
    };

    setProcessingBooking(true);
    try {
      const res = await fetch("http://localhost:8083/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Booking failed: ${res.status} ${text}`);
      }

      const saved = await res.json();
      // The backend returns the saved Booking (with bookingId) — adapt UI plan to show id and server fields
      const newPlan = {
        id: saved.bookingId ? `bk-${saved.bookingId}` : `${bookingGem.id}-${Date.now()}`,
        gemId: bookingGem.id,
        title: bookingGem.title,
        date: bookingForm.date,
        people: bookingForm.people,
        note: bookingForm.note,
        price: saved.total ?? price,
        bookingRaw: saved,
      };

      setPlans((p) => [newPlan, ...p]);
      setBookingOpen(false);
      setSelected(null);
      setToast("🌸 Your guide is booked (server)!");

      setTimeout(() => setToast(null), 2200);
    } catch (err) {
      console.error(err);
      setToast("Booking failed — try again.");
      setTimeout(() => setToast(null), 2200);
    } finally {
      setProcessingBooking(false);
    }
  };

  const addToPlanQuick = (g) => {
    const quick = { id: `${g.id}-quick-${Date.now()}`, gemId: g.id, title: g.title, date: "Flexible", people: 2, note: "", price: 0 };
    setPlans((p) => [quick, ...p]);
    setToast("🗓️ Added to your travel plan!");
    setTimeout(() => setToast(null), 1800);
  };

  const removePlan = (id) => setPlans((p) => p.filter((x) => x.id !== id));

  const tagCounts = allTags.reduce((acc, t) => {
    acc[t] = GEMS.filter((g) => g.tags.includes(t)).length;
    return acc;
  }, {});

  return (
    <div className="hg-root">
      <div className="container">
        {/* Back button top-left */}
        <button
          className="back-btn-hero"
          onClick={() => window.history.back()}
          aria-label="Go back"
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            zIndex: 1500,
            background: "rgba(255,255,255,0.12)",
            border: "none",
            padding: "8px 12px",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <section className="hg-hero">
          <div className="hg-left">
            <h1 className="hg-title">✨ Hidden Gems — Discover the Locals' Secrets</h1>
            <p className="hg-sub">Handpicked secret spots, micro-guides, and beautiful share cards — made cute.</p>

            <div className="controls-row">
              {/* replaced the free-text search with tag dropdown per request */}
              <select
                aria-label="Filter tag (quick)"
                className="input"
                value={activeTag}
                onChange={(e) => setActiveTag(e.target.value)}
                style={{ height: 44, minWidth: 220, padding: "10px 14px", fontWeight: 800 }}
              >
                <option value="">Filter: All tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t} ({tagCounts[t]})
                  </option>
                ))}
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select" aria-label="Sort">
                <option value="popular">Sort: Popular</option>
                <option value="rating">Sort: Rating</option>
              </select>

              <div className="hg-actions">
                <button className="btn btn-ghost" onClick={() => { setIdx(0); carouselRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
                  Explore Stories
                </button>
                <button className="btn btn-primary" onClick={() => setSelected(GEMS[0])}>
                  Quick Peek
                </button>
                <button className="btn btn-ghost" onClick={() => openLightbox(idx)} title="Open gallery">
                  <ZoomIn size={14} /> Gallery
                </button>
              </div>
            </div>
          </div>

          <div className="hg-right">
            {/* simplified: single dropdown for tags on the right as well */}
            <div className="filter-header" style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end" }}>
              <span>Filter by tag</span>
              <select
                className="tag-dropdown"
                value={activeTag}
                onChange={(e) => setActiveTag(e.target.value)}
                aria-label="Filter by tag"
                style={{ padding: "8px 12px", borderRadius: 10, fontWeight: 800 }}
              >
                <option value="">All ({GEMS.length})</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t} ({tagCounts[t]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* STORIES */}
        <section
          className="hg-stories"
          ref={carouselRef}
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
        >
          <div className="stories-left">
            <button className="control" onClick={prev} aria-label="Previous story"><ArrowLeftCircle size={28} /></button>
          </div>

          <div className="stories-track">
            <AnimatePresence initial={false} mode="wait">
              {GEMS.map((g, i) =>
                i === idx ? (
                  <motion.article key={g.id} className="story-card" initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -8 }} transition={{ duration: 0.36 }}>
                    <div className="story-inner">
                      <div className="story-media" style={{ backgroundImage: `url(${g.image})` }}>
                        <div className="story-overlay" />
                        <div className="story-top">
                          <span className="story-badge">✨ Story</span>
                          <div className="story-chips">{g.tags.map((t) => <span key={t} className="chip mini">{t}</span>)}</div>
                        </div>

                        <div className="story-title">
                          <h3>{g.title}</h3>
                          <div className="sub">{g.subtitle}</div>
                        </div>
                      </div>

                      <div className="story-right">
                        <div className="meta-row">
                          <div className="rating">{g.rating} ★</div>
                          <div className="meta-sub">{g.bestMonths}</div>
                          <div className="meta-sub">• {g.difficulty}</div>
                        </div>

                        <p className="desc">{g.desc}</p>

                        <div className="tips-row">
                          <strong>Tips:</strong>
                          <div className="tips">{g.tips}</div>
                        </div>

                        <div className="story-ctas">
                          <div className="cta-left">
                            <button className="btn btn-primary" onClick={() => startBooking(g)}>✨ Book Guide</button>
                            <button className="btn btn-ghost" onClick={() => addToPlanQuick(g)}>➕ Add to Plan</button>
                            <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/gems/${g.id}`); setToast("Link copied to clipboard"); setTimeout(() => setToast(null), 2000); }}>📋 Copy link</button>
                          </div>

                          <div className="cta-right">
                            <button className="btn btn-ghost" onClick={() => quickShare(g)}><Share2 size={14} /> Share</button>
                            <button className="btn btn-ghost" onClick={() => { setSelected(g); setShareGem(g); setShareModalOpen(true); }}><Share2 size={14} /> Social</button>
                            <button className="btn btn-ghost" onClick={() => { alert("Saved to your gems ✨"); }}><Heart size={14} /> Save</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ) : null
              )}
            </AnimatePresence>
          </div>

          <div className="stories-right">
            <button className="control" onClick={next} aria-label="Next story"><ArrowRightCircle size={28} /></button>
          </div>

          <div className="stories-indicators">
            {GEMS.map((g, i) => <button key={g.id} className={`dot ${i === idx ? "active" : ""}`} onClick={() => setIdx(i)} aria-label={`Go to ${i + 1}`} />)}
          </div>
        </section>

        {/* GRID + PLANNER */}
        <section className="hg-grid-map">
          <div className="hg-grid">
            {visibleGems.map((g) => (
              <motion.div key={g.id} className="hg-card" whileHover={{ y: -6, scale: 1.02 }} onClick={() => setSelected(g)}>
                <div className="hg-thumb">
                  <img src={g.image} alt={g.title} />
                  <div className="hg-thumb-badge">★</div>
                </div>

                <div className="hg-body">
                  <div className="hg-title-row">
                    <div>
                      <h3>{g.title}</h3>
                      <div className="hg-subtle">{g.subtitle}</div>
                    </div>

                    <div className="small-actions">
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); quickShare(g); }} title="Quick share"><Share2 size={14} /></button>
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); alert("Saved ❤"); }} title="Save"><Heart size={14} /></button>
                    </div>
                  </div>

                  <p className="hg-subtle">{g.desc.length > 120 ? g.desc.slice(0, 120) + "…" : g.desc}</p>

                  <div className="hg-footer">
                    <div className="tags-row">
                      {g.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                    </div>
                    <div className="hg-subtle">{g.rating}★</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <aside className="hg-planner">
            <h3>Trips Basket</h3>

            <div className="planner-box">
              <div className="planner-intro">Save places you want to visit — book a guide or add to plan.</div>

              {plans.length === 0 ? (
                <div className="planner-empty">
                  <div className="empty-title">Your trip basket is empty ✨</div>
                  <div className="empty-sub">Click “Add to Plan” or “Book Guide” on any gem to save it here.</div>
                </div>
              ) : (
                <div className="plans-list">
                  {plans.map((p) => (
                    <div key={p.id} className="plan-item">
                      <img src={GEMS.find((g) => g.id === p.gemId)?.image} alt={p.title} />
                      <div className="meta">
                        <div className="title">{p.title}</div>
                        <div className="info">{p.date} • {p.people} ppl</div>
                        {p.note ? <div className="note">{p.note}</div> : null}
                      </div>
                      <div className="price">{p.price ? `₹${p.price}` : "Free"}</div>
                      <button className="plan-remove" onClick={() => removePlan(p.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tip-note">Tip: plans are saved locally for this demo. Use the Book flow to try a playful booking card.</div>
          </aside>
        </section>

        {/* Detail modal: reorganized */}
        <AnimatePresence>
          {selected && (
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-card" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}>
                <div className="modal-head">
                  <div>
                    <h2 className="modal-title">{selected.title}</h2>
                    <div className="hg-subtle modal-sub">{selected.subtitle} • {selected.bestMonths} • {selected.difficulty}</div>
                  </div>
                  <div>
                    <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close modal"><X size={18} /></button>
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="modal-left">
                    <img src={selected.image} alt={selected.title} className="modal-image" />
                    <div className="modal-action-row">
                      <button className="icon-vertical" onClick={() => quickShare(selected)} title="Share"><span className="vertical-badge">Share</span><Share2 size={16} /></button>
                      <button className="icon-vertical" onClick={() => openShareModal(selected)} title="Social"><span className="vertical-badge">Social</span><Share2 size={16} /></button>
                      <button className="icon-vertical" onClick={() => downloadImage(selected.image, `${selected.id}.png`)} title="Download"><span className="vertical-badge">Download</span><Download size={16} /></button>
                      <button className="icon-vertical" onClick={() => setLightboxOpen(true)} title="Open gallery"><span className="vertical-badge">Gallery</span><ZoomIn size={16} /></button>
                    </div>
                  </div>

                  <div className="modal-right">
                    <p className="modal-desc">{selected.desc}</p>

                    <div className="modal-section">
                      <strong>Tags</strong>
                      <div className="tags-row modal-tags">{selected.tags.map((t) => <span key={t} className="tag-pill-inline">{t}</span>)}</div>
                    </div>

                    <div className="modal-section">
                      <strong>Tips</strong>
                      <div className="tips">{selected.tips}</div>
                    </div>

                    <div className="modal-cta-group">
                      <button className="btn btn-primary" onClick={() => startBooking(selected)}>✨ Book Guide</button>
                      <button className="btn btn-ghost" onClick={() => addToPlanQuick(selected)}>➕ Add to Plan</button>
                      <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/gems/${selected.id}`); setToast("Link copied to clipboard"); setTimeout(() => setToast(null), 2000); }}>📋 Copy link</button>
                    </div>

                    <div className="modal-section">
                      <strong>Community Notes</strong>
                      <ul className="community-notes">
                        <li>Parking available 800m from the trailhead.</li>
                        <li>Best visited early to avoid crowds.</li>
                        <li>Support local vendors — bring small change.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking card, lightbox, share modal, toast and trips button (kept concise here) */}
        <AnimatePresence>
          {bookingOpen && bookingGem && (
            <motion.div key="booking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <motion.div className="booking-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="hg-subtle">Booking</div>
                    <div style={{ fontWeight: 800 }}>{bookingGem.title}</div>
                  </div>
                  <button className="icon-btn" onClick={() => setBookingOpen(false)}><X size={16} /></button>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <img src={bookingGem.image} alt={bookingGem.title} style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div className="hg-subtle">{bookingGem.subtitle}</div>
                    <div style={{ marginTop: 8 }}>{bookingGem.desc.slice(0, 90)}…</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ fontSize: 12, width: "100%" }}>
                    Pick date
                    <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))} />
                  </label>

                  <label style={{ fontSize: 12 }}>
                    People
                    <input type="number" min={1} value={bookingForm.people} onChange={(e) => setBookingForm((f) => ({ ...f, people: Number(e.target.value) }))} />
                  </label>

                  <label style={{ fontSize: 12, width: "100%" }}>
                    Note
                    <input placeholder="e.g. prefer morning" value={bookingForm.note} onChange={(e) => setBookingForm((f) => ({ ...f, note: e.target.value }))} />
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={confirmBooking} disabled={processingBooking}>
                    {processingBooking ? "Booking…" : "Confirm Booking"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => { setBookingOpen(false); setToast("Booking cancelled"); setTimeout(() => setToast(null), 1400); }}>Cancel</button>
                </div>

                <div className="hg-subtle" style={{ marginTop: 10 }}>Note: this is a demo booking experience — to make it live, connect to your bookings API.</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lightboxOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lightbox-backdrop">
              <div className="lightbox-wrap">
                <button onClick={() => { setLightboxOpen(false); }} className="icon-btn close-lightbox"><X size={20} /></button>
                <button onClick={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)} className="icon-btn left-lightbox"><ArrowLeftCircle size={28} /></button>
                <img src={images[lightboxIndex]} alt={`Gallery ${lightboxIndex + 1}`} className="lightbox-image" />
                <button onClick={() => setLightboxIndex((i) => (i + 1) % images.length)} className="icon-btn right-lightbox"><ArrowRightCircle size={28} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {shareModalOpen && shareGem && (
            <motion.div className="filter-backdrop solid" onClick={() => setShareModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="dongolo improved" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}>
                <h3>Share {shareGem.title}</h3>
                <div className="share-options">
                  <a className="btn btn-primary" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText(shareGem))}`} target="_blank" rel="noreferrer">Twitter</a>
                  <a className="btn btn-primary" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(buildShareText(shareGem))}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  <a className="btn btn-primary" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/gems/${shareGem.id}`)}`} target="_blank" rel="noreferrer">Facebook</a>
                  <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/gems/${shareGem.id}`); setToast("Link copied to clipboard"); setTimeout(() => setToast(null), 2000); }}>Copy link</button>
                </div>

                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button className="btn btn-ghost" onClick={() => setShareModalOpen(false)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {toast && <div className="hg-toast">{toast}</div>}

        <div className="trips-button">
          <button className="btn btn-primary" onClick={() => { const planner = document.querySelector(".hg-planner"); if (planner) planner.scrollIntoView({ behavior: "smooth", block: "end" }); setToast("Open Trips Basket on the right"); setTimeout(() => setToast(null), 1200); }}>
            🧺 Trips ({plans.length})
          </button>
        </div>
      </div>
    </div>
  );
}
