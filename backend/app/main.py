from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Server Starting...")
    yield 
    logger.info("Server Shutting Down...")
    

app = FastAPI(title="Backend Service", lifespan=lifespan)