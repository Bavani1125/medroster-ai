"""
MedRoster AI Service
Uses OpenAI GPT-4o for intelligent scheduling, workload analysis,
and emergency reallocation planning.
"""

import json
from openai import OpenAI
from app.config import OPENAI_API_KEY


def _get_client():
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your_openai_key_here":
        raise ValueError("OPENAI_API_KEY is not set in your .env file")
    return OpenAI(api_key=OPENAI_API_KEY)


def get_scheduling_suggestion(
    staff_list: list,
    shift_requirements: list,
    context: str = ""
) -> dict:
    """
    AI suggests optimal staff-to-shift assignments.

    Args:
        staff_list: [{"name": str, "role": str, "hours_this_week": int, "last_shift": str}]
        shift_requirements: [{"shift_id": str, "role_needed": str, "start_time": str, "department": str}]
        context: e.g. "flu season surge"

    Returns:
        {"assignments": [...], "warnings": [...], "summary": str}
    """
    client = _get_client()

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


def analyze_workload_fairness(staff_data: list) -> dict:
    """
    Analyzes workload distribution and flags burnout risks.

    Args:
        staff_data: [{"name": str, "role": str, "shifts_this_week": int, "hours_this_week": float}]

    Returns:
        {"fairness_score": int, "at_risk_staff": [...], "recommendations": [...]}
    """
    client = _get_client()

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
    on_duty_staff: list,
    off_duty_staff: list
) -> dict:
    """
    Generates a rapid emergency reallocation plan with voice announcement.

    Returns:
        {
          "immediate_reassignments": [...],
          "call_in_requests": [...],
          "estimated_coverage_minutes": int,
          "critical_warning": str,
          "voice_announcement": str  <-- sent to ElevenLabs
        }
    """
    client = _get_client()

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
    client = _get_client()

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
