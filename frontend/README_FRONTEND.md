# MedRoster Frontend (React + MUI)

React (Create React App) frontend for MedRoster: dashboard + patient-facing public updates.

## Tech Stack
- React (CRA) + TypeScript
- Material UI (MUI)
- Axios client with JWT token interceptor

## Run Locally
```bash
cd frontend
npm install
npm start
```
Open: `http://localhost:3000`

## Configure Backend URL
By default, API calls use:
- `REACT_APP_API_URL` or fallback `http://localhost:8000`

### Local `.env` (DO NOT COMMIT)
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000
```

## Key Routes
- `/login` — login/register
- `/dashboard` — admin/staff dashboard
- `/public/updates` — patient-facing public voice updates (no login)

## Deploy on Render (Static Site)
Create a **Static Site**:
- Root directory: `frontend`
- Build: `npm ci && npm run build`
- Publish directory: `build`
- Env var: `REACT_APP_API_URL=https://<your-backend>.onrender.com`

### SPA Rewrite (Required for React Router)
Add rewrite rule in Render:
- `/*` → `/index.html` (200)

## Troubleshooting
- If refresh on `/dashboard` 404s → SPA rewrite missing.
- If API calls hit localhost in production → `REACT_APP_API_URL` not set on Render.
