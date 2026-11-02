import { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "../services/apiService.js";

const STATUSES = ["PendingReview", "Approved", "Rejected"];

function formatStatus(status) {
  return status === "PendingReview" ? "Pending review" : status;
}

export default function PaymentVerification() {
  const [status, setStatus] = useState("PendingReview");
  const [requests, setRequests] = useState([]);
  const [receiptUrls, setReceiptUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const receiptUrlsRef = useRef(receiptUrls);
  receiptUrlsRef.current = receiptUrls;

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRequests(await apiService.getAdminPaymentRequests(status));
    } catch (requestError) {
      setError(requestError.message || "Unable to load payment requests.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => () => {
    Object.values(receiptUrlsRef.current).forEach(URL.revokeObjectURL);
  }, []);

  async function handleOpenReceipt(request) {
    setActionError("");
    try {
      const blob = await apiService.getAdminPaymentReceipt(request.id);
      const objectUrl = URL.createObjectURL(blob);
      setReceiptUrls(current => {
        if (current[request.id]) URL.revokeObjectURL(current[request.id]);
        return { ...current, [request.id]: objectUrl };
      });
    } catch (requestError) {
      setActionError(requestError.message || "Unable to open the payment receipt.");
    }
  }

  async function handleReview(request, decision) {
    let reason = "";
    if (decision === "reject") {
      reason = window.prompt("Enter the reason for rejecting this receipt:");
      if (reason === null) return;
      if (!reason.trim()) {
        setActionError("A rejection reason is required.");
        return;
      }
    } else if (!window.confirm(`Approve this receipt for ${request.studentName}? The system will assign them to an available section, complete enrollment, and generate their student ID.`)) {
      return;
    }

    setActionLoading(request.id);
    setActionError("");
    try {
      if (decision === "approve") await apiService.approvePaymentRequest(request.id);
      else await apiService.rejectPaymentRequest(request.id, reason.trim());
      await loadRequests();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to review this payment request.");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: "#1e293b", fontSize: 24 }}>Payment Verification</h1>
        <p style={{ color: "#64748b", margin: "6px 0 0", fontSize: 14 }}>
          Review student receipts. Approval completes enrollment, assigns a student to an available section with a complete schedule, and generates the student ID.
        </p>
      </header>

      <nav aria-label="Payment request status" style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {STATUSES.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "10px 14px",
              background: status === item ? "#2563eb" : "#e2e8f0",
              color: status === item ? "#fff" : "#334155",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {formatStatus(item)}
          </button>
        ))}
        <button type="button" onClick={() => void loadRequests()} disabled={loading} style={{ marginLeft: "auto" }}>
          Refresh
        </button>
      </nav>

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {actionError && <p role="alert" style={{ color: "#b91c1c" }}>{actionError}</p>}
      {loading ? (
        <p role="status" style={{ color: "#64748b" }}>Loading payment requests…</p>
      ) : requests.length === 0 ? (
        <section style={{ padding: 28, borderRadius: 12, background: "#fff", color: "#64748b", textAlign: "center" }}>
          No {formatStatus(status).toLowerCase()} payment requests.
        </section>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {requests.map(request => (
            <article key={request.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: 0, color: "#1e293b", fontSize: 17 }}>{request.studentName}</h2>
                  <p style={{ color: "#64748b", margin: "5px 0" }}>{request.email}</p>
                  <p style={{ color: "#475569", margin: 0 }}>
                    {request.programCode} · Year {request.yearLevel} · Semester {request.semester}
                  </p>
                </div>
                <span style={{ color: "#1d4ed8", background: "#eff6ff", borderRadius: 18, padding: "6px 11px", height: "fit-content", fontSize: 12, fontWeight: 700 }}>
                  {formatStatus(request.status)}
                </span>
              </div>
              <p style={{ margin: "14px 0 8px", color: "#64748b", fontSize: 13 }}>
                Submitted {new Date(request.submittedAt).toLocaleString()} · {(request.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <p style={{ margin: "0 0 14px", color: "#1e293b", fontSize: 13 }}>{request.originalFileName}</p>
              {request.adminReviewComment && (
                <p style={{ color: "#b91c1c", fontSize: 13 }}>Review note: {request.adminReviewComment}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                {receiptUrls[request.id] ? (
                  <a href={receiptUrls[request.id]} target="_blank" rel="noreferrer">Open receipt</a>
                ) : (
                  <button type="button" onClick={() => void handleOpenReceipt(request)}>Load receipt</button>
                )}
                {request.status === "PendingReview" && (
                  <>
                    <button
                      type="button"
                      disabled={Boolean(actionLoading)}
                      onClick={() => void handleReview(request, "approve")}
                      style={{ background: "#15803d", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}
                    >
                      {actionLoading === request.id ? "Saving…" : "Approve payment"}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionLoading)}
                      onClick={() => void handleReview(request, "reject")}
                      style={{ background: "#fff", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 6, padding: "8px 12px", cursor: "pointer" }}
                    >
                      Reject receipt
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
