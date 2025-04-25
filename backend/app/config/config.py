import os
from app.config.logger_config import logger
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
YOUTUBE_API_KEY1 = os.getenv("YOUTUBE_API_KEY1")
YOUTUBE_API_KEY2 = os.getenv("YOUTUBE_API_KEY2")
YOUTUBE_API_KEY3 = os.getenv("YOUTUBE_API_KEY3")
YOUTUBE_API_KEY4 = os.getenv("YOUTUBE_API_KEY4")
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
FRONTEND_URL=os.getenv("FRONTEND_URL")

logger.info("Backend Service Configuration Loaded successfully")