# MedRoster — AI + Voice Ops for Hospitals (AI for Good Hackathon)

MedRoster is an **AI-powered hospital coordination platform** that combines:
- **Workforce rostering** (departments, shifts, assignments)
- **Emergency broadcast workflows**
- **Patient-facing public updates** (no login)
- **Voice announcements via ElevenLabs**
- **Optional AI scheduling assistance via OpenAI** (with safe fallback when quota/key is unavailable)

Repository structure:

```
medroster-ai/
├── backend/   # FastAPI + SQLAlchemy
└── frontend/  # React (Create React App) + MUI
```

## Live Demo (Render)
- **Frontend:** `https://<your-frontend>.onrender.com`
- **Backend (Swagger):** `https://<your-backend>.onrender.com/docs`

## Quick Start (Local)
### 1) Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open: `http://127.0.0.1:8000/docs`

### 2) Frontend
```bash
cd frontend
npm install
npm start
```
Open: `http://localhost:3000`

> The frontend calls the backend using `REACT_APP_API_URL` (defaults to `http://localhost:8000`).

## Environment Variables
**Never commit `.env`**. Use platform environment variables in Render.

### Backend (`backend/.env` locally)
```
# Auth
SECRET_KEY=your_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# OpenAI (optional if you use fallback scheduling)
OPENAI_API_KEY=sk-...

# ElevenLabs (voice)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

### Frontend (Render Static Site env vars)
```
REACT_APP_API_URL=https://<your-backend>.onrender.com
```

## Demo Flow (Judges)
1. Open **Frontend** → Login (or register)
2. Go to **Dashboard**:
   - create departments / shifts / assignments
   - trigger **Voice Announce (11 Labs)**
3. Go to **Public Updates**:
   - pick department + language
   - generate a patient-facing voice update (no PHI)

## Deploy on Render (Recommended)
### Backend (Web Service)
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set backend env vars (SECRET_KEY, ELEVENLABS_*, etc.)

### Frontend (Static Site)
- Root directory: `frontend`
- Build: `npm ci && npm run build`
- Publish directory: `build`
- Env var: `REACT_APP_API_URL=<backend-url>`
- Add SPA rewrite: `/* -> /index.html (200)`

## Safety & Privacy
- The **Public Updates** feature is designed to avoid PHI:
  - Do not include patient names, MRNs, diagnoses, or room numbers in prompts.
- Treat API keys as secrets; rotate if exposed.

---

## License
Hackathon project. Add a license if you plan to open-source beyond the event.
