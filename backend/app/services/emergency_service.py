"""
MedRoster Emergency Service
Full Red Alert orchestration:
  1. Query live staffing state
  2. Call GPT-4o for reallocation plan
  3. Broadcast ElevenLabs voice alert
  4. Update DB assignments
  5. Notify affected staff
  6. Write compliance audit log

Target: <3 minutes from trigger to full coverage.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shift import Shift
from app.models.assignment import Assignment
from app.models.department import Department
from app.models.audit_log import AuditLog
from app.services.ai_service import generate_emergency_reallocation_plan
from app.services.notification_service import broadcast_emergency_alert, notify_shift_change


def trigger_red_alert(
    db: Session,
    emergency_type: str,
    affected_department_id: int,
    triggered_by: str
) -> dict:
    """
    Main Red Alert pipeline. Called from the emergency router.
    """
    started_at = datetime.utcnow()

    # ── 1. Get affected department name ──────────────────────────────────
    dept = db.query(Department).filter(Department.id == affected_department_id).first()
    if not dept:
        return {"error": f"Department {affected_department_id} not found"}
    dept_name = dept.name

    # ── 2. Build staffing snapshot ────────────────────────────────────────
    now = datetime.utcnow()
    all_users = db.query(User).filter(User.is_active == True).all()

    on_duty = []
    off_duty = []

    for user in all_users:
        active_assignment = (
            db.query(Assignment)
            .join(Shift)
            .filter(
                Assignment.user_id == user.id,
                Shift.start_time <= now,
                Shift.end_time >= now
            )
            .first()
            
        )

    entry = {
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "department_id": user.department_id
    }

    if active_assignment:
        entry["current_shift_id"] = active_assignment.shift_id
        # Safely get department name
        try:
            dept = db.query(Department).filter(
                Department.id == active_assignment.shift.department_id
            ).first()
            entry["current_department"] = dept.name if dept else "Unknown"
        except Exception:
            entry["current_department"] = "Unknown"
        on_duty.append(entry)
    else:
        off_duty.append(entry)
    # ── 3. AI generates reallocation plan ─────────────────────────────────
    try:
        ai_plan = generate_emergency_reallocation_plan(
            emergency_type=emergency_type,
            affected_department=dept_name,
            on_duty_staff=on_duty,
            off_duty_staff=off_duty
        )
    except ValueError as e:
        # OpenAI key not set — return a mock plan so the app still works
        ai_plan = {
            "immediate_reassignments": [],
            "call_in_requests": [],
            "estimated_coverage_minutes": 0,
            "critical_warning": str(e),
            "voice_announcement": (
                f"Emergency alert for {dept_name}. "
                f"This is a {emergency_type} situation. "
                f"All available staff please report immediately."
            )
        }

    # ── 4. ElevenLabs voice broadcast ─────────────────────────────────────
    voice_text = ai_plan.get("voice_announcement", "")
    broadcast = broadcast_emergency_alert(
        emergency_type=emergency_type,
        affected_department=dept_name,
        announcement_text=voice_text
    )

    # ── 5. Create emergency assignments in DB ─────────────────────────────
    assignments_created = []

    for reassignment in ai_plan.get("immediate_reassignments", []):
        staff_name = reassignment.get("staff_name", "")
        matched_staff = next(
            (s for s in on_duty if s["name"].lower() == staff_name.lower()), None
        )
        if not matched_staff:
            continue

        # Find the next open shift in the affected department
        target_shift = (
            db.query(Shift)
            .filter(
                Shift.department_id == affected_department_id,
                Shift.end_time >= now
            )
            .first()
        )

        if not target_shift:
            continue

        # Avoid duplicate assignments
        already_assigned = (
            db.query(Assignment)
            .filter(
                Assignment.user_id == matched_staff["id"],
                Assignment.shift_id == target_shift.id
            )
            .first()
        )
        if already_assigned:
            continue

        new_assignment = Assignment(
            user_id=matched_staff["id"],
            shift_id=target_shift.id,
            is_emergency=True,
            notes=f"Emergency reallocation: {emergency_type}"
        )
        db.add(new_assignment)

        notify_shift_change(
            staff_name=matched_staff["name"],
            old_assignment=matched_staff.get("current_department", "Previous assignment"),
            new_assignment=dept_name,
            reason=f"EMERGENCY: {emergency_type}"
        )

        assignments_created.append({
            "staff_name": matched_staff["name"],
            "role": matched_staff["role"],
            "to_department": dept_name
        })

    db.commit()

    # ── 6. Audit log ──────────────────────────────────────────────────────
    elapsed = round((datetime.utcnow() - started_at).total_seconds(), 1)

    audit = AuditLog(
        action=(
            f"RED ALERT | type={emergency_type} | department={dept_name} | "
            f"reassignments={len(assignments_created)} | response_time={elapsed}s"
        ),
        performed_by=triggered_by
    )
    db.add(audit)
    db.commit()

    return {
        "status": "red_alert_active",
        "emergency_type": emergency_type,
        "affected_department": dept_name,
        "response_time_seconds": elapsed,
        "staff_on_duty_count": len(on_duty),
        "staff_off_duty_count": len(off_duty),
        "ai_plan": ai_plan,
        "assignments_created": assignments_created,
        "voice_broadcast": broadcast,
        "timestamp": started_at.isoformat()
    }


def resolve_red_alert(
    db: Session,
    department_id: int,
    resolved_by: str
) -> dict:
    """Marks emergency as resolved and logs it."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    dept_name = dept.name if dept else f"Dept {department_id}"

    audit = AuditLog(
        action=f"RED ALERT RESOLVED | department={dept_name}",
        performed_by=resolved_by
    )
    db.add(audit)
    db.commit()

    return {
        "status": "resolved",
        "department": dept_name,
        "resolved_by": resolved_by,
        "timestamp": datetime.utcnow().isoformat()
    }
