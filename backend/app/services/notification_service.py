"""
MedRoster Notification Service
Uses ElevenLabs REST API for voice alerts.
"""

import os
import requests
from app.config import ELEVENLABS_API_KEY as ELEVEN_LABS_API_KEY

DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
ELEVEN_LABS_BASE_URL = "https://api.elevenlabs.io/v1"


def generate_voice_alert(text: str, filename: str = "alert.mp3"):
    if not ELEVEN_LABS_API_KEY or ELEVEN_LABS_API_KEY == "your_elevenlabs_key_here":
        print("[ElevenLabs] API key not set — skipping voice generation")
        return None

    try:
        url = f"{ELEVEN_LABS_BASE_URL}/text-to-speech/{DEFAULT_VOICE_ID}"
        
        headers = {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()

        output_path = f"/tmp/{filename}"
        with open(output_path, "wb") as f:
            f.write(response.content)

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