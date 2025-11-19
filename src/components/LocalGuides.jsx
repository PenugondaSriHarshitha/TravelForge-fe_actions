// src/components/LocalGuides.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LocalGuides.css";
const API_BASE = "http://localhost:8084/api/guides";

/**
 * Full LocalGuides component
 * - Unique seeded placeholder images per-card (picsum)
 * - Reduced default dataset (12)
 * - Full: submit/pending/approve/reject, delete+undo, toasts
 * - Navigation slide-over with embed map + open-in-app/web links
 */

// small curated base set (used to expand/clones)
const baseSamples = [
  {
    id: "g1",
    title: "Hidden Night Markets",
    location: "Old Town",
    tags: ["food", "nightlife", "local"],
    thumbnail: "/src/images/hidden1.png",
    hero: "/src/images/hidden1.png",
    excerpt: "Tiny stalls, neon lights and local snacks—best after 8pm.",
    author: "Anika",
    duration: "2–3 hrs",
    rating: 4.8,
    favorite: false,
    directions: "Start at Main Square → head east two blocks → look for red lanterns.",
    coords: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: "g2",
    title: "Secret Waterfall Grove",
    location: "Green Valley",
    tags: ["trek", "nature", "waterfall"],
    thumbnail: "/src/images/hidden2.png",
    hero: "/src/images/hidden2.png",
    excerpt: "A short trek through bamboo forest to a clear pool and waterfall.",
    author: "Ravi",
    duration: "1.5 hrs",
    rating: 4.9,
    favorite: false,
    directions: "Take route 7 → parking at trailhead → 20 min hike.",
    coords: { lat: 12.9616, lng: 77.5846 },
  },
  {
    id: "g3",
    title: "Riverside Coffee Nooks",
    location: "Harbour",
    tags: ["coffee", "relax", "views"],
    thumbnail: "/src/images/hidden3.png",
    hero: "/src/images/hidden3.png",
    excerpt: "Best espresso & sunrise views — quiet in mornings.",
    author: "Maya",
    duration: "30 mins",
    rating: 4.7,
    favorite: false,
    directions: "Walk along the pier; fourth shop with blue awning.",
    coords: { lat: 12.9661, lng: 77.602 },
  },
  {
    id: "g4",
    title: "Rooftop Bar Crawl",
    location: "Skyline District",
    tags: ["nightlife", "views", "drinks"],
    thumbnail: "/src/images/hidden4.png",
    hero: "/src/images/hidden4.png",
    excerpt: "Hop between 3 rooftops for cocktails and sunset views.",
    author: "Leo",
    duration: "3 hrs",
    rating: 4.6,
    favorite: false,
    directions: "Begin at Central Tower → rooftop elevator → follow guide map.",
    coords: { lat: 12.9758, lng: 77.6055 },
  },
  {
    id: "g5",
    title: "Street Food Safari",
    location: "Market Lane",
    tags: ["food", "local", "spicy"],
    thumbnail: "/src/images/hidden5.png",
    hero: "/src/images/hidden5.png",
    excerpt: "Taste 8+ authentic street foods with a local chef.",
    author: "Sofia",
    duration: "2 hrs",
    rating: 5.0,
    favorite: false,
    directions: "Meet at Market Lane gate at 6pm sharp.",
    coords: { lat: 12.9684, lng: 77.5967 },
  },
  {
    id: "g6",
    title: "Art Walk & Hidden Galleries",
    location: "Downtown",
    tags: ["art", "culture", "local"],
    thumbnail: "/src/images/hidden6.png",
    hero: "/src/images/hidden6.png",
    excerpt: "Discover murals, indie galleries, and live art shows.",
    author: "Arjun",
    duration: "2.5 hrs",
    rating: 4.8,
    favorite: false,
    directions: "Start at Metro Exit 4 → follow map provided.",
    coords: { lat: 12.9632, lng: 77.589 },
  },
];

// smaller default to avoid massive grids
const DEFAULT_EXPAND_TO = 12;

// helpers
function uid(prefix = "g") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
function buildPlaceholderImage(seed, w = 640, h = 360) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function expandSamples(base, count = DEFAULT_EXPAND_TO) {
  if (!base || base.length === 0) return [];
  const out = [];
  let i = 0;
  while (out.length < count) {
    const src = base[i % base.length];
    const idx = out.length + 1;
    const seed = `${src.id}-${idx}-${Date.now().toString(36).slice(-4)}`;
    out.push({
      ...src,
      id: `${src.id}_x${idx}`,
      title: `${src.title}${idx > base.length ? ` — #${idx}` : ""}`,
      location: `${src.location}${idx > base.length ? ` ${Math.ceil(idx / base.length)}` : ""}`,
      thumbnail: buildPlaceholderImage(seed, 640, 360),
      hero: buildPlaceholderImage(seed + "-hero", 1200, 720),
      coords: src.coords
        ? { lat: +(src.coords.lat + ((Math.random() - 0.5) * 0.02)).toFixed(6), lng: +(src.coords.lng + ((Math.random() - 0.5) * 0.02)).toFixed(6) }
        : undefined,
    });
    i++;
  }
  return out;
}

// simple toasts
function Toasts({ toasts, removeToast }) {
  return (
    <div className="toast-viewport" aria-live="polite" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className={`toast ${t.variant || "info"}`} style={{ marginBottom: 8 }}>
            <div className="toast-content">{t.content}</div>
            {t.actions && (
              <div className="toast-actions">
                {t.actions.map((a, i) => (
                  <button key={i} onClick={() => { a.onClick(); removeToast(t.id); }} className="toast-btn">{a.label}</button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

export default function LocalGuides() {
  const EXPAND_TO = DEFAULT_EXPAND_TO;

  // initial load from storage or generate
  const [guides, setGuides] = useState(() => {
    try {
      const raw = localStorage.getItem("localGuides_v2_guides");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return expandSamples(baseSamples, EXPAND_TO);
  });

  const [pending, setPending] = useState(() => {
    try {
      const raw = localStorage.getItem("localGuides_v2_pending");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [toasts, setToasts] = useState([]);
  function addToast({ content, duration = 4000, variant = "info", actions = null }) {
    const id = uid("t");
    setToasts(s => [...s, { id, content, duration, variant, actions }]);
    if (duration > 0) setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), duration);
    return id;
  }
  function removeToast(id) { setToasts(s => s.filter(t => t.id !== id)); }

useEffect(() => {
  async function fetchData() {
    try {
      // Load published guides
      const res = await fetch(`${API_BASE}?status=published`);
      const data = await res.json();
      setGuides(data);
      addToast({ content: "✅ Loaded from backend" });
    } catch (err) {
      console.error("Failed to fetch guides:", err);
      addToast({ content: "⚠️ Backend not reachable", variant: "warn" });
    }

    try {
      // Load pending guides
      const resP = await fetch(`${API_BASE}?status=pending`);
      const dataP = await resP.json();
      setPending(dataP);
    } catch (err) {
      console.error("Failed to fetch pending guides:", err);
    }
  }

  fetchData();
}, []);

  //useEffect(() => { try { localStorage.setItem("localGuides_v2_pending", JSON.stringify(pending)); } catch {} }, [pending]);

  // UI state
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [selected, setSelected] = useState(null);
  const [showOnlyFav, setShowOnlyFav] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    id: null, title: "", location: "", tags: "", excerpt: "", author: "", duration: "", rating: "", thumbnail: "", hero: "", directions: "", coordsLat: "", coordsLng: "",
  });
  const [submitErrors, setSubmitErrors] = useState({});
  const [pendingOpen, setPendingOpen] = useState(false);
  const [deletedBuffer, setDeletedBuffer] = useState([]);

  // tags
  const allTags = useMemo(() => {
    const s = new Set();
    guides.forEach(g => (g.tags || []).forEach(t => s.add(t)));
    pending.forEach(g => (g.tags || []).forEach(t => s.add(t)));
    return ["all", ...Array.from(s)];
  }, [guides, pending]);

  // filtered + sorted
  const filtered = useMemo(() => {
    let arr = guides.slice();
    const q = query.trim().toLowerCase();
    if (q) arr = arr.filter(g => (g.title || "").toLowerCase().includes(q) || (g.excerpt || "").toLowerCase().includes(q) || (g.location || "").toLowerCase().includes(q) || (g.tags || []).join(" ").toLowerCase().includes(q));
    if (tagFilter !== "all") arr = arr.filter(g => (g.tags || []).includes(tagFilter));
    if (showOnlyFav) arr = arr.filter(g => g.favorite);
    if (sortBy === "popular") arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === "newest") arr.sort((a, b) => b.id.localeCompare(a.id));
    return arr;
  }, [guides, query, tagFilter, sortBy, showOnlyFav]);

  // actions
  function toggleFav(id) { setGuides(s => s.map(g => g.id === id ? { ...g, favorite: !g.favorite } : g)); }
  function openGuide(g) { setSelected(g); }
  function closeModal() { setSelected(null); }
  function handleNavigateInPage(g) { setNavTarget(g); setSelected(g); }

  async function handleShare(g) {
    const url = `${location.origin}${location.pathname}#guide-${g.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: g.title, text: g.excerpt, url }); return; } catch {}
    }
    const ok = await copyToClipboard(url);
    addToast({ content: ok ? "Link copied to clipboard" : `Copy failed — ${url}` });
  }

  // delete with undo
  function deleteGuide(id) {
    const guide = guides.find(g => g.id === id);
    if (!guide) return;
    setGuides(s => s.filter(g => g.id !== id));
    const timeoutId = setTimeout(() => {
      setDeletedBuffer(buf => buf.filter(b => b.guide.id !== id));
    }, 7000);
    setDeletedBuffer(buf => [...buf, { guide, timeoutId }]);
    addToast({
      content: `${guide.title} deleted`,
      duration: 7000,
      variant: "warn",
      actions: [
        { label: "Undo", onClick: () => {
            setGuides(s => [guide, ...s]);
            setDeletedBuffer(buf => { buf.forEach(b => { if (b.guide.id === id) clearTimeout(b.timeoutId); }); return buf.filter(b => b.guide.id !== id); });
            addToast({ content: "Restored", duration: 2000 });
          } }
      ]
    });
  }

  // map link builders
  function buildEmbedUrl(g, zoom = 16) {
    const q = g.coords ? `${g.coords.lat},${g.coords.lng}` : encodeURIComponent(g.location || g.title || "");
    return `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
  }
  function buildWebDirectionsUrl(g) {
    if (g.coords) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(g.coords.lat + "," + g.coords.lng)}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(g.location || g.title)}`;
  }
  function buildGoogleMapsAppLink(g) {
    if (g.coords) return `comgooglemaps://?daddr=${g.coords.lat},${g.coords.lng}&directionsmode=driving`;
    return `comgooglemaps://?q=${encodeURIComponent(g.location || g.title)}`;
  }
  function buildAppleMapsLink(g) {
    if (g.coords) return `https://maps.apple.com/?daddr=${g.coords.lat},${g.coords.lng}&dirflg=d`;
    return `https://maps.apple.com/?q=${encodeURIComponent(g.location || g.title)}`;
  }
  function openInNewTab(url) { window.open(url, "_blank", "noopener"); }

  // submit/pending
  function openSubmit(prefill = null) {
    if (prefill) {
      setSubmitForm({
        id: prefill.id || null,
        title: prefill.title || "",
        location: prefill.location || "",
        tags: (prefill.tags || []).join(", "),
        excerpt: prefill.excerpt || "",
        author: prefill.author || "",
        duration: prefill.duration || "",
        rating: prefill.rating ? String(prefill.rating) : "",
        thumbnail: prefill.thumbnail || "",
        hero: prefill.hero || "",
        directions: prefill.directions || "",
        coordsLat: prefill.coords?.lat ?? "",
        coordsLng: prefill.coords?.lng ?? "",
      });
    } else {
      setSubmitForm({ id: null, title: "", location: "", tags: "", excerpt: "", author: "", duration: "", rating: "", thumbnail: "", hero: "", directions: "", coordsLat: "", coordsLng: "" });
    }
    setSubmitErrors({});
    setSubmitOpen(true);
  }
  function closeSubmit() { setSubmitOpen(false); }

  function validateSubmit(form) {
    const err = {};
    if (!form.title || !form.title.trim()) err.title = "Title required";
    if (!form.location || !form.location.trim()) err.location = "Location required";
    if (form.rating) { const r = Number(form.rating); if (Number.isNaN(r) || r < 0 || r > 5) err.rating = "Rating 0–5"; }
    if (form.coordsLat && isNaN(Number(form.coordsLat))) err.coordsLat = "Numeric latitude";
    if (form.coordsLng && isNaN(Number(form.coordsLng))) err.coordsLng = "Numeric longitude";
    return err;
  }

   async function submitToPending(e) {
  e?.preventDefault?.();
  const errors = validateSubmit(submitForm);
  if (Object.keys(errors).length) {
    setSubmitErrors(errors);
    return;
  }

  const newId = submitForm.id || uid();
  const tagsArr = submitForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const coords =
    submitForm.coordsLat || submitForm.coordsLng
      ? {
          lat: Number(submitForm.coordsLat) || null,
          lng: Number(submitForm.coordsLng) || null,
        }
      : null;

  const guide = {
    id: newId,
    title: submitForm.title.trim(),
    location: submitForm.location.trim(),
    tags: tagsArr,
    thumbnail: submitForm.thumbnail || "/src/images/default.png",
    hero: submitForm.hero || "/src/images/default.png",
    excerpt: submitForm.excerpt || "",
    author: submitForm.author || "Local Guide",
    duration: submitForm.duration || "",
    rating: submitForm.rating ? Number(submitForm.rating) : 0,
    favorite: false,
    directions: submitForm.directions || "",
    coordsLat: coords?.lat || null,
    coordsLng: coords?.lng || null,
    status: "pending",
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guide),
    });
    if (!res.ok) throw new Error("Failed to submit");
    const saved = await res.json();
    setPending((p) => [saved, ...p]);
    addToast({ content: "✅ Submitted to backend" });
    setSubmitOpen(false);
  } catch (err) {
    console.error("Submit error:", err);
    addToast({ content: "❌ Backend not reachable", variant: "warn" });
  }
}

  async function approvePending(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}/approve`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to approve");
    const updated = await res.json();
    setGuides((g) => [updated, ...g]);
    setPending((p) => p.filter((x) => x.id !== id));
    addToast({ content: "✅ Approved and saved" });
  } catch (err) {
    console.error("Approve failed:", err);
    addToast({ content: "❌ Approval failed", variant: "warn" });
  }
}

  async function rejectPending(id) {
  try {
    await fetch(`${API_BASE}/${id}/reject`, { method: "POST" });
    setPending((p) => p.filter((x) => x.id !== id));
    addToast({ content: "❌ Rejected (updated backend)", variant: "warn" });
  } catch (err) {
    console.error("Reject failed:", err);
    addToast({ content: "❌ Reject failed", variant: "warn" });
  }
}


  // force regenerate fresh unique images (clears storage)
  function clearAndRegenerate() {
    localStorage.removeItem("localGuides_v2_guides");
    localStorage.removeItem("localGuides_v2_pending");
    const regenerated = expandSamples(baseSamples, EXPAND_TO);
    setGuides(regenerated);
    setPending([]);
    addToast({ content: `Regenerated ${regenerated.length} sample guides (unique images)` });
  }

  return (
    <main className="local-guides-root" role="main">
      <Toasts toasts={toasts} removeToast={removeToast} />

      <div className="lg-container">
        <header className="lg-header" aria-labelledby="lg-heading">
          <div>
            <h1 id="lg-heading" className="lg-title">✨ Local Guides — Insider tips</h1>
            <p className="lg-sub">Smart tools, templates, filters, and printable reports — everything to impress.</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="lg-button" onClick={() => openSubmit(null)}>Submit Guide</button>
            <button className="lg-button" onClick={() => setPendingOpen(true)}>Pending ({pending.length})</button>
            <button className="lg-button" onClick={() => setShowOnlyFav(s => !s)}>{showOnlyFav ? "Show all" : "Show favorites"}</button>
          </div>
        </header>

        {/* Debug / reset */}
        <div style={{ margin: "12px 0", padding: 12, background: "#022423", borderRadius: 8, color: "#9fe8d6", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>guides: {guides.length} • pending: {pending.length}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="lg-button" onClick={clearAndRegenerate}>Clear storage & regenerate</button>
            <button className="lg-button" onClick={() => { console.log("GUIDES:", guides); console.log("PENDING:", pending); addToast({ content: "Logged arrays to console" }); }}>Log arrays</button>
          </div>
        </div>

        <div className="lg-controls">
          <input className="lg-search" placeholder="Search hidden gems, tags or city..." value={query} onChange={e => setQuery(e.target.value)} aria-label="Search guides" />
          <select className="lg-select" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort guides">
            <option value="popular">Sort: Popular</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        <div className="tags-row" aria-hidden>
          {allTags.map(t => (
            <div key={t} role="button" tabIndex={0} onClick={() => setTagFilter(t)} onKeyDown={(e) => e.key === "Enter" && setTagFilter(t)} className="tag-pill" style={{ opacity: t === tagFilter ? 1 : 0.7 }}>
              {t === "all" ? "All" : t}
            </div>
          ))}
        </div>

        <section className="grid-cards" role="list" aria-label="Local guides list">
          {filtered.map(g => (
            <motion.article key={g.id} layout className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6 }} role="listitem" aria-labelledby={`guide-${g.id}-title`}>
              <div style={{ position: "relative" }}>
                <img alt={g.title} className="card-media" src={g.thumbnail || buildPlaceholderImage(g.id)} loading="lazy" />
                <div className="quick-peek">
                  <button aria-label={`Open ${g.title}`} onClick={() => openGuide(g)} style={{ background: "transparent", border: "none", color: "#d7fff0", cursor: "pointer" }}>🔎</button>
                </div>
              </div>

              <div className="card-body">
                <div className="card-title" id={`guide-${g.id}-title`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "#9eb6b0" }}>{g.location}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#bff9ea" }}>{g.rating?.toFixed?.(1) ?? "—"}</div>
                    <button className="btn-fav" aria-pressed={g.favorite} onClick={() => toggleFav(g.id)}>{g.favorite ? "♥" : "♡"}</button>
                  </div>
                </div>

                <p className="card-excerpt">{g.excerpt}</p>

                <div className="card-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{(g.tags || []).slice(0, 3).map(t => <span key={t} className="tag-mini">{t}</span>)}</div>
                  <div style={{ color: "#9eb6b0", fontSize: 12 }}>{g.duration}</div>
                </div>

                <div className="card-actions">
                  <button className="btn-open" onClick={() => openGuide(g)}>Open</button>
                  <button className="btn-fav" onClick={() => handleShare(g)}>Share</button>
                  <button className="btn-ghost" onClick={() => handleNavigateInPage(g)}>Navigate</button>
                  <button className="btn-ghost" onClick={() => deleteGuide(g.id)}>Delete</button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* DETAILS MODAL */}
        <AnimatePresence>
          {selected && (
            <motion.div className="lg-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="lg-modal" initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div className="modal-media">{selected.video ? <video src={selected.video} controls style={{ borderRadius: 10, width: "100%" }} /> : <img alt={selected.title} src={selected.hero || selected.thumbnail || buildPlaceholderImage(selected.id)} style={{ borderRadius: 10, width: "100%" }} />}</div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                      <div className="emoji-badge">📍</div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{selected.title}</div>
                        <div style={{ color: "#9eb6b0", fontSize: 13 }}>{selected.location} • {selected.duration} • by {selected.author}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, color: "#cdeee2" }}>{selected.excerpt}</div>

                    <div style={{ marginTop: 12 }}>
                      <strong style={{ display: "block", marginBottom: 8 }}>Directions</strong>
                      <div style={{ color: "#9eb6b0", lineHeight: 1.5 }}>{selected.directions || "No directions available."}</div>
                    </div>
                  </div>

                  <aside style={{ width: 300 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>Quick info</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="lg-button" onClick={() => handleShare(selected)}>Share</button>
                        <button className="lg-button" onClick={() => { copyToClipboard(selected.title).then(ok => addToast({ content: ok ? "Title copied" : "Copy failed" })); }}>Copy</button>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div className="muted">Tags</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {(selected.tags || []).map(t => <div key={t} className="tag-pill small">{t}</div>)}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div className="muted">Rating</div>
                      <div style={{ fontWeight: 800, marginTop: 6 }}>{selected.rating ?? "—"}</div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <button className="btn-open" onClick={() => handleNavigateInPage(selected)}>Navigate</button>
                      <button style={{ marginLeft: 8 }} className="btn-ghost" onClick={() => openSubmit(selected)}>Edit / Duplicate</button>
                      <button style={{ marginLeft: 8 }} className="btn-ghost" onClick={() => closeModal()}>Close</button>
                    </div>
                  </aside>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAV SLIDE-OVER */}
        <AnimatePresence>
          {navTarget && (
            <>
              <motion.div className="nav-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} onClick={() => setNavTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#000" }} />

              <motion.aside className="nav-slideover" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ position: "fixed", right: 0, top: 0, height: "100vh", width: 420, maxWidth: "100%", background: "#061217", zIndex: 90, padding: 18, boxShadow: "-20px 0 30px rgba(0,0,0,0.6)", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{navTarget.title}</div>
                    <div style={{ color: "#9eb6b0", fontSize: 13 }}>{navTarget.location || "Unknown location"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="lg-button" onClick={() => { const payload = navTarget.coords ? `${navTarget.coords.lat},${navTarget.coords.lng}` : `${navTarget.location} — ${location.origin}${location.pathname}#guide-${navTarget.id}`; copyToClipboard(payload).then(ok => addToast({ content: ok ? "Copied location" : payload })); }}>Copy</button>
                    <button className="lg-button" onClick={() => setNavTarget(null)}>Close</button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <small style={{ color: "#9eb6b0" }}>Open in:</small>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn-open" onClick={() => { const gm = buildGoogleMapsAppLink(navTarget); window.location.href = gm; setTimeout(() => openInNewTab(buildWebDirectionsUrl(navTarget)), 600); }}>Google Maps App</button>
                    <button className="btn-open" onClick={() => openInNewTab(buildAppleMapsLink(navTarget))}>Apple Maps / Web</button>
                    <button className="btn-ghost" onClick={() => openInNewTab(buildWebDirectionsUrl(navTarget))}>Get directions (web)</button>
                  </div>
                </div>

                <div style={{ marginTop: 14, height: 360, borderRadius: 8, overflow: "hidden", background: "#111" }}>
                  <iframe title={`map-${navTarget.id}`} src={buildEmbedUrl(navTarget, 17)} style={{ width: "100%", height: "100%", border: 0 }} allowFullScreen loading="lazy" />
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ color: "#9eb6b0", fontSize: 13, marginBottom: 6 }}>Quick directions</div>
                  <div style={{ color: "#cdeee2", lineHeight: 1.5 }}>{navTarget.directions || "No step-by-step directions available — use the map to navigate."}</div>
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button className="btn-open" onClick={() => { const web = buildWebDirectionsUrl(navTarget); copyToClipboard(web).then(ok => addToast({ content: ok ? "Directions URL copied and opening..." : "Opening directions..." })); openInNewTab(web); }}>Open & Copy Directions URL</button>

                  <button className="btn-ghost" onClick={() => { const web = buildWebDirectionsUrl(navTarget); if (navigator.share) { navigator.share({ title: navTarget.title, text: navTarget.excerpt, url: web }).catch(()=>{}); } else { copyToClipboard(web).then(ok => addToast({ content: ok ? "Directions link copied!" : web })); } }}>Share</button>
                </div>

                <div style={{ marginTop: 24, color: "#7fae9f", fontSize: 13 }}>
                  Tip: for most accurate navigation add <code style={{ color: "#cdeee2", padding: "2px 6px", borderRadius: 6, background: "#03221c" }}>coords</code> to each guide (lat/lng).
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* PENDING SLIDE-OVER */}
        <AnimatePresence>
          {pendingOpen && (
            <>
              <motion.div className="nav-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} onClick={() => setPendingOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#000" }} />

              <motion.aside className="nav-slideover" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ position: "fixed", right: 0, top: 0, height: "100vh", width: 520, maxWidth: "100%", background: "#061217", zIndex: 90, padding: 18, boxShadow: "-20px 0 30px rgba(0,0,0,0.6)", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Pending Guides</div>
                    <div style={{ color: "#9eb6b0", fontSize: 13 }}>{pending.length} awaiting approval</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="lg-button" onClick={() => { copyToClipboard(JSON.stringify(pending)).then(ok => addToast({ content: ok ? "Pending JSON copied" : "Copy failed" })); }}>Copy JSON</button>
                    <button className="lg-button" onClick={() => setPendingOpen(false)}>Close</button>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  {pending.length === 0 && <div style={{ color: "#cdeee2" }}>No pending guides — nice!</div>}
                  {pending.map(pg => (
                    <div key={pg.id} style={{ background: "#03221c", padding: 12, borderRadius: 8, display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={pg.thumbnail} alt={pg.title} style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 6 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{pg.title}</div>
                        <div style={{ color: "#9eb6b0", fontSize: 13 }}>{pg.location} • {pg.author}</div>
                        <div style={{ marginTop: 6, color: "#cdeee2" }}>{pg.excerpt}</div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                          <button className="btn-open" onClick={() => approvePending(pg.id)}>Approve</button>
                          <button className="btn-ghost" onClick={() => rejectPending(pg.id)}>Reject</button>
                          <button className="btn-ghost" onClick={() => openSubmit(pg)}>Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* SUBMIT SLIDE-OVER */}
        <AnimatePresence>
          {submitOpen && (
            <>
              <motion.div className="nav-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} onClick={closeSubmit} style={{ position: "fixed", inset: 0, zIndex: 80, background: "#000" }} />

              <motion.aside className="nav-slideover" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ position: "fixed", right: 0, top: 0, height: "100vh", width: 520, maxWidth: "100%", background: "#061217", zIndex: 90, padding: 18, boxShadow: "-20px 0 30px rgba(0,0,0,0.6)", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{submitForm.id ? "Edit Guide" : "Submit a Guide"}</div>
                    <div style={{ color: "#9eb6b0", fontSize: 13 }}>Submissions go into Pending for review</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="lg-button" onClick={() => { copyToClipboard(JSON.stringify(submitForm)).then(ok => addToast({ content: ok ? "Form JSON copied" : "Copy failed" })); }}>Copy JSON</button>
                    <button className="lg-button" onClick={closeSubmit}>Close</button>
                  </div>
                </div>

                <form onSubmit={submitToPending} style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <label><div className="muted">Title *</div><input className="lg-input" value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} />{submitErrors.title && <div className="field-error">{submitErrors.title}</div>}</label>
                  <label><div className="muted">Location *</div><input className="lg-input" value={submitForm.location} onChange={e => setSubmitForm(f => ({ ...f, location: e.target.value }))} />{submitErrors.location && <div className="field-error">{submitErrors.location}</div>}</label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ flex: 1 }}><div className="muted">Tags (comma separated)</div><input className="lg-input" value={submitForm.tags} onChange={e => setSubmitForm(f => ({ ...f, tags: e.target.value }))} /></label>
                    <label style={{ width: 140 }}><div className="muted">Rating (0–5)</div><input className="lg-input" type="number" min="0" max="5" step="0.1" value={submitForm.rating} onChange={e => setSubmitForm(f => ({ ...f, rating: e.target.value }))} />{submitErrors.rating && <div className="field-error">{submitErrors.rating}</div>}</label>
                  </div>

                  <label><div className="muted">Excerpt</div><textarea rows={3} className="lg-input" value={submitForm.excerpt} onChange={e => setSubmitForm(f => ({ ...f, excerpt: e.target.value }))} /></label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ flex: 1 }}><div className="muted">Author</div><input className="lg-input" value={submitForm.author} onChange={e => setSubmitForm(f => ({ ...f, author: e.target.value }))} /></label>
                    <label style={{ width: 160 }}><div className="muted">Duration</div><input className="lg-input" value={submitForm.duration} onChange={e => setSubmitForm(f => ({ ...f, duration: e.target.value }))} /></label>
                  </div>

                  <label><div className="muted">Directions (short)</div><input className="lg-input" value={submitForm.directions} onChange={e => setSubmitForm(f => ({ ...f, directions: e.target.value }))} /></label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ flex: 1 }}><div className="muted">Thumbnail URL</div><input className="lg-input" value={submitForm.thumbnail} onChange={e => setSubmitForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="/src/images/..." /></label>
                    <label style={{ flex: 1 }}><div className="muted">Hero URL</div><input className="lg-input" value={submitForm.hero} onChange={e => setSubmitForm(f => ({ ...f, hero: e.target.value }))} placeholder="/src/images/..." /></label>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ flex: 1 }}><div className="muted">Coords latitude</div><input className="lg-input" value={submitForm.coordsLat} onChange={e => setSubmitForm(f => ({ ...f, coordsLat: e.target.value }))} />{submitErrors.coordsLat && <div className="field-error">{submitErrors.coordsLat}</div>}</label>
                    <label style={{ flex: 1 }}><div className="muted">Coords longitude</div><input className="lg-input" value={submitForm.coordsLng} onChange={e => setSubmitForm(f => ({ ...f, coordsLng: e.target.value }))} />{submitErrors.coordsLng && <div className="field-error">{submitErrors.coordsLng}</div>}</label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                    <button type="button" className="btn-ghost" onClick={closeSubmit}>Cancel</button>
                    <button type="submit" className="btn-open">Submit to pending</button>
                  </div>
                </form>

                <div style={{ marginTop: 18, color: "#7fae9f", fontSize: 13 }}>Tip: adding exact <code style={{ color: "#cdeee2", padding: "2px 6px", borderRadius: 6, background: "#03221c" }}>coords</code> makes the map exact — required for best results.</div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
