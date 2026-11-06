import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomepageUniversity from "./pages/Homepage/HomepageUniversity.jsx";
import RegisterUniversity from "./pages/Register/RegisterUniversity.jsx";
import CreateAccount from "./pages/Register/CreateAccount.jsx";
import InstructorInvitationSetup from "./pages/Register/InstructorInvitationSetup.jsx";
import Login from "./pages/Register/Login.jsx";
import ForgotPassword from "./pages/Register/ForgotPassword.jsx";
import ModeratorLogin from "./pages/Register/ModeratorLogin.jsx";
import AdminDashboard from "./Admin/dashboardadmin.jsx";
import StudentManagement from "./Admin/StudentManagement.jsx";
import CourseCurriculum from "./Admin/CourseCurriculum.jsx";
import Bulletin from "./Admin/Bulletin.jsx";
import Layout from "./Admin/layout.jsx";
import AdminAppointments from "./Admin/AdminAppointments.jsx";
import ResourcesAdmin from "./Admin/Resources.jsx";
import PaymentVerification from "./Admin/PaymentVerification.jsx";
import SectionManagement from "./Admin/SectionManagement.jsx";
import AdminSchoolCalendar from "./Admin/AdminSchoolCalendar.jsx";
import AcademicRooms from "./Admin/AcademicRooms.jsx";
import InstructorManagement from "./Admin/InstructorManagement.jsx";
import InstructorDashboard from "./Instructor/InstructorDashboard.jsx";
import OnliumDashboard from "./pages/Dashboard/OnliumDashboard.jsx";
import ResourcesStudent from "./pages/Dashboard/ResourcesStudent.jsx";
import AppointmentStudent from "./pages/Dashboard/AppointmentStudent.jsx";
import NotificationsStudent from "./pages/Dashboard/NotificationsStudent.jsx";
import StudyloadStudent from "./pages/Dashboard/StudyloadStudent.jsx";
import StudentSchoolCalendar from "./pages/Dashboard/StudentSchoolCalendar.jsx";
import ClassAnnouncements from "./pages/Dashboard/ClassAnnouncements.jsx";
import ClassMaterialsStudent from "./pages/Dashboard/ClassMaterialsStudent.jsx";
import EnrollmentLayout from "./pages/Enrollment/EnrollmentLayout.jsx";
import AdminRoute from "./AdminRoute.jsx";
import StudentRoute from "./StudentRoute.jsx"; // ✅ add this
import InstructorRoute from "./InstructorRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomepageUniversity />} />
        <Route path="/apply-now" element={<Navigate to="/enrollment" replace />} />
        <Route path="/login" element={<ModeratorLogin />} />
        <Route path="/register" element={<RegisterUniversity />} />
        <Route path="/register/create" element={<CreateAccount />} />
        <Route path="/instructor/accept-invitation" element={<InstructorInvitationSetup />} />
        <Route path="/register/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register/moderator" element={<ModeratorLogin />} />

        {/* ✅ Admin routes now protected */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="curriculum" element={<CourseCurriculum />} />
          <Route path="resources" element={<ResourcesAdmin />} />
          <Route path="bulletin" element={<Bulletin />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="payment-verification" element={<PaymentVerification />} />
          <Route path="sections" element={<SectionManagement />} />
          <Route path="instructors" element={<InstructorManagement />} />
          <Route path="classrooms" element={<AcademicRooms />} />
          <Route path="calendar" element={<AdminSchoolCalendar />} />
        </Route>

        <Route path="/instructor" element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        } />

        {/* Student routes - now protected */}
        <Route path="/dashboard" element={
          <StudentRoute>
            <OnliumDashboard />
          </StudentRoute>
        } />
        <Route path="/student/resources" element={
          <StudentRoute>
            <ResourcesStudent />
          </StudentRoute>
        } />
        <Route path="/student/appointments" element={
          <StudentRoute>
            <AppointmentStudent />
          </StudentRoute>
        } />
        <Route path="/student/notifications" element={
          <StudentRoute>
            <NotificationsStudent />
          </StudentRoute>
        } />
        <Route path="/student/studyload" element={
          <StudentRoute>
            <StudyloadStudent />
          </StudentRoute>
        } />
        <Route path="/student/calendar" element={
          <StudentRoute>
            <StudentSchoolCalendar />
          </StudentRoute>
        } />
        <Route path="/student/announcements" element={
          <StudentRoute>
            <ClassAnnouncements />
          </StudentRoute>
        } />
        <Route path="/student/class-materials" element={
          <StudentRoute>
            <ClassMaterialsStudent />
          </StudentRoute>
        } />
        <Route path="/studyload" element={<Navigate to="/student/studyload" replace />} />
        <Route path="/resources" element={<Navigate to="/student/resources" replace />} />
        <Route path="/appointment" element={<Navigate to="/student/appointments" replace />} />
        <Route path="/notifications" element={<Navigate to="/student/notifications" replace />} />
        <Route path="/enrollment" element={
          <StudentRoute>
            <EnrollmentLayout />
          </StudentRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;