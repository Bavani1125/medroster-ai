from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os

from app.database import get_db
from app.security import get_current_user
from app.models.user import User
from app.models.audit_log import AuditLog
from app.services.emergency_service import trigger_red_alert, resolve_red_alert

router = APIRouter(prefix="/emergency", tags=["🚨 Emergency"])

ALLOWED_ROLES = ["admin", "manager"]


class RedAlertRequest(BaseModel):
    emergency_type: str
    department_id: int
    notes: Optional[str] = ""


class ResolveRequest(BaseModel):
    department_id: int


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/red-alert")
def activate_red_alert(
    request: RedAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🚨 ACTIVATE RED ALERT

    Triggers the full emergency pipeline:
    1. GPT-4o generates reallocation plan
    2. ElevenLabs broadcasts voice alert
    3. Staff reassigned + notified
    4. Compliance audit log created

    emergency_type examples:
    - "ICU surge"
    - "mass casualty event"
    - "staff no-show - 3 nurses"
    - "flu season overflow"
    """
    if current_user.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Only admins and managers can trigger Red Alert"
        )

    result = trigger_red_alert(
        db=db,
        emergency_type=request.emergency_type,
        affected_department_id=request.department_id,
        triggered_by=current_user.email
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@router.post("/resolve")
def resolve_alert(
    request: ResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a Red Alert as resolved."""
    if current_user.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    return resolve_red_alert(
        db=db,
        department_id=request.department_id,
        resolved_by=current_user.email
    )


@router.get("/voice-alert/{filename}")
def serve_voice_alert(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    🔊 Serve the ElevenLabs voice alert MP3.
    Call this after Red Alert to play the broadcast in the browser.
    """
    # Basic security: only allow known filenames
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    path = f"/tmp/{filename}"
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail="Audio file not found. ElevenLabs key may not be set."
        )

    return FileResponse(path, media_type="audio/mpeg", filename=filename)


@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent audit logs. Admins and managers only."""
    if current_user.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Admins and managers only")

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": log.id,
            "action": log.action,
            "performed_by": log.performed_by,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]
