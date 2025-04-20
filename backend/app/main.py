from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from app.config.logger_config import logger
from app.db.mongo import mongo_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Server Starting...")
    yield 
    logger.info("Server Shutting Down...")
    mongo_db.close_connection()


app = FastAPI(title="Backend Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

