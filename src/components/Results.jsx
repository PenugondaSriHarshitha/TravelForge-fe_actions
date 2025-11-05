// src/components/Results.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./Results.css";
import Booking from "./Booking";

/* ===========================
   Simple API fetch helper
   =========================== */
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  (typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_API_BASE || ""
    : "") ||
  "";

async function apiFetch(path, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  try {
    const token = localStorage.getItem("auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch (e) {}
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`API error ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/* ===========================
   Helpers
   =========================== */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function priceNumber(p) {
  return Number(String(p || "").replace(/[^\d]/g, "")) || 0;
}

function Recenter({ lat, lng, zoom = 6, instant = false }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    try {
      if (instant) map.setView([lat, lng], Math.max(zoom, 5));
      else map.flyTo([lat, lng], Math.max(zoom, 5), { duration: 0.6 });
    } catch (e) {}
  }, [lat, lng, map, zoom, instant]);
  return null;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateLine([lat1, lng1], [lat2, lng2], segments = 240) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push([lerp(lat1, lat2, t), lerp(lng1, lng2, t)]);
  }
  return pts;
}

function haversine([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => d * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function bearing([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => d * (Math.PI / 180);
  const toDeg = (r) => r * (180 / Math.PI);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}

/* ===========================
   CITY COORDS (trimmed)
   =========================== */
const CITY_COORDS = {
  // Kerala
  Kochi: [9.9312, 76.2673],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kozhikode: [11.2588, 75.7804],
  Kannur: [11.8745, 75.3704],
 // Palakkad: [10.7867, 76.6548],
  //Kollam: [8.8932, 76.6141],
  //Alappuzha: [9.4981, 76.3388],
  //Kottayam: [9.5916, 76.5228],
  //Malappuram: [11.0735, 76.0743],
//  Thrissur: [10.5276, 76.2144],

  // Tamil Nadu
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Trichy: [10.7905, 78.7047],
  //Salem: [11.6643, 78.1460],

  // Karnataka
  Bengaluru: [12.9716, 77.5946],
  //Mangalore: [12.9141, 74.8560],
  //Mysuru: [12.2958, 76.6394],
  //Hubli: [15.3647, 75.1239],

  // Andhra / Telangana
  Hyderabad: [17.3850, 78.4867],
  Visakhapatnam: [17.6868, 83.2185],
  Vijayawada: [16.5062, 80.6480],
  Tirupati: [13.6288, 79.4192],
  //Warangal: [18.0000, 79.5833],

  // Maharashtra & Goa
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  //Nagpur: [21.1458, 79.0882],
  //Nashik: [19.9975, 73.7898],
  //Goa: [15.2993, 74.1240],

  // Gujarat & MP
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812],
  //Indore: [22.7196, 75.8577],
  //Bhopal: [23.2599, 77.4126],

  // North India
  //Delhi: [28.6139, 77.2090],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  //Kanpur: [26.4499, 80.3319],
  //Chandigarh: [30.7333, 76.7794],
  //Varanasi: [25.3176, 82.9739],
  //Patna: [25.5941, 85.1376],

  // East & Northeast
  Kolkata: [22.5726, 88.3639],
  Ranchi: [23.3441, 85.3096],
  //Bhubaneswar: [20.2961, 85.8245],
  //Guwahati: [26.1445, 91.7362],

  // ✅ Keep some world cities so map is not India-only
  Paris: [48.8566, 2.3522],
  Rome: [41.9028, 12.4964],
  Bangkok: [13.7563, 100.5018],
  Bali: [-8.4095, 115.1889],
  Lisbon: [38.7223, -9.1393],
  Tokyo: [35.6762, 139.6503],
};

/* ===========================
   Sample data + fun facts
   =========================== */
function genSample(kind, count = 20) {
  const res = [];
  const keys = Object.keys(CITY_COORDS);
  for (let i = 0; i < count; i++) {
    const k = keys[i % keys.length];
    const [lat, lng] = CITY_COORDS[k];
    res.push({
      id: `${kind[0].toUpperCase()}${String(i + 1).padStart(3, "0")}`,
      kind,
      city: k,
      title:
        kind === "flights"
          ? `${k} — ${["City break", "Island escape", "Culture"][i % 3]}`
          : `${k} — Stay`,
      price: `$${80 + Math.floor(Math.random() * 520)}`,
      lat,
      lng,
      stops: ["nonstop", "1", "2+"][i % 3],
      category: ["budget", "any", "premium"][i % 3],
      airline: ["IndiGo", "SpiceJet", "Air India"][i % 3],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
    });
  }
  return res;
}

const sample = {
  flights: genSample("flights", 40),
  stays: genSample("stays", 18),
  cars: genSample("cars", 12),
  packages: genSample("packages", 10),
};

const FUN_FACTS = [
  {
     city: "Delhi", landmark: "India Gate", fact: "Built in 1931 as a WW1 memorial.", lat: 28.6139, lng: 77.2090 },
  { city: "Jaipur", landmark: "Hawa Mahal", fact: "Has 953 windows for royal women to watch street life unseen.", lat: 26.9124, lng: 75.7873 },
  { city: "Mumbai", landmark: "Gateway of India", fact: "Built in 1924 to welcome King George V.", lat: 18.9219, lng: 72.8347 },
  { city: "Varanasi", landmark: "Ganga Ghats", fact: "Oldest living city in the world.", lat: 25.3176, lng: 82.9739 },
  { city: "Goa", landmark: "Basilica of Bom Jesus", fact: "Holds 400-year-old remains of St. Francis Xavier.", lat: 15.3000, lng: 74.1240 },
  { city: "Hyderabad", landmark: "Charminar", fact: "Built in 1591 to mark the end of a plague.", lat: 17.3616, lng: 78.4747 },
  { city: "Chennai", landmark: "Marina Beach", fact: "Second longest urban beach in the world.", lat: 13.0494, lng: 80.2824 },
  { city: "Bengaluru", landmark: "Vidhana Soudha", fact: "Built in 1956 and called the 'Temple of Democracy'.", lat: 12.9790, lng: 77.5913 },
  {
    lat: 41.9028,
    lng: 12.4964,
    city: "Rome",
    country: "Italy",
    landmark: "Colosseum",
    fact: "The Colosseum could hold 50,000 spectators.",
  },
];

/* ===========================
   Quiz modal
   =========================== */
function QuizModal({ open, fact, onClose, onScore }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!open || !fact) return null;

  const correct = fact.landmark;
  const others = FUN_FACTS.filter((f) => f.landmark !== correct).map(
    (f) => f.landmark
  );
  const choices = [correct];
  while (choices.length < 3 && others.length) {
    const pick = others.splice(Math.floor(Math.random() * others.length), 1)[0];
    if (pick) choices.push(pick);
  }
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  function submit() {
    const isCorrect = selected === correct;
    onScore(isCorrect ? 1 : 0);
    onClose();
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <h3>Quick trivia</h3>
        <p style={{ color: "#5c6f68" }}>Which landmark is described?</p>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          {fact.city} • <span style={{ fontWeight: 600 }}>{fact.country}</span>
        </div>
        <div style={{ marginBottom: 12 }}>{fact.fact}</div>

        <div className="quiz-options">
          {choices.map((c) => (
            <button
              key={c}
              className={`quiz-opt ${selected === c ? "selected" : ""}`}
              onClick={() => setSelected(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-cta" onClick={submit} disabled={!selected}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   MAIN COMPONENT
   =========================================================== */
export default function Results() {
  const query = useQuery();
  const navigate = useNavigate();

  const fromParam = query.get("from") || "";
  const fromQ = fromParam.toLowerCase();
  const initialTab = query.get("tab") || "flights";

  /* ---------- UI state ---------- */
  const [sortBy, setSortBy] = useState("best");
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("tm_view_mode") || "map"
      : "map"
  );
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stopFilter, setStopFilter] = useState("any");
  const [airlineFilter, setAirlineFilter] = useState("any");

  /* ---------- Booking modal state ---------- */
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingType, setBookingType] = useState("stay");

  /* ---------- Remote results (if backend available) ---------- */
  const [remoteResults, setRemoteResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  /* ---------- Overlay / Flight animation state ---------- */
  const [overlayMode, setOverlayMode] = useState("educational"); // educational | fun | stats
  const [flightPath, setFlightPath] = useState(null);
  const [planePos, setPlanePos] = useState(null);
  const [planeBearing, setPlaneBearing] = useState(0);
  const [planeSpeed, setPlaneSpeed] = useState(780);
  const [planeAltitude, setPlaneAltitude] = useState(35000);
  const [nearFact, setNearFact] = useState(null);
  const [mapFollow, setMapFollow] = useState(true);

  /* ---------- Quiz state ---------- */
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizFact, setQuizFact] = useState(null);
  const [quizScore, setQuizScore] = useState(() =>
    Number(localStorage.getItem("flight_quiz_score") || 0)
  );

  /* ---------- Refs for animation ---------- */
  const animationRef = useRef(null);
  const flightPtsRef = useRef([]);
  const planeTRef = useRef(0);
  const speedMultiplierRef = useRef(1);

  useEffect(() => {
    try {
      localStorage.setItem("tm_view_mode", viewMode);
    } catch (e) {}
  }, [viewMode]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  /* ===========================================================
     LOAD DATA FROM BACKEND (if exists)
     =========================================================== */
  useEffect(() => {
    let abort = false;

    async function load() {
      setLoadingResults(true);
      setResultsError(null);

      try {
        const from = encodeURIComponent(fromParam || "");
        const tab = encodeURIComponent(activeTab || "flights");
        const data = await apiFetch(`/api/search?from=${from}&tab=${tab}`, {
          method: "GET",
        });

        if (!abort) {
          if (Array.isArray(data) && data.length) {
            setRemoteResults(
              data.map((d) => ({
                id:
                  d.id ||
                  d.bookingId ||
                  `${(d.kind || activeTab || "X")[0]}${Math.floor(
                    Math.random() * 9000
                  )}`,
                kind: d.kind || activeTab,
                city: d.city || d.title || "",
                title: d.title || (d.kind ? `${d.kind} in ${d.city}` : d.city),
                price: d.price || `$${d.total || 0}`,
                lat: d.lat ?? d.latitude ?? null,
                lng: d.lng ?? d.longitude ?? null,
                stops: d.stops,
                category: d.category || "any",
                airline: d.airline || "any",
                rating: d.rating || 4.2,
              }))
            );
          } else {
            setRemoteResults(null);
          }
        }
      } catch (err) {
        if (!abort) {
          setResultsError(err.message || String(err));
          setRemoteResults(null);
        }
      } finally {
        if (!abort) setLoadingResults(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [fromParam, activeTab, sortBy, stopFilter, airlineFilter]);

  /* ===========================================================
     COMPUTED RESULTS (fallback to sample if no backend data)
     =========================================================== */
  const results = useMemo(() => {
    // if (remoteResults && remoteResults.length) return remoteResults;
    if (activeTab === "flights") return sample.flights;
    if (activeTab === "stays") return sample.stays;
    if (activeTab === "cars") return sample.cars;
    if (activeTab === "packages") return sample.packages;
    return sample.flights;
  }, [remoteResults, activeTab]);

  const counts = useMemo(() => {
    const total = results.length;
    const budget = results.filter((r) =>
      (r.category || "").toLowerCase().includes("budget")
    ).length;
    const premium = results.filter((r) =>
      (r.category || "").toLowerCase().includes("premium")
    ).length;
    return { total, budget, premium };
  }, [results]);

  // LEFT LIST (filters apply here)
  const filtered = useMemo(() => {
    let list = [...results];

    if (activeTab === "flights" && stopFilter !== "any") {
      if (stopFilter === "2+") {
        list = list.filter((r) => r.stops === "2+");
      } else {
        list = list.filter((r) => r.stops === stopFilter);
      }
    }

    if (activeTab === "flights" && airlineFilter !== "any") {
      list = list.filter((r) => r.category === airlineFilter);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => priceNumber(a.price) - priceNumber(b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => priceNumber(b.price) - priceNumber(a.price));
    } else {
      list.sort((a, b) => priceNumber(a.price) - priceNumber(b.price));
    }

    return list;
  }, [results, stopFilter, airlineFilter, sortBy, activeTab]);

  const center = useMemo(() => {
    const found = results.find((r) => r.id === selectedId);
    if (found) return [found.lat, found.lng];
    if (results.length) return [results[0].lat, results[0].lng];
    return [20.5937, 78.9629];
  }, [results, selectedId]);

  /* ===========================================================
     BOOKING ACTION
     =========================================================== */
  function goToBooking(id, item) {
    const el = document.querySelector(`article[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("flash-highlight");
      setTimeout(() => el.classList.remove("flash-highlight"), 1400);
    }

    setBookingItem(item || null);

    if (item?.kind === "flights") setBookingType("flight");
    else if (item?.kind === "stays") setBookingType("resort");
    else if (item?.kind === "cars") setBookingType("car");
    else if (item?.kind === "packages") setBookingType("package");
    else setBookingType("stay");

    setBookingOpen(true);
  }

  async function handleBookingConfirmed(data) {
    try {
      const payload = { ...(bookingItem || {}), ...data };
      try {
        await apiFetch("/api/bookings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("Booking saved locally only", err);
      }
      setBookingOpen(false);
    } catch (err) {
      alert("Booking failed — check console");
      console.error(err);
    }
  }

  /* ===========================================================
     FLIGHT ANIMATION (start, stop, progress)
     =========================================================== */
  function computeOrigin() {
    const key = Object.keys(CITY_COORDS).find((c) =>
      fromQ.includes(c.toLowerCase())
    );
    if (key) return CITY_COORDS[key];

    if (
      fromQ.includes("kerala") ||
      fromQ.includes("kochi") ||
      fromQ.includes("cochin")
    ) {
      return CITY_COORDS.Kochi;
    }
    return [20.5937, 78.9629];
  }

  function stopFlightOverlay() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    flightPtsRef.current = [];
    planeTRef.current = 0;
    setFlightPath(null);
    setPlanePos(null);
    setNearFact(null);
  }

  async function startFlightOverlay(item) {
    stopFlightOverlay();

    const pts = interpolateLine(computeOrigin(), [item.lat, item.lng], 600);

    flightPtsRef.current = pts;
    setFlightPath(pts);
    setPlanePos(pts[0]);
    setPlaneSpeed(700 + Math.floor(Math.random() * 160));
    setPlaneAltitude(30000 + Math.floor(Math.random() * 8000));
    planeTRef.current = 0;
    speedMultiplierRef.current = 1 + Math.random() * 0.6;

    let lastTs = null;

    function step(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(40, ts - lastTs);
      lastTs = ts;

      const base = 0.0009;
      const speedFactor = (planeSpeed / 900) * speedMultiplierRef.current;

      planeTRef.current = Math.min(
        1,
        planeTRef.current + base * (dt / 16) * speedFactor
      );

      const t = planeTRef.current;
      const idxFloat = t * (pts.length - 1);
      const idx = Math.floor(idxFloat);
      const next = Math.min(pts.length - 1, idx + 1);
      const cur = pts[idx];
      const nxt = pts[next];

      if (cur && nxt) {
        const subT = idxFloat - idx;
        const lat = lerp(cur[0], nxt[0], subT);
        const lng = lerp(cur[1], nxt[1], subT);
        setPlanePos([lat, lng]);
        setPlaneBearing(bearing(cur, nxt));
      }

      setPlaneAltitude((a) =>
        Math.max(5000, Math.round(a + (Math.random() - 0.5) * 20))
      );
      setPlaneSpeed((s) =>
        Math.max(200, Math.round(s + (Math.random() - 0.5) * 8))
      );

      const current = planePos || pts[Math.max(0, Math.floor(idxFloat))];
      const nearest = FUN_FACTS.reduce((acc, f) => {
        if (!current) return acc;
        const d = haversine([f.lat, f.lng], current);
        if (!acc || d < acc.d) return { fact: f, d };
        return acc;
      }, null);

      if (nearest && nearest.d <= 80) {
        setNearFact({
          ...nearest.fact,
          distanceKm: Math.round(nearest.d),
        });
      } else {
        setNearFact(null);
      }

      if (mapFollow) {
        try {
          const mapEl = document.querySelector(".leaflet-container");
          if (mapEl && mapEl._leaflet_map) {
            mapEl._leaflet_map.panTo(planePos || cur, {
              animate: true,
              duration: 0.6,
            });
          }
        } catch (err) {}
      }

      if (planeTRef.current < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    animationRef.current = requestAnimationFrame(step);
  }

  // (Re)start overlay when selecting a flight card/pin
  useEffect(() => {
    if (!selectedId) return;
    const item = results.find((r) => r.id === selectedId);
    if (item?.kind === "flights") startFlightOverlay(item);
    else stopFlightOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeTab]);

  /* ===========================================================
     UI RENDER
     =========================================================== */
  return (
    <motion.main
      className="results-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Quiz modal */}
      <QuizModal
        open={quizOpen}
        fact={quizFact}
        onClose={() => setQuizOpen(false)}
        onScore={(pt) => {
          const newScore = quizScore + (pt || 0);
          setQuizScore(newScore);
          localStorage.setItem("flight_quiz_score", String(newScore));
        }}
      />

      {/* Top Navigation */}
      <div className="results-top">
        <button className="back" onClick={() => navigate("/")}>
          ← Back to home
        </button>

        <div className="top-tabs">
          <button
            className={`tab ${activeTab === "flights" ? "active" : ""}`}
            onClick={() => setActiveTab("flights")}
          >
            ✈️ Flights
          </button>
          <button
            className={`tab ${activeTab === "stays" ? "active" : ""}`}
            onClick={() => setActiveTab("stays")}
          >
            🏨 Stays
          </button>
          <button
            className={`tab ${activeTab === "cars" ? "active" : ""}`}
            onClick={() => setActiveTab("cars")}
          >
            🚗 Cars
          </button>
          <button
            className={`tab ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            🌍 Packages
          </button>
        </div>

        <div className="summary">
          <div className="summary-left">
            <div className="summary-from">
              From <strong>{fromParam || "your city"}</strong>
            </div>
            <div className="summary-meta">
              {activeTab} • {filtered.length} results
            </div>
          </div>

          <div className="top-controls">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: 6 }}
              >
                <option value="best">Recommended</option>
                <option value="price_asc">Price low→high</option>
                <option value="price_desc">Price high→low</option>
              </select>

              <button className="btn-primary" onClick={() => navigate("/")}>
                New search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GRID: LEFT LIST + RIGHT MAP ================= */}
      <div
        className={`results-grid ${
          viewMode === "map" ? "map-full" : "list-full"
        }`}
      >
        {/* ============= LEFT LIST PANEL ============= */}
        <AnimatePresence initial={false} mode="popLayout">
          {viewMode === "list" && (
            <motion.aside
              key="left-panel"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="panel"
            >
              <div className="panel-header">
                <h2>
                  {filtered.length} {activeTab}
                </h2>
              </div>

              {/* Filters */}
              <div className="filters">
                <button
                  className="btn-ghost"
                  style={{ marginBottom: 10 }}
                  onClick={() => {
                    setStopFilter("any");
                    setAirlineFilter("any");
                  }}
                >
                  Clear filters
                </button>

                {activeTab === "flights" && (
                  <>
                    <div className="filter-row">
                      <label>Stops</label>
                      <div className="chips">
                        <button
                          className={`chip ${
                            stopFilter === "nonstop" ? "active" : ""
                          }`}
                          onClick={() =>
                            setStopFilter((v) =>
                              v === "nonstop" ? "any" : "nonstop"
                            )
                          }
                        >
                          Nonstop
                        </button>
                        <button
                          className={`chip ${
                            stopFilter === "1" ? "active" : ""
                          }`}
                          onClick={() =>
                            setStopFilter((v) => (v === "1" ? "any" : "1"))
                          }
                        >
                          1 stop
                        </button>
                        <button
                          className={`chip ${
                            stopFilter === "2+" ? "active" : ""
                          }`}
                          onClick={() =>
                            setStopFilter((v) => (v === "2+" ? "any" : "2+"))
                          }
                        >
                          2+ stops
                        </button>
                      </div>
                    </div>

                    <div className="filter-row">
                      <label>Fare type</label>
                      <div className="chips">
                        <button
                          className={`chip ${
                            airlineFilter === "any" ? "active" : ""
                          }`}
                          onClick={() => setAirlineFilter("any")}
                        >
                          Any ({counts.total})
                        </button>
                        <button
                          className={`chip ${
                            airlineFilter === "budget" ? "active" : ""
                          }`}
                          onClick={() => setAirlineFilter("budget")}
                        >
                          Budget
                        </button>
                        <button
                          className={`chip ${
                            airlineFilter === "premium" ? "active" : ""
                          }`}
                          onClick={() => setAirlineFilter("premium")}
                        >
                          Premium
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* LIST OF RESULTS */}
              <div className="list">
                {filtered.map((r) => {
                  const isActive = selectedId === r.id;
                  return (
                    <article
                      key={r.id}
                      data-id={r.id}
                      className={`result-card ${isActive ? "active" : ""}`}
                      onMouseEnter={() => setSelectedId(r.id)}
                      onClick={() => {
                        setSelectedId(r.id);
                        setViewMode("map");
                      }}
                      role="button"
                      tabIndex={0}
                      style={{
                        // Gold glow for selected card
                        boxShadow: isActive
                          ? "0 0 0 2px rgba(255,204,51,0.9), 0 8px 28px rgba(255,204,51,0.35)"
                          : undefined,
                        border:
                          isActive ? "1px solid rgba(255,204,51,0.8)" : undefined,
                        transition: "box-shadow .25s ease, transform .2s ease",
                        transform: isActive ? "translateY(-1px)" : undefined,
                      }}
                    >
                      <div className="card-body">
                        <div className="card-top">
                          <div className="title">{r.title}</div>
                          <div className="price">{r.price}</div>
                        </div>

                        <div className="card-mid">
                          <div className="sub">
                            {r.city} •{" "}
                            {r.stops ? `${r.stops} stops` : `${r.rating} ★`}
                          </div>
                          <div className="tags">
                            <div className="tag">✈️ {r.airline}</div>
                            <div className="tag">{r.category}</div>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button
                            className="btn-cta"
                            onClick={(e) => {
                              e.stopPropagation();
                              goToBooking(r.id, r);
                            }}
                          >
                            Book now
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(r.id);
                              setViewMode("map");
                            }}
                          >
                            View on map
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ==================== MAP AREA ==================== */}
        <section className="map-area" aria-label="Map of options">
          <div className="map-header">
            <div className="map-title">Explore where you can go</div>

            <div
              className="map-actions"
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <button
                className={`glass ${viewMode === "map" ? "active" : ""}`}
                onClick={() => setViewMode("map")}
              >
                Map view
              </button>
              <button
                className={`glass ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                List view
              </button>

              {activeTab === "flights" && (
                <>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* Auto-start overlay if needed */}
                    <button
                      className={`chip mini-chip ${
                        overlayMode === "educational" ? "active" : ""
                      }`}
                      onClick={() => {
                        setOverlayMode("educational");
                        if (!flightPath) {
                          const f = filtered.find((x) => x.kind === "flights");
                          if (f) {
                            setSelectedId(f.id);
                            setViewMode("map");
                            startFlightOverlay(f);
                          }
                        }
                      }}
                    >
                      Educational
                    </button>

                    <button
                      className={`chip mini-chip ${
                        overlayMode === "fun" ? "active" : ""
                      }`}
                      onClick={() => {
                        setOverlayMode("fun");
                        if (!flightPath) {
                          const f = filtered.find((x) => x.kind === "flights");
                          if (f) {
                            setSelectedId(f.id);
                            setViewMode("map");
                            startFlightOverlay(f);
                          }
                        }
                      }}
                    >
                      Fun
                    </button>

                    <button
                      className={`chip mini-chip ${
                        overlayMode === "stats" ? "active" : ""
                      }`}
                      onClick={() => {
                        setOverlayMode("stats");
                        if (!flightPath) {
                          const f = filtered.find((x) => x.kind === "flights");
                          if (f) {
                            setSelectedId(f.id);
                            setViewMode("map");
                            startFlightOverlay(f);
                          }
                        }
                      }}
                    >
                      Stats
                    </button>
                  </div>

                  <button
                    className="btn-ghost"
                    onClick={() => {
                      const f = filtered.find((x) => x.kind === "flights");
                      if (f) {
                        setSelectedId(f.id);
                        setViewMode("map");
                        startFlightOverlay(f);
                      } else alert("No flight found");
                    }}
                  >
                    Start flight demo
                  </button>

                  <button
                    className={`btn-ghost ${mapFollow ? "active" : ""}`}
                    onClick={() => setMapFollow((m) => !m)}
                  >
                    {mapFollow ? "Following" : "Follow plane"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MAP CANVAS */}
          <div className="map-canvas">
            {results.length > 0 && results[0].lat != null ? (
              <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom
                style={{ height: "100%", width: "100%", borderRadius: 12 }}
                whenCreated={(map) => {
                  const el = map.getContainer();
                  try {
                    el._leaflet_map = map;
                    window._last_leaflet_map_instance = map;
                  } catch (e) {}
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Recenter
                  lat={center[0]}
                  lng={center[1]}
                  zoom={6}
                  instant={false}
                />

                {/* BASE MARKERS (always show all results) */}
                {results.map((r) => {
                  const isFiltered = filtered.some((f) => f.id === r.id);
                  const isActive = selectedId === r.id;

                  let emoji = "📍";
                  if (r.kind === "flights") emoji = "✈️";
                  if (r.kind === "stays") emoji = "🏨";
                  if (r.kind === "cars") emoji = "🚗";
                  if (r.kind === "packages") emoji = "🌍";

                  // Pin palette
                  const bg = isFiltered
                    ? "linear-gradient(90deg,#40E0D0,#FFA62B)"
                    : "#dadada";
                  const textColor = isFiltered ? "#042019" : "#666";
                  const priceChipBg = isFiltered
                    ? "rgba(0,0,0,0.14)"
                    : "transparent";

                  // Gold glow for selected pin
                  const outline =
                    "0 0 0 2px rgba(255,255,255,0.9), 0 0 22px rgba(255,204,51,0.8), 0 8px 26px rgba(255,204,51,0.35)";

                  const icon = L.divIcon({
                    html: `
                      <div style="
                        display:flex;
                        gap:8px;
                        align-items:center;
                        padding:6px 10px;
                        border-radius:20px;
                        background:${bg};
                        color:${textColor};
                        font-weight:800;
                        box-shadow:${
                          isActive
                            ? outline
                            : "0 6px 18px rgba(0,0,0,0.22)"
                        };
                        opacity:${isFiltered ? 1 : 0.45};
                        transform:scale(${isActive ? 1.06 : isFiltered ? 1 : 0.86});
                        transition:all .18s ease;
                        border:${isActive ? "1px solid rgba(255,204,51,0.85)" : "none"};
                      ">
                        ${emoji}
                        <div style="
                          background:${priceChipBg};
                          padding:6px 10px;
                          border-radius:12px;
                        ">
                          ${r.price}
                        </div>
                      </div>`,
                    className: "custom-pin",
                    iconSize: null,
                  });

                  return (
                    <Marker
                      key={r.id}
                      position={[r.lat, r.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedId(r.id),
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: 220 }}>
                          <strong>{r.title}</strong>
                          <div style={{ fontSize: 13, color: "#6b7c74" }}>
                            {r.city}
                          </div>
                          <div style={{ fontWeight: 700, marginTop: 6 }}>
                            {r.price}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              gap: 8,
                            }}
                          >
                            <button
                              className="btn-cta"
                              onClick={() => goToBooking(r.id, r)}
                            >
                              Book now
                            </button>
                            <button
                              className="btn-ghost"
                              onClick={() => {
                                setSelectedId(r.id);
                                setViewMode("list");
                              }}
                            >
                              Back to list
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* FLIGHT PATH + PLANE ICON + FACTS */}
                {flightPath && (
                  <>
                    <Polyline
                      positions={flightPath}
                      pathOptions={{
                        color: "#1e90ff",
                        weight: 3,
                        opacity: 0.95,
                      }}
                    />

                    {FUN_FACTS.map((f, i) => (
                      <Marker
                        key={`ff-${i}`}
                        position={[f.lat, f.lng]}
                        icon={L.divIcon({
                          html: `<div style="padding:6px 8px;border-radius:10px;background:#fff;color:#222;font-weight:700;border:1px solid #eee;box-shadow:0 6px 18px rgba(0,0,0,.16)">📍 ${f.city}</div>`,
                          className: "custom-pin",
                          iconSize: null,
                        })}
                        eventHandlers={{
                          click: () => {
                            if (overlayMode === "fun") {
                              setQuizFact(f);
                              setQuizOpen(true);
                            } else {
                              fetch(
                                `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(
                                  f.city + " " + f.landmark
                                )}`
                              )
                                .then((res) => res.json())
                                .then((data) => {
                                  const pages =
                                    data.query && data.query.pages;
                                  const firstKey =
                                    pages && Object.keys(pages)[0];
                                  const extract =
                                    firstKey && pages[firstKey].extract;
                                  setNearFact({
                                    ...f,
                                    wiki: extract,
                                    distanceKm: Math.round(
                                      haversine(
                                        [f.lat, f.lng],
                                        planePos || flightPath[0]
                                      )
                                    ),
                                  });
                                })
                                .catch(() =>
                                  setNearFact({
                                    ...f,
                                    distanceKm: Math.round(
                                      haversine(
                                        [f.lat, f.lng],
                                        planePos || flightPath[0]
                                      )
                                    ),
                                  })
                                );
                            }
                          },
                        }}
                      />
                    ))}

                    {planePos && (
                      <Marker
                        position={planePos}
                        icon={L.divIcon({
                          html: `<div style="transform:rotate(${planeBearing}deg) translate(-12px,-12px);">
                                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 12l20-10-7 10 7 10-20-10z" fill="#0f766e"/>
                                  </svg>
                                </div>`,
                          className: "plane-rot",
                          iconSize: [34, 34],
                        })}
                      />
                    )}

                    {nearFact && planePos && (
                      <>
                        <Circle
                          center={[nearFact.lat, nearFact.lng]}
                          radius={60000}
                          pathOptions={{ color: "#FFA500", dashArray: "4" }}
                        />
                        <Marker
                          position={[nearFact.lat, nearFact.lng]}
                          icon={L.divIcon({
                            html: `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.98);border:1px solid #eee;font-weight:700;">
                                    ⭐ ${nearFact.city}
                                  </div>`,
                          })}
                        />
                      </>
                    )}
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="map-fallback-canvas">
                {filtered.map((r, i) => (
                  <div
                    key={r.id}
                    className={`map-pin ${
                      selectedId === r.id ? "selected" : ""
                    }`}
                    style={{ left: `${12 + i * 12}%`, top: `${12 + i * 8}%` }}
                    onClick={() => {
                      setSelectedId(r.id);
                      setViewMode("list");
                    }}
                  >
                    <div className="pin-bubble">{r.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= MAP LEGEND / OVERLAY ================= */}
          <div className="map-legend">
            <div>Prices & locations are synced. Click a pin to interact.</div>

            <div
              className="legend-actions"
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <button
                className="btn-ghost"
                onClick={() => alert("Date picker coming soon")}
              >
                Change dates
              </button>

              <button
                className="btn-primary"
                onClick={() => {
                  if (filtered.length) goToBooking(filtered[0].id, filtered[0]);
                  else alert("No results available");
                }}
              >
                Book now
              </button>

              {overlayMode === "stats" && flightPath && planePos && (
                <div
                  style={{
                    marginLeft: 12,
                    background: "rgba(255,255,255,0.96)",
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>Flight Stats</div>
                  <div style={{ fontSize: 13, color: "#6b7c74" }}>
                    Speed: {planeSpeed} km/h
                  </div>
                  <div>Altitude: {planeAltitude} ft</div>
                </div>
              )}

              {overlayMode !== "stats" && nearFact && (
                <div
                  style={{
                    marginLeft: 12,
                    background: "rgba(255,255,255,0.95)",
                    padding: 10,
                    borderRadius: 8,
                    minWidth: 220,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    {nearFact.landmark} — {nearFact.city}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#6b7c74", marginBottom: 6 }}
                  >
                    {nearFact.country} • {nearFact.distanceKm} km
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {nearFact.wiki || nearFact.fact}
                  </div>

                  {overlayMode === "fun" && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="btn-cta"
                        onClick={() => setQuizOpen(true)}
                      >
                        Take trivia
                      </button>
                    </div>
                  )}

                  {overlayMode === "educational" && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        className="btn-ghost"
                        href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
                          nearFact.city + " " + nearFact.landmark
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn more
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* TRIVIA SCORE BADGE */}
      <div style={{ position: "fixed", right: 18, bottom: 18 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            padding: 8,
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ fontWeight: 700 }}>Trivia score</div>
          <div style={{ fontSize: 12, color: "#6b7c74" }}>
            {quizScore} pts
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <Booking
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        item={bookingItem || {}}
        type={bookingType}
        onConfirmed={(data) => handleBookingConfirmed(data)}
      />
    </motion.main>
  );
}
