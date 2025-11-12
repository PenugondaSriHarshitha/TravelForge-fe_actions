import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "./ViewPackage.css";

// 🎨 Images (fallbacks)
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

/* ============================================================
   🎉 Confetti & Plane Launch Animations
   ============================================================ */
function smallConfettiBurst() {
  const root = document.body;
  const count = 28;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "vpc-confetti";
    el.style.left = `${50 + (Math.random() - 0.5) * 60}vw`;
    el.style.background = ["#ffb86b", "#ffd166", "#ff7ab6", "#ffcf8b", "#ffd9a6"][
      Math.floor(Math.random() * 5)
    ];
    root.appendChild(el);
    setTimeout(() => el.classList.add("vpc-confetti-fall"), 30);
    setTimeout(() => root.removeChild(el), 4800 + Math.random() * 1200);
  }
}

function launchPlane() {
  const el = document.createElement("div");
  el.className = "vpc-plane";
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("vpc-plane-launch"), 30);
  setTimeout(() => document.body.removeChild(el), 2200);
}

/* ============================================================
   🎡 SPIN WHEEL
   ============================================================ */
function SpinWheel({ onResult }) {
  const segments = [
    "₹1000 Cashback",
    "Free Dinner Cruise",
    "25% Off",
    "Free Airport Transfer",
    "Free Spa Voucher",
    "Surprise Gift",
    "₹2000 Cashback",
    "Extra Night -50%",
  ];

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const segSize = 360 / segments.length;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const idx = Math.floor(Math.random() * segments.length);
    const fullSpins = 6 + Math.floor(Math.random() * 4);
    const landing = idx * segSize + segSize / 2;
    const final =
      fullSpins * 360 +
      (360 - landing) +
      (Math.random() * segSize - segSize / 2);
    setAngle((a) => a + final);

    setTimeout(() => {
      setSpinning(false);
      onResult(segments[idx]);
    }, 5200);
  };

  return (
    <div className="vp-wheel-wrapper">
      <div
        className={`vp-wheel ${spinning ? "vp-wheel-spinning" : ""}`}
        style={{ transform: `rotate(${angle}deg)` }}
        onClick={spin}
        role="button"
        tabIndex={0}
      >
        <div className="vp-wheel-face" />
      </div>
      <div className="vp-wheel-pointer">▼</div>
      <div className="vp-wheel-cta">
        <button className="btn-primary" onClick={spin} disabled={spinning}>
          {spinning ? "Spinning…" : "Spin & Reveal Deal"}
        </button>
        <div className="vp-wheel-hint">Tap the wheel or the button</div>
      </div>
    </div>
  );
}

/* ============================================================
   🌍 MAIN COMPONENT
   ============================================================ */
export default function ViewPackage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const itemFromState = location?.state?.item || {};
  const isEmptyState = !itemFromState?.title;

  // Local DB (fallback)
  const PACKAGES_DB = useMemo(
    () => [
      {
        id: "pkg1",
        title: "Greek Islands – Santorini",
        nights: 3,
        price: "₹32,000",
        rating: 4.8,
        img: Santorini,
        tags: ["romantic", "friends", "family"],
        highlights: ["Relax on beaches", "Scenic drives", "Local wines"],
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
        highlights: ["Temple walks", "Tea ceremony", "Ryokan stay"],
        offer: "Early Bird — Save ₹3000",
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
        highlights: ["Tram rides", "Cliff views", "Tapas tour"],
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
        highlights: ["Overwater villas", "Scuba diving", "Sunset dinners"],
        offer: "Limited Offer — Free Spa Voucher",
        weather: "28°C 🌴",
      },
      {
        id: "pkg6",
        title: "Bali Adventure Retreat",
        nights: 6,
        price: "₹49,000",
        rating: 4.9,
        img: Bali,
        tags: ["adventure", "friends", "romantic"],
        highlights: ["Surfing", "Waterfalls", "Sunset yoga"],
        offer: "Hot Deal — ₹5000 Cashback!",
        weather: "27°C 🌴",
      },
      {
        id: "pkg8",
        title: "Dubai Luxury Escape",
        nights: 4,
        price: "₹55,000",
        rating: 4.8,
        img: Dubai,
        tags: ["luxury", "friends", "shopping"],
        highlights: ["Desert safari", "Burj Khalifa", "Luxury malls"],
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
        highlights: ["Eiffel dinner", "Louvre walks", "Seine cruise"],
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
        highlights: ["SkyPark", "Universal Studios", "Night Safari"],
        offer: "Early Bird — Save ₹4000",
        weather: "29°C 🌦️",
      },
    ],
    []
  );

  // Safe package fallback
  const pkg = useMemo(() => {
    if (!isEmptyState) return itemFromState;
    const found = PACKAGES_DB.find((p) => String(p.id) === String(id));
    return found || PACKAGES_DB[0];
  }, [id, itemFromState, isEmptyState, PACKAGES_DB]);

  // Carousel
  const carouselImgs = useMemo(() => {
    const related = PACKAGES_DB.filter((p) => p.id !== pkg.id)
      .slice(0, 3)
      .map((p) => p.img);
    return [pkg.img, ...related];
  }, [pkg, PACKAGES_DB]);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % carouselImgs.length);
    }, 3200);
    return () => clearInterval(t);
  }, [carouselImgs.length]);

  // Offer Countdown
  const computeOfferMs = (offerText) => {
    const m = offerText?.match(/(\d+)\s*day/i);
    if (m && m[1]) return Number(m[1]) * 86400000;
    return 72 * 3600 * 1000;
  };
  const [remainingMs, setRemainingMs] = useState(() =>
    computeOfferMs(pkg.offer)
  );
  useEffect(() => {
    let deadline = Date.now() + computeOfferMs(pkg.offer);
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      setRemainingMs(diff);
      if (diff <= 0) clearInterval(iv);
    };
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [pkg.offer]);

  const formatRemaining = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(sec).padStart(2, "0")}`;
  };

  // Suggested Destinations
  const suggested = useMemo(() => {
    const pool = PACKAGES_DB.filter((p) => p.id !== pkg.id);
    const scored = pool
      .map((p) => ({
        ...p,
        score: (p.tags || []).filter((t) => pkg.tags?.includes(t)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    return scored;
  }, [pkg, PACKAGES_DB]);

  const [wheelBonus, setWheelBonus] = useState(null);

  function handleBook() {
    smallConfettiBurst();
    launchPlane();
    setTimeout(() => navigate(`/book/${pkg.id}`, { state: { item: pkg } }), 600);
  }

  /* ============================================================
     🧭 RENDER
     ============================================================ */
  if (!pkg || !pkg.title) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "white" }}>
        <h2>⚠️ Package details not found</h2>
        <p>Try going back to Packages.</p>
        <button
          className="btn-primary"
          onClick={() => navigate("/packages")}
          style={{ marginTop: "20px" }}
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="vpage-root" data-theme="golden">
      <div className="vpage-bg" />

      <motion.main
        className="vpage-content"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48 }}
      >
        {/* HERO SECTION */}
        <section className="v-hero card-glass">
          <div className="v-hero-left">
            <div className="carousel">
              <img
                src={carouselImgs[activeIdx]}
                alt={`${pkg.title} hero`}
                className="carousel-img"
              />
              <div className="carousel-thumbs">
                {carouselImgs.map((src, i) => (
                  <button
                    key={i}
                    className={`thumb ${activeIdx === i ? "active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="v-hero-right">
            <h1 className="v-title">{pkg.title}</h1>
            <div className="v-meta">
              <div>{pkg.nights} Nights</div>
              <div>From <strong>{pkg.price}</strong></div>
              <div>{pkg.weather}</div>
            </div>

            <div className="v-offer">
              <div className="offer-pill">🔥 {pkg.offer}</div>
              <div className="countdown">
                Offer ends in <span>{formatRemaining(remainingMs)}</span>
              </div>
            </div>

            <div className="v-cta-row">
              <button className="btn-primary v-cta-book" onClick={handleBook}>
                Book This Trip
              </button>
              <button
  className="btn-ghost"
  onClick={() => {
    if (window.history.length > 2) navigate(-1);
    else navigate("/results?tab=packages");
  }}
>
  Back
</button>

            </div>
          </div>
        </section>

        {/* HIGHLIGHTS */}
        <section className="v-highlights card-glass">
          <h3>Highlights ✨</h3>
          <ul>
            {pkg.highlights.map((h, i) => (
              <li key={i}>🌴 {h}</li>
            ))}
            <li>🍽️ Daily breakfast & dinner included</li>
            <li>🏨 Luxury stay with pool access</li>
          </ul>
          {wheelBonus && (
            <div className="v-reward-banner">
              🎁 <strong>Bonus Applied:</strong> {wheelBonus}
            </div>
          )}
        </section>

        {/* WHEEL + GALLERY */}
        <section className="v-lower-grid">
          <aside className="v-right-col">
            <div className="v-wheel card-glass">
              <h4>🎡 Spin for a Bonus</h4>
              <SpinWheel
                onResult={(res) => {
                  setWheelBonus(res);
                  const el = document.querySelector(".v-bonus-toast");
                  if (el) {
                    el.classList.remove("show");
                    void el.offsetWidth;
                    el.classList.add("show");
                  }
                }}
              />
              {wheelBonus && (
                <div className="v-wheel-result">
                  🎯 You got: <strong>{wheelBonus}</strong>
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* SUGGESTED DESTINATIONS */}
        <section className="v-suggested card-glass">
          <h3>Suggested Destinations ✈️</h3>
          <div className="v-suggested-strip">
            {suggested.map((s) => (
              <div key={s.id} className="suggest-card">
                <img src={s.img} alt={s.title} />
                <div className="suggest-body">
                  <div className="suggest-title">{s.title}</div>
                  <div className="suggest-meta">
                    {s.nights} nights • {s.price}
                  </div>
                  <div className="suggest-ctas">
                    <button
                      className="btn-ghost"
                      onClick={() =>
                        navigate(`/view/${s.id}`, { state: { item: s } })
                      }
                    >
                      View
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate(`/book/${s.id}`, { state: { item: s } })
                      }
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.main>

      {/* Bonus toast */}
      <div className="v-bonus-toast" role="status">
        🎉 You unlocked a bonus!
      </div>
    </div>
  );
}
