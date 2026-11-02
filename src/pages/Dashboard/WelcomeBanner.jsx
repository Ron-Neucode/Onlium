import { useState, useEffect } from "react";
import { apiService } from "../../services/apiService.js";
import { authService } from "../../services/authService.js";
import "./styles/WelcomeBanner.css";

export default function WelcomeBanner() {
  const [currentUser, setCurrentUser] = useState({ firstName: "", lastName: "", studentId: "" });
  const [enrollment, setEnrollment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const user = authService.getUserSession() || {};
    setCurrentUser({ firstName: user.firstName || "", lastName: user.lastName || "" });

    Promise.all([apiService.getMyApplications(), apiService.getMyStudentProfile()])
      .then(([applications, profile]) => {
        if (!active) return;
        setEnrollment(applications[0] || null);
        setCurrentUser(current => ({
          ...current,
          firstName: profile.firstName || current.firstName,
          lastName: profile.lastName || current.lastName,
          studentId: profile.studentIdNumber || "",
        }));
      })
      .catch(loadError => {
        if (active) setError(loadError.message || "Unable to load student information.");
      });
    return () => {
      active = false;
    };
  }, []);

  const getFullName = () => {
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser.firstName || currentUser.lastName || "Guest";
  };

  const getStudentInfo = () => {
    if (error) return error;
    if (!enrollment) return "No enrollment application on file";
    const status = enrollment.status?.replace(/\s/g, "").toLowerCase();
    const term = `${enrollment.programCode || ""}${enrollment.yearLevel ? ` · Year ${enrollment.yearLevel}` : ""}`;
    if (status === "completed") return `${term}${currentUser.studentId ? ` · ${currentUser.studentId}` : ""}`;
    if (status === "approved") return `${term} · Application approved`;
    return `${term ? `${term} · ` : ""}${enrollment.status || "Application in progress"}`;
  };

  return (
    <div className="welcome-banner">
      <div className="wb-left">
        <h2>
          Welcome back, <span style={{ fontWeight: 800, fontFamily: "inherit" }}>{getFullName()}</span>
        </h2>
        <p>{getStudentInfo()}</p>
      </div>
    </div>
  );
}