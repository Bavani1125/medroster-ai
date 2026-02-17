from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "MedRoster AI"
    database_url: str = "sqlite:///./medroster.db"

settings = Settings()
