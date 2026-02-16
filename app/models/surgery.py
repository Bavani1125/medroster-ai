from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


class Surgery(Base):
    __tablename__ = "surgeries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    required_specialization = Column(String, nullable=False)
    urgency_score = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    scheduled_time = Column(String, nullable=True)

    patient = relationship("Patient")
