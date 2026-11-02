import { useState, useEffect } from "react";
import "./styles/OnliumDashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import WelcomeBanner from "./WelcomeBanner";
import QuickCards from "./QuickCards";
import EnrollmentChecklist from "./EnrollmentChecklist";
import Bulletin from "./Bulletin";
import Appointments from "./Appointments";
import { apiService } from "../../services/apiService.js";

export default function OnliumDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState("");

  useEffect(() => {
    let active = true;
    apiService.getMyApplications()
      .then(applications => {
        if (active) setEnrollment(applications[0] || null);
      })
      .catch(error => {
        if (active) setEnrollmentError(error.message || "Unable to load your enrollment status.");
      });
    return () => {
      active = false;
    };
  }, []);

  const status = enrollment?.status?.replace(/\s/g, "").toLowerCase();
  const isPending = status === "pendingreview" || status === "draft";
  const isApproved = status === "approved";
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <WelcomeBanner />

          {/* Enrollment Status Banner */}
          {enrollmentError && (
            <div role="alert" style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"14px 20px", marginBottom:20, color:"#991b1b" }}>
              {enrollmentError}
            </div>
          )}
          {isPending && (
            <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:12, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>Enrollment Submitted — Waiting for Admin Approval</div>
                <div style={{ fontSize:12, color:"#b45309", marginTop:2 }}>Your requirements have been submitted. Please wait while the admin reviews your application.</div>
              </div>
            </div>
          )}

          {isApproved && (
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:12, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#15803d" }}>Application Approved</div>
                <div style={{ fontSize:12, color:"#16a34a", marginTop:2 }}>Your application was accepted. Pay your required tuition down payment at the cashier during office hours, then submit your receipt through the Appointments page for validation.</div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:12, padding:"14px 20px", marginBottom:20, color:"#15803d", fontSize:13, fontWeight:700 }}>
              Enrollment completed.
            </div>
          )}

          {isRejected && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"14px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#991b1b" }}>Enrollment Rejected</div>
                <div style={{ fontSize:12, color:"#dc2626", marginTop:2 }}>Your enrollment was rejected by the admin. Please visit the Registrar's Office for assistance.</div>
              </div>
            </div>
          )}

          <QuickCards />
          <div className="bottom-grid">
            <EnrollmentChecklist />
            <div className="right-col">
              <Bulletin />
              <Appointments />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}