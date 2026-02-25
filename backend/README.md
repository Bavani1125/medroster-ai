# 🏥 MedRoster API

AI-powered hospital staff coordination with voice-first workflows (ElevenLabs) and patient-facing public updates (no PHI).
Built for the Columbia AI for Good Hackathon.

## Why this matters (Impact)

MedRoster improves lives by converting staffing operations into patient outcomes:

Faster response during surges: Red Alert + reallocation reduces coordination latency.

Safer care: burnout-aware scheduling reduces fatigue-driven risk.

Better access & communication: public multilingual voice updates reduce anxiety and improve guidance for patients/families.

---
# Features

JWT Authentication (role-based access)

Departments / Shifts / Assignments (CRUD + scheduling workflow)

AI Scheduling Suggestions (OpenAI GPT-4o)

Workload Fairness / Burnout Risk Analysis

Emergency “Red Alert” Mode

ElevenLabs Voice Alerts (returns base64 mp3 for instant playback)

Public Voice Updates (Patients/Families): /public/voice-update (no PHI)

## Project Structure

```
medroster-ai/
├── app/
│   ├── models/                 # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── department.py
│   │   ├── shift.py
│   │   ├── assignment.py
│   │   └── audit_log.py
│   ├── schemas/                # Pydantic request/response models
│   │   ├── user_schema.py
│   │   ├── department_schema.py
│   │   ├── shift_schema.py
│   │   ├── assignment_schema.py
│   │   └── auth_schema.py
│   ├── routers/                # API endpoints
│   │   ├── auth_router.py
│   │   ├── user_router.py
│   │   ├── department_router.py
│   │   ├── shift_router.py
│   │   ├── assignment_router.py
│   │   ├── ai_router.py               # AI + ElevenLabs TTS
│   │   ├── emergency_router.py         # Red Alert mode
│   │   └── public_router.py            # Patient-facing voice updates (no auth)
│   ├── services/
│   │   ├── ai_service.py               # OpenAI + fallback logic + ElevenLabs base64
│   │   ├── notification_service.py     # (optional legacy helpers)
│   │   └── emergency_service.py
│   ├── main.py
│   ├── database.py
│   ├── security.py
│   └── config.py
├── .env
├── requirements.txt
└── README.md
```

---



## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Bavani1125/medroster-ai.git
cd medroster-ai
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your API keys
Edit `.env`:
```
# JWT
SECRET_KEY=your_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

OPENAI_API_KEY=sk-...

# ElevenLabs (required for voice features)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...

# (optional backward-compatible)
ELEVEN_LABS_API_KEY=
ELEVEN_LABS_VOICE_ID=

```

### 5. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

Open: http://127.0.0.1:8000/docs

---

#Swagger Demo Flow
A) Auth

POST /auth/register — create admin user (role: "admin")

POST /auth/login — get token

Swagger → Authorize → paste Bearer <token>

B) Core Data

POST /departments — create ICU, ER, etc.

POST /shifts — create shifts

POST /auth/register — create doctors/nurses/staff accounts

POST /assignments — assign staff to shifts

C) AI + Voice (Hackathon demo moments)

POST /ai/schedule-suggestions — AI roster suggestion (fallback if OpenAI quota blocked)

POST /ai/analyze-workload — burnout risk analysis

POST /ai/text-to-speech — ElevenLabs voice announcement (returns base64 mp3)

POST /emergency/red-alert — Red Alert orchestration

POST /public/voice-update — Patient-facing voice update (no auth; no PHI)

---

## Key API Endpoints

Key Endpoints

# Auth & Users
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login (JWT token)
GET	/users/me	Current user profile
GET	/users/	List users

# Departments / Shifts / Assignments
Method	Endpoint	Description
POST	/departments	Create department
GET	/departments	List departments
POST	/shifts	Create shift
GET	/shifts	List shifts
POST	/assignments	Assign staff to shifts
GET	/assignments	List assignments

# AI + Voice (Admin / Auth required)
Method	Endpoint	Description
POST	/ai/schedule-suggestions	AI roster suggestion (OpenAI or fallback)
POST	/ai/analyze-workload	Burnout / fairness analysis
GET	/ai/tip	Quick manager tip
POST	/ai/text-to-speech	ElevenLabs TTS → returns audio_base64

# /ai/text-to-speech request body

{ "text": "Attention staff. Please check your assignments." }

Response includes

{
  "audio_base64": "...",
  "content_type": "audio/mpeg",
  "text": "..."
}
# Emergency
Method	Endpoint	Description
POST	/emergency/red-alert	Trigger emergency workflow
POST	/emergency/resolve	Resolve emergency
GET	/emergency/audit-logs	Compliance logs

# Public (No Auth, No PHI)
Method	Endpoint	Description
GET	/public/departments	List departments for public UI
POST	/public/voice-update	Generate patient/family voice update (base64 mp3)
