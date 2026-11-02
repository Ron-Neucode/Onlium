# Onlium

The React and Vite frontend for the Onlium student, instructor, and admin portals. The ASP.NET Core API is maintained separately.

## Run locally

Install Node.js, then run these commands from the repository root:

```powershell
npm install
npm run dev
```

The frontend connects to `http://localhost:5027/api` by default. To use a different API URL, set `VITE_API_BASE_URL` in a local `.env.local` file:

```text
VITE_API_BASE_URL=https://your-api-host/api
```

Do not commit environment files or credentials.

## Validate

```powershell
npm run build
npm run lint
```
