import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService.js";
import "./styles/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [developmentResetCode, setDevelopmentResetCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code, 3: New password
  const [resendCountdown, setResendCountdown] = useState(0);
  const [codeExpiry, setCodeExpiry] = useState(null);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setResetCode(response.resetCode || "");
      setDevelopmentResetCode(response.resetCode || "");
      setSuccess("If the account exists, a reset code has been generated.");
      setResendCountdown(60);
      setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetCode.trim()) {
      setError("Please enter the reset code.");
      return;
    }

    setLoading(true);

    try {
      // Skip code verification for now - just move to step 3
      // The code will be verified when resetting the password
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(email, resetCode, newPassword);
      setSuccess("Password reset successfully! You can now log in with your new password.");
      setTimeout(() => {
        navigate("/register/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setResetCode(response.resetCode || "");
      setDevelopmentResetCode(response.resetCode || "");
      setSuccess("A new reset code has been requested. Any previously issued code is no longer valid.");
      setResendCountdown(60);
      setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="forgot-password-page">
      <div className="forgot-password-left">
        <h1>Reset Your Password</h1>
        <div className="logo-bars">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="forgot-password-card">
        <button className="back-arrow" onClick={() => navigate("/register/login")}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth="1.8">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <p className="subtitle">Enter your email to receive a password reset code</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
            />

            <button className="forgot-btn" onClick={handleSendCode} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter Reset Code</h2>
            <p className="subtitle">Enter the 8-digit code sent to your email</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {developmentResetCode && (
              <div className="success-message">
                Development reset code: <strong>{developmentResetCode}</strong>
              </div>
            )}

            {codeExpiry && (
              <p className="otp-expiry">
                Code expires in: {Math.ceil((new Date(codeExpiry) - new Date()) / 1000 / 60)} minutes
              </p>
            )}

            <label>Reset Code</label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Enter 8-digit code"
              maxLength={8}
              autoComplete="off"
            />

            <button className="forgot-btn" onClick={handleVerifyCode} disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <p className="resend-text">
              Didn't receive the code?{" "}
              {resendCountdown > 0 ? (
                <span className="resend-countdown">Resend in {resendCountdown}s</span>
              ) : (
                <button className="resend-link" onClick={handleResendCode} disabled={loading}>
                  Resend Code
                </button>
              )}
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h2>New Password</h2>
            <p className="subtitle">Enter your new password</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              <button
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>

            <button className="forgot-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="forgot-bottom-text">
          Remember your password?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register/login");
            }}
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
