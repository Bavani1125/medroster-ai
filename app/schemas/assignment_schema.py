from pydantic import BaseModel


class AssignmentCreate(BaseModel):
    user_id: int
    shift_id: int
    is_emergency: bool = False


class AssignmentResponse(BaseModel):
    id: int
    user_id: int
    shift_id: int
    is_emergency: bool

    class Config:
        orm_mode = True