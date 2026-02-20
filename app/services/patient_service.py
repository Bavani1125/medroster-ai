from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate


def create_patient(db: Session, patient_data: PatientCreate) -> Patient:
    patient = Patient(**patient_data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_all_patients(db: Session):
    return db.query(Patient).all()


def get_patient_by_id(db: Session, patient_id: int):
    return db.query(Patient).filter(Patient.id == patient_id).first()


def update_patient(db: Session, patient_id: int, patient_data: PatientUpdate):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None

    for key, value in patient_data.model_dump(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient_id: int):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None

    db.delete(patient)
    db.commit()
    return patient
