from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.shift import Shift
from app.models.department import Department
from app.models.user import User
from app.schemas.shift_schema import ShiftCreate, ShiftResponse
from app.security import get_current_user

router = APIRouter(prefix="/shifts", tags=["Shifts"])


@router.post("/", response_model=ShiftResponse, status_code=201)
def create_shift(
    shift: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new shift for a department."""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    dept = db.query(Department).filter(Department.id == shift.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    if shift.end_time <= shift.start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")

    db_shift = Shift(
        department_id=shift.department_id,
        start_time=shift.start_time,
        end_time=shift.end_time,
        required_role=shift.required_role,
        required_staff_count=shift.required_staff_count
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift


@router.get("/", response_model=List[ShiftResponse])
def get_shifts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all shifts."""
    return db.query(Shift).all()


@router.get("/department/{dept_id}", response_model=List[ShiftResponse])
def get_shifts_by_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all shifts for a specific department."""
    return db.query(Shift).filter(Shift.department_id == dept_id).all()


@router.get("/{shift_id}", response_model=ShiftResponse)
def get_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific shift by ID."""
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    return shift


@router.delete("/{shift_id}")
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a shift. Admin only."""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    db.delete(shift)
    db.commit()
    return {"message": f"Shift {shift_id} deleted"}
