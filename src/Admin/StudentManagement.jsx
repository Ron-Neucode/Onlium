import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService.js";
import "./styles/StudentManagement.css";

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "active": return "status-active";
    case "pending": return "status-pending";
    case "approved": return "status-pending";
    case "inactive": return "status-inactive";
    case "completed": return "status-active";
    default: return "status-default";
  }
};

const BAR_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 110, fontSize: 12, color: "#475569", textAlign: "right", flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6, height: 22, overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: color || BAR_COLORS[i % BAR_COLORS.length], height: "100%", borderRadius: 6, transition: "width .4s", display: "flex", alignItems: "center", paddingLeft: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{d.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.applicationId || location.state?.tab === "applications" ? "applications" : "list",
  );
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentError, setStudentError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [applications, setApplications] = useState([]);
  const [applicationLoading, setApplicationLoading] = useState(
    Boolean(location.state?.applicationId || location.state?.tab === "applications"),
  );
  const [applicationError, setApplicationError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("PendingReview");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [applicationDetailsLoading, setApplicationDetailsLoading] = useState(false);
  const [applicationActionLoading, setApplicationActionLoading] = useState(false);
  const [applicationActionError, setApplicationActionError] = useState("");
  const [rejectingApplication, setRejectingApplication] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [studentActionError, setStudentActionError] = useState("");
  const [droppingApplicationId, setDroppingApplicationId] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      const params = {};
      if (filterGender !== "All") params.gender = filterGender;
      if (filterYear !== "All") params.yearLevel = Number.parseInt(filterYear, 10);
      if (filterDept !== "All") params.programCode = filterDept;
      if (filterType !== "All") params.studentType = filterType;

      const data = await apiService.getAdminStudents(params);
      setStudentError("");
      setStudents(data.map(s => ({
        recordId: String(s.id || ""),
        enrollmentStatus: s.status,
        id: s.studentIdNumber || "Not issued",
        firstName: s.firstName,
        lastName: s.lastName,
        dob: s.birthDate ? new Date(s.birthDate).toLocaleDateString() : "N/A",
        gender: s.gender,
        contact: s.phoneNumber || "N/A",
        email: s.email,
        address: s.address || "N/A",
        department: s.programCode,
        program: s.programCode,
        section: s.sectionCode || "Not assigned",
        studentType: s.studentType,
        year: s.yearLevel ? `${s.yearLevel}${s.yearLevel === 1 ? "st" : s.yearLevel === 2 ? "nd" : s.yearLevel === 3 ? "rd" : "th"} Year` : "N/A",
        gpa: "N/A",
        status: s.status === "Completed" ? "Active" : s.status,
        docs: []
      })));
    } catch (err) {
      setStudentError(err.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [filterGender, filterYear, filterDept, filterType]);

  const openApplication = useCallback(async (application) => {
    setSelectedApplication(application);
    setApplicationDetails(null);
    setApplicationActionError("");
    setRejectingApplication(false);
    setApplicationDetailsLoading(true);
    try {
      setApplicationDetails(await apiService.getApplicationById(application.id));
    } catch (err) {
      setApplicationActionError(err.message || "Failed to load application details.");
    } finally {
      setApplicationDetailsLoading(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const data = await apiService.getAdminApplications();
      setApplications(data);
      setApplicationError("");
    } catch (err) {
      setApplicationError(err.message || "Failed to load applications.");
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const params = {};
    if (filterGender !== "All") params.gender = filterGender;
    if (filterYear !== "All") params.yearLevel = Number.parseInt(filterYear, 10);
    if (filterDept !== "All") params.programCode = filterDept;
    if (filterType !== "All") params.studentType = filterType;

    apiService.getAdminStudents(params)
      .then((data) => {
        if (!active) return;
        setStudents(data.map(s => ({
          recordId: String(s.id || ""),
          enrollmentStatus: s.status,
          id: s.studentIdNumber || "Not issued",
          firstName: s.firstName,
          lastName: s.lastName,
          dob: s.birthDate ? new Date(s.birthDate).toLocaleDateString() : "N/A",
          gender: s.gender,
          contact: s.phoneNumber || "N/A",
          email: s.email,
          address: s.address || "N/A",
          department: s.programCode || "N/A",
          program: s.programCode || "N/A",
          section: s.sectionCode || "Not assigned",
          studentType: s.studentType,
          year: s.yearLevel ? `${s.yearLevel}${s.yearLevel === 1 ? "st" : s.yearLevel === 2 ? "nd" : s.yearLevel === 3 ? "rd" : "th"} Year` : "N/A",
          gpa: "N/A",
          status: s.status === "Completed" ? "Active" : s.status,
          docs: [],
        })));
        setStudentError("");
      })
      .catch((err) => {
        if (active) setStudentError(err.message || "Failed to load students.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [filterGender, filterYear, filterDept, filterType]);

  useEffect(() => {
    if (activeTab !== "applications") return undefined;
    let active = true;
    apiService.getAdminApplications()
      .then(async (data) => {
        if (!active) return;
        setApplications(data);
        setApplicationError("");
        const applicationId = location.state?.applicationId;
        const application = data.find((item) => item.id === applicationId);
        if (!application) return;

        setSelectedApplication(application);
        setApplicationDetailsLoading(true);
        try {
          const details = await apiService.getApplicationById(application.id);
          if (active) setApplicationDetails(details);
        } catch (err) {
          if (active) setApplicationActionError(err.message || "Failed to load application details.");
        } finally {
          if (active) setApplicationDetailsLoading(false);
        }
        if (active) navigate(location.pathname, { replace: true, state: null });
      })
      .catch((err) => {
        if (active) setApplicationError(err.message || "Failed to load applications.");
      })
      .finally(() => {
        if (active) setApplicationLoading(false);
      });
    return () => { active = false; };
  }, [activeTab, location.pathname, location.state, navigate]);

  const handleApproveApplication = async () => {
      if (!selectedApplication?.id || !window.confirm("Approve this enrollment application?")) return;
      setApplicationActionLoading(true);
      setApplicationActionError("");
      try {
        await apiService.approveApplication(selectedApplication.id);
        await loadApplications();
        setApplicationDetails((current) => current
          ? { ...current, status: "Approved", studentIdNumber: null }
          : current);
        setSelectedApplication((current) => current ? { ...current, status: "Approved" } : current);
      } catch (err) {
        setApplicationActionError(err.message || "Failed to approve application.");
      } finally {
        setApplicationActionLoading(false);
      }
  };

  const handleRejectApplication = async (event) => {
      event.preventDefault();
      if (!selectedApplication?.id || !rejectionReason.trim()) {
        setApplicationActionError("A rejection reason is required.");
        return;
      }
      setApplicationActionLoading(true);
      setApplicationActionError("");
      try {
        await apiService.rejectApplication(selectedApplication.id, rejectionReason.trim());
        await loadApplications();
        setApplicationDetails((current) => current
          ? { ...current, status: "Rejected", adminReviewComment: rejectionReason.trim() }
          : current);
        setSelectedApplication((current) => current ? { ...current, status: "Rejected" } : current);
        setRejectingApplication(false);
        setRejectionReason("");
      } catch (err) {
        setApplicationActionError(err.message || "Failed to reject application.");
      } finally {
        setApplicationActionLoading(false);
      }
  };

  const handleDropEnrollment = async (application) => {
    if (!application?.id || droppingApplicationId) return;
    const reason = window.prompt("Enter the reason for dropping this enrollment:");
    if (reason === null) return;
    if (!reason.trim()) {
      setStudentActionError("A reason is required to drop an enrollment.");
      return;
    }

    const studentName = `${application.firstName || ""} ${application.lastName || ""}`.trim();
    if (!window.confirm(
      `Drop ${studentName || "this student"} from this enrollment? Their section seat will be released. Payment receipts and any existing student ID record will be kept.`,
    )) return;

    setDroppingApplicationId(application.id);
    setStudentActionError("");
    try {
      await apiService.dropEnrollment(application.id, reason.trim());
      await Promise.all([loadStudents(), loadApplications()]);
      setSelectedStudent((current) => current?.recordId === application.id
        ? { ...current, status: "Dropped", enrollmentStatus: "Dropped" }
        : current);
    } catch (err) {
      setStudentActionError(err.message || "Failed to drop enrollment.");
    } finally {
      setDroppingApplicationId("");
    }
  };

  const filteredStudents = students.filter(s => {
      const q = search.toLowerCase();
      return (
        ((s.firstName + " " + s.lastName).toLowerCase().includes(q) || String(s.id).toLowerCase().includes(q)) &&
        (filterGender === "All" || s.gender === filterGender) &&
        (filterYear === "All" || s.year === filterYear) &&
        (filterDept === "All" || s.department === filterDept) &&
        (filterStatus === "All" || s.status === filterStatus) &&
        (filterType === "All" || s.studentType === filterType)
      );
  });
  const filteredApplications = applications.filter((application) => {
      const status = application.status?.replace(/\s/g, "").toLowerCase();
      return status === applicationStatus.toLowerCase();
  });

  // Demographics data
  const genderData = [
    { label: "Male", value: students.filter(s => s.gender === "Male").length },
    { label: "Female", value: students.filter(s => s.gender === "Female").length },
  ];
  const yearData = ["1st Year","2nd Year","3rd Year","4th Year"].map(y => ({ label: y, value: students.filter(s => s.year === y).length }));
  const deptData = [...new Set(students.map(s => s.department))].map(d => ({ label: d.replace("College of ", ""), value: students.filter(s => s.department === d).length }));
  const statusData = ["Active","Pending","Inactive"].map(st => ({ label: st, value: students.filter(s => s.status === st).length }));
  const applicationCounts = {
    Draft: applications.filter((item) => item.status?.replace(/\s/g, "").toLowerCase() === "draft").length,
    PendingReview: applications.filter((item) => item.status?.replace(/\s/g, "").toLowerCase() === "pendingreview").length,
    Approved: applications.filter((item) => item.status?.replace(/\s/g, "").toLowerCase() === "approved").length,
    Rejected: applications.filter((item) => item.status?.replace(/\s/g, "").toLowerCase() === "rejected").length,
    Dropped: applications.filter((item) => item.status?.replace(/\s/g, "").toLowerCase() === "dropped").length,
  };

  if (loading) {
    return (
      <div className="student-management">
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>Student Management</h1>
        <p>View and manage all student records, demographics, and applications</p>
      </div>

      {studentActionError && <div className="student-management-error" role="alert">{studentActionError}</div>}

      <div className="tabs">
        <button className={`tab ${activeTab === "list" ? "active" : ""}`} onClick={() => { setActiveTab("list"); setSelectedStudent(null); }}>Students List</button>
        <button className={`tab ${activeTab === "applications" ? "active" : ""}`} onClick={() => { setApplicationLoading(true); if (activeTab === "applications") void loadApplications(); else setActiveTab("applications"); setSelectedStudent(null); }}>Student Applications</button>
        <button className={`tab ${activeTab === "demographics" ? "active" : ""}`} onClick={() => { setActiveTab("demographics"); setSelectedStudent(null); }}>Demographics</button>
        {selectedStudent && (
          <button className={`tab ${activeTab === "detail" ? "active" : ""}`} onClick={() => setActiveTab("detail")}>
            {selectedStudent.firstName} {selectedStudent.lastName}
          </button>
        )}
      </div>

      {/* ── STUDENTS LIST ── */}
      {activeTab === "list" && (
        <>
          <div className="filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-dropdowns">
              <select className="filter-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <option value="All">All Gender</option>
                <option>Male</option><option>Female</option>
              </select>
              <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="All">All Year Levels</option>
                <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
              </select>
              <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="BSA">BS Accountancy</option>
                <option value="BSBA">BS Business Administration</option>
                <option value="BSHM">BS Hospitality Management</option>
                <option value="BSCS">BS Computer Science</option>
                <option value="BSIT">BS Information Technology</option>
              </select>
              <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option>Active</option><option>Approved</option><option>Pending</option><option>Inactive</option>
              </select>
              <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="All">All Student Types</option>
                <option>New/Incoming</option><option>Continuing</option><option>Transferee</option>
              </select>
            </div>
          </div>

          {studentError && <div className="student-management-error" role="alert">{studentError} <button className="view-btn" onClick={() => { setLoading(true); void loadStudents(); }}>Retry</button></div>}
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>STUDENT ID</th><th>NAME</th><th>DEPARTMENT</th><th>SECTION</th>
                  <th>YEAR</th><th>GENDER</th><th>STATUS</th><th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No students found.</td></tr>
                  : filteredStudents.map(s => (
                    <tr key={s.recordId}>
                      <td style={{ fontWeight: 600, color: "#2563eb" }}>{s.id}</td>
                      <td>{s.firstName} {s.lastName}</td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{s.department.replace("College of ", "")}</td>
                      <td>{s.section}</td>
                      <td>{s.year}</td>
                      <td>{s.gender}</td>
                      <td><span className={`status-badge ${getStatusClass(s.status)}`}>{s.status}</span></td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="view-btn" onClick={() => { setSelectedStudent(s); setActiveTab("detail"); }}>View</button>
                        {["approved", "completed", "enrolled"].includes(s.enrollmentStatus?.replace(/\s/g, "").toLowerCase()) && (
                          <button
                            type="button"
                            className="view-btn"
                            disabled={Boolean(droppingApplicationId)}
                            onClick={() => void handleDropEnrollment({
                              id: s.recordId,
                              firstName: s.firstName,
                              lastName: s.lastName,
                            })}
                            style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                          >
                            {droppingApplicationId === s.recordId ? "Dropping…" : "Drop"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>Showing {filteredStudents.length} of {students.length} students</div>
        </>
      )}

      {/* ── STUDENT APPLICATIONS ── */}
      {activeTab === "applications" && (
        <section className="admin-applications">
          <div className="tabs admin-applications__status-tabs" aria-label="Application status">
            {[
              ["Draft", "Draft"],
              ["PendingReview", "Pending"],
              ["Approved", "Approved"],
              ["Rejected", "Rejected"],
              ["Dropped", "Dropped"],
            ].map(([status, label]) => (
              <button
                key={status}
                className={`tab ${applicationStatus === status ? "active" : ""}`}
                onClick={() => setApplicationStatus(status)}
              >
                {label} ({applicationCounts[status]})
              </button>
            ))}
            <button className="view-btn admin-applications__refresh" onClick={() => { setApplicationLoading(true); void loadApplications(); }} disabled={applicationLoading}>Refresh</button>
          </div>

          {applicationLoading ? (
            <div className="student-management-state">Loading applications…</div>
          ) : applicationError ? (
            <div className="student-management-error" role="alert">{applicationError} <button className="view-btn" onClick={loadApplications}>Retry</button></div>
          ) : filteredApplications.length === 0 ? (
            <div className="student-management-state">No {applicationStatus === "PendingReview" ? "pending" : applicationStatus.toLowerCase()} applications.</div>
          ) : (
            <div className="admin-applications__list">
              {filteredApplications.map((application) => (
                <article className="admin-application-card" key={application.id}>
                  <div className="admin-application-card__header">
                    <div>
                      <h3>{`${application.firstName || ""} ${application.lastName || ""}`.trim() || "Unnamed Student"}</h3>
                      <p>{application.programCode || "—"} · {application.yearLevel ? `${application.yearLevel}${application.yearLevel === 1 ? "st" : application.yearLevel === 2 ? "nd" : application.yearLevel === 3 ? "rd" : "th"} Year` : "Year —"} · {application.studentType || "—"}</p>
                    </div>
                    <span className={`status-badge ${getStatusClass(application.status)}`}>{application.status}</span>
                  </div>
                  <div className="admin-application-card__details">
                    <span><strong>Email</strong>{application.email || "—"}</span>
                    <span><strong>Submitted</strong>{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "—"}</span>
                    <span><strong>Preferred schedule</strong>{application.preferredSchedule || "—"}</span>
                    {application.sectionCode && <span><strong>Assigned section</strong>{application.sectionCode}</span>}
                    {application.adminReviewComment && <span><strong>Admin comment</strong>{application.adminReviewComment}</span>}
                  </div>
                  <div className="admin-application-card__actions">
                    <button className="view-btn" onClick={() => openApplication(application)}>View Details</button>
                    {application.status?.replace(/\s/g, "").toLowerCase() === "pendingreview" && (
                      <>
                        <button className="approve-btn" onClick={() => openApplication(application)}>Review & Decide</button>
                      </>
                    )}
                    {["draft", "pendingreview", "approved"].includes(application.status?.replace(/\s/g, "").toLowerCase()) && (
                      <button
                        type="button"
                        className="view-btn"
                        disabled={Boolean(droppingApplicationId)}
                        onClick={() => void handleDropEnrollment(application)}
                        style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                      >
                        {droppingApplicationId === application.id ? "Dropping…" : "Drop enrollment"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── DEMOGRAPHICS ── */}
      {activeTab === "demographics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Summary Cards */}
          <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[
              { label: "Total Students", value: students.length, color: "#3b82f6", bg: "#eff6ff" },
              { label: "Active", value: students.filter(s => s.status === "Active").length, color: "#16a34a", bg: "#f0fdf4" },
              { label: "Pending", value: students.filter(s => s.status === "Pending").length, color: "#d97706", bg: "#fffbeb" },
              { label: "Inactive", value: students.filter(s => s.status === "Inactive").length, color: "#dc2626", bg: "#fef2f2" },
            ].map((c, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Gender */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Gender Distribution</div>
            <BarChart data={genderData} />
          </div>

          {/* Year Level */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Year Level Distribution</div>
            <BarChart data={yearData} color="#22c55e" />
          </div>

          {/* Department */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Department Distribution</div>
            <BarChart data={deptData} color="#8b5cf6" />
          </div>

          {/* Enrollment Status */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Enrollment Status</div>
            <BarChart data={statusData} color="#f59e0b" />
          </div>
        </div>
      )}

      {/* ── STUDENT PERSONAL INFO ── */}
      {activeTab === "detail" && selectedStudent && (
        <div>
          <button className="view-btn" style={{ marginBottom: 16 }} onClick={() => { setActiveTab("list"); setSelectedStudent(null); }}>← Back to List</button>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
            {/* Left — Profile Card */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, textAlign: "center" }}>
              <div className="student-avatar" style={{ width: 72, height: 72, fontSize: 24, margin: "0 auto 16px" }}>
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{selectedStudent.firstName} {selectedStudent.lastName}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{selectedStudent.id}</div>
              <div style={{ marginTop: 12 }}>
                <span className={`status-badge ${getStatusClass(selectedStudent.status)}`}>{selectedStudent.status}</span>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                {[
                  { label: "Program", value: selectedStudent.program },
                  { label: "Section", value: selectedStudent.section },
                  { label: "Year Level", value: selectedStudent.year },
                  { label: "GPA", value: selectedStudent.gpa },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Personal Info */}
              <div className="student-card">
                <div className="card-section">
                  <h4>PERSONAL INFORMATION</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {[
                      { label: "Full Name", value: `${selectedStudent.firstName} ${selectedStudent.lastName}` },
                      { label: "Date of Birth", value: selectedStudent.dob },
                      { label: "Gender", value: selectedStudent.gender },
                      { label: "Contact Number", value: selectedStudent.contact },
                      { label: "Email", value: selectedStudent.email },
                      { label: "Address", value: selectedStudent.address },
                    ].map((r, i) => (
                      <div key={i} className="info-row"><span>{r.label}</span><span>{r.value}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="student-card">
                <div className="card-section">
                  <h4>ACADEMIC INFORMATION</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {[
                      { label: "Department", value: selectedStudent.department },
                      { label: "Program", value: selectedStudent.program },
                      { label: "Section", value: selectedStudent.section },
                      { label: "Year Level", value: selectedStudent.year },
                      { label: "GPA", value: selectedStudent.gpa },
                      { label: "Student ID", value: selectedStudent.id },
                      { label: "Enrollment Status", value: selectedStudent.status },
                    ].map((r, i) => (
                      <div key={i} className="info-row"><span>{r.label}</span><span>{r.value}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="student-card">
                <div className="card-section" style={{ borderBottom: "none", paddingBottom: 0 }}>
                  <h4>SUBMITTED DOCUMENTS</h4>
                  <div className="requirements">
                    {selectedStudent.docs.map((doc, i) => (
                      <button key={i} className="req-btn">{doc}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div
          className="admin-application-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !applicationActionLoading) {
              setSelectedApplication(null);
              setApplicationDetails(null);
              setApplicationActionError("");
              setRejectingApplication(false);
            }
          }}
        >
          <section className="admin-application-dialog" role="dialog" aria-modal="true" aria-labelledby="application-dialog-title">
            <header className="admin-application-dialog__header">
              <div>
                <h2 id="application-dialog-title">Application Details</h2>
                <p>{selectedApplication.firstName} {selectedApplication.lastName}</p>
              </div>
              <button
                className="admin-application-dialog__close"
                aria-label="Close"
                disabled={applicationActionLoading}
                onClick={() => {
                  setSelectedApplication(null);
                  setApplicationDetails(null);
                  setApplicationActionError("");
                  setRejectingApplication(false);
                }}
              >
                ×
              </button>
            </header>

            {applicationDetailsLoading ? (
              <div className="student-management-state">Loading application details…</div>
            ) : applicationDetails ? (
              <>
                <div className="admin-application-dialog__sections">
                  <section>
                    <h3>Student Information</h3>
                    {[
                      ["First Name", applicationDetails.firstName],
                      ["Last Name", applicationDetails.lastName],
                      ["Email", applicationDetails.email],
                      ["Phone Number", applicationDetails.phoneNumber],
                      ["Address", applicationDetails.address],
                      ["Birth Date", applicationDetails.birthDate ? new Date(applicationDetails.birthDate).toLocaleDateString() : "—"],
                    ].map(([label, value]) => <p key={label}><strong>{label}</strong><span>{value || "—"}</span></p>)}
                  </section>
                  <section>
                    <h3>Enrollment Information</h3>
                    {[
                      ["Student Type", applicationDetails.studentType],
                      ...(applicationDetails.studentType === "Continuing"
                        ? [["Enrollment Status", applicationDetails.isIrregular == null ? "—" : applicationDetails.isIrregular ? "Irregular Student" : "Regular Student"]]
                        : []),
                      ["Program", applicationDetails.programCode],
                      ["Assigned Section", applicationDetails.sectionCode],
                      ["Student ID", applicationDetails.studentIdNumber],
                      ["Year Level", applicationDetails.yearLevel],
                      ["Semester", applicationDetails.semester],
                      ["Preferred Schedule", applicationDetails.preferredSchedule],
                      ["Status", applicationDetails.status],
                      ["Submitted", applicationDetails.submittedAt ? new Date(applicationDetails.submittedAt).toLocaleString() : "—"],
                    ].map(([label, value]) => <p key={label}><strong>{label}</strong><span>{value || "—"}</span></p>)}
                  </section>
                  {(applicationDetails.guardianFirstName || applicationDetails.guardianLastName || applicationDetails.guardianContactNumber) && (
                    <section>
                      <h3>Guardian Information</h3>
                      {[
                        ["Name", `${applicationDetails.guardianFirstName || ""} ${applicationDetails.guardianLastName || ""}`.trim()],
                        ["Relationship", applicationDetails.guardianRelationship],
                        ["Contact Number", applicationDetails.guardianContactNumber],
                        ["Address", applicationDetails.guardianAddress],
                      ].map(([label, value]) => <p key={label}><strong>{label}</strong><span>{value || "—"}</span></p>)}
                    </section>
                  )}
                  {(applicationDetails.previousSchoolName || applicationDetails.highSchoolName) && (
                    <section>
                      <h3>{applicationDetails.previousSchoolName ? "Previous School Information" : "Senior High School Information"}</h3>
                      {(applicationDetails.previousSchoolName
                        ? [
                            ["Previous School", applicationDetails.previousSchoolName],
                            ["School Address", applicationDetails.previousSchoolAddress],
                            ["Previous Program", applicationDetails.previousProgram],
                            ["Last Year Level Completed", applicationDetails.previousYearLevel ? `${applicationDetails.previousYearLevel}${applicationDetails.previousYearLevel === 1 ? "st" : applicationDetails.previousYearLevel === 2 ? "nd" : applicationDetails.previousYearLevel === 3 ? "rd" : "th"} Year` : "—"],
                          ]
                        : [
                            ["Senior High School", applicationDetails.highSchoolName],
                            ["School Address", applicationDetails.highSchoolAddress],
                            ["Year Graduated", applicationDetails.graduationYear],
                          ]
                      ).map(([label, value]) => <p key={label}><strong>{label}</strong><span>{value || "—"}</span></p>)}
                    </section>
                  )}
                </div>

                <section className="admin-application-dialog__requirements">
                  <h3>Submitted Requirements</h3>
                  {applicationDetails.requirements?.length ? (
                    <ul>
                      {applicationDetails.requirements.map((requirement) => (
                        <li key={requirement.id}>
                          <span>{requirement.requirementType || "Document"}</span>
                          <span>{requirement.originalFileName || "File name unavailable"}</span>
                          <span>
                            {requirement.filePath && (
                              <a href={apiService.getRequirementFileUrl(requirement.filePath)} target="_blank" rel="noreferrer">
                                Open File
                              </a>
                            )}
                            {requirement.createdAt ? new Date(requirement.createdAt).toLocaleDateString() : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No submitted requirement documents.</p>}
                </section>

                {applicationDetails.adminReviewComment && (
                  <p className="admin-application-dialog__comment">
                    <strong>Admin review comment:</strong> {applicationDetails.adminReviewComment}
                  </p>
                )}
                {applicationActionError && <p className="student-management-error" role="alert">{applicationActionError}</p>}

                {applicationDetails.status?.replace(/\s/g, "").toLowerCase() === "pendingreview" && (
                  rejectingApplication ? (
                    <form className="admin-application-dialog__reject" onSubmit={handleRejectApplication}>
                      <label htmlFor="application-rejection-reason">Reason for rejection *</label>
                      <textarea
                        id="application-rejection-reason"
                        value={rejectionReason}
                        onChange={(event) => setRejectionReason(event.target.value)}
                        required
                      />
                      <div className="admin-application-dialog__actions">
                        <button type="button" className="view-btn" onClick={() => setRejectingApplication(false)} disabled={applicationActionLoading}>Back</button>
                        <button type="submit" className="reject-btn" disabled={applicationActionLoading}>{applicationActionLoading ? "Rejecting…" : "Confirm Rejection"}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="admin-application-dialog__actions">
                      <button className="reject-btn" onClick={() => setRejectingApplication(true)} disabled={applicationActionLoading}>Reject</button>
                      <button className="approve-btn" onClick={handleApproveApplication} disabled={applicationActionLoading}>{applicationActionLoading ? "Approving…" : "Approve"}</button>
                    </div>
                  )
                )}
              </>
            ) : (
              applicationActionError && <p className="student-management-error" role="alert">{applicationActionError}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
