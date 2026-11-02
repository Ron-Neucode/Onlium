import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService.js";

const PROGRAMS = [
  {
    code: "BSA",
    label: "BS Accounting",
    dept: "College of Business",
    desc: "Program focused on accounting principles, auditing, and taxation.",
    tags: ["Accounting", "Audit", "Tax"],
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    code: "BSBA",
    label: "BS Business Administration",
    dept: "College of Business",
    desc: "Core business skills in management, marketing, and finance.",
    tags: ["Management", "Marketing", "Finance"],
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    code: "BSHM",
    label: "BS Hospitality Management",
    dept: "College of Hospitality",
    desc: "Hospitality, tourism, and service management with practical training.",
    tags: ["Hospitality", "Tourism", "Service"],
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    code: "BSCS",
    label: "BS Computer Science",
    dept: "College of Computing",
    desc: "Algorithms, software engineering, and systems design.",
    tags: ["Algorithms", "AI", "Systems"],
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    code: "BSIT",
    label: "BS Information Technology",
    dept: "College of Computing",
    desc: "Networking, web development, database management, and IT infrastructure.",
    tags: ["Networks", "Web", "Databases"],
    color: "#d97706",
    bg: "#fffbeb",
  },
];

export default function SelectProgram({ onBack, onNext, studentType, value }) {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(value?.programCode || "");
  const [yearLevel, setYearLevel] = useState(value?.yearLevel || (studentType === "new" ? 1 : ""));
  const [semester, setSemester] = useState(value?.semester || 1);
  const [error, setError] = useState("");
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  useEffect(() => {
    let active = true;
    apiService.getStudyLoads()
      .then(studyLoads => {
        if (!active) return;
        const availableCodes = [...new Set(studyLoads.map(item => item.programCode).filter(Boolean))];
        const availablePrograms = availableCodes.map(code => (
          PROGRAMS.find(program => program.code === code)
          || { code, label: code, dept: "", desc: "Program offered by the Registrar." }
        ));
        setPrograms(availablePrograms);
        setSelected(current => availableCodes.includes(current)
          ? current
          : availableCodes[0] || "");
      })
      .catch(loadError => {
        if (active) setError(loadError.message || "Unable to load available programs.");
      })
      .finally(() => {
        if (active) setLoadingPrograms(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function continueToSchedule() {
    if (!selected || !programs.some(program => program.code === selected)) {
      setError("No available program is configured. Contact the Registrar.");
      return;
    }
    if (!yearLevel) {
      setError("Select your year level before continuing.");
      return;
    }
    onNext({
      programCode: selected,
      yearLevel: Number(yearLevel),
      semester: Number(semester),
    });
  }

  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,.08)", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#2563eb", flexShrink:0 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700 }}>Select Program</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Choose from programs with an active study-load curriculum.</div>
        </div>
      </div>

      <div style={{ padding:24 }}>
        {/* Program grid */}
        {loadingPrograms ? (
          <p role="status" style={{ color: "#64748b" }}>Loading available programs...</p>
        ) : programs.length === 0 ? (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {error || "No programs are currently available. Contact the Registrar."}
          </p>
        ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:24 }}>
          {programs.map(p => {
            const isSel  = selected === p.code;
            return (
              <button
                type="button"
                key={p.code}
                aria-pressed={isSel}
                onClick={() => setSelected(p.code)}
                style={{
                  border: isSel ? `2px solid #2563eb` : "1.5px solid #e2e8f0",
                  borderRadius:12, padding:20, cursor: "pointer", textAlign: "left",
                  background: "#fff", 
                  transition:"all .2s",
                }}
              >
                <div style={{ display:"inline-flex", padding:"4px 12px", borderRadius:20, background: "#2563eb", color: "#fff", fontSize:11, fontWeight:700, marginBottom:12, letterSpacing:.5 }}>
                  {p.code}
                </div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2, color:"#1e293b" }}>{p.label}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>{p.dept}</div>
                <div style={{ fontSize:11.5, color:"#64748b", lineHeight:1.5 }}>{p.desc}</div>
              </button>
            );
          })}
        </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}>
            Year Level
            <select value={yearLevel} onChange={event => setYearLevel(event.target.value)} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Select year level</option>
              {[1, 2, 3, 4].map(year => <option key={year} value={year}>{year}{year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} Year</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569" }}>
            Semester
            <select value={semester} onChange={event => setSemester(event.target.value)} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value={1}>First Semester</option>
              <option value={2}>Second Semester</option>
              <option value={3}>Summer</option>
            </select>
          </label>
        </div>
        {error && programs.length > 0 && <p role="alert" style={{ color: "#b91c1c", fontSize: 12 }}>{error}</p>}
      </div>

      {/* Footer */}
      <div style={{ padding:"16px 24px", borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8fafc" }}>
        <button onClick={onBack} style={{ padding:"10px 22px", borderRadius:8, fontSize:13.5, fontWeight:600, cursor:"pointer", background:"#fff", border:"1px solid #cbd5e1", color:"#475569" }}>
          Back
        </button>
        <button onClick={continueToSchedule} disabled={loadingPrograms || programs.length === 0} style={{ padding:"10px 22px", borderRadius:8, fontSize:13.5, fontWeight:600, cursor: loadingPrograms || programs.length === 0 ? "not-allowed" : "pointer", opacity: loadingPrograms || programs.length === 0 ? 0.6 : 1, background:"#2563eb", border:"none", color:"#fff", display:"flex", alignItems:"center", gap:8 }}>
          Next: Choose Schedule
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}