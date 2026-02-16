from fastapi import FastAPI
from app.db import engine, Base

from app.models.doctor import Doctor
from app.models.patients import Patient
from app.models.surgery import Surgery
from app.models.assignment import Assignment


app = FastAPI(title="MedRoster AI")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "MedRoster AI is running"}
