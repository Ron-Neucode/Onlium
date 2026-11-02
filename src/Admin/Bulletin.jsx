import { useState, useEffect } from "react";
import { apiService } from "../services/apiService.js";
import "./styles/Bulletin.css";

export default function Bulletin() {
  const [view, setView] = useState("dashboard"); // dashboard | create | publish
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBulletins();
  }, []);

  const loadBulletins = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminBulletins();
      setPosts(data.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        audience: "All Students",
        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        scheduled: false,
        link: "",
        isPublished: p.isPublished
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState({});

  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setTitle(""); setContent(""); setLink(""); setErrors({}); setEditPost(null);
  }

  function resetPublish() {
    // Simplified - API doesn't support specific targeting or scheduling
  }

  function validateForm() {
    const errs = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!content.trim()) errs.content = "Content is required.";
    return errs;
  }

  async function handleNext() {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      if (editPost) {
        await apiService.updateBulletin(editPost.id, title, content, true);
        showToast("Bulletin updated successfully!");
      } else {
        await apiService.createBulletin(title, content);
        showToast("Published to all students!");
      }
      await loadBulletins();
      setView("dashboard");
      resetForm();
    } catch (err) {
      showToast(err.message || "Failed to publish bulletin", "error");
    }
  }

  async function handlePublish() {
    try {
      if (editPost) {
        await apiService.updateBulletin(editPost.id, title, content, true);
        showToast("Bulletin updated successfully!");
      } else {
        await apiService.createBulletin(title, content);
        showToast("Published to all students!");
      }
      await loadBulletins();
      setView("dashboard");
      resetForm();
      resetPublish();
    } catch (err) {
      showToast(err.message || "Failed to publish bulletin", "error");
    }
  }

  function handleEdit(post) {
    setTitle(post.title);
    setContent(post.content);
    setLink(post.link || "");
    setEditPost(post);
    setErrors({});
    setView("create");
  }

  async function handleDelete(id) {
    try {
      await apiService.deleteBulletin(id);
      setPosts(posts.filter(p => p.id !== id));
      setDeleteConfirm(null);
      showToast("Post deleted.", "error");
    } catch (err) {
      showToast(err.message || "Failed to delete post", "error");
    }
  }

  // ── DASHBOARD ──
  if (view === "dashboard") {
    if (loading) {
      return (
        <div className="bulletin">
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading bulletins...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bulletin">
          <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
            {error}
          </div>
        </div>
      );
    }

    return (
      <div className="bulletin">
        {toast && (
          <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "14px 20px", borderRadius: 10, background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`, color: toast.type === "error" ? "#dc2626" : "#16a34a", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            {toast.type === "error" ? "✕" : "✓"} {toast.msg}
          </div>
        )}

        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Bulletin</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Create and manage announcements for students</p>
          </div>
          <button className="publish-btn" onClick={() => { resetForm(); setView("create"); }}>+ Create Post</button>
        </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Posts", value: posts.length, color: "#3b82f6" },
          { label: "Published", value: posts.filter(p => !p.scheduled).length, color: "#16a34a" },
          { label: "Scheduled", value: posts.filter(p => p.scheduled).length, color: "#d97706" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 24px", flex: 1 }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="posts-list">
        {posts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>No posts yet. Click "Create Post" to get started.</div>}
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ margin: 0 }}>{post.title}</h3>
                  {post.scheduled && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fcd34d" }}>Scheduled</span>}
                </div>
                <p className="post-meta">Posted {post.date} · <strong>{post.audience}</strong></p>
              </div>
              <div className="post-actions">
                <button className="edit-btn" onClick={() => handleEdit(post)}>Edit</button>
                <button className="delete-btn" onClick={() => setDeleteConfirm(post.id)}>Delete</button>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {post.link && <a href={post.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Attached Link
            </a>}
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>Delete Post</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Are you sure you want to delete this post?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: 12, background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── CREATE POST ──
  if (view === "create") return (
    <div className="bulletin">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{editPost ? "Edit Post" : "Create Post"}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Step 1 of 2 — Write your bulletin</p>
        </div>
        <button onClick={() => { setView("dashboard"); resetForm(); }} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
      </div>

      <div className="create-post-card" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Title *</label>
          <input className="post-input" placeholder="e.g. Enrollment Deadline Extended" value={title} onChange={e => setTitle(e.target.value)} style={{ borderColor: errors.title ? "#ef4444" : undefined }} />
          {errors.title && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.title}</span>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Content / Message *</label>
          <textarea className="post-textarea" placeholder="Write your announcement here..." value={content} onChange={e => setContent(e.target.value)} style={{ borderColor: errors.content ? "#ef4444" : undefined, minHeight: 160 }} />
          {errors.content && <span style={{ fontSize: 11, color: "#ef4444" }}>{errors.content}</span>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Attachment Link <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none" }}>(optional)</span></label>
          <input className="post-input" placeholder="https://drive.google.com/..." value={link} onChange={e => setLink(e.target.value)} />
          <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>Paste a Google Drive, LMS, or any external link</span>
        </div>

        <button className="publish-btn" onClick={handleNext}>
          {editPost ? "Update Bulletin" : "Publish to All Students"}
        </button>
      </div>
    </div>
  );

  // ── PUBLISH OPTIONS (Removed - API doesn't support these features) ──
  if (view === "publish") return null;
}}
