from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.db import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    surgery_id = Column(Integer, ForeignKey("surgeries.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    start_time = Column(String)
    end_time = Column(String)

    surgery = relationship("Surgery")
    doctor = relationship("Doctor")
