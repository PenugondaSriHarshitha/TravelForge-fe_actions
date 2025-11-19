// src/components/Trips.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, Download, Wand2, CloudSun, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import img1 from "../images/img1.png";
import img2 from "../images/img2.png";
import img3 from "../images/img3.png";

import "./Trips.css";
import TripBuilder from "./TripBuilder";

// Leaflet icon fix for bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

/* ---------- helpers ---------- */

// reliable random image (no API keys, always returns)
const getRandomImage = (title = "travel") =>
  `https://picsum.photos/seed/${encodeURIComponent(title)}-${Math.floor(
    Math.random() * 100000
  )}/800/500`;

// currency
const currencyINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

// weather + best season (heuristic)
function inferWeatherAndSeason(titleOrSource = "") {
  const key = (titleOrSource || "").toLowerCase();
  if (key.includes("goa") || key.includes("lisbon")) return { temp: 28, season: "Best in December", icon: "☀️" };
  if (key.includes("kyoto") || key.includes("japan")) return { temp: 22, season: "Best in April", icon: "🌸" };
  if (key.includes("santorini") || key.includes("greece")) return { temp: 26, season: "Best in September", icon: "🌤️" };
  if (key.includes("himalaya") || key.includes("ladakh")) return { temp: 18, season: "Best in May", icon: "🏔️" };
  return { temp: 27, season: "Best in September", icon: "☀️" };
}

// fun rename
function generateCoolName(base = "") {
  const city = (base || "Wander").split(/[•\-–|,]/)[0].trim();
  const pools = [
    [`${city} Daylights`, `Whispers of ${city}`, `${city} Slow Trails`, `${city} in Pastel`],
    [`Saffron Streets of ${city}`, `${city}: Rooftops & Sunsets`, `Moonlit ${city}`, `${city} Cozy Corners`],
    [`${city} Pocket Guide`, `Little Joys of ${city}`, `${city} By Foot`, `${city} Mornings`],
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return pick(pick(pools));
}

// map coords guess
function coordsFromText(text = "") {
  const k = text.toLowerCase();
  if (k.includes("india") || k.includes("goa") || k.includes("vijayawada")) return [16.5062, 80.648];
  if (k.includes("himalaya") || k.includes("ladakh")) return [34.1526, 77.5771];
  if (k.includes("maldives")) return [3.2028, 73.2207];
  if (k.includes("lisbon")) return [38.7223, -9.1393];
  if (k.includes("kyoto")) return [35.0116, 135.7681];
  if (k.includes("santorini") || k.includes("greece")) return [36.3932, 25.4615];
  return [20.5937, 78.9629]; // India center-ish
}

// normalize trips from backend / builder to the UI shape we need
function normalizeTrip(t) {
  // days can be objects (preferred) or strings (fallback)
  let days = [];
  if (Array.isArray(t.days)) {
    if (t.days.length && typeof t.days[0] === "string") {
      days = t.days.map((title, i) => ({ day: i + 1, title: String(title) }));
    } else {
      days = t.days.map((d, i) => ({
        day: Number(d.day ?? i + 1),
        title: String(d.title ?? ""),
      }));
    }
  }

  return {
    id: t.id ?? `trip-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    title: t.title ?? "Untitled Trip",
    subtitle:
      t.subtitle ??
      `${days.length} days • ${String(t.tripType || t.type || "trip").toLowerCase()}`,
    dates: t.dateRange || t.dates || "",
    price: Number(t.estimatedCost ?? t.price ?? 0),
    image: t.image || getRandomImage(t.title),
    fav: Boolean(t.fav),
    days,
    tags: Array.isArray(t.tags) ? t.tags : [],
    source: t.destination || t.source || "",
  };
}

/* ---------- component ---------- */

export default function Trips() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // one built-in trip so the page never looks empty
  const builtin = [
    normalizeTrip({
      id: "trip-1",
      title: "Vijayawada • Sunsets & rooftops",
      subtitle: "9 days • romance",
      dates: "Nov 4 – Nov 12",
      estimatedCost: 38800,
      image: img1,
      destination: "India",
      fav: false,
      days: [
        { day: 1, title: "Arrival & River Walk" },
        { day: 2, title: "Temple Tour • Rooftop" },
        { day: 3, title: "Old Town Cafés" },
      ],
      tags: ["romance", "budget", "flexible"],
    }),
  ];

  const [query, setQuery] = useState("");
  const [openItinerary, setOpenItinerary] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [trips, setTrips] = useState([]);

  // load from backend and merge with builtin
  useEffect(() => {
    fetch("http://localhost:8084/trip/all")
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data) ? data.map(normalizeTrip) : [];
        // backend first, then builtin:
        setTrips([...safe, ...builtin]);
      })
      .catch((err) => {
        console.error("Error loading trips:", err);
        setTrips([...builtin]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) =>
      (t.title + " " + (t.subtitle || "") + " " + (t.source || ""))
        .toLowerCase()
        .includes(q)
    );
  }, [trips, query]);

  const stats = useMemo(() => {
    const totalTrips = filtered.length;
    const countries = new Set(
      filtered.map((t) => {
        const k = (t.title + " " + t.source).toLowerCase();
        if (k.includes("portugal") || k.includes("lisbon")) return "Portugal";
        if (k.includes("japan") || k.includes("kyoto")) return "Japan";
        if (k.includes("greece") || k.includes("santorini")) return "Greece";
        if (k.includes("maldives")) return "Maldives";
        if (k.includes("india") || k.includes("himalaya")) return "India";
        return "Other";
      })
    );
    const totalDays = filtered.reduce((sum, t) => sum + (t.days?.length || 0), 0);
    return { totalTrips, countries: countries.size, totalDays };
  }, [filtered]);

  // actions
  const toggleFav = (id) =>
    setTrips((p) => p.map((t) => (t.id === id ? { ...t, fav: !t.fav } : t)));

  const exportItinerary = (trip) => {
    const blob = new Blob([JSON.stringify(trip, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.id}-itinerary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addToCalendar = (trip) => {
    const startDate = new Date();
    const days = Math.max(1, trip.days?.length || 3);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: trip.title || "Trip",
      details: trip.subtitle || "",
      location: trip.source || "",
      dates: `${fmt(startDate)}/${fmt(endDate)}`,
    });
    window.open(
      `https://calendar.google.com/calendar/render?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const renameTrip = (id) =>
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: generateCoolName(t.title) } : t))
    );

  // called by TripBuilder after POST /trip/create
  // trip may already be the saved backend object; normalize for UI
  const handleCreateTrip = (trip) => {
    const formatted = normalizeTrip(trip);
    setTrips((p) => [formatted, ...p]);
    setBuilderOpen(false);
    // keep user on /trips view
  };

  return (
    <div className="trips-root">
      {/* Hero */}
      <header className="trips-hero container">
        <div className="hero-heading">
          <h1>🌍 Your Travel Library</h1>
          <p>Save, build & customize every trip.</p>
        </div>

        <div className="hero-controls">
          <input
            className="search-input"
            placeholder="Search trips, vibes, or dates (e.g. Beach, Trek)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hero-buttons">
            <button className="btn-ghost" onClick={() => navigate("/")}>
              ← Home
            </button>
            <button className="btn-minimal" onClick={() => setBuilderOpen(true)}>
              <Plus size={16} /> Create Trip
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <span className="icon">📌</span>
            <div>
              <div className="stat-number">{stats.totalTrips}</div>
              <div className="stat-label">Trips</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="icon">🌎</span>
            <div>
              <div className="stat-number">{stats.countries}</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="icon">🗓️</span>
            <div>
              <div className="stat-number">{stats.totalDays}</div>
              <div className="stat-label">Total days</div>
            </div>
          </div>
        </div>
      </header>

      <div className="main-grid container">
        <div className="list-panel">
          {filtered.map((t) => {
            const meta = inferWeatherAndSeason(`${t.title} ${t.source || ""}`);
            const coords = coordsFromText(`${t.title} ${t.source || ""}`);

            return (
              <motion.article
                key={t.id}
                className="trip-card"
                whileHover={{ translateY: -4 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
              >
                <div className="card-media">
                  <img
                    src={t.image || getRandomImage(t.title)}
                    alt={t.title}
                    className="card-img"
                    onError={(e) => {
                      e.currentTarget.src = getRandomImage(t.title);
                    }}
                  />
                  <div className="title-overlay">
                    <h3 className="trip-title">{t.title}</h3>
                    <div className="trip-sub">
                      {t.dates} • {t.subtitle}
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="pill-row">
                    <span className="chip chip-info">
                      <CloudSun size={14} /> {meta.icon} {meta.temp}°C
                    </span>
                    <span className="chip">{meta.season}</span>
                    {(t.tags || []).slice(0, 2).map((g, i) => (
                      <span key={`${t.id}-tag-${i}`} className="chip chip-soft">
                        {g}
                      </span>
                    ))}
                    <button className="chip chip-link" onClick={() => renameTrip(t.id)}>
                      <Wand2 size={14} /> Rename Trip
                    </button>
                  </div>

                  <div className="price-row">
                    <div className="price">{currencyINR(t.price)}</div>
                    <div className="actions">
                      <button className="btn-outline ink" onClick={() => addToCalendar(t)}>
                        <Calendar size={14} /> Add to Calendar
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() =>
                          navigate(`/book/${t.id}`, { state: { trip: t, source: "trips" } })
                        }
                      >
                        ✈️ Book Flight
                      </button>
                      <button className="btn-ghost" onClick={() => exportItinerary(t)}>
                        <Download size={14} /> Export
                      </button>
                      <button
                        className={`fav ${t.fav ? "on" : ""}`}
                        onClick={() => toggleFav(t.id)}
                        aria-label="Save to favorites"
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="itinerary-mini">
                    {(t.days || []).slice(0, 3).map((d) => (
                      <div key={`${t.id}-day-${d.day}`} className="mini-day">
                        <strong>Day {d.day}</strong> — <span>{d.title}</span>
                      </div>
                    ))}
                    {(t.days?.length || 0) > 3 && (
                      <button
                        className="btn-link"
                        onClick={() =>
                          setOpenItinerary(openItinerary === t.id ? null : t.id)
                        }
                      >
                        {openItinerary === t.id
                          ? "Hide itinerary"
                          : `View ${t.days.length}-day itinerary`}
                      </button>
                    )}
                    {openItinerary === t.id && (
                      <div className="itinerary-full">
                        {t.days.map((d) => (
                          <div key={`${t.id}-full-${d.day}`} className="full-day">
                            <div>
                              <strong>Day {d.day}</strong>
                            </div>
                            <div className="muted">{d.title}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="location-row">
                    <span className="muted">
                      <MapPin size={14} /> {coords[0].toFixed(2)}, {coords[1].toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state">
              No trips match your search. Try “Beach”, “Trek”, “Goa”…
            </div>
          )}
        </div>

        <aside className="right-rail">
          <div className="rail-card">
            <h4>Map & Live Pins</h4>
            <div className="map-panel">
              <MapContainer
                whenCreated={(m) => {
                  mapRef.current = m;
                }}
                center={[20.6, 78.96]}
                zoom={4}
                style={{ height: "260px", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
                />
                {filtered.map((t) => {
                  const c = coordsFromText(`${t.title} ${t.source || ""}`);
                  return (
                    <Marker key={`marker-${t.id}`} position={c}>
                      <Popup>
                        <strong>{t.title}</strong>
                        <div className="tiny">{t.subtitle}</div>
                        <div style={{ marginTop: 6, fontWeight: 800 }}>
                          {currencyINR(t.price)}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          <div className="rail-card">
            <h4>Quick Tips</h4>
            <ul className="tips">
              <li>Pick shoulder months for cheaper stays.</li>
              <li>Use “Add to Calendar” to block dates early.</li>
              <li>Click “Rename Trip” for fun names.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* FULL-SCREEN BUILDER */}
      {builderOpen && (
        <TripBuilder onClose={() => setBuilderOpen(false)} onCreate={handleCreateTrip} />
      )}
    </div>
  );
}
