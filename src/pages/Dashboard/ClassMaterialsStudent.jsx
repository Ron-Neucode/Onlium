import { useEffect, useState } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { apiService } from "../../services/apiService.js";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./styles/ClassMaterialsStudent.css";

function formatFileSize(size) {
  if (!size) return "";
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClassMaterialsStudent() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    apiService.getStudentClassMaterials()
      .then(items => {
        if (active) {
          setMaterials(items);
          setError("");
        }
      })
      .catch(requestError => {
        if (active) setError(requestError.message || "Unable to load class materials.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function downloadMaterial(material) {
    setDownloadingId(material.id);
    setError("");
    try {
      const blob = await apiService.downloadClassMaterial(material.id);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = material.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (requestError) {
      setError(requestError.message || "Unable to download this class material.");
    } finally {
      setDownloadingId("");
    }
  }

  return (
    <div className="portal">
      <Sidebar activeNav="Class Materials" mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(current => !current)} />
        <div className="content">
          <header className="student-materials-heading">
            <div>
              <h1>Class Materials</h1>
              <p>Files and links shared by instructors for your enrolled classes.</p>
            </div>
          </header>
          {error && <div className="student-materials-error" role="alert">{error}</div>}
          {loading ? (
            <p className="student-materials-empty" role="status">Loading class materials…</p>
          ) : materials.length === 0 ? (
            <section className="student-materials-empty">No class materials have been shared with your enrolled classes yet.</section>
          ) : (
            <div className="student-materials-list">
              {materials.map(material => (
                <article className="student-material-card" key={material.id}>
                  <span className="student-material-icon"><FiFileText aria-hidden="true" /></span>
                  <div className="student-material-copy">
                    <strong>{material.title}</strong>
                    <p className="student-material-class">
                      {material.subjectCode} · {material.sectionCode} · {material.subjectTitle}
                    </p>
                    {material.description && <p className="student-material-description">{material.description}</p>}
                    <small>
                      {material.originalFileName
                        ? `${material.originalFileName}${material.fileSize ? ` · ${formatFileSize(material.fileSize)}` : ""}`
                        : "External HTTPS link"}
                      {" · "}{new Date(material.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  {material.url ? (
                    <a className="student-material-action" href={material.url} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink aria-hidden="true" /> Open link
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="student-material-action"
                      onClick={() => downloadMaterial(material)}
                      disabled={downloadingId === material.id}
                    >
                      <FiDownload aria-hidden="true" />
                      {downloadingId === material.id ? "Downloading…" : "Download"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
