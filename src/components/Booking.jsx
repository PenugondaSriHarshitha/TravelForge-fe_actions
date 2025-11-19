// src/components/Booking.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { FiX, FiChevronLeft, FiCheck } from "react-icons/fi";
import { FaGooglePay, FaCcMastercard, FaCcVisa, FaApple } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";

// images - put your images in src/images/
import carImg from "../images/car.png";
import flightImg from "../images/flight.png";
import resortImg from "../images/resort.png";
import packageImg from "../images/package.png";
import stayImg from "../images/stay.png";
import defaultThumb from "../images/default-thumb.png";

const BACKEND_BASE = "http://localhost:8084"; // backend base URL

const DEFAULT_CARD_EXAMPLES = [
  { id: "card_1", brand: "Visa", last4: "4242", name: "Bhavya C", expiry: "12/26" },
  { id: "card_2", brand: "Master", last4: "8899", name: "TravelForge", expiry: "08/25" },
];

const currency = (v = 0) => `$${Number(v).toFixed(2)}`;

function useSavedCards() {
  const KEY = "tf_saved_payment_cards_v1";
  const [cards, setCards] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_CARD_EXAMPLES;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CARD_EXAMPLES;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cards));
    } catch {}
  }, [cards]);
  const addCard = (card) => setCards((s) => [{ ...card, id: `card_${Date.now()}` }, ...s]);
  const removeCard = (id) => setCards((s) => s.filter((c) => c.id !== id));
  return { cards, addCard, removeCard };
}

/* Confetti & emoji rain for celebration */
function Confetti({ active = false, hearts = false }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) return;
    const emojis = hearts ? ["❤️","💖","😍","💕","💘","💝"] : ["🎉","✨","🥳","🎊","🍾","💫"];
    const next = new Array(26).fill(0).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: 5 + Math.random() * 90,
      delay: Math.random() * 0.6,
      size: 16 + Math.random() * 22,
      rot: Math.round(Math.random() * 360),
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(t);
  }, [active, hearts]);

  return (
    <div className="tf-confetti" aria-hidden>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="tf-confetti-piece"
          initial={{ y: -20, opacity: 0, rotate: p.rot, scale: 0.6 }}
          animate={{ y: 160 + Math.random() * 240, opacity: [1, 1, 0], rotate: p.rot + 60 }}
          transition={{ duration: 1.4 + Math.random() * 0.8, delay: p.delay, ease: "easeOut" }}
          style={{ left: `${p.left}%`, fontSize: p.size }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------ Support Modal Component ------------------ */
function SupportModal({ open, onClose, context = {} }) {
  const [tab, setTab] = useState("contact"); // contact | phone | chat
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // chat-specific
  const [chatMessages, setChatMessages] = useState(() => [
    { role: "agent", text: "Hi there 👋 — how can I help with your booking?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTab("contact");
      setName("");
      setEmail("");
      setMessage("");
      setSending(false);
      setSent(false);
      setChatMessages([{ role: "agent", text: "Hi there 👋 — how can I help with your booking?" }]);
      setChatInput("");
      setChatLoading(false);
    }
  }, [open]);

  // POST contact message to backend (uses full backend URL)
  async function sendMessage() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please provide name, email and a short message.");
      return;
    }
    setSending(true);
    try {
      const payload = {
        name,
        email,
        message,
        context: `city=${context.city || ""} type=${context.type || ""}`
      };

      const res = await fetch(`${BACKEND_BASE}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to send support message");
      }

      setSent(true);
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Send support message error:", err);
      alert("Failed to send message. Please try again or call support.");
    } finally {
      setSending(false);
    }
  }

  // Chat — sends payload to /api/support-chat and appends reply
  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const newUserMsg = { role: "user", text };
    setChatMessages((s) => [...s, newUserMsg]);
    setChatInput("");
    setChatLoading(true);

    const payload = {
      messages: [
        { role: "system", content: "You are a friendly support assistant for Travel app." },
        ...chatMessages.map(m => ({ role: m.role === "agent" ? "assistant" : "user", content: m.text })),
        { role: "user", content: text },
        { role: "user", content: `Booking context: city=${context.city || "N/A"}, type=${context.type || "N/A"}` }
      ],
    };

    try {
      const res = await fetch(`${BACKEND_BASE}/api/support-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Chat server error");
      }

      const json = await res.json();
      let replyText = "";
      if (json.reply) {
        if (typeof json.reply === "string") replyText = json.reply;
        else if (json.reply.content) replyText = json.reply.content;
        else if (json.reply.message && json.reply.message.content) replyText = json.reply.message.content;
        else replyText = JSON.stringify(json.reply);
      } else if (json.error) {
        replyText = `Error: ${json.error}`;
      } else {
        replyText = "No reply from server.";
      }

      setChatMessages((s) => [...s, { role: "agent", text: replyText }]);
    } catch (err) {
      console.warn("support chat error:", err);
      setChatMessages((s) => [...s, { role: "agent", text: "Sorry — couldn't reach support server. Please try again later." }]);
    } finally {
      setChatLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="support-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <motion.div
        className="support-modal"
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="support-head">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 800 }}>Support</div>
            <div className="muted" style={{ fontSize: 13 }}>How can we help?</div>
          </div>
          <button className="tf-btn tf-ghost small" onClick={onClose} aria-label="Close support"><FiX /></button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div className="support-tabs">
            <button className={`support-tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Message</button>
            <button className={`support-tab ${tab === "phone" ? "active" : ""}`} onClick={() => setTab("phone")}>Call</button>
            {/* <button className={`support-tab ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>Live chat</button> */}
          </div>

          <div style={{ flex: 1 }}>
            {tab === "contact" && (
              <div>
                {!sent ? (
                  <>
                    <p className="muted" style={{ marginTop: 0 }}>Send us a quick message about your booking{context?.city ? ` — ${context.city}` : ""}.</p>
                    <div style={{ display: "grid", gap: 8 }}>
                      <input className="tf-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                      <input className="tf-input" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <textarea className="tf-input" placeholder="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="tf-btn tf-ghost" onClick={onClose}>Cancel</button>
                        <button className="tf-btn tf-primary" onClick={sendMessage} disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Message sent</div>
                    <div className="muted" style={{ marginTop: 8 }}>Our team will reply to <strong>{email}</strong> shortly. We’ll include booking reference if applicable.</div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                      <button className="tf-btn tf-primary" onClick={onClose}>OK</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "phone" && (
              <div>
                <p className="muted">Call our support team for urgent help. Lines open 6am–10pm local time.</p>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 800 }}>India (Toll) — +91 80 1234 5678</div>
                  <div className="muted" style={{ marginTop: 8 }}>Or tap to call on mobile</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <a className="tf-btn tf-primary" href="tel:+918012345678">Call +91 80 1234 5678</a>
                    <button className="tf-btn tf-ghost" onClick={() => { navigator.clipboard?.writeText("+918012345678"); alert("Phone number copied to clipboard"); }}>Copy</button>
                  </div>
                </div>
              </div>
            )}

            {tab === "chat" && (
              <div>
                <p className="muted">Start a short live chat. This will send your message to the support server.</p>

                <div className="chat-area" style={{ marginTop: 8 }}>
                  <div className="chat-messages" style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`chat-msg ${m.role === "agent" ? "agent" : "user"}`} style={{ alignSelf: m.role === "agent" ? "flex-start" : "flex-end" }}>
                        <div className="chat-bubble">{m.text}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="chat-msg agent"><div className="chat-bubble">Typing…</div></div>
                    )}
                  </div>

                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <input
                      className="tf-input"
                      placeholder="Type a quick message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                    />
                    <button className="tf-btn tf-primary" onClick={sendChatMessage} disabled={chatLoading}>
                      {chatLoading ? "Sending…" : "Send"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 8 }} className="muted">Tip: include your booking city or reference for faster help.</div>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
/* ------------------ end SupportModal ------------------ */

export default function Booking({
  open, onClose, item: propItem = {}, type: propType = "stay", onConfirmed
}) {
  const { cards, addCard, removeCard } = useSavedCards();
  const location = useLocation();
  const navigate = useNavigate();

  const routed = !!(location && location.state);
  const routedItem = (location && location.state && location.state.item) ? location.state.item : null;
  const routedType = (location && location.state && location.state.type) ? location.state.type : null;
const wheelReward = location?.state?.reward || null;

  const item = propItem && Object.keys(propItem).length ? propItem : (routedItem || {});
  const type = propType || routedType || "stay";
  const isRouteView = typeof open === "undefined";

  const [step, setStep] = useState(0);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(2);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);

  const [paymentMode, setPaymentMode] = useState("card");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [newCard, setNewCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [walletProvider, setWalletProvider] = useState("Google Pay");

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [celebrateHearts, setCelebrateHearts] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [seatClass, setSeatClass] = useState("Economy");
  const [roomType, setRoomType] = useState("Standard");
  const [carType, setCarType] = useState("Compact");

  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (!open && !isRouteView) {
      setStep(0);
      setProcessing(false);
      setSuccess(false);
      setCouponApplied(null);
      setPaymentMode("card");
      setSelectedCardId(null);
      setNewCard({ number: "", name: "", expiry: "", cvv: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const perUnit = useMemo(() => {
    if (item?.price) return Number(String(item.price).replace(/[^0-9\.]/g, "")) || 399;
    return type === "flight" ? 199 : type === "resort" ? 279 : type === "car" ? 69 : 399;
  }, [item, type]);

  const extrasCost = useMemo(() => {
    let extras = 0;
    if (type === "flight") extras += seatClass === "Business" ? 120 : seatClass === "Premium" ? 50 : 0;
    if (type === "resort") extras += roomType === "Suite" ? 160 : roomType === "Deluxe" ? 70 : 0;
    if (type === "car") extras += carType === "SUV" ? 40 : carType === "Intermediate" ? 18 : 0;
    return extras;
  }, [type, seatClass, roomType, carType]);

  const subtotal = useMemo(() => {
    if (type === "flight" || type === "car") return perUnit + extrasCost;
    return (perUnit + extrasCost) * Math.max(1, nights || 1);
  }, [type, perUnit, extrasCost, nights]);

  const discount = useMemo(() => {
  let d = 0;
  if (couponApplied === "SAVE10") d += subtotal * 0.1;
  if (couponApplied === "TF25") d += subtotal * 0.25;

  // Apply reward-based offers
  if (wheelReward) {
    if (wheelReward.includes("₹1000")) d += 1000;
    if (wheelReward.includes("₹2000")) d += 2000;
    if (wheelReward.includes("25% Off")) d += subtotal * 0.25;
    if (wheelReward.includes("Extra Night")) d += perUnit * 0.5;
  }
  return d;
}, [couponApplied, wheelReward, subtotal, perUnit]);


  const taxes = useMemo(() => (subtotal - discount) * 0.12, [subtotal, discount]);
  const total = useMemo(() => Math.max(0, subtotal - discount + taxes), [subtotal, discount, taxes]);

  function handleApplyCoupon() {
    const code = (coupon || "").trim().toUpperCase();
    if (!code) return;
    if (code === "SAVE10" || code === "TF25") {
      setCouponApplied(code);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1700);
    } else {
      setCouponApplied("invalid");
      setTimeout(() => setCouponApplied(null), 1400);
    }
  }

  function nextStep() { setStep(s => Math.min(s + 1, 3)); }
  function prevStep() { setStep(s => Math.max(s - 1, 0)); }

  function handleSaveNewCard() {
    if (!newCard.number || !newCard.name || !newCard.expiry) {
      alert("Please enter card number, name & expiry to save (demo).");
      return;
    }
    addCard({
      brand: newCard.number.startsWith("4") ? "Visa" : newCard.number.startsWith("5") ? "Master" : "Card",
      last4: String(newCard.number).slice(-4),
      name: newCard.name,
      expiry: newCard.expiry,
    });
    setNewCard({ number: "", name: "", expiry: "", cvv: "" });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1400);
  }

  // When payment is "successful" (demo) — call backend to save booking
  async function doPaymentSimulation() {
    if (paymentMode === "card" && !selectedCardId && !newCard.number) {
      alert("Select a saved card or add a new card to pay.");
      return;
    }

    setProcessing(true);

    // simulate network/bank verification
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);
      setCelebrateHearts(true);
      setShowToast(true);

      // helper to convert date input (YYYY-MM-DD) to ISO LocalDateTime
      const toIsoDateTime = (d) => {
        if (!d) return null;
        return d.includes("T") ? d : `${d}T12:00:00`;
      };

      // booking payload with camelCase keys to match Java fields
      const bookingPayload = {
        type,
        city: item?.city || item?.title || "Unknown",
        checkin: toIsoDateTime(checkin),
        checkout: toIsoDateTime(checkout),
        nights: Math.max(1, nights),
        guests,
        perUnit: perUnit,
        extrasCost: extrasCost,
        subtotal,
        discount,
        taxes,
        total,
        status: "confirmed",
        userId: item?.user_id ?? null,
        itemId: item?.id ?? null,
      };

      // POST to backend bookings endpoint (use full backend URL)
      try {
        const res = await fetch(`${BACKEND_BASE}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        });

        if (!res.ok) {
          const text = await res.text();
          console.warn("Booking save error:", res.status, text);
          alert("⚠️ Booking could not be saved. Check backend logs or console.");
        } else {
          const saved = await res.json();
          console.log("Booking saved:", saved);
          alert(`✅ Booking confirmed! Reference ID: ${saved.bookingId ?? "N/A"}`);
        }
      } catch (err) {
        console.warn("Failed to save booking to backend:", err);
        alert("❌ Could not connect to backend. Make sure Spring Boot is running on port 8084.");
      }

      // keep modal open — show confirmation overlay and hearts confetti
      setTimeout(() => setShowToast(false), 2100);
      setTimeout(() => setCelebrateHearts(false), 2600);

      onConfirmed?.({ item, type, amount: total });

    }, 1400);
  }

  function handleClose() {
    if (isRouteView) navigate(-1);
    else onClose?.();
  }

  const typeImages = {
    car: carImg,
    flight: flightImg,
    resort: resortImg,
    package: packageImg,
    stay: stayImg,
  };

  const imageSrc = item?.img || typeImages[type] || defaultThumb;

  if (!isRouteView && !open) return null;

  const containerClass = isRouteView ? "tf-modal-backdrop route-view" : "tf-modal-backdrop";

  return (
    <div className={containerClass} role="dialog" aria-modal="true" aria-label="Booking modal">
      <AnimatePresence>
        <motion.div
          className="tf-modal"
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.995 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
        >
          <header className="tf-modal-head">
            <div className="tf-head-left">
              <button onClick={prevStep} className="tf-btn tf-ghost" aria-hidden={step === 0} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
                <FiChevronLeft /> Back
              </button>
              <div className="tf-title-wrap" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={imageSrc} alt={type} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />
                <div>
                  <div className="tf-title" style={{ fontSize: 18 }}>
                    {item?.city ?? "Details"}
                  </div>
                  <div className="tf-sub">{type === "flight" ? "Flight booking" : type === "car" ? "Car rental" : type === "resort" ? "Resort booking" : "Your stay"} • {step === 0 ? "Details" : step === 1 ? "Extras" : step === 2 ? "Payment" : "Confirmation"}</div>
                </div>
              </div>
            </div>
            <div className="tf-head-right">
              <div style={{ textAlign: "right", marginRight: 6 }}>
                <div className="tf-subtle-label">Subtotal</div>
                <div style={{ fontWeight: 800 }}>{currency(subtotal)}</div>
              </div>
              <button onClick={handleClose} className="tf-btn tf-ghost" aria-label="Close"><FiX size={18} /></button>
            </div>
          </header>

          <div className="tf-modal-body">
            <main className="tf-left">
              <div className="tf-card tf-card-main">
                {step === 0 && (
                  <>
                    <div className="tf-section-header">
                      <h3>Traveler details</h3>
                      <div className="tf-chip">Flexible dates</div>
                    </div>

                    {type === "flight" && (
                      <>
                        <div className="tf-row">
                          <label className="tf-label">From</label>
                          <input className="tf-input" placeholder="City or airport (e.g. HYD)" />
                        </div>
                        <div className="tf-row">
                          <label className="tf-label">To</label>
                          <input className="tf-input" placeholder="Destination (e.g. BLR)" />
                        </div>
                        <div className="tf-grid-2">
                          <div>
                            <label className="tf-label">Depart</label>
                            <input className="tf-input" type="date" value={checkin} onChange={(e)=>setCheckin(e.target.value)} />
                          </div>
                          <div>
                            <label className="tf-label">Class</label>
                            <select className="tf-select" value={seatClass} onChange={(e)=>setSeatClass(e.target.value)}>
                              <option>Economy</option>
                              <option>Premium</option>
                              <option>Business</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {(type === "stay" || type === "resort") && (
                      <>
                        <div className="tf-grid-2">
                          <div>
                            <label className="tf-label">Check-in</label>
                            <input className="tf-input" type="date" value={checkin} onChange={(e)=>setCheckin(e.target.value)} />
                          </div>
                          <div>
                            <label className="tf-label">Check-out</label>
                            <input className="tf-input" type="date" value={checkout} onChange={(e)=>setCheckout(e.target.value)} />
                          </div>
                        </div>

                        <div className="tf-grid-2" style={{ marginTop: 12 }}>
                          <div>
                            <label className="tf-label">Nights</label>
                            <input className="tf-input" type="number" min="1" value={nights} onChange={(e)=>setNights(Math.max(1, Number(e.target.value||1)))} />
                          </div>
                          <div>
                            <label className="tf-label">Guests</label>
                            <input className="tf-input" type="number" min="1" value={guests} onChange={(e)=>setGuests(Math.max(1, Number(e.target.value||1)))} />
                          </div>
                        </div>
                      </>
                    )}

                    {type === "car" && (
                      <>
                        <div className="tf-row">
                          <label className="tf-label">Pick-up location</label>
                          <input className="tf-input" placeholder="Pick-up address or station" />
                        </div>
                        <div className="tf-grid-2">
                          <div>
                            <label className="tf-label">From</label>
                            <input className="tf-input" type="date" value={checkin} onChange={(e)=>setCheckin(e.target.value)} />
                          </div>
                          <div>
                            <label className="tf-label">To</label>
                            <input className="tf-input" type="date" value={checkout} onChange={(e)=>setCheckout(e.target.value)} />
                          </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <label className="tf-label">Car class</label>
                          <select className="tf-select" value={carType} onChange={(e)=>setCarType(e.target.value)}>
                            <option>Compact</option>
                            <option>Intermediate</option>
                            <option>SUV</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="coupon-row" style={{ marginTop: 12 }}>
                      <input className="tf-input" placeholder="Add coupon (SAVE10 / TF25)" value={coupon} onChange={(e)=>setCoupon(e.target.value)} />
                      <button className="tf-btn tf-apply" onClick={handleApplyCoupon}>Apply</button>
                    </div>

                    {couponApplied === "invalid" && <div className="tf-note tf-note-error">Invalid coupon</div>}
                    {couponApplied && couponApplied !== "invalid" && <div className="tf-note tf-note-good">Coupon <strong>{couponApplied}</strong> applied ✓</div>}

                    <div className="tf-actions">
                      <button className="tf-btn tf-primary" onClick={nextStep}>Continue</button>
                      <button className="tf-btn tf-ghost" onClick={handleClose}>Cancel</button>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="tf-section-header">
                      <h3>Add extras</h3>
                      <div className="tf-chip">Add-ons</div>
                    </div>

                    {type === "flight" && (
                      <>
                        <label className="tf-label">Seat preference</label>
                        <div className="tf-chip-row">
                          {["Window","Aisle","Any"].map(s => (
                            <button key={s} className={`tf-chip-select ${seatClass === s ? "active" : ""}`} onClick={()=>setSeatClass(s)}>{s}</button>
                          ))}
                        </div>

                        <label className="tf-label" style={{ marginTop: 12 }}>Baggage</label>
                        <div className="tf-chip-row">
                          <button className="tf-chip-select">No extra</button>
                          <button className="tf-chip-select">+15kg</button>
                          <button className="tf-chip-select">+30kg</button>
                        </div>
                      </>
                    )}

                    {type === "resort" && (
                      <>
                        <label className="tf-label">Room type</label>
                        <div className="tf-chip-row">
                          {["Standard","Deluxe","Suite"].map(rt => (
                            <button key={rt} className={`tf-chip-select ${roomType === rt ? "active" : ""}`} onClick={()=>setRoomType(rt)}>{rt}</button>
                          ))}
                        </div>

                        <label className="tf-label" style={{ marginTop: 12 }}>Breakfast</label>
                        <div className="tf-chip-row">
                          <button className="tf-chip-select">No</button>
                          <button className="tf-chip-select">Yes — {currency(6)} per person</button>
                        </div>
                      </>
                    )}

                    {type === "car" && (
                      <>
                        <label className="tf-label">Add-ons</label>
                        <div className="tf-chip-row">
                          <button className="tf-chip-select">GPS</button>
                          <button className="tf-chip-select">Child seat</button>
                          <button className="tf-chip-select">Additional driver</button>
                        </div>
                      </>
                    )}

                    <div className="tf-actions">
                      <button className="tf-btn tf-primary" onClick={nextStep}>Proceed to payment</button>
                      <button className="tf-btn tf-ghost" onClick={prevStep}>Back</button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="tf-section-header">
                      <h3>Payment</h3>
                      <div className="tf-sub">Select how you'd like to pay</div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className={`tf-pay-tab ${paymentMode === "card" ? "active" : ""}`} onClick={()=>setPaymentMode("card")}>Card</button>
                      <button className={`tf-pay-tab ${paymentMode === "wallet" ? "active" : ""}`} onClick={()=>setPaymentMode("wallet")}>Wallet</button>
                      <button className={`tf-pay-tab ${paymentMode === "qr" ? "active" : ""}`} onClick={()=>setPaymentMode("qr")}>QR</button>
                    </div>

                    {/* CARD */}
                    {paymentMode === "card" && (
                      <div className="tf-pay-grid">
                        <div className="tf-pay-left">
                          <label className="tf-label">Saved cards</label>
                          <div className="tf-saved-list">
                            {cards.map(c => (
                              <div key={c.id} className={`tf-saved-card ${selectedCardId === c.id ? "selected" : ""}`} onClick={()=>setSelectedCardId(c.id)}>
                                <div className="tf-card-brand">
                                  {c.brand === "Visa" ? <FaCcVisa /> : c.brand === "Master" ? <FaCcMastercard /> : null}
                                  <span className="tf-card-title">{c.brand} •••• {c.last4}</span>
                                </div>
                                <div className="tf-card-meta">{c.name} • {c.expiry}</div>
                                <div className="tf-saved-actions">
                                  <button className="tf-btn tf-ghost small" onClick={(e)=>{ e.stopPropagation(); setSelectedCardId(c.id); }}>Use</button>
                                  <button className="tf-btn tf-ghost small" onClick={(e)=>{ e.stopPropagation(); removeCard(c.id); }}>Remove</button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <label className="tf-label">Add new card</label>
                            <div className="tf-grid-3">
                              <input className="tf-input" placeholder="Card number" value={newCard.number} onChange={(e)=>setNewCard({...newCard, number: e.target.value})} />
                              <input className="tf-input" placeholder="Name on card" value={newCard.name} onChange={(e)=>setNewCard({...newCard, name: e.target.value})} />
                              <input className="tf-input" placeholder="MM/YY" value={newCard.expiry} onChange={(e)=>setNewCard({...newCard, expiry: e.target.value})} />
                              <input className="tf-input" placeholder="CVV" value={newCard.cvv} onChange={(e)=>setNewCard({...newCard, cvv: e.target.value})} />
                            </div>

                            <div className="tf-actions" style={{ marginTop: 8 }}>
                              <button className="tf-btn tf-primary" onClick={handleSaveNewCard}>Save card</button>
                              <button className="tf-btn tf-ghost" onClick={()=>setNewCard({ number: "", name: "", expiry: "", cvv: "" })}>Clear</button>
                            </div>
                          </div>
                        </div>

                        <aside className="tf-pay-right">
                          <div className="tf-mini-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div className="tf-sub">Taxes</div>
                                <div className="muted">{currency(taxes)}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div className="tf-sub">Total</div>
                                <div className="strong">{currency(total)}</div>
                              </div>
                            </div>

                            <div style={{ marginTop: 12 }}>
                              <button className="tf-btn tf-primary wide large" onClick={()=>{ if (!selectedCardId && !newCard.number) { alert("Select a saved card or add a new card to pay."); return; } doPaymentSimulation(); }}>{processing ? "Processing…" : `Pay ${currency(total)}`}</button>
                              <div className="tf-secure" style={{ marginTop: 8 }}>PCI • Encrypted • SSL</div>
                            </div>
                          </div>
                        </aside>
                      </div>
                    )}

                    {/* WALLET */}
                    {paymentMode === "wallet" && (
                      <div className="tf-pay-grid">
                        <div className="tf-pay-left">
                          <label className="tf-label">Quick wallets</label>
                          <div className="tf-chip-row">
                            <button className={`tf-wallet ${walletProvider === "Google Pay" ? "active" : ""}`} onClick={()=>setWalletProvider("Google Pay")}><FaGooglePay /> Google Pay</button>
                            <button className={`tf-wallet ${walletProvider === "PayPal" ? "active" : ""}`} onClick={()=>setWalletProvider("PayPal")}>PayPal</button>
                            <button className={`tf-wallet ${walletProvider === "Apple Pay" ? "active" : ""}`} onClick={()=>setWalletProvider("Apple Pay")}><FaApple /> Apple Pay</button>
                            <button className={`tf-wallet ${walletProvider === "PhonePe" ? "active" : ""}`} onClick={()=>setWalletProvider("PhonePe")}>PhonePe</button>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <div className="tf-sub">Fast checkout with {walletProvider}</div>
                            <div className="tf-actions" style={{ marginTop: 10 }}>
                              <button className="tf-btn tf-primary" onClick={()=>doPaymentSimulation()}>{processing ? "Processing…" : `Pay ${currency(total)} with ${walletProvider}`}</button>
                              <button className="tf-btn tf-ghost" onClick={()=>alert("Demo wallet flow — you would redirect to provider.")}>Open {walletProvider}</button>
                            </div>
                          </div>
                        </div>

                        <aside className="tf-pay-right">
                          <div className="tf-mini-card">
                            <div className="tf-sub">Total</div>
                            <div className="strong">{currency(total)}</div>
                            <div style={{ marginTop: 10 }} className="tf-secure">Secure via provider</div>
                          </div>
                        </aside>
                      </div>
                    )}

                    {/* QR */}
                    {paymentMode === "qr" && (
                      <div className="tf-pay-grid">
                        <div className="tf-pay-left">
                          <label className="tf-label">Scan QR to pay</label>
                          <div className="tf-qr-wrap">
                            <QRCode value={`TravelForge|${item?.city||"item"}|${total.toFixed(2)}|${Date.now()}`} size={180} />
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <div className="tf-sub">Amount</div>
                            <div className="strong">{currency(total)}</div>
                          </div>

                          <div className="tf-actions" style={{ marginTop: 10 }}>
                            <button className="tf-btn tf-primary" onClick={()=>doPaymentSimulation()}>{processing ? "Checking…" : "I have paid — verify"}</button>
                            <button className="tf-btn tf-ghost" onClick={()=>setSupportOpen(true)}>Need help</button>
                          </div>
                        </div>

                        <aside className="tf-pay-right">
                          <div className="tf-mini-card">
                            <div className="tf-sub">Reference</div>
                            <div className="tf-note">Booking for {item?.city || "destination"}</div>
                            <div className="tf-mini-divider" />
                            <div className="tf-mini-row"><div className="muted">Subtotal</div><div>{currency(subtotal)}</div></div>
                            <div className="tf-mini-row"><div className="muted">Taxes</div><div>{currency(taxes)}</div></div>
                            <div className="tf-mini-row tf-bold" style={{ marginTop: 8 }}><div>Total</div><div>{currency(total)}</div></div>
                          </div>
                        </aside>
                      </div>
                    )}

                    <div style={{ marginTop: 10 }}>
                      <button className="tf-btn tf-ghost" onClick={prevStep}>Back</button>
                      <button className="tf-btn tf-primary" style={{ marginLeft: 8 }} onClick={()=>setStep(3)}>Review</button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div>
                    <div className="tf-section-header">
                      <h3>Confirmation</h3>
                      <div className="tf-sub">One more step — confirm payment</div>
                    </div>

                    {!processing && success && (
                      <div className="tf-confirm">
                        <div className="tf-confirm-bubble"><FiCheck size={28} /></div>
                        <h4>Payment successful — thank you!</h4>
                        <p className="tf-sub">We’ve confirmed your booking for <strong>{item?.city || "your trip"}</strong></p>

                        <div className="tf-card tf-card-compact" style={{ marginTop: 12 }}>
                          <div className="tf-mini-row"><div className="muted">Subtotal</div><div>{currency(subtotal)}</div></div>
<div className="tf-mini-row">
  <div className="muted">Discount</div>
  <div>-{currency(discount)}</div>
</div>
{wheelReward && (
  <div className="tf-mini-row">
    <div className="muted">Bonus</div>
    <div>{wheelReward}</div>
  </div>
)}
                          <div className="tf-mini-row"><div className="muted">Taxes</div><div>{currency(taxes)}</div></div>
                          <div className="tf-mini-row tf-bold" style={{ marginTop: 8 }}><div>Total</div><div>{currency(total)}</div></div>

                          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                            <button className="tf-btn tf-primary wide" onClick={()=>{ const receipt = { id: `RCPT-${Date.now()}`, city: item?.city, amount: total, date: new Date().toLocaleString(), }; alert(`Receipt generated (demo)\n\nBooking: ${receipt.city}\nTotal: ${currency(receipt.amount)}\nDate: ${receipt.date}`); }}>Download receipt</button>

                            <button className="tf-btn tf-ghost" onClick={()=>{ handleClose(); }}>Close</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!processing && success === false && (
                      <div>
                        <p className="tf-note">You're ready — click the Pay button to complete payment.</p>
                        <div className="tf-actions">
                          <button className="tf-btn tf-primary" onClick={()=>{ setStep(2); }}>Pay now</button>
                          <button className="tf-btn tf-ghost" onClick={handleClose}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {processing && <div className="tf-note">Processing payment… Please wait.</div>}
                  </div>
                )}
              </div>
            </main>

            <aside className="tf-right">
              <div className="tf-card">
                <div className="tf-side-top">
                  <div className="tf-side-thumb">{imageSrc ? <img src={imageSrc} alt={item?.city} /> : <div className="tf-thumb-fallback" />}</div>
                  <div>
                    {wheelReward && (
  <div className="reward-banner">
    🎁 <strong>Bonus Applied:</strong> {wheelReward}
  </div>
)}

                    <div className="tf-side-title">{item?.city || "Selected"}</div>
                    <div className="muted">{type === "flight" ? "Flight" : type === "car" ? "Car" : "Stay"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="tf-mini-row"><div className="muted">Per unit</div><div className="strong">{currency(perUnit)}</div></div>
                  <div className="tf-mini-row"><div className="muted">Extras</div><div>{currency(extrasCost)}</div></div>
                  <div className="tf-mini-row"><div className="muted">Nights / Days</div><div>{type === "flight" ? "1" : Math.max(1, nights)}</div></div>

                  <div className="tf-divider" />

                  <div className="tf-mini-row tf-bold"><div>Total</div><div>{currency(total)}</div></div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="tf-label">Quick wallets</div>
                  <div className="tf-chip-row" style={{ marginTop: 8 }}>
                    <button className="tf-chip" onClick={()=>{ setPaymentMode("wallet"); setWalletProvider("Google Pay"); }}><FaGooglePay /></button>
                    <button className="tf-chip" onClick={()=>{ setPaymentMode("wallet"); setWalletProvider("PhonePe"); }}>PP</button>
                    <button className="tf-chip" onClick={()=>{ setPaymentMode("wallet"); setWalletProvider("PayPal"); }}>PayPal</button>
                    <button className="tf-chip" onClick={()=>{ setPaymentMode("wallet"); setWalletProvider("Apple Pay"); }}><FaApple /></button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="tf-label">Secure payment</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <div className="tf-wallet-badge">PCI ✓</div>
                    <div className="tf-wallet-badge">Encrypted ✓</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="tf-label">Need help?</div>
                  <div className="tf-sub">Contact support or cancel free within 24h.</div>
                  <div style={{ marginTop: 10 }}>
                    <button className="tf-btn tf-ghost" onClick={() => setSupportOpen(true)}>Contact support</button>
                    <button className="tf-btn" style={{ marginLeft: 8 }} onClick={()=>alert("Demo cancellation policy: full refund within 24 hours.")}>Cancel</button>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <AnimatePresence>
            {celebrateHearts && <Confetti active={celebrateHearts} hearts={true} />}
          </AnimatePresence>

          <AnimatePresence>
            {showToast && (
              <motion.div className="tf-toast"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.22 }}
              >
                🎉 Payment confirmed • {currency(total)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {supportOpen && (
          <SupportModal
            open={supportOpen}
            onClose={() => setSupportOpen(false)}
            context={{ city: item?.city, type }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
