from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    current_load = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
