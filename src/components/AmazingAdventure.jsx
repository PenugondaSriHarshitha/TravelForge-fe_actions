// src/pages/AmazingAdventure.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./AmazingAdventure.css";

/* React-Leaflet */
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* import marker images for correct icon paths (works with CRA/Vite) */
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* configure leaflet default icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* --- sample eateries data with images + coords --- */
const EATERIES = [
  {
    id: 1,
    name: "Seaside Kebab Shack",
    desc: "Best grilled fish tacos — pocket-friendly and delicious.",
    img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=900&q=80&auto=format&fit=crop",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 2,
    name: "Night Market Sweets",
    desc: "Sticky coconut buns with a chai.",
    img: "https://images.unsplash.com/photo-1516685018646-549198525c1b?w=900&q=80&auto=format&fit=crop",
    lat: 12.9722,
    lng: 77.5939,
  },
  {
    id: 3,
    name: "Temple Café",
    desc: "Simple vegetable stews served on banana leaves.",
    img: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=900&q=80&auto=format&fit=crop",
    lat: 12.97,
    lng: 77.59,
  },
];

/* FlyTo helper to animate map movement */
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

export default function AmazingAdventure() {
  const navigate = useNavigate();

  const [activeFly, setActiveFly] = useState(null); // [lat, lng]
  const [activeId, setActiveId] = useState(null); // hovered eatery id
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  const center = [EATERIES[0].lat, EATERIES[0].lng];
const [comments, setComments] = useState([
  { id: 1, name: "Asha", text: "Loved this — the lantern night sounds magical!", time: new Date(), likes: 3 },
  { id: 2, name: "Ravi", text: "Can you share the exact name of that food stall?", time: new Date(), likes: 1 },
]);
const [newComment, setNewComment] = useState("");

  // open google maps directions
  const openGoogleMaps = ({ lat, lng, name }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&destination_place_id=${encodeURIComponent(
      name
    )}`;
    window.open(url, "_blank");
  };

  // when activeId changes, center map and open popup if possible
  useEffect(() => {
    if (!activeId) return;
    const e = EATERIES.find((x) => x.id === activeId);
    if (!e) return;
    setActiveFly([e.lat, e.lng]);

    const markerInstance = markerRefs.current[activeId];
    if (markerInstance && markerInstance.openPopup) {
      try {
        markerInstance.openPopup();
      } catch (err) {
        /* ignore if not available */
      }
    }
  }, [activeId]);

  // share helpers
  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Amazing Adventure — Subbu’s magical coastal journey 🌊✨");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };
  const shareEmail = () => {
    const subject = encodeURIComponent("Read: Amazing Adventure");
    const body = encodeURIComponent(`Check out Subbu’s travel story: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  // Format time as "x min ago"
const timeAgo = (date) => {
  const diff = Math.floor((new Date() - new Date(date)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Handle posting
const handlePostComment = () => {
  if (!newComment.trim()) return;

  const newEntry = {
    id: Date.now(),
    name: "Guest",
    text: newComment,
    time: new Date(),
    likes: 0,
  };

  setComments((prev) => [newEntry, ...prev]); // add on top
  setNewComment("");
};

// Like toggle
const handleLike = (id) => {
  setComments((prev) =>
    prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
  );
};

// Delete comment
const handleDelete = (id) => {
  setComments((prev) => prev.filter((c) => c.id !== id));
};


  return (
    <div className="aa-root">
      {/* Top-left Back button (always visible) */}
      <div className="page-back">
        <button className="btn-light back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
      </div>

      {/* HERO */}
      <header className="aa-hero">
        <div className="aa-hero-inner">
          <div className="aa-hero-badge">📘</div>

          <motion.h1 className="aa-title" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            Amazing Adventure
          </motion.h1>

          <p className="aa-sub">A traveler shares their magical journey across blue coasts.</p>

          <div className="aa-meta">
            <div className="avatar">
              <img src="https://picsum.photos/seed/subbu/96/96" alt="Subbu avatar" />
            </div>
            <div className="meta-text">
              <div className="meta-name">By Subbu</div>
              <div className="meta-sub">Dec 3 • 7 min read</div>
            </div>

            <div className="meta-actions">
              <button className="btn-ghost" onClick={shareTwitter} aria-label="Share on Twitter">Tweet</button>
              <button className="btn-ghost" onClick={shareEmail} aria-label="Share via Email">Email</button>
            </div>
          </div>
        </div>

        {/* Hero banner image (background) */}
        <div
          className="hero-photo"
          role="img"
          aria-label="Cliffside coast"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80&auto=format&fit=crop')",
          }}
        />

        {/* decorative wave overlay */}
        <div className="aa-wave" aria-hidden />
      </header>

      <main className="aa-main container">
        {/* Intro */}
        <motion.section className="card aa-intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="card-title">The Beginning ✨</h2>
          <p className="lead">
            It all started on a cool December morning, when the skies were painted in shades of gold. I set out with nothing but a backpack,
            excitement, and a desire to explore the unknown. The coastal town welcomed me with its warm people, bustling streets, and the smell of freshly baked bread.
          </p>
        </motion.section>

        {/* Highlights */}
        <motion.section className="card aa-highlights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="card-title">Highlights of the Journey 🌅</h3>
          <ul className="highlist">
            <li>✨ Sky lantern festival lighting up the night</li>
            <li>🌊 Crystal-clear waters at hidden coves</li>
            <li>🏯 Ancient temples echoing old stories</li>
            <li>🍢 Street food alleys full of unexpected flavors</li>
            <li>🎶 Music every night in the old town square</li>
          </ul>
        </motion.section>

        {/* Photo Memories */}
        <motion.section className="card aa-gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="card-title">Photo Memories 📸</h3>
          <div className="gallery-grid cute-grid">
            <figure className="g-item">
              <img src="https://picsum.photos/id/1015/800/600" alt="Cliffside view" />
              <figcaption>"The ocean stirs the heart, inspires the imagination."</figcaption>
            </figure>
            <figure className="g-item">
              <img src="https://picsum.photos/id/1016/800/600" alt="Desert rocks" />
              <figcaption>"Every sunset brings the promise of a new dawn."</figcaption>
            </figure>
            <figure className="g-item">
              <img src="https://picsum.photos/id/1018/800/600" alt="Green mountains" />
              <figcaption>"Take only memories, leave only footprints."</figcaption>
            </figure>
            <figure className="g-item">
              <img src="https://picsum.photos/id/1019/800/600" alt="Stormy sea" />
              <figcaption>"The sea lives in every one of us."</figcaption>
            </figure>
          </div>
          <div className="gallery-quote">🌸 “Travel is the only thing you buy that makes you richer.” 🌸</div>
        </motion.section>

        {/* Timeline */}
        <motion.section className="card aa-timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="card-title">Journey Timeline ⏳</h3>
          <ol className="timeline">
            <li>
              <strong>Day 1 — Arrival</strong>
              <p>First walk through the old pier and the night market.</p>
            </li>
            <li>
              <strong>Day 2 — Lantern Night</strong>
              <p>Joined the lantern release and met local musicians.</p>
            </li>
            <li>
              <strong>Day 4 — Hidden Cove</strong>
              <p>Took a long coastal hike to a secluded beach with blue waters.</p>
            </li>
            <li>
              <strong>Day 7 — Farewell Feast</strong>
              <p>Shared meals with new friends at a tiny seafront shack.</p>
            </li>
          </ol>
        </motion.section>

        {/* Local Eats + Map */}
        <motion.section className="card aa-eats with-map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="card-title">Local Eats 🍲</h3>
          <p className="muted eats-quote">“Good food is the soul of every journey 🍜✨”</p>

          <div className="eats-map-row">
            {/* Eats list */}
            <div className="eats-list">
              {EATERIES.map((e) => (
                <article
                  key={e.id}
                  className={`eat-card list ${activeId === e.id ? "active" : ""}`}
                  onMouseEnter={() => setActiveId(e.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <div className="eat-photo">
                    <img
                      src={e.img}
                      alt={e.name}
                      onError={(ev) => {
                        ev.currentTarget.onerror = null;
                        ev.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='140'%3E%3Crect width='100%25' height='100%25' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' fill='%23ccc' font-size='12' text-anchor='middle' dominant-baseline='central'%3Eimage%20not%20found%3C/text%3E%3C/svg%3E";
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>

                  <div className="eat-body">
                    <h4>{e.name}</h4>
                    <p className="muted">{e.desc}</p>

                    <div className="eat-actions">
                      <button className="btn-primary small" onClick={() => openGoogleMaps({ lat: e.lat, lng: e.lng, name: e.name })}>
                        Directions
                      </button>

                      <button className="btn-light small" onClick={() => setActiveFly([e.lat, e.lng])}>
                        Center
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Map */}
            <div className="map-wrap">
              <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "360px", width: "100%" }} whenCreated={(map) => (mapRef.current = map)}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {EATERIES.map((e) => (
                  <Marker
                    key={e.id}
                    position={[e.lat, e.lng]}
                    ref={(ref) => {
                      if (ref) markerRefs.current[e.id] = ref;
                    }}
                  >
                   <Popup>
  <div style={{ width: 220 }}>
    <strong style={{ display: "block", marginBottom: 6 }}>{e.name}</strong>
    <p style={{ margin: "6px 0 8px", fontSize: 13 }}>{e.desc}</p>

    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn-light small"
        onClick={() => openGoogleMaps({ lat: e.lat, lng: e.lng, name: e.name })}
        aria-label={`Get directions to ${e.name}`}
      >
        Directions
      </button>

      <a
        className="link-small"
        href={`https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`View ${e.name} on Google Maps`}
      >
        View
      </a>
    </div>
  </div>
</Popup>

                  </Marker>
                ))}

                {activeFly && <FlyTo position={activeFly} />}
              </MapContainer>

              <div className="map-note muted">Tip: Zoom in/out and click markers to see details.</div>
            </div>
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section className="card aa-tips" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <h3 className="card-title">Travel Tips 💡</h3>
          <ul className="tips-list">
            <li>Pack light layers for humid days & cool nights.</li>
            <li>Carry a small power bank; outlets can be scarce.</li>
            <li>Respect temple dress codes — shoulders & knees covered.</li>
            <li>Cash is loved in local markets (small notes).</li>
          </ul>
        </motion.section>

        {/* CTA to Checklist */}
        <motion.section className="card aa-cta" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
          <div>
            <strong>✨ Want to plan your own adventure?</strong>
            <p className="muted">Check off the essentials before you go.</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/checklist")}>
              Go to Checklist
            </button>
            <button className="btn-light" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </motion.section>

        {/* Related stories */}
        <motion.section className="card aa-related" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
          <h3 className="card-title">More stories you might like ✨</h3>
          <div className="related-grid">
            <article className="related-card">
              <img src="https://picsum.photos/id/1020/300/180" alt="" />
              <h4>Coastal Cafés</h4>
            </article>
            <article className="related-card">
              <img src="https://picsum.photos/id/1021/300/180" alt="" />
              <h4>Night Market Wonders</h4>
            </article>
            <article className="related-card">
              <img src="https://picsum.photos/id/1022/300/180" alt="" />
              <h4>Hidden Hiking Trails</h4>
            </article>
          </div>
        </motion.section>

        {/* Comments */}
        {/* Comment input section */}
<div className="comment-form-box">
  <h3 className="card-title">💬 Leave a Comment</h3>
  <div className="comment-form">
    <input
      type="text"
      placeholder="Add your thoughts..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
    />
    <button className="btn-post" onClick={handlePostComment}>
      Post ✨
    </button>
  </div>
</div>
{/* Comments display section */}
<div className="comments-list">
  <h3 className="card-title">Recent Comments 🗨️</h3>

  {comments.length === 0 ? (
    <p className="muted">No comments yet. Be the first to share your thoughts!</p>
  ) : (
    comments.map((c) => (
      <motion.div
        key={c.id}
        className="comment"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="comment-header">
          <strong>{c.name}</strong>
          <span className="time">{timeAgo(c.time)}</span>
        </div>

        <p className="comment-text">{c.text}</p>

        <div className="comment-actions">
          <button onClick={() => handleLike(c.id)} className="like-btn">
            ❤️ {c.likes}
          </button>
          <button onClick={() => handleDelete(c.id)} className="delete-btn">
            🗑️
          </button>
        </div>
      </motion.div>
    ))
  )}
</div>


      </main>
    </div>
  );
}
