from fastapi import FastAPI
from app.db import engine, Base
from app.core.config import settings
from app.routes.doctor import router as doctor_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.include_router(doctor_router)


@app.get("/")
def root():
    return {"message": f"{settings.app_name} is running"}

