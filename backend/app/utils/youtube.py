from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.config.config import YOUTUBE_API_KEY
from app.config.logger_config import logger

class YoutubeSetup:
    def __init__(self):
        self.youtube = None
        self.language_map ={
            'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
            'italian': 'it', 'portuguese': 'pt', 'russian': 'ru', 'japanese': 'ja',
            'korean': 'ko', 'chinese': 'zh-CN', 'arabic': 'ar', 'hindi': 'hi',
            'bengali': 'bn', 'turkish': 'tr', 'dutch': 'nl', 'polish': 'pl'
        }
        
        if YOUTUBE_API_KEY:
            try:
                self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
                logger.info("YouTube API client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize YouTube API client: {e}")
        else:
            logger.error("Missing YouTube API key in configuration")

    def search_youtube_videos(self, query, language='english'):
        if not self.youtube:
            logger.error("YouTube client not ready")
            return None

        try:
            # Get proper language code
            lang_lower = language.strip().lower()
            lang_code = self.language_map.get(lang_lower, 'en')  # Default to English
            
            logger.info(f"Searching YouTube: '{query}' [{lang_code}]")
            
            response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                maxResults=1,
                type='video',
                videoDuration='medium',
                relevanceLanguage=lang_code,
                safeSearch='moderate',
                order="relevance",
                videoDefinition="high",
                fields="items(id(videoId),snippet(title,channelTitle,thumbnails))"
            ).execute()

            if response.get('items'):
                video = response['items'][0]
                video_id = video['id']['videoId']
                
                result = {
                    'title': video['snippet']['title'],
                    'video_id': video_id,
                    'watch_url': f"https://www.youtube.com/watch?v={video_id}",
                    'embed_url': f"https://www.youtube.com/embed/{video_id}",
                    'thumbnail': video['snippet']['thumbnails']['high']['url'],
                    'channel': video['snippet']['channelTitle'],
                    'language': lang_code
                }
                logger.info(f"Found video: {result}")
                return result
                
        except Exception as e:
            logger.error(f"YouTube search error: {str(e)[:200]}")
            
        return None
    
    
youtube_worker = YoutubeSetup()