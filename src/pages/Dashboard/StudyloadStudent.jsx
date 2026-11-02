import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService.js";
import { authService } from "../../services/authService.js";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

export default function StudyloadStudent() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Study Load");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("mine");
  const [term, setTerm] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [previewSubjects, setPreviewSubjects] = useState([]);
  const [previewProgram, setPreviewProgram] = useState("BSIT");
  const [previewYearLevel, setPreviewYearLevel] = useState(1);
  const [previewSemester, setPreviewSemester] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student] = useState(() => {
    try {
      return authService.getUserSession() || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let active = true;

    async function loadStudyLoad() {
      try {
        const currentTerm = await apiService.getCurrentStudyTerm();
        if (!active) return;
        setTerm(currentTerm);

        const officialSubjects = await apiService.getOfficialStudyLoads(currentTerm);
        if (!active) return;

        setSubjects(officialSubjects);
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load your official study load.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadStudyLoad();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === "preview" && previewSubjects.length === 0 && !previewError) {
      void loadCurriculumPreview();
    }
  }, [activeTab]);

  async function loadCurriculumPreview() {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const results = await apiService.getStudyLoads({
        programCode: previewProgram,
        yearLevel: previewYearLevel,
        semester: previewSemester,
      });
      setPreviewSubjects(results);
    } catch (requestError) {
      setPreviewError(requestError.message || "Unable to load curriculum subjects.");
      setPreviewSubjects([]);
    } finally {
      setPreviewLoading(false);
    }
  }

  const totalUnits = subjects.reduce(
    (total, subject) => total + Number(subject.totalUnits ?? (Number(subject.lecUnits || 0) + Number(subject.labUnits || 0))),
    0,
  );
  const allSchedulesPublished = Boolean(term?.sectionCode) && subjects.length > 0 && subjects.every(subject =>
    subject.section && subject.professorName && subject.days && subject.startTime && subject.endTime && subject.room
  );
  const statusLabel = allSchedulesPublished ? "Published" : "Not Published";
  const statusColor = allSchedulesPublished ? "#15803d" : "#c2410c";
  const previewTotalUnits = previewSubjects.reduce(
    (total, subject) => total + Number(subject.totalUnits ?? (Number(subject.lecUnits || 0) + Number(subject.labUnits || 0))),
    0,
  );
  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <div style={{ padding: "24px 28px", flex: 1, minHeight: "100%", background: "linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)" }}>
            <header style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Study Load
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                View the subjects assigned to your enrolled term or browse the curriculum.
              </p>
            </header>

            <nav aria-label="Study load sections" style={{ display: "flex", gap: 8, padding: 6, marginBottom: 18, borderRadius: 12, background: "#2563eb", maxWidth: 520 }}>
              {[
                ["mine", "My Study Load"],
                ["preview", "Curriculum Preview"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-current={activeTab === key ? "page" : undefined}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1,
                    border: 0,
                    borderRadius: 8,
                    padding: "11px 14px",
                    background: activeTab === key ? "#fff" : "transparent",
                    color: activeTab === key ? "#1d4ed8" : "#dbeafe",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            {activeTab === "mine" ? (
              <>
                <section style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 4px 12px rgba(15, 23, 42, .08)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1e293b" }}>Student: {student.fullName || [student.firstName, student.lastName].filter(Boolean).join(" ") || "Student"}</p>
                  <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>Email: {student.email || "Not available"}</p>
                </section>

                <section style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 4px 12px rgba(15, 23, 42, .08)" }}>
                  <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%", background: "#1d4ed8", color: "#fff" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m3 10 9-7 9 7" />
                      <path d="M5 9v11h14V9M9 20v-6h6v6M3 20h18" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>Current Enrolled Term</div>
                    <div style={{ color: "#1e4a8a", fontSize: 17, fontWeight: 700, marginTop: 4 }}>
                      {term
                        ? `${term.programCode} • ${term.yearLevel}${term.yearLevel === 1 ? "st" : term.yearLevel === 2 ? "nd" : term.yearLevel === 3 ? "rd" : "th"} Year • ${term.semester === 3 ? "Summer" : `${term.semester === 1 ? "1st" : "2nd"} Semester`}`
                        : "Current enrolled term is not available."}
                    </div>
                    {term?.sectionCode && (
                      <div style={{ color: "#2563eb", fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                        Assigned section: {term.sectionCode}
                      </div>
                    )}
                  </div>
                </section>

                <section style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}55`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: statusColor, fontSize: 17, fontWeight: 700 }}>
                    <span aria-hidden="true">✓</span>
                    Official Class Schedule: {statusLabel}
                  </div>
                  <p style={{ color: "#1e293b", fontSize: 14, lineHeight: 1.5, margin: "12px 0 0" }}>
                    {allSchedulesPublished
                      ? `The Registrar has published the class schedule for all subjects in section ${term.sectionCode}.`
                      : term && !term.sectionCode
                        ? "You are enrolled, but the system has not assigned your section yet. Contact the Registrar for assistance."
                        : "The Registrar has not published complete class schedule details for every subject in your section yet."}
                  </p>
                </section>

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    ["Subjects", subjects.length, "#2563eb"],
                    ["Total Units", totalUnits.toFixed(2), "#16a34a"],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ textAlign: "center", background: `${color}12`, borderRadius: 12, padding: 18 }}>
                      <div aria-hidden="true" style={{ color, fontSize: 22, marginBottom: 6 }}>{label === "Subjects" ? "▤" : "∑"}</div>
                      <div style={{ color, fontSize: 20, fontWeight: 700 }}>{value}</div>
                      <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </section>

                <section>
                  <h2 style={{ fontSize: 20, color: "#1e293b", margin: "0 0 8px" }}>Official Subjects and Schedule Details</h2>
                  <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
                    These subjects and class schedules belong to your assigned section.
                  </p>
                  {loading ? (
                    <p role="status" style={{ background: "#fff", borderRadius: 12, padding: 24, color: "#64748b" }}>Loading your official study load...</p>
                  ) : error ? (
                    <div role="alert" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
                      <h3 style={{ marginTop: 0, color: "#1e293b" }}>Study load not available</h3>
                      <p style={{ color: "#64748b", marginBottom: error === "Your session is invalid or expired. Please sign in again." ? 16 : 0 }}>{error}</p>
                      {error === "Your session is invalid or expired. Please sign in again." && (
                        <button
                          type="button"
                          onClick={() => {
                            authService.clearUserSession();
                            navigate("/register/login", { replace: true });
                          }}
                          style={{ border: 0, borderRadius: 8, padding: "10px 14px", background: "#1d4ed8", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        >
                          Sign in again
                        </button>
                      )}
                    </div>
                  ) : subjects.length === 0 ? (
                    <div style={{ background: "#fff", borderRadius: 12, padding: 24, textAlign: "center" }}>
                      <h3 style={{ margin: "0 0 8px", color: "#1e293b" }}>No study load available yet.</h3>
                      <p style={{ color: "#64748b", margin: 0 }}>
                        No curriculum subjects are configured for {term?.programCode}, Year {term?.yearLevel}, Semester {term?.semester}. Contact the Registrar if this term should have subjects.
                      </p>
                    </div>
                  ) : (
                    subjects.map(subject => (
                      <article key={subject.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 4px 12px rgba(15, 23, 42, .08)" }}>
                        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 38, height: 38, flex: "0 0 38px", borderRadius: 8, background: "#dbeafe", color: "#1d4ed8", fontSize: 19 }}>▤</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ color: "#2563eb", fontSize: 14, fontWeight: 700 }}>{subject.subjectCode}</div>
                            <div style={{ color: "#1e293b", fontSize: 16, fontWeight: 600, marginTop: 2 }}>{subject.subjectTitle}</div>
                          </div>
                          <span style={{ flexShrink: 0, borderRadius: 12, padding: "5px 9px", background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 700 }}>
                            {Number(subject.totalUnits ?? (Number(subject.lecUnits || 0) + Number(subject.labUnits || 0))).toFixed(2)} units
                          </span>
                        </header>
                        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px" }}>
                          Lecture Units: {Number(subject.lecUnits || 0).toFixed(2)} • Laboratory Units: {Number(subject.labUnits || 0).toFixed(2)}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10 }}>
                          {[
                            ["Section", subject.section],
                            ["Professor", subject.professorName],
                            ["Days", subject.days],
                            ["Time", subject.startTime && subject.endTime ? `${formatTime(subject.startTime)}–${formatTime(subject.endTime)}` : null],
                            ["Room", subject.room],
                          ].map(([label, value]) => (
                            <div key={label} style={{ borderRadius: 8, padding: 10, background: "#f8fafc" }}>
                              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                              <div style={{ color: value ? "#1e293b" : "#94a3b8", fontSize: 13, fontWeight: value ? 600 : 400 }}>
                                {value || "Not published"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))
                  )}
                </section>
              </>
            ) : (
              <>
                <section style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 4px 12px rgba(15, 23, 42, .08)" }}>
                  <h2 style={{ fontSize: 18, color: "#1e293b", margin: "0 0 6px" }}>Curriculum Preview</h2>
                  <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.4, margin: "0 0 14px" }}>You may browse other subjects here, but schedule submission is disabled in this tab.</p>
                  <div style={{ display: "grid", gap: 12 }}>
                    <label style={{ display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                      Program
                      <select value={previewProgram} disabled={previewLoading} onChange={event => setPreviewProgram(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 11, background: "#f8fafc", font: "inherit" }}>
                        {["BSIT", "BSCS", "BSBA", "BSA", "BSHM"].map(programCode => <option key={programCode} value={programCode}>{programCode}</option>)}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                      Year Level
                      <select value={previewYearLevel} disabled={previewLoading} onChange={event => setPreviewYearLevel(Number(event.target.value))} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 11, background: "#f8fafc", font: "inherit" }}>
                        {[1, 2, 3, 4].map(year => <option key={year} value={year}>{year}{year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} Year</option>)}
                      </select>
                    </label>
                    <label style={{ display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 600 }}>
                      Semester
                      <select value={previewSemester} disabled={previewLoading} onChange={event => setPreviewSemester(Number(event.target.value))} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 11, background: "#f8fafc", font: "inherit" }}>
                        <option value={1}>1st Semester</option>
                        <option value={2}>2nd Semester</option>
                        <option value={3}>Summer</option>
                      </select>
                    </label>
                  </div>
                  <button type="button" disabled={previewLoading} onClick={() => void loadCurriculumPreview()} style={{ width: "100%", marginTop: 16, padding: 12, border: 0, borderRadius: 8, background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: previewLoading ? "not-allowed" : "pointer" }}>
                    {previewLoading ? "Loading Preview..." : "Load Preview"}
                  </button>
                </section>

                <aside style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 14, marginBottom: 16, color: "#7c2d12", fontWeight: 600, lineHeight: 1.4 }}>
                  <span aria-hidden="true">◉</span>
                  <span>Read-only preview. You can view subjects here, but you cannot submit schedules from this tab.</span>
                </aside>

                <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    ["Subjects", previewSubjects.length, "#2563eb"],
                    ["Total Units", previewTotalUnits.toFixed(2), "#16a34a"],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ textAlign: "center", background: `${color}12`, borderRadius: 12, padding: 18 }}>
                      <div style={{ color, fontSize: 20, fontWeight: 700 }}>{value}</div>
                      <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </section>

                <section>
                  <h2 style={{ fontSize: 20, color: "#1e293b", margin: "0 0 16px" }}>Curriculum Subjects</h2>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "-8px 0 14px" }}>
                    Curriculum preview shows subjects and units only. Class schedules are specific to your assigned section.
                  </p>
                  {previewLoading ? (
                    <p role="status" style={{ background: "#fff", borderRadius: 12, padding: 24, color: "#64748b" }}>Loading curriculum subjects...</p>
                  ) : previewError ? (
                    <p role="alert" style={{ background: "#fff", borderRadius: 12, padding: 24, color: "#b91c1c" }}>{previewError}</p>
                  ) : previewSubjects.length === 0 ? (
                    <div style={{ background: "#fff", borderRadius: 12, padding: 24, textAlign: "center" }}>
                      <h3 style={{ margin: "0 0 8px", color: "#1e293b" }}>No subjects found.</h3>
                      <p style={{ color: "#64748b", margin: 0 }}>No curriculum subjects were found for the selected program, year level, and semester.</p>
                    </div>
                  ) : previewSubjects.map(subject => (
                    <article key={subject.id} style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: "0 4px 12px rgba(15, 23, 42, .08)" }}>
                      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 8, background: "#dbeafe", color: "#1d4ed8", fontSize: 19 }}>▤</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#2563eb", fontSize: 14, fontWeight: 700 }}>{subject.subjectCode}</div>
                          <div style={{ color: "#1e293b", fontSize: 16, fontWeight: 600, marginTop: 2 }}>{subject.subjectTitle}</div>
                        </div>
                        <span style={{ borderRadius: 12, padding: "5px 9px", background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 700 }}>
                          {Number(subject.totalUnits ?? (Number(subject.lecUnits || 0) + Number(subject.labUnits || 0))).toFixed(2)} units
                        </span>
                      </header>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                        Lecture Units: {Number(subject.lecUnits || 0).toFixed(2)} • Laboratory Units: {Number(subject.labUnits || 0).toFixed(2)}
                      </p>
                    </article>
                  ))}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
