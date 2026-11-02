import { useEffect, useState } from "react";
import { apiService } from "../../services/apiService.js";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

export default function ClassAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    apiService.getMyClassAnnouncements()
      .then(items => {
        if (active) setAnnouncements(items);
      })
      .catch(requestError => {
        if (active) setError(requestError.message || "Unable to load class announcements.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="portal">
      <Sidebar activeNav="Announcements" mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(current => !current)} />
        <div className="content">
          <header style={{ marginBottom: 18 }}>
            <h1 style={{ margin: 0, fontSize: 24 }}>Class Announcements</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
              Updates posted by instructors for your assigned section and subject schedules.
            </p>
          </header>
          {loading ? (
            <p role="status" style={{ color: "#64748b" }}>Loading announcements…</p>
          ) : error ? (
            <div role="alert" style={{ border: "1px solid #fecaca", borderRadius: 9, padding: 14, color: "#b91c1c", background: "#fef2f2" }}>{error}</div>
          ) : announcements.length === 0 ? (
            <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, color: "#64748b" }}>
              No class announcements yet.
            </section>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {announcements.map(item => (
                <article key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb", borderRadius: 10, padding: 17 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 17 }}>{item.title}</h2>
                    <time dateTime={item.eventDate} style={{ color: "#64748b", fontSize: 13 }}>
                      {new Date(item.eventDate).toLocaleDateString()}
                    </time>
                  </div>
                  <p style={{ margin: "7px 0", color: "#2563eb", fontWeight: 700, fontSize: 12 }}>
                    {item.subjectCode} · {item.sectionCode} · {item.subjectTitle}
                  </p>
                  {item.description && <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>{item.description}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
