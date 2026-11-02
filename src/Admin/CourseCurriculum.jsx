import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService.js";
import "./styles/CourseCurriculum.css";

const PROGRAMS = [
  { code: "BSA", label: "BS Accountancy" },
  { code: "BSBA", label: "BS Business Administration" },
  { code: "BSHM", label: "BS Hospitality Management" },
  { code: "BSCS", label: "BS Computer Science" },
  { code: "BSIT", label: "BS Information Technology" },
];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SEMESTERS = ["1st Semester", "2nd Semester", "Summer"];

const emptyForm = {
  code: "",
  title: "",
  lecture: "",
  lab: "",
};

const yearLevelMap = {
  "1st Year": 1,
  "2nd Year": 2,
  "3rd Year": 3,
  "4th Year": 4,
};

const semesterMap = {
  "1st Semester": 1,
  "2nd Semester": 2,
  "Summer": 3,
};

export default function CourseCurriculum() {
  const navigate = useNavigate();
  const [view, setView] = useState("main"); // main | assign | viewall
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [showRetired, setShowRetired] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [retiringSubjectId, setRetiringSubjectId] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [savingSubjectId, setSavingSubjectId] = useState("");

  // Assign Courses state
  const [assignProgram, setAssignProgram] = useState("");
  const [assignYear, setAssignYear] = useState("");
  const [assignSemester, setAssignSemester] = useState("");
  const [assignStep, setAssignStep] = useState(1);
  const [newCourses, setNewCourses] = useState([{ ...emptyForm }]);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // View All state
  const [filterProgram, setFilterProgram] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async (includeInactive = false) => {
    try {
      setLoading(true);
      const data = await apiService.getStudyLoads({ includeInactive });
      setCourses(data.map(c => ({
        id: c.id,
        isActive: c.isActive !== false,
        program: c.programCode,
        year: `${c.yearLevel}${c.yearLevel === 1 ? "st" : c.yearLevel === 2 ? "nd" : c.yearLevel === 3 ? "rd" : "th"} Year`,
        semester: c.semester === 1 ? "1st Semester" : c.semester === 2 ? "2nd Semester" : "Summer",
        code: c.subjectCode,
        title: c.subjectTitle,
        lecture: c.lecUnits,
        lab: c.labUnits,
      })));
      setError(null);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function handleAddRow() {
    setNewCourses([...newCourses, { ...emptyForm }]);
  }

  function handleRemoveRow(i) {
    setNewCourses(newCourses.filter((_, idx) => idx !== i));
  }

  function handleRowChange(i, field, val) {
    const updated = newCourses.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    setNewCourses(updated);
  }

  function validateAssign() {
    const errs = {};
    newCourses.forEach((r, i) => {
      if (!r.code.trim()) errs[`code_${i}`] = "Required";
      if (!r.title.trim()) errs[`title_${i}`] = "Required";
      if (r.lecture === "" || isNaN(Number(r.lecture))) errs[`lecture_${i}`] = "Must be a number";
      if (r.lab === "" || isNaN(Number(r.lab))) errs[`lab_${i}`] = "Must be a number";
      // Duplicate check - check against API-loaded courses
      const isDup = courses.some(c =>
        c.program === assignProgram && c.year === assignYear &&
        c.semester === assignSemester && c.code.toLowerCase() === r.code.trim().toLowerCase()
      );
      if (isDup) errs[`dup_${i}`] = `Course code "${r.code}" already exists for this program/year/semester.`;
    });
    return errs;
  }

  async function handleSave() {
    const errs = validateAssign();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setSaving(true);
    try {
      const yearLevelNum = yearLevelMap[assignYear];
      const semesterNum = semesterMap[assignSemester];

      for (const r of newCourses) {
        await apiService.createStudyLoad({
          programCode: assignProgram,
          yearLevel: yearLevelNum,
          semester: semesterNum,
          subjectCode: r.code.trim(),
          subjectTitle: r.title.trim(),
          lecUnits: Number(r.lecture),
          labUnits: Number(r.lab),
        });
      }

      setSaved(true);
      await loadCourses();
      setTimeout(() => { 
        setSaved(false); 
        setView("main"); 
        setAssignStep(1); 
        setNewCourses([{ ...emptyForm }]); 
        setErrors({}); 
        setAssignProgram(""); 
        setAssignYear(""); 
        setAssignSemester(""); 
      }, 1800);
    } catch (err) {
      console.error("Failed to save courses:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRetireSubject(course) {
    if (!window.confirm(`Retire ${course.code} — ${course.title} from ${course.program}, ${course.year}, ${course.semester}? Historical records will be preserved.`)) return;
    setRetiringSubjectId(course.id);
    setActionError("");
    setActionNotice("");
    try {
      const result = await apiService.retireStudyLoad(course.id);
      setActionNotice(result.message || "Subject retired.");
      await loadCourses(showRetired);
    } catch (err) {
      setActionError(err.message || "Failed to retire subject.");
    } finally {
      setRetiringSubjectId("");
    }
  }

  async function handleRetireCurriculum() {
    if (filterProgram === "All" || filterYear === "All" || filterSemester === "All") return;
    const yearLevel = yearLevelMap[filterYear];
    const semester = semesterMap[filterSemester];
    const activeCount = filtered.filter(course => course.isActive).length;
    if (!activeCount) return;

    if (!window.confirm(`Retire all ${activeCount} active subjects from ${filterProgram}, ${filterYear}, ${filterSemester}? Historical records will be preserved.`)) return;
    setBusyAction(true);
    setActionError("");
    setActionNotice("");
    try {
      const result = await apiService.retireCurriculum(filterProgram, yearLevel, semester);
      setActionNotice(result.message || "Curriculum retired.");
      setShowRetired(true);
      await loadCourses(true);
    } catch (err) {
      setActionError(err.message || "Failed to retire curriculum.");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleRestoreSubject(course) {
    setRetiringSubjectId(course.id);
    setActionError("");
    setActionNotice("");
    try {
      const result = await apiService.restoreStudyLoad(course.id);
      setActionNotice(result.message || "Subject restored.");
      await loadCourses(showRetired);
    } catch (err) {
      setActionError(err.message || "Failed to restore subject.");
    } finally {
      setRetiringSubjectId("");
    }
  }

  function startEditingSubject(course) {
    setActionError("");
    setActionNotice("");
    setEditingSubjectId(course.id);
    setEditingSubject({
      code: course.code,
      title: course.title,
      lecture: String(course.lecture),
      lab: String(course.lab),
    });
  }

  function getSubjectEditFormId(courseId) {
    return `edit-study-load-${courseId}`;
  }

  async function saveEditedSubject(course) {
    if (!editingSubject) return;
    const subjectCode = editingSubject.code.trim();
    const subjectTitle = editingSubject.title.trim();
    const lecture = Number(editingSubject.lecture);
    const lab = Number(editingSubject.lab);

    if (!subjectCode || !subjectTitle) {
      setActionError("Subject code and title are required.");
      return;
    }
    if (!Number.isFinite(lecture) || !Number.isFinite(lab) || lecture < 0 || lab < 0) {
      setActionError("Lecture and lab units must be valid non-negative numbers.");
      return;
    }
    if (courses.some(other =>
      other.id !== course.id &&
      other.isActive &&
      other.program === course.program &&
      other.year === course.year &&
      other.semester === course.semester &&
      other.code.trim().toLowerCase() === subjectCode.toLowerCase()
    )) {
      setActionError(`Subject code "${subjectCode}" already exists for this program and term.`);
      return;
    }

    setSavingSubjectId(course.id);
    setActionError("");
    setActionNotice("");
    try {
      const result = await apiService.updateStudyLoad(course.id, {
        subjectCode,
        subjectTitle,
        lecUnits: lecture,
        labUnits: lab,
      });
      setActionNotice(result.message || "Curriculum subject updated.");
      setEditingSubjectId("");
      setEditingSubject(null);
      await loadCourses(showRetired);
    } catch (err) {
      setActionError(err.message || "Failed to update curriculum subject.");
    } finally {
      setSavingSubjectId("");
    }
  }

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const totalNew = newCourses.reduce((s, r) => s + (Number(r.lecture) || 0) + (Number(r.lab) || 0), 0);
  const activeCourses = courses.filter(course => course.isActive);

  const filtered = courses.filter(c =>
    (filterProgram === "All" || c.program === filterProgram) &&
    (filterYear === "All" || c.year === filterYear) &&
    (filterSemester === "All" || c.semester === filterSemester)
  ).sort((a, b) => {
    if (!sortCol) return 0;
    const va = a[sortCol], vb = b[sortCol];
    return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const totalFiltered = filtered.reduce((s, c) => s + c.lecture + c.lab, 0);

  // ── MAIN DASHBOARD ──
  if (view === "main") {
    if (loading) {
      return (
        <div className="course-curriculum">
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading courses...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="course-curriculum">
          <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
            {error}
          </div>
        </div>
      );
    }

    return (
      <div className="course-curriculum">
        <div className="page-header">
          <h1>Study Load & Curriculum Management</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.85 }}>Manage course assignments and view study loads across all programs</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 700 }}>
          <button onClick={() => { setView("assign"); setAssignStep(1); }} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "32px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Assign Courses</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>Add and assign courses to a program, year level, and semester.</div>
          </button>
          <button onClick={() => setView("viewall")} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "32px 24px", cursor: "pointer", textAlign: "left", transition: "all .2s", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>View All Study Load</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>Browse and filter all courses across programs, years, and semesters.</div>
          </button>
        </div>
        <div style={{ marginTop: 32, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 24px", display: "flex", gap: 32 }}>
          {[
            { label: "Total Courses", value: activeCourses.length, color: "#3b82f6" },
            { label: "Programs", value: PROGRAMS.length, color: "#8b5cf6" },
            { label: "Total Units", value: activeCourses.reduce((s, c) => s + c.lecture + c.lab, 0), color: "#16a34a" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── ASSIGN COURSES ──
  if (view === "assign") return (
    <div className="course-curriculum">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Assign Courses</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Step {assignStep} of 2</p>
        </div>
        <button onClick={() => { setView("main"); setAssignStep(1); setNewCourses([{ ...emptyForm }]); setErrors({}); }} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
      </div>

      {assignStep === 1 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 28, maxWidth: 520 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Step 1 — Select Program & Semester</div>
          <div className="form-group">
            <label>Program</label>
            <select className="curriculum-select" value={assignProgram} onChange={e => setAssignProgram(e.target.value)}>
              <option value="">Select program...</option>
              {PROGRAMS.map(program => <option key={program.code} value={program.code}>{program.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Year Level</label>
            <select className="curriculum-select" value={assignYear} onChange={e => setAssignYear(e.target.value)}>
              <option value="">Select year level...</option>
              {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Semester</label>
            <select className="curriculum-select" value={assignSemester} onChange={e => setAssignSemester(e.target.value)}>
              <option value="">Select semester...</option>
              {SEMESTERS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="assign-btn" disabled={!assignProgram || !assignYear || !assignSemester}
            onClick={() => setAssignStep(2)}
            style={{ opacity: (!assignProgram || !assignYear || !assignSemester) ? 0.5 : 1 }}>
            Next: Add Courses →
          </button>
        </div>
      )}

      {assignStep === 2 && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", gap: 24, fontSize: 13 }}>
            <span><strong>Program:</strong> {assignProgram}</span>
            <span><strong>Year:</strong> {assignYear}</span>
            <span><strong>Semester:</strong> {assignSemester}</span>
            <button onClick={() => setAssignStep(1)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Change</button>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Step 2 — Add Courses</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Total Units: <strong style={{ color: "#2563eb" }}>{totalNew}</strong></div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="subjects-table" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>COURSE CODE</th>
                    <th>COURSE TITLE</th>
                    <th style={{ textAlign: "center" }}>LEC UNITS</th>
                    <th style={{ textAlign: "center" }}>LAB UNITS</th>
                    <th style={{ textAlign: "center" }}>TOTAL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {newCourses.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <input value={r.code} onChange={e => handleRowChange(i, "code", e.target.value)}
                          placeholder="e.g. IT 101"
                          style={{ width: "100%", padding: "7px 10px", border: `1.5px solid ${errors[`code_${i}`] || errors[`dup_${i}`] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 6, fontSize: 12, outline: "none" }} />
                        {errors[`code_${i}`] && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>{errors[`code_${i}`]}</div>}
                        {errors[`dup_${i}`] && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>{errors[`dup_${i}`]}</div>}
                      </td>
                      <td>
                        <input value={r.title} onChange={e => handleRowChange(i, "title", e.target.value)}
                          placeholder="Course title"
                          style={{ width: "100%", padding: "7px 10px", border: `1.5px solid ${errors[`title_${i}`] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 6, fontSize: 12, outline: "none" }} />
                        {errors[`title_${i}`] && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>{errors[`title_${i}`]}</div>}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input value={r.lecture} onChange={e => handleRowChange(i, "lecture", e.target.value)}
                          placeholder="0" type="number" min="0"
                          style={{ width: 60, padding: "7px 8px", border: `1.5px solid ${errors[`lecture_${i}`] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 6, fontSize: 12, outline: "none", textAlign: "center" }} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input value={r.lab} onChange={e => handleRowChange(i, "lab", e.target.value)}
                          placeholder="0" type="number" min="0"
                          style={{ width: 60, padding: "7px 8px", border: `1.5px solid ${errors[`lab_${i}`] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 6, fontSize: 12, outline: "none", textAlign: "center" }} />
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#2563eb" }}>
                        {(Number(r.lecture) || 0) + (Number(r.lab) || 0)}
                      </td>
                      <td>
                        {newCourses.length > 1 && (
                          <button onClick={() => handleRemoveRow(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={handleAddRow} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add Row</button>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {error && <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{error}</span>}
                {saved && <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ Saved successfully!</span>}
                <button onClick={handleSave} className="save-btn" disabled={saving} style={{ margin: 0, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : "Save Courses"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── VIEW ALL STUDY LOAD ──
  if (view === "viewall") return (
    <div className="course-curriculum">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>View All Study Load</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>{filtered.length} courses · {totalFiltered} total units</p>
        </div>
        <button onClick={() => setView("main")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
      </div>

      {actionError && <div role="alert" style={{ marginBottom: 14, borderRadius: 8, padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", fontSize: 13 }}>{actionError}</div>}
      {actionNotice && <div role="status" style={{ marginBottom: 14, borderRadius: 8, padding: "10px 14px", background: "#f0fdf4", color: "#166534", fontSize: 13 }}>{actionNotice}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select className="curriculum-select" style={{ width: "auto", borderRadius: 8 }} value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="All">All Programs</option>
          {PROGRAMS.map(program => <option key={program.code} value={program.code}>{program.label}</option>)}
        </select>
        <select className="curriculum-select" style={{ width: "auto", borderRadius: 8 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="All">All Year Levels</option>
          {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="curriculum-select" style={{ width: "auto", borderRadius: 8 }} value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
          <option value="All">All Semesters</option>
          {SEMESTERS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            const nextShowRetired = !showRetired;
            setShowRetired(nextShowRetired);
            setActionError("");
            setActionNotice("");
            await loadCourses(nextShowRetired);
          }}
          style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", padding: "8px 14px", borderRadius: 8, cursor: loading ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}
        >
          {showRetired ? "Hide retired subjects" : "Show retired subjects"}
        </button>
        {filterProgram !== "All" && filterYear !== "All" && filterSemester !== "All" && (
          <button
            type="button"
            disabled={busyAction || loading || !filtered.some(course => course.isActive)}
            onClick={() => void handleRetireCurriculum()}
            style={{ background: "#fff7ed", border: "1px solid #fdba74", color: "#c2410c", padding: "8px 14px", borderRadius: 8, cursor: busyAction || loading ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}
          >
            {busyAction ? "Retiring curriculum…" : "Retire entire curriculum"}
          </button>
        )}
        {(filterProgram !== "All" || filterYear !== "All" || filterSemester !== "All") && (
          <button onClick={() => { setFilterProgram("All"); setFilterYear("All"); setFilterSemester("All"); }}
            style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="subjects-table" style={{ minWidth: 1100 }}>
            <thead>
              <tr>
                {[["code","CODE"],["title","COURSE TITLE"],["program","PROGRAM"],["year","YEAR"],["semester","SEMESTER"],["lecture","LEC"],["lab","LAB"],["total","TOTAL"]].map(([col, label]) => (
                  <th key={col} onClick={() => handleSort(col)} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                    {label} {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                ))}
                <th>STATUS</th>
                <th>SECTION SCHEDULES</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={11} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No courses found.</td></tr>
                : filtered.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ fontWeight: 600, color: "#2563eb" }}>
                      {editingSubjectId === c.id ? (
                        <input
                          aria-label={`Subject code for ${c.title}`}
                          value={editingSubject.code}
                          maxLength={50}
                          form={getSubjectEditFormId(c.id)}
                          onChange={event => setEditingSubject(current => ({ ...current, code: event.target.value }))}
                          style={{ width: 110, padding: 6, border: "1px solid #cbd5e1", borderRadius: 5 }}
                        />
                      ) : c.code}
                    </td>
                    <td>
                      {editingSubjectId === c.id ? (
                        <input
                          aria-label={`Subject title for ${c.code}`}
                          value={editingSubject.title}
                          maxLength={200}
                          form={getSubjectEditFormId(c.id)}
                          onChange={event => setEditingSubject(current => ({ ...current, title: event.target.value }))}
                          style={{ width: 190, padding: 6, border: "1px solid #cbd5e1", borderRadius: 5 }}
                        />
                      ) : c.title}
                    </td>
                    <td style={{ fontSize: 11, color: "#64748b" }}>{c.program}</td>
                    <td>{c.year}</td>
                    <td>{c.semester}</td>
                    <td style={{ textAlign: "center" }}>
                      {editingSubjectId === c.id ? (
                        <input
                          aria-label={`Lecture units for ${c.code}`}
                          type="number"
                          min="0"
                          max="999.99"
                          step="0.01"
                          value={editingSubject.lecture}
                          form={getSubjectEditFormId(c.id)}
                          onChange={event => setEditingSubject(current => ({ ...current, lecture: event.target.value }))}
                          style={{ width: 72, padding: 6, border: "1px solid #cbd5e1", borderRadius: 5, textAlign: "center" }}
                        />
                      ) : c.lecture}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {editingSubjectId === c.id ? (
                        <input
                          aria-label={`Lab units for ${c.code}`}
                          type="number"
                          min="0"
                          max="999.99"
                          step="0.01"
                          value={editingSubject.lab}
                          form={getSubjectEditFormId(c.id)}
                          onChange={event => setEditingSubject(current => ({ ...current, lab: event.target.value }))}
                          style={{ width: 72, padding: 6, border: "1px solid #cbd5e1", borderRadius: 5, textAlign: "center" }}
                        />
                      ) : c.lab}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#2563eb" }}>
                      {editingSubjectId === c.id
                        ? (Number(editingSubject.lecture) || 0) + (Number(editingSubject.lab) || 0)
                        : c.lecture + c.lab}
                    </td>
                    <td style={{ color: c.isActive ? "#166534" : "#b45309", fontWeight: 600 }}>{c.isActive ? "Active" : "Retired"}</td>
                    <td style={{ fontSize: 12, color: "#475569" }}>Set separately for each section</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {c.isActive ? (
                          <>
                            {editingSubjectId === c.id ? (
                              <>
                                <form
                                  id={getSubjectEditFormId(c.id)}
                                  onSubmit={event => {
                                    event.preventDefault();
                                    void saveEditedSubject(c);
                                  }}
                                />
                                <button
                                  type="submit"
                                  form={getSubjectEditFormId(c.id)}
                                  disabled={Boolean(savingSubjectId)}
                                  style={{ border: "1px solid #bbf7d0", borderRadius: 6, background: "#f0fdf4", color: "#166534", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                                >
                                  {savingSubjectId === c.id ? "Saving…" : "Save"}
                                </button>
                                <button
                                  type="button"
                                  disabled={Boolean(savingSubjectId)}
                                  onClick={() => { setEditingSubjectId(""); setEditingSubject(null); setActionError(""); }}
                                  style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", color: "#334155", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                            <button
                              type="button"
                              disabled={Boolean(retiringSubjectId) || Boolean(savingSubjectId) || Boolean(editingSubjectId)}
                              onClick={() => navigate("/admin/sections")}
                              style={{ border: "1px solid #bfdbfe", borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Manage sections
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(retiringSubjectId) || Boolean(savingSubjectId) || Boolean(editingSubjectId) || busyAction}
                              onClick={() => startEditingSubject(c)}
                              style={{ border: "1px solid #c7d2fe", borderRadius: 6, background: "#eef2ff", color: "#4338ca", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Edit subject
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(retiringSubjectId) || Boolean(savingSubjectId) || Boolean(editingSubjectId) || busyAction}
                              onClick={() => void handleRetireSubject(c)}
                              style={{ border: "1px solid #fecaca", borderRadius: 6, background: "#fef2f2", color: "#b91c1c", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              {retiringSubjectId === c.id ? "Retiring…" : "Retire subject"}
                            </button>
                              </>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(retiringSubjectId) || busyAction}
                            onClick={() => void handleRestoreSubject(c)}
                            style={{ border: "1px solid #bbf7d0", borderRadius: 6, background: "#f0fdf4", color: "#166534", padding: "6px 9px", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            {retiringSubjectId === c.id ? "Restoring…" : "Restore subject"}
                          </button>
                        )}
                        {editingSubjectId === c.id && actionError && (
                          <div role="alert" style={{ flexBasis: "100%", color: "#b91c1c", fontSize: 11, whiteSpace: "normal" }}>
                            {actionError}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f1f5f9", borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={5} style={{ padding: "12px 8px", fontSize: 12, fontWeight: 700, color: "#475569" }}>TOTAL ({filtered.length} courses)</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{filtered.reduce((s, c) => s + c.lecture, 0)}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{filtered.reduce((s, c) => s + c.lab, 0)}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#2563eb" }}>{totalFiltered}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
