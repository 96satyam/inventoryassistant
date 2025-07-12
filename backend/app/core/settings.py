from pydantic import BaseSettings, Field

class EmailSettings(BaseSettings):
    sender: str = Field(..., env="EMAIL_SENDER")
    password: str = Field(..., env="EMAIL_PASS")

class Settings(BaseSettings):
    env: str = "dev"
    email: EmailSettings = EmailSettings()

settings = Settings()
