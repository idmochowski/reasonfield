"""
Configuration module for the application
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

class Settings:
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # Google Cloud Configuration
    GCS_BUCKET: str = os.getenv("GCS_BUCKET", "reasonfield-uploads")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # AI/ML Configuration
    GEMINI_API: str = os.getenv("GEMINI_API", "")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    ALLOWED_FILE_TYPES: List[str] = os.getenv(
        "ALLOWED_FILE_TYPES", 
        "application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ).split(",")
    
    # Bias Analysis Configuration
    BIAS_DEFINITIONS_DIRECTORY: str = os.getenv("BIAS_DEFINITIONS_DIRECTORY", "papers")
    BIAS_DEFINITIONS_FILENAME: str = os.getenv("BIAS_DEFINITIONS_FILENAME", "bias-definitions.json")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Monitoring
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    @classmethod
    def validate(cls) -> List[str]:
        """Validate required settings"""
        errors = []
        
        if not cls.GEMINI_API:
            errors.append("GEMINI_API is required")
        
        if not cls.GOOGLE_CLIENT_ID:
            errors.append("GOOGLE_CLIENT_ID is required")
        
        if not cls.GCS_BUCKET:
            errors.append("GCS_BUCKET is required")
        
        return errors

# Global settings instance
settings = Settings() 