package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/face/backend/internal/api"
	"github.com/face/backend/internal/blockchain"
	"github.com/face/backend/internal/cache"
	"github.com/face/backend/internal/circuitbreaker"
	"github.com/face/backend/internal/config"
	"github.com/face/backend/internal/fdc"
	"github.com/face/backend/internal/ftso"
	"github.com/face/backend/internal/logger"
	"github.com/face/backend/internal/metrics"
	"github.com/face/backend/internal/middleware"
	"github.com/face/backend/internal/models"
	"github.com/face/backend/internal/repository"
	"github.com/face/backend/internal/validator"
	"github.com/face/backend/internal/worker"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("❌ Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	if err := logger.Initialize(cfg.Env); err != nil {
		fmt.Printf("❌ Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	// Initialize validator
	if err := validator.Initialize(); err != nil {
		logger.Fatal("Failed to initialize validator", zap.Error(err))
	}

	logger.Info("🚀 Starting FACE Backend API",
		zap.String("version", "3.0.0"),
		zap.String("env", cfg.Env),
		zap.String("port", cfg.Port),
	)

	// Initialize database
	db, err := initDatabase(cfg)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize cache
	var cacheInstance cache.Cache
	if cfg.CacheEnabled {
		cacheInstance = cache.NewMemoryCache()
		logger.Info("✅ Cache initialized", zap.String("type", "memory"))
	}

	// Initialize repository
	complianceRepo := repository.NewComplianceRepository(db)

	// Initialize circuit breakers
	fdcBreaker := circuitbreaker.New(circuitbreaker.DefaultSettings("fdc"))
	ftsoBreaker := circuitbreaker.New(circuitbreaker.DefaultSettings("ftso"))
	aiBreaker := circuitbreaker.New(circuitbreaker.AggressiveSettings("ai_engine"))

	logger.Info("✅ Circuit breakers initialized")

	// Initialize clients with circuit breakers
	fdcClient := fdc.NewClient(cfg.FDCAPIUrl)
	ftsoClient := ftso.NewClient(cfg.FTSOAPIUrl)

	blockchainClient, err := blockchain.NewClient(blockchain.Config{
		RPCURL:                     cfg.Coston2RPCURL,
		PrivateKey:                 cfg.PrivateKey,
		ComplianceEngineAddress:    cfg.ComplianceEngineAddress,
		SmartAccountFactoryAddress: cfg.SmartAccountFactoryAddress,
		FDCVerifierAddress:         cfg.FDCVerifierAddress,
	})
	if err != nil {
		logger.Warn("Blockchain client initialization failed", zap.Error(err))
		logger.Info("Continuing without blockchain integration...")
	} else {
		logger.Info("✅ Blockchain client initialized")
	}

	// Initialize worker pool
	workerPool := worker.NewPool(5, 100)
	workerPool.Start()
	logger.Info("✅ Worker pool started")

	// Initialize API handler
	handler := api.NewHandler(
		db,
		fdcClient,
		ftsoClient,
		blockchainClient,
		cfg.AIEngineURL,
		complianceRepo,
		cacheInstance,
		workerPool,
		fdcBreaker,
		ftsoBreaker,
		aiBreaker,
	)

	// Setup Gin router
	router := setupRouter(cfg, handler)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("🎯 Server ready",
			zap.String("url", fmt.Sprintf("http://localhost:%s", cfg.Port)),
			zap.String("health", fmt.Sprintf("http://localhost:%s/api/health", cfg.Port)),
			zap.String("metrics", fmt.Sprintf("http://localhost:%s/metrics", cfg.Port)),
		)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("🛑 Shutting down server...")

	// Graceful shutdown with 30 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Stop worker pool
	workerPool.Stop()

	// Shutdown HTTP server
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	// Close database connection
	if sqlDB, err := db.DB(); err == nil {
		sqlDB.Close()
	}

	logger.Info("✅ Server exited gracefully")
}

func initDatabase(cfg *config.Config) (*gorm.DB, error) {
	// Create data directory if it doesn't exist
	os.MkdirAll("./data", 0755)

	db, err := gorm.Open(sqlite.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	// Auto-migrate models
	if err := db.AutoMigrate(&models.ComplianceRecord{}); err != nil {
		return nil, err
	}

	logger.Info("✅ Database initialized", zap.String("path", cfg.DatabaseURL))
	return db, nil
}

func setupRouter(cfg *config.Config, handler *api.Handler) *gin.Engine {
	// Set Gin mode
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Global middleware
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.SecurityHeaders())
	router.Use(metrics.Middleware())

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
	}))

	// Rate limiting (if enabled)
	if cfg.RateLimitEnabled {
		router.Use(middleware.RateLimit(cfg.RateLimitRPS, cfg.RateLimitBurst))
		logger.Info("✅ Rate limiting enabled",
			zap.Float64("rps", cfg.RateLimitRPS),
			zap.Int("burst", cfg.RateLimitBurst),
		)
	}

	// Prometheus metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API routes
	apiV1 := router.Group("/api")
	{
		// Health check
		apiV1.GET("/health", handler.HealthCheck)

		// Compliance endpoints
		apiV1.POST("/submit-asset", handler.SubmitAsset)
		apiV1.GET("/compliance/:id", handler.GetCompliance)
		apiV1.GET("/transactions", handler.GetTransactions)
		apiV1.GET("/stats", handler.GetStats)

		// Risk assessment
		apiV1.GET("/risk-score/:asset", handler.GetRiskScore)

		// WebSocket
		apiV1.GET("/ws", handler.HandleWebSocket)
	}

	logger.Info("✅ Routes configured", zap.Int("endpoints", 8))
	return router
}
