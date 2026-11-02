import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService.js";
import "./styles/Login.css";

export default function ModeratorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await authService.login(email, password);

      if (!response.token || response.role !== "Admin") {
        setError("This account does not have administrator access.");
        return;
      }

      authService.saveUserSession({
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        token: response.token,
      });
      navigate("/admin/dashboard");
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
        <h2>ADMIN</h2>
        <p className="subtitle">Log in to manage your platform</p>

        {error && <div className="error-message">{error}</div>}

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@onlium.com"
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

        <button className="login-btn" onClick={handleSubmit}>
          Log In
        </button>
      </div>
    </div>
  );
}