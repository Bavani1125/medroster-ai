from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.security import get_current_user
from app.models.user import User
from app.services.ai_service import text_to_speech_elevenlabs

router = APIRouter(prefix="/ai", tags=["AI Scheduling"])

# --- Safety Mode ---
class SafetyModeRequest(BaseModel):
    burnout_threshold: int
    block_critical: bool = False
    staff_data: Optional[List[dict]] = None  # Optionally pass staff data

class SafetyModeResponse(BaseModel):
    audio_base64: str
    content_type: str
    blocked_assignments: List[dict] = []

@router.post("/safety-mode", response_model=SafetyModeResponse)
def safety_mode(
    request: SafetyModeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze burnout risk and generate supervisor audio briefing. Optionally block assignments.
    """
    try:
        # TODO: Analyze assignments and block if needed
        blocked_assignments = []
        briefing_text = (
            f"Safety Mode activated. Burnout threshold set to {request.burnout_threshold}. "
            + ("Critical assignments will be blocked above this threshold." if request.block_critical else "")
        )
        tts = text_to_speech_elevenlabs(briefing_text)
        return {
            "audio_base64": tts["audio_base64"],
            "content_type": tts["content_type"],
            "blocked_assignments": blocked_assignments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Safety mode error: {str(e)}")
