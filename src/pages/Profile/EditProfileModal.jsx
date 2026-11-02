import { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/apiService.js";
import "./styles/EditProfileModal.css";

export default function EditProfileModal({ isOpen, onClose, currentUser, application, profile, onPhotoUpdated, onProfileUpdated }) {
  const modalRef = useRef(null);
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", address: "", birthDate: "" });
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      phoneNumber: profile?.phoneNumber || application?.phoneNumber || "",
      address: profile?.address || application?.address || "",
      birthDate: (profile?.birthDate || application?.birthDate || "").slice(0, 10),
    });
    setError("");
    setPhoto(currentUser?.photo || null);
  }, [isOpen, currentUser, profile, application]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
        setEditing(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const getInitials = () => {
    const first = form.firstName?.charAt(0)?.toUpperCase() || "";
    const last = form.lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "??";
  };

  const getFullName = () => {
    if (form.firstName && form.lastName) return `${form.firstName} ${form.lastName}`;
    return form.firstName || form.lastName || "Guest";
  };

  const getStudentId = () => {
    if (currentUser?.studentId) return currentUser.studentId;
    if (!application) return "Not enrolled yet";
    const status = application.status?.replace(/\s/g, "").toLowerCase();
    return status === "approved" || status === "completed" ? "Awaiting ID" : "Pending approval";
  };

  const getYearLevel = () => {
    if (!application) return "Not enrolled yet";
    const status = application.status?.replace(/\s/g, "").toLowerCase();
    if (status !== "approved" && status !== "completed") return "Pending approval";
    if (!application.yearLevel) return "Not provided";
    const yearLevel = Number(application.yearLevel);
    const suffix = yearLevel === 1 ? "st" : yearLevel === 2 ? "nd" : yearLevel === 3 ? "rd" : "th";
    return `${yearLevel}${suffix} Year`;
  };

  const getProgram = () => {
    if (!application) return "Not enrolled yet";
    const status = application.status?.replace(/\s/g, "").toLowerCase();
    if (status !== "approved" && status !== "completed") return "Pending approval";
    return application.programCode || "Not provided";
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updatedProfile = await apiService.updateMyStudentProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        address: form.address.trim() || null,
        birthDate: form.birthDate || null,
      });
      const updated = {
        ...currentUser,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
      };
      delete updated.photo;
      localStorage.setItem("onlium_current_user", JSON.stringify(updated));
      onProfileUpdated?.(updatedProfile);
      setForm(current => ({
        ...current,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
      }));
      window.dispatchEvent(new Event("onlium_profile_updated"));
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditing(false); }, 1500);
    } catch (saveError) {
      setError(saveError.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploadingPhoto(true);
    try {
      await apiService.uploadMyStudentPhoto(file);
      const image = await apiService.getMyStudentPhoto();
      if (!image) throw new Error("The uploaded profile photo could not be loaded.");
      const photoUrl = URL.createObjectURL(image);
      setPhoto(photoUrl);
      onPhotoUpdated?.(photoUrl);
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("onlium_current_user");
    window.location.href = "/register/login";
  };

  if (!isOpen) return null;

  return (
    <div className="profile-info-dropdown" ref={modalRef}>
      <div className="profile-info-header">
        <div style={{ position: "relative", flexShrink: 0 }}>
          {photo
            ? <img src={photo} alt="avatar" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e9f0" }} />
            : <div className="profile-info-avatar">{getInitials()}</div>
          }
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            disabled={uploadingPhoto}
            aria-label={uploadingPhoto ? "Uploading profile photo" : "Upload profile photo"}
            style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: "50%", background: "#2563eb", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <svg width="9" height="9" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handlePhotoChange} />
        </div>
        <div className="profile-info-name">
          <div className="profile-info-fullname">{getFullName()}</div>
          <button className="profile-info-edit-link" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>First Name</label>
              <input
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Last Name</label>
              <input
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
              <input
                value={form.email}
                readOnly
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Phone Number</label>
              <input
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Address</label>
              <input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Date of Birth</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => setForm({ ...form, birthDate: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Student ID</label>
              <input
                value={currentUser?.studentId || ""}
                readOnly
                placeholder="Assigned after enrollment approval"
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", marginTop: 4 }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "9px", borderRadius: 8, background: saved ? "#16a34a" : "#2563eb", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background .2s" }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
            </button>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
              Profile details and photos are saved to your student record. Email and official enrollment details cannot be changed here.
            </p>
            {error && <p role="alert" style={{ margin: 0, color: "#b91c1c", fontSize: 12 }}>{error}</p>}
          </div>
          <div className="profile-info-divider" />
        </div>
      )}

      <div className="profile-info-divider" style={{ marginTop: editing ? 0 : undefined }} />

      <div className="profile-info-list">
        {/* Student ID — read only */}
        <div className="profile-info-item">
          <svg className="profile-info-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
            <line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="12" y2="13"/>
          </svg>
          <div className="profile-info-content">
            <div className="profile-info-label">Student ID</div>
            <div className="profile-info-value" style={{ color: application && !["approved", "completed"].includes(application.status?.replace(/\s/g, "").toLowerCase()) ? "#ea580c" : undefined }}>{getStudentId()}</div>
          </div>
        </div>

        <div className="profile-info-item">
          <svg className="profile-info-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
          <div className="profile-info-content">
            <div className="profile-info-label">Year Level</div>
            <div className="profile-info-value" style={{ color: application && !["approved", "completed"].includes(application.status?.replace(/\s/g, "").toLowerCase()) ? "#ea580c" : undefined }}>{getYearLevel()}</div>
          </div>
        </div>

        <div className="profile-info-item">
          <svg className="profile-info-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          <div className="profile-info-content">
            <div className="profile-info-label">Program</div>
            <div className="profile-info-value" style={{ color: application && !["approved", "completed"].includes(application.status?.replace(/\s/g, "").toLowerCase()) ? "#ea580c" : undefined }}>{getProgram()}</div>
          </div>
        </div>
      </div>

      <div className="profile-info-divider"></div>

      <button className="profile-info-logout" onClick={handleLogout}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Logout
      </button>
    </div>
  );
}
