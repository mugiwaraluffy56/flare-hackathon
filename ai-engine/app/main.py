from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from app.models.schemas import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    BatchRiskAnalysisRequest,
    BatchRiskAnalysisResponse,
    ModelInfo,
    ModelMetrics,
    HealthResponse
)
from app.models.ensemble import EnsembleRiskModel
from app.services.cache import cache_service
from app.services import metrics
from app.utils.config import get_settings
from app.utils.logger import logger

settings = get_settings()

# Global model instance
risk_model = EnsembleRiskModel()
start_time = time.time()
total_predictions = 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    
    # Load model
    try:
        risk_model.load()
        if risk_model.accuracy:
            metrics.set_model_accuracy(risk_model.accuracy)
    except Exception as e:
        logger.warning(f"Could not load model: {e}. Using rule-based fallback.")
    
    # Connect to Redis
    await cache_service.connect()
    
    logger.info("✅ Application started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application...")
    await cache_service.disconnect()
    logger.info("✅ Application shut down gracefully")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Advanced AI-powered risk assessment engine for FACE",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze", response_model=RiskAnalysisResponse)
@metrics.track_prediction_time
async def analyze_risk(request: RiskAnalysisRequest):
    """Analyze risk for a single transaction"""
    global total_predictions
    
    try:
        # Convert to dict
        data = request.model_dump()
        
        # Check cache
        cached = await cache_service.get(data)
        if cached:
            metrics.record_cache_hit()
            logger.debug(f"Cache hit for {request.asset_type}")
            return RiskAnalysisResponse(**cached)
        
        metrics.record_cache_miss()
        
        # Predict
        risk_score, confidence, factors = risk_model.predict_risk_score(data)
        recommendation = risk_model.get_recommendation(risk_score)
        
        # Create response
        response = RiskAnalysisResponse(
            risk_score=risk_score,
            recommendation=recommendation,
            factors=factors,
            confidence=confidence,
            model_version=risk_model.version
        )
        
        # Cache result
        await cache_service.set(data, response.model_dump())
        
        # Record metrics
        metrics.record_prediction(recommendation, risk_score)
        total_predictions += 1
        
        logger.info(f"Prediction: {request.asset_type} -> {risk_score} ({recommendation})")
        
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-analyze", response_model=BatchRiskAnalysisResponse)
async def batch_analyze_risk(request: BatchRiskAnalysisRequest):
    """Analyze risk for multiple transactions"""
    
    start = time.time()
    results = []
    
    for req in request.requests:
        try:
            result = await analyze_risk(req)
            results.append(result)
        except Exception as e:
            logger.error(f"Batch prediction error: {e}")
            # Continue with other requests
            continue
    
    processing_time = (time.time() - start) * 1000  # Convert to ms
    
    return BatchRiskAnalysisResponse(
        results=results,
        total_processed=len(results),
        processing_time_ms=processing_time
    )


@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get model information"""
    
    return ModelInfo(
        version=risk_model.version,
        model_type="ensemble",
        trained_at=risk_model.trained_at,
        accuracy=risk_model.accuracy,
        total_predictions=total_predictions
    )


@app.get("/model/metrics", response_model=ModelMetrics)
async def get_model_metrics():
    """Get model performance metrics"""
    
    cache_stats = await cache_service.get_stats()
    
    return ModelMetrics(
        total_predictions=total_predictions,
        cache_hit_rate=cache_stats.get("hit_rate", 0.0),
        average_latency_ms=0.0,  # Would need to calculate from metrics
        accuracy=risk_model.accuracy
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    
    uptime = time.time() - start_time
    
    # Check Redis connection
    redis_connected = cache_service.enabled and cache_service.redis_client is not None
    
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        model_loaded=risk_model.model is not None,
        redis_connected=redis_connected,
        uptime_seconds=uptime
    )


@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus metrics endpoint"""
    
    return Response(
        content=metrics.get_metrics(),
        media_type=metrics.get_content_type()
    )


@app.get("/")
async def root():
    """Root endpoint"""
    
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=1 if settings.debug else settings.workers
    )
