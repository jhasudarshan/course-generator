import uuid
import asyncio
from typing import Dict, List
from fastapi import FastAPI,BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from bson.objectid import ObjectId
from contextlib import asynccontextmanager
from app.config.logger_config import logger
from app.config.config import FRONTEND_URL
from app.db.mongo import mongo_db
from app.model.course_model import CourseModel
from app.utils.course_generator import course_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Server Starting...")
    yield 
    logger.info("Server Shutting Down...")
    mongo_db.close_connection()


app = FastAPI(title="Backend Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Your React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CourseInputModel(BaseModel):
    topic: str
    description: str
    difficulty: str
    language: str

class JobStatusModel(BaseModel):
    job_id: str
    status: str
    message: str

# Job management system
class JobQueue:
    def __init__(self):
        self.active_jobs: Dict[str, dict] = {}
        self.pending_jobs: List[str] = []
        self.currently_processing: str = None
        self.lock = asyncio.Lock()
    
    async def add_job(self, job_id: str, input_data: dict):
        async with self.lock:
            self.active_jobs[job_id] = {
                "status": "queued",
                "message": "Job added to queue",
                "input_data": input_data
            }
            self.pending_jobs.append(job_id)
            if self.currently_processing is None:
                asyncio.create_task(self.process_next_job())
    
    async def process_next_job(self):
        async with self.lock:
            if not self.pending_jobs:
                self.currently_processing = None
                return
            
            job_id = self.pending_jobs.pop(0)
            self.currently_processing = job_id
            self.active_jobs[job_id]["status"] = "processing"
        
        try:
            # Get the job data
            job_data = self.active_jobs[job_id]
            
            # Process the job (this runs in the background)
            await asyncio.to_thread(
                generate_course_background,
                job_id,
                job_data["input_data"]
            )
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}")
            async with self.lock:
                self.active_jobs[job_id]["status"] = "failed"
                self.active_jobs[job_id]["message"] = f"Processing error: {str(e)}"
        finally:
            # Process next job if available
            async with self.lock:
                self.currently_processing = None
                if self.pending_jobs:
                    asyncio.create_task(self.process_next_job())

job_queue = JobQueue()

def generate_course_background(job_id: str, user_input: dict):
    try:
        logger.info(f"Starting course generation for job {job_id}")
        
        # Generate course outline using Gemini
        course_outline = course_agent.generate_course_outline(user_input)
        
        if not course_outline:
            logger.error("Failed to generate course outline")
            job_queue.active_jobs[job_id]["status"] = "failed"
            job_queue.active_jobs[job_id]["message"] = "Failed to generate course outline"
            return
        
        new_course = {
            "title": course_outline["title"],
            "description": course_outline["description"],
            "modules": course_outline["modules"],
            "difficulty": course_outline["difficulty"],
            "language": course_outline["language"],
            "created_at": datetime.now().isoformat()
        }
        
        # Save to MongoDB
        course_collection = mongo_db.get_collection("courses")
        if course_collection is None:
            logger.error("Failed to connect to MongoDB collection")
            job_queue.active_jobs[job_id]["status"] = "failed"
            job_queue.active_jobs[job_id]["message"] = "Database connection error"
            return
        
        # Insert into MongoDB
        result = course_collection.insert_one(new_course)

        job_queue.active_jobs[job_id]["status"] = "completed"
        job_queue.active_jobs[job_id]["message"] = f"Course generated and saved with ID: {result.inserted_id}"
        job_queue.active_jobs[job_id]["course_id"] = str(result.inserted_id)
        
        logger.info(f"Course generation completed for job {job_id}")
    except Exception as e:
        logger.error(f"Error in course generation: {e}")
        job_queue.active_jobs[job_id]["status"] = "failed"
        job_queue.active_jobs[job_id]["message"] = f"Error generating course: {str(e)}"

@app.post("/api/generate-course", response_model=JobStatusModel)
async def create_course(input_data: CourseInputModel):
    # Create a job ID
    job_id = str(uuid.uuid4())
    
    # Add job to queue
    await job_queue.add_job(job_id, input_data.model_dump())
    
    return JobStatusModel(
        job_id=job_id,
        status="queued",
        message="Job added to processing queue. Check status with the job ID."
    )

@app.get("/api/job-status/{job_id}", response_model=JobStatusModel)
async def get_job_status(job_id: str):
    if job_id not in job_queue.active_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_queue.active_jobs[job_id]
    
    return JobStatusModel(
        job_id=job_id,
        status=job["status"],
        message=job["message"]
    )
    
@app.get("/api/courses")
async def list_courses():
    """
    Endpoint to list all generated courses
    """
    course_collection = mongo_db.get_collection("courses")
    if course_collection is None: 
        raise HTTPException(status_code=500, detail="Database connection error")
    
    try:
        courses = list(course_collection.find({}, {
            "_id": 1,
            "title": 1,
            "topic": 1,
            "difficulty": 1,
            "audience": 1,
            "created_at": 1
        }))
        
        # Convert ObjectId to string for JSON serialization
        for course in courses:
            course["_id"] = str(course["_id"])
        
        return courses
    except Exception as e:
        logger.error(f"Error listing courses: {e}")
        raise HTTPException(status_code=500, detail=f"Error listing courses: {str(e)}")
    
@app.get("/api/courses/{course_id}")
async def get_course_detail(course_id: str):
    try:
        # Convert string ID to MongoDB ObjectId
        object_id = ObjectId(course_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {str(e)}")
    
    course_collection = mongo_db.get_collection("courses")
    if course_collection is None: 
        raise HTTPException(status_code=500, detail="Database connection error")
    
    try:
        # Find the course by ID
        course = course_collection.find_one({"_id": object_id})
        
        if not course:
            raise HTTPException(status_code=404, detail=f"Course with ID {course_id} not found")
        
        # Convert ObjectId to string for JSON serialization
        course["_id"] = str(course["_id"])
        
        return course
        
    except Exception as e:
        logger.error(f"Error fetching course {course_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching course: {str(e)}")


