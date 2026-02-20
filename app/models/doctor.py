from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base
from app.models.association import doctor_patient_association


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)

    patients = relationship(
        "Patient",
        secondary=doctor_patient_association,
        back_populates="doctors"
    )


