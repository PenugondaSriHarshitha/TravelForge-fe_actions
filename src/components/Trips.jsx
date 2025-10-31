// src/components/Trips.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, Share2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import img1 from "../images/img1.png";
import img2 from "../images/img2.png";
import img3 from "../images/img3.png";
import "./Trips.css";

import lisbon1 from "../images/lisbon1.png";
import lisbon2 from "../images/lisbon2.png";
import lisbon3 from "../images/lisbon3.png";
import lisbon4 from "../images/lisbon4.png";

import kyoto1 from "../images/kyoto1.png";
import kyoto2 from "../images/kyoto2.png";
import kyoto3 from "../images/kyoto3.png";
import kyoto4 from "../images/kyoto4.png";

import santorini1 from "../images/santorini1.png";
import santorini2 from "../images/santorini2.png";
import santorini3 from "../images/santorini3.png";
import santorini4 from "../images/santorini4.png";

/* Leaflet icon fix for bundlers */
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const LOCAL_CREATED = "created_trips_v1";
function uid(prefix = "") {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${prefix ? "-" + prefix : ""}`;
}

/* ---------- Profile modal ---------- */
function ProfileModal({ open, onClose, travelsList }) {
  if (!open) return null;

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("currentUser"));
  } catch (e) {
    user = null;
  }

  // fallback to first user from travelsList if available
  if (!user && Array.isArray(travelsList) && travelsList.length > 0) {
    const first = travelsList[0];
    user = { name: first.name || first.fullName || first.username || "Unknown", email: first.email || "" };
  }

  return (
    <div className="filter-backdrop solid" onMouseDown={onClose}>
      <motion.div className="dongolo improved" onMouseDown={(e) => e.stopPropagation()} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Profile</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {user ? (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</div>
              <div style={{ marginTop: 6, color: "#555" }}>{user.email}</div>
            </div>
          ) : (
            <div style={{ color: "#666" }}>No profile found. Log in or sign up first.</div>
          )}
        </div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              localStorage.removeItem("currentUser");
              onClose();
              // optional: you can remove reload if you don't want a full refresh
              window.location.reload();
            }}
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Share modal component ---------- */
function ShareModal({ open, trip, onClose }) {
  if (!open) return null;
  const url = `${window.location.origin}/trip/${trip?.id || ""}`;
  const text = encodeURIComponent(`${trip?.title || "Trip"} — ${trip?.subtitle || ""}\n${url}`);

  return (
    <div className="filter-backdrop solid" onMouseDown={onClose}>
      <motion.div
        className="dongolo improved"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 style={{ margin: 0 }}>Share Trip</h3>
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${text}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Twitter
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${text}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            WhatsApp
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Facebook
          </a>
        </div>

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Main component ---------- */
export default function Trips() {
  const navigate = useNavigate();
  const toastTimer = useRef(null);
  const mapRef = useRef(null);

  const builtin = [
    {
      id: "trip-1",
      title: "Golden South India",
      subtitle: "10 days · Beaches, temples & food",
      dates: "Mar 4 - Mar 13",
      price: 45200,
      image: img1,
      fav: false,
      days: [
        { day: 1, title: "Arrival & Beach Walk", notes: "Relax" },
        { day: 2, title: "Temple Tour", notes: "Rooftop" },
      ],
      source: "India",
    },
    {
      id: "trip-2",
      title: "Mystic Himalayas",
      subtitle: "7 days · Mountains & sunrise treks",
      dates: "Apr 1 - Apr 7",
      price: 68200,
      image: img2,
      fav: true,
      days: [
        { day: 1, title: "Basecamp Arrival", notes: "Acclimatize" },
        { day: 2, title: "Short Trek", notes: "Viewpoint" },
      ],
      source: "Himalayas",
    },
    {
      id: "trip-3",
      title: "Island Hues — Maldives Lite",
      subtitle: "5 days · Snorkel & sunsets",
      dates: "Jun 12 - Jun 16",
      price: 53900,
      image: img3,
      fav: false,
      days: [
        { day: 1, title: "Resort Check-in", notes: "Lagoon walk" },
        { day: 2, title: "Snorkeling", notes: "Boat trip" },
      ],
      source: "Maldives",
    },
  ];

  const imagesPool = [img1, img2, img3];
  const destinationImages = {
    Lisbon: [lisbon1, lisbon2, lisbon3, lisbon4],
    Kyoto: [kyoto1, kyoto2, kyoto3, kyoto4],
    Santorini: [santorini1, santorini2, santorini3, santorini4],
  };

  const destinationsPool = [
    "Lisbon", "Kyoto", "Santorini", "Paris", "Bali", "Dubai",
    "Rome", "Istanbul", "Bangkok", "Singapore", "London",
    "Barcelona", "Amsterdam", "Prague", "Sydney", "New York",
    "Cape Town", "Rio", "Tokyo", "Seoul", "Vienna", "Zurich"
  ];

  const [createdTrips, setCreatedTrips] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_CREATED) || "[]"); } catch { return []; }
  });
  const [trips, setTrips] = useState(() => [...(JSON.parse(localStorage.getItem(LOCAL_CREATED) || "[]")), ...builtin]);
// put this inside the Trips() component, near your other useEffect hooks
useEffect(() => {
  const panel = document.querySelector(".list-panel");
  if (!panel) return;

  // make the panel and its children black text
  panel.style.color = "#000";

  // set children text to black, but preserve button text white
  panel.querySelectorAll("*").forEach((el) => {
    // skip images, svg, inputs, and buttons
    const tag = el.tagName && el.tagName.toLowerCase();
    if (["img", "svg", "input", "button", "path"].includes(tag)) return;

    // don't override elements that are buttons or inside buttons
    if (el.closest && el.closest(".btn")) return;

    try { el.style.color = "#000"; } catch (e) {}
  });

  // ensure buttons remain readable (white text)
  panel.querySelectorAll(".btn").forEach((b) => {
    try { b.style.color = "#000000ff"; b.style.fill = "#fff"; } catch (e) {}
  });

  // cleanup — optional: nothing to cleanup since we're applying inline styles
}, []); // run once on mount

  useEffect(() => {
    localStorage.setItem(LOCAL_CREATED, JSON.stringify(createdTrips || []));
    setTrips((_) => [...(createdTrips || []), ...builtin]);
    // eslint-disable-next-line
  }, [createdTrips]);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [openItinerary, setOpenItinerary] = useState(null);
  const [showPacking, setShowPacking] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  // PROFILE modal state
  const [profileOpen, setProfileOpen] = useState(false);

  // create form
  const [ctitle, setCTitle] = useState("");
  const [csubtitle, setCSubtitle] = useState("");
  const [cdates, setCDates] = useState("");
  const [cprice, setCPrice] = useState("");
  const [cdays, setCDays] = useState([{ id: uid("d1"), day: 1, title: "Arrival", notes: "" }]);
  const [cimage, setCImage] = useState(img1);
  const [ctags, setCTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const currencyINR = n => n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const filtered = useMemo(() => {
    let list = trips;
    const q = query.toLowerCase().trim();
    if (q) list = list.filter((t) => (t.title + t.subtitle).toLowerCase().includes(q));
    if (filters) {
      if (filters.priceMin) list = list.filter((t) => Number(t.price) >= Number(filters.priceMin));
      if (filters.priceMax) list = list.filter((t) => Number(t.price) <= Number(filters.priceMax));
      if (filters.duration === "short") list = list.filter((t) => (t.days ? t.days.length <= 3 : true));
      if (filters.duration === "mid") list = list.filter((t) => (t.days ? t.days.length >= 4 && t.days.length <= 7 : true));
      if (filters.duration === "long") list = list.filter((t) => (t.days ? t.days.length >= 8 : true));
      if (filters.theme) list = list.filter((t) => (t.tags || []).includes(filters.theme));
    }
    return list;
  }, [trips, query, filters]);

  // helpers
  const toggleFav = (id, e) => {
    e?.stopPropagation();
    setTrips(prev => prev.map(t => t.id === id ? { ...t, fav: !t.fav } : t));
    if (createdTrips.some(x => x.id === id)) setCreatedTrips(p => p.map(x => x.id === id ? { ...x, fav: !x.fav } : x));
  };
  const openDetails = (trip) => { setActive(trip.id); setOpenItinerary(trip.id); };
  const exportItinerary = (trip) => {
    const data = JSON.stringify(trip, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${trip.id}-itinerary.json`; a.click(); URL.revokeObjectURL(url);
  };

  // calendar: opens Google Calendar event creation with dates ready
  const addToCalendar = (trip) => {
    const startDate = new Date();
    const days = Math.max(1, trip.days?.length || 3);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);

    const formatForGoogle = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const start = formatForGoogle(startDate);
    const end = formatForGoogle(endDate);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: trip.title || "Trip",
      details: trip.subtitle || "",
      location: trip.source || "",
      dates: `${start}/${end}`
    });

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const bookFlight = (trip) => navigate(`/book/${trip.id}`, { state: { trip, source: "trips" } });

  // create trip handlers
  const addCreateDay = () => setCDays(d => [...d, { id: uid("d"), day: d.length + 1, title: `Day ${d.length + 1}`, notes: "" }]);
  const updateCreateDay = (id, patch) => setCDays(d => d.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeCreateDay = (id) => setCDays(d => d.filter(x => x.id !== id).map((x, i) => ({ ...x, day: i + 1 })));
  const addTagToCreate = () => { if (!tagInput.trim()) return; setCTags(t => Array.from(new Set([...t, tagInput.trim().toLowerCase()]))); setTagInput(""); };
  const removeCTag = (t) => setCTags(s => s.filter(x => x !== t));
  const createSave = () => {
    if (!ctitle.trim()) return alert("Give your trip a title");
    const item = { id: uid("trip"), title: ctitle, subtitle: csubtitle, dates: cdates, price: Number(cprice || 0), image: cimage, fav: false, days: cdays, tags: ctags, createdAt: new Date().toISOString() };
    const cur = JSON.parse(localStorage.getItem(LOCAL_CREATED) || "[]"); cur.unshift(item); localStorage.setItem(LOCAL_CREATED, JSON.stringify(cur));
    setCreatedTrips(p => [item, ...(p || [])]);
    setTrips(p => [item, ...p]);
    setCTitle(""); setCSubtitle(""); setCDates(""); setCPrice(""); setCDays([{ id: uid("d1"), day: 1, title: "Arrival", notes: "" }]); setCTags([]); setCreateOpen(false);
    setTimeout(() => { setActive(item.id); setOpenItinerary(item.id); }, 200);
  };

  /* ---------- generateMoreResults (prefer varied names/images) ---------- */
  const themeToDest = { beach: "Santorini", romance: "Santorini", mountain: "Kyoto", culture: "Kyoto", city: "Lisbon", adventure: "Kyoto" };
  const allDestSets = { Lisbon: destinationImages.Lisbon || [], Kyoto: destinationImages.Kyoto || [], Santorini: destinationImages.Santorini || [], DEFAULT: imagesPool || [img1, img2, img3] };

  const [generatedKeys, setGeneratedKeys] = useState(() => new Set());
  const [toast, setToast] = useState({ visible: false, count: 0 });

  const generateMoreResults = (appliedFilters = {}, count = 8) => {
    const key = JSON.stringify(appliedFilters || {});
    if (generatedKeys.has(key)) {
      setToast({ visible: true, count: 0, message: "Already showed results for these filters" });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast({ visible: false, count: 0 }), 2200);
      return;
    }

    setGeneratedKeys(prev => new Set(prev).add(key));

    const minP = Number(appliedFilters.priceMin || 8000);
    const maxP = Number(appliedFilters.priceMax || (minP + 60000));

    const newItems = Array.from({ length: count }).map((_, i) => {
      const imgSet = [...allDestSets.Lisbon, ...allDestSets.Kyoto, ...allDestSets.Santorini, ...allDestSets.DEFAULT];
      const img = imgSet[(Date.now() + i) % imgSet.length] || imagesPool[i % imagesPool.length] || img1;
      const priceRand = Math.abs(Math.sin((i + Date.now()) / 17));
      const price = Math.round(minP + (maxP - minP) * priceRand + i * 250);
      const daysCount = appliedFilters.duration === "short" ? 2 + (i % 2) : appliedFilters.duration === "mid" ? 3 + (i % 4) : appliedFilters.duration === "long" ? 7 + (i % 5) : 3 + (i % 5);
      const days = Array.from({ length: daysCount }).map((__, d) => ({ day: d + 1, title: `Activity ${d + 1}`, notes: "Sample notes" }));
      const destTitle = destinationsPool[Math.floor(Math.random() * destinationsPool.length)];
      const id = uid("gen");

      return { id, title: `${destTitle} • ${Math.floor(Math.random() * 100) + 1}`, subtitle: `${daysCount} days · ${appliedFilters.theme || "varied"} experiences`, dates: "Flexible", price, image: img, fav: false, days, tags: appliedFilters.theme ? [appliedFilters.theme] : [], badge: "✨ New", generatedAt: Date.now() };
    });

    setTimeout(() => {
      setTrips(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newItems.filter(n => !existingIds.has(n.id));
        return [...filteredNew, ...prev];
      });
      setToast({ visible: true, count: newItems.length, message: `${newItems.length} new trips added` });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast({ visible: false, count: 0 }), 3800);
      const container = document.querySelector(".list-panel");
      if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  };

  /* ---------- Map helpers ---------- */
  function coordsForTrip(trip, idx) {
    const t = (trip.title || "").toLowerCase();
    if (t.includes("india") || trip.source === "India") return [12.9716, 77.5946];
    if (t.includes("himalaya") || trip.source === "Himalayas") return [28.5983, 83.9311];
    if (t.includes("maldives") || trip.source === "Maldives") return [3.2028, 73.2207];
    if (t.includes("lisbon")) return [38.7223, -9.1393];
    if (t.includes("kyoto")) return [35.0116, 135.7681];
    if (t.includes("santorini")) return [36.3932, 25.4615];
    if (t.includes("paris")) return [48.8566, 2.3522];
    if (t.includes("bali")) return [-8.4095, 115.1889];
    if (t.includes("dubai")) return [25.2048, 55.2708];
    if (t.includes("rome")) return [41.9028, 12.4964];
    if (t.includes("tokyo")) return [35.6762, 139.6503];
    if (t.includes("new york")) return [40.7128, -74.006];
    // fallback pseudo-random on index/seed to spread markers
    const seed = idx * 9973 + (trip.generatedAt || Date.now());
    const lat = 20 + ((seed % 1000) / 1000) * 40 - 10; // between ~-10..+30
    const lng = 20 + ((Math.floor(seed / 17) % 1000) / 1000) * 140 - 70; // between ~-50..+70
    return [lat, lng];
  }

  const coordsMapRef = useRef({});
  useEffect(() => {
    // ensure coordsMapRef has an entry for every trip (stable)
    setTrips((cur) => {
      cur.forEach((t, i) => {
        if (!coordsMapRef.current[t.id]) coordsMapRef.current[t.id] = coordsForTrip(t, i);
      });
      return cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function priceDivIcon(priceText) {
    const ringSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="#022" stroke-opacity="0.06" stroke-width="3" fill="none" />
      <circle cx="12" cy="12" r="4.2" fill="#fff" opacity="0.06" />
    </svg>`;

    const html = `
      <div class="leaflet-price-bubble">
        <span class="symbol">${ringSvg}</span>
        <span class="price-text">${priceText}</span>
      </div>
    `;
    return L.divIcon({
      html,
      className: "leaflet-price-icon",
      iconSize: [94, 36],
      iconAnchor: [47, 36],
      popupAnchor: [0, -36],
    });
  }

  useEffect(() => {
    if (!mapRef.current) return;
    const bounds = [];
    trips.forEach((t, i) => {
      const coords = coordsMapRef.current[t.id] || coordsForTrip(t, i);
      if (Array.isArray(coords) && coords.length === 2) bounds.push(coords);
    });
    if (bounds.length > 0) {
      try {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } catch (e) {}
    }
  }, [trips]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current?.invalidateSize) try { mapRef.current.invalidateSize(); } catch (e) {}
    }, 250);
    return () => clearTimeout(timer);
  }, [mapRef, filtersOpen, createOpen]);

  const packingChecklist = ["Light jacket", "Power bank", "Comfortable shoes", "Sunscreen", "Reusable bottle"];

  const showNewResults = () => {
    const container = document.querySelector(".list-panel");
    if (!container) return;
    container.scrollTo({ top: 0, behavior: "smooth" });
    setToast({ visible: false, count: 0 });
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- FiltersDongolo (simplified, included) ---------- */
  function FiltersDongolo({ open, onClose, onApply }) {
    const [min, setMin] = useState(filters?.priceMin ?? "");
    const [max, setMax] = useState(filters?.priceMax ?? "");
    const [duration, setDuration] = useState(filters?.duration ?? "");
    const [theme, setTheme] = useState(filters?.theme ?? "");

    useEffect(() => {
      if (!open) return;
      const onEsc = (e) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onEsc);
      return () => window.removeEventListener("keydown", onEsc);
    }, [open, onClose]);

    useEffect(() => {
      if (open) {
        setMin(filters?.priceMin ?? "");
        setMax(filters?.priceMax ?? "");
        setDuration(filters?.duration ?? "");
        setTheme(filters?.theme ?? "");
      }
    }, [open, filters]);

    if (!open) return null;

    const presets = [
      { label: "Budget", min: 0, max: 40000 },
      { label: "Mid-range", min: 40000, max: 70000 },
      { label: "Luxury", min: 70000, max: 200000 },
    ];

    const themeList = [
      { key: "beach", label: "🏖 Beach" },
      { key: "city", label: "🏙 City" },
      { key: "romance", label: "❤️ Romance" },
      { key: "mountain", label: "⛰ Mountain" },
      { key: "adventure", label: "🧭 Adventure" },
      { key: "culture", label: "🏛 Culture" },
    ];

    return (
      <div className="filter-backdrop solid" onMouseDown={onClose}>
        <motion.div className="dongolo improved organized" onMouseDown={(e) => e.stopPropagation()} initial={{ scale: 0.98, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}>
          <div className="dongolo-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close filters">✕</button>
          </div>

          <div className="dongolo-grid" style={{ marginTop: 14 }}>
            <div className="field">
              <label className="field-label tiny">Theme</label>
              <div className="theme-row improved-theme-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {themeList.map((t) => (
                  <button key={t.key} className={`chip theme-chip ${theme === t.key ? "chip-active" : ""}`} onClick={() => setTheme((s) => s === t.key ? "" : t.key)} title={t.label}>
                    <span style={{ fontWeight: 800, marginRight: 8 }}>{t.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="field-label tiny">Price presets</label>
                <div className="presets-row" style={{ marginTop: 8, display: "flex", gap: 10 }}>
                  {presets.map((p) => <button key={p.label} className="preset-btn" onClick={() => { setMin(String(p.min)); setMax(String(p.max)); }}>{p.label}</button>)}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="field-label tiny">Price range (INR)</label>
                <div className="field-row" style={{ display: "flex", gap: 10 }}>
                  <input className="search" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))} />
                  <input className="search" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))} />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="field-label tiny">Duration</label>
              <select className="search select-contrast" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="">Any</option>
                <option value="short">1-3 days</option>
                <option value="mid">4-7 days</option>
                <option value="long">8+ days</option>
              </select>

              <div className="tiny" style={{ marginTop: 12 }}>Tip: try combining theme + price presets to get curated suggestions.</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => { setMin(""); setMax(""); setDuration(""); setTheme(""); }}>Reset</button>
            <button className="btn btn-primary" onClick={() => {
              const applied = { priceMin: min, priceMax: max, duration, theme };
              onApply(applied); generateMoreResults(applied, 10); onClose();
            }}>Apply</button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Quick share (native) ---------- */
  const quickShare = async (trip) => {
    const url = `${window.location.origin}/trip/${trip?.id || ""}`;
    const text = `${trip?.title || "Trip"} — ${trip?.subtitle || ""}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: trip.title, text: trip.subtitle, url });
        return;
      } catch (e) {
        // user cancelled or not available
      }
    }

    // fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setToast({ visible: true, count: 0, message: "Trip details copied to clipboard" });
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast({ visible: false, count: 0 }), 2200);
    } catch (e) {
      alert("Could not share — try copying the URL: " + url);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="trips-root">
      <div className="trips-wrap">

        {/* BACK BUTTON - navigates to home */}
        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate("/")} aria-label="Back to home">← Back to home</button>
        </div>

        <div className="hero cute-hero">
          <div className="hero-left">
            <h1 className="cute-main">✨ Trips — Curated Top Picks</h1>
            <p className="cute-sub">Pick a cute itinerary — book flights, export plans, or save to your trips.</p>

            <div className="controls">
              <input className="search cute-search" placeholder="Search trips, vibes, or dates (e.g. Beach, Trek)" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="hero-actions">
                <motion.button whileHover={{ y: -4 }} className="btn btn-ghost" onClick={() => setFiltersOpen(true)}>Filters</motion.button>
                <motion.button whileHover={{ y: -4 }} className="btn btn-primary" onClick={() => setCreateOpen(true)}>Create Trip</motion.button>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div style={{ marginTop: 8 }}>
              <motion.button whileHover={{ scale: 1.02 }} className="btn btn-ghost" onClick={() => setProfileOpen(true)}>Profile</motion.button>
            </div>
          </div>
        </div>

        <div className="main-grid">
          <div className="list-panel">
            {filtered.map((t) => (
              <motion.div key={t.id} className={`trip-card ${active === t.id ? "active" : ""}`} onClick={() => openDetails(t)} whileHover={{ translateY: -8 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
                <div className="thumb-wrap" style={{ position: "relative" }}>
                  <img src={t.image} alt={t.title} className="trip-thumb" />
                  <div className="price-bubble cute">{currencyINR(t.price)}</div>
                  {t.badge && <div className="trip-badge" aria-hidden>{t.badge}</div>}
                </div>

                <div className="trip-meta">
                  <div className="meta-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="trip-title">{t.title}</div>
                      <div className="tiny">{t.dates} • {t.subtitle}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <button className={`fav-btn ${t.fav ? "fav-active" : ""}`} onClick={(e) => toggleFav(t.id, e)} aria-label="Save to favorites"><Heart size={14} /></button>
                    </div>
                  </div>

                  <div className="card-actions">
                    <motion.button whileTap={{ scale: 0.98 }} className="btn btn-outline" onClick={(e) => { e.stopPropagation(); addToCalendar(t); }}><Calendar size={14} /> Add to Calendar</motion.button>

                    <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary" onClick={(e) => { e.stopPropagation(); bookFlight(t); }}>✈️ Book Flight</motion.button>

                    <motion.button whileTap={{ scale: 0.98 }} className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); exportItinerary(t); }}><Download size={14} /> Export</motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            <div style={{ height: 12 }} />
          </div>

          <aside className="right-rail">
            <div className="rail-card">
              <h3>Map & Live Pins</h3>
              <div className="map-panel">
                <div className="map-surface" aria-hidden>
                  <MapContainer
                    whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    center={[20.6, 78.96]}
                    zoom={3}
                    style={{ height: "260px", width: "100%", borderRadius: 8 }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap contributors'
                    />

                    {trips.map((t, i) => {
                      const coords = coordsMapRef.current[t.id] || coordsForTrip(t, i);
                      if (!coordsMapRef.current[t.id]) coordsMapRef.current[t.id] = coords;
                      return (
                        <Marker key={t.id} position={coords} icon={priceDivIcon(currencyINR(t.price))}>
                          <Popup>
                            <div style={{ fontWeight: 800 }}>{t.title}</div>
                            <div className="tiny">{t.subtitle}</div>
                            <div style={{ marginTop: 6, fontWeight: 800 }}>{currencyINR(t.price)}</div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="rail-card">
              <h4>Itinerary Preview</h4>
              <div className="itinerary">
                {openItinerary ? (
                  trips.find((x) => x.id === openItinerary).days.map((d) => (
                    <div key={d.day} className="day">
                      <div className="day-head"><div><strong>Day {d.day}</strong> — <span className="tiny">{d.title}</span></div><div className="tiny">{d.notes}</div></div>
                    </div>
                  ))
                ) : (
                  <div className="tiny">Select a trip to preview the day-by-day plan.</div>
                )}

                <div className="it-actions">
                  <motion.button className="btn btn-primary" whileTap={{ scale: 0.98 }} onClick={() => { if (openItinerary) exportItinerary(trips.find((x) => x.id === openItinerary)); else alert("Select a trip"); }}>Export Itinerary</motion.button>
                  <motion.button className="btn btn-ghost" whileTap={{ scale: 0.98 }} onClick={() => setShowPacking((s) => !s)}>{showPacking ? "Hide" : "Show"} Packing</motion.button>
                </div>

                {showPacking && (<div className="packing-list">{packingChecklist.map((p) => <label key={p} className="pack-item tiny"><input type="checkbox" /> {p}</label>)}</div>)}
              </div>
            </div>

            <div className="rail-card">
              <h4>Share & Save</h4>
              <div className="rail-actions">
                <motion.button className="btn btn-ghost" onClick={() => { if (openItinerary) quickShare(trips.find(x => x.id === openItinerary)); else quickShare(trips[0]); }} whileTap={{ scale: 0.98 }}>
                  <Share2 size={14} /> Quick Share
                </motion.button>

                <motion.button className="btn btn-ghost" onClick={() => setShareOpen(true)} whileTap={{ scale: 0.98 }}>
                  <Share2 size={14} /> Share (Modal)
                </motion.button>

                <motion.button className="btn btn-ghost" onClick={() => alert("Saved to your trips!")} whileTap={{ scale: 0.98 }}>
                  <Heart size={14} /> Save
                </motion.button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Filters modal */}
      <FiltersDongolo open={filtersOpen} onClose={() => setFiltersOpen(false)} onApply={(f) => setFilters(f)} />

      {/* Create modal */}
      {createOpen && (
        <div className="create-modal-backdrop" onMouseDown={() => setCreateOpen(false)}>
          <motion.div className="create-modal" onMouseDown={(e) => e.stopPropagation()} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Create Trip</h3>
              <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Close</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input className="search" placeholder="Trip title" value={ctitle} onChange={(e) => setCTitle(e.target.value)} />
                <input className="search" placeholder="Subtitle" value={csubtitle} onChange={(e) => setCSubtitle(e.target.value)} />
                <input className="search" placeholder="Dates (e.g. Mar 10 - Mar 16)" value={cdates} onChange={(e) => setCDates(e.target.value)} />
                <input className="search" placeholder="Approx price (INR)" value={cprice} onChange={(e) => setCPrice(e.target.value.replace(/[^\d]/g, ""))} />
              </div>

              <div style={{ marginTop: 10 }}>
                <label className="tiny">Days (small editor)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {cdays.map((d) => (
                    <div key={d.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 44, fontWeight: 800 }}>Day {d.day}</div>
                      <input value={d.title} onChange={(e) => updateCreateDay(d.id, { title: e.target.value })} className="search" />
                      <button className="btn btn-ghost" onClick={() => removeCreateDay(d.id)}>Remove</button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={addCreateDay}>Add day</button></div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label className="tiny">Tags</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <input placeholder="Add tag" className="search" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTagToCreate(); } }} />
                  <button className="btn btn-ghost" onClick={addTagToCreate}>Add</button>
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>{ctags.map((t) => <div key={t} className="chip chip-active" onClick={() => removeCTag(t)}>{t} ✕</div>)}</div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={createSave}>Save trip</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share modal */}
      <ShareModal open={shareOpen} trip={openItinerary ? trips.find(x => x.id === openItinerary) : trips[0]} onClose={() => setShareOpen(false)} />

      {/* Profile modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} travelsList={trips} />

      {/* Toast when results added */}
      {toast.visible && (
        <div className="trips-toast" role="status" aria-live="polite">
          <div>{toast.count > 0 ? `${toast.count} new trips added ✨` : toast.message || "No new results"}</div>
          {toast.count > 0 ? <button className="btn btn-ghost small" onClick={showNewResults}>Show</button> : <button className="btn btn-ghost small" onClick={() => setToast({ visible: false, count: 0 })}>OK</button>}
        </div>
      )}
    </div>
  );
}
