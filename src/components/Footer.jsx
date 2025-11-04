// src/components/Footer.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Footer.css";
import { Link } from "react-router-dom";

/**
 * Footer component with two-line popup message and share actions.
 * Replace your existing Footer.jsx with this file.
 */

const columns = [
  {
    title: "Company",
    links: [
      { id: "about", label: "About" },
      { id: "careers", label: "Careers" },
      { id: "mobile", label: "Mobile" },
      { id: "blog", label: "Blog" },
      { id: "how", label: "How we work" },
    ],
  },
  {
    title: "Contact",
    links: [
      { id: "help", label: "Help / FAQ" },
      { id: "press", label: "Press" },
      { id: "affiliates", label: "Affiliates" },
      { id: "partners", label: "Partners" },
      { id: "advertise", label: "Advertise with us" },
    ],
  },
  {
    title: "Explore",
    links: [
      { id: "airline", label: "Airlines" },
      { id: "fees", label: "Airline fees" },
      { id: "tips", label: "Low fare tips" },
      { id: "security", label: "Security" },
    ],
  },
];

// Helper: create safe text for email/twitter
function safeText(s = "") {
  return encodeURIComponent(s);
}

export default function Footer({
  onSubscribe = (email) => Promise.resolve({ ok: true }), // optional override
}) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  // popup.message can be string or array (array -> multiple lines)
  const [popup, setPopup] = useState({ open: false, title: "", message: null, linkId: null });

  // Two-line messages (every mapping uses an array of 2 strings)
  const messages = {
    about: [
      "Learn more about our company, mission and values.",
      "We're a small team building delightful travel products — join our newsletter for updates.",
    ],
    careers: [
      "See open roles and join our team.",
      "We hire engineers, designers and customer support folks — remote-friendly.",
    ],
    mobile: [
      "Download our mobile app for on-the-go bookings.",
      "Available for iOS and Android — sign up to get the beta link.",
    ],
    blog: [
      "Read travel tips and destination guides.",
      "New posts every week: tips, itineraries, and local recommendations.",
    ],
    how: [
      "Learn how TravelForge works and how to book.",
      "Our booking flow shows total cost upfront — no surprise fees.",
    ],
    help: [
      "Frequently asked questions and support guides.",
      "If you still need help, open the Support chat in the site header.",
    ],
    press: [
      "Press contact and media resources.",
      "For interviews or assets, email press@travelforge.example.",
    ],
    affiliates: [
      "Partner and affiliate programs.",
      "Grow with us: referral terms and payout information are available on enquiry.",
    ],
    partners: [
      "Our industry partners and integrations.",
      "We work with hotels, aggregators and local operators to curate stays.",
    ],
    advertise: [
      "Advertise opportunities with TravelForge.",
      "Reach targeted travel audiences — request a media kit via email.",
    ],
    airline: [
      "Search and compare airlines for your route.",
      "We surface baggage fees and durations so you can choose the best option.",
    ],
    fees: [
      "Information about airline fees and baggage charges.",
      "Compare add-on costs like checked baggage and seat selection during search.",
    ],
    tips: [
      "Top tips to find the lowest fares.",
      "Try flexible dates, split journeys, and set price alerts to save more.",
    ],
    security: [
      "Safety and security information for travelers.",
      "Check local guidance and travel advisories before booking.",
    ],
  };

  // open popup and set a two-line message (defaults to fallback)
  function openPopup(title, linkId) {
    setPopup({
      open: true,
      title: title,
      message: messages[linkId] || ["More information coming soon.", "Check back later for fuller details."],
      linkId,
    });
  }

  function closePopup() {
    setPopup({ open: false, title: "", message: null, linkId: null });
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    setNewsletterError("");
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    try {
      const resp = await onSubscribe(newsletterEmail);
      if (resp && resp.ok) {
        setNewsletterEmail("");
        setNewsletterError("");
        setPopup({ open: true, title: "Subscribed!", message: ["Thanks — you’ve been added to our newsletter.", "Check your inbox for a welcome message."], linkId: "subscribed" });
        setTimeout(closePopup, 1600);
      } else {
        setNewsletterError("Subscription failed. Try again later.");
      }
    } catch (err) {
      setNewsletterError("Subscription failed. Try again later.");
    }
  }

  // Share helpers
  function handleCopyLink() {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      // give immediate feedback by replacing popup message briefly
      setPopup((p) => ({ ...p, message: ["Link copied to clipboard!", "You can paste it anywhere to share."] }));
      setTimeout(() => {
        // restore the original message shortly after
        setPopup((prev) => ({ ...prev, message: messages[prev.linkId] || ["More information coming soon.", "Check back later."] }));
      }, 1500);
    } catch (err) {
      console.warn("copy failed", err);
    }
  }

  function handleShareEmail() {
    const subject = safeText(popup.title || "Check this link");
    const bodyLines = Array.isArray(popup.message) ? popup.message.join("\n\n") : (popup.message || "");
    const body = safeText(`${bodyLines}\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function handleShareTwitter() {
    const text = safeText(`${popup.title} — ${Array.isArray(popup.message) ? popup.message[0] : (popup.message || "")}`);
    const url = safeText(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-grid">
            {columns.map((col) => (
              <div key={col.title} className="footer-col">
                <h5>{col.title}</h5>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={"#" + link.id}
                        onClick={(ev) => { ev.preventDefault(); openPopup(link.label, link.id); }}
                        className="footer-link"
                        aria-label={`${link.label} (opens short info)`}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="footer-col newsletter">
              <h5>Stay Updated</h5>
              <p>Subscribe for the best travel deals ✈</p>
              <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Footer newsletter form">
                <input
                  type="email"
                  placeholder="Your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button type="submit">Subscribe</button>
              </form>
              {newsletterError && <div className="newsletter-error" role="alert">{newsletterError}</div>}
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="partners-strip badges">
            <motion.div className="badge" whileHover={{ translateY: -6 }}>Best Deals</motion.div>
            <motion.div className="badge" whileHover={{ translateY: -6 }}>Secure</motion.div>
            <motion.div className="badge" whileHover={{ translateY: -6 }}>Trusted</motion.div>
          </div>

          <div className="footer-stats">
            <div className="stat-mini">🌍 <strong>100+</strong> Destinations</div>
            <div className="stat-mini">💸 <strong>Save 30%</strong> on trips</div>
            <div className="stat-mini">⭐ <strong>4.8</strong> / 5 reviews</div>
          </div>

          <div className="footer-meta">
            <div className="socials">
  <a
    href="https://www.facebook.com/share/1Af44e3wnZ/"
    target="_blank"
    rel="noopener noreferrer"
    className="social glass"
    aria-label="Facebook"
  >
    🌐
  </a>
  <a
    href="https://twitter.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social glass"
    aria-label="Twitter"
  >
    🐦
  </a>
  <a
    href="https://youtube.com/@travelforge?si=UmkXSnMwAFfO6yDG"
    target="_blank"
    rel="noopener noreferrer"
    className="social glass"
    aria-label="YouTube"
  >
    ▶
  </a>
  <a
    href="https://www.instagram.com/travelforge_09?igsh=ODlsdHZzZDdod3Zx"
    target="_blank"
    rel="noopener noreferrer"
    className="social glass"
    aria-label="Instagram"
  >
    📸
  </a>
</div>

           <div className="legal">
  <span>© {new Date().getFullYear()} TravelForge</span>
  <Link to="/privacy">Privacy</Link>
  <Link to="/terms">Terms</Link>
</div>

          </div>
        </div>
      </div>

      {/* popup */}
      {popup.open && (
        <div className="footer-popup-backdrop" onClick={closePopup} role="dialog" aria-modal="true">
          <motion.div
            className="footer-popup"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.12 }}
            role="document"
          >
            <div className="popup-head">
              <strong>{popup.title}</strong>
              <button aria-label="Close popup" className="popup-close" onClick={closePopup}>×</button>
            </div>

            <div className="popup-body">
              {/* support both string and array messages; show two lines */}
              {Array.isArray(popup.message) ? (
                popup.message.map((m, i) => <p key={i}>{m}</p>)
              ) : (
                <>
                  <p>{popup.message}</p>
                  <p style={{ marginTop: 6, color: "rgba(0,0,0,0.72)" }}>For more details visit the relevant page or contact support.</p>
                </>
              )}

              <div className="popup-actions">
                <button className="tf-btn" onClick={handleCopyLink} title="Copy link">Copy link</button>
                <button className="tf-btn" onClick={handleShareEmail} title="Share by email">Share via Email</button>
                <button className="tf-btn" onClick={handleShareTwitter} title="Share on Twitter">Share on Twitter</button>

                <button className="tf-btn tf-primary" onClick={closePopup} style={{ marginLeft: 8 }}>OK</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </footer>
  );
}
