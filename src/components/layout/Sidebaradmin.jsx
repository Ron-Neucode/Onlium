import "./sidebar.css";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard",          icon: "⊞", to: "/admin/dashboard" },
  { label: "Student Management", icon: "≡", to: "/admin/students" },
  { label: "Resources",          icon: "⚇", to: "/admin/resources" },
  { label: "Course Curriculum",  icon: "⊟", to: "/admin/curriculum" },
  { label: "Bulletin",           icon: "🔔", to: "/admin/bulletin" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">ONLIUM</span>
        <span className="sidebar-sub">Acad. Data · SY 2026</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <span className="nav-icon">⏻</span>
          Logout
        </button>
      </div>
    </aside>
  );
}