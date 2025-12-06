from pydantic import BaseModel, Field, validator
from typing import List, Optional


class RiskAnalysisRequest(BaseModel):
    """Request model for risk analysis"""
    
    asset_type: str = Field(..., min_length=1, max_length=10, description="Asset type (e.g., BTC, ETH)")
    amount: float = Field(..., gt=0, description="Amount of asset")
    price: float = Field(..., gt=0, description="Current asset price")
    volatility: float = Field(..., ge=0, le=100, description="Price volatility percentage")
    fdc_verified: bool = Field(..., description="Whether FDC verification passed")
    user_history: int = Field(..., ge=0, description="Number of previous transactions")
    
    @validator('asset_type')
    def validate_asset_type(cls, v):
        """Validate and normalize asset type"""
        return v.upper().strip()
    
    class Config:
        schema_extra = {
            "example": {
                "asset_type": "BTC",
                "amount": 1.5,
                "price": 45000.0,
                "volatility": 15.5,
                "fdc_verified": True,
                "user_history": 5
            }
        }


class BatchRiskAnalysisRequest(BaseModel):
    """Request model for batch risk analysis"""
    
    requests: List[RiskAnalysisRequest] = Field(..., max_items=100, description="List of risk analysis requests")
    
    class Config:
        schema_extra = {
            "example": {
                "requests": [
                    {
                        "asset_type": "BTC",
                        "amount": 1.5,
                        "price": 45000.0,
                        "volatility": 15.5,
                        "fdc_verified": True,
                        "user_history": 5
                    }
                ]
            }
        }


class RiskAnalysisResponse(BaseModel):
    """Response model for risk analysis"""
    
    risk_score: int = Field(..., ge=0, le=100, description="Risk score (0-100)")
    recommendation: str = Field(..., description="Recommendation (APPROVE/REJECT/REVIEW)")
    factors: List[str] = Field(..., description="Risk factors considered")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")
    model_version: str = Field(..., description="Model version used")
    
    class Config:
        schema_extra = {
            "example": {
                "risk_score": 25,
                "recommendation": "APPROVE",
                "factors": ["Low volatility", "FDC verified", "Good user history"],
                "confidence": 0.92,
                "model_version": "v1"
            }
        }


class BatchRiskAnalysisResponse(BaseModel):
    """Response model for batch risk analysis"""
    
    results: List[RiskAnalysisResponse] = Field(..., description="List of risk analysis results")
    total_processed: int = Field(..., description="Total number of requests processed")
    processing_time_ms: float = Field(..., description="Total processing time in milliseconds")


class ModelInfo(BaseModel):
    """Model information"""
    
    version: str
    model_type: str
    trained_at: Optional[str]
    accuracy: Optional[float]
    total_predictions: int
    
    class Config:
        schema_extra = {
            "example": {
                "version": "v1",
                "model_type": "ensemble",
                "trained_at": "2024-01-01T00:00:00Z",
                "accuracy": 0.92,
                "total_predictions": 10000
            }
        }


class ModelMetrics(BaseModel):
    """Model performance metrics"""
    
    total_predictions: int
    cache_hit_rate: float
    average_latency_ms: float
    accuracy: Optional[float]
    
    class Config:
        schema_extra = {
            "example": {
                "total_predictions": 10000,
                "cache_hit_rate": 0.65,
                "average_latency_ms": 45.2,
                "accuracy": 0.92
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    
    status: str
    version: str
    model_loaded: bool
    redis_connected: bool
    uptime_seconds: float
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "version": "2.0.0",
                "model_loaded": True,
                "redis_connected": True,
                "uptime_seconds": 3600.5
            }
        }
