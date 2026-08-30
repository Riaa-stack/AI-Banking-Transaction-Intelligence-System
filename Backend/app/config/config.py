import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Debug (Temporary)
print("=" * 60)
print("Loading Environment Variables...")
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("=" * 60)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")   # <-- ADD THIS

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER")

    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 52428800))

    # Mail Configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() in ("true", "1", "yes")
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "false").lower() in ("true", "1", "yes")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = (
        os.getenv("MAIL_DEFAULT_SENDER")
        or os.getenv("MAIL_USERNAME")
        or "security@aibanking.demo"
    )