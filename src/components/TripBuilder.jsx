// src/components/TripBuilder.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  IndianRupee,
  Users,
  Luggage,
  Notebook,
  Plane,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Trips.css";

/** Ultimate Travel OS — Full-screen Builder */
export default function TripBuilder({ onClose, onCreate }) {
  const navigate = useNavigate();

  const [active, setActive] = useState("overview");
  const [destination, setDestination] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(60000);
  const [tripType, setTripType] = useState("balanced");

  const [days, setDays] = useState([{ day: 1, title: "Arrival & easy walk" }]);
  const [stayCost, setStayCost] = useState(32000);
  const [foodCost, setFoodCost] = useState(12000);
  const [transportCost, setTransportCost] = useState(8000);
  const [activityCost, setActivityCost] = useState(6000);
  const [packing, setPacking] = useState([
    "Passport",
    "Power bank",
    "Comfortable shoes",
    "Sunscreen",
  ]);
  const [notes, setNotes] = useState("");

  /** Auto date range display */
  const dateRange = useMemo(() => {
    if (!dateStart && !dateEnd) return "";
    if (dateStart && !dateEnd) return `From ${dateStart}`;
    if (!dateStart && dateEnd) return `Until ${dateEnd}`;
    return `${dateStart} – ${dateEnd}`;
  }, [dateStart, dateEnd]);

  /** Auto cost total */
  const estimatedCost = useMemo(
    () =>
      Number(stayCost || 0) +
      Number(foodCost || 0) +
      Number(transportCost || 0) +
      Number(activityCost || 0),
    [stayCost, foodCost, transportCost, activityCost]
  );

  /** Auto tags */
  const tags = useMemo(() => {
    const arr = [];
    if (tripType) arr.push(tripType);
    if (Number(budget) <= 40000) arr.push("budget");
    if (Number(budget) >= 120000) arr.push("luxury");
    return arr;
  }, [tripType, budget]);

  /** Add new day */
  const addDay = () =>
    setDays((d) => [...d, { day: d.length + 1, title: `Day ${d.length + 1} — add plan` }]);

  /** Remove a day */
  const removeDay = (n) =>
    setDays((d) => d.filter((x) => x.day !== n).map((x, i) => ({ ...x, day: i + 1 })));

  // ✅ FIXED — WORKING createTrip()
  const createTrip = () => {
    if (!destination.trim()) {
      alert("Please enter a destination first!");
      return;
    }

    const newTrip = {
      title: `${destination} • ${tripType[0].toUpperCase() + tripType.slice(1)}`,
      destination,
      dateRange,
      tripType,
      travelers,
      estimatedCost,
      budget,
      tags,
      days: days.map((d) => d.title),
    };

    fetch("http://localhost:8084/trip/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip),
    })
      .then((res) => res.json())
      .then((savedTrip) => {
        console.log("✅ Trip saved:", savedTrip);

        if (onCreate) onCreate(savedTrip); // ✅ fixed variable name
        onClose();                        // ✅ close popup
        navigate("/trips");               // ✅ lowercase route redirect
      })
      .catch((err) => console.error("❌ Error creating trip:", err));
  };

  return (
    <div className="tb-backdrop" onMouseDown={onClose}>
      <motion.div
        className="tb-shell"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Top bar */}
        <div className="tb-top">
          <button className="tb-link" onClick={onClose}>
            ← Cancel
          </button>
          <div className="tb-title">Trip Planner</div>
          <button className="tb-primary" onClick={createTrip}>
            ✨ Create Trip
          </button>
        </div>

        {/* Tabs */}
        <div className="tb-tabs">
          {[
            { key: "overview", label: "Overview", icon: <Plane size={14} /> },
            { key: "days", label: "Days", icon: <Calendar size={14} /> },
            { key: "costs", label: "Costs", icon: <IndianRupee size={14} /> },
            { key: "packing", label: "Packing", icon: <Luggage size={14} /> },
            { key: "notes", label: "Notes", icon: <Notebook size={14} /> },
          ].map((t) => (
            <button
              key={t.key}
              className={`tb-tab ${active === t.key ? "active" : ""}`}
              onClick={() => setActive(t.key)}
            >
              <span className="icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="tb-body">
          <AnimatePresence mode="wait">
            {/* Overview tab */}
            {active === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="tb-panel"
              >
                <div className="grid2">
                  <div className="field">
                    <label>Destination</label>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Kyoto, Goa, Santorini"
                    />
                  </div>
                  <div className="field">
                    <label>Trip Type</label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                    >
                      <option value="balanced">Balanced</option>
                      <option value="beach">Beach</option>
                      <option value="adventure">Adventure</option>
                      <option value="romance">Romance</option>
                      <option value="culture">Culture</option>
                      <option value="foodie">Foodie</option>
                      <option value="party">Party</option>
                    </select>
                  </div>
                </div>

                <div className="grid3">
                  <div className="field">
                    <label>Start</label>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>End</label>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Travelers</label>
                    <div className="row">
                      <Users size={14} />
                      <input
                        type="number"
                        min="1"
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label>Budget (INR)</label>
                    <div className="row">
                      <IndianRupee size={14} />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Date Range</label>
                    <div className="readonly">{dateRange || "—"}</div>
                  </div>
                </div>

                <div className="hint">
                  Tip: Choose shoulder months for cheaper stays and comfy weather.
                </div>
              </motion.div>
            )}

            {/* Days tab */}
            {active === "days" && (
              <motion.div
                key="days"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="tb-panel"
              >
                <div className="days-list">
                  {days.map((d) => (
                    <div key={d.day} className="day-row">
                      <div className="bubble">Day {d.day}</div>
                      <input
                        value={d.title}
                        onChange={(e) =>
                          setDays((arr) =>
                            arr.map((x) =>
                              x.day === d.day
                                ? { ...x, title: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                      <button
                        className="btn-ghost small"
                        onClick={() => removeDay(d.day)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={addDay}>
                  + Add day
                </button>
              </motion.div>
            )}

            {/* Costs tab */}
            {active === "costs" && (
              <motion.div
                key="costs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="tb-panel"
              >
                <div className="grid2">
                  <div className="field">
                    <label>Stay</label>
                    <input
                      type="number"
                      value={stayCost}
                      onChange={(e) => setStayCost(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Food</label>
                    <input
                      type="number"
                      value={foodCost}
                      onChange={(e) => setFoodCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label>Transport</label>
                    <input
                      type="number"
                      value={transportCost}
                      onChange={(e) => setTransportCost(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Activities</label>
                    <input
                      type="number"
                      value={activityCost}
                      onChange={(e) => setActivityCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="total-box">
                  Estimated Total:{" "}
                  <strong>
                    ₹{" "}
                    {Number(stayCost) +
                      Number(foodCost) +
                      Number(transportCost) +
                      Number(activityCost)}
                  </strong>
                </div>
              </motion.div>
            )}

            {/* Packing tab */}
            {active === "packing" && (
              <motion.div
                key="packing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="tb-panel"
              >
                <div className="chips">
                  {packing.map((p, i) => (
                    <span key={i} className="chip">
                      {p}{" "}
                      <button
                        className="x"
                        onClick={() =>
                          setPacking((arr) =>
                            arr.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="row">
                  <input
                    placeholder="Add item…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        setPacking((arr) => [...arr, e.currentTarget.value.trim()]);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <button
                    className="btn-ghost"
                    onClick={(e) => {
                      const inp = e.currentTarget.previousSibling;
                      if (inp.value.trim()) {
                        setPacking((arr) => [...arr, inp.value.trim()]);
                        inp.value = "";
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notes tab */}
            {active === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="tb-panel"
              >
                <textarea
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special plans, bookings, or reminders…"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
