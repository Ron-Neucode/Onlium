import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService.js";
import "./styles/ResourcesStudent.css";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

export default function ResourcesStudent() {
  const [copiedId, setCopiedId] = useState(null);
  const [activeNav, setActiveNav] = useState("Resources");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await apiService.getResources();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = (url) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="portal">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
        <div className="main">
          <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <div className="content">
            <div className="resources-student">
              <div className="resources-header-student">
                <h1>Resources</h1>
                <p>Learning resources assigned to your account</p>
              </div>
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                Loading resources...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
        <div className="main">
          <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <div className="content">
            <div className="resources-student">
              <div className="resources-header-student">
                <h1>Resources</h1>
                <p>Learning resources assigned to your account</p>
              </div>
              <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <div className="resources-student">
            <div className="resources-header-student">
              <h1>Resources</h1>
              <p>Learning resources assigned to your account</p>
            </div>

            <div className="resources-card">
            <div className="resources-list">
              {resources.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No resources available
                  </div>
                ) : (
                  resources.map((resource) => (
                    <div key={resource.id} className="resource-item">
                      <div className="resource-header">
                        <h3>{resource.title}</h3>
                        <span className="status-badge">{resource.isActive ? "Available" : "Unavailable"}</span>
                      </div>
                      <div className="resource-actions">
                        <input
                          type="text"
                          className="resource-url"
                          value={resource.url}
                          readOnly
                        />
                        <button
                          className="open-btn"
                          onClick={() => handleOpen(resource.url)}
                          disabled={!resource.isActive}
                        >
                          Open
                        </button>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(resource.url, resource.id)}
                          disabled={!resource.isActive}
                        >
                          {copiedId === resource.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
