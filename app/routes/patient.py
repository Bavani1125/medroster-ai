from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    return patient_service.create_patient(db, patient)


@router.get("/", response_model=List[PatientResponse])
def get_all_patients(db: Session = Depends(get_db)):
    return patient_service.get_all_patients(db)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient: PatientUpdate, db: Session = Depends(get_db)):
    updated = patient_service.update_patient(db, patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return updated


@router.delete("/{patient_id}", response_model=PatientResponse)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    deleted = patient_service.delete_patient(db, patient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return deleted
