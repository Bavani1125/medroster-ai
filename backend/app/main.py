from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import User, Department, Shift, Assignment, AuditLog  # registers all tables

from app.routers import (
    auth_router,
    user_router,
    department_router,
    shift_router,
    assignment_router,
    emergency_router,
    ai_router,
)

# ── Create all DB tables ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="MedRoster API",
    description="""
## MedRoster — AI-Powered Hospital Staff Coordination

Built for the **Columbia AI for Good Hackathon** 🏥

### Features
- **JWT Authentication** — secure login for all staff roles
- **Department & Shift Management** — full CRUD
- **Smart Assignments** — role-validated scheduling
- **AI Scheduling** — GPT-4o suggests optimal, fair rosters
- **Workload Analysis** — burnout risk detection
- **🚨 Red Alert Mode** — emergency reallocation in <3 minutes
- **🔊 Voice Alerts** — ElevenLabs broadcasts hospital-wide

### Quick Start (in Swagger)
1. `POST /auth/register` — create your admin account
2. `POST /auth/login` — get your token
3. Click **Authorize** (top right) — paste the token
4. `POST /departments` — create ICU, ER, etc.
5. `POST /shifts` — create shifts
6. `POST /assignments` — assign staff
7. `POST /ai/suggest-schedule` — let AI schedule for you
8. `POST /emergency/red-alert` — trigger demo 🚨
    """,
    version="1.0.0",
)

# ── CORS (allow all for development) ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(department_router.router)
app.include_router(shift_router.router)
app.include_router(assignment_router.router)
app.include_router(ai_router.router)
app.include_router(emergency_router.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "app": "MedRoster API",
        "version": "1.0.0",
        "docs": "/docs"
    }
