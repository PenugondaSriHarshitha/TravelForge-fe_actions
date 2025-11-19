import React, { useState } from "react";
import { motion } from "framer-motion";
import "./pages.css";

const FAQ_CATEGORIES = [
  {
    key: "booking",
    label: "Booking",
    qa: [
      { q: "How do I find the lowest fare?", a: "Use flexible dates, try nearby airports, and compare total costs including baggage and seat fees." },
      { q: "Can I book multi-city or split journeys?", a: "Yes, our search supports flexible, multi-city and split-ticket itineraries for savings." },
    ],
  },
  {
    key: "payments",
    label: "Payments & Fees",
    qa: [
      { q: "What fees should I expect?", a: "We surface common fees (checked bags, seat selection, changes) in results to avoid surprises." },
      { q: "Is my payment secure?", a: "Yes — transactions are encrypted and protected by industry-standard security." },
    ],
  },
  {
    key: "cancellations",
    label: "Cancellations & Refunds",
    qa: [
      { q: "Can I cancel or change my booking?", a: "Policies vary by airline and fare class. We highlight change rules before checkout." },
      { q: "How long do refunds take?", a: "Refund timing depends on airline/issuer — typically 5-10 business days after approval." },
    ],
  },
  {
    key: "account",
    label: "Account & Support",
    qa: [
      { q: "How do I contact support?", a: "Email travelforge09@gmail.com or call +91 80748 33948. We’re here to help." },
      { q: "How do I reset my password?", a: "Use ‘Forgot password’ on the sign-in page to receive a reset link via email." },
    ],
  },
];

export default function Help() {
  const [active, setActive] = useState(FAQ_CATEGORIES[0].key);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(-1);

  const cat = FAQ_CATEGORIES.find(c => c.key === active) || FAQ_CATEGORIES[0];
  const list = cat.qa.filter(item =>
    (item.q + " " + item.a).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="tf-page tf-help" aria-labelledby="help-title">
      {/* Hero */}
      <section className="tf-hero tf-hero-compact">
        <div className="tf-hero-inner">
          <p className="tf-eyebrow">Help & FAQ</p>
          <h1 id="help-title">We’re here to help — ask away ✨</h1>
          <p className="tf-subtext">Quick answers to common questions. Still stuck? Contact us below.</p>
        </div>
        <div className="tf-map" aria-hidden="true" />
      </section>

      {/* Tabs */}
      <section className="tf-section">
        <div className="tf-faq-tabs" role="tablist">
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={active === c.key}
              className={`tf-tab ${active === c.key ? "active" : ""}`}
              onClick={() => { setActive(c.key); setOpen(-1); setQuery(""); }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="tf-faq-search">
          <input
            type="search"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search FAQs"
          />
        </div>

        {/* Accordion */}
        <div className="tf-faq">
          {list.length === 0 && (
            <div className="tf-faq-empty">No results. Try another keyword.</div>
          )}

          {list.map((item, i) => (
            <motion.article
              key={i}
              className={`tf-faq-item ${open === i ? "open" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <button
                className="tf-faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span className="tf-faq-icon">{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <div className="tf-faq-a">{item.a}</div>}
            </motion.article>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="tf-section tf-contact">
        <div className="tf-contact-card">
          <h2>Contact support</h2>
          <ul className="tf-contact-list">
            <li>
              <span>📧 Email</span>
              <a href="mailto:travelforge09@gmail.com">travelforge09@gmail.com</a>
            </li>
            <li>
              <span>📞 Phone</span>
              <div className="tf-phones">
                <a href="tel:7995784764">7995784764</a>
                <a href="tel:+918074833948">+91 80748 33948</a>
                <a href="tel:+918309907385">+91 83099 07385</a>
              </div>
            </li>
          </ul>
          <div className="tf-contact-cta">
            <a className="tf-btn-link" href="mailto:travelforge09@gmail.com">Email us</a>
            <a className="tf-btn-link" href="tel:+918074833948">Call support</a>
          </div>
        </div>
      </section>
    </main>
  );
}
