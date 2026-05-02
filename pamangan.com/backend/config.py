import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pamangan")
    DB_NAME = os.getenv("DB_NAME", "pamangan")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    SECRET_KEY = os.getenv("SECRET_KEY", "pamangan-dev-secret-change-in-prod")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ]
