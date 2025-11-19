// src/components/Signup.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Signup.css";
import { API_BASE } from "../api/apiConfig";

//const BASE_URL = "http://localhost:8084";

export default function Signup({ open, onClose, defaultMode = "signup", onSuccess }) {
  const [mode, setMode] = useState(defaultMode);
  const [password, setPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [strength, setStrength] = useState({ label: "", score: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [travels, setTravels] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/Travel/getAll`);
      const json = await res.json();
      setTravels(json || []);
    } catch {
      setTravels([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Password strength checker
  useEffect(() => {
    if (!password) return setStrength({ label: "", score: 0 });

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength({
      score,
      label: score >= 4 ? "Strong" : score >= 3 ? "Medium" : "Weak",
    });
  }, [password]);

  if (!open) return null;

  // ✅ Signup handler (no auto-login)
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    const fm = e.currentTarget;
    const data = {
      name: fm.name.value.trim(),
      email: fm.email.value.trim(),
      password: fm.password.value,
    };

    try {
      const res = await fetch(`${API_BASE}/Travel/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        fm.reset();
        setPassword("");
        await fetchUsers();
        setMode("login");
        setStrength({ label: "", score: 0 });
        alert("Account created successfully! Please log in to continue.");
      } else {
        const body = await res.json().catch(() => null);
        alert("Signup failed: " + (body?.error || res.status));
      }
    } catch {
      alert("Network error during signup");
    } finally {
      setSignupLoading(false);
    }
  };

  // ✅ Login handler (validates user properly)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const fm = e.currentTarget;
    const data = {
      email: fm.email.value.trim(),
      password: fm.password.value,
    };

    try {
      const res = await fetch(`${API_BASE}/Travel/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Invalid email or password");
        setLoginLoading(false);
        return;
      }

      const user = await res.json().catch(() => null);

      if (!user || !user.email) {
        alert("Invalid email or password");
        setLoginLoading(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));

      if (typeof onSuccess === "function") onSuccess(user);

      onClose();
    } catch {
      alert("Network/CORS error during login");
    } finally {
      setLoginLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="signup-overlay"
      onMouseDown={(e) => {
        if (e.target.classList.contains("signup-overlay")) onClose();
      }}
    >
      <motion.div
        className={`signup-card ${mode}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28 }}
      >
        <button className="signup-close" onClick={onClose}>✕</button>

        <div className="card-inner">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="signup"
                className="form-wrap"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="signup-header">
                  <span className="signup-emoji">🌴</span>
                  <h2>Create Account</h2>
                  <p className="signup-sub">Join TravelForge — curated trips & sweet deals ✨</p>
                </div>

                <form className="signup-form" onSubmit={handleSignup}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <span className="left-icon">👤</span>
                      <input type="text" name="name" placeholder="John Doe" required />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Email</label>
                    <div className="input-wrap">
                      <span className="left-icon">📧</span>
                      <input type="email" name="email" placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="left-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••"
                        minLength={6}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" className="toggle-pw" onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>

                    {strength.label && (
                      <div className={`strength-meter ${strength.label.toLowerCase()}`}>
                        <div className="strength-bar" style={{ width: `${strength.score * 25}%` }} />
                        <span className="strength-text">{strength.label}</span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="signup-submit" disabled={signupLoading}>
                    {signupLoading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                <div className="signup-footer">
                  Already have an account?{" "}
                  <button className="signup-link" onClick={() => setMode("login")}>
                    Log In
                  </button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <h4 style={{ margin: "12px 0 8px" }}>Existing users</h4>
                  {loadingUsers ? (
                    <div style={{ fontSize: 13, color: "#666" }}>Loading users...</div>
                  ) : travels.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#666" }}>No users yet</div>
                  ) : (
                    <ul style={{ maxHeight: 160, overflowY: "auto", paddingLeft: 16 }}>
                      {travels.map((t) => (
                        <li key={t.id} style={{ marginBottom: 6 }}>
                          <strong>{t.name}</strong> — {t.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}

            {mode === "login" && (
              <motion.div
                key="login"
                className="form-wrap"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="signup-header">
                  <span className="signup-emoji">✈️</span>
                  <h2>Welcome Back</h2>
                  <p className="signup-sub">Log in to continue your journey 🌍</p>
                </div>

                <form className="signup-form" onSubmit={handleLogin}>
                  <div className="form-field">
                    <label>Email</label>
                    <div className="input-wrap">
                      <span className="left-icon">📧</span>
                      <input type="email" name="email" placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="left-icon">🔒</span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••"
                        minLength={6}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button type="button" className="toggle-pw" onClick={() => setShowLoginPassword((s) => !s)}>
                        {showLoginPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="signup-submit" disabled={loginLoading}>
                    {loginLoading ? "Logging in..." : "Log In"}
                  </button>
                </form>

                <div className="signup-footer">
                  Don’t have an account?{" "}
                  <button className="signup-link" onClick={() => setMode("signup")}>
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
