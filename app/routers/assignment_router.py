from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.assignment import Assignment
from app.models.shift import Shift
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.assignment_schema import AssignmentCreate, AssignmentResponse
from app.security import get_current_user

router = APIRouter(prefix="/assignment", tags=["assignment"])


@router.post("/", response_model=AssignmentResponse)
def assign_user(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user = db.query(User).filter(User.id == assignment.user_id).first()
    shift = db.query(Shift).filter(Shift.id == assignment.shift_id).first()

    if not user or not shift:
        raise HTTPException(status_code=404, detail="User or Shift not found")

    if user.role != shift.required_role:
        raise HTTPException(status_code=400, detail="Role mismatch")

    existing_assignment = db.query(Assignment).filter(
        Assignment.user_id == assignment.user_id,
        Assignment.shift_id == assignment.shift_id
    ).first()

    if existing_assignment:
        raise HTTPException(status_code=400, detail="Already assigned")

    db_assignment = Assignment(
        user_id=assignment.user_id,
        shift_id=assignment.shift_id,
        is_emergency=assignment.is_emergency
    )

    db.add(db_assignment)

    audit = AuditLog(
        action=f"Assigned user {user.id} to shift {shift.id}",
        performed_by=current_user.email
    )
    db.add(audit)

    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Assignment).all()