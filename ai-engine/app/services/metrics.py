from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from functools import wraps
import time

# Define metrics
prediction_counter = Counter(
    'face_ai_predictions_total',
    'Total number of predictions',
    ['recommendation']
)

prediction_latency = Histogram(
    'face_ai_prediction_latency_seconds',
    'Prediction latency in seconds',
    buckets=[0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0]
)

cache_hits = Counter(
    'face_ai_cache_hits_total',
    'Total number of cache hits'
)

cache_misses = Counter(
    'face_ai_cache_misses_total',
    'Total number of cache misses'
)

model_accuracy = Gauge(
    'face_ai_model_accuracy',
    'Current model accuracy'
)

active_requests = Gauge(
    'face_ai_active_requests',
    'Number of active requests'
)

risk_score_distribution = Histogram(
    'face_ai_risk_score_distribution',
    'Distribution of risk scores',
    buckets=[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
)


def track_prediction_time(func):
    """Decorator to track prediction latency"""
    
    @wraps(func)
    async def wrapper(*args, **kwargs):
        active_requests.inc()
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            latency = time.time() - start_time
            prediction_latency.observe(latency)
            return result
        finally:
            active_requests.dec()
    
    return wrapper


def record_prediction(recommendation: str, risk_score: int):
    """Record a prediction in metrics"""
    prediction_counter.labels(recommendation=recommendation).inc()
    risk_score_distribution.observe(risk_score)


def record_cache_hit():
    """Record a cache hit"""
    cache_hits.inc()


def record_cache_miss():
    """Record a cache miss"""
    cache_misses.inc()


def set_model_accuracy(accuracy: float):
    """Set current model accuracy"""
    model_accuracy.set(accuracy)


def get_metrics():
    """Get Prometheus metrics"""
    return generate_latest()


def get_content_type():
    """Get Prometheus content type"""
    return CONTENT_TYPE_LATEST
