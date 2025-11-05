// src/components/MoodTripPlanner.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Import assets from src/images (ensure these files exist)
import video6 from "../images/video6.mp4";
import posterImg from "../images/video6-poster.jpg";
import day1 from "../images/day1.png";
import day2 from "../images/day2.png";
import day3 from "../images/day3.png";
import day4 from "../images/day4.png";
import day5 from "../images/day5.png";
import day6 from "../images/day6.png";

const dayImgs = [day1, day2, day3, day4, day5, day6];

// Map moods to emojis + tagline + suggestions
const MOOD_EXAMPLES = {
  adventurous: {
    emoji: "🌄",
    suggested: ["Rishikesh, India", "Queenstown, NZ", "Bali, Indonesia"],
    tagline: "High-energy days with hikes, water sports and offbeat routes."
  },
  romantic: {
    emoji: "💖",
    suggested: ["Santorini, Greece", "Paris, France", "Udaipur, India"],
    tagline: "Candlelit dinners, scenic sunsets and quiet boutique stays."
  },
  relaxing: {
    emoji: "😌",
    suggested: ["Goa, India", "Maui, USA", "Kerala, India"],
    tagline: "Slow mornings, spa time and seaside lounging."
  },
  foodie: {
    emoji: "🍣",
    suggested: ["Lyon, France", "Tokyo, Japan", "Bangkok, Thailand"],
    tagline: "Local markets, chef tables and street food crawls."
  },
  cultural: {
    emoji: "🏛️",
    suggested: ["Kyoto, Japan", "Istanbul, Turkey", "Jaipur, India"],
    tagline: "Temples, neighbourhood walks and immersive local experiences."
  },
  nature: {
    emoji: "🌿",
    suggested: ["Patagonia, Chile", "Sikkim, India", "Banff, Canada"],
    tagline: "Wild landscapes, quiet lakes and starry nights."
  }
};

function pick(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- synthesis mock itinerary fn ---
function synthesizeItinerary({ mood, destination, start, end, budget }) {
  const daysCount = 3 + (Math.random() > 0.5 ? 1 : 0);
  const base = {
    mood,
    destination: destination || pick(MOOD_EXAMPLES[mood]?.suggested || ["Somewhere nice"]),
    dates: { start: start || null, end: end || null },
    budget,
    days: [],
    hotel: null,
    notes: `Generated mock itinerary for a ${mood} trip.`
  };

  const pools = {
    adventurous: [
      { title: "Morning canyon trek", desc: "A guided hike with short scrambling sections and scenic lookouts." },
      { title: "White-water rafting", desc: "Half-day rafting session on Class II-III rapids (brief safety intro included)." },
      { title: "Local zipline", desc: "Fly over the valley — short adrenaline boost with great photos." },
      { title: "Offbeat village visit", desc: "Meet local guides and learn about traditional crafts." }
    ],
    romantic: [
      { title: "Sunset dinner cruise", desc: "Private-style seating, candlelit dinner as the sun dips." },
      { title: "Couples spa & ritual", desc: "A calming spa session with local wellness treatments." },
      { title: "Scenic viewpoint picnic", desc: "Pack a gourmet picnic and watch the sunset together." },
      { title: "Historic old town walk", desc: "Stroll cobbled lanes and find a cozy café." }
    ],
    relaxing: [
      { title: "Beach lounging & reading", desc: "Quiet private beach or shacks with sunbeds and chilled drinks." },
      { title: "Ayurvedic spa", desc: "A gentle massage and relaxation therapy to unwind." },
      { title: "Slow market wander", desc: "Explore a local market without a rush, taste soft snacks." },
      { title: "Poolside sunset cocktails", desc: "Soft music and comfortable loungers to end the day." }
    ],
    foodie: [
      { title: "Street food crawl", desc: "Guided tasting of iconic local snacks and drinks." },
      { title: "Chef's table experience", desc: "A curated multi-course meal with local ingredients." },
      { title: "Market tour & cooking class", desc: "Pick fresh produce and learn a classic local dish." },
      { title: "Fine-dining tasting menu", desc: "A high-end culinary evening with wine pairings." }
    ],
    cultural: [
      { title: "Temple/heritage tour", desc: "A local historian shows hidden meanings and rituals." },
      { title: "Traditional performance", desc: "Watch local music/dance in an intimate venue." },
      { title: "Artisan studio visit", desc: "Meet ceramicists, weavers or painters in their studios." },
      { title: "Neighborhood food & story walk", desc: "Small bites while learning local stories." }
    ],
    nature: [
      { title: "Lake viewpoint walk", desc: "A gentle trail with vistas and picnic spots." },
      { title: "Wildlife spotting drive", desc: "Short guided drive to see local fauna (quiet time)." },
      { title: "Forest bathing / guided nature walk", desc: "Slow paced, mindful walk focusing on the senses." },
      { title: "Stargazing picnic", desc: "Remote spot for clear skies and constellations." }
    ]
  };

  const hotelOptions = {
    adventurous: ["Basecamp Lodge", "Riverside Adventure Inn", "Trailhead Guesthouse"],
    romantic: ["Clifftop Boutique Hotel", "Seaside Suite Retreat", "Old Town Manor"],
    relaxing: ["Lagoon Spa Resort", "Palm Grove Retreat", "Calm Shores Hotel"],
    foodie: ["Chef's Urban Hotel", "Marketside Boutique", "Gourmet Residency"],
    cultural: ["Heritage House Hotel", "Templeview Inn", "Cultural Stay B&B"],
    nature: ["Forest Lodge", "Lakeside Cabin", "Mountain Retreat"]
  };

  const pool = pools[mood] || pools.relaxing;
  for (let i = 1; i <= daysCount; i++) {
    const activities = [];
    const count = 2 + (Math.random() > 0.5 ? 1 : 0);
    const used = new Set();
    for (let j = 0; j < count; j++) {
      let candidate;
      do {
        candidate = pick(pool);
      } while (used.has(candidate.title) && used.size < pool.length);
      used.add(candidate.title);
      activities.push({ title: candidate.title, desc: candidate.desc });
    }
    base.days.push({
      day: i,
      title: i === 1 ? "Arrival & settle in" : `${mood[0].toUpperCase() + mood.slice(1)} day ${i}`,
      activities,
      hidden_gem: `Local spot ${i} — a lesser-known place recommended by locals.`
    });
  }

  base.hotel = {
    name: pick(hotelOptions[mood] || hotelOptions.relaxing),
    price_est: `$${Math.max(60, Math.round((budget || 200) * (0.25 + Math.random() * 0.9)))} / night`
  };

  base.summary = `${base.mood[0].toUpperCase() + base.mood.slice(1)} trip to ${base.destination} • ${
    base.days.length
  } days • est ${base.hotel.price_est}`;
  return base;
}

export default function MoodTripPlanner() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("adventurous");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState(300);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // ===== Inject updated CSS (glass mood buttons added here) =====
  useEffect(() => {
    const id = "mood-trip-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `

      :root{--g-a:#3ee7a4;--g-b:#ffb86b;--muted:#5b6b66;--ink:#000000;}


      /* video sits below everything */
      .video-background{position:fixed;inset:0;z-index:99997;overflow:hidden;background:#000}
      .video-background video, .video-background img{width:100%;height:100%;object-fit:cover;display:block;opacity:0.86;filter:brightness(0.95)}

      .mood-backdrop{position:fixed;inset:0;z-index:99998;background:transparent;backdrop-filter:blur(0px);transition:opacity .24s ease;}
      .home-root.dark .mood-backdrop{background:rgba(0,0,0,0.42);}

      .mood-overlay{position:fixed;right:28px;top:80px;width:560px;max-width:calc(100% - 48px);z-index:99999;border-radius:18px;overflow:hidden;
        box-shadow:0 30px 100px rgba(6,22,18,0.22);border:1px solid rgba(6,22,18,0.06);max-height:92vh;font-family:'Poppins',system-ui,sans-serif;
        background:linear-gradient(180deg, rgba(255,255,255,0.92), rgba(250,250,252,0.95));backdrop-filter: blur(6px)}

      .mood-head{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(90deg,var(--g-a),var(--g-b));color:white}
      .mood-logo{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.12);font-weight:900}
      .mood-title{font-size:1.05rem;font-weight:800}
      .mood-sub{font-size:12px;opacity:.96}
      .mood-controls{display:flex;gap:8px;align-items:center}
      .action-small{padding:10px 14px;border-radius:10px;border:none;background:linear-gradient(90deg,var(--g-a),var(--g-b));color:white;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,0.18)}

      .mood-body{padding:16px;overflow-y:auto;max-height:calc(92vh - 220px);scrollbar-width:thin}
      .mood-body::-webkit-scrollbar{width:10px}
      .mood-body::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--g-a),var(--g-b));border-radius:8px}

      /* 🔥 NEW GLASS STYLE MOOD BUTTONS */
      .mood-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        justify-content:center;
        margin-bottom:12px;
        margin-top:4px;
      }
      .mood-chip{
        display:flex;
        align-items:center;
        gap:6px;
        padding:8px 16px;
        font-size:14px;
        font-weight:700;
        border-radius:30px;
        cursor:pointer;
        border:1px solid rgba(255,255,255,0.4);
        background:rgba(255,255,255,0.25);
        backdrop-filter:blur(6px);
        -webkit-backdrop-filter:blur(6px);
        color:var(--ink);
        transition:all .18s ease;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
      }
      .mood-chip:hover{
        transform:translateY(-3px);
        box-shadow:0 6px 18px rgba(0,0,0,0.18);
      }
      .mood-chip.active{
        background:linear-gradient(90deg,var(--g-a),var(--g-b));
        border-color:transparent;
        color:white;
        box-shadow:0 8px 26px rgba(62,231,164,0.28);
        transform:translateY(-3px);
      }
      .mood-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
      .mood-input{padding:10px 12px;border-radius:10px;border:1px solid rgba(6,22,18,0.06);background:rgba(255,255,255,0.96);width:100%}

      .btn-generate{padding:12px 16px;border-radius:12px;border:none;cursor:pointer;color:white;font-weight:900;
        background:linear-gradient(90deg,var(--g-a),var(--g-b));flex:1;box-shadow:0 12px 30px rgba(62,231,164,0.18)}
      .btn-ghost{padding:10px 12px;border-radius:12px;border:1px solid rgba(6,22,18,0.06);background:transparent;cursor:pointer}

      .mood-result{margin-top:14px;background:linear-gradient(180deg, rgba(255,255,255,0.98), #fbfbff);border-radius:12px;padding:12px;border:1px solid rgba(6,22,18,0.04);box-shadow:0 10px 28px rgba(6,22,18,0.04)}
      .mood-summary{display:flex;justify-content:space-between;align-items:center;gap:8px}

      .mood-day{margin-top:12px;padding-top:10px;border-top:1px dashed rgba(6,22,18,0.03);display:flex;gap:12px;align-items:flex-start}
      .day-image{width:120px;height:80px;object-fit:cover;border-radius:10px;border:1px solid rgba(0,0,0,0.03);box-shadow:0 8px 18px rgba(0,0,0,0.06)}

      .mood-activity{display:flex;gap:10px;align-items:flex-start;margin-top:8px;flex:1}
      .activity-bullet{width:8px;height:8px;border-radius:50%;background:linear-gradient(90deg,var(--g-a),var(--g-b));margin-top:10px;flex:0 0 8px}
      .activity-text{font-size:13px;color:var(--ink)}

      .mood-footer{display:flex;gap:8px;justify-content:space-between;align-items:center;padding:12px;border-top:1px solid rgba(6,22,18,0.03);background:#fafafa}

      @media (max-width:760px){
        .mood-overlay{left:12px;right:12px;width:auto;top:60px;max-height:86vh}
        .mood-grid{grid-template-columns:1fr}
        .mood-day{flex-direction:column}
        .day-image{width:100%;height:160px}
      }
        .mood-input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(6,22,18,0.06);
  background: rgba(255,255,255,0.96);
  width: 100%;
  color: #000; /* <-- makes actual input text black */
}

/* placeholder color */
.mood-input::placeholder {
  color: #000 !important; /* <-- force black placeholder */
  opacity: 0.7; /* optional, remove if you want full black */
}

    `;
    document.head.appendChild(style);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  // External event to open
  useEffect(() => {
    const openHandler = (e) => {
      if (e?.detail?.mood) setMood(e.detail.mood);
      setOpen(true);
    };
    window.addEventListener("openMoodPlanner", openHandler);
    return () => window.removeEventListener("openMoodPlanner", openHandler);
  }, []);

  const goHome = useCallback(() => {
    setOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  // Play/pause background video
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (open) {
      try {
        vid.currentTime = 0;
      } catch (e) {}
      const p = vid.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          try {
            vid.muted = true;
            vid.play().catch(() => {});
          } catch (e) {}
        });
      }
    } else {
      try {
        vid.pause();
      } catch (e) {}
    }
  }, [open]);

  // generate itinerary
  const generate = async (mockAuto = false) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    let dest = destination;
    if (mockAuto && !dest) {
      const cand = MOOD_EXAMPLES[mood]?.suggested || [];
      dest = pick(cand);
      setDestination(dest);
    }

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await wait(600 + Math.random() * 300);
    await wait(350 + Math.random() * 400);

    try {
      const plan = synthesizeItinerary({ mood, destination: dest, start, end, budget });
      plan.days = plan.days.map((d, i) => ({
        ...d,
        image: dayImgs[i % dayImgs.length] || null,
        hidden_gems: [
          {
            name: `${d.title} - Hidden Spot`,
            reason: `A quiet local favorite; great for photos.`,
            google_maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${plan.destination} ${d.title}`
            )}`
          }
        ]
      }));
      setItinerary(plan);
    } catch (err) {
      setError("Something went wrong generating your trip — try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSurprise = () => generate(true);

  const handleDownload = () => {
    if (!itinerary) return;
    const blob = new Blob([JSON.stringify(itinerary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(itinerary.destination || "mood-trip")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!itinerary) return alert("Generate an itinerary first.");
    if (navigator.share)
      navigator
        .share({
          title: `My ${itinerary.mood} trip to ${itinerary.destination}`,
          text: itinerary.summary,
          url: window.location.href
        })
        .catch(() => {});
    else
      navigator.clipboard
        .writeText(`${itinerary.summary}\n\n${JSON.stringify(itinerary, null, 2)}`)
        .then(() => alert("Copied itinerary summary to clipboard"))
        .catch(() => alert("Share not supported here — download instead"));
  };

  const handleExplore = () => {
    const slug = slugify(destination || (itinerary && itinerary.destination) || "destination");
    navigate(`/explore/${slug}?source=mood`);
    setOpen(false);
  };

  // If closed, show small launcher
  if (!open) {
    return (
      <div style={{ position: "fixed", right: 20, top: 96, zIndex: 99999 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(90deg,#3ee7a4,#ffb86b)",
            color: "#042f28",
            fontWeight: 900,
            boxShadow: "0 10px 30px rgba(62,231,164,0.12)",
            cursor: "pointer"
          }}
          aria-label="Open Mood Trip Planner"
        >
          Open Mood Trip Planner
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Background video */}
      <div
        className="video-background"
        aria-hidden
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            src={video6}
            poster={posterImg}
            onError={() => setVideoError(true)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img src={posterImg} alt="background poster" onClick={(e) => e.stopPropagation()} />
        )}
      </div>

      {/* backdrop */}
      <div className="mood-backdrop" onClick={() => setOpen(false)} aria-hidden />

      {/* main overlay */}
      <div className="mood-overlay" role="dialog" aria-label="Mood Trip Planner">
        <div className="mood-head">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="mood-logo">TF</div>
            <div>
              <div className="mood-title">Mood Trip Planner</div>
              <div className="mood-sub">{MOOD_EXAMPLES[mood]?.tagline}</div>
            </div>
          </div>

          <div className="mood-controls">
            <button className="action-small" onClick={() => setOpen(false)}>
              Hide
            </button>
            <button className="action-small" onClick={handleSurprise}>
              Surprise me
            </button>
            <button className="action-small" onClick={goHome}>
              Back
            </button>
          </div>
        </div>

        <div className="mood-body" aria-live="polite">
          {/* 🔥 MOOD SELECTOR with glass pills */}
          <div className="mood-row" role="tablist" aria-label="Mood selector">
            {Object.keys(MOOD_EXAMPLES).map((m) => {
              const { emoji } = MOOD_EXAMPLES[m];
              return (
                <button
                  key={m}
                  className={`mood-chip ${m === mood ? "active" : ""}`}
                  onClick={() => {
                    setMood(m);
                    if (!open) setOpen(true);
                  }}
                  aria-pressed={m === mood}
                >
                  <span>{emoji}</span>
                  <span style={{ textTransform: "capitalize" }}>{m}</span>
                </button>
              );
            })}
          </div>

          {/* inputs */}
          <div className="mood-grid">
            <input
              className="mood-input"
              placeholder="Destination (leave blank to auto-suggest)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-label="Destination"
            />
            <input
              className="mood-input"
              type="number"
              min={50}
              placeholder="Budget per person (USD)"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value || 0))}
              aria-label="Budget"
            />
            <input
              className="mood-input"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              aria-label="Start date"
            />
            <input
              className="mood-input"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-label="End date"
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
            <button
              className="btn-generate"
              onClick={() => generate(false)}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Thinking…" : "Generate itinerary"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setDestination("");
                setStart("");
                setEnd("");
                setItinerary(null);
                setError(null);
              }}
            >
              Reset
            </button>
          </div>

          {error && <div style={{ marginTop: 12, color: "#b00020", fontWeight: 700 }}>{error}</div>}

          {/* skeleton loader */}
          {loading && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{ height: 12, width: "60%", background: "#eee", borderRadius: 6, marginBottom: 10 }}
              />
              <div
                style={{ height: 10, width: "30%", background: "#eee", borderRadius: 6, marginBottom: 18 }}
              />
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 8,
                      background: "#eee",
                      marginTop: 6
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 10,
                        width: `${60 - i * 8}%`,
                        background: "#eee",
                        borderRadius: 6,
                        marginBottom: 8
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        width: `${40 - i * 6}%`,
                        background: "#eee",
                        borderRadius: 6
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* itinerary output */}
          {itinerary && !loading && (
            <div className="mood-result" role="region" aria-label="Generated itinerary">
              <div className="mood-summary">
                <div style={{ fontWeight: 800 }}>{itinerary.summary}</div>
                <div style={{ color: "var(--muted)" }}>
                  {itinerary.dates.start || ""}
                  {itinerary.dates.end ? ` — ${itinerary.dates.end}` : ""}
                </div>
              </div>

              {itinerary.days.map((d, idx) => (
                <div key={idx} className="mood-day" aria-labelledby={`day-${idx}`}>
                  {d.image ? (
                    <img
                      src={d.image}
                      alt={`Day ${d.day}`}
                      className="day-image"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div style={{ width: 120, height: 80, borderRadius: 10, background: "#fff" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div id={`day-${idx}`} style={{ fontWeight: 800 }}>{`Day ${d.day}: ${d.title}`}</div>
                    {(d.activities || []).map((a, j) => (
                      <div key={j} className="mood-activity">
                        <div className="activity-bullet" aria-hidden />
                        <div className="activity-text">
                          <div style={{ fontWeight: 700 }}>{a.title}</div>
                          <div style={{ color: "var(--muted)", marginTop: 4 }}>{a.desc}</div>
                        </div>
                      </div>
                    ))}
                    {d.hidden_gems &&
                      d.hidden_gems.map((g, gi) => (
                        <div key={gi} style={{ marginTop: 8, color: "#2d635b", fontWeight: 700 }}>
                          ✨ Hidden gem:{" "}
                          <a href={g.google_maps} target="_blank" rel="noreferrer">
                            {g.name}
                          </a>{" "}
                          —{" "}
                          <span style={{ fontWeight: 500, color: "var(--muted)" }}>{g.reason}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 12, fontWeight: 700 }}>
                🏨 Suggested hotel: {itinerary.hotel.name} •{" "}
                <span style={{ fontWeight: 600 }}>{itinerary.hotel.price_est}</span>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn-generate" onClick={handleShare}>
                  Share
                </button>
                <button className="btn-ghost" onClick={handleDownload}>
                  Download JSON
                </button>
                <button className="btn-ghost" onClick={handleExplore}>
                  Explore
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mood-footer">
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Mock AI — realistic plans. Swap to API when ready.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={goHome}>
              Home
            </button>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Hide
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
