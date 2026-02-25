from pydantic import BaseModel
from typing import Optional


class AssignmentCreate(BaseModel):
    user_id: int
    shift_id: int
    is_emergency: Optional[bool] = False
    notes: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: int
    user_id: int
    shift_id: int
    is_emergency: bool
    notes: Optional[str] = None

    model_config = {"from_attributes": True}
