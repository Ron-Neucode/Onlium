import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService.js";
import "./styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const registrationSuccess = location.state?.success || "";

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await authService.login(email, password);

      if (response.token) {
        // Parse fullName into firstName and lastName
        const nameParts = response.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const safeUser = {
          email: response.email,
          fullName: response.fullName,
          firstName: firstName,
          lastName: lastName,
          role: response.role,
          token: response.token,
          studentId: response.studentIdNumber,
          yearLevel: response.yearLevel,
          section: response.section,
        };
        authService.saveUserSession(safeUser);
        setSuccess("Login successful!");
        navigate(response.role === "Admin" ? "/admin" : response.role === "Instructor" ? "/instructor" : "/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Onlium offers Interactive learning experience</h1>
        <div className="login-logo-bars">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="login-card">
        <button className="back-arrow" onClick={() => navigate("/")}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth="1.8">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue your learning journey</p>

        <div className="auth-tabs">
          <button
            className="tab-btn tab-inactive"
            onClick={() => navigate("/register/create")}
          >
            Sign Up
          </button>
          <button className="tab-btn tab-active">Log In</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {(success || registrationSuccess) && <div className="success-message">{success || registrationSuccess}</div>}

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="off"
        />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="new-password"
          />
          <button
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="forgot-link">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
          >
            Forgot password?
          </a>
        </div>

        <button className="login-btn" onClick={handleSubmit}>
          Log In
        </button>

        <p className="login-bottom-text">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register/create");
            }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}