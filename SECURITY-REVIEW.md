# Security Review

**Date:** 2026-10-20
**Scope:** Authentication flows in `C:\Users\Ehron\source\repos\Onlium.API\Onlium.API\Onlium.API` and public landing page/auth frontend in this repository.
**Method:** Static code review. No live deployment, database, or SMTP service was available for runtime verification.

## Findings

### 1. Registration OTP data retains the submitted plaintext password

- **Severity:** High
- **Confidence:** 10/10
- **Location:** `C:\Users\Ehron\source\repos\Onlium.API\Onlium.API\Onlium.API\Controllers\AuthController.cs:74,123-126`; registration payload is assembled in `src/pages/Register/CreateAccount.jsx:57-61`.
- **Impact:** The registration payload, including the password, is stored in the OTP record. After successful verification, the account is created but the stored registration payload is not cleared or deleted. The plaintext password can therefore remain in the database and backups. Anyone obtaining that data could use the password on this service or other services where it was reused.
- **Recommendation:** Avoid persisting plaintext passwords in OTP records. Store a password hash instead, and clear or delete the registration data after successful verification and when the OTP expires.

### 2. Password reset does not revoke existing access tokens

- **Severity:** Medium
- **Confidence:** 8/10
- **Location:** `C:\Users\Ehron\source\repos\Onlium.API\Onlium.API\Onlium.API\Controllers\AuthController.cs:392-393,436`; JWT validation is configured in `C:\Users\Ehron\source\repos\Onlium.API\Onlium.API\Onlium.API\Program.cs:62-70`.
- **Impact:** A password reset clears the reset-code fields but does not invalidate already issued JWTs. A stolen token can remain usable until its expiry, which is up to two hours.
- **Recommendation:** Revoke existing sessions on password reset, for example using a per-user token version or password-change timestamp checked during authorization.

## Other reviewed observations

- The API version reviewed sends password-reset codes through `SendPasswordResetEmailAsync`; the earlier concern that recovery email was not sent does not apply to this API copy.
- The frontend’s API URL is hard-coded to `http://localhost:5027` in `src/services/authService.js:1`, and registration OTP requests also target localhost in `src/pages/Register/CreateAccount.jsx:50,96,127`. This needs deployment configuration before remote hosting; otherwise the browser attempts to reach the visitor's own machine. The landing page's public content and navigation had no security-relevant issue identified in this static review.
- If SMTP sending fails, the API's error handlers appear to use a logger that is not injected or initialized, which may interrupt error handling and reset-code cleanup. This is an operational failure-path concern, not a reset-code bypass.
- The frontend recovery page's code-entry step advances without server verification; the reset endpoint itself verifies the submitted code before changing the password.

## Limitations

This was a static review of the named API copy and the frontend workspace. I did not test a live deployment, inspect database or backup access controls, verify SMTP delivery, or assess unrelated API controllers and application areas.
