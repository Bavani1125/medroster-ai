from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department
from app.models.shift import Shift
from app.models.assignment import Assignment
from app.services.ai_service import text_to_speech_elevenlabs

# IMPORTANT: this name must be "router" because app.main imports router as public_router
router = APIRouter(prefix="/public", tags=["Public Updates"])


class PublicUpdateRequest(BaseModel):
    department_id: int
    language: str = "en"  # "en" or "es"
    update_type: str = "wait_time"  # wait_time | visiting | directions | safety
    custom_note: Optional[str] = None


@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    deps = db.query(Department).all()
    return [{"id": d.id, "name": d.name} for d in deps]


@router.post("/voice-update")
def voice_update(req: PublicUpdateRequest, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.id == req.department_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Department not found")

    # Non-PHI context (simple + demo-ready)
    total_shifts = db.query(Shift).filter(Shift.department_id == req.department_id).count()
    total_assignments = (
        db.query(Assignment)
        .join(Shift, Assignment.shift_id == Shift.id)
        .filter(Shift.department_id == req.department_id)
        .count()
    )

    coverage_pct = int((total_assignments / total_shifts) * 100) if total_shifts > 0 else 0

    # Simple ETA heuristic for demo
    est_wait_min = max(10, 60 - int(coverage_pct * 0.5))

    t = (req.update_type or "wait_time").strip().lower()
    lang = (req.language or "en").strip().lower()

    if t == "wait_time":
        if lang == "es":
            text = (
                f"Actualización de {dep.name}. "
                f"Tiempo de espera estimado: {est_wait_min} minutos. "
                f"Gracias por su paciencia. Si sus síntomas empeoran, avise al personal de inmediato."
            )
        else:
            text = (
                f"{dep.name} update. Estimated wait time is about {est_wait_min} minutes. "
                f"Thank you for your patience. If symptoms worsen, alert staff immediately."
            )
    elif t == "visiting":
        if lang == "es":
            text = (
                f"Actualización de visitas para {dep.name}. "
                f"Por favor, consulte con la recepción para las pautas de visitantes. "
                f"Gracias por ayudar a mantener un entorno seguro."
            )
        else:
            text = (
                f"Visiting update for {dep.name}. Please check with the front desk for visitor guidance. "
                f"Thank you for helping keep a safe environment."
            )
    elif t == "directions":
        if lang == "es":
            text = (
                f"Indicaciones para {dep.name}. "
                f"Por favor siga las señales y consulte en recepción si necesita ayuda. "
                f"Estamos aquí para apoyarle."
            )
        else:
            text = (
                f"Directions for {dep.name}. Please follow posted signs, and ask the front desk if you need help. "
                f"We’re here to support you."
            )
    else:  # safety
        if lang == "es":
            text = (
                f"Aviso de seguridad para {dep.name}. "
                f"Use mascarilla si se le solicita y lávese las manos con frecuencia. "
                f"Gracias por proteger a los demás."
            )
        else:
            text = (
                f"Safety notice for {dep.name}. Wear a mask if requested and wash hands frequently. "
                f"Thank you for protecting others."
            )

    if req.custom_note and req.custom_note.strip():
        text = f"{text} {req.custom_note.strip()}"

    audio = text_to_speech_elevenlabs(text=text)

    return {
        "department": dep.name,
        "coverage_pct": coverage_pct,
        "estimated_wait_min": est_wait_min,
        "transcript": text,
        **audio,
    }