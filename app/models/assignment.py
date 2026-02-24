from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Assignment(Base):
    __tablename__ = "assignment"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    shift_id = Column(Integer, ForeignKey("shift.id"))
    is_emergency = Column(Boolean, default=False)

    user = relationship("User")
    shift = relationship("Shift")