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

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post("/", response_model=AssignmentResponse, status_code=201)
def create_assignment(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign a staff member to a shift."""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    user = db.query(User).filter(User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shift = db.query(Shift).filter(Shift.id == assignment.shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")

    # Role check (skip for emergency assignments)
    if not assignment.is_emergency and user.role != shift.required_role:
        raise HTTPException(
            status_code=400,
            detail=f"Role mismatch: user is '{user.role}' but shift requires '{shift.required_role}'"
        )

    # Duplicate check
    existing = (
        db.query(Assignment)
        .filter(
            Assignment.user_id == assignment.user_id,
            Assignment.shift_id == assignment.shift_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already assigned to this shift")

    db_assignment = Assignment(
        user_id=assignment.user_id,
        shift_id=assignment.shift_id,
        is_emergency=assignment.is_emergency,
        notes=assignment.notes
    )
    db.add(db_assignment)

    # Audit log
    audit = AuditLog(
        action=f"ASSIGNMENT CREATED | user={user.name} | shift={shift.id} | emergency={assignment.is_emergency}",
        performed_by=current_user.email
    )
    db.add(audit)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all assignments."""
    return db.query(Assignment).all()


@router.get("/my-shifts", response_model=List[AssignmentResponse])
def get_my_shifts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's own assignments."""
    return db.query(Assignment).filter(Assignment.user_id == current_user.id).all()


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an assignment."""
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": f"Assignment {assignment_id} removed"}
