// src/components/Signup.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Signup.css";

const BASE_URL = "http://localhost:8083"; // <-- change if your backend runs on a different port

// NOTE: added onSuccess prop so parent (Home.jsx) can be notified immediately after signup/login
export default function Signup({ open, onClose, defaultMode = "signup", onSuccess }) {
  const [mode, setMode] = useState(defaultMode); // "signup" | "login"
  const [password, setPassword] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [strength, setStrength] = useState({ label: "", score: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // New: store list of travels/users and loading/error states
  const [travels, setTravels] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // Load users when modal opens (or refresh)
  useEffect(() => {
    if (!open) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${BASE_URL}/Travel/getAll`);
      if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
      const json = await res.json();
      setTravels(json || []);
    } catch (err) {
      console.error("fetchUsers error:", err);
      setTravels([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Password strength checker (signup)
  useEffect(() => {
    if (!password) {
      setStrength({ label: "", score: 0 });
      return;
    }
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    let label = "Weak";
    if (score >= 3) label = "Medium";
    if (score >= 4) label = "Strong";
    setStrength({ label, score });
  }, [password]);

  if (!open) return null;

  // Signup handler
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
      const res = await fetch(`${BASE_URL}/Travel/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // try to read returned user object (if backend returns it)
        const created = await res.json().catch(() => null);
        console.log("New Travel user added ✅", created);

        // Persist current user if we have an object OR fallback to the submitted data
        let userToSave;
        try {
          userToSave =
            created && (created.email || created.name)
              ? created
              : { name: data.name, email: data.email };
          localStorage.setItem("currentUser", JSON.stringify(userToSave));
        } catch (e) {
          console.warn("Could not save currentUser", e);
          userToSave = { name: data.name, email: data.email };
        }

        // notify parent that signup succeeded so UI can update immediately
        if (typeof onSuccess === "function") {
          try {
            onSuccess(userToSave);
          } catch (err) {
            console.warn("onSuccess callback threw:", err);
          }
        }

        fm.reset(); // clear form fields
        setPassword(""); // clear local password state
       await fetchUsers(); // refresh list shown in modal

// ✅ Instead of closing, switch to login screen automatically
setMode("login");
setPassword("");
setStrength({ label: "", score: 0 });
alert("Account created successfully! Please log in to continue.");

      } else {
        // read error body if available
        const body = await res.json().catch(() => null);
        console.error("Signup failed:", res.status, body);
        alert("Signup failed: " + (body?.error || res.status));
      }
    } catch (err) {
      console.error("Error during signup:", err);
      alert("Network error during signup (see console).");
    } finally {
      setSignupLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const fm = e.currentTarget;
    const data = {
      email: fm.email.value.trim(),
      password: fm.password.value,
    };

    try {
      const res = await fetch(`${BASE_URL}/Travel/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // if your backend returns user JSON, parse it:
        const user = await res.json().catch(() => null);
        console.log("Login success ✅", user);

        // persist current user so other parts of the app (Trips) can show profile
        let userToSave;
        if (user) {
          try {
            localStorage.setItem("currentUser", JSON.stringify(user));
            userToSave = user;
          } catch (e) {
            console.warn("Could not save currentUser", e);
            userToSave = user;
          }
        } else {
          // fallback: store email from the form if backend didn't return user object
          userToSave = { email: data.email };
          try {
            localStorage.setItem("currentUser", JSON.stringify(userToSave));
          } catch (e) {
            console.warn("Could not save fallback currentUser", e);
          }
        }

        // notify parent so Home can update UI immediately
        if (typeof onSuccess === "function") {
          try {
            onSuccess(userToSave);
          } catch (err) {
            console.warn("onSuccess callback threw:", err);
          }
        }

        onClose();
      } else {
        const body = await res.json().catch(() => null);
        console.error("Login failed:", res.status, body);
        alert("Login failed: " + (body?.error || res.status));
      }
    } catch (err) {
      console.error("Error during login:", err);
      alert("Network/CORS error during login (see console).");
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
        <button className="signup-close" onClick={onClose} aria-label="Close signup dialog">
          ✕
        </button>

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
                  <span className="signup-emoji" aria-hidden>
                    🌴
                  </span>
                  <h2>Create Account</h2>
                  <p className="signup-sub">Join TravelForge — curated trips & sweet deals ✨</p>
                </div>

                <form className="signup-form" onSubmit={handleSignup}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <span className="left-icon" aria-hidden>
                        👤
                      </span>
                      <input type="text" name="name" placeholder="John Doe" required autoComplete="name" />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Email</label>
                    <div className="input-wrap">
                      <span className="left-icon" aria-hidden>
                        📧
                      </span>
                      <input type="email" name="email" placeholder="you@example.com" required autoComplete="email" />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="left-icon" aria-hidden>
                        🔒
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••"
                        minLength={6}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        aria-describedby="password-strength"
                      />
                      <button type="button" className="toggle-pw" onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>

                    {strength.label && (
                      <div id="password-strength" className={`strength-meter ${strength.label.toLowerCase()}`} aria-live="polite">
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
                  <button
                    className="signup-link"
                    onClick={() => {
                      setMode("login");
                      setPassword("");
                      setStrength({ label: "", score: 0 });
                    }}
                  >
                    Log In
                  </button>
                </div>

                {/* List of users (optional display inside modal) */}
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
                  <span className="signup-emoji" aria-hidden>
                    ✈️
                  </span>
                  <h2>Welcome Back</h2>
                  <p className="signup-sub">Log in to continue your journey 🌍</p>
                </div>

                <form className="signup-form" onSubmit={handleLogin}>
                  <div className="form-field">
                    <label>Email</label>
                    <div className="input-wrap">
                      <span className="left-icon" aria-hidden>
                        📧
                      </span>
                      <input type="email" name="email" placeholder="you@example.com" required autoComplete="email" />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="left-icon" aria-hidden>
                        🔒
                      </span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••"
                        minLength={6}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
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
                  <button
                    className="signup-link"
                    onClick={() => {
                      setMode("signup");
                      setLoginPassword("");
                    }}
                  >
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
