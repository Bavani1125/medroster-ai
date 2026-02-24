from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth_router, user_router
from app.models import user, department, shift, assignment, audit_log

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedRoster API")

app.include_router(auth_router.router)
app.include_router(user_router.router)


@app.get("/")
def root():
    return {"message": "MedRoster API Running"}