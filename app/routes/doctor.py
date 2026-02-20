from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.services import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("/", response_model=DoctorResponse)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    return doctor_service.create_doctor(db, doctor)


@router.get("/", response_model=List[DoctorResponse])
def get_all_doctors(db: Session = Depends(get_db)):
    return doctor_service.get_all_doctors(db)


@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = doctor_service.get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db)):
    updated = doctor_service.update_doctor(db, doctor_id, doctor)
    if not updated:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return updated


@router.delete("/{doctor_id}", response_model=DoctorResponse)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    deleted = doctor_service.delete_doctor(db, doctor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return deleted
