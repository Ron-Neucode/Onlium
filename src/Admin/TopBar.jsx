import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import "./styles/topbar.css";



export default function TopBar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const pageTitle = {
    "/admin": "Dashboard",
    "/admin/dashboard": "Dashboard",
    "/admin/students": "Student Management",
    "/admin/curriculum": "Study Load & Curriculum Management",
    "/admin/sections": "Sections & Class Schedules",
    "/admin/instructors": "Instructor Accounts",
    "/admin/classrooms": "Classroom Management",
    "/admin/resources": "Resources",
    "/admin/bulletin": "Bulletin",
    "/admin/appointments": "Appointments",
    "/admin/payment-verification": "Payment Verification",
  }[location.pathname] || "Admin";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left"><span className="topbar-page-title">{pageTitle}</span></div>
      <div className="search-bar">
        <svg className="search-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          placeholder="Search students, resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="topbar-right">
        <div className="notification-dropdown-container" ref={dropdownRef}>
          <button className="notification-btn" aria-label="Notifications" onClick={() => setIsOpen(!isOpen)}>
            <IoNotificationsOutline size={22} />

          </button>

          {isOpen && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <span>Notifications</span>
                <button className="view-all-btn" onClick={() => setIsOpen(false)}>View all</button>
              </div>
              <div className="notification-dropdown-list">
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "24px 0" }}>No notifications</p>
              </div>
            </div>
          )}
        </div>

        <div className="profile-chip">
          <div className="avatar-container">
            <div className="avatar">AA</div>
            <div className="avatar-arrow"><IoIosArrowDown size={10} /></div>
          </div>
          <div>
            <div className="profile-name">Admin Account</div>
            <div className="profile-id">Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
}
