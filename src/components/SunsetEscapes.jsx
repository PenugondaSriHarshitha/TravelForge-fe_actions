// src/components/SunsetEscapes.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./SunsetEscapes.css";

// local sunset images (PNG)
import sun1 from "../images/sun1.png";
import sun2 from "../images/sun2.png";
import sun3 from "../images/sun3.png";
import sun4 from "../images/sun4.png";
import sun5 from "../images/sun5.png";
import sun6 from "../images/sun6.png";
import sun7 from "../images/sun7.png";
import sun8 from "../images/sun8.png";

const GALLERY = [
  { id: "s1", src: sun1, alt: "Golden ocean sunset", caption: "Golden sun melting into the ocean horizon." },
  { id: "s2", src: sun2, alt: "Sunset café", caption: "Conversations linger while the sun sets." },
  { id: "s3", src: sun3, alt: "Sunset mountain", caption: "Amber skies over quiet peaks." },
  { id: "s4", src: sun4, alt: "Palm trees at sunset", caption: "Tropical silhouettes meet painted skies." },
  { id: "s5", src: sun5, alt: "Pier at sunset", caption: "Wooden pier kissed by twilight colors." },
  { id: "s6", src: sun6, alt: "Sunset reflections", caption: "Sky painted twice — once in water." },
  { id: "s7", src: sun7, alt: "Desert sunset", caption: "Dramatic hues across the desert horizon." },
  { id: "s8", src: sun8, alt: "Lakeside sunset", caption: "Tranquil waters glowing under evening skies." },
];

const RELATED = [
  { id: "r1", title: "Amazing Adventure", author: "Subbu", img: "https://picsum.photos/id/1015/400/240" },
  { id: "r2", title: "City & Sea", author: "Harshi", img: "https://picsum.photos/id/1019/400/240" },
  { id: "r3", title: "Hidden Hiking Trails", author: "Asha", img: "https://picsum.photos/id/1022/400/240" },
];

export default function SunsetEscapes() {
  const navigate = useNavigate();
// comment state
const [comments, setComments] = useState(() => {
  // load from localStorage if available
  const saved = localStorage.getItem("sunsetComments");
  return saved ? JSON.parse(saved) : [];
});
const [newComment, setNewComment] = useState("");

// utility to save in localStorage
useEffect(() => {
  localStorage.setItem("sunsetComments", JSON.stringify(comments));
}, [comments]);

// helper to get readable time
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return `${Math.floor(diff / 1440)} day ago`;
}

// post new comment
const handlePostComment = () => {
  if (!newComment.trim()) return;
  const newEntry = {
    id: Date.now(),
    text: newComment.trim(),
    likes: 0,
    time: Date.now(),
  };
  setComments((prev) => [newEntry, ...prev]);
  setNewComment("");
};

// like / delete
const handleLike = (id) =>
  setComments((prev) =>
    prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
  );
const handleDelete = (id) =>
  setComments((prev) => prev.filter((c) => c.id !== id));

  // reading progress
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // update progress bar on scroll
  useEffect(() => {
    function handleScroll() {
      const el = contentRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop + 60;
      const pct = Math.max(0, Math.min(1, scrolled / (total || 1)));
      setProgress(Math.round(pct * 100));
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % GALLERY.length);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length);

  // keyboard controls for lightbox (Esc, ←, →)
  useEffect(() => {
    function onKey(e) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // share helpers
  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Sunset Escapes — a dreamy weekend by Bhavya. ✨");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };
  const shareEmail = () => {
    const subject = encodeURIComponent("Read: Sunset Escapes");
    const body = encodeURIComponent(`Loved this trip by Bhavya — check it out: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="se-root" ref={contentRef}>
      {/* progress bar */}
      <div className="read-progress" aria-hidden>
        <div className="read-progress-inner" style={{ width: `${progress}%` }} />
      </div>

      {/* Top-left Back button */}
      <div className="page-back" style={{ position: "fixed", left: 18, top: 18, zIndex: 80 }}>
        <button className="btn-light" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
      </div>

      {/* Hero */}
      <header className="se-hero">
        <div className="se-hero-inner">
          <div className="se-badges">
            <span className="tag">Feature</span>
            <span className="tag small">Weekend</span>
          </div>

          <motion.h1
            className="se-title"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Sunset Escapes
          </motion.h1>

          <p className="se-sub">Sunsets and cobbled streets — a dreamy weekend.</p>

          <div className="se-meta">
            <div className="avatar-md">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80&auto=format&fit=crop"
                alt="Bhavya avatar"
                loading="lazy"
              />
            </div>
            <div className="meta-text">
              <div className="meta-name">Bhavya</div>
              <div className="meta-sub">May 27 • 3 min read</div>
            </div>

            <div className="meta-actions">
              <button className="btn-ghost" onClick={shareTwitter} aria-label="Share on Twitter">Tweet</button>
              <button className="btn-ghost" onClick={shareEmail} aria-label="Share via Email">Email</button>
            </div>
          </div>
        </div>
        <div className="hero-photo" role="img" aria-label="Sunset cityscape" />
      </header>

      <main className="se-main container">
        {/* Intro */}
        <section className="card intro">
          <h2 className="section-title">The little weekend that felt like forever</h2>
          <p className="lead">
            I escaped for two days with a small bag and a long list of ideas — but the city taught me to be patient and enjoy less.
            Cobblestones, warm lights, and strangers who smiled at the right moments.
          </p>
          <div className="kicker">Tags: <span className="pill">sunset</span> <span className="pill">city</span> <span className="pill">weekend</span></div>
        </section>

        {/* Highlights */}
        <section className="card highlights">
          <h3 className="card-title">Highlights</h3>
          <ul className="highlist">
            <li>Lantern festival on the 2nd evening</li>
            <li>Hidden cafes with lemon tea</li>
            <li>A rooftop that played old vinyl</li>
          </ul>
        </section>

        {/* Gallery */}
        <section className="card gallery">
          <div className="gallery-head">
            <h3 className="card-title">Photo Album</h3>
            <div className="gallery-actions">
              <button className="btn-ghost small" onClick={() => openLightbox(0)}>Open Lightbox</button>
              <div className="muted">Click any photo to enlarge</div>
            </div>
          </div>

          <div className="gallery-grid">
            {GALLERY.map((g, i) => (
              <motion.figure
                key={g.id}
                className="gallery-item"
                onClick={() => openLightbox(i)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(i)}
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: "easeOut" }}
              >
                <img src={g.src} alt={g.alt} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* Long-form sections */}
        <section className="card longform">
          <h3 className="card-title">An Evening to Remember</h3>
          <p>
            By the time the lanterns rose, my feet were tired but my smile was wide.
            A vendor handed me something sweet. A musician on the corner played a tune I later found myself whistling.
          </p>

          <blockquote className="quote">“The best stories are the ones we didn't plan to tell.”</blockquote>

          <h4>Local Tips</h4>
          <ul>
            <li>Arrive early for the lantern festival — the light changes every 10 minutes.</li>
            <li>Try lemon tea at Café Maru (ask for the cinnamon twist).</li>
          </ul>
        </section>

        {/* Related stories */}
        <section className="card related">
          <h3 className="card-title">Related reads</h3>
          <div className="related-grid">
            {RELATED.map((r) => (
              <article key={r.id} className="related-card" role="link" tabIndex={0}>
                <img src={r.img} alt={r.title} loading="lazy" />
                <div className="related-meta">
                  <strong>{r.title}</strong>
                  <span className="muted">By {r.author}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card cta">
          <div>
            <strong>Planning your own sunset escape?</strong>
            <p className="muted">Grab a printable checklist and a packing guide tailored for short trips.</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/checklist")}>
              Get the checklist
            </button>

            {/* secondary back button in CTA */}
            <button className="btn-light" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </section>
        {/* Comment Input Section */}
<section className="card comments">
  <h3 className="card-title">💬 Share your sunset thoughts</h3>

  <div className="comment-form">
    <input
      type="text"
      placeholder="Type your comment..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
    />
    <button className="btn-primary" onClick={handlePostComment}>
      Post ✨
    </button>
  </div>

  {/* Display Comments */}
  <div className="comment-list">
    {comments.length === 0 ? (
      <p className="muted">No comments yet — be the first 🌅</p>
    ) : (
      comments.map((c) => (
        <motion.div
          key={c.id}
          className="comment-item"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="comment-header">
            <strong>Traveler</strong>
            <span className="time">{timeAgo(c.time)}</span>
          </div>
          <p className="comment-text">{c.text}</p>
          <div className="comment-actions">
            <button className="like-btn" onClick={() => handleLike(c.id)}>
              ❤️ {c.likes}
            </button>
            <button className="delete-btn" onClick={() => handleDelete(c.id)}>
              🗑️
            </button>
          </div>
        </motion.div>
      ))
    )}
  </div>
</section>

      </main>

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox} aria-label="Close lightbox">✕</button>

          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lb-nav left" onClick={prevLightbox} aria-label="Previous">‹</button>

            <div className="lb-frame">
              <img src={GALLERY[lightboxIndex].src} alt={GALLERY[lightboxIndex].alt} />
              <div className="lb-caption">{GALLERY[lightboxIndex].caption}</div>
            </div>

            <button className="lb-nav right" onClick={nextLightbox} aria-label="Next">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
