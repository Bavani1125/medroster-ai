from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Shift(Base):
    __tablename__ = "shift"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("department.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    required_role = Column(String, nullable=False)

    department = relationship("Department")