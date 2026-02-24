from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models
from app.schemas.department_schema import DepartmentCreate, DepartmentResponse
from app.security import get_current_user

router = APIRouter(prefix="/department", tags=["department"])


@router.post("/", response_model=DepartmentResponse)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Department).filter(Department.name == department.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    db_department = Department(name=department.name)
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Department).all()