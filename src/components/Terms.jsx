import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  HeartHandshake,
  Globe2,
  AlertTriangle,
  Lock,
  ScrollText,
  LifeBuoy,
  Handshake,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <FileText color="#0077b6" size={26} />,
      title: "Usage Agreement",
      text: "By accessing TravelForge, you agree to use our platform for lawful, personal travel planning. Unauthorized attempts to disrupt or misuse our services are prohibited.",
    },
    {
      icon: <ShieldCheck color="#38b000" size={26} />,
      title: "Intellectual Property",
      text: "All visuals, code, text, and design elements belong to TravelForge. You may not copy, modify, or reuse any materials without written consent.",
    },
    {
      icon: <HeartHandshake color="#ff914d" size={26} />,
      title: "Community Conduct",
      text: "We foster an atmosphere of respect and creativity. Avoid sharing offensive, misleading, or harmful material. Let’s keep travel joyful and inspiring.",
    },
    {
      icon: <Globe2 color="#ef476f" size={26} />,
      title: "Non-Commercial Use",
      text: "This site is an educational demo only — no real bookings, payments, or personal data transactions take place here.",
    },
    {
      icon: <Lock color="#007f5f" size={26} />,
      title: "Data Protection",
      text: "We respect your digital privacy. No user data is sold, tracked, or shared. Any input you provide is used purely for simulated experience.",
    },
    {
      icon: <Handshake color="#ffb703" size={26} />,
      title: "Third-Party Links",
      text: "External travel resources may be referenced for inspiration. TravelForge does not endorse or verify external content accuracy.",
    },
    {
      icon: <LifeBuoy color="#48cae4" size={26} />,
      title: "Disclaimer of Liability",
      text: "TravelForge is provided 'as is' for demonstration. We are not liable for any inaccuracies or outcomes derived from this experience.",
    },
    {
      icon: <ScrollText color="#c77dff" size={26} />,
      title: "Updates to Terms",
      text: "Our demo terms may evolve over time for clarity and improvement. Changes will be reflected on this page immediately.",
    },
    {
      icon: <AlertTriangle color="#f9c74f" size={26} />,
      title: "Acceptance",
      text: "By continuing to use this website, you acknowledge and accept these demo terms while exploring TravelForge.",
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
        Terms & Conditions 📜
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          maxWidth: "700px",
          textAlign: "center",
          color: "#555",
          fontSize: "17px",
          lineHeight: "1.7",
          marginBottom: "50px",
        }}
      >
        Welcome to <strong style={{ color: "#0077b6" }}>TravelForge</strong> — a creative travel demo experience.
        These terms outline the principles for using our educational platform responsibly and joyfully.
      </motion.p>

      {/* Terms Section Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "28px",
          maxWidth: "1100px",
          width: "100%",
        }}
      >
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
              borderLeft: `6px solid ${
                ["#40E0D0", "#FFA62B", "#4CAF50", "#0077b6"][i % 4]
              }`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 12px 30px rgba(64,224,208,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0,0,0,0.05)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              {section.icon}
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>
                {section.title}
              </h2>
            </div>
            <p
              style={{
                color: "#555",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              {section.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: "70px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          style={{
            background: "linear-gradient(90deg, #40E0D0, #0077b6)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "14px 28px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 119, 182, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
          }}
        >
          <ArrowLeft size={20} />
          Back
        </motion.button>
      </motion.div>
    </div>
  );
}
