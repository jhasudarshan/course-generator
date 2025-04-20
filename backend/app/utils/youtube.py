from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.config.config import YOUTUBE_API_KEY
from app.config.logger_config import logger

class YoutubeSetup:
    def __init__(self):
        try:
            self.youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
            logger.info("YouTube API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize YouTube API client: {e}")
            self.youtube = None
            
    def search_youtube_videos(self, query, language='en', max_results=1):
        if not self.youtube:
            logger.error("YouTube API client not initialized")
            return None
            
        try:
            # Clean and format query
            search_query = f"{query} tutorial"
            
            # Map common language codes to ISO 639-1 codes
            language_map = {
                'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
                'italian': 'it', 'portuguese': 'pt', 'russian': 'ru', 'japanese': 'ja',
                'korean': 'ko', 'chinese': 'zh', 'arabic': 'ar', 'hindi': 'hi','bengali':'bn'
            }
            
            # Get language code
            lang_code = language_map.get(language.lower(), language.lower())
            
            logger.info(f"Searching YouTube for: '{search_query}' in language: {lang_code}")
            
            response = self.youtube.search().list(
                q=search_query,
                part='id,snippet',
                maxResults=max_results,
                type='video',
                videoDuration='medium',
                relevanceLanguage=lang_code,
                safeSearch='moderate',
                order="relevance",
                videoDefinition="high"
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
                logger.info(f"Found video: {result['title']}")
                return result
                
        except HttpError as e:
            logger.error(f"YouTube API error for '{query}': {e}")
        except Exception as e:
            logger.error(f"Unexpected error in YouTube search: {e}")
            
        return None
    
    
youtube_worker = YoutubeSetup()