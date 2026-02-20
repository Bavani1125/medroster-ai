from fastapi import FastAPI
from app.db import engine, Base
from app.core.config import settings
from app.routes.doctor import router as doctor_router
from app.routes.patient import router as patient_router

app = FastAPI(title=settings.app_name)

app.include_router(doctor_router)
app.include_router(patient_router)
