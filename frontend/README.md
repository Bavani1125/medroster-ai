## Modern React (Create React App) UI for MedRoster — an AI-powered hospital staff coordination platform with:

Admin portal: departments, shifts, assignments, safety mode

AI scheduling + workload insights

ElevenLabs voice: announcements + emergency broadcast previews

Patient-facing Public Voice Updates (no login, no PHI): /public/updates

# UI Highlights

Public Voice Updates: multilingual (EN/ES) voice updates for patients/families (QR/kiosk-friendly).

Emergency Broadcast: voice announcements for critical events (demo-ready).

Safety Mode: burnout guard + supervisor briefing (voice-enabled concept).

# Tech Stack

React (CRA)

TypeScript

Material UI (MUI)

Axios

React Router

# Project Structure

medroster-frontend/
├── src/
│   ├── api/
│   │   ├── client.ts            # axios client + auth token interceptor
│   │   └── index.ts             # API wrappers (auth, users, ai, public)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── PermissionGuard.tsx
│   │   ├── PublicUpdatesPanel.tsx
│   │   ├── EmergencyBroadcastPanel.tsx
│   │   └── SafetyModePanel.tsx
│   ├── context/
│   │   └── AuthContext.tsx      # auth state + token storage
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── PublicUpdatesPage.tsx  # patient-facing page (no login)
│   ├── App.tsx                  # routes
│   └── index.tsx
├── package.json
└── README.

## Setup

1) Install dependencies
    npm install

2) Configure Backend URL
    By default, the frontend calls:

    http://localhost:8000

    If your backend runs elsewhere, create a .env in medroster-frontend/:
    REACT_APP_API_URL=http://127.0.0.1:8000

3) Run the frontend
    npm start