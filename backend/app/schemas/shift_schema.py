from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ShiftCreate(BaseModel):
    department_id: int
    start_time: datetime
    end_time: datetime
    required_role: str
    required_staff_count: Optional[int] = 1


class ShiftResponse(BaseModel):
    id: int
    department_id: int
    start_time: datetime
    end_time: datetime
    required_role: str
    required_staff_count: int

    model_config = {"from_attributes": True}
