import { Navigate } from "react-router-dom";
import { authService } from "./services/authService.js";

export default function StudentRoute({ children }) {
  const user = authService.getUserSession();
  const isStudent = authService.isAuthenticated() && user?.role === "Student";

  if (!isStudent) {
    return <Navigate to={user?.role === "Admin" ? "/admin" : "/register/login"} replace />;
  }

  return children;
}
