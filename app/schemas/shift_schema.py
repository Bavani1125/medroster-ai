from pydantic import BaseModel
from datetime import datetime


class ShiftCreate(BaseModel):
    department_id: int
    start_time: datetime
    end_time: datetime
    required_role: str


class ShiftResponse(BaseModel):
    id: int
    department_id: int
    start_time: datetime
    end_time: datetime
    required_role: str

    class Config:
        orm_mode = True