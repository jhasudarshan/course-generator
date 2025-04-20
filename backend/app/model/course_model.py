from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class YouTubeVideoInfo(BaseModel):
    title: str
    video_id: str
    watch_url: str
    embed_url: str
    thumbnail: str
    channel: str


class YouTubeData(BaseModel):
    search_queries: List[str]
    video_info: YouTubeVideoInfo


class ModuleModel(BaseModel):
    module_title: str
    objectives: Optional[List[str]] = []
    lesson_content: str
    youtube_data: Optional[YouTubeData]
    quiz_questions: str
    assignments: Optional[str]


class CourseModel(BaseModel):
    title: str
    description: str
    language: Optional[str] = None
    difficulty: Optional[str] = None
    modules: List[ModuleModel]
    created_at: Optional[str] = Field(default_factory=lambda: "To be set when inserting")