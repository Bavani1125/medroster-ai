from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.security import get_current_user
from app.models.user import User
from app.services.ai_service import (
    get_scheduling_suggestion,
    analyze_workload_fairness,
    get_scheduling_tip
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


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/suggest-schedule")
def suggest_schedule(
    request: ScheduleRequest,
    current_user: User = Depends(get_current_user)
):
    """
    🤖 AI Scheduling Suggestion

    Send your staff list and open shifts — GPT-4o returns
    the fairest, role-matched roster with reasoning.

    Example staff entry:
    {"name": "Dr. Smith", "role": "doctor", "hours_this_week": 32}

    Example shift:
    {"shift_id": "s1", "role_needed": "doctor", "start_time": "2026-02-25 08:00", "department": "ICU"}
    """
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
    """
    🧠 Workload Fairness Analysis

    Identify burnout risk. Returns a fairness score (0-100)
    and specific recommendations.

    Example staff_data entry:
    {"name": "Nurse Joy", "role": "nurse", "shifts_this_week": 5, "hours_this_week": 44}
    """
    try:
        result = analyze_workload_fairness(request.staff_data)
        return {"workload_analysis": result, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/tip")
def scheduling_tip(current_user: User = Depends(get_current_user)):
    """
    💡 Quick AI scheduling tip for the dashboard.
    Refreshes each call.
    """
    try:
        tip = get_scheduling_tip()
        return {"tip": tip, "model": "gpt-4o"}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
