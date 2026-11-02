import { useState, useEffect } from "react";
import "./styles/Sidebar.css";
import { NAV_ITEMS } from "../data/navItems";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import { CiLogout } from "react-icons/ci";

export default function Sidebar({ activeNav, onNavChange, mobileOpen, onMobileClose, hideLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState({ firstName: "", lastName: "", photo: null });
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("onlium_current_user");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser({ firstName: u.firstName || "", lastName: u.lastName || "", photo: u.photo || null });
      }
    };
    load();
    window.addEventListener("onlium_profile_updated", load);
    const interval = setInterval(load, 300);
    return () => { window.removeEventListener("onlium_profile_updated", load); clearInterval(interval); };
  }, []);

  const getInitials = () => {
    const f = currentUser.firstName?.charAt(0)?.toUpperCase() || "";
    const l = currentUser.lastName?.charAt(0)?.toUpperCase() || "";
    return f + l || "??";
  };

  const getFullName = () => {
    if (currentUser.firstName && currentUser.lastName) return `${currentUser.firstName} ${currentUser.lastName}`;
    return currentUser.firstName || currentUser.lastName || "Guest";
  };

  function handleClick(item) {
    if (onNavChange) onNavChange(item.label);
    if (item.to) navigate(item.to);
    if (onMobileClose) onMobileClose();
  }

  function handleLogout() {
    localStorage.removeItem("onlium_current_user");
    navigate("/");
  }

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-row">
          <div className="brand-icon">ONL</div>

          <div className="brand-text">
            <div className="brand-name">ONLIUM</div>
            <div className="brand-sub">Student Portal</div>
          </div>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FaBars />
          </button>
        </div>
      </div>

      <div className="sidebar-section">Main Menu</div>

      <nav>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            role="button"
            tabIndex={0}
            title={collapsed ? item.label : ""}
            className={`nav-item ${activeNav === item.label ? "active" : ""}`}
            onClick={() => handleClick(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(item);
              }
            }}
          >
            <div className="nav-left">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>

            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      {!hideLogout && (
      <button type="button" className="logout-btn" onClick={handleLogout}>
        <CiLogout className="logout-icon" />
        <span className="logout-label">Logout</span>
      </button>
      )}
    </aside>
    </>
  );
}