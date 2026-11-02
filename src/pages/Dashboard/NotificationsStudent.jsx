import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService.js";
import "./styles/NotificationsStudent.css";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

export default function NotificationsStudent() {
  const [activeNav, setActiveNav] = useState("Notifications");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.isRead) {
          await apiService.markNotificationAsRead(notification.id);
        }
      }
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      await loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const getBadgeStyle = (type) => {
    switch (String(type || "").toLowerCase()) {
      case "requirement":
        return { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
      case "bulletin":
        return { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
      case "application":
      case "appointment":
      case "payment":
        return { color: "#16a34a", bg: "#f0fdf4", border: "#86efac" };
      case "lms":
      case "resource":
        return { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" };
      case "studyload":
        return { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" };
      default:
        return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  const getGroup = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return "Earlier";
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const group = getGroup(notification.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push({
      id: notification.id,
      title: notification.title,
      description: notification.message,
      date: formatDate(notification.createdAt),
      badge: notification.notificationType,
      badgeType: String(notification.notificationType || "").toLowerCase(),
      group: group,
      isRead: notification.isRead
    });
    return acc;
  }, {});

  const groups = ["Today", "Yesterday", "Earlier"];

  if (loading) {
    return (
      <div className="portal">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
        <div className="main">
          <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <div className="content">
            <div style={{ padding: "28px 32px", flex: 1, maxWidth: 900, margin: "0 auto" }}>
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                Loading notifications...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
        <div className="main">
          <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <div className="content">
            <div style={{ padding: "28px 32px", flex: 1, maxWidth: 900, margin: "0 auto" }}>
              <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <div style={{ padding: "28px 32px", flex: 1, maxWidth: 900, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  Notifications
                </h1>
                <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                  Stay updated with your enrollment status
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    padding: "10px 18px",
                    background: "#fff",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Notifications Card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28 }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No notifications
                </div>
              ) : (
                groups.map((group, groupIndex) => {
                  const groupNotifications = groupedNotifications[group] || [];
                  if (groupNotifications.length === 0) return null;

                  return (
                    <div key={group} style={{ marginBottom: groupIndex < groups.length - 1 ? 28 : 0 }}>
                      <h3 style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: "#2563eb",
                        margin: "0 0 16px 0",
                        paddingBottom: 8,
                        borderBottom: "1px solid #eff6ff"
                      }}>
                        {group}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {groupNotifications.map((notification) => {
                          const badgeStyle = getBadgeStyle(notification.badgeType);
                          return (
                            <div
                              key={notification.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 16,
                                padding: 20,
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                transition: "all 0.2s",
                                cursor: "pointer"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#bfdbfe";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#e2e8f0";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 8px 0" }}>
                                  {notification.title}
                                </h4>
                                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                                  {notification.description}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{notification.date}</span>
                                  <span style={{
                                    padding: "3px 10px",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: badgeStyle.color,
                                    background: badgeStyle.bg,
                                    border: `1px solid ${badgeStyle.border}`
                                  }}>
                                    {notification.badge}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleView(notification.id)}
                                style={{
                                  padding: "8px 20px",
                                  background: "#fff",
                                  color: "#475569",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 8,
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#3b82f6";
                                  e.currentTarget.style.color = "#3b82f6";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#e2e8f0";
                                  e.currentTarget.style.color = "#475569";
                                }}
                              >
                                {notification.action || "View"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
