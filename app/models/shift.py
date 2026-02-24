from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    required_role = Column(String, nullable=False)
    required_staff_count = Column(Integer, default=1)

    department = relationship("Department", back_populates="shifts")
    assignments = relationship("Assignment", back_populates="shift")