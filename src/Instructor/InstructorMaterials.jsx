import { useEffect, useState } from "react";
import { FiExternalLink, FiFileText, FiTrash2 } from "react-icons/fi";
import { apiService } from "../services/apiService.js";

function formatFileSize(size) {
  if (!size) return "";
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function classLabel(item) {
  return `${item.subjectCode} · ${item.sectionCode} · ${item.subjectTitle}`;
}

export default function InstructorMaterials({ classes }) {
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [mode, setMode] = useState("file");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selectedClass = classes.find(item => item.id === selectedScheduleId) || classes[0] || null;
  const activeScheduleId = selectedClass?.id;

  useEffect(() => {
    if (!activeScheduleId) return undefined;
    let active = true;
    // This effect owns loading state for its cancellable request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiService.getInstructorClassMaterials(activeScheduleId)
      .then(items => {
        if (active) {
          setMaterials(items);
          setError("");
        }
      })
      .catch(requestError => {
        if (active) {
          setMaterials([]);
          setError(requestError.message || "Unable to load class materials.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeScheduleId]);

  async function shareMaterial(event) {
    event.preventDefault();
    if (mode === "file" && !file) {
      setError("Choose a file to share.");
      return;
    }
    if (mode === "link" && !url.trim()) {
      setError("Enter an HTTPS link to share.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (mode === "file") formData.append("file", file);
    else formData.append("url", url.trim());

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await apiService.createInstructorClassMaterial(selectedClass.id, formData);
      setMaterials(await apiService.getInstructorClassMaterials(selectedClass.id));
      setTitle("");
      setDescription("");
      setUrl("");
      setFile(null);
      event.currentTarget.reset();
      setNotice(result.message || "Class material shared with enrolled students.");
    } catch (requestError) {
      setError(requestError.message || "Unable to share this class material.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMaterial(material) {
    if (!window.confirm(`Remove "${material.title}" from this class? Enrolled students will be notified.`)) return;
    setError("");
    setNotice("");
    try {
      const result = await apiService.deleteInstructorClassMaterial(material.id);
      setMaterials(current => current.filter(item => item.id !== material.id));
      setNotice(result.message || "Class material removed.");
    } catch (requestError) {
      setError(requestError.message || "Unable to remove this class material.");
    }
  }

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
    <div className="instructor-materials-layout">
      <section className="instructor-panel">
        <div className="instructor-panel-heading">
          <div>
            <h2>Share class material</h2>
            <p>Share a file or a trusted HTTPS resource with students enrolled in a class.</p>
          </div>
        </div>
        <form onSubmit={shareMaterial}>
          <label className="instructor-field">
            Class
            <select
              required
              value={selectedClass?.id || ""}
              onChange={event => {
                setSelectedScheduleId(event.target.value);
                setNotice("");
              }}
            >
              {classes.map(item => <option key={item.id} value={item.id}>{classLabel(item)}</option>)}
            </select>
          </label>
          <div className="instructor-material-mode" role="group" aria-label="Material type">
            <button type="button" className={mode === "file" ? "active" : ""} onClick={() => setMode("file")}>Upload a file</button>
            <button type="button" className={mode === "link" ? "active" : ""} onClick={() => setMode("link")}>Share a link</button>
          </div>
          <label className="instructor-field">
            Title
            <input required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Week 2 reading" />
          </label>
          <label className="instructor-field">
            Description <span className="instructor-material-optional">(optional)</span>
            <textarea maxLength={1000} rows={3} value={description} onChange={event => setDescription(event.target.value)} placeholder="Add context for your students" />
          </label>
          {mode === "file" ? (
            <label className="instructor-field">
              File
              <input
                type="file"
                accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
                onChange={event => setFile(event.target.files?.[0] || null)}
              />
              <small className="instructor-material-help">PDF, DOCX, PPTX, XLSX, CSV, TXT, PNG, or JPEG; up to 20 MB.</small>
            </label>
          ) : (
            <label className="instructor-field">
              HTTPS link
              <input type="url" maxLength={2000} value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" />
            </label>
          )}
          {error && <div className="instructor-alert error" role="alert">{error}</div>}
          {notice && <div className="instructor-alert success" role="status">{notice}</div>}
          <button type="submit" className="instructor-primary-button" disabled={saving || !selectedClass}>
            {saving ? "Sharing…" : "Share with class"}
          </button>
        </form>
      </section>

      <section className="instructor-panel">
        <div className="instructor-panel-heading">
          <div>
            <h2>Shared materials</h2>
            <p>{selectedClass ? classLabel(selectedClass) : "Select an assigned class"}</p>
          </div>
          <span className="instructor-material-count">{materials.length}</span>
        </div>
        {loading ? (
          <p role="status" className="instructor-material-help">Loading class materials…</p>
        ) : materials.length === 0 ? (
          <div className="instructor-table-empty">No materials have been shared with this class yet.</div>
        ) : (
          <div className="instructor-material-list">
            {materials.map(material => (
              <article className="instructor-material-card" key={material.id}>
                <span className="instructor-material-icon"><FiFileText aria-hidden="true" /></span>
                <div className="instructor-material-copy">
                  <strong>{material.title}</strong>
                  {material.description && <p>{material.description}</p>}
                  <small>
                    {material.originalFileName
                      ? `${material.originalFileName}${material.fileSize ? ` · ${formatFileSize(material.fileSize)}` : ""}`
                      : "External HTTPS link"}
                  </small>
                </div>
                <div className="instructor-material-actions">
                  {material.url ? (
                    <a href={material.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${material.title}`}><FiExternalLink /></a>
                  ) : (
                    <button type="button" onClick={() => downloadMaterial(material)} disabled={downloadingId === material.id} aria-label={`Download ${material.title}`}>
                      {downloadingId === material.id ? "…" : <FiFileText />}
                    </button>
                  )}
                  <button type="button" className="remove" onClick={() => removeMaterial(material)} aria-label={`Remove ${material.title}`}><FiTrash2 /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
