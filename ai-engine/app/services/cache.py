import redis.asyncio as redis
import json
import hashlib
from typing import Optional, Any
from app.utils.config import get_settings
from app.utils.logger import logger

settings = get_settings()


class CacheService:
    """Redis cache service"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.enabled = True
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = await redis.from_url(
                f"redis://{settings.redis_host}:{settings.redis_port}/{settings.redis_db}",
                password=settings.redis_password,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("✅ Connected to Redis")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self.enabled = False
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
    
    def _generate_key(self, data: dict) -> str:
        """Generate cache key from data"""
        # Sort dict for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True)
        return f"prediction:{hashlib.md5(sorted_data.encode()).hexdigest()}"
    
    async def get(self, data: dict) -> Optional[dict]:
        """Get cached prediction"""
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            key = self._generate_key(data)
            cached = await self.redis_client.get(key)
            
            if cached:
                return json.loads(cached)
            
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, data: dict, result: dict, ttl: int = None):
        """Set cached prediction"""
        if not self.enabled or not self.redis_client:
            return
        
        try:
            key = self._generate_key(data)
            ttl = ttl or settings.cache_ttl
            
            await self.redis_client.setex(
                key,
                ttl,
                json.dumps(result)
            )
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def clear(self):
        """Clear all cached predictions"""
        if not self.enabled or not self.redis_client:
            return
        
        try:
            keys = await self.redis_client.keys("prediction:*")
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cached predictions")
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
    
    async def get_stats(self) -> dict:
        """Get cache statistics"""
        if not self.enabled or not self.redis_client:
            return {"enabled": False}
        
        try:
            info = await self.redis_client.info("stats")
            keys = await self.redis_client.keys("prediction:*")
            
            return {
                "enabled": True,
                "total_keys": len(keys),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1), 1)
            }
        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {"enabled": True, "error": str(e)}


# Global cache instance
cache_service = CacheService()
