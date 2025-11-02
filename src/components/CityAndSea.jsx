import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./CityAndSea.css";

/* Unique images: different Unsplash images so tiles aren't identical */
const GALLERY = [
  { id: "c1", type: "image", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop", alt: "Sunrise over the sea", caption: "A small harbor that warmed me at dusk." },
  { id: "c2", type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=1200&q=80&auto=format&fit=crop", alt: "Harbor timelapse", caption: "Harbor time-lapse — the city lights wake up." },
  { id: "c3", type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", poster: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&auto=format&fit=crop", alt: "Waves at sunset", caption: "Waves and the last rays of sun — moving light." },
  { id: "c4", type: "image", src: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=1200&q=80&auto=format&fit=crop", alt: "Cobbled cafe street", caption: "Cobblestones and lemon tea corners." },
  { id: "c5", type: "image", src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80&auto=format&fit=crop", alt: "Lanterns at night", caption: "Lantern release — wishes floating into the night." },
  { id: "c6", type: "video", src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", poster: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80&auto=format&fit=crop", alt: "Short harbor clip", caption: "A short harbor clip — sound on for ambient waves." },
  { id: "c7", type: "image", src: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=1200&q=80&auto=format&fit=crop", alt: "Street musician", caption: "Music that became a nightly friend." },
  { id: "c8", type: "image", src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&q=80&auto=format&fit=crop", alt: "Boardwalk at twilight", caption: "Late walks along the boardwalk." },
];

const RELATED = [
  { id: "r1", title: "Sunset Escapes", author: "Bhavya", img: "https://picsum.photos/id/1015/400/240" },
  { id: "r2", title: "Amazing Adventure", author: "Subbu", img: "https://picsum.photos/id/1016/400/240" },
  { id: "r3", title: "Harbor Nights", author: "Asha", img: "https://picsum.photos/id/1019/400/240" },
];

export default function CityAndSea() {
  const navigate = useNavigate();
  const ref = useRef(null);

  // reading progress
  const [progress, setProgress] = useState(0);
const [postText, setPostText] = useState("");
const [posts, setPosts] = useState([]);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
// --- Comments / Posts Section ---
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");

// Utility: Time ago formatter
const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Add comment
const handlePostComment = () => {
  if (!newComment.trim()) return;
  const newCmt = {
    id: Date.now(),
    text: newComment.trim(),
    time: Date.now(),
    likes: 0,
  };
  setComments([newCmt, ...comments]);
  setNewComment("");
};

// Like comment
const handleLike = (id) => {
  setComments((prev) =>
    prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
  );
};

// Delete comment
const handleDelete = (id) => {
  setComments((prev) => prev.filter((c) => c.id !== id));
};

  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop + 80;
      const pct = Math.max(0, Math.min(1, scrolled / (total || 1)));
      setProgress(Math.round(pct * 100));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // lightbox handlers
  const openLightbox = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };
  const next = () => setLightboxIndex((i) => (i + 1) % GALLERY.length);
  const prev = () => setLightboxIndex((i) => (i - 1 + GALLERY.length) % GALLERY.length);

  // share
  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("City & Sea — hidden cafes by the harbor. ☕🌊");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };
  const shareEmail = () => {
    const subject = encodeURIComponent("Read: City & Sea");
    const body = encodeURIComponent(`Check out this Harshi story: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="cs-root" ref={ref}>
      <div className="read-progress" aria-hidden>
        <div className="read-progress-inner" style={{ width: `${progress}%` }} />
      </div>

      {/* centered container */}
      <div className="cs-page-center">
        <div className="page-back">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <header className="cs-hero">
          <div className="cs-hero-inner">
            <motion.h1 initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="cs-title">
              City &amp; Sea
            </motion.h1>
            <p className="cs-sub">How I found hidden cafes by the harbor.</p>

            <div className="cs-meta">
              <div className="avatar">
                {/* Girl avatar photo */}
                <img
                  src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=60&auto=format&fit=crop"
                  alt="Harshi avatar"
                />
              </div>
              <div className="meta-text">
                <div className="meta-name">Harshi</div>
                <div className="meta-sub">June 1 • 6 min read</div>
              </div>

              <div className="meta-actions">
                <button className="btn-ghost" onClick={shareTwitter}>Tweet</button>
                <button className="btn-ghost" onClick={shareEmail}>Email</button>
              </div>
            </div>
          </div>
        </header>

        <main className="cs-main">
          <section className="card cs-intro">
            <h2 className="card-title">The Harbor That Felt Like Home</h2>
            <p className="lead">
              The first time I wandered that seaside neighborhood, I found more than cafes — I found a rhythm.
              Lantern-lit alleys, fishermen calling out, and unexpected kindness in tiny ceramic cups.
            </p>
          </section>

          {/* New: Longform evening + quote + tips + highlight */}
          <section className="card longform">
            <h3 className="card-title">An Evening to Remember</h3>
            <p>
              By the time the lanterns rose, my feet were tired but my smile was wide.
              A vendor handed me something sweet — still warm from the pan. A musician on the corner
              strummed a tune I found myself humming all the way back.
            </p>

            <blockquote className="quote">“The best stories are the ones we didn't plan to tell.”</blockquote>

            <h4 className="tips-heading">Local Tips</h4>
            <ul className="tips-list">
              <li>Arrive early for the lantern festival — the light shifts every 10 minutes.</li>
              <li>Try lemon tea at Café Maru (ask for the cinnamon twist).</li>
              <li>Street musicians gather near the harbor around 8 PM—bring coins and smile.</li>
              <li>Best photo spot: climb the old stone steps by the pier for the golden arc.</li>
            </ul>
          </section>

          <section className="card highlight-moment">
            <h3 className="card-title">A Serendipitous Encounter</h3>
            <p>
              Just when I thought the day was done, a local artist invited me into their tiny studio.
              The smell of paint, the hum of the sea outside, and the warmth of shared tea made me realize
              travel is less about places — and more about moments.
            </p>
          </section>

          <section className="card cs-gallery">
            <div className="gallery-head">
              <h3 className="card-title">Photos & Clips</h3>
              <div className="gallery-cta">
                <button className="btn-ghost small" onClick={() => openLightbox(0)}>Open Lightbox</button>
                <button className="btn-primary small" onClick={() => navigate("/checklist", { state: { from: "city-and-sea" } })}>
                  Go to Checklist
                </button>
              </div>
            </div>

            <div className="gallery-grid cs-masonry">
              {GALLERY.map((g, i) => (
                <figure key={g.id} className="cs-item" tabIndex={0} onClick={() => openLightbox(i)} onKeyDown={(e) => e.key === "Enter" && openLightbox(i)}>
                  {g.type === "image" ? (
                    <img
                      src={g.src}
                      alt={g.alt}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/fallback-image.png";
                      }}
                    />
                  ) : (
                    <div className="cs-video-thumb" role="img" aria-label={g.alt}>
                      <img
                        className="cs-video-poster"
                        src={g.poster || g.src}
                        alt={g.alt}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/fallback-video-poster.png";
                        }}
                      />
                      <div className="video-play">▶</div>
                    </div>
                  )}
                  <figcaption>{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="card cs-related">
            <h3 className="card-title">Related reads</h3>
            <div className="related-grid">
              {RELATED.map((r) => (
                <article key={r.id} className="related-card">
                  <img src={r.img} alt={r.title} />
                  <h4>{r.title}</h4>
                  <div className="muted">By {r.author}</div>
                </article>
              ))}
            </div>
          </section>
          {/* --- New Post Section --- */}
{/* ✨ Post & Comments Section */}
<section className="card comments">
  <h3 className="card-title">💬 Share your City & Sea thoughts</h3>

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
          initial={{ opacity: 0, y: 8 }}
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
      </div>

      {lightboxOpen && (
        <div className="cs-lightbox" onClick={() => closeLightbox()}>
          <button className="lb-close" onClick={(e) => { e.stopPropagation(); closeLightbox(); }}>✕</button>
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lb-nav left" onClick={prev}>‹</button>
            <div className="lb-frame">
              {GALLERY[lightboxIndex].type === "image" ? (
                <img src={GALLERY[lightboxIndex].src} alt={GALLERY[lightboxIndex].alt} />
              ) : (
                <video controls autoPlay src={GALLERY[lightboxIndex].src} poster={GALLERY[lightboxIndex].poster} />
              )}
              <div className="lb-caption">{GALLERY[lightboxIndex].caption}</div>
            </div>
            <button className="lb-nav right" onClick={next}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
