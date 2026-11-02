import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import EditProfileModal from "../Profile/EditProfileModal";
import { apiService } from "../../services/apiService.js";
import { authService } from "../../services/authService.js";
import "./styles/Topbar.css";

export default function Topbar({ onMenuToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ firstName: "", lastName: "", email: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const photoObjectUrl = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const user = authService.getUserSession();
      if (user) {
        setCurrentUser(current => ({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          yearLevel: user.yearLevel || "",
          program: user.program || "",
          studentId: user.studentId || "",
          section: user.section || "",
          photo: current.photo || null,
        }));
      }
    };

    loadUser();
    window.addEventListener("onlium_profile_updated", loadUser);
    return () => {
      window.removeEventListener("onlium_profile_updated", loadUser);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStudentData = async () => {
      try {
        const [profile, applications, userNotifications] = await Promise.all([
          apiService.getMyStudentProfile(),
          apiService.getMyApplications(),
          apiService.getMyNotifications(),
        ]);
        if (!isMounted) return;

        const user = authService.getUserSession() || {};
        const studentId = profile.studentIdNumber || "";
        const firstName = profile.firstName || user.firstName || "";
        const lastName = profile.lastName || user.lastName || "";
        delete user.photo;
        authService.updateUserSession({ firstName, lastName, studentId });
        setCurrentUser((current) => ({ ...current, firstName, lastName, studentId, photo: null }));
        setStudentProfile(profile);
        setEnrollment(applications[0] || null);
        setNotifications(userNotifications.slice(0, 5));
        if (profile.photoUrl) {
          try {
            const photo = await apiService.getMyStudentPhoto();
            if (!isMounted || !photo) return;
            if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current);
            photoObjectUrl.current = URL.createObjectURL(photo);
            setCurrentUser((current) => ({ ...current, photo: photoObjectUrl.current }));
          } catch (photoError) {
            console.error("Failed to load student profile photo.", photoError);
          }
        }
      } catch (error) {
        if (isMounted) console.error("Failed to load student portal data.", error);
      }
    };

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") loadStudentData();
    };

    loadStudentData();
    window.addEventListener("focus", loadStudentData);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", loadStudentData);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = () => {
    const u = authService.getUserSession() || currentUser;
    const first = u.firstName?.charAt(0)?.toUpperCase() || "";
    const last = u.lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "??";
  };

  const getFullName = () => {
    const u = authService.getUserSession() || currentUser;
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
    return u.firstName || u.lastName || "Guest";
  };

  const getPhoto = () => {
    const u = authService.getUserSession() || currentUser;
    return currentUser.photo || u.photo || null;
  };

  const getStudentId = () => {
    if (currentUser.studentId) return currentUser.studentId;
    if (!enrollment) return "Not enrolled";
    const status = enrollment.status?.replace(/\s/g, "").toLowerCase();
    return status === "approved" || status === "completed" ? "ID pending" : "Pending approval";
  };

  const handleNotificationClick = async (id) => {
    setIsOpen(false);
    if (id) {
      try {
        const notification = notifications.find(item => item.id === id);
        if (notification && !notification.isRead) await apiService.markNotificationAsRead(id);
      } catch (error) {
        console.error("Failed to mark notification as read.", error);
      }
    }
    navigate("/student/notifications");
  };

  const formatNotificationTime = value => value
    ? new Date(value).toLocaleString()
    : "";

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handlePhotoUpdated = (photo) => {
    if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current);
    photoObjectUrl.current = photo;
    setCurrentUser((current) => ({ ...current, photo }));
  };

  const handleProfileUpdated = (profile) => {
    setStudentProfile(profile);
    setCurrentUser((current) => ({
      ...current,
      firstName: profile.firstName,
      lastName: profile.lastName,
      studentId: profile.studentIdNumber || "",
    }));
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="search-bar">
        <svg
          className="search-icon"
          width="15"
          height="15"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          placeholder="Search subjects, resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              navigate(`/student/resources?search=${encodeURIComponent(searchQuery.trim())}`);
              setSearchQuery("");
            }
          }}
        />
      </div>

      <div className="topbar-right">
        <div className="notification-dropdown-container" ref={dropdownRef}>
          <button
            className="notification-btn"
            aria-label="Notifications"
            onClick={() => setIsOpen(!isOpen)}
          >
            <IoNotificationsOutline size={22} />
          </button>

          {isOpen && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Notifications</span>
                <button className="view-all-btn" onClick={() => handleNotificationClick()}>
                  View all
                </button>
              </div>
              <div className="notification-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="notification-dropdown-item">
                    <div className="notification-content"><p className="notification-message">No notifications</p></div>
                  </div>
                ) : notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-dropdown-item ${notif.isRead ? "" : "unread"}`}
                    onClick={() => handleNotificationClick(notif.id)}
                  >
                    {!notif.isRead && <div className="notification-dot"></div>}
                    <div className="notification-content">
                      <p className="notification-title">{notif.title}</p>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{formatNotificationTime(notif.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-chip" onClick={handleProfileToggle} style={{ cursor: 'pointer' }}>
          <div className="avatar-container">
            {getPhoto()
              ? <img src={getPhoto()} alt="avatar" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e5e9f0" }} />
              : <div className="avatar">{getInitials()}</div>
            }
            <div className="avatar-arrow">
              <IoIosArrowDown size={10} />
            </div>
          </div>
          <div>
            <div className="profile-name">{getFullName()}</div>
            <div className="profile-id" style={{ color: enrollment && !["approved", "completed"].includes(enrollment.status?.replace(/\s/g, "").toLowerCase()) ? "#ea580c" : undefined }}>{getStudentId()}</div>
          </div>
        </div>

        <EditProfileModal
          isOpen={isProfileOpen}
          onClose={handleProfileClose}
          currentUser={currentUser}
          application={enrollment}
          profile={studentProfile}
          onPhotoUpdated={handlePhotoUpdated}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </div>
  );
}