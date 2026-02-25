# 🏥 MedRoster API

AI-Powered Hospital Staff Coordination — Columbia AI for Good Hackathon

---

## Project Structure

```
medroster-ai/
├── app/
│   ├── models/               # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── department.py
│   │   ├── shift.py
│   │   ├── assignment.py
│   │   └── audit_log.py
│   ├── schemas/              # Pydantic request/response models
│   │   ├── user_schema.py
│   │   ├── department_schema.py
│   │   ├── shift_schema.py
│   │   ├── assignment_schema.py
│   │   └── auth_schema.py
│   ├── routers/              # API endpoints
│   │   ├── auth_router.py
│   │   ├── user_router.py
│   │   ├── department_router.py
│   │   ├── shift_router.py
│   │   ├── assignment_router.py
│   │   ├── ai_router.py          ← GPT-4o scheduling
│   │   └── emergency_router.py   ← Red Alert mode
│   ├── services/             # Business logic
│   │   ├── ai_service.py         ← OpenAI integration
│   │   ├── notification_service.py ← ElevenLabs integration
│   │   └── emergency_service.py  ← Red Alert orchestration
│   ├── main.py
│   ├── database.py
│   ├── security.py
│   └── config.py
├── .env                      
├── requirements.txt
└── README.md
```

---

## Setup (Fresh Install)

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
OPENAI_API_KEY=sk-...
ELEVEN_LABS_API_KEY=...

```

### 5. Run the server
```bash
uvicorn app.main:app --reload
```

Open: http://127.0.0.1:8000/docs

---

## Testing Flow in Swagger

1. `POST /auth/register` — create admin user (role: "admin")
2. `POST /auth/login` — get token
3. Click **Authorize** → paste token
4. `POST /departments` — create "ICU", "ER", "General Ward"
5. `POST /shifts` — create shifts for departments
6. `POST /users` via register — add doctors/nurses
7. `POST /assignments` — assign staff to shifts
8. `POST /ai/suggest-schedule` — AI roster suggestion
9. `POST /ai/analyze-workload` — burnout risk analysis
10. `POST /emergency/red-alert` — 🚨 DEMO MOMENT

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login, get JWT token |
| GET | /users/me | My profile |
| POST | /departments | Create department |
| POST | /shifts | Create shift |
| POST | /assignments | Assign staff to shift |
| GET | /assignments/my-shifts | My schedule |
| POST | /ai/suggest-schedule | AI roster suggestion |
| POST | /ai/analyze-workload | Burnout risk analysis |
| GET | /ai/tip | Quick AI tip |
| POST | /emergency/red-alert | 🚨 Trigger Red Alert |
| POST | /emergency/resolve | Resolve emergency |
| GET | /emergency/audit-logs | Compliance logs |
| GET | /emergency/voice-alert/{file} | Play voice broadcast |
