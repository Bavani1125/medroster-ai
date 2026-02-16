from sqlalchemy import Column, Integer, String
from app.db import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    triage_level = Column(Integer, nullable=False)
    stability_status = Column(String, nullable=False)
