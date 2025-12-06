from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    app_name: str = "FACE AI Risk Engine"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 3001
    workers: int = 4
    
    # Redis Settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str | None = None
    cache_ttl: int = 300  # 5 minutes
    
    # Model Settings
    model_path: str = "./models"
    model_version: str = "v1"
    retrain_threshold: float = 0.85  # Retrain if accuracy drops below
    
    # Risk Thresholds
    low_risk_threshold: int = 30
    medium_risk_threshold: int = 60
    high_risk_threshold: int = 85
    
    # Monitoring
    enable_metrics: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
