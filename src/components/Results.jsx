// src/components/Results.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./Results.css";

// <-- ADDED: Booking modal import
import Booking from "./Booking";

/* ===========================
   Full Results.jsx with expanded CITY_COORDS
   - more cities and exact locations
   - flight demo, quiz modal, wiki lookups, map follow
   - ADDED: lightweight backend fetch + booking create
   =========================== */

/* ---------------- Simple API helper ---------------- */
const API_BASE = (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) || (typeof import.meta !== "undefined" ? (import.meta.env?.VITE_API_BASE || "") : "") || "";
async function apiFetch(path, opts = {}) {
  const headers = opts.headers ? { ...opts.headers } : {};
  // attach token if present
  try {
    const token = localStorage.getItem("auth_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch (e) {}
  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });
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
/* ---------------------------------------------------- */

/* ---------------- Helpers ---------------- */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
function priceNumber(p) {
  if (!p) return 0;
  return Number(String(p).replace(/[^\d]/g, "")) || 0;
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
function lerp(a, b, t) { return a + (b - a) * t; }
function interpolateLine([lat1, lng1], [lat2, lng2], segments = 240) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push([lerp(lat1, lat2, t), lerp(lng1, lng2, t)]);
  }
  return pts;
}
function haversine([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}
function createMarkerIconSimple(label = "📍", price = null, selected = false) {
  const bg = selected ? "linear-gradient(90deg,#40E0D0,#FFA62B)" : "linear-gradient(90deg,#073029,#072522)";
  const color = selected ? "#042019" : "#E6FFF8";
  const html = price
    ? `<div style="display:flex;gap:8px;align-items:center;padding:6px;border-radius:20px;background:${bg};box-shadow:0 6px 18px rgba(0,0,0,0.22);color:${color};font-weight:700;">${label}<div style="background:rgba(0,0,0,0.15);padding:6px 10px;border-radius:12px;">${price}</div></div>`
    : `<div style="padding:6px;border-radius:10px;background:${bg};color:${color};font-weight:700;">${label}</div>`;
  return L.divIcon({ html, className: "custom-pin", iconSize: null });
}

/* ---------------- Expanded CITY_COORDS (many cities, exact coords) ----------------
   Add more if you want — use city name keys for substring matching of the ?from= value.
*/
const CITY_COORDS = {
  // Kerala (detailed)
  Kochi: [9.931232, 76.267304],
  Cochin: [9.931232, 76.267304],
  Ernakulam: [9.9816, 76.2999],
  Thiruvananthapuram: [8.524139, 76.936638],
  Trivandrum: [8.524139, 76.936638],
  ThiruvananthapuramIntl: [8.4824, 76.9204], // near airport
  Kozhikode: [11.258753, 75.780411],
  Calicut: [11.258753, 75.780411],
  Kannur: [11.8745, 75.3704],
  Kollam: [8.8932, 76.6141],
  Alappuzha: [9.4981, 76.3388],
  Kottayam: [9.5916, 76.5228],
  Palakkad: [10.7867, 76.6548],
  Malappuram: [11.0735, 76.0743],

  // Major Indian metros
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.3850, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Nagpur: [21.1458, 79.0882],
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Visakhapatnam: [17.6868, 83.2185],
  Patna: [25.5941, 85.1376],
  Vadodara: [22.3072, 73.1812],
  Ghaziabad: [28.6692, 77.4538],
  Ludhiana: [30.9010, 75.8573],
  Agra: [27.1767, 78.0081],
  Nashik: [19.9975, 73.7898],
  KochiAirport: [9.8720, 76.2740],
  Trichy: [10.7905,78.7047],

  // Other international popular cities (accurate coords)
  Lisbon: [38.7223, -9.1393],
  Santorini: [36.3932, 25.4615],
  Kyoto: [35.0116, 135.7681],
  Paris: [48.8566, 2.3522],
  "New York": [40.7128, -74.0060],
  Barcelona: [41.3851, 2.1734],
  Rome: [41.9028, 12.4964],
  Istanbul: [41.0082, 28.9784],
  Bangkok: [13.7563, 100.5018],
  Bali: [-8.4095, 115.1889],
  Singapore: [1.3521, 103.8198],
  Dubai: [25.2048, 55.2708],
  London: [51.5074, -0.1278],
  Toronto: [43.6532, -79.3832],
  Sydney: [-33.8688, 151.2093],
  LosAngeles: [34.0522, -118.2437],
  SanFrancisco: [37.7749, -122.4194],
  Vancouver: [49.2827, -123.1207],
  Moscow: [55.7558, 37.6173],
  Beijing: [39.9042, 116.4074],
  Shanghai: [31.2304, 121.4737],
  Tokyo: [35.6762, 139.6503],
  Seoul: [37.5665, 126.9780],
  KualaLumpur: [3.1390, 101.6869],
  Hanoi: [21.0278, 105.8342],
  Manila: [14.5995, 120.9842],
  HoChiMinh: [10.8231, 106.6297],
  Jakarta: [-6.2088, 106.8456],
  CapeTown: [-33.9249, 18.4241],
  Nairobi: [-1.2921, 36.8219],
  SaoPaulo: [-23.5505, -46.6333],
  BuenosAires: [-34.6037, -58.3816],
  MexicoCity: [19.4326, -99.1332],
  Doha: [25.2854, 51.5310],
  Muscat: [23.5880, 58.3829],
};

/* ---------------- Sample data & fun facts ---------------- */
const SAMPLE_CITIES = ["Kochi","Paris","Rome","Bangkok","Bali","New York"];
function genSample(kind, count = 20) {
  const res = [];
  const keys = Object.keys(CITY_COORDS);
  for (let i = 0; i < count; i++) {
    const cityKey = keys[i % keys.length];
    const cityName = cityKey.replace(/([A-Z])/g, " $1").trim(); // rough beautify
    const [lat, lng] = CITY_COORDS[cityKey];
    const id = `${kind[0].toUpperCase()}${String(i+1).padStart(3,"0")}`;
    res.push({
      id,
      kind,
      city: cityName,
      title: kind === "flights" ? `${cityName} — ${["City break","Island escape","Culture"][i%3]}` : `${cityName} — Stay`,
      price: `$${(80 + Math.floor(Math.random()*520))}`,
      lat, lng,
      stops: ["nonstop","1","2+"][i%3],
      category: ["budget","any","premium"][i%3],
      airline: ["IndiGo","SpiceJet","Air India"][i%3],
      rating: (3.5 + Math.random()*1.5).toFixed(1),
    });
  }
  return res;
}
const sample = { flights: genSample("flights", 40), stays: genSample("stays", 18), cars: genSample("cars", 12), packages: genSample("packages", 10) };

const FUN_FACTS = [
  { lat: 9.9312, lng: 76.2673, city: "Kochi", country: "India", landmark: "Fort Kochi", fact: "Fort Kochi preserves colonial-era architecture and spice-trade history." },
  { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France", landmark: "Eiffel Tower", fact: "Eiffel Tower was built in 1889 for the World Expo." },
  { lat: 41.9028, lng: 12.4964, city: "Rome", country: "Italy", landmark: "Colosseum", fact: "The Colosseum could hold 50,000 spectators." },
  { lat: -8.4095, lng: 115.1889, city: "Bali", country: "Indonesia", landmark: "Tegalalang Rice Terraces", fact: "Bali's terraces are irrigated using a centuries-old subak system." },
  { lat: 13.7563, lng: 100.5018, city: "Bangkok", country: "Thailand", landmark: "Grand Palace", fact: "The Grand Palace is a complex of buildings at the heart of Bangkok." },
];

/* ---------------- Quiz Modal Component ---------------- */
function QuizModal({ open, fact, onClose, onScore }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (!open) setSelected(null); }, [open]);
  if (!open || !fact) return null;

  const correct = fact.landmark;
  const others = FUN_FACTS.filter(f => f.landmark !== correct).map(f => f.landmark);
  const choices = [correct];
  while (choices.length < 3 && others.length) {
    const pick = others.splice(Math.floor(Math.random()*others.length), 1)[0];
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
        <div style={{ fontWeight: 800, marginBottom: 8 }}>{fact.city} • <span style={{ fontWeight: 600 }}>{fact.country}</span></div>
        <div style={{ marginBottom: 12 }}>{fact.fact}</div>
        <div className="quiz-options">
          {choices.map((c) => (
            <button key={c} className={`quiz-opt ${selected===c ? "selected" : ""}`} onClick={() => setSelected(c)}>{c}</button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-cta" onClick={submit} disabled={!selected}>Submit</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Real flight fetch stub (same as before) ---------------- */
async function fetchRealFlightPositionsStub(fromAirport, toAirport) {
  return [];
}

/* ---------------- MAIN Component ---------------- */
export default function Results() {
  const query = useQuery();
  const navigate = useNavigate();
  const fromQ = (query.get("from") || "").toLowerCase();
  const initialTab = query.get("tab") || "flights";

  // UI state
  const [sortBy, setSortBy] = useState("best");
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState(typeof window !== "undefined" ? (localStorage.getItem("tm_view_mode") || "map") : "map");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stopFilter, setStopFilter] = useState("any");
  const [airlineFilter, setAirlineFilter] = useState("any");

  // ---------- ADDED: booking modal state ----------
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingType, setBookingType] = useState("stay");
  // -------------------------------------------------

  // ---------- ADDED: remote results state ----------
  const [remoteResults, setRemoteResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  // -------------------------------------------------

  // overlay / flight state
  const [overlayMode, setOverlayMode] = useState("educational"); // educational | fun | stats
  const [flightPath, setFlightPath] = useState(null);
  const [planePos, setPlanePos] = useState(null);
  const [planeBearing, setPlaneBearing] = useState(0);
  const [planeSpeed, setPlaneSpeed] = useState(780);
  const [planeAltitude, setPlaneAltitude] = useState(35000);
  const [nearFact, setNearFact] = useState(null);
  const [mapFollow, setMapFollow] = useState(true);

  // quiz
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizFact, setQuizFact] = useState(null);
  const [quizScore, setQuizScore] = useState(() => Number(localStorage.getItem("flight_quiz_score") || 0));

  // animation refs
  const animationRef = useRef(null);
  const flightPtsRef = useRef([]);
  const planeTRef = useRef(0);
  const planeSpeedMultiplierRef = useRef(1);

  useEffect(() => { try { localStorage.setItem("tm_view_mode", viewMode); } catch (e) {} }, [viewMode]);

  /* ---------------- Load remote search results (if backend available) ---------------- */
  useEffect(() => {
    let abort = false;
    async function load() {
      setLoadingResults(true);
      setResultsError(null);
      try {
        const from = encodeURIComponent(query.get("from") || "");
        const tab = encodeURIComponent(activeTab || "flights");
        const data = await apiFetch(`/api/search?from=${from}&tab=${tab}`, { method: "GET" });
        if (!abort) {
          // normalize to array of items with lat/lng
          if (Array.isArray(data) && data.length) {
            const normalized = data.map(d => ({
              id: d.id || d.bookingId || `${(d.kind||tab)[0] || "X"}${Math.floor(Math.random()*9000)}`,
              kind: d.kind || tab,
              city: d.city || d.title || "",
              title: d.title || (d.kind ? `${d.kind} in ${d.city}` : d.city),
              price: d.price || (d.total ? `$${d.total}` : "$0"),
              lat: (d.lat || d.latitude || d.latitude || d.lat) ?? (d.latitude ?? d.lat ?? null),
              lng: (d.lng || d.longitude || d.lon || d.lng) ?? (d.longitude ?? d.lng ?? null),
              stops: d.stops || d.stops,
              category: d.category || "any",
              airline: d.airline || "any",
              rating: d.rating || 4.2,
            }));
            setRemoteResults(normalized);
          } else {
            setRemoteResults(null);
          }
        }
      } catch (err) {
        if (!abort) {
          setRemoteResults(null);
          setResultsError(err.message || String(err));
        }
      } finally {
        if (!abort) setLoadingResults(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [query.get("from"), activeTab, sortBy, stopFilter, airlineFilter]);

  /* ---------------- Replace local const results with remote (if available) ---------------- */
  const results = useMemo(() => {
    if (remoteResults && Array.isArray(remoteResults) && remoteResults.length) return remoteResults;
    if (activeTab === "flights") return sample.flights;
    if (activeTab === "stays") return sample.stays;
    if (activeTab === "cars") return sample.cars;
    if (activeTab === "packages") return sample.packages;
    return sample.flights;
  }, [remoteResults, activeTab]);

  const counts = useMemo(() => {
    const total = results.length;
    const budget = results.filter(r => (r.category || "").toLowerCase().includes("budget")).length;
    const premium = results.filter(r => (r.category || "").toLowerCase().includes("premium")).length;
    return { total, budget, premium };
  }, [results]);

  const filtered = useMemo(() => {
    let list = [...results];
    if (activeTab === "flights") {
      if (stopFilter !== "any") {
        if (stopFilter === "2+") list = list.filter((r) => r.stops === "2+");
        else list = list.filter((r) => r.stops === stopFilter);
      }
      if (airlineFilter !== "any") {
        list = list.filter((r) => (r.category || "any") === airlineFilter);
      }
    }
    if (sortBy === "price_asc") list.sort((a, b) => priceNumber(a.price) - priceNumber(b.price));
    else if (sortBy === "price_desc") list.sort((a, b) => priceNumber(b.price) - priceNumber(b.price));
    else list.sort((a, b) => priceNumber(a.price) - priceNumber(b.price));
    return list;
  }, [results, stopFilter, airlineFilter, sortBy, activeTab]);

  const handleBack = () => navigate("/");

  const center = useMemo(() => {
    if (selectedId) {
      const s = results.find((r) => r.id === selectedId);
      if (s) return [s.lat, s.lng];
    }
    if (results.length) return [results[0].lat, results[0].lng];
    return [20.5937, 78.9629];
  }, [results, selectedId]);

  function stopFlightOverlay() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    flightPtsRef.current = [];
    planeTRef.current = 0;
    setFlightPath(null);
    setPlanePos(null);
    setNearFact(null);
  }

  function computeOriginFromQuery() {
    if (!fromQ) return [20.5937, 78.9629];
    // direct match by checking city keys
    const key = Object.keys(CITY_COORDS).find(c => fromQ.includes(c.toLowerCase()));
    if (key) return CITY_COORDS[key];
    // common synonyms for kerala
    if (fromQ.includes("kerala") || fromQ.includes("cochin") || fromQ.includes("kochi") || fromQ.includes("trivandrum") || fromQ.includes("thiruvananthapuram")) {
      return CITY_COORDS["Kochi"];
    }
    // try word-by-word match against city names (loose)
    for (const k of Object.keys(CITY_COORDS)) {
      if (fromQ.includes(k.toLowerCase())) return CITY_COORDS[k];
    }
    // fallback
    return [20.5937, 78.9629];
  }

  async function startFlightOverlay(item) {
    stopFlightOverlay();
    let pts = [];
    try {
      const origin = computeOriginFromQuery();
      const real = await fetchRealFlightPositionsStub(origin, [item.lat, item.lng]); // stub returns []
      if (real && real.length) {
        pts = real.map(r => [r.lat, r.lng]);
        // optionally set planeSpeed/altitude from real data
      } else {
        pts = interpolateLine(origin, [item.lat, item.lng], 600);
      }
    } catch (err) {
      console.warn("[FlightOverlay] real data failed; using simulated", err);
      pts = interpolateLine(computeOriginFromQuery(), [item.lat, item.lng], 600);
    }

    flightPtsRef.current = pts;
    setFlightPath(pts);
    setPlanePos(pts[0]);
    setPlaneSpeed(700 + Math.floor(Math.random()*160));
    setPlaneAltitude(30000 + Math.floor(Math.random()*8000));
    planeTRef.current = 0;
    planeSpeedMultiplierRef.current = 1 + Math.random() * 0.6;

    let lastTs = null;
    function step(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(40, ts - lastTs);
      lastTs = ts;

      const base = 0.0009;
      const speedFactor = (planeSpeed / 900) * planeSpeedMultiplierRef.current;
      planeTRef.current = Math.min(1, planeTRef.current + base * (dt / 16) * speedFactor);

      const t = planeTRef.current;
      const idxFloat = t * (flightPtsRef.current.length - 1);
      const idx = Math.floor(idxFloat);
      const next = Math.min(flightPtsRef.current.length - 1, idx + 1);
      const cur = flightPtsRef.current[idx];
      const nxt = flightPtsRef.current[next];
      if (cur && nxt) {
        const subT = idxFloat - idx;
        const lat = lerp(cur[0], nxt[0], subT);
        const lng = lerp(cur[1], nxt[1], subT);
        setPlanePos([lat, lng]);
        setPlaneBearing(bearing(cur, nxt));
      }

      setPlaneAltitude(a => Math.max(5000, Math.round(a + (Math.random() - 0.5) * 20)));
      setPlaneSpeed(s => Math.max(200, Math.round(s + (Math.random() - 0.5) * 8)));

      const current = planePos || flightPtsRef.current[Math.max(0, Math.floor(idxFloat))];
      const nearest = FUN_FACTS.reduce((acc, f) => {
        if (!current) return acc;
        const d = haversine([f.lat, f.lng], current);
        if (!acc || d < acc.d) return { fact: f, d };
        return acc;
      }, null);
      if (nearest && nearest.d <= 80) setNearFact({ ...nearest.fact, distanceKm: Math.round(nearest.d) });
      else setNearFact(null);

      // map follow
      if (mapFollow) {
        const mapEl = document.querySelector(".leaflet-container");
        if (mapEl && mapEl._leaflet_map) {
          try {
            mapEl._leaflet_map.panTo([planePos ? planePos[0] : (cur && cur[0]), planePos ? planePos[1] : (cur && cur[1])], { animate: true, duration: 0.6 });
          } catch (err) {}
        }
      }

      if (planeTRef.current < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    animationRef.current = requestAnimationFrame(step);
    console.log("[FlightOverlay] started from", computeOriginFromQuery(), "->", [item.lat, item.lng], "pts:", pts.length);
  }

  // auto-start overlay when selecting a flight
  useEffect(() => {
    if (!selectedId) return;
    const item = results.find(r => r.id === selectedId);
    if (item && item.kind === "flights") startFlightOverlay(item);
    else stopFlightOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeTab]);

  function openQuizForFact(f) {
    setQuizFact(f);
    setQuizOpen(true);
  }
  function handleQuizScore(point) {
    const newScore = quizScore + (point || 0);
    setQuizScore(newScore);
    localStorage.setItem("flight_quiz_score", String(newScore));
  }

  function goToBooking(id, item) {
    // keep the highlight & scroll behavior
    setTimeout(() => {
      const el = document.querySelector(`article[data-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("flash-highlight");
        setTimeout(() => el.classList.remove("flash-highlight"), 1400);
      }
    }, 40);

    // OPEN modal instead of navigating
    setBookingItem(item || null);
    // map kind to booking type
    if (item?.kind === "flights" || item?.kind === "flight") setBookingType("flight");
    else if (item?.kind === "stays" || item?.kind === "stay" || item?.kind === "resort") setBookingType("resort");
    else if (item?.kind === "cars" || item?.kind === "car") setBookingType("car");
    else if (item?.kind === "packages") setBookingType("package");
    else setBookingType("stay");
    setBookingOpen(true);
  }

  function manualStartDemo() {
    const f = filtered.find(x => x.kind === "flights");
    if (!f) return alert("No sample flight found");
    setSelectedId(f.id);
    setViewMode("map");
    startFlightOverlay(f);
  }

  const flightStats = useMemo(() => {
    const pts = flightPtsRef.current;
    if (!pts || pts.length < 2) return null;
    let totalKm = 0;
    for (let i = 1; i < pts.length; i++) totalKm += haversine(pts[i-1], pts[i]);
    const coveredKm = Math.round(totalKm * (planeTRef.current || 0));
    const remainingKm = Math.max(0, Math.round(totalKm - coveredKm));
    const percent = Math.round((coveredKm / totalKm) * 100) || 0;
    return { totalKm: Math.round(totalKm), coveredKm, remainingKm, percent };
  }, [planePos, planeSpeed, planeAltitude, flightPath]);

  // attach leaflet map instance reference (for mapFollow)
  useEffect(() => {
    const mapEl = document.querySelector(".leaflet-container");
    if (mapEl && !mapEl._leaflet_map) {
      try {
        mapEl._leaflet_map = window._last_leaflet_map_instance || null;
      } catch (e) {}
    }
  }, [viewMode]);

  // wiki lookup helper
  async function fetchWikiSummary(queryText) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&origin=*&titles=${encodeURIComponent(queryText)}`;
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query && data.query.pages;
      if (!pages) return "";
      const firstKey = Object.keys(pages)[0];
      return pages[firstKey].extract || "";
    } catch (e) {
      console.warn("Wiki fetch failed", e);
      return "";
    }
  }

  /* ---------------- Booking: create booking on server (if backend available) ---------------- */
  async function createBookingOnServer(bookingPayload) {
    try {
      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingPayload),
      });
      return res;
    } catch (err) {
      console.warn("[createBookingOnServer] failed", err);
      throw err;
    }
  }

  async function handleBookingConfirmed(data) {
    try {
      const payload = { ...(bookingItem || {}), ...data };
      // try to save to server (if API reachable)
      try {
        const serverRes = await createBookingOnServer(payload);
        console.log("Booking created on server:", serverRes);
      } catch (e) {
        console.warn("Could not save booking to server — continuing locally", e);
      }
      setBookingOpen(false);
    } catch (err) {
      alert("Failed to confirm booking. See console.");
      console.error(err);
    }
  }
  /* ------------------------------------------------------------------------------------------ */

  return (
    <motion.main className="results-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <QuizModal open={quizOpen} fact={quizFact} onClose={() => setQuizOpen(false)} onScore={handleQuizScore} />
      <div className="results-top">
        <button className="back" onClick={() => navigate("/")}>← Back to home</button>
        <div className="top-tabs">
          <button className={`tab ${activeTab==="flights" ? "active":""}`} onClick={()=>setActiveTab("flights")}>✈️ Flights</button>
          <button className={`tab ${activeTab==="stays" ? "active":""}`} onClick={()=>setActiveTab("stays")}>🏨 Stays</button>
          <button className={`tab ${activeTab==="cars" ? "active":""}`} onClick={()=>setActiveTab("cars")}>🚗 Cars</button>
          <button className={`tab ${activeTab==="packages" ? "active":""}`} onClick={()=>setActiveTab("packages")}>🌍 Packages</button>
        </div>

        <div className="summary">
          <div className="summary-left">
            <div className="summary-from">From <strong>{query.get("from") || "your city"}</strong></div>
            <div className="summary-meta">{activeTab} • {filtered.length} results</div>
          </div>
          <div className="top-controls">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{ padding: 6 }}>
                <option value="best">Recommended</option>
                <option value="price_asc">Price low→high</option>
                <option value="price_desc">Price high→low</option>
              </select>
              <button className="btn-primary" onClick={()=>navigate("/")}>New search</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`results-grid ${viewMode==="map" ? "map-full" : "list-full"}`}>
        <AnimatePresence initial={false} mode="popLayout">
          {viewMode === "list" && (
            <motion.aside key="left-panel" initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:-20, opacity:0 }} transition={{ duration: 0.28 }} className="panel">
              <div className="panel-header"><h2>{filtered.length} {activeTab}</h2></div>

              <div className="filters">
                {activeTab==="flights" && (
                  <>
                    <div className="filter-row">
                      <label>Stops</label>
                      <div className="chips">
                        <button className={`chip ${stopFilter==="nonstop" ? "active" : ""}`} onClick={()=>setStopFilter(s=>s==="nonstop"?"any":"nonstop")}>Nonstop</button>
                        <button className={`chip ${stopFilter==="1" ? "active" : ""}`} onClick={()=>setStopFilter(s=>s==="1"?"any":"1")}>1 stop</button>
                        <button className={`chip ${stopFilter==="2+" ? "active" : ""}`} onClick={()=>setStopFilter(s=>s==="2+"?"any":"2+")}>2+ stops</button>
                      </div>
                    </div>
                    <div className="filter-row">
                      <label>Airlines</label>
                      <div className="chips">
                        <button className={`chip ${airlineFilter==="any" ? "active" : ""}`} onClick={()=>setAirlineFilter("any")}>Any ({counts.total})</button>
                        <button className={`chip ${airlineFilter==="budget" ? "active" : ""}`} onClick={()=>setAirlineFilter("budget")}>Budget</button>
                        <button className={`chip ${airlineFilter==="premium" ? "active" : ""}`} onClick={()=>setAirlineFilter("premium")}>Premium</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="list">
                {filtered.map((r) => (
                  <article key={r.id} data-id={r.id} className={`result-card ${selectedId===r.id ? "active":""}`} onMouseEnter={()=>setSelectedId(r.id)} onClick={()=>{ setSelectedId(r.id); setViewMode("map"); }} role="button" tabIndex={0}>
                    <div className="card-body">
                      <div className="card-top">
                        <div className="title">{r.title}</div>
                        <div className="price">{r.price}</div>
                      </div>
                      <div className="card-mid">
                        <div className="sub">{r.city} • {r.stops ? `${r.stops} stops` : `${r.rating} ★`}</div>
                        <div className="tags"><div className="tag">✈️ {r.airline}</div><div className="tag">{r.category}</div></div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-cta" onClick={(e)=>{ e.stopPropagation(); goToBooking(r.id, r); }}>Book now</button>
                        <button className="btn-ghost" onClick={(e)=>{ e.stopPropagation(); setSelectedId(r.id); setViewMode("map"); }}>View on map</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="map-area" aria-label="Map of options">
          <div className="map-header">
            <div className="map-title">Explore where you can go</div>
            <div className="map-actions" style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button className={`glass ${viewMode==="map" ? "active":""}`} onClick={()=>setViewMode("map")}>Map view</button>
              <button className={`glass ${viewMode==="list" ? "active":""}`} onClick={()=>setViewMode("list")}>List view</button>

              {activeTab==="flights" && (
                <>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className={`chip ${overlayMode==="educational"?"active":""}`} onClick={()=>setOverlayMode("educational")}>Educational</button>
                    <button className={`chip ${overlayMode==="fun"?"active":""}`} onClick={()=>setOverlayMode("fun")}>Fun</button>
                    <button className={`chip ${overlayMode==="stats"?"active":""}`} onClick={()=>setOverlayMode("stats")}>Stats</button>
                  </div>
                  <button className="btn-ghost" onClick={manualStartDemo}>Start flight demo</button>
                  <button className={`btn-ghost ${mapFollow ? "active" : ""}`} onClick={()=>setMapFollow(m=>!m)}>{mapFollow ? "Following" : "Follow plane"}</button>
                </>
              )}
            </div>
          </div>

          <div className="map-canvas" role="region" aria-label="Map with price pins">
            {results.length > 0 && results[0].lat != null ? (
              <MapContainer center={center} zoom={5} scrollWheelZoom style={{height:"100%", width:"100%", borderRadius:12}} whenCreated={(map) => {
                const el = map.getContainer();
                try { el._leaflet_map = map; window._last_leaflet_map_instance = map; } catch(e) {}
              }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Recenter lat={center[0]} lng={center[1]} zoom={6} />

                {/* base pins */}
               {filtered.map(r => {
  // choose emoji based on type
  let emoji = "📍";
  if (r.kind === "flights") emoji = "✈️";
  if (r.kind === "stays") emoji = "🏨";
  if (r.kind === "cars") emoji = "🚗";
  if (r.kind === "packages") emoji = "🌍";

  return (
    <Marker 
      key={r.id} 
      position={[r.lat, r.lng]} 
      icon={createMarkerIconSimple(emoji, r.price, selectedId===r.id)} 
      eventHandlers={{ click: () => setSelectedId(r.id) }}
    >
      <Popup>
        <div style={{ minWidth: 220 }}>
          <strong>{r.title}</strong>
          <div style={{ fontSize: 13, color: "#6b7c74" }}>{r.city}</div>
          <div style={{ fontWeight: 700, marginTop: 6 }}>{r.price}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="btn-cta" onClick={() => goToBooking(r.id, r)}>Book now</button>
            <button className="btn-ghost" onClick={() => { setSelectedId(r.id); setViewMode("list"); }}>Back to list</button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
})}


                {/* flight overlay */}
                {flightPath && (
                  <>
                    <Polyline positions={flightPath} pathOptions={{ color: "#1e90ff", weight: 3, opacity: 0.95 }} />

                    {FUN_FACTS.map((f, i) => (
                      <Marker key={`fact-${i}`} position={[f.lat, f.lng]} icon={createMarkerIconSimple("📍") } eventHandlers={{
                        click: () => {
                          if (overlayMode === "fun") openQuizForFact(f);
                          else fetchWikiSummary(f.city + " " + f.landmark).then(summary => {
                            setNearFact({ ...f, wiki: summary, distanceKm: Math.round(haversine([f.lat,f.lng], planePos || flightPath[0])) });
                          }).catch(() => setNearFact({ ...f, distanceKm: Math.round(haversine([f.lat,f.lng], planePos || flightPath[0])) }));
                        }
                      }}>
                        <Popup>
                          <div style={{ minWidth: 180 }}>
                            <strong>{f.landmark} — {f.city}</strong>
                            <div style={{ fontSize: 13, color: "#6b7c74", marginTop: 6 }}>{f.fact}</div>
                            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                              <a className="btn-ghost" href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(f.city + " " + f.landmark)}`} target="_blank" rel="noreferrer">Learn more</a>
                              {overlayMode === "fun" ? <button className="btn-cta" onClick={() => openQuizForFact(f)}>Quiz</button> : null}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {planePos && (
                      <Marker position={planePos} icon={L.divIcon({
                        html: `<div style="transform:rotate(${planeBearing}deg) translate(-12px,-12px);"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12l20-10-7 10 7 10-20-10z" fill="#0f766e"/></svg></div>`,
                        className: "plane-rot",
                        iconSize: [34,34]
                      })}>
                        <Popup>
                          <div style={{ minWidth: 160 }}>
                            <div style={{ fontWeight: 700 }}>In-air</div>
                            <div style={{ fontSize: 13, color: "#6b7c74" }}>{overlayMode === "educational" ? "Educational" : overlayMode === "fun" ? "Fun" : "Stats"}</div>
                            <div style={{ marginTop: 8 }}>
                              <div>Speed: <strong>{planeSpeed} km/h</strong></div>
                              <div>Altitude: <strong>{planeAltitude} ft</strong></div>
                              {flightStats && <div>Progress: <strong>{flightStats.percent}%</strong></div>}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {nearFact && planePos && (
                      <>
                        <Circle center={[nearFact.lat, nearFact.lng]} radius={60000} pathOptions={{ color: "#FFA500", dashArray: "4" }} />
                        <Marker position={[nearFact.lat, nearFact.lng]} icon={L.divIcon({ html: `<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.98);border:1px solid #eee;font-weight:700;">⭐ ${nearFact.city}</div>` })}>
                          <Popup>
                            <div style={{ minWidth: 200 }}>
                              <strong>{nearFact.landmark} — {nearFact.city}</strong>
                              <div style={{ fontSize: 13, color: "#6b7c74" }}>{nearFact.wiki || nearFact.fact}</div>
                              <div style={{ marginTop: 8 }}>
                                <a className="btn-ghost" href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(nearFact.city + " " + nearFact.landmark)}`} target="_blank" rel="noreferrer">Learn more</a>
                                {overlayMode === "fun" && <button className="btn-cta" onClick={() => openQuizForFact(nearFact)}>Quiz</button>}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </>
                    )}
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="map-fallback-canvas">
                {filtered.map((r, i) => (
                  <div key={r.id} className={`map-pin ${selectedId===r.id ? "selected" : ""}`} style={{ left: `${12 + i * 12}%`, top: `${12 + i * 8}%` }} onClick={() => { setSelectedId(r.id); setViewMode("list"); }}>
                    <div className="pin-bubble">{r.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="map-legend">
            <div>Prices & locations are synced. Click a pin for quick actions.</div>
            <div className="legend-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn-ghost" onClick={() => alert("Open date picker")}>Change dates</button>
              <button className="btn-primary" onClick={() => { if (filtered && filtered.length) goToBooking(filtered[0].id, filtered[0]); else alert("No results to book"); }}>Book now</button>

              {overlayMode === "stats" && flightStats && (
                <div style={{ marginLeft: 12, background: "rgba(255,255,255,0.96)", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>Flight Stats</div>
                  <div style={{ fontSize: 13, color: "#6b7c74" }}>Distance: {flightStats.totalKm} km</div>
                  <div style={{ marginTop: 6 }}>Covered: {flightStats.coveredKm} km</div>
                  <div>Remaining: {flightStats.remainingKm} km</div>
                  <div style={{ marginTop: 6 }}>Altitude: {planeAltitude} ft</div>
                  <div>Speed: {planeSpeed} km/h</div>
                  <div style={{ height: 8, background: "#e6f7f4", borderRadius: 6, marginTop: 8 }}>
                    <div style={{ width: `${flightStats.percent}%`, height: 8, background: "#0f766e", borderRadius: 6 }} />
                  </div>
                </div>
              )}

              {overlayMode !== "stats" && nearFact && (
                <div style={{ marginLeft: 12, background: "rgba(255,255,255,0.95)", padding: 10, borderRadius: 8, minWidth: 220 }}>
                  <div style={{ fontWeight: 800 }}>{nearFact.landmark} — {nearFact.city}</div>
                  <div style={{ fontSize: 13, color: "#6b7c74", marginBottom: 6 }}>{nearFact.country} • {nearFact.distanceKm} km</div>
                  <div style={{ marginTop: 4 }}>{nearFact.wiki || nearFact.fact}</div>
                  {overlayMode === "fun" && <div style={{ marginTop: 8 }}><button className="btn-cta" onClick={() => openQuizForFact(nearFact)}>Take trivia</button></div>}
                  {overlayMode === "educational" && <div style={{ marginTop: 8 }}><a className="btn-ghost" href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(nearFact.city + " " + nearFact.landmark)}`} target="_blank" rel="noreferrer">Learn more</a></div>}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div style={{ position: "fixed", right: 18, bottom: 18 }}>
        <div style={{ background: "rgba(255,255,255,0.98)", padding: 8, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}>
          <div style={{ fontWeight: 700 }}>Trivia score</div>
          <div style={{ fontSize: 12, color: "#6b7c74" }}>{quizScore} pts</div>
        </div>
      </div>

      {/* ---------- Booking modal (rendered here) ---------- */}
      <Booking
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        item={bookingItem || {}}
        type={bookingType}
        onConfirmed={(data) => {
          // call server create then close
          handleBookingConfirmed(data);
        }}
      />
      {/* --------------------------------------------------- */}
    </motion.main>
  );
}
