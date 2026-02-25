"""
MedRoster Notification Service
Uses ElevenLabs SDK for voice alerts.
"""

import os
from app.config import ELEVEN_LABS_API_KEY

DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"


def generate_voice_alert(text: str, filename: str = "alert.mp3"):
    if not ELEVEN_LABS_API_KEY or ELEVEN_LABS_API_KEY == "your_elevenlabs_key_here":
        print("[ElevenLabs] API key not set — skipping voice generation")
        return None

    try:
        from elevenlabs.client import ElevenLabs

        client = ElevenLabs(api_key=ELEVEN_LABS_API_KEY)

        audio = client.text_to_speech.convert(
            text=text,
            voice_id=DEFAULT_VOICE_ID,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        output_path = f"/tmp/{filename}"
        with open(output_path, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print(f"[ElevenLabs] Voice alert saved: {output_path}")
        return output_path

    except Exception as e:
        print(f"[ElevenLabs] Error: {e}")
        return None


def broadcast_emergency_alert(
    emergency_type: str,
    affected_department: str,
    announcement_text: str
) -> dict:
    safe_dept = affected_department.replace(" ", "_").replace("/", "-")
    filename = f"emergency_{safe_dept}.mp3"

    text = announcement_text or (
        f"Attention all staff. Emergency alert for {affected_department}. "
        f"This is a {emergency_type} situation. "
        f"Please check MedRoster for your updated assignment immediately."
    )

    audio_path = generate_voice_alert(text=text, filename=filename)

    return {
        "status": "voice_sent" if audio_path else "text_only",
        "audio_path": audio_path,
        "audio_filename": filename if audio_path else None,
        "announcement_text": text,
        "affected_department": affected_department
    }


def notify_shift_change(
    staff_name: str,
    old_assignment: str,
    new_assignment: str,
    reason: str = "Schedule update"
) -> dict:
    message = (
        f"Hi {staff_name}, your assignment has been updated.\n"
        f"From: {old_assignment}\n"
        f"To:   {new_assignment}\n"
        f"Reason: {reason}\n"
        f"Please acknowledge in MedRoster."
    )
    print(f"[Notification] {message}")
    return {"status": "sent", "recipient": staff_name, "message": message}