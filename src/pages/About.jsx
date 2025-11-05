import React from "react";
import { motion } from "framer-motion";
import "./pages.css";

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="tf-page tf-about" aria-labelledby="about-title">
      {/* Hero */}
      <section className="tf-hero">
        <motion.div
          className="tf-hero-inner"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <p className="tf-eyebrow">About TravelForge</p>
          <h1 id="about-title">We make travel simple, fair, and joyful ✈️</h1>
          <p className="tf-subtext">
            We help travelers discover smart routes across{" "}
            <strong>100+ destinations</strong>, compare total costs upfront,
            and book with confidence.
          </p>
        </motion.div>
        <div className="tf-map" aria-hidden="true" />
      </section>

      {/* Stats */}
      <section className="tf-section tf-stats">
        <motion.ul
          className="tf-stats-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { k: "4.8/5", v: "Avg. rating" },
            { k: "100+", v: "Destinations" },
            { k: "30%", v: "Avg. savings" },
            { k: "1M+", v: "Price checks/day" },
          ].map((s, i) => (
            <motion.li key={i} variants={fadeUp}>
              <span className="stat-k">{s.k}</span>
              <span className="stat-v">{s.v}</span>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* Mission & Vision */}
      <section className="tf-section">
        <div className="tf-split">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2>Our mission</h2>
            <p>
              Put travelers first with transparent pricing, thoughtful
              recommendations, and tools that reduce the stress of planning.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2>Our approach</h2>
            <p>
              We combine data with human insight — fare intelligence, honest
              comparisons, and local tips — all in a streamlined, delightful
              experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="tf-section">
        <h2>Why travelers choose TravelForge</h2>
        <div className="tf-card-grid">
          {[
            {
              title: "Total cost clarity",
              body: "See baggage, seat and change fees before checkout — no surprises.",
              icon: "💡",
            },
            {
              title: "Smart routes",
              body: "Find flexible dates, split journeys, and hidden savings.",
              icon: "🧭",
            },
            {
              title: "Trusted partners",
              body: "We work with airlines and local operators worldwide.",
              icon: "🤝",
            },
            {
              title: "Secure checkout",
              body: "Best-in-class security for peace of mind.",
              icon: "🔒",
            },
          ].map((c, i) => (
            <motion.article
              key={i}
              className="tf-card"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="tf-card-icon" aria-hidden>
                {c.icon}
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Story timeline */}
      <section className="tf-section">
        <h2>Our story</h2>
        <ol className="tf-timeline" aria-label="Company timeline">
          <li>
            <span className="tl-dot" />
            <h4>October 2024 — Idea & Planning</h4>
            <p>
              TravelForge began as a project selection discussion — evaluating
              real travel frustrations, mapping user pain points, and shaping
              the core ideology of a transparent booking platform.
            </p>
          </li>
          <li>
            <span className="tl-dot" />
            <h4>November 2024 — Design & Development</h4>
            <p>
              UI layouts, data flow, and deployment strategy were finalized.
              Frontend, backend, and content were built in parallel.
            </p>
          </li>
          <li>
            <span className="tl-dot" />
            <h4>January 2025 — Live & Growing</h4>
            <p>
              Core features were deployed and the platform is now evolving with
              real user feedback, new destinations, and smarter travel tools.
            </p>
          </li>
        </ol>
      </section>

      {/* Team */}
      <section className="tf-section tf-team">
        <h2>Meet the team</h2>
        <p className="tf-subtext" style={{ marginBottom: 16 }}>
          Small team, big journeys. We craft the details so your trips feel
          effortless.
        </p>

        <div className="tf-team-grid">
          {[
            {
              name: "Subbarao Aaki",
              role: "Managed layout, info collection & deployment",
              initials: "SA",
            },
            {
              name: "Harshitha Penugondha",
              role: "CSS, Frontend & deployment",
              initials: "HP",
            },
            {
              name: "Bhavya Chowdary",
              role: "Frontend + Backend",
              initials: "BC",
            },
          ].map((m, i) => (
            <motion.article
              key={i}
              className="tf-team-card"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="tf-avatar" aria-hidden>
                <span>{m.initials}</span>
              </div>
              <div className="tf-team-meta">
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
              <div className="tf-team-socials" aria-label={`Links for ${m.name}`}>
                <a href="#" aria-label="LinkedIn" title="LinkedIn">
                  in
                </a>
                <a href="#" aria-label="Twitter" title="Twitter">
                  x
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="tf-section tf-testimonials">
        <h2>Loved by travelers</h2>
        <p className="tf-subtext" style={{ marginBottom: 18 }}>
          Real experiences from trips planned with TravelForge.
        </p>

        <TestimonialsCarousel />
      </section>

      {/* Office / Map */}
      <section className="tf-section tf-map-section">
        <h2>Our office</h2>
        <p className="tf-subtext" style={{ marginBottom: 16 }}>
          Hyderabad, India
        </p>
        <div className="tf-map-embed">
          <iframe
            title="TravelForge office — Hyderabad"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Hyderabad&output=embed"
            allowFullScreen
          />
        </div>
      </section>

      {/* Contact */}
      <section className="tf-section tf-contact">
        <div className="tf-contact-card">
          <h2>Contact & Support</h2>
          <ul className="tf-contact-list">
            <li>
              <span>📧 Email</span>
              <a href="mailto:travelforge09@gmail.com">
                travelforge09@gmail.com
              </a>
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
            <a className="tf-btn-link" href="mailto:travelforge09@gmail.com">
              Email us
            </a>
            <a className="tf-btn-link" href="tel:+918074833948">
              Call support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Testimonials Component ---------- */
function TestimonialsCarousel() {
  const [i, setI] = React.useState(0);
  const items = [
    {
      name: "Aarav",
      text: "Saved me hours comparing fees. Super clear checkout!",
      city: "Bengaluru",
    },
    {
      name: "Meera",
      text: "Flexible dates found a cheaper route by a day.",
      city: "Hyderabad",
    },
    {
      name: "Kabir",
      text: "Loved the transparency. No last-minute surprises.",
      city: "Delhi",
    },
    {
      name: "Ananya",
      text: "UI is smooth and fast. Booked in minutes.",
      city: "Mumbai",
    },
  ];

  function prev() {
    setI((i - 1 + items.length) % items.length);
  }

  function next() {
    setI((i + 1) % items.length);
  }

  return (
    <div className="tf-testi-wrap">
      <button className="tf-testi-nav" onClick={prev} aria-label="Previous">
        ‹
      </button>
      <motion.div
        key={i}
        className="tf-testi-card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="tf-testi-avatar" aria-hidden>
          {items[i].name[0]}
        </div>
        <blockquote>“{items[i].text}”</blockquote>
        <div className="tf-testi-meta">
          — {items[i].name}, {items[i].city}
        </div>
      </motion.div>
      <button className="tf-testi-nav" onClick={next} aria-label="Next">
        ›
      </button>
    </div>
  );
}
