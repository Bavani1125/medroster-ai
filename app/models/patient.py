from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base
from app.models.association import doctor_patient_association


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    triage_level = Column(Integer, nullable=False)
    stability_status = Column(String, nullable=False)

    doctors = relationship(
        "Doctor",
        secondary=doctor_patient_association,
        back_populates="patients"
    )
