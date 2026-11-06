import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "../../services/apiService.js";
import "./styles/InstructorInvitationSetup.css";

export default function InstructorInvitationSetup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (token) window.history.replaceState(null, "", window.location.pathname);
  }, [token]);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;

    apiService.getInstructorInvitationDetails(token)
      .then(details => {
        if (active) setInstructor(details);
      })
      .catch(requestError => {
        if (active) setError(requestError.message || "This invitation link is invalid or expired.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Choose a password with at least 12 characters.");
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiService.completeInstructorInvitation(token, password);
      setSuccess(result.message || "Password created. Your account is waiting for administrator approval.");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message || "Unable to finish setting up your account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="instructor-invitation-page">
      <section className="instructor-invitation-card">
        <Link className="instructor-invitation-brand" to="/" aria-label="Onlium home">
          <span>ONL</span>
          <strong>ONLIUM</strong>
        </Link>

        {loading ? (
          <div className="instructor-invitation-state" role="status">Checking your invitation…</div>
        ) : success ? (
          <div className="instructor-invitation-complete">
            <span className="instructor-invitation-check" aria-hidden="true">✓</span>
            <p className="instructor-invitation-eyebrow">ACCOUNT SETUP COMPLETE</p>
            <h1>You’re all set</h1>
            <p>{success}</p>
            <Link className="instructor-invitation-submit" to="/register/login">Go to sign in</Link>
          </div>
        ) : instructor ? (
          <>
            <p className="instructor-invitation-eyebrow">INSTRUCTOR INVITATION</p>
            <h1>Set up your account</h1>
            <p className="instructor-invitation-intro">
              Welcome, <strong>{instructor.fullName}</strong>. Create a password for your Onlium instructor account.
            </p>
            <div className="instructor-invitation-email">{instructor.email}</div>

            {error && <div className="instructor-invitation-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="instructor-invitation-field">
                Password
                <div className="instructor-invitation-password">
                  <input
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="At least 12 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(value => !value)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              <label className="instructor-invitation-field">
                Confirm password
                <input
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                />
              </label>
              <p className="instructor-invitation-note">
                Your password is private. An administrator will approve your instructor account after setup.
              </p>
              <button className="instructor-invitation-submit" type="submit" disabled={saving}>
                {saving ? "Setting up account…" : "Create instructor account"}
              </button>
            </form>
          </>
        ) : (
          <div className="instructor-invitation-invalid">
            <p className="instructor-invitation-eyebrow">INVITATION UNAVAILABLE</p>
            <h1>We can’t use this link</h1>
            <div className="instructor-invitation-error" role="alert">
              {error || "This invitation link is missing its setup token."}
            </div>
            <p>Ask your Onlium administrator to send you a new invitation.</p>
            <Link className="instructor-invitation-secondary" to="/">Back to Onlium</Link>
          </div>
        )}
      </section>
    </main>
  );
}
