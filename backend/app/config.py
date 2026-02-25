# /Users/sunilganta/Documents/medroster-ai/app/config.py

import os

# --------------------
# Auth / JWT
# --------------------
# REQUIRED for security.py imports
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_change_me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# --------------------
# OpenAI
# --------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# --------------------
# ElevenLabs (canonical)
# --------------------
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "")

# --------------------
# ElevenLabs (backward-compatible aliases)
# Some files import ELEVEN_LABS_API_KEY / ELEVEN_LABS_VOICE_ID
# --------------------
ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY", "") or ELEVENLABS_API_KEY
ELEVEN_LABS_VOICE_ID = os.getenv("ELEVEN_LABS_VOICE_ID", "") or ELEVENLABS_VOICE_ID