// src/components/BudgetDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./BudgetPlanner.css";

/*
  Full final single-file BudgetDashboard.jsx (Option A)
  - Light-only theme (no dark)
  - Pages: dashboard / plans / reports / settings
  - Plans: create / apply / delete (Apply immediately updates goal + category limits and navigates to Dashboard)
  - Reports: bar + pie + table + export
  - Settings: reset/export/import, currency, colors overview
  - No overlapping, responsive layout (relies on BudgetPlanner.css)
*/

const CATEGORY_COLORS = {
  Transport: "#3ee3c6",
  Food: "#ffd166",
  Accommodation: "#9b5cff",
  Activities: "#ff7b7b",
  Shopping: "#7bd389",
  Other: "#7aa2ff",
};

const STORAGE_KEY = "bd_budget_dash_v1";
const TEMPLATE_KEY = "bd_budget_templates_v1";
const LIMITS_KEY = "bd_budget_limits_v1";
const PLANS_KEY = "bd_budget_plans_v1";
const SETTINGS_KEY = "bd_budget_settings_v1";

function fmtCurrency(n = 0, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${Number(n).toLocaleString()}`;
  }
}
function nowISODate() {
  return new Date().toISOString().slice(0, 10);
}
function downloadBlob(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* small topbar icon button */
function IconButton({ children, title, onClick, small }) {
  return (
    <button className={`bd-icon-btn ${small ? "small" : ""}`} title={title} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export default function BudgetDashboard() {
  const nameRef = useRef(null);
  const [page, setPage] = useState("dashboard");

  // settings (light-only)
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { currency: "USD" };
  });
  const [currency, setCurrency] = useState(settings.currency || "USD");

  // core app state
  const [goal, setGoal] = useState(1500);
  const [buffer, setBuffer] = useState(15);

  const [expenses, setExpenses] = useState(() => {
    const seed = [
      { id: 1, name: "Flight (est)", amount: 420, category: "Transport", date: "2025-10-11", recurring: false },
      { id: 2, name: "Hotel (4 nights)", amount: 360, category: "Accommodation", date: "2025-10-12", recurring: false },
      { id: 3, name: "Food & Snacks", amount: 150, category: "Food", date: "2025-10-13", recurring: false },
    ];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).expenses ?? seed;
    } catch {}
    return seed;
  });

  const [templates, setTemplates] = useState(() => {
    try { const r = localStorage.getItem(TEMPLATE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [categoryLimits, setCategoryLimits] = useState(() => {
    try { const r = localStorage.getItem(LIMITS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
  });
  const [plans, setPlans] = useState(() => {
    try { const r = localStorage.getItem(PLANS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });

  // form states
  const [form, setForm] = useState({ name: "", amount: "", category: "Transport", date: nowISODate(), recurring: false });
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [editingId, setEditingId] = useState(null);

  // plan form
  const [planForm, setPlanForm] = useState({
    name: "",
    budget: "",
    start: nowISODate(),
    end: nowISODate(),
    limits: {},
  });

  // persist core items
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ expenses, updatedAt: new Date().toISOString() })); } catch {}
  }, [expenses]);

  useEffect(() => {
    try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates)); } catch {}
  }, [templates]);

  useEffect(() => {
    try { localStorage.setItem(LIMITS_KEY, JSON.stringify(categoryLimits)); } catch {}
  }, [categoryLimits]);

  useEffect(() => {
    try { localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); } catch {}
  }, [plans]);

  useEffect(() => {
    const next = { ...settings, currency };
    setSettings(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
  }, [currency]);

  // derived values
  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const projected = Math.round(total * (1 + buffer / 100));
  const progress = Math.min(100, Math.round((total / (goal || 1)) * 100));
  const recurringCount = expenses.filter(e => e.recurring).length;

  const breakdown = useMemo(() => {
    const map = {};
    Object.keys(CATEGORY_COLORS).forEach(c => (map[c] = 0));
    expenses.forEach(e => (map[e.category] = (map[e.category] || 0) + Number(e.amount || 0)));
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const t = {};
    Object.keys(CATEGORY_COLORS).forEach(k => (t[k] = 0));
    expenses.forEach(e => (t[e.category] = (t[e.category] || 0) + Number(e.amount || 0)));
    return t;
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    const ft = filterText.trim().toLowerCase();
    let arr = expenses.filter(e => !ft || e.name.toLowerCase().includes(ft) || e.category.toLowerCase().includes(ft) || e.date.includes(ft));
    if (sortBy === "newest") arr = arr.sort((a,b) => b.id - a.id);
    if (sortBy === "oldest") arr = arr.sort((a,b) => a.id - b.id);
    if (sortBy === "amt-high") arr = arr.sort((a,b) => b.amount - a.amount);
    if (sortBy === "amt-low") arr = arr.sort((a,b) => a.amount - b.amount);
    return arr;
  }, [expenses, filterText, sortBy]);

  /* ---------- Expense actions ---------- */
  function addExpense() {
    if (!form.name || !form.amount || Number(form.amount) <= 0) { alert("Provide a name and positive amount."); return; }
    const newItem = { id: Date.now(), name: form.name.trim(), amount: Number(form.amount), category: form.category, date: form.date, recurring: !!form.recurring };
    setExpenses(s => [newItem, ...s]);
    setForm({ ...form, name: "", amount: "", recurring: false });
  }
  function removeExpense(id) { if (!confirm("Delete this expense?")) return; setExpenses(s => s.filter(x => x.id !== id)); }
  function startEdit(e) { setEditingId(e.id); setForm({ name: e.name, amount: e.amount, category: e.category, date: e.date, recurring: e.recurring }); nameRef.current?.focus(); }
  function saveEdit() { if (!editingId) return; setExpenses(s => s.map(it => (it.id === editingId ? { ...it, ...form, amount: Number(form.amount) } : it))); setEditingId(null); setForm({ name: "", amount: "", category: "Transport", date: nowISODate(), recurring: false }); }

  /* ---------- Exports ---------- */
  function exportCSV(rows = expenses, filename = `budget-${new Date().toISOString().slice(0,10)}.csv`) {
    const header = ["Name","Amount","Category","Date","Recurring"];
    const mapRows = rows.map(e => [e.name, e.amount, e.category, e.date, e.recurring ? "Yes" : "No"]);
    const csv = [header, ...mapRows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    downloadBlob(filename, csv, "text/csv");
  }
  function exportJSON(data = { expenses, goal, currency, buffer }, filename = `budget-${new Date().toISOString().slice(0,10)}.json`) {
    downloadBlob(filename, JSON.stringify(data, null, 2), "application/json");
  }
  function exportPDF(rows = expenses, title = "Budget Report") {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(18); doc.text(title, 40, 50);
    doc.setFontSize(11); doc.text(`Goal: ${fmtCurrency(goal,currency)}  Total: ${fmtCurrency(total,currency)}`, 40, 70);
    const tbl = rows.map(e => [e.name, fmtCurrency(e.amount,currency), e.category, e.date, e.recurring ? "Yes" : "No"]);
    doc.autoTable({ startY: 100, head: [["Name","Amount","Category","Date","Recurring"]], body: tbl, theme: "grid" });
    doc.save(`${title.replace(/\s+/g,'-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  /* ---------- Templates ---------- */
  function saveTemplate(name) {
    if (!name) return alert("Give template name");
    const tpl = { id: Date.now(), name, createdAt: new Date().toISOString(), expenses, goal, currency, buffer };
    const next = [tpl, ...templates].slice(0, 20);
    setTemplates(next); localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next)); alert("Template saved");
  }
  function loadTemplate(id) {
    const tpl = templates.find(t => t.id === id); if (!tpl) return;
    setExpenses(tpl.expenses || []); setGoal(tpl.goal || 0); setCurrency(tpl.currency || "USD"); setBuffer(tpl.buffer || 0); alert(`Loaded: ${tpl.name}`);
  }
  function deleteTemplate(id) { if (!confirm("Delete template?")) return; setTemplates(ts => ts.filter(t => t.id !== id)); localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates.filter(t => t.id !== id))); }

  /* ---------- Plans (A) ---------- */
  function createPlan() {
    if (!planForm.name || !planForm.budget) return alert("Plan requires name and budget");
    const plan = {
      id: Date.now(),
      name: planForm.name,
      budget: Number(planForm.budget),
      start: planForm.start,
      end: planForm.end,
      limits: { ...(planForm.limits || {}) }
    };
    setPlans(p => [plan, ...p]);
    setPlanForm({ name: "", budget: "", start: nowISODate(), end: nowISODate(), limits: {} });
    alert("Plan created");
  }
  function deletePlan(id) { if (!confirm("Delete plan?")) return setPlans(p => p.filter(x => x.id !== id)); }

  // IMPORTANT: When applying a plan we MUST clone the limits object to force React re-render
  function applyPlan(id) {
  const p = plans.find(x => x.id === id);
  if (!p) return;
  setGoal(p.budget || 0);
  const updatedLimits = { ...(p.limits || {}) };
  setCategoryLimits(updatedLimits);
  try { localStorage.setItem(LIMITS_KEY, JSON.stringify(updatedLimits)); } catch {}
  setPage("dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
  alert(`Applied plan: ${p.name}`);
}

  function planSetLimit(cat, val) {
    setPlanForm(f => ({ ...f, limits: { ...f.limits, [cat]: val ? Number(val) : 0 } }));
  }

  /* ---------- Settings actions ---------- */
  function resetAllData() {
    if (!confirm("Reset all data (expenses, templates, plans, settings)?")) return;
    setExpenses([]); setTemplates([]); setPlans([]); setCategoryLimits({}); setGoal(0); setBuffer(0);
    localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(TEMPLATE_KEY); localStorage.removeItem(PLANS_KEY); localStorage.removeItem(LIMITS_KEY); localStorage.removeItem(SETTINGS_KEY);
    alert("All data reset");
  }
  function resetExpenses() { if (!confirm("Reset only expenses?")) return; setExpenses([]); localStorage.setItem(STORAGE_KEY, JSON.stringify({ expenses: [] })); alert("Expenses reset"); }
  function resetTemplates() { if (!confirm("Reset templates?")) return; setTemplates([]); localStorage.removeItem(TEMPLATE_KEY); alert("Templates reset"); }

  function exportBackup() {
    const data = { expenses, templates, plans, categoryLimits, goal, buffer, settings };
    exportJSON(data, `budget-backup-${new Date().toISOString().slice(0,10)}.json`);
  }
  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.expenses) setExpenses(json.expenses);
        if (json.templates) setTemplates(json.templates);
        if (json.plans) setPlans(json.plans);
        if (json.categoryLimits) setCategoryLimits(json.categoryLimits);
        if (json.goal) setGoal(json.goal);
        if (json.buffer) setBuffer(json.buffer);
        if (json.settings) { setSettings(json.settings); setCurrency(json.settings.currency || "USD"); }
        alert("Backup imported");
      } catch (err) { alert("Import failed: invalid file"); }
    };
    reader.readAsText(file);
  }

  const categoryOptions = Object.keys(CATEGORY_COLORS);

  /* ---------- Render UI ---------- */
  return (
    <div className="bd-root" style={{ background: "var(--page-bg, #fbf6ea)" }}>
      <aside className="bd-sidebar" role="navigation" aria-label="Main navigation">
        <div className="bd-logo">Budget<span>Pro</span></div>
        <nav className="bd-nav">
          <button className={`bd-nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Dashboard</button>
          <button className={`bd-nav-item ${page === "plans" ? "active" : ""}`} onClick={() => setPage("plans")}>Plans</button>
          <button className={`bd-nav-item ${page === "reports" ? "active" : ""}`} onClick={() => setPage("reports")}>Reports</button>
          <button className={`bd-nav-item ${page === "settings" ? "active" : ""}`} onClick={() => setPage("settings")}>Settings</button>
        </nav>

        <div className="bd-sidebar-bottom">
          <div className="muted small">Theme</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <IconButton small title="Light (fixed)">☀️</IconButton>
          </div>
        </div>
      </aside>

      <main className="bd-main">
        <header className="bd-topbar" role="banner">
          <div className="bd-topbar-left">
            <h1>Budget Planner</h1>
            <div className="muted">Smart templates • exports • insights</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select className="bd-small-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option>USD</option><option>EUR</option><option>INR</option><option>JPY</option>
            </select>

            <IconButton title="Export CSV" onClick={() => exportCSV()}>CSV</IconButton>
            <IconButton title="Export JSON" onClick={() => exportJSON()}>JSON</IconButton>
            <IconButton title="Export PDF" onClick={() => exportPDF()}>PDF</IconButton>
          </div>
        </header>

        {/* ====== DASHBOARD ====== */}
        {page === "dashboard" && (
          <section className="bd-grid" aria-live="polite">
            <section className="bd-col-left card">
              <h3>New Transaction</h3>
              <div className="form-row">
                <input ref={nameRef} className="bd-input" placeholder="Name (e.g., Local train)" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="bd-input" placeholder={`Amount (${currency})`} value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} type="number"/>
                <select className="bd-input" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="bd-input" type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
                <label className="bd-checkbox"><input type="checkbox" checked={form.recurring} onChange={() => setForm(f => ({ ...f, recurring: !f.recurring }))} /> Recurring</label>

                <div style={{ display: "flex", gap: 8 }}>
                  {editingId ? (
                    <>
                      <button className="bd-btn primary" onClick={saveEdit}>Save</button>
                      <button className="bd-btn" onClick={() => { setEditingId(null); setForm({ name: "", amount: "", category: "Transport", date: nowISODate(), recurring: false }); }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="bd-btn primary" onClick={addExpense}>Add</button>
                      <button className="bd-btn" onClick={() => setForm({ name: "", amount: "", category: "Transport", date: nowISODate(), recurring: false })}>Clear</button>
                    </>
                  )}
                </div>
              </div>

              <div className="card-section">
                <div className="muted">Goal</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <input className="bd-input small" type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div className="muted">Used</div><div style={{ fontWeight: 800 }}>{fmtCurrency(total,currency)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="muted">Buffer</div>
                  <input aria-label="buffer" type="range" min={0} max={50} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} />
                  <div className="muted small">{buffer}% — projected {fmtCurrency(projected,currency)}</div>
                </div>
              </div>

              <div className="card-section">
                <h4>Category limits</h4>
                <div className="limits-grid">
                  {categoryOptions.map(cat => (
                    <div key={cat} className="limit-row">
                      <div className="limit-left">
                        <div className="limit-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                        <div className="limit-name">{cat}</div>
                      </div>
                      <div style={{ minWidth: 160 }}>
                        {/* Controlled input reflecting categoryLimits state */}
                        <input
                          className="bd-input small"
                          placeholder="limit"
                          value={categoryLimits[cat] ?? ""}
                          onChange={(e) => { const v = e.target.value; setCategoryLimits(prev => ({ ...prev, [cat]: v ? Number(v) : 0 })); }}
                        />
                        <div className="muted small" style={{ textAlign: "right", marginTop: 6 }}>{fmtCurrency(categoryTotals[cat] || 0, currency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-section">
                <h4>Templates</h4>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="bd-btn" onClick={() => { const n = prompt("Template name?"); if (n) saveTemplate(n); }}>Save</button>
                  <div className="muted small">({templates.length} saved)</div>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {templates.map(t => (
                    <div key={t.id} className="tpl-chip">
                      <button className="bd-btn ghost" onClick={() => loadTemplate(t.id)}>{t.name}</button>
                      <button className="bd-btn ghost small" onClick={() => { if (confirm("Delete?")) deleteTemplate(t.id); }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right columns */}
            <section className="bd-col-right">
              <div className="grid-right">
                <div className="card card-panel">
                  <h3>Expense Breakdown</h3>
                  <div className="muted">Hover slices to view shares</div>
                  <div style={{ height: 260, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="70%" paddingAngle={6}>
                          {breakdown.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#8884d8"} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="legend-list">
                    {breakdown.length === 0 && <div className="muted">No expenses yet</div>}
                    {breakdown.map(b => {
                      const pct = Math.round((b.value / (total || 1)) * 100);
                      return (
                        <div key={b.name} className="legend-row">
                          <div className="legend-dot" style={{ background: CATEGORY_COLORS[b.name] }} />
                          <div className="legend-meta">
                            <div className="legend-name">{b.name}</div>
                            <div className="muted small">{pct}%</div>
                          </div>
                          <div style={{ marginLeft: "auto", fontWeight: 800 }}>{fmtCurrency(b.value,currency)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card card-panel">
                  <h3>Details & Insights</h3>
                  <div className="muted">Auto-adjust, forecasts & tips</div>

                  <div className="stat-grid">
                    <div className="stat">
                      <div className="muted">Total</div>
                      <div className="stat-figure">{fmtCurrency(total,currency)}</div>
                    </div>
                    <div className="stat">
                      <div className="muted">Goal</div>
                      <div className="stat-figure">{fmtCurrency(goal,currency)}</div>
                    </div>
                    <div className="stat">
                      <div className="muted">Progress</div>
                      <div className="stat-figure">{progress}%</div>
                    </div>
                    <div className="stat">
                      <div className="muted">Forecast</div>
                      <div className="stat-figure">{fmtCurrency(projected,currency)}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <strong>Pro-tip:</strong> {total > goal ? "You're over your goal — consider reducing shopping or activities." : "Save on transport: consider group passes."}
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button className="bd-btn primary" onClick={() => exportCSV()}>Quick Export CSV</button>
                    <button className="bd-btn" onClick={() => exportJSON()}>Quick Export JSON</button>
                    <button className="bd-btn" onClick={() => exportPDF()}>Download PDF</button>
                  </div>
                </div>
              </div>

              {/* Transactions list */}
              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Transactions</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input className="bd-input small" placeholder="Search..." value={filterText} onChange={(e) => setFilterText(e.target.value)} />
                    <select className="bd-small-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="amt-high">Amount high→low</option>
                      <option value="amt-low">Amount low→high</option>
                    </select>
                  </div>
                </div>

                <div className="transactions-list">
                  {visibleExpenses.length === 0 && <div className="muted">No transactions</div>}
                  {visibleExpenses.map(e => (
                    <div key={e.id} className="transaction-row">
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div className="avatar" style={{ background: CATEGORY_COLORS[e.category] }}>{e.category[0]}</div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{e.name}</div>
                          <div className="muted small">{e.date} • {e.category} {e.recurring ? "• Recurring" : ""}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 800 }}>{fmtCurrency(e.amount,currency)}</div>
                        <button className="bd-btn" onClick={() => startEdit(e)}>Edit</button>
                        <button className="bd-btn ghost" onClick={() => removeExpense(e.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </section>
        )}

        {/* ====== PLANS ====== */}
        {page === "plans" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card">
              <h2>Create Plan</h2>
              <div style={{ display: "grid", gap: 8 }}>
                <input className="bd-input" placeholder="Plan name" value={planForm.name} onChange={(e) => setPlanForm(f => ({ ...f, name: e.target.value }))} />
                <input className="bd-input" placeholder="Budget amount" value={planForm.budget} onChange={(e) => setPlanForm(f => ({ ...f, budget: e.target.value }))} type="number" />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="bd-input small" type="date" value={planForm.start} onChange={(e) => setPlanForm(f => ({ ...f, start: e.target.value }))} />
                  <input className="bd-input small" type="date" value={planForm.end} onChange={(e) => setPlanForm(f => ({ ...f, end: e.target.value }))} />
                </div>

                <div>
                  <div className="muted">Category limits</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {categoryOptions.map(cat => (
                      <div key={cat} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 6, background: CATEGORY_COLORS[cat] }} />
                        <div style={{ flex: 1 }}>{cat}</div>
                        <input className="bd-input small" placeholder="limit" value={planForm.limits[cat] ?? ""} onChange={(e) => planSetLimit(cat, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="bd-btn primary" onClick={createPlan}>Create Plan</button>
                  <button className="bd-btn" onClick={() => setPlanForm({ name: "", budget: "", start: nowISODate(), end: nowISODate(), limits: {} })}>Clear</button>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Your Plans</h2>
              {plans.length === 0 && <div className="muted">No plans yet</div>}
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {plans.map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div className="muted small">{p.start} → {p.end}</div>
                      <div className="muted small">Budget: {fmtCurrency(p.budget,currency)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="bd-btn" onClick={() => applyPlan(p.id)}>Apply</button>
                      <button className="bd-btn ghost" onClick={() => deletePlan(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====== REPORTS ====== */}
        {page === "reports" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card">
              <h2>Visual Reports</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12 }}>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakdown.map(b => ({ name: b.name, value: b.value }))}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {breakdown.map((b, i) => <Cell key={i} fill={CATEGORY_COLORS[b.name]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="70%">
                        {breakdown.map((b, i) => <Cell key={i} fill={CATEGORY_COLORS[b.name]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="bd-btn primary" onClick={() => exportPDF(expenses, "Full Budget Report")}>Export PDF</button>
                <button className="bd-btn" onClick={() => exportCSV(expenses, `report-${new Date().toISOString().slice(0,10)}.csv`)}>Export CSV</button>
                <button className="bd-btn" onClick={() => exportJSON({ expenses, breakdown, categoryTotals }, `report-${new Date().toISOString().slice(0,10)}.json`)}>Export JSON</button>
              </div>
            </div>

            <div className="card">
              <h2>Table Reports</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", padding:8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Name</th>
                      <th style={{ textAlign:"right", padding:8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Amount</th>
                      <th style={{ textAlign:"left", padding:8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Category</th>
                      <th style={{ textAlign:"left", padding:8, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td style={{ padding:8, borderBottom: "1px solid rgba(0,0,0,0.03)" }}>{e.name}</td>
                        <td style={{ padding:8, textAlign:"right", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>{fmtCurrency(e.amount,currency)}</td>
                        <td style={{ padding:8, borderBottom: "1px solid rgba(0,0,0,0.03)" }}>{e.category}</td>
                        <td style={{ padding:8, borderBottom: "1px solid rgba(0,0,0,0.03)" }}>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="bd-btn" onClick={() => exportCSV(expenses, `table-report-${new Date().toISOString().slice(0,10)}.csv`)}>Export CSV</button>
                <button className="bd-btn" onClick={() => exportJSON({ expenses }, `table-report-${new Date().toISOString().slice(0,10)}.json`)}>Export JSON</button>
                <button className="bd-btn" onClick={() => exportPDF(expenses, "Table Report")}>Export PDF</button>
              </div>
            </div>
          </div>
        )}

        {/* ====== SETTINGS ====== */}
        {page === "settings" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card">
              <h2>Settings</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label className="muted small">Default currency</label>
                  <select className="bd-small-select" value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ marginTop: 8 }}>
                    <option>USD</option><option>EUR</option><option>INR</option><option>JPY</option>
                  </select>
                </div>

                <div>
                  <div className="muted small">Data controls</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="bd-btn" onClick={resetExpenses}>Reset expenses</button>
                    <button className="bd-btn" onClick={resetTemplates}>Reset templates</button>
                    <button className="bd-btn" onClick={resetAllData}>Reset everything</button>
                  </div>
                </div>

                <div>
                  <div className="muted small">Backup / Restore</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="bd-btn" onClick={exportBackup}>Export backup (JSON)</button>

                    <label className="bd-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      Import backup
                      <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importBackup(e.target.files?.[0])} />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="muted small">Category colors</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {Object.keys(CATEGORY_COLORS).map(c => (
                      <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: CATEGORY_COLORS[c] }} />
                        <div className="muted small">{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
