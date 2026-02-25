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
# OpenAI
# -----------------------------
def _get_openai_client() -> OpenAI:
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_key_here":
        raise ValueError("OPENAI_API_KEY is not set in your .env file")
    return OpenAI(api_key=OPENAI_API_KEY)


def get_scheduling_suggestion(
    staff_list: List[Dict[str, Any]],
    shift_requirements: List[Dict[str, Any]],
    context: str = ""
) -> Dict[str, Any]:
    """
    AI suggests optimal staff-to-shift assignments.
    Returns:
      {"assignments": [...], "warnings": [...], "summary": str}
    """
    client = _get_openai_client()

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

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2
    )

    return json.loads(response.choices[0].message.content)


def analyze_workload_fairness(staff_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes workload distribution and flags burnout risks.
    Returns:
      {"fairness_score": int, "at_risk_staff": [...], "overall_summary": str, "recommendations": [...]}
    """
    client = _get_openai_client()

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

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2
    )

    return json.loads(response.choices[0].message.content)


def generate_emergency_reallocation_plan(
    emergency_type: str,
    affected_department: str,
    on_duty_staff: List[Dict[str, Any]],
    off_duty_staff: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates a rapid emergency reallocation plan.
    Returns JSON including voice_announcement text to be converted via ElevenLabs.
    """
    client = _get_openai_client()

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

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1
    )

    return json.loads(response.choices[0].message.content)


def get_scheduling_tip() -> str:
    """Returns a quick AI scheduling tip for the dashboard."""
    client = _get_openai_client()

    response = client.chat.completions.create(
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
        temperature=0.7
    )

    return response.choices[0].message.content


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
    """
    Converts text -> speech using ElevenLabs.
    Returns base64 audio for easy browser playback.
    """
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
        # Provide readable error to frontend
        try:
            err = resp.json()
        except Exception:
            err = {"message": resp.text}
        raise RuntimeError(f"ElevenLabs TTS failed ({resp.status_code}): {err}")

    audio_bytes = resp.content
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    return {
        "audio_base64": audio_b64,
        "content_type": "audio/mpeg",
        "voice_id": vid,
        "model_id": model_id,
        "text": text.strip(),
    }