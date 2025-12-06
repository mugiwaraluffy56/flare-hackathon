import sys
from loguru import logger
from app.utils.config import get_settings

settings = get_settings()


def setup_logging():
    """Configure loguru logger"""
    
    # Remove default handler
    logger.remove()
    
    # Add custom handler with format
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.log_level,
        colorize=True,
    )
    
    # Add file handler for errors
    logger.add(
        "logs/errors.log",
        format=log_format,
        level="ERROR",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
    )
    
    # Add file handler for all logs
    logger.add(
        "logs/app.log",
        format=log_format,
        level="INFO",
        rotation="50 MB",
        retention="7 days",
        compression="zip",
    )
    
    return logger


# Initialize logger
setup_logging()
