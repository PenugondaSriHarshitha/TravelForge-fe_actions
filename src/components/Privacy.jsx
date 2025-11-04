import React from "react";
import { motion } from "framer-motion";
import { Shield, Globe2, Cookie, Info, UserCheck, Lock, Compass, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Info color="#0077b6" size={26} />,
      title: "Information We Collect",
      text: "We collect minimal personal data — such as names, emails, and travel preferences — only when you sign up or interact with our site.",
    },
    {
      icon: <Compass color="#ff914d" size={26} />,
      title: "How We Use It",
      text: "Your information helps personalize your travel experience — suggesting destinations, creating mood-based itineraries, and improving overall service.",
    },
    {
      icon: <Cookie color="#ffca3a" size={26} />,
      title: "Cookies & Analytics",
      text: "We use cookies to remember your preferences and analytics to understand what inspires travelers most — ensuring smoother navigation every time you visit.",
    },
    {
      icon: <Shield color="#4cc9f0" size={26} />,
      title: "Data Protection & Security",
      text: "All your data is transmitted over secure, encrypted connections. We never sell or misuse your information — ever.",
    },
    {
      icon: <UserCheck color="#38b000" size={26} />,
      title: "Your Rights",
      text: "You may request access, correction, or deletion of your data anytime. We believe privacy is your fundamental travel companion.",
    },
    {
      icon: <Globe2 color="#ef476f" size={26} />,
      title: "Third-Party Integrations",
      text: "We occasionally connect with trusted APIs — such as Google Maps or Booking services — solely to enhance your experience. Your data remains private.",
    },
    {
      icon: <Lock color="#7209b7" size={26} />,
      title: "Policy Updates",
      text: "If we make any privacy-related changes, this page will always reflect them transparently — no hidden surprises, just open skies ahead.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff9e6, #e7f8ff, #f0fff4)",
        padding: "80px 20px",
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontSize: "48px",
          fontWeight: "800",
          color: "#0077b6",
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        Privacy Policy 🌍
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          maxWidth: "650px",
          textAlign: "center",
          color: "#555",
          fontSize: "17px",
          lineHeight: "1.7",
          marginBottom: "50px",
        }}
      >
        At <strong style={{ color: "#0077b6" }}>TravelForge</strong>, your trust fuels our journey.  
        We’re committed to keeping your data private and your adventures unforgettable.  
        Here’s how we protect you — every step of the way.
      </motion.p>

      {/* Sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          maxWidth: "1100px",
          width: "100%",
        }}
      >
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
              borderLeft: "6px solid #40E0D0",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(64,224,208,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              {section.icon}
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>{section.title}</h2>
            </div>
            <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.6" }}>{section.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        style={{
          marginTop: "60px",
          background: "#0077b6",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 5px 20px rgba(0, 119, 182, 0.3)",
        }}
      >
        <ArrowLeft size={20} />
        Back
      </motion.button>
    </div>
  );
}
