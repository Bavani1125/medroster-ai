from sqlalchemy.orm import Session
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.models.patient import Patient


def create_doctor(db: Session, doctor_data: DoctorCreate) -> Doctor:
    doctor = Doctor(**doctor_data.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def get_all_doctors(db: Session):
    return db.query(Doctor).all()


def get_doctor_by_id(db: Session, doctor_id: int):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def update_doctor(db: Session, doctor_id: int, doctor_data: DoctorUpdate):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None

    for key, value in doctor_data.model_dump(exclude_unset=True).items():
        setattr(doctor, key, value)

    db.commit()
    db.refresh(doctor)
    return doctor


def delete_doctor(db: Session, doctor_id: int):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None

    db.delete(doctor)
    db.commit()
    return doctor

def assign_patient_to_doctor(db: Session, doctor_id: int, patient_id: int):

    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return None, "Doctor not found"

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None, "Patient not found"

    if patient in doctor.patients:
        return doctor, "Patient already assigned"

    doctor.patients.append(patient)
    db.commit()
    db.refresh(doctor)

    return doctor, "Patient assigned successfully"