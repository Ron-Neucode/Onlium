import { useState } from "react";

const schedules = [
  {
    key: "morning",
    label: "Morning",
    time: "6:00 AM – 12:00 PM",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
    accent: "#f59e0b",
    desc: "Ideal for students who prefer early classes and free afternoons.",
  },
  {
    key: "afternoon",
    label: "Afternoon",
    time: "12:00 PM – 6:00 PM",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        <path d="M2 17h20" strokeOpacity=".3"/>
      </svg>
    ),
    accent: "#2563eb",
    desc: "Flexible midday schedule with balanced morning and evening time.",
  },
  {
    key: "evening",
    label: "Evening",
    time: "6:00 PM – 10:00 PM",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
    accent: "#7c3aed",
    desc: "Perfect for students with daytime work or personal commitments.",
  },
];

export default function ChooseSchedule({ onNext, onBack, value = "" }) {
  const [selected, setSelected] = useState(value);
  const [error, setError] = useState(false);

  function handleNext() {
    if (!selected) {
      setError(true);
      return;
    }
    setError(false);
    onNext && onNext(selected);
  }

  function handleSelect(key) {
    setSelected(key);
    setError(false);
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#f1f5f9",
      minHeight: "100vh",
      padding: "32px 0",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>

        {/* Card */}
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,.07)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#eef2ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#2563eb", flexShrink: 0,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)"
            }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                Choose your schedule
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>
                Select a class time that works best for you. You can only enroll in one schedule per term.
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px 28px" }}>

            {/* Error Banner */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#fff7ed", border: "1px solid #fed7aa",
                borderRadius: 10, padding: "12px 16px", marginBottom: 24,
              }}>
                <svg width="16" height="16" fill="none" stroke="#ea580c" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: 13, color: "#9a3412", fontWeight: 500 }}>
                  Please select a schedule before continuing.
                </span>
              </div>
            )}

            {/* Schedule Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginBottom: 32,
            }}>
              {schedules.map(({ key, label, time, icon, accent, desc }) => {
                const isSelected = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    style={{
                      position: "relative",
                      padding: "28px 20px 26px",
                      borderRadius: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      border: isSelected ? "2px solid #2563eb" : "1px solid #eef2f6",
                      background: "#fff",
                      boxShadow: "0 4px 12px rgba(18,24,40,0.03)",
                      transition: "border .2s ease",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div style={{
                        position: "absolute", top: 12, left: 12,
                        width: 22, height: 22, borderRadius: "50%",
                        background: "#2563eb",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}

                    {/* Icon */}
                    <div style={{
                      width: 64, height: 64, borderRadius: 14,
                      background: "#fbfdff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px",
                      color: isSelected ? accent : "#94a3b8",
                      transition: "color .2s",
                    }}>
                      {icon}
                    </div>

                    {/* Label */}
                    <div style={{
                      fontSize: 17, fontWeight: 800,
                      fontFamily: "'Sora', sans-serif",
                      color: "#1e293b",
                      marginBottom: 6,
                    }}>
                      {label}
                    </div>

                    {/* Divider */}
                    <div style={{
                      width: 40, height: 3, borderRadius: 4,
                      background: isSelected ? "#2563eb" : "#eef2f6",
                      margin: "0 auto 10px",
                      transition: "background .2s",
                    }}/>

                    {/* Time */}
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: isSelected ? "#2563eb" : "#475569",
                      marginBottom: 10,
                      transition: "color .2s",
                    }}>
                      {time}
                    </div>

                    {/* Desc */}
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected summary */}
            {selected && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#f0fdf4", border: "1px solid #86efac",
                borderRadius: 10, padding: "12px 16px", marginBottom: 24,
              }}>
                <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>
                  You selected: <strong>{schedules.find(s => s.key === selected)?.label}</strong> ({schedules.find(s => s.key === selected)?.time})
                </span>
              </div>
            )}

            {/* Schedule footer spacing only — uploader removed to match design */}
            <div style={{ height: 8, marginBottom: 24 }} />

            {/* Footer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 4,
            }}>
              <button
                onClick={() => onBack && onBack()}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 8,
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "#fff", border: "1.5px solid #e2e8f0",
                  color: "#475569", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!selected}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", borderRadius: 8,
                  fontSize: 13.5, fontWeight: 600,
                  background: selected ? "#2563eb" : "#eef2f6",
                  border: "none", color: selected ? "#fff" : "#9aa5b2",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background .2s",
                  cursor: selected ? "pointer" : "not-allowed",
                }}
              >
                Next: Submit Requirements
                <svg width="14" height="14" fill="none" stroke={selected ? "currentColor" : "#9aa5b2"} strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}