package metrics

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// HTTP metrics
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "face_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "face_http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	httpActiveConnections = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "face_http_active_connections",
			Help: "Number of active HTTP connections",
		},
	)

	// Cache metrics
	cacheHitsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "face_cache_hits_total",
			Help: "Total number of cache hits",
		},
	)

	cacheMissesTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "face_cache_misses_total",
			Help: "Total number of cache misses",
		},
	)

	cacheSize = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "face_cache_size",
			Help: "Current number of items in cache",
		},
	)

	// Database metrics
	dbQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "face_db_query_duration_seconds",
			Help:    "Database query duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation"},
	)

	dbConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "face_db_connections_active",
			Help: "Number of active database connections",
		},
	)

	// WebSocket metrics
	wsConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "face_websocket_connections_active",
			Help: "Number of active WebSocket connections",
		},
	)

	wsMessagesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "face_websocket_messages_total",
			Help: "Total number of WebSocket messages",
		},
		[]string{"type"},
	)

	// Business metrics
	complianceChecksTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "face_compliance_checks_total",
			Help: "Total number of compliance checks",
		},
		[]string{"status"},
	)

	riskScoreDistribution = promauto.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "face_risk_score_distribution",
			Help:    "Distribution of risk scores",
			Buckets: []float64{0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100},
		},
	)

	externalServiceDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "face_external_service_duration_seconds",
			Help:    "External service call duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"service"},
	)

	externalServiceErrors = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "face_external_service_errors_total",
			Help: "Total number of external service errors",
		},
		[]string{"service"},
	)
)

// RecordHTTPRequest records HTTP request metrics
func RecordHTTPRequest(method, endpoint, status string, duration time.Duration) {
	httpRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
	httpRequestDuration.WithLabelValues(method, endpoint).Observe(duration.Seconds())
}

// IncActiveConnections increments active connections
func IncActiveConnections() {
	httpActiveConnections.Inc()
}

// DecActiveConnections decrements active connections
func DecActiveConnections() {
	httpActiveConnections.Dec()
}

// RecordCacheHit records a cache hit
func RecordCacheHit() {
	cacheHitsTotal.Inc()
}

// RecordCacheMiss records a cache miss
func RecordCacheMiss() {
	cacheMissesTotal.Inc()
}

// SetCacheSize sets the current cache size
func SetCacheSize(size int) {
	cacheSize.Set(float64(size))
}

// RecordDBQuery records database query duration
func RecordDBQuery(operation string, duration time.Duration) {
	dbQueryDuration.WithLabelValues(operation).Observe(duration.Seconds())
}

// SetDBConnections sets active database connections
func SetDBConnections(count int) {
	dbConnectionsActive.Set(float64(count))
}

// IncWSConnections increments WebSocket connections
func IncWSConnections() {
	wsConnectionsActive.Inc()
}

// DecWSConnections decrements WebSocket connections
func DecWSConnections() {
	wsConnectionsActive.Dec()
}

// RecordWSMessage records a WebSocket message
func RecordWSMessage(msgType string) {
	wsMessagesTotal.WithLabelValues(msgType).Inc()
}

// RecordComplianceCheck records a compliance check
func RecordComplianceCheck(status string) {
	complianceChecksTotal.WithLabelValues(status).Inc()
}

// RecordRiskScore records a risk score
func RecordRiskScore(score float64) {
	riskScoreDistribution.Observe(score)
}

// RecordExternalServiceCall records external service call duration
func RecordExternalServiceCall(service string, duration time.Duration) {
	externalServiceDuration.WithLabelValues(service).Observe(duration.Seconds())
}

// RecordExternalServiceError records an external service error
func RecordExternalServiceError(service string) {
	externalServiceErrors.WithLabelValues(service).Inc()
}

// Middleware returns a Gin middleware for metrics collection
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		IncActiveConnections()
		defer DecActiveConnections()

		c.Next()

		duration := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.FullPath()

		if path == "" {
			path = c.Request.URL.Path
		}

		RecordHTTPRequest(method, path, string(rune(status/100)), duration)
	}
}
