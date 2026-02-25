from sqlalchemy import Column, Integer, ForeignKey, Boolean, String
from sqlalchemy.orm import relationship
from app.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    is_emergency = Column(Boolean, default=False)
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="assignments")
    shift = relationship("Shift", back_populates="assignments")
