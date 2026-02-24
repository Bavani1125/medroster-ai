import os

SECRET_KEY = "supersecretkeychangeit"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")