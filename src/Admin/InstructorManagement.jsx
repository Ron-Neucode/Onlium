import { useCallback, useEffect, useState } from "react";
import { apiService } from "../services/apiService.js";
import "./styles/InstructorManagement.css";

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 18,
};

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInstructors = useCallback(async () => {
    try {
      const [instructorData, invitationData] = await Promise.all([
        apiService.getAdminInstructors(),
        apiService.getAdminInstructorInvitations(),
      ]);
      setError("");
      setInstructors(instructorData);
      setInvitations(invitationData);
    } catch (requestError) {
      setError(requestError.message || "Unable to load instructor accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function sendInvitation(event, invitation = null) {
    event?.preventDefault();
    const fullName = invitation?.fullName || inviteFullName.trim();
    const email = invitation?.email || inviteEmail.trim();
    if (!fullName || !email) {
      setError("Enter the instructor's name and school email.");
      return;
    }

    setError("");
    setNotice("");
    setSendingInvitation(true);
    try {
      const result = await apiService.sendInstructorInvitation({ fullName, email });
      setNotice(result.message || `Invitation sent to ${email}.`);
      setInviteFullName("");
      setInviteEmail("");
      await loadInstructors();
    } catch (requestError) {
      setError(requestError.message || "Unable to send instructor invitation.");
    } finally {
      setSendingInvitation(false);
    }
  }

  async function revokeInvitation(invitation) {
    setError("");
    setNotice("");
    setWorkingId(`invitation-${invitation.id}`);
    try {
      const result = await apiService.revokeInstructorInvitation(invitation.id);
      setNotice(result.message || "Instructor invitation revoked.");
      await loadInstructors();
    } catch (requestError) {
      setError(requestError.message || "Unable to revoke invitation.");
    } finally {
      setWorkingId("");
    }
  }

  useEffect(() => {
    // This effect starts the page's asynchronous initial data request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadInstructors();
  }, [loadInstructors]);

  async function handleAccountAction(instructor, action) {
    setError("");
    setNotice("");
    setWorkingId(instructor.id);
    try {
      let result;
      if (action === "approve") result = await apiService.approveInstructor(instructor.id);
      else if (action === "reject") result = await apiService.rejectInstructor(instructor.id);
      else result = await apiService.setInstructorActive(instructor.id, action === "activate");
      setNotice(result.message || "Instructor account updated.");
      await loadInstructors();
    } catch (requestError) {
      setError(requestError.message || "Unable to update instructor account.");
    } finally {
      setWorkingId("");
    }
  }

  const pending = instructors.filter(instructor => instructor.status === "Pending");
  const approved = instructors.filter(instructor =>
    instructor.status === "Active" || instructor.status === "Inactive");
  const rejected = instructors.filter(instructor => instructor.status === "Rejected");

  return (
    <main style={{ padding: 28, maxWidth: 1200, margin: "0 auto", color: "#1e293b" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Instructor Accounts</h1>
        <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
          Invite instructors to set their own password, review accounts waiting for approval, and manage active instructors.
        </p>
      </header>

      {notice && (
        <div role="status" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p role="status" style={{ color: "#64748b" }}>Loading instructor accounts…</p>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          <section className="instructor-invite-layout" style={cardStyle}>
            <form className="instructor-invite-form" onSubmit={event => void sendInvitation(event)}>
              <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>Invite an instructor</h2>
              <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
                We’ll email a one-time setup link. Instructors create their own password; you approve the account after setup.
              </p>
              <label style={{ display: "grid", gap: 5, marginBottom: 10, color: "#475569", fontSize: 12, fontWeight: 700 }}>
                Instructor name
                <input required maxLength={200} value={inviteFullName} onChange={event => setInviteFullName(event.target.value)} placeholder="Full name" style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #cbd5e1", borderRadius: 7, font: "inherit" }} />
              </label>
              <label style={{ display: "grid", gap: 5, marginBottom: 13, color: "#475569", fontSize: 12, fontWeight: 700 }}>
                School email
                <input required type="email" maxLength={255} value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="instructor@school.edu" style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #cbd5e1", borderRadius: 7, font: "inherit" }} />
              </label>
              <button type="submit" disabled={sendingInvitation} style={{ border: 0, borderRadius: 7, padding: "10px 14px", background: sendingInvitation ? "#94a3b8" : "#1e40af", color: "#fff", fontWeight: 700, cursor: sendingInvitation ? "wait" : "pointer" }}>
                {sendingInvitation ? "Sending invitation…" : "Send invitation"}
              </button>
            </form>

            <div className="instructor-invite-list">
              <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Invitations <span style={{ color: "#64748b", fontWeight: 500 }}>({invitations.length})</span>
              </h2>
              {invitations.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>No instructor invitations are waiting for setup.</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {invitations.map(invitation => (
                    <article key={invitation.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{invitation.fullName}</strong>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{invitation.email}</div>
                        <div style={{ color: invitation.status === "Expired" ? "#b45309" : "#64748b", fontSize: 11, marginTop: 2 }}>
                          {invitation.status} · expires {new Date(invitation.expiresAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" disabled={sendingInvitation || workingId === `invitation-${invitation.id}`} onClick={() => void sendInvitation(null, invitation)} style={{ border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 9px", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {sendingInvitation ? "Sending…" : "Resend"}
                        </button>
                        <button type="button" disabled={workingId === `invitation-${invitation.id}`} onClick={() => void revokeInvitation(invitation)} style={{ border: "1px solid #fecaca", borderRadius: 6, padding: "6px 9px", background: "#fff", color: "#b91c1c", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          Revoke
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>
              Pending approval <span style={{ color: "#64748b", fontWeight: 500 }}>({pending.length})</span>
            </h2>
            {pending.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>There are no instructor applications waiting for approval.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {pending.map(instructor => (
                  <article key={instructor.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", border: "1px solid #e2e8f0", borderRadius: 9, padding: 13 }}>
                    <div>
                      <strong>{instructor.fullName}</strong>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>{instructor.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" disabled={workingId === instructor.id} onClick={() => void handleAccountAction(instructor, "approve")} style={{ border: 0, borderRadius: 7, padding: "8px 12px", background: "#15803d", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                        {workingId === instructor.id ? "Saving…" : "Approve"}
                      </button>
                      <button type="button" disabled={workingId === instructor.id} onClick={() => void handleAccountAction(instructor, "reject")} style={{ border: "1px solid #fecaca", borderRadius: 7, padding: "8px 12px", background: "#fff", color: "#b91c1c", fontWeight: 700, cursor: "pointer" }}>
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Approved instructors</h2>
            {approved.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>No instructor accounts have been approved yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 8px" }}>Instructor</th>
                      <th style={{ padding: "10px 8px" }}>Assigned classes</th>
                      <th style={{ padding: "10px 8px" }}>Status</th>
                      <th style={{ padding: "10px 8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approved.map(instructor => (
                      <tr key={instructor.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "11px 8px" }}>
                          <strong>{instructor.fullName}</strong>
                          <div style={{ color: "#64748b", fontSize: 12 }}>{instructor.email}</div>
                        </td>
                        <td style={{ padding: "11px 8px" }}>{instructor.assignedClassCount}</td>
                        <td style={{ padding: "11px 8px", color: instructor.status === "Active" ? "#15803d" : "#b91c1c", fontWeight: 700 }}>{instructor.status}</td>
                        <td style={{ padding: "11px 8px" }}>
                          <button type="button" disabled={workingId === instructor.id} onClick={() => void handleAccountAction(instructor, instructor.status === "Active" ? "deactivate" : "activate")} style={{ border: 0, background: "transparent", color: instructor.status === "Active" ? "#b91c1c" : "#15803d", fontWeight: 700, cursor: "pointer" }}>
                            {workingId === instructor.id ? "Saving…" : instructor.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {rejected.length > 0 && (
            <section style={cardStyle}>
              <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Rejected applications ({rejected.length})</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {rejected.map(instructor => (
                  <div key={instructor.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", color: "#64748b", fontSize: 13 }}>
                    <span>{instructor.fullName} · {instructor.email}</span>
                    <span>{instructor.assignedClassCount} assigned classes</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
