from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    performed_by = Column(String, nullable=False)