from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.config.config import (
    YOUTUBE_API_KEY1,
    YOUTUBE_API_KEY2,
    YOUTUBE_API_KEY3,
    YOUTUBE_API_KEY4
)
from app.config.logger_config import logger
from datetime import datetime,date


class YoutubeSetup:
    def __init__(self):
        self.api_keys = self._get_valid_api_keys()
        self.current_key_index = 0
        self.last_reset_date = date.today()
        self.language_map ={
            'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
            'italian': 'it', 'portuguese': 'pt', 'russian': 'ru', 'japanese': 'ja',
            'korean': 'ko', 'chinese': 'zh-CN', 'arabic': 'ar', 'hindi': 'hi',
            'bengali': 'bn', 'turkish': 'tr', 'dutch': 'nl', 'polish': 'pl'
        }
        
        if not self.api_keys:
            logger.error("No valid YouTube API keys found in configuration")
        else:
            logger.info(f"Initialized with {len(self.api_keys)} YouTube API keys")

    def _get_valid_api_keys(self):
        """Collect all valid API keys from config"""
        valid_keys = []
        for key in [YOUTUBE_API_KEY1, YOUTUBE_API_KEY2, YOUTUBE_API_KEY3, YOUTUBE_API_KEY4]:
            if key and isinstance(key, str) and key.strip():
                valid_keys.append(key.strip())
        return valid_keys
    
    def _get_current_key(self):
        """Get current API key with daily rotation check"""
        self._check_and_reset_daily()
        return self.api_keys[self.current_key_index]
    
    def _rotate_key(self):
        """Move to next API key"""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        logger.info(f"Rotated to API key index {self.current_key_index}")
    
    def _check_and_reset_daily(self):
        """Reset to first key if it's a new day"""
        today = date.today()
        if today != self.last_reset_date:
            logger.info(f"New day detected - resetting to first API key (was {self.current_key_index})")
            self.current_key_index = 0
            self.last_reset_date = today

    def search_youtube_videos(self, query, language='english'):
        if not self.api_keys:
            logger.error("No valid YouTube API keys available")
            return None

        lang_code = self.language_map.get(language.lower().strip(), 'en')
        original_key_index = self.current_key_index
        attempted_keys = 0

        while attempted_keys < len(self.api_keys):
            current_key = self._get_current_key()
            logger.info(f"Attempting search with API key index {self.current_key_index}")

            try:
                youtube = build('youtube', 'v3', developerKey=current_key)
                response = youtube.search().list(
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
                    logger.info(f"Search successful with key index {self.current_key_index}")
                    # Rotate key for next request (but stay within same day)
                    self._rotate_key()
                    return result

            except HttpError as e:
                if e.resp.status == 403 and 'quotaExceeded' in str(e):
                    logger.warning(f"Quota exceeded for key index {self.current_key_index}")
                    self._rotate_key()
                else:
                    logger.error(f"HTTP error with key index {self.current_key_index}: {str(e)[:200]}")
                    # Don't rotate key for non-quota errors
            except Exception as e:
                logger.error(f"General error with key index {self.current_key_index}: {str(e)[:200]}")
                # Don't rotate key for general errors
            
            attempted_keys += 1
            if attempted_keys < len(self.api_keys):
                logger.info("Trying next API key...")

        # Reset to original key index if all keys failed
        self.current_key_index = original_key_index
        logger.error("All YouTube API keys exhausted")
        return None
    
    
youtube_worker = YoutubeSetup()