import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../services/apiService.js";
import "./styles/EnrollmentChecklist.css";

export default function EnrollmentChecklist() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiService.getMyApplications()
      .then(applications => {
        if (active) setApplication(applications[0] || null);
      })
      .catch(requestError => {
        if (active) setError(requestError.message || "Unable to load your enrollment status.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const status = application?.status || "Not started";

  return (
    <div className="card">
      <div className="card-title">Enrollment status</div>
      <div style={{ padding: 12 }}>
        {loading ? (
          <p role="status">Loading status...</p>
        ) : error ? (
          <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>
        ) : (
          <>
            <p style={{ marginTop: 0 }}>
              {application
                ? `${application.studentType || "Application"} · ${status}`
                : "You have no enrollment application on file."}
            </p>
            {application?.adminReviewComment && (
              <p style={{ color: "#b91c1c" }}>Registrar note: {application.adminReviewComment}</p>
            )}
            {(!application || status === "Rejected" || status === "Draft") && (
              <Link className="continue-link" to="/enrollment">
                {application ? "Continue application →" : "Start enrollment →"}
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}