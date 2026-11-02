import { Navigate } from "react-router-dom";
import { authService } from "./services/authService.js";

export default function AdminRoute({ children }) {
  const isAdmin = authService.isAdmin();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}