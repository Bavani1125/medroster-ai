from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.security import get_current_user
from app.models.user import User
from app.services.ai_service import text_to_speech_elevenlabs

router = APIRouter(prefix="/emergency", tags=["🚨 Emergency"])

# --- Emergency Broadcast ---
class EmergencyBroadcastRequest(BaseModel):
    severity: str
    target_roles: List[str]
    auto_repeat: bool = False
    message: str

class EmergencyBroadcastResponse(BaseModel):
    audio_base64: str
    content_type: str
    ack_list: List[str] = []  # Placeholder for ACK tracking

@router.post("/broadcast", response_model=EmergencyBroadcastResponse)
def emergency_broadcast(
    request: EmergencyBroadcastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate and broadcast an emergency voice message to staff roles. Tracks acknowledgements.
    """
    try:
        tts = text_to_speech_elevenlabs(request.message)
        # TODO: Implement actual ACK tracking (DB or in-memory)
        ack_list = []
        return {
            "audio_base64": tts["audio_base64"],
            "content_type": tts["content_type"],
            "ack_list": ack_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Broadcast error: {str(e)}")
