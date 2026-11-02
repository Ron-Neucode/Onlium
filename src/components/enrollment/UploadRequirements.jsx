import { useState } from "react";

// Documents per student type (from flowchart)
const DOCS_BY_TYPE = {
  continuing: [
    {
      id: "Clearance",
      label: "Student Clearance",
      desc: "Official clearance from the previous semester. This is REQUIRED — you cannot proceed without it.",
      emoji: "📋",
      required: true,
      critical: true,
      note: "Get this from the Registrar's Office or your department.",
    },
  ],
  new: [
    {
      id: "ReportCard",
      label: "Report Card (Form 138)",
      desc: "Senior High School Form 138 — original or certified true copy.",
      emoji: "📄",
      required: true,
      critical: false,
    },
    {
      id: "GoodMoral",
      label: "Certificate of Good Moral",
      desc: "Issued by your Senior High School guidance office or principal.",
      emoji: "📜",
      required: true,
      critical: false,
    },
    {
      id: "PSA",
      label: "PSA Birth Certificate",
      desc: "Philippine Statistics Authority issued birth certificate.",
      emoji: "🪪",
      required: true,
      critical: false,
    },
    {
      id: "Picture",
      label: "2×2 ID Photo (white bg)",
      desc: "Clear photo with white background taken within the last 6 months.",
      emoji: "🖼️",
      required: true,
      critical: false,
    },
  ],
  transferee: [
    {
      id: "TOR",
      label: "Transcript of Records (TOR)",
      desc: "Official TOR from your previous school — must be signed and sealed.",
      emoji: "📄",
      required: true,
      critical: false,
    },
    {
      id: "GoodMoral",
      label: "Certificate of Good Moral",
      desc: "Good Moral Certificate from your previous school.",
      emoji: "📜",
      required: true,
      critical: false,
    },
    {
      id: "HonorableDismissal",
      label: "Honorable Dismissal",
      desc: "Official honorable dismissal document from your previous school.",
      emoji: "🎓",
      required: true,
      critical: false,
    },
  ],
};

const TYPE_CONFIG = {
  continuing: {
    label: "Continuing Student",
    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    bannerText: "As a continuing student, your Clearance from the previous semester is mandatory. You cannot proceed to the next step without it.",
  },
  new: {
    label: "New Student",
    color: "#16a34a", bg: "#f0fdf4", border: "#86efac",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    bannerText: "As a new student, upload your Form 138 (Report Card), Good Moral Certificate, and PSA Birth Certificate. These will be reviewed by the admissions office.",
  },
  transferee: {
    label: "Transferee",
    color: "#d97706", bg: "#fffbeb", border: "#fcd34d",
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    bannerText: "As a transferee, you must submit your TOR, Good Moral Certificate, and Honorable Dismissal. Your credentials will be evaluated before program placement.",
  },
};

export default function UploadRequirements({
  studentType = "continuing",
  files = {},
  existingRequirements = [],
  onFilesChange,
  onBack,
  onNext,
}) {
  const [fileError, setFileError] = useState("");
  const docs = DOCS_BY_TYPE[studentType] || DOCS_BY_TYPE.continuing;
  const cfg  = TYPE_CONFIG[studentType];
  const requiredDocs = docs.filter(d => d.required);
  const reqUploaded  = requiredDocs.filter(d =>
    files[d.id] || existingRequirements.some(requirement => requirement.requirementType === d.id)
  ).length;
  const allDone      = reqUploaded === requiredDocs.length;

  // Check if critical docs (clearance for continuing) are uploaded
  const criticalDocs    = docs.filter(d => d.critical);
  const criticalMissing = criticalDocs.some(d =>
    !files[d.id] && !existingRequirements.some(requirement => requirement.requirementType === d.id)
  );

  function handleFile(id, e) {
    const file = e.target.files[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "jpg", "jpeg", "png"].includes(extension)) {
      setFileError("Choose a PDF, JPG, or PNG file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Each requirement file must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setFileError("");
    onFilesChange?.({ ...files, [id]: file });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700 }}>Upload Requirements</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Attach the required documents for enrollment</div>
        </div>
        {/* Student type badge */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div style={{ padding: 24 }}>
        {/* Banner */}
        <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
          <svg style={{ flexShrink: 0, marginTop: 1, color: cfg.color }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p style={{ fontSize: 12.5, color: cfg.color, lineHeight: 1.5 }}>{cfg.bannerText}</p>
        </div>

        {/* Clearance critical warning for continuing */}
        {studentType === "continuing" && criticalMissing && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
            <svg style={{ flexShrink: 0, marginTop: 1, color: "#dc2626" }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p style={{ fontSize: 12.5, color: "#b91c1c", lineHeight: 1.5 }}>
              <strong>You cannot proceed without your Clearance.</strong> Please upload it to continue with enrollment.
            </p>
          </div>
        )}

        {/* Upload progress */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: cfg.color, marginRight: 6 }}>{reqUploaded}</span>
            of <strong>{requiredDocs.length} required</strong> documents uploaded
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {requiredDocs.map(d => (
              <div key={d.id} style={{ width: 10, height: 10, borderRadius: "50%", background: files[d.id] ? "#16a34a" : "#e2e8f0", transition: "background .2s" }}/>
            ))}
          </div>
        </div>

        {/* Document cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {docs.map(({ id, label }) => {
            const existingDocument = existingRequirements.find(requirement => requirement.requirementType === id);
            const done = !!files[id] || !!existingDocument;
            return (
              <label key={id} htmlFor={`file-${id}`} style={{
                border: "1.5px solid #e2e8f0",
                borderRadius: 12, padding: 24, textAlign: "center",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                transition: "all .2s", background: "#fff", minHeight: 140,
              }}>
                <input type="file" id={`file-${id}`} accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => handleFile(id, e)} disabled={!!existingDocument}/>

                {/* Status badge */}
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "#dc2626", marginBottom: 12 }}>
                  Required
                </div>

                {/* Label */}
                <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: "#1e293b", margin: 0 }}>{label}</h4>

                {/* Status indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: done ? "#16a34a" : "#dc2626" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    {done ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="10"/>}
                  </svg>
                  {files[id]?.name || existingDocument?.originalFileName || "Not yet uploaded"}
                </div>
              </label>
            );
          })}
        </div>

        {/* Format note */}
        <div style={{ marginTop: 16, fontSize: 11.5, color: "#94a3b8", textAlign: "center" }}>
          Accepted formats: <strong>PDF, JPG, PNG</strong> · Max size per file: <strong>5 MB</strong>
        </div>
        {fileError && <p role="alert" style={{ color: "#b91c1c", fontSize: 12, textAlign: "center" }}>{fileError}</p>}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
        <button onClick={onBack} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer", background: "#fff", border: "1.5px solid #e2e8f0", color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11.5, color: allDone ? "#16a34a" : "#dc2626" }}>
            {allDone
              ? "All required documents uploaded ✓"
              : studentType === "continuing" && criticalMissing
                ? "⚠ Clearance is required to proceed"
                : `${requiredDocs.length - reqUploaded} required document(s) pending`
            }
          </span>
          <button onClick={() => allDone && onNext()} disabled={!allDone} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: allDone ? "pointer" : "not-allowed", background: allDone ? "#2563eb" : "#93c5fd", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 8, opacity: allDone ? 1 : .7 }}>
            Next: {studentType === "continuing" ? "Choose Schedule" : "Select Program"}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}