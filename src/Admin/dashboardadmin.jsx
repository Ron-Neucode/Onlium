import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService.js";
import "./styles/dashboardadmin.css";

const initials = (name) => name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

function formatActivityTime(value) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    enrolled: 0,
    pendingApplications: 0,
    appointmentsToday: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingReview, setPendingReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const loadDashboardData = async () => {
      try {
        const [statsData, applications] = await Promise.all([
          apiService.getAdminDashboardStats(),
          apiService.getAdminApplications(),
        ]);
        if (!active) return;
        setStats(statsData);
        const pendingApplications = applications.filter(
          app => app.status?.replace(/\s/g, "").toLowerCase() === "pendingreview",
        );
        setPendingReview(pendingApplications.slice(0, 4).map(app => ({
          id: app.id,
          initials: initials(`${app.firstName} ${app.lastName}`),
          color: "#3b82f6",
          name: `${app.lastName}, ${app.firstName}`,
          program: `${app.programCode} - ${app.studentType}`
        })));
        setRecentActivity(applications.slice(0, 5).map(app => ({
          id: app.id,
          name: `${app.firstName} ${app.lastName}`.trim() || "Student",
          action: `${app.programCode} application · ${app.status}`,
          time: formatActivityTime(app.submittedAt || app.createdAt),
        })));
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadDashboardData();
    return () => { active = false; };
  }, []);

  const handleReview = (id) => {
    navigate("/admin/students", { state: { applicationId: id } });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: "center", padding: "40px", color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-row">
        <div className="card stat-card">
          <p className="stat-label">Total Students</p>
          <p className="stat-value">{stats.totalStudents.toLocaleString()}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Enrolled</p>
          <p className="stat-value">{stats.enrolled.toLocaleString()}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Pending Applications</p>
          <p className="stat-value">{stats.pendingApplications}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Appointments Today</p>
          <p className="stat-value">{stats.appointmentsToday}</p>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card activity-card">
          <p className="section-title">Recent Activity</p>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center" }}>No enrollment activity yet.</p>
            ) : recentActivity.map((a) => (
              <div key={a.id} className="activity-item">
                <div>
                  <span className="activity-name">{a.name}</span>{" "}
                  <span className="activity-action">{a.action}</span>
                </div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-right">
          <div className="card review-card">
            <p className="section-title">Pending for Review</p>
            <div className="review-list">
              {pendingReview.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  No pending applications
                </div>
              ) : (
                pendingReview.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-avatar" style={{ background: r.color }}>{r.initials}</div>
                    <div className="review-info">
                      <p className="review-name">{r.name}</p>
                      <p className="review-sub">{r.program}</p>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleReview(r.id)}
                    >
                      Review
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="card admin-quick-actions">
        <p className="section-title">Quick Actions</p>
        <div className="admin-quick-actions__grid">
          <button onClick={() => navigate("/admin/students", { state: { tab: "applications" } })}>Manage Enrollments</button>
          <button onClick={() => navigate("/admin/appointments")}>Manage Appointments</button>
          <button onClick={() => navigate("/admin/payment-verification")}>Validate Payment Receipts</button>
          <button onClick={() => navigate("/admin/curriculum")}>Study Load & Curriculum</button>
          <button onClick={() => navigate("/admin/sections")}>Manage Sections & Schedules</button>
          <button onClick={() => navigate("/admin/instructors")}>Review Instructor Accounts</button>
          <button onClick={() => navigate("/admin/classrooms")}>Classroom Management</button>
          <button onClick={() => navigate("/admin/resources")}>Learning Resources</button>
        </div>
      </section>
    </div>
  );
}