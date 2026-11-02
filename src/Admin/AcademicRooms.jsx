import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/apiService.js";

const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "9px 10px",
  color: "#1e293b",
  background: "#fff",
};

const emptyForm = { roomCode: "", building: "", capacity: "" };

export default function AcademicRooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const formRef = useRef(null);
  const roomCodeInputRef = useRef(null);

  const loadRooms = useCallback(async () => {
    setError("");
    try {
      setRooms(await apiService.getAdminAcademicRooms());
    } catch (requestError) {
      setError(requestError.message || "Unable to load classrooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  function startEditing(room) {
    setEditingId(room.id);
    setForm({
      roomCode: room.roomCode,
      building: room.building || "",
      capacity: room.capacity || "",
    });
    setError("");
    setNotice("");
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      roomCodeInputRef.current?.focus();
    });
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function saveRoom(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    const data = {
      roomCode: form.roomCode.trim(),
      building: form.building.trim() || null,
      capacity: form.capacity === "" ? null : Number(form.capacity),
      isActive: editingId
        ? rooms.find(room => room.id === editingId)?.isActive ?? true
        : true,
    };

    try {
      if (editingId) {
        await apiService.updateAcademicRoom(editingId, data);
        setNotice("Classroom updated.");
      } else {
        await apiService.createAcademicRoom(data);
        setNotice("Classroom added.");
      }
      resetForm();
      await loadRooms();
    } catch (requestError) {
      setError(requestError.message || "Unable to save classroom.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(room) {
    setError("");
    setNotice("");
    setUpdatingId(room.id);
    try {
      await apiService.updateAcademicRoom(room.id, {
        roomCode: room.roomCode,
        building: room.building,
        capacity: room.capacity,
        isActive: !room.isActive,
      });
      setNotice(room.isActive ? "Classroom deactivated." : "Classroom reactivated.");
      await loadRooms();
    } catch (requestError) {
      setError(requestError.message || "Unable to change classroom status.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main style={{ padding: 28, maxWidth: 1200, margin: "0 auto", color: "#1e293b" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Classroom Management</h1>
        <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
          Register rooms for class schedules. Rooms assigned to active section schedules must be reassigned before they can be deactivated.
        </p>
      </header>

      {notice && (
        <div role="status" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, alignItems: "start" }}>
        <form ref={formRef} onSubmit={saveRoom} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>
            {editingId
              ? `Edit classroom${rooms.find(room => room.id === editingId)?.roomCode ? ` · ${rooms.find(room => room.id === editingId).roomCode}` : ""}`
              : "Add a classroom"}
          </h2>
          <label style={{ display: "grid", gap: 5, marginBottom: 12, fontSize: 12, fontWeight: 700 }}>
            Room code / number
            <input ref={roomCodeInputRef} required maxLength={100} style={inputStyle} value={form.roomCode} onChange={event => setForm(current => ({ ...current, roomCode: event.target.value }))} placeholder="e.g. Room 104" />
          </label>
          <label style={{ display: "grid", gap: 5, marginBottom: 12, fontSize: 12, fontWeight: 700 }}>
            Building (optional)
            <input maxLength={100} style={inputStyle} value={form.building} onChange={event => setForm(current => ({ ...current, building: event.target.value }))} placeholder="e.g. Main Building" />
          </label>
          <label style={{ display: "grid", gap: 5, marginBottom: 14, fontSize: 12, fontWeight: 700 }}>
            Capacity (optional)
            <input type="number" min="1" max="10000" style={inputStyle} value={form.capacity} onChange={event => setForm(current => ({ ...current, capacity: event.target.value }))} placeholder="e.g. 40" />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, border: 0, borderRadius: 8, padding: 11, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add classroom"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", background: "#fff", color: "#334155", fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section style={{ minWidth: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>Registered classrooms</h2>
            <Link to="/admin/sections" style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Go to class schedules</Link>
          </div>
          {loading ? (
            <p role="status" style={{ color: "#64748b" }}>Loading classrooms…</p>
          ) : rooms.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>No classrooms have been registered yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "10px 8px" }}>Actions</th>
                    <th style={{ padding: "10px 8px" }}>Room</th>
                    <th style={{ padding: "10px 8px" }}>Building</th>
                    <th style={{ padding: "10px 8px" }}>Capacity</th>
                    <th style={{ padding: "10px 8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 8px", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          aria-label={`Edit ${room.roomCode}`}
                          onClick={() => startEditing(room)}
                          style={{
                            border: "1px solid #2563eb",
                            borderRadius: 6,
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            font: "inherit",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: "7px 12px",
                            minWidth: 56,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === room.id}
                          onClick={() => void toggleActive(room)}
                          style={{
                            display: "block",
                            border: 0,
                            background: "transparent",
                            color: room.isActive ? "#b91c1c" : "#15803d",
                            fontWeight: 700,
                            cursor: updatingId === room.id ? "wait" : "pointer",
                            padding: "6px",
                          }}
                        >
                          {updatingId === room.id ? "Saving…" : room.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                      <td style={{ padding: "11px 8px", fontWeight: 700 }}>{room.roomCode}</td>
                      <td style={{ padding: "11px 8px" }}>{room.building || "—"}</td>
                      <td style={{ padding: "11px 8px" }}>{room.capacity || "—"}</td>
                      <td style={{ padding: "11px 8px" }}>
                        <span style={{ color: room.isActive ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
                          {room.isActive ? "Active" : "Inactive"}
                        </span>
                        {room.activeScheduleCount > 0 && (
                          <span style={{ display: "block", color: "#64748b", fontSize: 11, marginTop: 3 }}>
                            {room.activeScheduleCount} active schedule{room.activeScheduleCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
