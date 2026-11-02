import { useCallback, useEffect, useState } from "react";
import { apiService } from "../services/apiService.js";
import "./styles/AdminStudyLoadScheduleValidation.css";

const statuses = [
  { value: "PendingReview", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

function displayStatus(status) {
  return status?.replace(/([a-z])([A-Z])/g, "$1 $2") || "Unknown";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function yearLabel(value) {
  const labels = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };
  return labels[value] || `Year ${value ?? "—"}`;
}

function semesterLabel(value) {
  const labels = { 1: "1st Semester", 2: "2nd Semester", 3: "Summer" };
  return labels[value] || `Semester ${value ?? "—"}`;
}

export default function AdminStudyLoadScheduleValidation() {
  const [schedules, setSchedules] = useState([]);
  const [activeStatus, setActiveStatus] = useState("PendingReview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSchedules = useCallback(async () => {
    try {
      const data = await apiService.getAdminStudyLoadSchedules();
      setError("");
      setSchedules(data);
    } catch (err) {
      setError(err.message || "Failed to load study load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiService.getAdminStudyLoadSchedules()
      .then((data) => {
        if (active) setSchedules(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load study load schedules.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const refreshSchedules = () => {
    setLoading(true);
    setError("");
    void loadSchedules();
  };

  const openDetails = async (schedule) => {
    setDetailsLoading(true);
    setActionError("");
    setDetails(null);
    try {
      setDetails(await apiService.getStudyLoadScheduleById(schedule.id));
    } catch (err) {
      setActionError(err.message || "Failed to load schedule details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const approveSchedule = async () => {
    if (!details?.id) return;
    setActionLoading(true);
    setActionError("");
    try {
      await apiService.approveStudyLoadSchedule(details.id);
      setNotice("Study load schedule approved. The student has been notified.");
      setDetails(null);
      setLoading(true);
      await loadSchedules();
    } catch (err) {
      setActionError(err.message || "Failed to approve study load schedule.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectSchedule = async (event) => {
    event.preventDefault();
    if (!details?.id || !comment.trim()) {
      setActionError("A rejection reason is required.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      await apiService.rejectStudyLoadSchedule(details.id, comment.trim());
      setNotice("Study load schedule rejected. The student has been notified.");
      setDetails(null);
      setRejecting(false);
      setComment("");
      setLoading(true);
      await loadSchedules();
    } catch (err) {
      setActionError(err.message || "Failed to reject study load schedule.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const normalizedStatus = schedule.status?.replace(/\s/g, "").toLowerCase();
    return normalizedStatus === activeStatus.toLowerCase();
  });
  const statusCounts = Object.fromEntries(
    statuses.map(({ value }) => [
      value,
      schedules.filter(
        (schedule) =>
          schedule.status?.replace(/\s/g, "").toLowerCase() === value.toLowerCase(),
      ).length,
    ]),
  );

  return (
    <section className="schedule-validation">
      <header className="schedule-validation__header">
        <div>
          <h1>Study Load Schedule Validation</h1>
          <p>Review student-submitted schedules, courses, instructors, sections, and time details.</p>
        </div>
        <button className="schedule-validation__button schedule-validation__button--secondary" onClick={refreshSchedules} disabled={loading}>
          Refresh
        </button>
      </header>

      {notice && (
        <div className="schedule-validation__notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button>
        </div>
      )}

      <nav className="schedule-validation__tabs" aria-label="Schedule status">
        {statuses.map(({ value, label }) => (
          <button
            key={value}
            className={activeStatus === value ? "active" : ""}
            onClick={() => setActiveStatus(value)}
          >
            {label} <span>{statusCounts[value] ?? 0}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="schedule-validation__state">Loading study load schedules…</p>
      ) : error ? (
        <div className="schedule-validation__state schedule-validation__state--error" role="alert">
          <p>{error}</p>
          <button className="schedule-validation__button" onClick={refreshSchedules}>Try again</button>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <p className="schedule-validation__state">No {displayStatus(activeStatus).toLowerCase()} study load schedules.</p>
      ) : (
        <div className="schedule-validation__list">
          {filteredSchedules.map((schedule) => (
            <article className="schedule-validation__card" key={schedule.id}>
              <div className="schedule-validation__card-heading">
                <div>
                  <h2>{schedule.studentName || "Unnamed Student"}</h2>
                  <p>{schedule.studentId || "—"} · {schedule.email || "—"}</p>
                </div>
                <span className={`schedule-validation__badge schedule-validation__badge--${schedule.status?.toLowerCase() || "unknown"}`}>
                  {displayStatus(schedule.status)}
                </span>
              </div>
              <div className="schedule-validation__metadata">
                <span><strong>Program</strong>{schedule.programCode || "—"}</span>
                <span><strong>Year</strong>{yearLabel(schedule.yearLevel)}</span>
                <span><strong>Semester</strong>{semesterLabel(schedule.semester)}</span>
                <span><strong>Subjects</strong>{schedule.subjectCount ?? 0}</span>
                <span><strong>Submitted</strong>{formatDate(schedule.submittedAt || schedule.createdAt)}</span>
              </div>
              {schedule.adminComment && (
                <p className="schedule-validation__comment"><strong>Admin comment:</strong> {schedule.adminComment}</p>
              )}
              <button className="schedule-validation__button" onClick={() => openDetails(schedule)}>
                View Schedule
              </button>
            </article>
          ))}
        </div>
      )}

      {(details || detailsLoading || actionError) && (
        <div
          className="schedule-validation__overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionLoading) {
              setDetails(null);
              setActionError("");
              setRejecting(false);
            }
          }}
        >
          <section className="schedule-validation__dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-details-title">
            <div className="schedule-validation__dialog-heading">
              <div>
                <h2 id="schedule-details-title">Submitted Study Load</h2>
                {details && <p>{details.studentName} · {details.programCode}</p>}
              </div>
              <button
                className="schedule-validation__close"
                aria-label="Close"
                disabled={actionLoading}
                onClick={() => {
                  setDetails(null);
                  setActionError("");
                  setRejecting(false);
                }}
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <p className="schedule-validation__state">Loading schedule details…</p>
            ) : details ? (
              <>
                <div className="schedule-validation__metadata">
                  <span><strong>Student ID</strong>{details.studentId || "—"}</span>
                  <span><strong>Email</strong>{details.email || "—"}</span>
                  <span><strong>Year</strong>{yearLabel(details.yearLevel)}</span>
                  <span><strong>Semester</strong>{semesterLabel(details.semester)}</span>
                  <span><strong>Status</strong>{displayStatus(details.status)}</span>
                  <span><strong>Submitted</strong>{formatDate(details.submittedAt || details.createdAt)}</span>
                </div>
                <div className="schedule-validation__table-wrap">
                  <table>
                    <thead>
                      <tr><th>Code</th><th>Subject</th><th>Section</th><th>Professor</th><th>Days</th><th>Time</th><th>Room</th></tr>
                    </thead>
                    <tbody>
                      {(details.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.subjectCode || "—"}</td>
                          <td>{item.subjectTitle || "—"}</td>
                          <td>{item.section || "—"}</td>
                          <td>{item.professorName || "—"}</td>
                          <td>{item.days || "—"}</td>
                          <td>{item.startTime || "—"}–{item.endTime || "—"}</td>
                          <td>{item.room || "—"}</td>
                        </tr>
                      ))}
                      {(!details.items || details.items.length === 0) && (
                        <tr><td colSpan="7">No subjects in this schedule.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {actionError && <p className="schedule-validation__error" role="alert">{actionError}</p>}
                {details.status === "PendingReview" && (
                  rejecting ? (
                    <form className="schedule-validation__reject-form" onSubmit={rejectSchedule}>
                      <label htmlFor="schedule-rejection-comment">Reason / comment</label>
                      <textarea
                        id="schedule-rejection-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Explain what needs to be corrected."
                        required
                      />
                      <div className="schedule-validation__actions">
                        <button type="button" className="schedule-validation__button schedule-validation__button--secondary" onClick={() => { setRejecting(false); setActionError(""); }} disabled={actionLoading}>Back</button>
                        <button type="submit" className="schedule-validation__button schedule-validation__button--danger" disabled={actionLoading}>{actionLoading ? "Rejecting…" : "Reject Schedule"}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="schedule-validation__actions">
                      <button className="schedule-validation__button schedule-validation__button--secondary" onClick={() => setRejecting(true)} disabled={actionLoading}>Reject</button>
                      <button className="schedule-validation__button" onClick={approveSchedule} disabled={actionLoading}>{actionLoading ? "Approving…" : "Approve"}</button>
                    </div>
                  )
                )}
              </>
            ) : (
              actionError && <p className="schedule-validation__error" role="alert">{actionError}</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
