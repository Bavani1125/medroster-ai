from pydantic import BaseModel


class PatientBase(BaseModel):
    name: str
    age: int
    condition: str


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    condition: str | None = None


class PatientResponse(PatientBase):
    id: int

    class Config:
        from_attributes = True
