import { Navigate } from "react-router-dom";
import { authService } from "./services/authService.js";

export default function InstructorRoute({ children }) {
  const user = authService.getUserSession();
  const isInstructor = authService.isAuthenticated() && user?.role === "Instructor";

  if (!isInstructor) {
    const destination = user?.role === "Admin"
      ? "/admin"
      : user?.role === "Student"
        ? "/dashboard"
        : "/register/login";
    return <Navigate to={destination} replace />;
  }

  return children;
}
