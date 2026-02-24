from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app import models

router = APIRouter(prefix="/shifts", tags=["Shifts"])


@router.post("/")
def create_shift(
    department_id: int,
    start_time: datetime,
    end_time: datetime,
    required_role: str,
    required_staff_count: int,
    db: Session = Depends(get_db)
):
    department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    shift = models.Shift(
        department_id=department_id,
        start_time=start_time,
        end_time=end_time,
        required_role=required_role,
        required_staff_count=required_staff_count
    )

    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/")
def get_shifts(db: Session = Depends(get_db)):
    return db.query(models.Shift).all()