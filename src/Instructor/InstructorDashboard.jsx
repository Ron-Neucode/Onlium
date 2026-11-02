import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService.js";
import { apiService } from "../services/apiService.js";

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 18,
};

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function classLabel(item) {
  return `${item.subjectCode} · ${item.sectionCode}`;
}

export default function InstructorDashboard() {
  const user = authService.getUserSession();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [attendanceDate, setAttendanceDate] = useState(localDateValue());
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    sectionStudyLoadId: "",
    title: "",
    description: "",
    eventDate: localDateValue(),
  });
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedClass = classes.find(item => item.id === selectedClassId) || null;

  const loadPortal = useCallback(async () => {
    try {
      const [classData, announcementData] = await Promise.all([
        apiService.getInstructorClasses(),
        apiService.getInstructorAnnouncements(),
      ]);
      setError("");
      setClasses(classData);
      setAnnouncements(announcementData);
      setSelectedClassId(current => classData.some(item => item.id === current)
        ? current
        : classData[0]?.id || "");
      setAnnouncementForm(current => ({
        ...current,
        sectionStudyLoadId: classData.some(item => item.id === current.sectionStudyLoadId)
          ? current.sectionStudyLoadId
          : classData[0]?.id || "",
      }));
    } catch (requestError) {
      setError(requestError.message || "Unable to load instructor portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect starts the portal's asynchronous initial data request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPortal();
  }, [loadPortal]);

  useEffect(() => {
    if (activeTab !== "attendance" || !selectedClassId || !attendanceDate) {
      return;
    }
    let active = true;
    // This effect owns loading state for its cancellable attendance request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendanceLoading(true);
    setError("");
    apiService.getInstructorAttendance(selectedClassId, attendanceDate)
      .then(result => {
        if (active) setAttendanceStudents(result.students);
      })
      .catch(requestError => {
        if (active) {
          setAttendanceStudents([]);
          setError(requestError.message || "Unable to load class attendance.");
        }
      })
      .finally(() => {
        if (active) setAttendanceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, attendanceDate, selectedClassId]);

  const visibleAttendanceStudents = selectedClassId && attendanceDate ? attendanceStudents : [];
  const allStudentsMarked =
    visibleAttendanceStudents.length > 0 &&
    visibleAttendanceStudents.every(student => ["Present", "Absent", "Late", "Excused"].includes(student.status));

  function updateAttendance(studentId, field, value) {
    setAttendanceStudents(current => current.map(student => student.studentId === studentId
      ? { ...student, [field]: value }
      : student));
  }

  async function saveAttendance() {
    if (!selectedClass || !allStudentsMarked) {
      setError("Mark attendance for every enrolled student before saving.");
      return;
    }
    setError("");
    setNotice("");
    setSavingAttendance(true);
    try {
      const result = await apiService.saveInstructorAttendance(selectedClass.id, {
        date: attendanceDate,
        students: attendanceStudents.map(student => ({
          studentId: student.studentId,
          status: student.status,
          notes: student.notes || null,
        })),
      });
      setNotice(result.message || "Attendance saved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save class attendance.");
    } finally {
      setSavingAttendance(false);
    }
  }

  async function publishAnnouncement(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingAnnouncement(true);
    try {
      const result = await apiService.createInstructorAnnouncement(announcementForm);
      setNotice(result.message || "Class announcement published.");
      setAnnouncementForm(current => ({
        ...current,
        title: "",
        description: "",
      }));
      setAnnouncements(await apiService.getInstructorAnnouncements());
    } catch (requestError) {
      setError(requestError.message || "Unable to publish class announcement.");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  function logout() {
    authService.clearUserSession();
    window.location.assign("/register/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#1e293b" }}>
      <header style={{ background: "#1e40af", color: "#fff", padding: "18px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: 20 }}>ONLIUM · Instructor Portal</strong>
          <div style={{ color: "#dbeafe", fontSize: 13, marginTop: 4 }}>{user?.fullName || user?.email}</div>
        </div>
        <button type="button" onClick={logout} style={{ border: "1px solid #93c5fd", borderRadius: 7, padding: "8px 13px", background: "transparent", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Log out</button>
      </header>

      <main style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <nav aria-label="Instructor sections" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            ["classes", "My Classes"],
            ["attendance", "Attendance"],
            ["announcements", "Class Announcements"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => { setActiveTab(id); setError(""); setNotice(""); }} style={{ border: activeTab === id ? "1px solid #2563eb" : "1px solid #cbd5e1", borderRadius: 8, padding: "10px 15px", background: activeTab === id ? "#eff6ff" : "#fff", color: activeTab === id ? "#1d4ed8" : "#475569", fontWeight: 700, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </nav>

        {notice && <div role="status" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 9, padding: 12, marginBottom: 14 }}>{notice}</div>}
        {error && <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 9, padding: 12, marginBottom: 14 }}>{error}</div>}
        {loading ? (
          <p role="status">Loading your assigned classes…</p>
        ) : classes.length === 0 ? (
          <section style={cardStyle}>
            <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>No classes assigned yet</h1>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>Your instructor account is active, but the administrator has not assigned you to a section schedule yet.</p>
          </section>
        ) : activeTab === "classes" ? (
          <section>
            <h1 style={{ margin: "0 0 14px", fontSize: 22 }}>My Assigned Classes</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 14 }}>
              {classes.map(item => (
                <article key={item.id} style={cardStyle}>
                  <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{item.subjectCode} · {item.sectionCode}</h2>
                  <p style={{ margin: "0 0 10px", color: "#475569" }}>{item.subjectTitle}</p>
                  <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.8 }}>
                    <div><strong>Program:</strong> {item.programCode} · Year {item.yearLevel} · Semester {item.semester}</div>
                    <div><strong>Days:</strong> {item.days}</div>
                    <div><strong>Time:</strong> {displayTime(item.startTime)}–{displayTime(item.endTime)}</div>
                    <div><strong>Room:</strong> {item.room || "Not set"}</div>
                    <div><strong>Enrolled:</strong> {item.enrolledCount}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : activeTab === "attendance" ? (
          <section style={cardStyle}>
            <h1 style={{ margin: "0 0 14px", fontSize: 22 }}>Class Attendance</h1>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>
                Assigned class
                <select value={selectedClassId} onChange={event => setSelectedClassId(event.target.value)} style={{ minWidth: 240, padding: 9, border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff" }}>
                  {classes.map(item => <option key={item.id} value={item.id}>{classLabel(item)} · {item.subjectTitle}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>
                Class date
                <input type="date" value={attendanceDate} onChange={event => setAttendanceDate(event.target.value)} style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 7 }} />
              </label>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
              Only students enrolled in the selected section appear. Select a class meeting date and mark every student before saving.
            </p>
            {attendanceLoading ? (
              <p role="status">Loading roster…</p>
            ) : error ? null : visibleAttendanceStudents.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>There are no enrolled students for this class date.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 8px" }}>Student</th>
                      <th style={{ padding: "10px 8px" }}>Student ID</th>
                      <th style={{ padding: "10px 8px" }}>Attendance</th>
                      <th style={{ padding: "10px 8px" }}>Notes</th>
                    </tr></thead>
                    <tbody>
                      {visibleAttendanceStudents.map(student => (
                        <tr key={student.studentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "9px 8px" }}>{student.studentName}<div style={{ color: "#64748b", fontSize: 11 }}>{student.email}</div></td>
                          <td style={{ padding: "9px 8px" }}>{student.studentIdNumber || "—"}</td>
                          <td style={{ padding: "9px 8px" }}>
                            <select aria-label={`Attendance for ${student.studentName}`} value={student.status} onChange={event => updateAttendance(student.studentId, "status", event.target.value)} style={{ padding: 7, border: "1px solid #cbd5e1", borderRadius: 6 }}>
                              <option value="Unmarked">Choose status</option>
                              {["Present", "Absent", "Late", "Excused"].map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "9px 8px" }}>
                            <input aria-label={`Notes for ${student.studentName}`} maxLength={500} value={student.notes || ""} onChange={event => updateAttendance(student.studentId, "notes", event.target.value)} style={{ width: 180, maxWidth: "100%", padding: 7, border: "1px solid #cbd5e1", borderRadius: 6 }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" disabled={!allStudentsMarked || savingAttendance} onClick={() => void saveAttendance()} style={{ marginTop: 14, border: 0, borderRadius: 8, padding: "10px 15px", background: allStudentsMarked ? "#2563eb" : "#94a3b8", color: "#fff", fontWeight: 700, cursor: allStudentsMarked ? "pointer" : "not-allowed" }}>
                  {savingAttendance ? "Saving…" : "Save attendance"}
                </button>
              </>
            )}
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 18, alignItems: "start" }}>
            <form onSubmit={publishAnnouncement} style={cardStyle}>
              <h1 style={{ margin: "0 0 14px", fontSize: 22 }}>Post a Class Announcement</h1>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
                Announcements are attached to a date in the class calendar and sent to enrolled students as notifications.
              </p>
              <label style={{ display: "grid", gap: 5, marginBottom: 12, fontSize: 12, fontWeight: 700 }}>
                Assigned class
                <select required value={announcementForm.sectionStudyLoadId} onChange={event => setAnnouncementForm(current => ({ ...current, sectionStudyLoadId: event.target.value }))} style={{ width: "100%", padding: 9, border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff" }}>
                  {classes.map(item => <option key={item.id} value={item.id}>{classLabel(item)} · {item.subjectTitle}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: 5, marginBottom: 12, fontSize: 12, fontWeight: 700 }}>
                Date
                <input required type="date" value={announcementForm.eventDate} onChange={event => setAnnouncementForm(current => ({ ...current, eventDate: event.target.value }))} style={{ padding: 9, border: "1px solid #cbd5e1", borderRadius: 7 }} />
              </label>
              <label style={{ display: "grid", gap: 5, marginBottom: 12, fontSize: 12, fontWeight: 700 }}>
                Title
                <input required maxLength={200} value={announcementForm.title} onChange={event => setAnnouncementForm(current => ({ ...current, title: event.target.value }))} style={{ padding: 9, border: "1px solid #cbd5e1", borderRadius: 7 }} />
              </label>
              <label style={{ display: "grid", gap: 5, marginBottom: 14, fontSize: 12, fontWeight: 700 }}>
                Details
                <textarea maxLength={1000} rows={4} value={announcementForm.description} onChange={event => setAnnouncementForm(current => ({ ...current, description: event.target.value }))} style={{ padding: 9, border: "1px solid #cbd5e1", borderRadius: 7, resize: "vertical" }} />
              </label>
              <button type="submit" disabled={savingAnnouncement} style={{ border: 0, borderRadius: 8, padding: "10px 15px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {savingAnnouncement ? "Publishing…" : "Publish announcement"}
              </button>
            </form>

            <section style={cardStyle}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>My announcements</h2>
              {announcements.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>No class announcements have been published.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {announcements.map(item => (
                    <article key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                      <strong>{item.title}</strong>
                      <div style={{ color: "#2563eb", fontSize: 12, marginTop: 4 }}>{item.subjectCode} · {item.sectionCode} · {new Date(item.eventDate).toLocaleDateString()}</div>
                      {item.description && <p style={{ color: "#475569", fontSize: 13, marginTop: 7, lineHeight: 1.5 }}>{item.description}</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
