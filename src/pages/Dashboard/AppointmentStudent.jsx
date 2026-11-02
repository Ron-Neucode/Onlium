import { useCallback, useEffect, useState } from "react";
import { apiService } from "../../services/apiService.js";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

const normalizeStatus = value => String(value || "").replace(/\s/g, "").toLowerCase();

export default function AppointmentStudent() {
  const [activeNav, setActiveNav] = useState("Appointments");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [receiptFiles, setReceiptFiles] = useState({});
  const [submittingApplicationId, setSubmittingApplicationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [appointmentData, applicationData, paymentData] = await Promise.all([
        apiService.getMyAppointments(),
        apiService.getMyApplications(),
        apiService.getMyPaymentRequests(),
      ]);
      setAppointments(appointmentData);
      setApplications(applicationData);
      setPaymentRequests(paymentData);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your enrollment and payment information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitReceipt(applicationId) {
    const file = receiptFiles[applicationId];
    if (!file) {
      setPaymentMessage("Choose a receipt image or PDF before submitting.");
      return;
    }

    setSubmittingApplicationId(applicationId);
    setPaymentMessage("");
    try {
      await apiService.submitPaymentReceipt(applicationId, file);
      setReceiptFiles(current => {
        const next = { ...current };
        delete next[applicationId];
        return next;
      });
      setPaymentMessage("Your receipt was submitted. The Registrar will review your payment and notify you of the result.");
      await loadData();
    } catch (requestError) {
      setPaymentMessage(requestError.message || "Unable to submit your payment receipt.");
    } finally {
      setSubmittingApplicationId("");
    }
  }

  const approvedApplications = applications.filter(app => normalizeStatus(app.status) === "approved");
  const paymentByApplication = new Map();
  for (const request of paymentRequests) {
    if (!paymentByApplication.has(request.applicationId)) {
      paymentByApplication.set(request.applicationId, request);
    }
  }

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <div style={{ padding: "28px 32px", flex: 1, maxWidth: 1050, margin: "0 auto" }}>
            <header style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Enrollment & Payment
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                Review your enrollment decision, cashier instructions, and payment receipt status.
              </p>
            </header>

            {error && (
              <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 14, marginBottom: 16, color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ color: "#1e293b", fontSize: 18, margin: "0 0 16px" }}>Payment Verification</h2>
              {loading ? (
                <p role="status" style={{ color: "#64748b" }}>Loading your enrollment status…</p>
              ) : approvedApplications.length === 0 ? (
                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                  Once your enrollment application is approved, this page will show the cashier instructions and allow you to submit your down-payment receipt.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {approvedApplications.map(application => {
                    const paymentRequest = paymentByApplication.get(application.id);
                    return (
                      <article key={application.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ color: "#1e293b", fontSize: 16, margin: 0 }}>
                              {application.programCode} · Year {application.yearLevel} · Semester {application.semester}
                            </h3>
                            <p style={{ color: "#15803d", fontWeight: 700, fontSize: 13, margin: "7px 0 0" }}>
                              Enrollment application accepted
                            </p>
                          </div>
                          {paymentRequest && (
                            <span style={{ background: paymentRequest.status === "Approved" ? "#dcfce7" : paymentRequest.status === "Rejected" ? "#fee2e2" : "#fef3c7", color: paymentRequest.status === "Approved" ? "#166534" : paymentRequest.status === "Rejected" ? "#991b1b" : "#92400e", borderRadius: 18, padding: "6px 11px", height: "fit-content", fontSize: 12, fontWeight: 700 }}>
                              Payment: {paymentRequest.status === "PendingReview" ? "Pending review" : paymentRequest.status}
                            </span>
                          )}
                        </div>
                        <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 14 }}>
                          Please visit the cashier during office hours and pay the required tuition down payment. After paying, upload a clear photo or PDF of your official receipt below. Your enrollment and student ID will be confirmed after the Registrar validates your payment.
                        </p>

                        {paymentRequest?.status === "Approved" ? (
                          <p style={{ color: "#166534", fontWeight: 600, marginBottom: 0 }}>
                            Your payment was approved and your enrollment is complete. Your official study load is now available.
                          </p>
                        ) : paymentRequest?.status === "PendingReview" ? (
                          <p style={{ color: "#92400e", marginBottom: 0 }}>
                            Your receipt was submitted on {new Date(paymentRequest.submittedAt).toLocaleString()} and is awaiting review.
                          </p>
                        ) : (
                          <>
                            {paymentRequest?.status === "Rejected" && (
                              <div style={{ background: "#fef2f2", borderRadius: 8, padding: 12, marginBottom: 14, color: "#991b1b", fontSize: 13 }}>
                                <strong>Your receipt needs attention.</strong> {paymentRequest.adminReviewComment || "Please submit a clearer or corrected receipt."}
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                onChange={event => {
                                  const file = event.target.files?.[0];
                                  setReceiptFiles(current => ({ ...current, [application.id]: file || null }));
                                  setPaymentMessage("");
                                }}
                                aria-label="Choose payment receipt"
                              />
                              <button
                                type="button"
                                disabled={submittingApplicationId === application.id}
                                onClick={() => void submitReceipt(application.id)}
                                style={{ background: "#1d4ed8", color: "#fff", border: 0, borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                              >
                                {submittingApplicationId === application.id ? "Submitting…" : "Submit receipt for review"}
                              </button>
                            </div>
                            <p style={{ color: "#64748b", fontSize: 12, margin: "8px 0 0" }}>Accepted formats: JPG, PNG, or PDF. Maximum file size: 5 MB.</p>
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              {paymentMessage && <p role="status" style={{ color: paymentMessage.toLowerCase().includes("unable") || paymentMessage.toLowerCase().includes("choose") ? "#b91c1c" : "#166534", fontSize: 13, marginBottom: 0 }}>{paymentMessage}</p>}
            </section>

            <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
              <h2 style={{ color: "#1e293b", fontSize: 18, margin: "0 0 16px" }}>Registrar Appointments</h2>
              {loading ? (
                <p role="status" style={{ color: "#64748b" }}>Loading appointments…</p>
              ) : appointments.length === 0 ? (
                <p style={{ color: "#64748b", margin: 0 }}>
                  No appointment has been scheduled. If the Registrar schedules a campus visit, its details will appear here. Cashier payments may be made during office hours.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {appointments.map(appointment => (
                    <article key={appointment.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                        <h3 style={{ fontSize: 16, margin: 0, color: "#1e293b" }}>Enrollment appointment</h3>
                        <span style={{ color: "#1d4ed8", background: "#eff6ff", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {appointment.status || "Scheduled"}
                        </span>
                      </div>
                      <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, margin: 0 }}>
                        <div>
                          <dt style={{ color: "#64748b", fontSize: 12 }}>Date and time</dt>
                          <dd style={{ margin: "4px 0 0", color: "#1e293b", fontWeight: 600 }}>
                            {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : "Not provided"}
                          </dd>
                        </div>
                        <div>
                          <dt style={{ color: "#64748b", fontSize: 12 }}>Location</dt>
                          <dd style={{ margin: "4px 0 0", color: "#1e293b", fontWeight: 600 }}>{appointment.location || "Cashier office"}</dd>
                        </div>
                        {appointment.notes && (
                          <div>
                            <dt style={{ color: "#64748b", fontSize: 12 }}>Notes</dt>
                            <dd style={{ margin: "4px 0 0", color: "#1e293b" }}>{appointment.notes}</dd>
                          </div>
                        )}
                      </dl>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
