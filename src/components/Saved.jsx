// src/components/Saved.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ Backend API base URL
const API_BASE = "http://localhost:8084/api/saved";

export default function Saved() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch all saved items from backend
  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch saved items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error loading saved items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  // ✅ Remove one item from backend
  const removeItem = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // ✅ Clear all saved items
  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all saved items?")) return;
    try {
      await fetch(API_BASE, { method: "DELETE" });
      setItems([]);
    } catch (err) {
      console.error("Failed to clear all items:", err);
    }
  };

  // ✅ Navigation helpers
  const goExplore = (item) => navigate(`/explore/${item.id}`, { state: { item } });
  const goBook = (item) => navigate(`/book/${item.id}`, { state: { item } });

  // ✅ UI rendering
  return (
    <div className="results-wrap" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Saved items ({items.length})</h2>
        <div>
          <button className="btn-ghost" onClick={() => navigate("/")}>
            Back
          </button>
          <button
            className="btn-ghost"
            style={{ marginLeft: 8 }}
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 20 }}>
          <p>Loading saved items...</p>
        </div>
      ) : !items.length ? (
        <div style={{ marginTop: 20 }}>
          <p>You haven't saved anything yet. Tap ♥ on deals or stories to save them here.</p>
          <button
            className="btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/")}
          >
            Explore deals
          </button>
        </div>
      ) : (
        <div className="top-deals-grid" style={{ marginTop: 18 }}>
          {items.map((r) => (
            <motion.article
              key={r.id}
              className="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              {r.img ? (
                <img
                  src={r.img.startsWith("http") ? r.img : `.${r.img}`}
                  alt={r.city || r.title}
                  className="card-media"
                />
              ) : (
                <div
                  style={{
                    height: 160,
                    background: "linear-gradient(90deg,#e6f7f4,#fff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    color: "#0f766e",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  {r.city || r.title || "Destination"}
                </div>
              )}

              <div className="card-body">
                <h4 className="city-gradient">{r.city || r.title}</h4>
                <p className="price">
                  Starting from <strong>{r.price ?? "—"}</strong>
                </p>
                <div className="card-actions">
                  <button className="btn-primary" onClick={() => goExplore(r)}>
                    Explore
                  </button>
                  <button className="btn-ghost" onClick={() => goBook(r)}>
                    Book
                  </button>
                  <button className="btn-ghost" onClick={() => removeItem(r.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
