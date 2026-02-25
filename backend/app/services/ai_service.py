
"""
MedRoster AI Service
Uses OpenAI GPT-4o for intelligent scheduling, workload analysis,
and emergency reallocation planning, plus ElevenLabs for voice announcements.
"""

import base64
import json
from typing import Any, Dict, List, Optional

import requests
from openai import OpenAI

from app.config import OPENAI_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID


# -----------------------------
# Helpers
# -----------------------------
def _openai_key_present() -> bool:
    return bool(OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_key_here")


def _get_openai_client() -> OpenAI:
    return OpenAI(api_key=OPENAI_API_KEY)


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return (
        "insufficient_quota" in msg
        or "quota" in msg
        or "rate limit" in msg
        or "rate_limited" in msg
        or "429" in msg
    )


def _safe_json_loads(s: str) -> Dict[str, Any]:
    try:
        return json.loads(s)
    except Exception:
        # If model returns malformed JSON unexpectedly
        return {
            "error": "Invalid JSON returned by model",
            "raw": s[:2000],
        }


# -----------------------------
# Fallbacks 
# -----------------------------
def _fallback_schedule(staff_list: List[Dict[str, Any]], shift_requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
    assignments: List[Dict[str, Any]] = []
    warnings: List[str] = []

    staff_by_role: Dict[str, List[Dict[str, Any]]] = {}
    for s in staff_list:
        staff_by_role.setdefault(s.get("role", "unknown"), []).append(s)

    for shift in shift_requirements:
        role = shift.get("role_needed")
        pool = staff_by_role.get(role, [])
        if pool:
            chosen = pool.pop(0)
            assignments.append({
                "staff_name": chosen.get("name"),
                "staff_role": chosen.get("role"),
                "shift_id": shift.get("shift_id"),
                "department": shift.get("department"),
                "reason": "Fallback rule-based match (AI unavailable)."
            })
        else:
            warnings.append(f"No available staff for role {role} (fallback).")

    return {
        "assignments": assignments,
        "warnings": warnings,
        "summary": "Generated schedule recommendations."
    }


def _fallback_workload(staff_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    at_risk = []
    for s in staff_data:
        hours = float(s.get("hours_this_week", 0) or 0)
        shifts = float(s.get("shifts_this_week", 0) or 0)
        if hours > 48 or shifts > 6:
            at_risk.append({
                "name": s.get("name", "Unknown"),
                "concern": f"Over guideline limits (hours={hours}, shifts={shifts}).",
                "recommended_action": "Reduce next-week load; avoid consecutive nights."
            })

    return {
        "fairness_score": 50,
        "at_risk_staff": at_risk,
        "overall_summary": "AI unavailable (quota/key). Returned heuristic workload analysis.",
        "recommendations": [
            "Cap weekly hours to 48 and shifts to 6.",
            "Rotate night duties evenly across staff.",
            "Avoid assigning back-to-back high-acuity shifts."
        ]
    }


def _fallback_emergency_plan(emergency_type: str, affected_department: str) -> Dict[str, Any]:
    return {
        "immediate_reassignments": [],
        "call_in_requests": [],
        "estimated_coverage_minutes": 15,
        "critical_warning": "AI unavailable (quota/key). Use manual emergency reassignment.",
        "voice_announcement": (
            f"Attention staff. {emergency_type} reported. "
            f"Additional support is needed in {affected_department}. "
            "Please check the dashboard for reassignment instructions."
        )
    }


def _fallback_tip() -> str:
    return "Rotate night shifts fairly and cap weekly hours to reduce burnout. Review coverage gaps daily before peak hours."


# -----------------------------
# OpenAI call wrapper
# -----------------------------
def _call_openai_json(prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
    if not _openai_key_present():
        # No key → do not raise; caller will choose fallback
        raise ValueError("OPENAI_API_KEY is not set in your .env file")

    client = _get_openai_client()
    try:
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=temperature,
        )
        return _safe_json_loads(resp.choices[0].message.content)
    except Exception as e:
        # Let caller decide fallback
        raise e


# -----------------------------
# Main AI functions
# -----------------------------
def get_scheduling_suggestion(
    staff_list: List[Dict[str, Any]],
    shift_requirements: List[Dict[str, Any]],
    context: str = ""
) -> Dict[str, Any]:
    prompt = f"""You are MedRoster's AI scheduling assistant for a hospital.

Available Staff:
{json.dumps(staff_list, indent=2)}

Shifts Needing Coverage:
{json.dumps(shift_requirements, indent=2)}

Context: {context if context else "Standard scheduling day"}

Rules:
- Match staff to shifts by role only
- Prioritize staff with fewer hours_this_week to prevent burnout
- Flag any shift with no matching available staff as a warning

Respond ONLY with this exact JSON structure, no extra text:
{{
  "assignments": [
    {{
      "staff_name": "string",
      "staff_role": "string",
      "shift_id": "string",
      "department": "string",
      "reason": "string"
    }}
  ],
  "warnings": ["string"],
  "summary": "string"
}}"""

    try:
        return _call_openai_json(prompt, temperature=0.2)
    except Exception as e:
        # Key missing or quota error → fallback
        if isinstance(e, ValueError) or _is_quota_error(e):
            return _fallback_schedule(staff_list, shift_requirements)
        # Any other error: return a safe fallback but preserve error message
        out = _fallback_schedule(staff_list, shift_requirements)
        out["warnings"].append(f"AI error fallback: {str(e)[:200]}")
        return out


def analyze_workload_fairness(staff_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    prompt = f"""You are a hospital workforce wellbeing AI.

Staff Workload Data:
{json.dumps(staff_data, indent=2)}

Analyze and identify burnout risk. Hospital guidelines: max 48 hours/week, max 6 shifts/week.

Respond ONLY with this exact JSON, no extra text:
{{
  "fairness_score": 0,
  "at_risk_staff": [
    {{
      "name": "string",
      "concern": "string",
      "recommended_action": "string"
    }}
  ],
  "overall_summary": "string",
  "recommendations": ["string"]
}}"""

    try:
        return _call_openai_json(prompt, temperature=0.2)
    except Exception as e:
        if isinstance(e, ValueError) or _is_quota_error(e):
            return _fallback_workload(staff_data)
        out = _fallback_workload(staff_data)
        out["recommendations"].append(f"AI error fallback: {str(e)[:200]}")
        return out


def generate_emergency_reallocation_plan(
    emergency_type: str,
    affected_department: str,
    on_duty_staff: List[Dict[str, Any]],
    off_duty_staff: List[Dict[str, Any]]
) -> Dict[str, Any]:
    prompt = f"""You are MedRoster's Emergency AI. A hospital emergency requires IMMEDIATE action.

Emergency Type: {emergency_type}
Department Needing Help: {affected_department}

Staff Currently On Duty (can be reassigned):
{json.dumps(on_duty_staff, indent=2)}

Staff Off Duty (can be called in):
{json.dumps(off_duty_staff, indent=2)}

Generate the fastest safe reallocation plan. Maintain minimum 1 staff per other active department.

Respond ONLY with this exact JSON, no extra text:
{{
  "immediate_reassignments": [
    {{
      "staff_name": "string",
      "from_department": "string",
      "to_department": "{affected_department}",
      "urgency": "immediate"
    }}
  ],
  "call_in_requests": [
    {{
      "staff_name": "string",
      "role": "string",
      "reason": "string"
    }}
  ],
  "estimated_coverage_minutes": 0,
  "critical_warning": "string",
  "voice_announcement": "A calm, clear 2-sentence voice announcement for hospital intercom about the emergency staffing situation."
}}"""

    try:
        return _call_openai_json(prompt, temperature=0.1)
    except Exception as e:
        if isinstance(e, ValueError) or _is_quota_error(e):
            return _fallback_emergency_plan(emergency_type, affected_department)
        out = _fallback_emergency_plan(emergency_type, affected_department)
        out["critical_warning"] = f"{out['critical_warning']} | AI error: {str(e)[:200]}"
        return out


def get_scheduling_tip() -> str:
    if not _openai_key_present():
        return _fallback_tip()

    client = _get_openai_client()
    try:
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": (
                    "Give one practical, specific scheduling tip for hospital managers "
                    "focused on staff wellbeing or emergency preparedness. "
                    "Two sentences max. Be direct and actionable."
                )
            }],
            max_tokens=80,
            temperature=0.7,
        )
        return resp.choices[0].message.content
    except Exception as e:
        if _is_quota_error(e):
            return _fallback_tip()
        return _fallback_tip()


# -----------------------------
# ElevenLabs (Text-to-Speech)
# -----------------------------
def _ensure_elevenlabs() -> None:
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your_elevenlabs_key_here":
        raise ValueError("ELEVENLABS_API_KEY is not set in your .env file")
    if not ELEVENLABS_VOICE_ID:
        raise ValueError("ELEVENLABS_VOICE_ID is not set in your .env file")


def text_to_speech_elevenlabs(
    text: str,
    voice_id: Optional[str] = None,
    model_id: str = "eleven_multilingual_v2",
    stability: float = 0.4,
    similarity_boost: float = 0.8
) -> Dict[str, Any]:
    _ensure_elevenlabs()

    if not text or not text.strip():
        raise ValueError("text is required for text-to-speech")

    vid = voice_id or ELEVENLABS_VOICE_ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "text": text.strip(),
        "model_id": model_id,
        "voice_settings": {
            "stability": float(stability),
            "similarity_boost": float(similarity_boost),
        },
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=30)

    if resp.status_code >= 400:
        try:
            err = resp.json()
        except Exception:
            err = {"message": resp.text}
        raise RuntimeError(f"ElevenLabs TTS failed ({resp.status_code}): {err}")

    audio_b64 = base64.b64encode(resp.content).decode("utf-8")
    return {
        "audio_base64": audio_b64,
        "content_type": "audio/mpeg",
        "voice_id": vid,
        "model_id": model_id,
        "text": text.strip(),
    }