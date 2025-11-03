// BestTimeToTravel.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Calendar, Search, PlaneTakeoff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DateRangePicker from "../components/DateRangePicker";

import Santorini from "../images/Santorini.png";
import Kyoto from "../images/Kyoto.png";
import bgVideo from "../images/video6.mp4";

/* image imports */
import img1 from "../images/img1.png";
import img2 from "../images/img2.png";
import img3 from "../images/img3.png";
import img4 from "../images/img4.png";
import img5 from "../images/img5.png";
import img6 from "../images/img6.png";
import img7 from "../images/img7.png";
import img8 from "../images/img8.png";
import img9 from "../images/img9.png";
import img10 from "../images/img10.png";
import img11 from "../images/img11.png";
import img12 from "../images/img12.png";
import img13 from "../images/img13.png";
import img14 from "../images/img14.png";
import img15 from "../images/img15.png";
import img16 from "../images/img16.png";
import img17 from "../images/img17.png";
import img18 from "../images/img18.png";
import img19 from "../images/img19.png";
import img20 from "../images/img20.png";
import img21 from "../images/img21.png";
import img22 from "../images/img22.png";
import img24 from "../images/img24.png";
import img25 from "../images/img25.png";

import "./BestTimeToTravel.css";

// ------- Optional fixed overrides you already had -------
const DESTINATION_INFO = {
  kerala: {
    season: "Autumn",
    months: "October to November",
    bestTime: "Morning – Cool & peaceful for sightseeing 🌅",
    tip: "Ideal weather for sightseeing & fewer crowds.",
  },
  goa: {
    season: "Winter",
    months: "November to February",
    bestTime: "Evening – Perfect for beach sunsets 🌇",
    tip: "Ideal for beach festivals & outdoor fun.",
  },
  kochi: {
    season: "Monsoon",
    months: "June to September",
    bestTime: "Morning – Lush greenery & cool breezes 🌿",
    tip: "Great for backwaters & monsoon lovers.",
  },
  ladakh: {
    season: "Summer",
    months: "May to September",
    bestTime: "Morning – Great for trekking & photography 🏔️",
    tip: "Perfect visibility and clear skies for adventure.",
  },
  delhi: {
    season: "Winter",
    months: "October to February",
    bestTime: "Morning – Ideal for monuments & bazaars 🕌",
    tip: "Avoid afternoons; winter air is crisp & pleasant.",
  },
};

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function BestTimeToTravel() {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  // show the Best-Time card only after Search
  const [searchClicked, setSearchClicked] = useState(false);

  // form state
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [tripLen, setTripLen] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const openModal = (item, mode = "details") => {
    setModalItem({ ...item, mode });
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
    document.body.style.overflow = "";
  };

  // date picker popup control
  const [pickerOpen, setPickerOpen] = useState(false);

  // results + pagination
  const [allResults, setAllResults] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 6;

  // weather snapshot
  const [weather, setWeather] = useState(null);

  // sparkle animation
  const [sparkle, setSparkle] = useState(false);

  // scroll-to-top visibility
  const [showTop, setShowTop] = useState(false);

  // dynamic best-time data
  const [timeData, setTimeData] = useState(getBestTimeInfo(""));

  // currency helper
  const currency = (n) =>
    n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  /* images pool */
  const images = useMemo(
    () => [
      img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
      img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
      img21, img22, img24, img25,
    ],
    []
  );

  const captionPhrases = useMemo(
    () => [
      "Hidden gem spots",
      "Cozy cafés & views",
      "Best sunset points",
      "Local favorites",
      "Quiet escapes",
      "City-lights strolls",
      "Photographer's pick",
      "Rooftop vibes",
      "Seaside relaxation",
      "Street-food tour",
      "Top viewpoints",
      "Historic neighborhoods",
    ],
    []
  );

  const excerptPhrases = useMemo(
    () => [
      "Charming streets and hidden gems await.",
      "Sunsets, slow walks & peaceful vibes.",
      "A blend of history, food, and culture.",
      "Tranquil escapes with vibrant energy.",
      "Scenic views and cozy hideouts.",
      "Bustling markets & soulful flavors.",
      "Calm mornings, lively nights.",
      "Waves, winds & whispers of tradition.",
      "Stories written in every corner.",
      "Colors, culture & coastal dreams.",
      "Cobblestone lanes and whispered tales.",
      "Savor the small moments & local flavors.",
    ],
    []
  );

  // fake data generator
  function fakeSearchResults(destination, count = 24, startDate = null, endDate = null) {
    const destHash = destination
      ? destination.toLowerCase().split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      : 0;

    return Array.from({ length: count }).map((_, i) => {
      const id = `${(destination || "dest").toLowerCase()}-${i + 1}`;
      const city = destination || "Unknown";
      const dateSeed = startDate ? new Date(startDate).getDate() % 7 : 0;
      const priceBase = 2000 + dateSeed * 200;
      const imgIndex = (i + destHash) % images.length;
      const caption = `${city} — ${captionPhrases[(i + 5) % captionPhrases.length]}`;
      const excerpt = `${city} — ${excerptPhrases[(i * 7 + destHash) % excerptPhrases.length]}`;

      return {
        id,
        title: `${city} — Top pick #${i + 1}`,
        excerpt,
        img: images[imgIndex] || img25,
        imgCaption: caption,
        price: priceBase + i * 300 + Math.round(Math.random() * 900),
        rating: (4.0 + (i % 5) * 0.2).toFixed(1),
        nights: [2, 3, 4, 5][i % 4],
        locationLabel: city.toUpperCase(),
        recommeded: i % 4 === 0,
      };
    });
  }

  function fakeWeather(destination) {
    const temps = { default: 29, delhi: 34, goa: 30, kyoto: 22, santorini: 26 };
    const key = (destination || "default").toLowerCase();
    const temp = temps[key] ?? temps.default;
    return {
      temp,
      desc: temp > 30 ? "Hot & sunny" : temp > 24 ? "Warm & pleasant" : "Cool & fresh",
      icon: temp > 30 ? "🔥" : "☀️",
      img: Santorini,
    };
  }

  // chart sample
  const prices = useMemo(() => {
    const base = 8400;
    return Array.from({ length: 30 }).map((_, i) => {
      const spike = i % 7 === 0 ? 4200 : 0;
      const wave = Math.round(
        base + Math.sin(i / 2) * 900 + Math.cos(i / 4) * 420 + spike + (Math.random() - 0.5) * 400
      );
      return Math.max(2000, wave);
    });
  }, []);
  const labels = prices.map((_, i) => `${i + 1}`);
  const cheapest = Math.min(...prices);
  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Daily price",
          data: prices,
          backgroundColor: prices.map((p) =>
            p === cheapest ? "rgba(255,152,67,0.95)" : "rgba(6,20,28,0.12)"
          ),
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 12,
        },
      ],
    }),
    [prices, labels, cheapest]
  );

  const chartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx) => `${currency(ctx.parsed.y)}` },
          backgroundColor: "#0b1220",
          titleColor: "#e6fff9",
          bodyColor: "#e6fff9",
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#516b67" } },
        y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { color: "#516b67" } },
      },
    }),
    []
  );

  const visibleResults = allResults.slice(0, page * perPage);

  const scrollToResults = (offset = 0) => {
    const node = resultsRef.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const runSearch = (opts = {}) => {
    const dest = (opts.dest ?? toInput ?? "").trim();
    const sDate = opts.startDate ?? startDate;
    const eDate = opts.endDate ?? endDate;

    if (!dest) {
      const toField = document.getElementById("to-input");
      if (toField) {
        toField.focus();
        toField.animate(
          [
            { boxShadow: "0 0 0px rgba(255,100,100,0)" },
            { boxShadow: "0 0 8px rgba(255,100,100,0.9)" },
            { boxShadow: "0 0 0px rgba(255,100,100,0)" },
          ],
          { duration: 700 }
        );
      }
      alert("Please enter a destination in the 'To' field before searching.");
      return;
    }

    setLoading(true);
    setAllResults([]);
    setPage(1);
    setWeather(null);
    setSparkle(false);

    // refresh best-time info for the chosen destination
    setTimeData(getBestTimeInfo(dest));

    setTimeout(() => {
      const results = fakeSearchResults(dest, 24, sDate, eDate);
      setAllResults(results);
      setWeather(fakeWeather(dest));
      setLoading(false);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 1800);
      setTimeout(() => scrollToResults(110), 140);
    }, 700);
  };

  const handleSearchAndScroll = (e) => {
    e?.preventDefault();
    runSearch();
    setPickerOpen(false);
  };

  const handleDateChange = (which, value) => {
    if (which === "start") setStartDate(value);
    if (which === "end") setEndDate(value);
    const shouldSearch = toInput.trim().length > 0 && (which === "start" || which === "end");
    if (shouldSearch) {
      setTimeout(
        () =>
          runSearch({
            startDate: which === "start" ? value : startDate,
            endDate: which === "end" ? value : endDate,
          }),
        300
      );
    }
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
    setTimeout(() => window.scrollBy({ top: 420, behavior: "smooth" }), 120);
  };

  const handleBook = (item) => {
    navigate(`/book/${item.id}`, { state: { item, type: "stay" } });
  };

  const handleClear = () => {
    setAllResults([]);
    setToInput("");
    setFromInput("");
    setWeather(null);
    setStartDate("");
    setEndDate("");
    setPage(1);
    setSearchClicked(false);
  };

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const readableRange = (a, b) => {
    if (!a && !b) return "";
    if (a && !b) return `From ${a}`;
    if (!a && b) return `Until ${b}`;
    return `${a} → ${b}`;
  };

  // ---------- SMART PLACE-AWARE SEASON LOGIC ----------
  function classifyDestination(raw) {
    const s = (raw || "").toLowerCase();

    // spring-bloom regions (takes priority over plain city)
    const springBloom = [
      "japan", "tokyo", "kyoto", "osaka", "kawaguchi", "fujikawaguchiko",
      "korea", "seoul", "busan", "jeju",
      "netherlands", "amsterdam", "keukenhof", "tulip", "lisse",
      "washington dc", "dc", "vancouver"
    ];

    const desert = [
      "dubai", "abu dhabi", "doha", "qatar", "muscat", "oman",
      "jaisalmer", "rajasthan", "sahara", "gobi", "desert"
    ];

    const beach = [
      "beach", "island", "coast",
      "maldives", "bali", "phuket", "krabi", "samui", "langkawi",
      "goa", "andaman", "lakshadweep",
      "seychelles", "mauritius", "zanzibar",
      "boracay", "palawan", "cebu",
      "hawaii", "maui", "oahu", "kauai",
      "ibiza", "mallorca", "cancun", "tulum", "punta cana",
      "santorini", "mykonos", "amalfi", "rio", "nice"
    ];

    const mountain = [
      "mount", "mt ", "alps", "himalaya", "rockies", "andes",
      "ladakh", "leh", "manali", "kashmir", "gulmarg", "nainital", "shimla", "ooty",
      "banff", "aspen", "whistler", "interlaken", "zermatt", "grindelwald",
      "everest", "annapurna", "nepal", "sikkim"
    ];

    const snow = [
      "iceland", "finland", "norway", "lapland", "sweden",
      "alaska", "canada", "greenland", "arctic", "antarctica",
      "sapporo", "hakuba", "niseko"
    ];

    const tropical = [
      "tropical", "rainforest", "borneo", "sumatra",
      "kerala", "sri lanka", "bali", "phuket", "thailand", "vietnam",
      "bora bora", "fiji", "tahiti", "moorea", "bocas", "cairns", "costa rica"
    ];

    const city = [
      "paris", "london", "rome", "florence", "milan", "venice",
      "barcelona", "madrid", "berlin", "vienna", "prague",
      "tokyo", "kyoto", "osaka", "seoul", "singapore", "bangkok", "kuala lumpur",
      "amsterdam", "budapest", "lisbon", "athens",
      "new york", "nyc", "los angeles", "chicago", "san francisco",
      "sydney", "melbourne", "auckland",
      "delhi", "mumbai", "dubai"
    ];

    const hit = (arr) => arr.some(k => s.includes(k));
    if (hit(springBloom)) return "spring";
    if (hit(desert)) return "desert";
    if (hit(beach)) return "beach";
    if (hit(mountain)) return "mountain";
    if (hit(snow)) return "snow";
    if (hit(tropical)) return "tropical";
    if (hit(city)) return "city";

    // fallback heuristic by suffixes/words
    if (/\b(island|beach|bay|cove)\b/.test(s)) return "beach";
    if (/\b(pass|peak|mt|trek|ridge)\b/.test(s)) return "mountain";

    return "city";
  }

  function getBestTimeInfo(destination) {
    const destKey = (destination || "").toLowerCase().trim();

    // 1) Use explicit data if you defined it
    if (destKey && DESTINATION_INFO[destKey]) {
      return { ...DESTINATION_INFO[destKey] };
    }

    // 2) Smart classification
    const cat = classifyDestination(destKey);

    // time-of-day defaults by category
    const bestTimeByCat = {
      beach: "Evening – Perfect for beach sunsets 🌇",
      tropical: "Afternoon – Beaches, snorkeling & calm seas 🏖️",
      mountain: "Morning – Clear skies for trekking 🏔️",
      desert: "Night – Ideal for stargazing & skyline views 🌙",
      snow: "Morning – Best visibility on slopes ❄️",
      spring: "Morning – Parks & blooms 🌸",
      city: "Evening – Walks, rooftops & cafés 🌇",
    };

    // month ranges by category (generally correct for popular spots)
    const monthsByCat = {
      beach: "November to March",
      tropical: "May to September (dry season)",
      mountain: "May to September",
      desert: "November to March",
      snow: "December to March",
      spring: "March to May",
      city: "April to June / September to October",
    };

    // tips by category
    const tipByCat = {
      beach: "Dry season vibes — great for water sports and sunsets.",
      tropical: "Dry season brings calmer seas & clear skies — perfect for islands.",
      mountain: "Carry layers; nights get cold even in summer.",
      desert: "Avoid midday heat; plan desert safaris for sunset.",
      snow: "Check road/rail closures and pack thermal layers.",
      spring: "Book early; blossom festivals & tulip season draw crowds.",
      city: "Mild weather and fewer crowds than peak summer.",
    };

    // season label by category (human-friendly)
    const seasonByCat = {
      beach: "Winter (Dry)",
      tropical: "Dry Season",
      mountain: "Summer",
      desert: "Winter",
      snow: "Winter",
      spring: "Spring",
      city: "Spring / Autumn",
    };

    const season = seasonByCat[cat];
    const months = monthsByCat[cat];
    const bestTime = bestTimeByCat[cat];
    const tip = tipByCat[cat];

    return { season, months, bestTime, tip };
  }
  // ---------- END SMART LOGIC ----------

  // keep timeData fresh when destination changes & every minute
  useEffect(() => {
    setTimeData(getBestTimeInfo(toInput));
  }, [toInput]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(getBestTimeInfo(toInput));
    }, 60000);
    return () => clearInterval(interval);
  }, [toInput]);

  return (
    <div className="bt-page">
      <div className="bt-hero">
        <video
          className="hero-bg-video"
          src={bgVideo}
          poster={Kyoto}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden />
        <div className="bt-hero-inner container">
          <h1 className="bt-title">
            Know the Best Time to Travel <span role="img" aria-label="plane">✈️</span>
          </h1>
          <p className="bt-sub">
            Months, exact dates and booking tips — combined with price trends, hotel snapshots and live-ish weather so you can plan with confidence.
          </p>

          <div className="bt-search glass-card">
            <form className="search-row" onSubmit={handleSearchAndScroll}>
              {/* Back button stays inside the search row */}
              <button
                type="button"
                className="back-btn"
                onClick={() => window.history.back()}
                title="Go back"
                aria-label="Back"
                style={{ marginRight: 12 }}
              >
                ← Back
              </button>

              {/* From */}
              <div className="input-group fancy-input" style={{ minWidth: 260 }}>
                <PlaneTakeoff className="icon" />
                <input
                  placeholder="From (city or airport)"
                  aria-label="From"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                />
              </div>

              {/* To */}
              <div className="input-group fancy-input" style={{ minWidth: 260 }}>
                <PlaneTakeoff className="icon" />
                <input
                  id="to-input"
                  placeholder="To (destination)"
                  aria-label="To"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                />
              </div>

              {/* Date range with floating picker */}
              <div className="input-group date-range fancy-input" style={{ position: "relative", minWidth: 300 }}>
                <Calendar className="icon" />

                <div className="inline-range" role="group" aria-label="Date range" style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className={`range-input ${startDate ? "has-value" : ""}`}
                    onClick={() => setPickerOpen((s) => !s)}
                    aria-label="Pick start date"
                    style={{ padding: "10px 14px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    <div className="small-label" style={{ fontSize: 11, opacity: 0.8 }}>From</div>
                    <div className="value" style={{ fontWeight: 700 }}>{startDate || "Start date"}</div>
                  </button>

                  <button
                    type="button"
                    className={`range-input ${endDate ? "has-value" : ""}`}
                    onClick={() => setPickerOpen((s) => !s)}
                    aria-label="Pick end date"
                    style={{ padding: "10px 14px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    <div className="small-label" style={{ fontSize: 11, opacity: 0.8 }}>To</div>
                    <div className="value" style={{ fontWeight: 700 }}>{endDate || "End date"}</div>
                  </button>
                </div>

                {pickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      left: 0,
                      zIndex: 6000,
                      background: "transparent",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      isOpen={pickerOpen}
                      onOpenChange={(v) => setPickerOpen(v)}
                      onChange={({ startDate: s, endDate: e }) => {
                        setStartDate(s || "");
                        setEndDate(e || "");
                        handleDateChange("start", s || "");
                        handleDateChange("end", e || "");
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Trip length */}
              <div className="input-group fancy-input" style={{ width: 120 }}>
                <Calendar className="icon" />
                <select
                  value={tripLen}
                  onChange={(e) => setTripLen(Number(e.target.value))}
                  aria-label="Trip length"
                  style={{ background: "transparent", border: "none", color: "inherit" }}
                >
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={4}>4 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>

              {/* Search */}
              <button
                className="btn-search"
                type="submit"
                aria-label="Search"
                disabled={loading}
                style={{ marginLeft: 8 }}
                onClick={() => setSearchClicked(true)} // let form onSubmit run the search
              >
                <Search /> <span className="btn-text">{loading ? "Searching…" : "Search"}</span>
              </button>
            </form>

            <div className="search-meta">
              <span>✨ Fast fares</span> <span>🏨 Hotel insights</span> <span>📈 Historical trends</span>
            </div>
          </div>
        </div>
      </div>

      <main className="bt-main container" ref={resultsRef}>
        <section className="results-summary">
          <div className="results-title">
            {allResults.length > 0 ? (
              <h2 className={sparkle ? "sparkle" : ""}>
                Results for <span className="highlight">{toInput.toUpperCase()}</span>{" "}
                <small className="date-range-label">{readableRange(startDate, endDate)}</small>
              </h2>
            ) : (
              <h2>Search to discover dates, prices & weather</h2>
            )}
          </div>

          {weather && (
            <motion.div
              className="weather-inline card"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="weather-inline-head">
                <div className="weather-inline-temp">
                  {weather.icon} <strong>{weather.temp}°C</strong>
                </div>
                <div className="weather-inline-desc">
                  {weather.desc} — live snapshot for <strong>{toInput}</strong>
                </div>
                <div className="weather-mini-meta">
                  Trip length: <strong>{tripLen} days</strong> &nbsp; • &nbsp; Dates:{" "}
                  <strong>{readableRange(startDate, endDate)}</strong>
                </div>
              </div>
              <div className="weather-inline-img">
                <img src={weather.img} alt="weather" />
              </div>
            </motion.div>
          )}
        </section>

        {/* ✅ BEST TIME & SEASON — only after Search */}
        {searchClicked && (
          <motion.section
            className={`best-time-section orange-theme`} 
            // (change to "teal-theme" if you prefer the teal look)
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 16 }}
          >
            <h3>🗓 Best Time & Season to Visit {toInput || ""}</h3>
            <div className="bt-info-grid">
              <div><strong>🌤 Season:</strong> {timeData.season}</div>
              <div><strong>📅 Ideal Months:</strong> {timeData.months}</div>
              <div><strong>🕒 Best Time of Day:</strong> {timeData.bestTime}</div>
              <div><strong>💡 Travel Tip:</strong> {timeData.tip}</div>
            </div>
          </motion.section>
        )}

        <section className="two-cols">
          <motion.div className="advice card" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h3>Our advice</h3>
            <p className="lead">
              Take your trip in <strong>September</strong> — lower fares and pleasant weather make it a great choice.
            </p>
            <p className="muted">Example airfare (roundtrip): <strong>{currency(14152)}</strong></p>

            <div className="action-row">
              <button className="btn-ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>← Back</button>
              <button className="btn-gradient" onClick={() => setPickerOpen(true)}>Pick Exact Dates →</button>
            </div>
          </motion.div>

          <motion.div className="weather card" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h3>Price trends — {new Date().toLocaleString("default", { month: "long" })}</h3>
            <div style={{ height: 240 }} className="chart-canvas">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="chart-legend">
              <div><span className="chip orange" /> Cheapest day</div>
              <div><span className="chip gray" /> Typical</div>
              <div className="help-right">Pick dates or click <strong>Pick Exact Dates</strong> to preview multi-night costs.</div>
            </div>
          </motion.div>
        </section>

        <section className="results-grid-wrap">
          <div className="grid-header">
            <div className="left">
              <h3>{allResults.length ? `${allResults.length} options` : "No results yet"}</h3>
            </div>
            <div className="right">
              {allResults.length > 0 && <button className="btn-clear" onClick={handleClear}>Clear</button>}
            </div>
          </div>

          <div className="cards-grid">
            {visibleResults.map((r) => (
              <article key={r.id} className="result-card card">
                <div className="card-media">
                  <img src={r.img} alt={r.title} />
                  <div className="img-caption">{r.imgCaption}</div>
                </div>
                <div className="card-body">
                  <div className="card-title-row">
                    <h4 className="result-title">{r.title}</h4>
                    {r.recommeded && <span className="pill">Recommended</span>}
                  </div>
                  <p className="result-excerpt">{r.excerpt}</p>

                  <div className="card-meta">
                    <div className="meta-left">
                      <div className="meta-location">{r.locationLabel}</div>
                      <div className="meta-rating">⭐ {r.rating}</div>
                    </div>

                    <div className="meta-right">
                      <div className="meta-price">
                        {currency(r.price)} <small>/ night</small>
                      </div>
                      <div className="meta-actions">
                        <button className="btn-details" onClick={() => openModal(r, "details")}>Details</button>
                        <button className="btn-primary" onClick={() => handleBook(r)}>Book</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {loading && (
            <div className="loading-row">
              <div className="loader-dot" />
              <div>Searching for best matches…</div>
            </div>
          )}

          {!loading && allResults.length === 0 && (
            <div className="empty-row muted">Try searching for a destination (example: "Goa" or "Kyoto") and pick dates to see tailored results.</div>
          )}

          {allResults.length > visibleResults.length && (
            <div className="load-more-row">
              <button className="btn-gradient" onClick={handleLoadMore}>Load more</button>
            </div>
          )}

          {allResults.length > 0 && visibleResults.length >= allResults.length && (
            <div className="end-row muted">You’ve reached the end of results.</div>
          )}
        </section>

        {allResults.length > 0 && (
          <section className="recommended-wrap">
            <h3>Recommended stays & local picks</h3>
            <div className="recommended-grid">
              {allResults.slice(0, 3).map((r) => (
                <div key={r.id} className="rec-card card">
                  <img src={r.img} alt={r.title} />
                  <div className="rec-body">
                    <strong>{r.title}</strong>
                    <div className="rec-meta">{currency(Math.round(r.price * 0.85))} — cozy & well-reviewed</div>
                    <div style={{ marginTop: 8 }}>
                      <button className="btn-details" onClick={() => openModal(r, "view")}>View</button>
                      <button className="btn-primary" onClick={() => handleBook(r)} style={{ marginLeft: 8 }}>Book</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <AnimatePresence>
        {showTop && (
          <motion.button
            className="scroll-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ⬆ Top
          </motion.button>
        )}
      </AnimatePresence>

      {/* Compact modal */}
      <AnimatePresence>
        {modalOpen && modalItem && (
          <motion.div
            className="bt-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bt-modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal} aria-label="close">
                <X />
              </button>

              <div className="modal-thumb">
                <img src={modalItem.img} alt={modalItem.title} />
              </div>

              <div className="modal-body">
                <h4 className="modal-title">{modalItem.title}</h4>
                <p className="modal-sub">{modalItem.excerpt}</p>

                <div className="modal-info">
                  <div><strong>Price:</strong> {currency(modalItem.price)} <span>/ night</span></div>
                  <div><strong>Rating:</strong> ⭐ {modalItem.rating}</div>
                </div>

                <div className="modal-actions">
                  <button className="btn-link" onClick={closeModal}>Close</button>
                  <button
                    className="btn-primary"
                    onClick={() => { closeModal(); handleBook(modalItem); }}
                  >
                    Book
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
