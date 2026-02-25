import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root 
ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

# --------------------
# Auth / JWT
# --------------------
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_change_me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# --------------------
# OpenAI
# --------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# --------------------
# ElevenLabs (canonical) — accept either ELEVENLABS_* or ELEVEN_LABS_* env names
# --------------------
# Prefer the canonical name but fall back to the older underscore style if present.
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "") or os.getenv("ELEVEN_LABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "") or os.getenv("ELEVEN_LABS_VOICE_ID", "")

# --------------------
# ElevenLabs (backward-compatible aliases)
# --------------------
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY", "") or ELEVENLABS_API_KEY
ELEVEN_LABS_VOICE_ID = os.getenv("ELEVEN_LABS_VOICE_ID", "") or ELEVENLABS_VOICE_ID