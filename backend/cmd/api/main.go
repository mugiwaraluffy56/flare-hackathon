package main

import (
	"log"
	"os"

	"github.com/face/backend/internal/api"
	"github.com/face/backend/internal/blockchain"
	"github.com/face/backend/internal/fdc"
	"github.com/face/backend/internal/ftso"
	"github.com/face/backend/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	db, err := initDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize clients
	fdcClient := fdc.NewClient(getEnv("FDC_API_URL", "https://fdc-api.flare.network"))
	ftsoClient := ftso.NewClient(getEnv("FTSO_API_URL", "https://ftso-api.flare.network"))

	blockchainClient, err := blockchain.NewClient(blockchain.Config{
		RPCURL:                     getEnv("COSTON2_RPC_URL", "https://coston2-api.flare.network/ext/C/rpc"),
		PrivateKey:                 getEnv("PRIVATE_KEY", ""),
		ComplianceEngineAddress:    getEnv("COMPLIANCE_ENGINE_ADDRESS", ""),
		SmartAccountFactoryAddress: getEnv("SMART_ACCOUNT_FACTORY_ADDRESS", ""),
		FDCVerifierAddress:         getEnv("FDC_VERIFIER_ADDRESS", ""),
	})
	if err != nil {
		log.Println("Warning: Blockchain client initialization failed:", err)
		log.Println("Continuing without blockchain integration...")
	}

	// Initialize API handler
	handler := api.NewHandler(
		db,
		fdcClient,
		ftsoClient,
		blockchainClient,
		getEnv("AI_ENGINE_URL", "http://localhost:3001"),
	)

	// Setup Gin router
	router := setupRouter(handler)

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("🚀 FACE Backend API starting on port %s", port)
	log.Printf("📊 Dashboard: http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initDatabase() (*gorm.DB, error) {
	dbPath := getEnv("DATABASE_URL", "./data/face.db")

	// Create data directory if it doesn't exist
	os.MkdirAll("./data", 0755)

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate models
	if err := db.AutoMigrate(&models.ComplianceRecord{}); err != nil {
		return nil, err
	}

	log.Println("✅ Database initialized successfully")
	return db, nil
}

func setupRouter(handler *api.Handler) *gin.Engine {
	// Set Gin mode
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	apiV1 := router.Group("/api")
	{
		apiV1.GET("/health", handler.HealthCheck)
		apiV1.POST("/submit-asset", handler.SubmitAsset)
		apiV1.GET("/compliance/:id", handler.GetCompliance)
		apiV1.GET("/transactions", handler.GetTransactions)
		apiV1.GET("/risk-score/:asset", handler.GetRiskScore)
		apiV1.GET("/ws", handler.HandleWebSocket)
	}

	return router
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
