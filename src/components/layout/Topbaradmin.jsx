import "./topbar.css";

export default function TopBar({ title = "Dashboard", subtitle = "SY 2026" }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <span className="topbar-sub">{subtitle}</span>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <div className="topbar-avatar" title="Admin">A</div>
      </div>
    </header>
  );
}