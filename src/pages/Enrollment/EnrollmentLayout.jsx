import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/styles/OnliumDashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import EnrollmentPage from "../../components/enrollment/EnrollmentPage";

export default function EnrollmentLayout() {
  const [activeNav, setActiveNav] = useState("Enrollment");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} hideLogout />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          <EnrollmentPage onGoToStudyLoad={() => navigate("/dashboard")} />
        </div>
      </div>
    </div>
  );
}
