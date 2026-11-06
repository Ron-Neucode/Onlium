import { useEffect, useState } from "react";
import { FiBookOpen, FiCalendar, FiClock, FiDownload, FiFolder, FiLogOut, FiMapPin, FiMenu, FiMessageSquare, FiUsers, FiX } from "react-icons/fi";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { authService } from "../services/authService.js";
import { apiService } from "../services/apiService.js";
import InstructorMaterials from "./InstructorMaterials.jsx";
import "./styles/InstructorDashboard.css";

const instructorTabs = [
  { id: "classes", label: "My Classes", icon: <FiBookOpen aria-hidden="true" /> },
  { id: "attendance", label: "Attendance", icon: <FiCalendar aria-hidden="true" /> },
  { id: "announcements", label: "Class Announcements", icon: <FiMessageSquare aria-hidden="true" /> },
  { id: "materials", label: "Class Materials", icon: <FiFolder aria-hidden="true" /> },
];

const announcementCategories = [
  { value: "Activity", label: "Activity", color: "#2563eb" },
  { value: "Deadline", label: "Deadline", color: "#ea580c" },
  { value: "Exam", label: "Exam", color: "#7c3aed" },
];

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKey(value) {
  return String(value || "").slice(0, 10);
}

function dateFromKey(value) {
  const [year, month, day] = getDateKey(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatAnnouncementDate(value) {
  return dateFromKey(value).toLocaleDateString();
}

function getAnnouncementCategory(title = "") {
  const match = /^(Activity|Deadline|Exam):\s*/i.exec(title);
  return match
    ? announcementCategories.find(category => category.value.toLowerCase() === match[1].toLowerCase())
    : null;
}

function getAnnouncementTitle(title = "") {
  return title.replace(/^(Activity|Deadline|Exam):\s*/i, "");
}

function displayTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function classLabel(item) {
  return `${item.subjectCode} · ${item.sectionCode}`;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function InstructorDashboard() {
  const user = authService.getUserSession();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAnnouncementDate, setSelectedAnnouncementDate] = useState(new Date());
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementCategory, setAnnouncementCategory] = useState("Activity");
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [attendanceView, setAttendanceView] = useState("record");
  const [attendanceDate, setAttendanceDate] = useState(localDateValue());
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [reportFrom, setReportFrom] = useState(() => localDateValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [reportTo, setReportTo] = useState(localDateValue());
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({
    sectionStudyLoadId: "",
    title: "",
    description: "",
    eventDate: localDateValue(),
  });
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedClass = classes.find(item => item.id === selectedClassId) || null;
  const instructorName = user?.fullName || user?.email || "Instructor";
  const pageTitle = instructorTabs.find(tab => tab.id === activeTab)?.label || "Instructor Portal";
  const totalStudents = classes.reduce((total, item) => total + (item.enrolledCount || 0), 0);

  useEffect(() => {
    let active = true;
    async function loadPortal() {
      try {
        const [classData, announcementData] = await Promise.all([
          apiService.getInstructorClasses(),
          apiService.getInstructorAnnouncements(),
        ]);
        if (!active) return;
        setError("");
        setClasses(classData);
        setAnnouncements(announcementData);
        setSelectedClassId(current => classData.some(item => item.id === current)
          ? current
          : classData[0]?.id || "");
        setAnnouncementForm(current => ({
          ...current,
          sectionStudyLoadId: classData.some(item => item.id === current.sectionStudyLoadId)
            ? current.sectionStudyLoadId
            : classData[0]?.id || "",
        }));
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load instructor portal.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPortal();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (activeTab !== "attendance" || attendanceView !== "record" || !selectedClassId || !attendanceDate) {
      return;
    }
    let active = true;
    // This effect owns loading state for its cancellable attendance request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendanceLoading(true);
    setError("");
    apiService.getInstructorAttendance(selectedClassId, attendanceDate)
      .then(result => {
        if (active) setAttendanceStudents(result.students);
      })
      .catch(requestError => {
        if (active) {
          setAttendanceStudents([]);
          setError(requestError.message || "Unable to load class attendance.");
        }
      })
      .finally(() => {
        if (active) setAttendanceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, attendanceDate, attendanceView, selectedClassId]);

  useEffect(() => {
    if (activeTab !== "attendance" || attendanceView !== "report" || !selectedClassId || !reportFrom || !reportTo) {
      return;
    }

    let active = true;
    // This effect owns loading state for its cancellable report request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReportLoading(true);
    setReportError("");
    apiService.getInstructorAttendanceReport(selectedClassId, reportFrom, reportTo)
      .then(result => {
        if (active) setAttendanceReport(result);
      })
      .catch(requestError => {
        if (active) {
          setAttendanceReport(null);
          setReportError(requestError.message || "Unable to load attendance report.");
        }
      })
      .finally(() => {
        if (active) setReportLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab, attendanceView, reportFrom, reportTo, selectedClassId]);

  useEffect(() => {
    if (!announcementDialogOpen) return undefined;
    const handleKeyDown = event => {
      if (event.key === "Escape" && !savingAnnouncement) {
        setAnnouncementDialogOpen(false);
        setError("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [announcementDialogOpen, savingAnnouncement]);

  const visibleAttendanceStudents = selectedClassId && attendanceDate ? attendanceStudents : [];
  const allStudentsMarked =
    visibleAttendanceStudents.length > 0 &&
    visibleAttendanceStudents.every(student => ["Present", "Absent", "Late", "Excused"].includes(student.status));
  const reportStudents = attendanceReport?.students || [];
  const reportTotals = reportStudents.reduce((totals, student) => ({
    present: totals.present + student.present,
    absent: totals.absent + student.absent,
    late: totals.late + student.late,
    excused: totals.excused + student.excused,
    tracked: totals.tracked + (student.daysRecorded > 0 ? 1 : 0),
  }), { present: 0, absent: 0, late: 0, excused: 0, tracked: 0 });
  const reportRateDenominator = reportTotals.present + reportTotals.absent + reportTotals.late;
  const reportAttendanceRate = reportRateDenominator
    ? ((reportTotals.present + reportTotals.late) * 100 / reportRateDenominator).toFixed(1)
    : null;

  function updateAttendance(studentId, field, value) {
    setAttendanceStudents(current => current.map(student => student.studentId === studentId
      ? { ...student, [field]: value }
      : student));
  }

  async function saveAttendance() {
    if (!selectedClass || !allStudentsMarked) {
      setError("Mark attendance for every enrolled student before saving.");
      return;
    }
    setError("");
    setNotice("");
    setSavingAttendance(true);
    try {
      const result = await apiService.saveInstructorAttendance(selectedClass.id, {
        date: attendanceDate,
        students: attendanceStudents.map(student => ({
          studentId: student.studentId,
          status: student.status,
          notes: student.notes || null,
        })),
      });
      setNotice(result.message || "Attendance saved.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save class attendance.");
    } finally {
      setSavingAttendance(false);
    }
  }

  function downloadAttendanceReport() {
    if (!selectedClass || !attendanceReport) return;

    const header = ["Student", "Student ID", "Present", "Absent", "Late", "Excused", "Days Recorded", "Attendance Rate (%)"];
    const rows = reportStudents.map(student => [
      student.studentName,
      student.studentIdNumber || "",
      student.present,
      student.absent,
      student.late,
      student.excused,
      student.daysRecorded,
      student.attendanceRate == null ? "" : student.attendanceRate,
    ]);
    const csv = [header, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedClass.subjectCode}-${selectedClass.sectionCode}-${reportFrom}-to-${reportTo}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function publishAnnouncement(event) {
    event.preventDefault();
    if (!announcementForm.title.trim()) {
      setError("Enter a title for this class calendar item.");
      return;
    }
    setError("");
    setNotice("");
    setSavingAnnouncement(true);
    try {
      const request = {
        ...announcementForm,
        title: `${announcementCategory}: ${announcementForm.title.trim()}`,
      };
      const result = editingAnnouncementId
        ? await apiService.updateInstructorAnnouncement(editingAnnouncementId, request)
        : await apiService.createInstructorAnnouncement(request);
      setNotice(result.message || (editingAnnouncementId
        ? "Announcement updated and students were notified."
        : `${announcementCategory} added to the class calendar.`));
      setEditingAnnouncementId("");
      setAnnouncementForm(current => ({
        ...current,
        title: "",
        description: "",
      }));
      setAnnouncements(await apiService.getInstructorAnnouncements());
      setAnnouncementDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to add this calendar item.");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  function selectTab(id) {
    setActiveTab(id);
    setError("");
    setNotice("");
    setMobileMenuOpen(false);
  }

  function openAnnouncementDialog(date) {
    const dateKey = localDateValue(date);
    setEditingAnnouncementId("");
    setSelectedAnnouncementDate(date);
    setAnnouncementForm(current => ({
      ...current,
      sectionStudyLoadId: current.sectionStudyLoadId || classes[0]?.id || "",
      title: "",
      description: "",
      eventDate: dateKey,
    }));
    setAnnouncementCategory("Activity");
    setError("");
    setNotice("");
    setAnnouncementDialogOpen(true);
  }

  function editAnnouncement(item) {
    const category = getAnnouncementCategory(item.title);
    const date = dateFromKey(item.eventDate);
    setEditingAnnouncementId(item.id);
    setSelectedAnnouncementDate(date);
    setAnnouncementCategory(category?.value || "Activity");
    setAnnouncementForm({
      sectionStudyLoadId: item.sectionStudyLoadId,
      title: getAnnouncementTitle(item.title),
      description: item.description || "",
      eventDate: getDateKey(item.eventDate),
    });
    setError("");
    setNotice("");
    setAnnouncementDialogOpen(true);
  }

  async function cancelAnnouncement(item) {
    if (!window.confirm(`Cancel "${getAnnouncementTitle(item.title)}"? Enrolled students will be notified.`)) return;
    setError("");
    setNotice("");
    try {
      const result = await apiService.deleteInstructorAnnouncement(item.id);
      setAnnouncements(current => current.filter(announcement => announcement.id !== item.id));
      setNotice(result.message || "Announcement cancelled and enrolled students were notified.");
    } catch (requestError) {
      setError(requestError.message || "Unable to cancel this announcement.");
    }
  }

  function closeAnnouncementDialog() {
    if (savingAnnouncement) return;
    setAnnouncementDialogOpen(false);
    setError("");
  }

  function getAnnouncementsForDate(date) {
    const dateKey = localDateValue(date);
    return announcements.filter(item => getDateKey(item.eventDate) === dateKey);
  }

  function renderCalendarTile({ date, view }) {
    if (view !== "month") return null;
    const dayItems = getAnnouncementsForDate(date);
    if (!dayItems.length) return null;
    return (
      <span className="instructor-calendar-markers" aria-label={`${dayItems.length} scheduled items`}>
        {dayItems.slice(0, 3).map((item, index) => {
          const category = getAnnouncementCategory(item.title);
          return (
            <span
              className="instructor-calendar-marker"
              key={item.id || `${getDateKey(item.eventDate)}-${index}`}
              style={{ backgroundColor: category?.color || "#94a3b8" }}
              title={`${category?.label || "Announcement"}: ${getAnnouncementTitle(item.title)}`}
            />
          );
        })}
        {dayItems.length > 3 && <span className="instructor-calendar-more">+{dayItems.length - 3}</span>}
      </span>
    );
  }

  function logout() {
    authService.clearUserSession();
    window.location.assign("/register/login");
  }

  return (
    <div className="instructor-app">
      {mobileMenuOpen && <button className="instructor-sidebar-overlay" type="button" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`instructor-sidebar${mobileMenuOpen ? " is-open" : ""}`}>
        <div className="instructor-brand">
          <div className="instructor-brand-mark">ONL</div>
          <div>
            <strong>ONLIUM</strong>
            <span>Instructor Portal</span>
          </div>
          <button className="instructor-mobile-close" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><FiX /></button>
        </div>
        <div className="instructor-sidebar-label">Workspace</div>
        <nav className="instructor-nav" aria-label="Instructor sections">
          {instructorTabs.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`instructor-nav-item${activeTab === id ? " active" : ""}`}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => selectTab(id)}
            >
              {icon}
              <span>{label}</span>
              {id === "classes" && classes.length > 0 && <span className="instructor-nav-count">{classes.length}</span>}
            </button>
          ))}
        </nav>
        <div className="instructor-sidebar-bottom">
          <div className="instructor-sidebar-user">
            <div className="instructor-avatar">{instructorName.trim().charAt(0).toUpperCase()}</div>
            <div className="instructor-sidebar-user-text">
              <strong>{instructorName}</strong>
              <span>Instructor</span>
            </div>
          </div>
          <button type="button" className="instructor-logout" onClick={logout}>
            <FiLogOut aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="instructor-main">
        <header className="instructor-topbar">
          <button className="instructor-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
            <FiMenu />
          </button>
          <div className="instructor-breadcrumb"><span>Instructor Portal</span><span aria-hidden="true">/</span><strong>{pageTitle}</strong></div>
          <div className="instructor-topbar-user">
            <div className="instructor-avatar">{instructorName.trim().charAt(0).toUpperCase()}</div>
            <span>{instructorName}</span>
          </div>
        </header>

        <main className="instructor-content">
          <section className="instructor-page-heading">
            <div>
              <p className="instructor-eyebrow">YOUR TEACHING WORKSPACE</p>
              <h1>{activeTab === "classes" ? "Welcome back" : pageTitle}</h1>
              <p>{activeTab === "classes"
                ? "Review your assigned classes and keep your day on track."
                : activeTab === "attendance"
                  ? "Manage class rosters and record attendance for your students."
                  : activeTab === "materials"
                    ? "Share class files and trusted links with your enrolled students."
                    : "Share important class updates with your enrolled students."}</p>
            </div>
            <div className="instructor-heading-icon"><FiBookOpen aria-hidden="true" /></div>
          </section>

          <section className="instructor-stats" aria-label="Teaching overview">
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon blue"><FiBookOpen /></span>
              <div><span>Assigned classes</span><strong>{loading ? "—" : classes.length}</strong></div>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon green"><FiUsers /></span>
              <div><span>Enrolled students</span><strong>{loading ? "—" : totalStudents}</strong></div>
            </article>
            <article className="instructor-stat-card">
              <span className="instructor-stat-icon violet"><FiMessageSquare /></span>
              <div><span>Announcements</span><strong>{loading ? "—" : announcements.length}</strong></div>
            </article>
          </section>

          {notice && <div className="instructor-alert success" role="status">{notice}</div>}
          {error && <div className="instructor-alert error" role="alert">{error}</div>}
        {loading ? (
          <div className="instructor-panel instructor-loading" role="status">Loading your instructor workspace…</div>
        ) : classes.length === 0 ? (
          <section className="instructor-panel instructor-empty">
            <span className="instructor-empty-icon"><FiBookOpen /></span>
            <h2>No classes assigned yet</h2>
            <p>Your instructor account is active, but the administrator has not assigned you to a section schedule yet.</p>
          </section>
        ) : activeTab === "classes" ? (
          <section>
            <div className="instructor-section-heading">
              <div><h2>My assigned classes</h2><p>{classes.length} {classes.length === 1 ? "class" : "classes"} in your schedule</p></div>
            </div>
            <div className="instructor-class-grid">
              {classes.map(item => (
                <article key={item.id} className="instructor-class-card">
                  <div className="instructor-class-card-top">
                    <span className="instructor-subject-code">{item.subjectCode}</span>
                    <span className="instructor-section-badge">{item.sectionCode}</span>
                  </div>
                  <h3>{item.subjectTitle}</h3>
                  <p className="instructor-class-program">{item.programCode} <span>·</span> Year {item.yearLevel} <span>·</span> Semester {item.semester}</p>
                  <div className="instructor-class-details">
                    <div><FiCalendar /><span>{item.days}</span></div>
                    <div><FiClock /><span>{displayTime(item.startTime)}–{displayTime(item.endTime)}</span></div>
                    <div><FiMapPin /><span>{item.room || "Room not set"}</span></div>
                  </div>
                  <div className="instructor-class-footer"><FiUsers /><span>{item.enrolledCount} enrolled students</span></div>
                  <button type="button" className="instructor-card-action" onClick={() => { setSelectedClassId(item.id); selectTab("attendance"); }}>Take attendance <span aria-hidden="true">→</span></button>
                </article>
              ))}
            </div>
          </section>
        ) : activeTab === "materials" ? (
          <InstructorMaterials classes={classes} />
        ) : activeTab === "attendance" ? (
          <section className="instructor-panel">
            <div className="instructor-panel-heading">
              <div>
                <h2>{attendanceView === "record" ? "Class attendance" : "Attendance summary report"}</h2>
                <p>{attendanceView === "record"
                  ? "Choose a class and date, then mark every student."
                  : "Review saved attendance totals for an assigned class and date range."}</p>
              </div>
            </div>
            <div className="instructor-attendance-view-switch" role="group" aria-label="Attendance view">
              <button type="button" aria-pressed={attendanceView === "record"} className={attendanceView === "record" ? "active" : ""} onClick={() => setAttendanceView("record")}>Record attendance</button>
              <button type="button" aria-pressed={attendanceView === "report"} className={attendanceView === "report" ? "active" : ""} onClick={() => setAttendanceView("report")}>Summary report</button>
            </div>
            <div className="instructor-attendance-filters">
              <label className="instructor-field">
                Assigned class
                <select value={selectedClassId} onChange={event => setSelectedClassId(event.target.value)}>
                  {classes.map(item => <option key={item.id} value={item.id}>{classLabel(item)} · {item.subjectTitle}</option>)}
                </select>
              </label>
              <label className="instructor-field">
                Date
                <input
                  type="date"
                  required
                  value={announcementForm.eventDate}
                  onChange={event => {
                    setAnnouncementForm(current => ({ ...current, eventDate: event.target.value }));
                    if (event.target.value) setSelectedAnnouncementDate(dateFromKey(event.target.value));
                  }}
                />
              </label>
              {attendanceView === "record" ? (
                <label className="instructor-field instructor-date-field">
                  Class date
                  <input type="date" value={attendanceDate} onChange={event => setAttendanceDate(event.target.value)} />
                </label>
              ) : (
                <>
                  <label className="instructor-field instructor-date-field">
                    From
                    <input type="date" value={reportFrom} max={reportTo} onChange={event => setReportFrom(event.target.value)} />
                  </label>
                  <label className="instructor-field instructor-date-field">
                    To
                    <input type="date" value={reportTo} min={reportFrom} onChange={event => setReportTo(event.target.value)} />
                  </label>
                </>
              )}
            </div>
            {attendanceView === "record" ? (
              <>
                <p className="instructor-helper-text">Only students enrolled in the selected section appear for the chosen class date.</p>
                {attendanceLoading ? (
              <p className="instructor-loading" role="status">Loading roster…</p>
                ) : error ? null : visibleAttendanceStudents.length === 0 ? (
              <div className="instructor-table-empty">There are no enrolled students for this class date.</div>
                ) : (
                  <>
                <div className="instructor-table-wrap">
                  <table className="instructor-attendance-table">
                    <thead><tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Attendance</th>
                      <th>Notes</th>
                    </tr></thead>
                    <tbody>
                      {visibleAttendanceStudents.map(student => (
                        <tr key={student.studentId}>
                          <td><strong>{student.studentName}</strong><span className="instructor-student-email">{student.email}</span></td>
                          <td>{student.studentIdNumber || "—"}</td>
                          <td>
                            <select aria-label={`Attendance for ${student.studentName}`} value={student.status} onChange={event => updateAttendance(student.studentId, "status", event.target.value)}>
                              <option value="Unmarked">Choose status</option>
                              {["Present", "Absent", "Late", "Excused"].map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </td>
                          <td>
                            <input aria-label={`Notes for ${student.studentName}`} maxLength={500} value={student.notes || ""} onChange={event => updateAttendance(student.studentId, "notes", event.target.value)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="instructor-primary-button" disabled={!allStudentsMarked || savingAttendance} onClick={() => void saveAttendance()}>
                  {savingAttendance ? "Saving…" : "Save attendance"}
                </button>
                  </>
                )}
              </>
            ) : (
              <section className="instructor-attendance-report" aria-label="Attendance report results">
                <p className="instructor-helper-text">
                  Attendance rate counts Present and Late as attended; Excused is excluded from the rate. Only saved attendance records are included.
                </p>
                {reportError && <p className="instructor-alert error" role="alert">{reportError}</p>}
                {reportLoading ? (
                  <p className="instructor-loading" role="status">Loading attendance report…</p>
                ) : attendanceReport ? (
                  <>
                    <div className="instructor-report-summary">
                      <article><span>Students tracked</span><strong>{reportTotals.tracked} / {reportStudents.length}</strong></article>
                      <article><span>Attendance rate</span><strong>{reportAttendanceRate == null ? "—" : `${reportAttendanceRate}%`}</strong></article>
                      <article><span>Absent marks</span><strong>{reportTotals.absent}</strong></article>
                      <article><span>Excused marks</span><strong>{reportTotals.excused}</strong></article>
                    </div>
                    <div className="instructor-report-toolbar">
                      <span>{reportStudents.length} students · {reportFrom} to {reportTo}</span>
                      <button type="button" className="instructor-calendar-add-button" disabled={!reportStudents.length} onClick={downloadAttendanceReport}>
                        <FiDownload aria-hidden="true" /> Export CSV
                      </button>
                    </div>
                    {reportStudents.length === 0 ? (
                      <div className="instructor-table-empty">No students are enrolled in this class.</div>
                    ) : (
                      <div className="instructor-table-wrap">
                        <table className="instructor-attendance-table instructor-report-table">
                          <thead><tr>
                            <th>Student</th>
                            <th>Student ID</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Late</th>
                            <th>Excused</th>
                            <th>Days recorded</th>
                            <th>Attendance rate</th>
                          </tr></thead>
                          <tbody>
                            {reportStudents.map(student => (
                              <tr key={student.studentId}>
                                <td><strong>{student.studentName}</strong></td>
                                <td>{student.studentIdNumber || "—"}</td>
                                <td>{student.present}</td>
                                <td>{student.absent}</td>
                                <td>{student.late}</td>
                                <td>{student.excused}</td>
                                <td>{student.daysRecorded}</td>
                                <td>{student.attendanceRate == null ? "—" : `${student.attendanceRate}%`}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : null}
              </section>
            )}
          </section>
        ) : (
          <div className="instructor-announcements-layout">
            <section className="instructor-panel">
              <div className="instructor-panel-heading">
                <div><h2>Class calendar</h2><p>Select a date to add an item, or edit an existing item below.</p></div>
                <button type="button" className="instructor-calendar-add-button" onClick={() => openAnnouncementDialog(selectedAnnouncementDate)}>
                  + Add item
                </button>
              </div>
              <Calendar
                className="instructor-calendar"
                onChange={date => openAnnouncementDialog(date)}
                value={selectedAnnouncementDate}
                tileContent={renderCalendarTile}
              />
              <div className="instructor-calendar-legend" aria-label="Calendar item categories">
                {announcementCategories.map(category => (
                  <span key={category.value}>
                    <i style={{ backgroundColor: category.color }} />
                    {category.label}
                  </span>
                ))}
              </div>
              <div className="instructor-calendar-selection">
                <strong>{selectedAnnouncementDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong>
                {getAnnouncementsForDate(selectedAnnouncementDate).length ? (
                  <ul>
                    {getAnnouncementsForDate(selectedAnnouncementDate).map(item => {
                      const category = getAnnouncementCategory(item.title);
                      return (
                        <li key={item.id}>
                          <span className="instructor-category-badge" style={{ "--category-color": category?.color || "#64748b" }}>
                            {category?.label || "Announcement"}
                          </span>
                          {getAnnouncementTitle(item.title)}
                          <small>{item.subjectCode} · {item.sectionCode}</small>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p>No class items scheduled for this date.</p>}
              </div>
            </section>

            <section className="instructor-panel">
              <div className="instructor-panel-heading"><div><h2>My announcements</h2><p>{announcements.length} published</p></div></div>
              {announcements.length === 0 ? (
                <div className="instructor-table-empty">No class announcements have been published.</div>
              ) : (
                <div className="instructor-announcement-list">
                  {announcements.map(item => (
                    <article key={item.id} className="instructor-announcement-card">
                      <div className="instructor-announcement-title-row">
                        <strong>{getAnnouncementTitle(item.title)}</strong>
                        <span className="instructor-category-badge" style={{ "--category-color": getAnnouncementCategory(item.title)?.color || "#64748b" }}>
                          {getAnnouncementCategory(item.title)?.label || "Announcement"}
                        </span>
                      </div>
                      <div className="instructor-announcement-meta">{item.subjectCode} · {item.sectionCode} · {formatAnnouncementDate(item.eventDate)}</div>
                      {item.description && <p>{item.description}</p>}
                      <div className="instructor-announcement-actions">
                        <button type="button" onClick={() => editAnnouncement(item)}>Edit</button>
                        <button type="button" className="cancel" onClick={() => cancelAnnouncement(item)}>Cancel item</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        {announcementDialogOpen && (
          <div className="instructor-dialog-backdrop" onMouseDown={event => {
            if (event.target === event.currentTarget) closeAnnouncementDialog();
          }}>
            <section className="instructor-announcement-dialog" role="dialog" aria-modal="true" aria-labelledby="instructor-dialog-title">
              <div className="instructor-dialog-heading">
                <div>
                  <p className="instructor-eyebrow">{editingAnnouncementId ? "UPDATE CLASS CALENDAR" : "ADD TO CLASS CALENDAR"}</p>
                  <h2 id="instructor-dialog-title">{editingAnnouncementId ? "Edit class item" : "New class item"}</h2>
                  <p>{selectedAnnouncementDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <button type="button" className="instructor-dialog-close" aria-label="Close dialog" onClick={closeAnnouncementDialog}><FiX /></button>
              </div>
              <form onSubmit={publishAnnouncement}>
                {error && <div className="instructor-alert error instructor-dialog-error" role="alert">{error}</div>}
                <label className="instructor-field">
                  Item type
                  <select value={announcementCategory} onChange={event => setAnnouncementCategory(event.target.value)}>
                    {announcementCategories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </label>
                <label className="instructor-field">
                  Class
                  <select required value={announcementForm.sectionStudyLoadId} onChange={event => setAnnouncementForm(current => ({ ...current, sectionStudyLoadId: event.target.value }))}>
                    {classes.map(item => <option key={item.id} value={item.id}>{classLabel(item)} · {item.subjectTitle}</option>)}
                  </select>
                </label>
                <label className="instructor-field">
                  Title
                  <input autoFocus required maxLength={198 - announcementCategory.length} placeholder={announcementCategory === "Exam" ? "e.g. Midterm examination" : announcementCategory === "Deadline" ? "e.g. Project submission" : "e.g. Group presentation"} value={announcementForm.title} onChange={event => setAnnouncementForm(current => ({ ...current, title: event.target.value }))} />
                </label>
                <label className="instructor-field">
                  Details
                  <textarea maxLength={1000} rows={4} placeholder="Add instructions or details for your students" value={announcementForm.description} onChange={event => setAnnouncementForm(current => ({ ...current, description: event.target.value }))} />
                </label>
                <div className="instructor-dialog-actions">
                  <button type="button" className="instructor-secondary-button" onClick={closeAnnouncementDialog} disabled={savingAnnouncement}>Cancel</button>
                  <button type="submit" className="instructor-primary-button" disabled={savingAnnouncement}>
                    {savingAnnouncement ? "Saving…" : editingAnnouncementId ? "Save changes" : "Add to calendar"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
