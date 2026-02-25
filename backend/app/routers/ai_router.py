

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Any

from app.security import get_current_user
from app.models.user import User
from app.services.ai_service import (
    get_scheduling_suggestion,
    analyze_workload_fairness,
    get_scheduling_tip,
    text_to_speech_elevenlabs,   # base64 audio
)

router = APIRouter(prefix="/ai", tags=["AI Scheduling"])


# ── Request models ──────────────────────────────────────────────────────────

class StaffEntry(BaseModel):
    name: str
    role: str
    hours_this_week: Optional[float] = 0
    last_shift: Optional[str] = None


class ShiftRequirement(BaseModel):
    shift_id: str
    role_needed: str
    start_time: str
    end_time: str
    department: str


class ScheduleRequest(BaseModel):
    staff: List[StaffEntry]
    shifts: List[ShiftRequirement]
    context: Optional[str] = ""


class WorkloadRequest(BaseModel):
    staff_data: List[dict]


class TextToSpeechRequest(BaseModel):
    # accept both keys to avoid 422 from different clients
    text: Optional[str] = None
    message: Optional[str] = None

    # optional advanced controls (safe defaults)
    voice_id: Optional[str] = None
    tts_model_id: str = "eleven_multilingual_v2"
    stability: float = 0.4
    similarity_boost: float = 0.8


def _normalize_schedule_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        return {"staff": [], "shifts": [], "context": ""}

    staff_raw = payload.get("staff") or payload.get("staff_list") or payload.get("workers") or []
    normalized_staff = []
    for s in staff_raw:
        if not isinstance(s, dict):
            continue
        normalized_staff.append({
            "name": s.get("name") or s.get("full_name") or s.get("username"),
            "role": s.get("role") or s.get("position"),
            "hours_this_week": s.get("hours_this_week") or s.get("hours") or 0,
            "last_shift": s.get("last_shift") or s.get("last")
        })

    shifts_raw = payload.get("shifts") or payload.get("shift_requirements") or payload.get("shift_list") or []
    normalized_shifts = []
    for sh in shifts_raw:
        if not isinstance(sh, dict):
            continue
        normalized_shifts.append({
            "shift_id": sh.get("shift_id") or sh.get("id") or sh.get("shiftId"),
            "role_needed": sh.get("role_needed") or sh.get("role") or sh.get("roleNeeded"),
            "start_time": sh.get("start_time") or sh.get("start") or sh.get("startTime"),
            "end_time": sh.get("end_time") or sh.get("end") or sh.get("endTime"),
            "department": sh.get("department") or sh.get("dept") or sh.get("department_name")
        })

    context = payload.get("context") or payload.get("note") or ""
    return {"staff": normalized_staff, "shifts": normalized_shifts, "context": context}


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/suggest-schedule")
def suggest_schedule(
    request_payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    try:
        normalized = _normalize_schedule_payload(request_payload)
        request = ScheduleRequest.model_validate(normalized)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    try:
        result = get_scheduling_suggestion(
            staff_list=[s.model_dump() for s in request.staff],
            shift_requirements=[s.model_dump() for s in request.shifts],
            context=request.context
        )
        return {"ai_suggestion": result, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/analyze-workload")
def analyze_workload(
    request: WorkloadRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        result = analyze_workload_fairness(request.staff_data)
        return {"workload_analysis": result, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/tip")
def scheduling_tip(current_user: User = Depends(get_current_user)):
    try:
        tip = get_scheduling_tip()
        return {"tip": tip, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/schedule-suggestions")
def schedule_suggestions(
    request_payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    try:
        normalized = _normalize_schedule_payload(request_payload)
        request = ScheduleRequest.model_validate(normalized)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    try:
        result = get_scheduling_suggestion(
            staff_list=[s.model_dump() for s in request.staff],
            shift_requirements=[s.model_dump() for s in request.shifts],
            context=request.context
        )
        return {"ai_suggestion": result, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/text-to-speech")
def text_to_speech(
    request: TextToSpeechRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Returns base64 audio (browser-playable) instead of file path.
    Request: { "text": "..." } or { "message": "..." }
    Response: { "audio_base64": "...", "content_type": "audio/mpeg", ... }
    """
    try:
        text = (request.text or request.message or "").strip()
        if not text:
            raise HTTPException(status_code=422, detail="Missing required field: text")

        return text_to_speech_elevenlabs(
            text=text,
            voice_id=request.voice_id,
            model_id=request.tts_model_id,
            stability=request.stability,
            similarity_boost=request.similarity_boost,
        )

    except HTTPException:
        raise
    except ValueError as e:
        # missing env vars
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        # ElevenLabs API error
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech error: {str(e)}")