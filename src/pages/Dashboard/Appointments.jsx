import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService.js";
import "./styles/Appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Appointments</div>
        <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-title">Appointments</div>
        <div style={{ padding: "20px", textAlign: "center", color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Appointments</div>
      {appointments.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
          No appointments
        </div>
      ) : (
        appointments.map((appt) => (
          <div className="appt-item" key={appt.id}>
            <div className={`appt-dot ${appt.status.toLowerCase()}`} />
            <div>
              <div className="appt-label">
                {appt.location || "Appointment"} - {formatDate(appt.appointmentDate)}
              </div>
              <div className={`appt-status ${appt.status.toLowerCase()}`}>
                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </div>
              {appt.notes && (
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {appt.notes}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}