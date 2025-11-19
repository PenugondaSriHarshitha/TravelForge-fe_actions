// src/components/SubscribeModal.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SubscribeModal.css";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:8084"; // Spring Boot backend

export default function SubscribeModal() {
  const loc = useLocation();
  const navigate = useNavigate();

  // incoming state from gate
  const incomingEmail = loc?.state?.email || "";
  const returnTo = loc?.state?.returnTo || null; // { path, extra }
  const source = loc?.state?.from || "";

  // form
  const [email, setEmail] = useState(incomingEmail);
  const [plan, setPlan] = useState("monthly"); // free | monthly | yearly
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | qr
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // success
  const [success, setSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [showReceiptInline, setShowReceiptInline] = useState(false);

  // for QR
  const [qrPaid, setQrPaid] = useState(false);

  useEffect(() => {
    setEmail(incomingEmail);
  }, [incomingEmail]);

  const simpleEmailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const validateForm = () => {
    if (!email || !simpleEmailValid(email)) return "Please enter a valid email address.";
    if (plan !== "free" && paymentMethod === "card") {
      if (!cardName.trim()) return "Cardholder name is required.";
      if (!/^\d{12,19}$/.test(cardNumber.replace(/\s+/g, ""))) return "Enter a valid card number (digits only).";
      if (!/^\d{2}\/\d{2}$/.test(exp)) return "Expiry must be MM/YY.";
      if (!/^\d{3,4}$/.test(cvv)) return "Enter a valid CVV.";
    }
    return "";
  };

  const handleClose = () => {
    // go back to where user came from if present, else home
    const sessIntent = sessionStorage.getItem("LOCK_INTENT");
    if (sessIntent) {
      try {
        const intent = JSON.parse(sessIntent);
        navigate(intent.path, intent.extra || {});
        sessionStorage.removeItem("LOCK_INTENT");
        return;
      } catch {}
    }
    if (returnTo?.path) {
      navigate(returnTo.path, returnTo.extra || {});
      return;
    }
    if (source) navigate(-1);
    else navigate("/");
  };

  const buildQrUrl = (payload, size = "260x260") => {
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    const params = new URLSearchParams({ size, data: payload, format: "png" });
    return `${base}?${params.toString()}`;
  };

  async function postSubscription(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("subscribe POST failed", err);
      return null;
    }
  }

  const afterSubscribed = async (rid, planSaved) => {
    try {
      localStorage.setItem("travelforge_sub_email", email);
      if (planSaved) localStorage.setItem("travelforge_sub_plan", planSaved);
    } catch {}
    // if there was an intent, go back exactly there
    const sessIntent = sessionStorage.getItem("LOCK_INTENT");
    const target = sessIntent ? JSON.parse(sessIntent) : returnTo;
    if (sessIntent) sessionStorage.removeItem("LOCK_INTENT");

    setSuccess(true);
    setReceiptId(rid || "");
    setReceiptUrl(`${window.location.origin}/receipt/${rid || "receipt"}`);

    // small delay to let success view render, then auto-return in 1.2s
    setTimeout(() => {
      if (target?.path) navigate(target.path, target.extra || {});
      else navigate("/");
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validateForm();
    if (v) return setError(v);

    // QR flow (non-free)
    if (plan !== "free" && paymentMethod === "qr") {
      const rid = `TF-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      setReceiptId(rid);
      setReceiptUrl(`${window.location.origin}/receipt/${rid}`);
      const payload = { email, plan, method: "qr", cardLast4: null, receiptId: rid, source };
      await postSubscription(payload);
      setSuccess(false);
      setQrPaid(false);
      return;
    }

    // card or free: process immediately (mock)
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));

    const rid = `TF-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const digits = (cardNumber || "").replace(/\s+/g, "");
    const cardLast4 = digits ? digits.slice(-4) : null;

    const payload = { email, plan, method: paymentMethod === "card" ? "card" : paymentMethod, cardLast4, receiptId: rid, source };
    const resp = await postSubscription(payload);

    setProcessing(false);
    const finalRid = resp?.receiptId || rid;
    await afterSubscribed(finalRid, plan);
  };

  const confirmQrPaid = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setQrPaid(true);

    let rid = receiptId;
    if (!rid) {
      rid = `TF-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      setReceiptId(rid);
    }
    setReceiptUrl(`${window.location.origin}/receipt/${rid}`);

    const payload = { email, plan, method: "qr", cardLast4: null, receiptId: rid, source };
    await postSubscription(payload);

    setProcessing(false);
    await afterSubscribed(rid, plan);
  };

  const copyReceiptLink = async () => {
    try { await navigator.clipboard.writeText(receiptUrl); alert("Link copied to clipboard!"); }
    catch { alert("Copy failed — please select and copy manually."); }
  };

  const downloadQr = async (payloadFn) => {
    try {
      const payload = payloadFn ? payloadFn() : `receipt:${receiptId}|email:${email}|plan:${plan}`;
      const qr = buildQrUrl(payload);
      const res = await fetch(qr);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `travelforge_receipt_${receiptId || "qr"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download QR.");
    }
  };

  const maskCard = (num) => {
    const digits = (num || "").replace(/\s+/g, "");
    if (!digits) return "•••• •••• •••• ••••";
    const last4 = digits.slice(-4).padStart(4, "•");
    return `•••• •••• •••• ${last4}`;
  };
  const formatCardInput = (val) => val.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim();
  const paymentPayload = () => {
    const amount = plan === "monthly" ? "4.99" : plan === "yearly" ? "39.00" : "0.00";
    return `pay:travelforge|receipt:${receiptId || "PRE"}|email:${email}|plan:${plan}|amount:${amount}`;
  };

  // Inline receipt
  const ReceiptInline = ({ onClose }) => {
    const payload = `receipt:${receiptId}|email:${email}|plan:${plan}`;
    const qrUrl = buildQrUrl(payload);
    return (
      <div className="inline-receipt-shell" role="dialog" aria-modal="true">
        <div className="inline-backdrop" onClick={onClose} />
        <motion.div className="inline-receipt-card" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
          <header className="inline-head">
            <div>
              <div className="brand-pill">Receipt</div>
              <div className="mono tiny">{receiptId}</div>
            </div>
            <button className="btn-close" onClick={onClose}>✕</button>
          </header>

          <div className="inline-body">
            <div className="receipt-summary">
              <div className="row"><strong>Plan:</strong> <span>{plan === "free" ? "Free" : plan === "monthly" ? "Monthly" : "Yearly"}</span></div>
              <div className="row"><strong>To:</strong> <span>{email}</span></div>
              <div className="row"><strong>Notes:</strong> <span className="muted">Weekly tips, curated deals</span></div>
            </div>

            <div className="receipt-qr">
              <img src={qrUrl} alt="Receipt QR" />
              <div className="tiny-muted">Scan to open or share.</div>
            </div>
          </div>

          <footer className="inline-foot">
            <button className="btn-ghost" onClick={() => { navigator.share ? navigator.share({ title: "TravelForge receipt", text: receiptId, url: receiptUrl }).catch(() => window.open(receiptUrl, "_blank")) : window.open(receiptUrl, "_blank"); }}>
              Share
            </button>
            <button className="btn-primary" onClick={() => window.print()}>Print</button>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </footer>
        </motion.div>
      </div>
    );
  };

  // Success view
  if (success) {
    const payload = `receipt:${receiptId}|email:${email}|plan:${plan}`;
    const qrUrl = buildQrUrl(payload);
    return (
      <div className="subscribe-shell" role="dialog" aria-modal="true" aria-label="Subscription success">
        <div className="subscribe-backdrop" onClick={handleClose} />
        <motion.div className="subscribe-card subscribe-success cute" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.26 }}>
          <div className="success-head">
            <div>
              <div className="brand-pill">🎉 Subscribed</div>
              <h2 className="success-title">You're all set — welcome aboard!</h2>
              <p className="muted">A confirmation was sent to <strong>{email}</strong></p>
            </div>
            <button className="btn-close" onClick={handleClose} aria-label="Close success">✕</button>
          </div>

          <div className="success-body">
            <div className="receipt-block">
              <div className="receipt-meta">
                <div className="meta-row"><strong>Receipt:</strong> <span className="mono">{receiptId}</span></div>
                <div className="meta-row"><strong>Plan:</strong> <span>{plan === "free" ? "Free" : plan === "monthly" ? "Monthly" : "Yearly"}</span></div>
                <div className="meta-row"><strong>Email:</strong> <span>{email}</span></div>
                <div className="meta-row"><strong>Details:</strong> <span className="muted">Weekly tips, curated deals, early access</span></div>
              </div>

              <div className="qr-zone" aria-hidden>
                <div className="cute-card-preview">
                  <div className="chip">💳</div>
                  <div className="card-number">{maskCard(cardNumber)}</div>
                  <div className="card-meta"><span>{cardName || "Cardholder"}</span><span>{exp || "MM/YY"}</span></div>
                </div>

                <img src={qrUrl} alt="Subscription QR code" className="qr-img" />
                <div className="qr-actions">
                  <button className="btn-ghost small" onClick={copyReceiptLink}>Copy link</button>
                  <button className="btn-primary small" onClick={() => downloadQr()}>Download QR</button>
                </div>
                <div className="tiny-muted" style={{ marginTop: 8 }}>Scan to open receipt or share with friends.</div>
              </div>
            </div>

            <div className="success-cta">
              <button className="btn-primary" onClick={() => navigate("/")}>Back to Home</button>
              <button className="btn-ghost" onClick={handleClose} style={{ marginLeft: 8 }}>Close</button>
              <button className="link-small" onClick={() => setShowReceiptInline(true)} style={{ marginLeft: 12 }}>Open receipt</button>
            </div>
          </div>
        </motion.div>
        {showReceiptInline && <ReceiptInline onClose={() => setShowReceiptInline(false)} />}
      </div>
    );
  }

  // Form view
  return (
    <div className="subscribe-shell" role="dialog" aria-modal="true" aria-label="Subscribe modal">
      <div className="subscribe-backdrop" onClick={handleClose} />

      <motion.div className="subscribe-card" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.28 }}>
        <header className="subscribe-head">
          <div>
            <div className="brand-pill">✨ Subscribe</div>
            <h2>Get the best travel tips & deals</h2>
            <p className="muted">Hand-picked tips, early deals and short guides — delivered weekly.</p>
          </div>
          <button className="btn-close" onClick={handleClose} aria-label="Close subscribe">✕</button>
        </header>

        <form className="subscribe-form" onSubmit={handleSubmit}>
          <label className="field">
            <div className="field-label">Email</div>
            <input type="email" placeholder="you@wondermail.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required />
          </label>

          <div className="plans">
            <div className="field-label">Choose a plan</div>
            <div className="plan-grid">
              <label className={`plan ${plan === "free" ? "active" : ""}`}>
                <input type="radio" name="plan" value="free" checked={plan === "free"} onChange={() => setPlan("free")} />
                <div className="plan-title">Free</div>
                <div className="plan-sub">Weekly tips • Email only</div>
              </label>

              <label className={`plan ${plan === "monthly" ? "active" : ""}`}>
                <input type="radio" name="plan" value="monthly" checked={plan === "monthly"} onChange={() => setPlan("monthly")} />
                <div className="plan-title">Monthly</div>
                <div className="plan-sub">$4.99 / month • Early deals</div>
              </label>

              <label className={`plan ${plan === "yearly" ? "active" : ""}`}>
                <input type="radio" name="plan" value="yearly" checked={plan === "yearly"} onChange={() => setPlan("yearly")} />
                <div className="plan-title">Yearly</div>
                <div className="plan-sub">$39 / year • 2 months free</div>
              </label>
            </div>
          </div>

          <div className="field-label" style={{ marginTop: 8 }}>Payment method</div>
          <div className="payment-methods">
            <label className={`pm ${paymentMethod === "card" ? "active" : ""}`}>
              <input type="radio" name="pm" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
              <div>Card</div>
            </label>
            <label className={`pm ${paymentMethod === "qr" ? "active" : ""}`}>
              <input type="radio" name="pm" value="qr" checked={paymentMethod === "qr"} onChange={() => setPaymentMethod("qr")} />
              <div>QR Pay</div>
            </label>
          </div>

          {plan !== "free" && paymentMethod === "card" && (
            <div className="payment-panel">
              <div className="card-visual-row">
                <div className="cute-card-preview small">
                  <div className="chip">💳</div>
                  <div className="card-number">{maskCard(cardNumber)}</div>
                  <div className="card-meta"><span>{cardName || "Cardholder"}</span><span>{exp || "MM/YY"}</span></div>
                </div>

                <div className="field">
                  <div className="field-label">Cardholder name</div>
                  <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" />
                </div>
              </div>

              <div className="row">
                <div className="field flex">
                  <div className="field-label">Card number</div>
                  <input type="text" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(formatCardInput(e.target.value))} placeholder="4242 4242 4242 4242" />
                </div>

                <div className="field small">
                  <div className="field-label">Exp (MM/YY)</div>
                  <input type="text" value={exp} onChange={(e) => setExp(e.target.value.replace(/[^0-9/]/g, "").slice(0, 5))} placeholder="09/27" />
                </div>

                <div className="field small">
                  <div className="field-label">CVV</div>
                  <input type="text" inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, "").slice(0, 4))} placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {plan !== "free" && paymentMethod === "qr" && (
            <div className="qr-payment-panel">
              <div className="qr-instructions">
                <div className="field-label">Scan to pay</div>
                <div className="muted">Open your banking or UPI app and scan the QR. Amount will be prefilled.</div>
              </div>

              <div className="qr-big">
                <img src={buildQrUrl(paymentPayload())} alt="Payment QR" />
                <div className="qr-amount">{plan === "monthly" ? "$4.99" : "$39.00"}</div>
                <div className="qr-actions">
                  <button type="button" className="btn-ghost" onClick={() => downloadQr(paymentPayload)}>Download QR</button>
                  <button type="button" className="btn-primary" onClick={confirmQrPaid} disabled={processing}>{processing ? "Checking…" : "I've paid"}</button>
                </div>
                <div className="tiny-muted" style={{ marginTop: 8 }}>Tip: Use Google Pay / PhonePe / PayTM or any UPI app to scan.</div>
              </div>
            </div>
          )}

          {error && <div className="subscribe-error" role="alert">{error}</div>}

          <div className="subscribe-actions">
            <button className="btn-ghost" type="button" onClick={handleClose}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={processing} aria-busy={processing}>
              {processing ? "Processing…" : plan === "free" ? "Subscribe (Free)" : paymentMethod === "qr" ? `Show QR` : `Subscribe & Pay`}
            </button>
          </div>

          <div className="tiny-muted">You can cancel anytime. This is a demo — no real payments are performed.</div>
        </form>
      </motion.div>
    </div>
  );
}
