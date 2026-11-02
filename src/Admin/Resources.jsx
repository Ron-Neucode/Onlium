import { useCallback, useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService.js";
import "./styles/Resources.css";

const RESOURCE_TYPES = ["Exam", "Quiz"];
const emptyForm = { resourceType: "Exam", title: "", url: "" };

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ResourcesAdmin() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [filterType, setFilterType] = useState("All");

  const loadResources = useCallback(async () => {
    try {
      const data = await apiService.getResources();
      setError("");
      setResources(data);
    } catch (err) {
      setError(err.message || "Failed to load learning resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiService.getResources()
      .then((data) => {
        if (active) setResources(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load learning resources.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const refreshResources = () => {
    setLoading(true);
    setError("");
    void loadResources();
  };

  const filteredResources = useMemo(
    () => resources.filter((resource) => filterType === "All" || resource.resourceType === filterType),
    [filterType, resources],
  );

  const openCreateForm = () => {
    setEditingResource(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormVisible(true);
  };

  const openEditForm = (resource) => {
    setEditingResource(resource);
    setForm({
      resourceType: resource.resourceType,
      title: resource.title || "",
      url: resource.url || "",
    });
    setFormError("");
    setFormVisible(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError("Resource title is required.");
      return;
    }
    if (!form.url.trim() || !isValidUrl(form.url.trim())) {
      setFormError("Enter a valid URL starting with http:// or https://.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      let result;
      if (editingResource) {
        result = await apiService.updateResource(
          editingResource.id,
          form.title.trim(),
          form.url.trim(),
          true,
        );
      } else {
        result = await apiService.createResource(
          form.resourceType,
          form.title.trim(),
          form.url.trim(),
        );
      }
      setNotice(result.message || "Resource saved and eligible students notified.");
      setFormVisible(false);
      setEditingResource(null);
      setForm({ ...emptyForm });
      setLoading(true);
      await loadResources();
    } catch (err) {
      setFormError(err.message || "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete the ${resource.resourceType} resource "${resource.title}"?`)) return;
    try {
      const result = await apiService.deleteResource(resource.id);
      setNotice(result.message || "Resource deleted.");
      setLoading(true);
      await loadResources();
    } catch (err) {
      setError(err.message || "Failed to delete resource.");
    }
  };

  return (
    <section className="resources-admin">
      <header className="resources-header">
        <div className="header-left">
          <h1>Learning Resources</h1>
          <p>Create LMS exam and quiz links. Active resources notify eligible students.</p>
        </div>
        {!formVisible && (
          <button className="post-link-btn" onClick={openCreateForm}>+ Add Resource</button>
        )}
      </header>

      {notice && (
        <div className="resource-notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button>
        </div>
      )}

      {formVisible && (
        <form className="resources-form-card" onSubmit={handleSubmit}>
          <div className="resource-form-heading">
            <h2>{editingResource ? "Edit Learning Resource" : "Add Learning Resource"}</h2>
            <button type="button" className="cancel-btn" onClick={() => { setFormVisible(false); setFormError(""); }}>
              Cancel
            </button>
          </div>

          {!editingResource && (
            <div className="form-group resource-type-picker">
              <label htmlFor="resource-type">Resource Type *</label>
              <select
                id="resource-type"
                className="form-select"
                value={form.resourceType}
                onChange={(event) => setForm({ ...form, resourceType: event.target.value })}
              >
                {RESOURCE_TYPES.map((type) => <option key={type} value={type}>LMS {type}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resource-title">Title *</label>
            <input
              id="resource-title"
              className="form-input"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Enter resource title"
              maxLength={200}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="resource-url">LMS URL *</label>
            <input
              id="resource-url"
              className="form-input"
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
              placeholder="https://..."
              type="url"
              required
            />
            <span className="helper-text">Only HTTP and HTTPS links are supported.</span>
          </div>

          <div className="resource-notice resource-notice--info">
            The active exam and quiz links are managed separately. Saving an active resource replaces the previous link of the same type and notifies eligible BSIT/BSCS students.
          </div>
          {formError && <p className="resource-error" role="alert">{formError}</p>}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => { setFormVisible(false); setFormError(""); }} disabled={saving}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Saving…" : editingResource ? "Update Resource" : "Add Resource & Notify"}
            </button>
          </div>
        </form>
      )}

      {!formVisible && (
        <>
          <div className="resource-stats">
            {RESOURCE_TYPES.map((type) => (
              <div className="resource-stat" key={type}>
                <span>Active LMS {type} links</span>
                <strong>{resources.filter((resource) => resource.resourceType === type && resource.isActive).length}</strong>
              </div>
            ))}
          </div>

          <div className="resource-toolbar">
            <label htmlFor="resource-filter">Filter by type</label>
            <select id="resource-filter" className="form-select" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="All">All Types</option>
              {RESOURCE_TYPES.map((type) => <option key={type} value={type}>LMS {type}</option>)}
            </select>
            <button className="cancel-btn" onClick={refreshResources} disabled={loading}>Refresh</button>
          </div>

          {loading ? (
            <div className="resources-list"><p className="empty-state">Loading learning resources…</p></div>
          ) : error ? (
            <div className="resources-list resource-error" role="alert">
              <p>{error}</p>
              <button className="submit-btn" onClick={refreshResources}>Try again</button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="resources-list"><p className="empty-state">No active resources found. Add an LMS exam or quiz link to get started.</p></div>
          ) : (
            <div className="resource-table-wrap">
              <table className="resource-table">
                <thead>
                  <tr><th>Type</th><th>Title</th><th>URL</th><th>Updated</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => (
                    <tr key={resource.id}>
                      <td>{resource.resourceType}</td>
                      <td>{resource.title}</td>
                      <td><a href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a></td>
                      <td>{resource.updatedAt || resource.createdAt ? new Date(resource.updatedAt || resource.createdAt).toLocaleDateString() : "—"}</td>
                      <td>{resource.isActive ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="resource-actions">
                          <button className="view-btn" onClick={() => openEditForm(resource)}>Edit</button>
                          <button className="resource-delete-btn" onClick={() => handleDelete(resource)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
