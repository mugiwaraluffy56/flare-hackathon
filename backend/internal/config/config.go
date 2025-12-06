package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	// Server
	Port    string
	GinMode string
	Env     string

	// Database
	DatabaseURL string

	// Blockchain
	Coston2RPCURL              string
	PrivateKey                 string
	ComplianceEngineAddress    string
	SmartAccountFactoryAddress string
	FDCVerifierAddress         string

	// External Services
	FDCAPIUrl   string
	FTSOAPIUrl  string
	AIEngineURL string

	// Rate Limiting
	RateLimitEnabled bool
	RateLimitRPS     float64
	RateLimitBurst   int

	// Cache
	CacheEnabled bool
	CacheTTL     int // seconds

	// Logging
	LogLevel string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file (optional)
	_ = godotenv.Load()

	cfg := &Config{
		// Server
		Port:    getEnv("PORT", "8080"),
		GinMode: getEnv("GIN_MODE", "debug"),
		Env:     getEnv("ENV", "development"),

		// Database
		DatabaseURL: getEnv("DATABASE_URL", "./data/face.db"),

		// Blockchain
		Coston2RPCURL:              getEnv("COSTON2_RPC_URL", "https://coston2-api.flare.network/ext/C/rpc"),
		PrivateKey:                 getEnv("PRIVATE_KEY", ""),
		ComplianceEngineAddress:    getEnv("COMPLIANCE_ENGINE_ADDRESS", ""),
		SmartAccountFactoryAddress: getEnv("SMART_ACCOUNT_FACTORY_ADDRESS", ""),
		FDCVerifierAddress:         getEnv("FDC_VERIFIER_ADDRESS", ""),

		// External Services
		FDCAPIUrl:   getEnv("FDC_API_URL", "https://fdc-api.flare.network"),
		FTSOAPIUrl:  getEnv("FTSO_API_URL", "https://ftso-api.flare.network"),
		AIEngineURL: getEnv("AI_ENGINE_URL", "http://localhost:3001"),

		// Rate Limiting
		RateLimitEnabled: getEnvBool("RATE_LIMIT_ENABLED", true),
		RateLimitRPS:     getEnvFloat("RATE_LIMIT_RPS", 10.0),
		RateLimitBurst:   getEnvInt("RATE_LIMIT_BURST", 20),

		// Cache
		CacheEnabled: getEnvBool("CACHE_ENABLED", true),
		CacheTTL:     getEnvInt("CACHE_TTL", 300), // 5 minutes

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}

	return cfg, cfg.Validate()
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.Port == "" {
		return fmt.Errorf("PORT is required")
	}

	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	// Warn if blockchain config is missing
	if c.ComplianceEngineAddress == "" {
		fmt.Println("⚠️  Warning: COMPLIANCE_ENGINE_ADDRESS not set")
	}

	return nil
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Env == "development" || c.Env == "dev"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Env == "production" || c.Env == "prod"
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
