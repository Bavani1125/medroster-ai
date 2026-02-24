from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserResponse
from app.security import get_current_user

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(User).all()