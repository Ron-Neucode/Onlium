import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/apiService.js";
import "./styles/dashboardadmin.css";

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ applicationId: "", date: "", location: "", notes: "" });

  const loadAppointments = useCallback(async () => {
    try {
      const data = await apiService.getAdminAppointments();
      setError(null);
      setAppointments(data.map(a => ({
        id: a.id,
        studentId: a.studentId,
        name: `${a.lastName}, ${a.firstName}`,
        date: new Date(a.appointmentDate).toISOString().split('T')[0],
        time: new Date(a.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        location: a.location,
        status: a.status,
        applicationId: a.applicationId,
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiService.getAdminAppointments()
      .then((data) => {
        if (!active) return;
        setAppointments(data.map(a => ({
          id: a.id,
          studentId: a.studentId,
          name: `${a.lastName}, ${a.firstName}`,
          date: new Date(a.appointmentDate).toISOString().split("T")[0],
          time: new Date(a.appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          location: a.location,
          status: a.status,
          applicationId: a.applicationId,
        })));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAdd() {
    if (!form.applicationId || !form.date) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    try {
      await apiService.createAppointment({
        applicationId: form.applicationId,
        appointmentDate: new Date(form.date).toISOString(),
        location: form.location || "School Campus",
        notes: form.notes,
      });
      setLoading(true);
      await loadAppointments();
      setShowForm(false);
      setForm({ applicationId: "", date: "", location: "", notes: "" });
      showToast("Appointment added!");
    } catch (err) {
      showToast(err.message || "Failed to create appointment", "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await apiService.updateAppointmentStatus(id, "Cancelled");
      setLoading(true);
      await loadAppointments();
      showToast("Appointment cancelled.", "error");
    } catch (err) {
      showToast(err.message || "Failed to cancel appointment", "error");
    }
  }

  const filtered = appointments.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || String(a.studentId || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Loading appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "14px 20px", borderRadius: 10, background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`, color: toast.type === "error" ? "#dc2626" : "#16a34a", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", borderRadius: 16, padding: "24px 32px", marginBottom: 24, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Appointment</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Walk-In · Cashier Office · Tuition Payment</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          + Add Appointment
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24, maxWidth: 200 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6" }}>{appointments.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 300 }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent" }} />
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                {["DATE", "TIME", "STUDENT", "STUDENT ID", "LOCATION", "STATUS", "ACTIONS"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>No appointments found.</td></tr>
                : filtered.map((a, i) => {
                  return (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", borderRadius: 8, padding: "6px 10px", textAlign: "center", display: "inline-block", color: "#fff", minWidth: 44 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{a.date.split("-")[2]}</div>
                          <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>{new Date(a.date).toLocaleString("en", { month: "short" }).toUpperCase()}</div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", fontWeight: 600 }}>{formatTime(a.time)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{a.name}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{a.studentId || "Not issued"}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{a.location || "School Campus"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                          padding: "4px 10px", 
                          borderRadius: 20, 
                          fontSize: 11, 
                          fontWeight: 700,
                          background: a.status === "Completed" ? "#f0fdf4" : a.status === "Cancelled" ? "#fef2f2" : "#fffbeb",
                          color: a.status === "Completed" ? "#16a34a" : a.status === "Cancelled" ? "#dc2626" : "#d97706",
                          border: `1px solid ${a.status === "Completed" ? "#86efac" : a.status === "Cancelled" ? "#fca5a5" : "#fcd34d"}`
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {!["Completed", "Cancelled"].includes(a.status) && (
                            <button disabled={actionLoading} onClick={() => handleDelete(a.id)} style={{ padding: "5px 9px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>Add Walk-In Appointment</h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Walk-In · Cashier Office · Tuition Payment</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Application ID *</label>
                <input value={form.applicationId} onChange={e => setForm({ ...form, applicationId: e.target.value })} placeholder="Enter approved application ID" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Appointment Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="School Campus" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", resize: "none", height: 60, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={handleAdd} style={{ flex: 1, padding: 12, background: "#3b82f6", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Add Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
