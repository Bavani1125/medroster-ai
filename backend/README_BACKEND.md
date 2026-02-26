# MedRoster Backend (FastAPI)

FastAPI backend for MedRoster — staff coordination, AI scheduling hooks, and ElevenLabs voice endpoints.

## Tech Stack
- FastAPI + Uvicorn
- SQLAlchemy (SQLite by default)
- JWT Auth
- OpenAI (optional) for scheduling recommendations
- ElevenLabs for TTS voice announcements

## Run Locally
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger: `http://127.0.0.1:8000/docs`

## Environment Variables
Create `backend/.env` (DO NOT COMMIT):
```
SECRET_KEY=your_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

OPENAI_API_KEY=sk-...           # optional
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

## Core Endpoints
### Auth
- `POST /auth/register`
- `POST /auth/login`

### Admin Ops
- `GET/POST /departments`
- `GET/POST /shifts`
- `GET/POST /assignments`

### AI + Voice
- `POST /ai/schedule-suggestions` (alias of suggest schedule)
- `POST /ai/text-to-speech` (ElevenLabs)
- `GET /ai/tip`

### Public (Patient-facing)
- `GET /public/departments`
- `POST /public/voice-update` (returns `audio_base64` + `transcript`)

## Deploy on Render (Backend)
Create a **Web Service**:
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars in Render dashboard

### Notes
- SQLite is fine for hackathon demo. For persistence, switch to Postgres later.
- Keep `CORS` permissive for demo; tighten to frontend domain afterward.
