# Onlium System

Onlium is a React/Vite frontend with an ASP.NET Core API backed by SQL Server.

## Configure the API

The API intentionally does not include database credentials, JWT signing keys, or SMTP credentials in tracked settings. For local development, configure them with .NET User Secrets from the API project directory:

```powershell
cd Onlium.API

$jwtKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
dotnet user-secrets set "Jwt:Key" $jwtKey
Remove-Variable jwtKey

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your SQL Server connection string>"
dotnet user-secrets set "EmailSettings:SmtpServer" "smtp.gmail.com"
dotnet user-secrets set "EmailSettings:SmtpPort" "587"
dotnet user-secrets set "EmailSettings:SmtpUsername" "<your SMTP account>"
dotnet user-secrets set "EmailSettings:SmtpPassword" "<new provider-issued app password>"
dotnet user-secrets set "EmailSettings:FromEmail" "<your sender email>"
```

Replace each placeholder with values for your environment. Create a new email-provider app password after revoking the previously exposed one. Do not paste credentials into source files or commit them.

For deployed environments, provide the same settings through a secret manager or environment variables. ASP.NET Core maps `ConnectionStrings:DefaultConnection` to `ConnectionStrings__DefaultConnection`, and maps other configuration keys similarly (for example, `Jwt__Key` and `EmailSettings__SmtpPassword`).

The API fails at startup if the database connection string or a sufficiently long JWT signing key is missing. Registration OTP email sending fails explicitly when SMTP settings are absent or invalid.

## Student ID numbers

Before running the API against a database, apply `Onlium.API/AddFieldsAndOtpTable.sql` if the student-profile fields have not already been added, then run `Onlium.API/CreateStudentIdSequence.sql` in that database. The sequence script extends the student-number column to support the generated format and starts after the largest existing numeric suffix.

Student ID numbers are issued once when an administrator approves an enrollment application. They use the format `ONLS-<year>-<sequence>` (for example, `ONLS-2026-00125`), are stored on the student's profile, and are returned by `GET /api/StudentProfiles/me`. Applications without an issued ID remain blank until approval.

## Official study load schedules

Run `Onlium.API/AddStudyLoadScheduleFields.sql` against the API database before using the updated study load features. Admins can enter or edit each curriculum subject's section, professor, days, start/end time, and room in Course Curriculum. The student Study Load page displays those saved details for the student's enrolled program, year, and semester; students do not select subjects or enter their official class schedule.

## Exposed credential response

Credentials previously present in tracked settings must be revoked or rotated at their providers: generate a new JWT signing key and revoke/replace the SMTP app password. Changing these files does not invalidate credentials in Git history or copies; rotate them even if they have been removed from the current source. After changing the JWT key, users must sign in again because existing tokens were signed using the old key.

## Frontend

Install dependencies and start the frontend from the repository root:

```powershell
npm install
npm run dev
```

The frontend uses `http://localhost:5027/api` by default. Set `VITE_API_BASE_URL` to the API base URL (including `/api`) when using a different host, for example `https://api.example.edu/api`.

Configure and run the API separately from `Onlium.API` using the .NET 8 SDK. Localhost origins are allowed by default. For deployment, configure the exact frontend origin with `Cors__AllowedOrigins__0` (for example, `https://portal.example.edu`); additional origins can be configured with `Cors__AllowedOrigins__1`, `Cors__AllowedOrigins__2`, and so on.

Student profile photos are stored outside the public web root in `Onlium.API/App_Data/StudentPhotos` and served only through the authenticated profile endpoint. Persist that directory when deploying the API.
