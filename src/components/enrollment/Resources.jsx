import { useState } from "react";

const Resources = () => {
  const [quizLink] = useState("https://lms.onlium.edu/quiz/it201");
  const [examLink] = useState("https://lms.onlium.edu/exam/it201-midterm");
  const isAvailable = true;

  const student = {
    name: "Ron Regodo",
    id: "ONLS-2025-00124",
    initials: "RR",
    course: "BS Information Technology",
    year: "2nd Year",
  };

  const handleOpen = (link) => {
    try {
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (e) {
      // fallback
      const a = document.createElement('a');
      a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click(); a.remove();
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard');
    } catch (e) {
      // fallback
      const el = document.createElement('textarea');
      el.value = link; document.body.appendChild(el); el.select();
      try { document.execCommand('copy'); alert('Link copied to clipboard'); } catch (_) { alert('Copy failed — please copy manually'); }
      el.remove();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F5F7",
      fontFamily: "'Segoe UI', sans-serif",
      display: "flex",
    }}>

      {/* Sidebar */}
      <div style={{
        width: "210px",
        minHeight: "100vh",
        background: "#2B3DE8",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "8px",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "700", fontSize: "13px",
          }}>ONL</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>ONLIUM</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>Student Portal</div>
          </div>
        </div>
        <div style={{
          color: "rgba(255,255,255,0.5)", fontSize: "11px",
          marginBottom: "24px", paddingLeft: "4px",
        }}>SY 2026</div>

        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "10px", letterSpacing: "0.8px" }}>
          MAIN MENU
        </div>

        {["Dashboard", "Enrollment", "Study Load", "Resources", "Appointments", "Notifications"].map((item) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: "8px",
            marginBottom: "4px",
            background: item === "Resources" ? "rgba(255,255,255,0.2)" : "transparent",
            color: "#fff",
            fontSize: "13px",
            cursor: "pointer",
          }}>
            <span>{item}</span>
            {item === "Enrollment" && (
              <span style={{
                background: "#FF3B30", color: "#fff",
                borderRadius: "999px", fontSize: "10px",
                width: "18px", height: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700",
              }}>1</span>
            )}
            {item === "Notifications" && (
              <span style={{
                background: "#FF3B30", color: "#fff",
                borderRadius: "999px", fontSize: "10px",
                width: "18px", height: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700",
              }}>4</span>
            )}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{
          padding: "10px 12px", borderRadius: "8px",
          background: "rgba(255,255,255,0.15)",
          color: "#fff", fontSize: "13px",
          textAlign: "center", cursor: "pointer",
        }}>Logout</div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Navbar */}
        <div style={{
          height: "60px", background: "#fff",
          borderBottom: "1px solid #E8E8E8",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#F4F5F7", borderRadius: "999px",
            padding: "8px 16px", width: "260px",
          }}>
            <span style={{ color: "#AAAAAA", fontSize: "13px" }}>Search subjects, resources...</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "18px", cursor: "pointer" }}>🔔</span>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "#2B3DE8",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "700", fontSize: "12px",
            }}>{student.initials}</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0A0A0A" }}>{student.name}</div>
              <div style={{ fontSize: "11px", color: "#888888" }}>{student.id}</div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: "24px", flex: 1 }}>

          {/* Banner */}
          <div style={{
            background: "linear-gradient(to right, #2B3DE8, #4DA6FF)",
            borderRadius: "12px",
            padding: "24px 28px",
            marginBottom: "28px",
          }}>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0 0 4px" }}>
              Resources
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>
              {student.course} — {student.year}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #E8E8E8",
            padding: "32px",
            maxWidth: "660px",
          }}>

            {/* Available notice */}
            {isAvailable ? (
              <div style={{
                background: "#E6F9F1",
                border: "1px solid #1A7F4B",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "28px",
              }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "#1A7F4B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "12px", fontWeight: "700", color: "#fff",
                }}>✓</div>
                <span style={{ fontSize: "13px", color: "#085041", lineHeight: "1.5" }}>
                  LMS links are available today. Click "Open" to access your quiz or exam.
                </span>
              </div>
            ) : (
              <div style={{
                background: "#FFF4E6",
                border: "1px solid #EF9F27",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "28px",
              }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "#EF9F27",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "12px", fontWeight: "700", color: "#fff",
                }}>!</div>
                <span style={{ fontSize: "13px", color: "#633806", lineHeight: "1.5" }}>
                  LMS links are not available today. Please check back tomorrow or contact your instructor.
                </span>
              </div>
            )}

            {/* LMS Quiz Link */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", color: "#555555", fontWeight: "500" }}>
                  LMS Quiz Link
                </label>
                <span style={{
                  background: isAvailable ? "#E6F9F1" : "#FCEBEB",
                  color: isAvailable ? "#1A7F4B" : "#A32D2D",
                  fontSize: "11px", padding: "2px 8px",
                  borderRadius: "999px", fontWeight: "500",
                }}>{isAvailable ? "Available" : "Not available"}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={isAvailable ? quizLink : ""}
                  placeholder={isAvailable ? "" : "No link available today"}
                  readOnly
                  onClick={(e) => e.target.select()}
                  style={{
                    flex: 1, height: "44px",
                    border: "1px solid #D0D0D0",
                    borderRadius: "8px",
                    padding: "0 14px",
                    fontSize: "13px",
                    color: isAvailable ? "#333333" : "#AAAAAA",
                    background: isAvailable ? "#fff" : "#F4F5F7",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "default",
                  }}
                />
                {isAvailable && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleOpen(quizLink)}
                      style={{
                        height: "44px", padding: "0 20px",
                        background: "#2B3DE8", color: "#fff",
                        border: "none", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "600",
                        cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >Open</button>
                    <button onClick={() => handleCopy(quizLink)} style={{ height: '44px', padding: '0 14px', borderRadius: 8, border: '1px solid #e6eef9', background: '#fff', cursor: 'pointer' }}>Copy</button>
                  </div>
                )}
              </div>
            </div>

            {/* LMS Exam Link */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", color: "#555555", fontWeight: "500" }}>
                  LMS Exam Link
                </label>
                <span style={{
                  background: isAvailable ? "#E6F9F1" : "#FCEBEB",
                  color: isAvailable ? "#1A7F4B" : "#A32D2D",
                  fontSize: "11px", padding: "2px 8px",
                  borderRadius: "999px", fontWeight: "500",
                }}>{isAvailable ? "Available" : "Not available"}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={isAvailable ? examLink : ""}
                  placeholder={isAvailable ? "" : "No link available today"}
                  readOnly
                  onClick={(e) => e.target.select()}
                  style={{
                    flex: 1, height: "44px",
                    border: "1px solid #D0D0D0",
                    borderRadius: "8px",
                    padding: "0 14px",
                    fontSize: "13px",
                    color: isAvailable ? "#333333" : "#AAAAAA",
                    background: isAvailable ? "#fff" : "#F4F5F7",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "default",
                  }}
                />
                {isAvailable && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleOpen(examLink)}
                      style={{
                        height: "44px", padding: "0 20px",
                        background: "#2B3DE8", color: "#fff",
                        border: "none", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "600",
                        cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >Open</button>
                    <button onClick={() => handleCopy(examLink)} style={{ height: '44px', padding: '0 14px', borderRadius: 8, border: '1px solid #e6eef9', background: '#fff', cursor: 'pointer' }}>Copy</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;