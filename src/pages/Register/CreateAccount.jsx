import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/apiConfig.js";
import "./styles/CreateAccount.css";

async function readApiResponse(response, fallbackMessage) {
  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    if (!response.ok) {
      throw new Error(
        `${fallbackMessage} (HTTP ${response.status}). The API returned an unexpected response; check the API server logs.`,
      );
    }
    throw new Error("The API returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export default function CreateAccount({ onSwitchToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyType, setPolicyType] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreedToPolicies) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          registrationData: {
            firstName,
            lastName,
            password,
            accountType: "Student",
          }
        }),
      });

      await readApiResponse(response, "Failed to send OTP.");

      setOtpEmail(email);
      setShowOtpScreen(true);
      setResendCountdown(60);
      setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
      setLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          otp
        }),
      });

      const data = await readApiResponse(response, "Unable to verify OTP.");

      navigate("/register/login", {
        state: {
          success: data.message || "Registration completed successfully. You can now sign in.",
        },
      });
    } catch (err) {
      setError(err?.message || "Failed to verify OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          registrationData: {
            firstName,
            lastName,
            password,
            accountType: "Student",
          }
        }),
      });

      await readApiResponse(response, "Failed to resend OTP.");

      // Reset timers
      setResendCountdown(60);
      setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
      setResendLoading(false);
    } catch (err) {
      setError(err?.message || "Failed to connect to server. Please try again.");
      setResendLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  return (
    <div className="create-page">
      <div className="create-left">
        <h1>Onlium offers Interactive learning experience</h1>
        <div className="create-logo-bars">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="create-card">
        <button className="back-arrow" onClick={() => navigate("/")}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth="1.8">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>Create Account</h2>
        <p className="subtitle">Join Onlium and start learning today</p>

        <div className="auth-tabs">
          <button className="tab-btn tab-active">Sign Up</button>
          <button
            className="tab-btn tab-inactive"
            onClick={() => navigate("/register/login")}
          >
            Log In
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!showOtpScreen ? (
          <>
        <p role="status" style={{ color: "#475569", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
          Instructor accounts are created by invitation from an Onlium administrator.
        </p>
        <div className="name-row">
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <label>Password</label>
        <div className="create-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          <button
            className="create-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label>Confirm Password</label>
        <div className="create-password-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
          <button
            className="create-toggle-password"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        <div className="policy-checkbox">
          <input
            type="checkbox"
            id="policy-agreement"
            checked={agreedToPolicies}
            onChange={(e) => setAgreedToPolicies(e.target.checked)}
          />
          <label htmlFor="policy-agreement">
            I agree to the{" "}
            <a href="#terms" onClick={(e) => { e.preventDefault(); setPolicyType("terms"); setShowPolicyModal(true); }}>
              Terms of Service
            </a>
            {" "}
            and{" "}
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setPolicyType("privacy"); setShowPolicyModal(true); }}>
              Privacy Policy
            </a>
          </label>
        </div>

        <button className="create-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending OTP..." : "Create Account"}
        </button>
          </>
        ) : (
          <div className="otp-screen">
            <h3>Verify Your Email</h3>
            <p className="otp-subtitle">We've sent an 8-digit code to {otpEmail}</p>

            {otpExpiry && (
              <p className="otp-expiry">
                Code expires in: {Math.ceil((new Date(otpExpiry) - new Date()) / 1000 / 60)} minutes
              </p>
            )}

            <label>Enter OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="12345678"
              maxLength={8}
              className="otp-input"
            />

            <button className="create-btn" onClick={handleOtpSubmit} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <p className="resend-text">
              Didn't receive the code?{" "}
              {resendCountdown > 0 ? (
                <span className="resend-countdown">Resend in {resendCountdown}s</span>
              ) : (
                <button
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </p>

            <button className="back-btn" onClick={() => setShowOtpScreen(false)}>
              ← Back to registration
            </button>
          </div>
        )}

        <p className="create-bottom-text">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToLogin) onSwitchToLogin();
              else navigate("/register/login");
            }}
          >
            Log In
          </a>
        </p>
      </div>

      {showPolicyModal && (
        <div className="policy-modal-overlay" onClick={() => setShowPolicyModal(false)}>
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="policy-modal-header">
              <h3>{policyType === "terms" ? "Terms of Service" : "Privacy Policy"}</h3>
              <button className="policy-modal-close" onClick={() => setShowPolicyModal(false)}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="policy-modal-content">
              {policyType === "terms" ? (
                <div className="policy-text">
                  <h4>1. Acceptance of Terms</h4>
                  <p>By accessing and using Onlium, you accept and agree to be bound by the terms and provisions of this agreement.</p>
                  <h4>2. User Responsibilities</h4>
                  <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
                  <h4>3. Academic Integrity</h4>
                  <p>Users must maintain academic honesty and integrity in all educational activities conducted through the platform.</p>
                  <h4>4. Prohibited Activities</h4>
                  <p>Users may not engage in any activity that disrupts the service or violates any applicable laws or regulations.</p>
                  <h4>5. Termination</h4>
                  <p>Onlium reserves the right to terminate or suspend access to the service at any time, without prior notice or liability.</p>
                </div>
              ) : (
                <div className="policy-text">
                  <h4>1. Information Collection</h4>
                  <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or communicate with us.</p>
                  <h4>2. Use of Information</h4>
                  <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p>
                  <h4>3. Data Security</h4>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.</p>
                  <h4>4. Information Sharing</h4>
                  <p>We do not sell, trade, or rent your personal information to third parties without your consent.</p>
                  <h4>5. Your Rights</h4>
                  <p>You have the right to access, update, or delete your personal information at any time.</p>
                </div>
              )}
            </div>
            <div className="policy-modal-footer">
              <button className="policy-modal-btn" onClick={() => setShowPolicyModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}