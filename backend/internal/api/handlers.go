package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/xenora/backend/internal/blockchain"
	"github.com/xenora/backend/internal/cache"
	"github.com/xenora/backend/internal/circuitbreaker"
	"github.com/xenora/backend/internal/fdc"
	"github.com/xenora/backend/internal/ftso"
	"github.com/xenora/backend/internal/logger"
	"github.com/xenora/backend/internal/models"
	"github.com/xenora/backend/internal/repository"
	"github.com/xenora/backend/internal/worker"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Handler contains all API handlers
type Handler struct {
	db               *gorm.DB
	fdcClient        *fdc.Client
	ftsoClient       *ftso.Client
	blockchainClient *blockchain.Client
	aiEngineURL      string
	repo             *repository.ComplianceRepository
	cache            cache.Cache
	workerPool       *worker.Pool
	fdcBreaker       *circuitbreaker.Breaker
	ftsoBreaker      *circuitbreaker.Breaker
	aiBreaker        *circuitbreaker.Breaker
	wsClients        map[*websocket.Conn]bool
	wsClientsMutex   sync.RWMutex
	upgrader         websocket.Upgrader
}

// NewHandler creates a new API handler
func NewHandler(
	db *gorm.DB,
	fdcClient *fdc.Client,
	ftsoClient *ftso.Client,
	blockchainClient *blockchain.Client,
	aiEngineURL string,
	repo *repository.ComplianceRepository,
	cache cache.Cache,
	workerPool *worker.Pool,
	fdcBreaker *circuitbreaker.Breaker,
	ftsoBreaker *circuitbreaker.Breaker,
	aiBreaker *circuitbreaker.Breaker,
) *Handler {
	return &Handler{
		db:               db,
		fdcClient:        fdcClient,
		ftsoClient:       ftsoClient,
		blockchainClient: blockchainClient,
		aiEngineURL:      aiEngineURL,
		repo:             repo,
		cache:            cache,
		workerPool:       workerPool,
		fdcBreaker:       fdcBreaker,
		ftsoBreaker:      ftsoBreaker,
		aiBreaker:        aiBreaker,
		wsClients:        make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for demo
			},
		},
	}
}

// HealthCheck returns API health status
func (h *Handler) HealthCheck(c *gin.Context) {
	// Check database connection
	sqlDB, err := h.db.DB()
	dbHealthy := err == nil && sqlDB.Ping() == nil

	health := gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"version":   "2.0.0",
		"services": gin.H{
			"database":   dbHealthy,
			"fdc":        h.fdcClient != nil,
			"ftso":       h.ftsoClient != nil,
			"blockchain": h.blockchainClient != nil,
			"cache":      h.cache != nil,
		},
	}

	if !dbHealthy {
		health["status"] = "degraded"
	}

	Success(c, health)
}

// SubmitAsset handles asset submission for compliance check
func (h *Handler) SubmitAsset(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())

	var req models.SubmitAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Warn("Invalid request", zap.Error(err))
		ValidationError(c, "Invalid request payload", err.Error())
		return
	}

	log.Info("Processing asset submission",
		zap.String("asset", req.AssetType),
		zap.Float64("amount", req.Amount),
		zap.String("user", req.UserAddress),
	)

	// Step 1: Verify transaction via FDC
	fdcReq := models.FDCAttestationRequest{
		TxHash:      req.TxHash,
		SourceChain: req.SourceChain,
		BlockNumber: req.BlockNumber,
	}

	fdcResp, err := h.fdcClient.VerifyTransaction(fdcReq)
	if err != nil {
		log.Error("FDC verification failed", zap.Error(err))
		InternalServerError(c, "FDC verification failed")
		return
	}

	// Step 2: Get price and volatility from FTSO
	priceData, err := h.ftsoClient.GetPrice(req.AssetType)
	if err != nil {
		log.Error("Failed to fetch price", zap.Error(err))
		InternalServerError(c, "Failed to fetch asset price")
		return
	}

	// Step 3: Get user history
	var userHistory int64
	h.db.Model(&models.ComplianceRecord{}).
		Where("user_address = ?", req.UserAddress).
		Count(&userHistory)

	// Step 4: Call AI engine for risk assessment
	riskReq := models.RiskAnalysisRequest{
		AssetType:   req.AssetType,
		Amount:      req.Amount,
		Price:       priceData.Price,
		Volatility:  priceData.Volatility,
		FDCVerified: fdcResp.Verified,
		UserHistory: int(userHistory),
	}

	riskResp, err := h.callAIEngine(riskReq)
	if err != nil {
		log.Error("Risk analysis failed", zap.Error(err))
		InternalServerError(c, "Risk analysis failed")
		return
	}

	// Step 5: Determine status
	status := h.determineStatus(riskResp.RiskScore, fdcResp.Verified)

	// Step 6: Create compliance record in database
	record := models.ComplianceRecord{
		UserAddress: req.UserAddress,
		AssetType:   req.AssetType,
		Amount:      req.Amount,
		RiskScore:   riskResp.RiskScore,
		Status:      status,
		TxHash:      req.TxHash,
		FDCVerified: fdcResp.Verified,
		AssetPrice:  priceData.Price,
		Volatility:  priceData.Volatility,
	}

	if err := h.repo.Create(&record); err != nil {
		log.Error("Failed to save record", zap.Error(err))
		InternalServerError(c, "Failed to save compliance record")
		return
	}

	log.Info("Compliance record created",
		zap.Uint("id", record.ID),
		zap.String("status", string(status)),
		zap.Uint8("risk_score", riskResp.RiskScore),
	)

	// Step 7: Submit to blockchain (async)
	go h.submitToBlockchain(record)

	// Step 8: Broadcast to WebSocket clients
	h.broadcastUpdate("compliance_submitted", record)

	// Return success response
	Created(c, gin.H{
		"id":             record.ID,
		"status":         record.Status,
		"risk_score":     record.RiskScore,
		"recommendation": riskResp.Recommendation,
		"fdc_verified":   fdcResp.Verified,
		"asset_price":    priceData.Price,
		"volatility":     priceData.Volatility,
		"created_at":     record.CreatedAt,
	})
}

// GetCompliance retrieves a compliance record by ID
func (h *Handler) GetCompliance(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())
	idStr := c.Param("id")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ValidationError(c, "Invalid ID format")
		return
	}

	// Check cache first
	cacheKey := fmt.Sprintf("compliance:%d", id)
	if h.cache != nil {
		if cached, found := h.cache.Get(cacheKey); found {
			log.Debug("Cache hit", zap.String("key", cacheKey))
			Success(c, cached)
			return
		}
	}

	record, err := h.repo.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			NotFound(c, "Compliance record not found")
			return
		}
		log.Error("Database error", zap.Error(err))
		InternalServerError(c, "Failed to retrieve record")
		return
	}

	// Cache the result
	if h.cache != nil {
		h.cache.Set(cacheKey, record, 5*time.Minute)
	}

	Success(c, record)
}

// GetTransactions retrieves transaction history with pagination
func (h *Handler) GetTransactions(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())

	userAddress := c.Query("user")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	offset := (page - 1) * perPage

	var records []models.ComplianceRecord
	var total int64
	var err error

	if userAddress != "" {
		records, total, err = h.repo.GetByUser(userAddress, perPage, offset)
	} else {
		records, total, err = h.repo.GetAll(perPage, offset)
	}

	if err != nil {
		log.Error("Failed to fetch transactions", zap.Error(err))
		InternalServerError(c, "Failed to retrieve transactions")
		return
	}

	meta := CalculatePagination(page, perPage, int(total))
	SuccessWithMeta(c, records, meta)
}

// GetStats retrieves compliance statistics
func (h *Handler) GetStats(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())
	userAddress := c.Query("user")

	if userAddress == "" {
		BadRequest(c, "User address is required")
		return
	}

	stats, err := h.repo.GetStats(userAddress)
	if err != nil {
		log.Error("Failed to fetch stats", zap.Error(err))
		InternalServerError(c, "Failed to retrieve statistics")
		return
	}

	Success(c, stats)
}

// GetRiskScore retrieves risk score for an asset
func (h *Handler) GetRiskScore(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())
	asset := c.Param("asset")

	// Check cache
	cacheKey := fmt.Sprintf("price:%s", asset)
	if h.cache != nil {
		if cached, found := h.cache.Get(cacheKey); found {
			log.Debug("Price cache hit", zap.String("asset", asset))
			Success(c, cached)
			return
		}
	}

	priceData, err := h.ftsoClient.GetPrice(asset)
	if err != nil {
		log.Error("Failed to fetch price", zap.Error(err), zap.String("asset", asset))
		InternalServerError(c, "Failed to fetch price data")
		return
	}

	result := gin.H{
		"asset":      asset,
		"price":      priceData.Price,
		"volatility": priceData.Volatility,
		"timestamp":  priceData.Timestamp,
	}

	// Cache for 1 minute
	if h.cache != nil {
		h.cache.Set(cacheKey, result, 1*time.Minute)
	}

	Success(c, result)
}

// HandleWebSocket handles WebSocket connections
func (h *Handler) HandleWebSocket(c *gin.Context) {
	log := logger.FromContext(c.Request.Context())

	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Error("WebSocket upgrade failed", zap.Error(err))
		return
	}

	h.wsClientsMutex.Lock()
	h.wsClients[conn] = true
	clientCount := len(h.wsClients)
	h.wsClientsMutex.Unlock()

	log.Info("WebSocket client connected", zap.Int("total_clients", clientCount))

	defer func() {
		h.wsClientsMutex.Lock()
		delete(h.wsClients, conn)
		h.wsClientsMutex.Unlock()
		conn.Close()
		log.Info("WebSocket client disconnected")
	}()

	// Keep connection alive
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

// Helper functions

func (h *Handler) callAIEngine(req models.RiskAnalysisRequest) (*models.RiskAnalysisResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(
		fmt.Sprintf("%s/analyze", h.aiEngineURL),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var riskResp models.RiskAnalysisResponse
	if err := json.NewDecoder(resp.Body).Decode(&riskResp); err != nil {
		return nil, err
	}

	return &riskResp, nil
}

func (h *Handler) determineStatus(riskScore uint8, fdcVerified bool) models.ComplianceStatus {
	if !fdcVerified {
		return models.StatusRejected
	}

	if riskScore < 30 {
		return models.StatusApproved
	}

	if riskScore >= 85 {
		return models.StatusRejected
	}

	return models.StatusUnderReview
}

func (h *Handler) submitToBlockchain(record models.ComplianceRecord) {
	log := logger.Get()

	if h.blockchainClient == nil {
		log.Warn("Blockchain client not initialized, skipping on-chain submission")
		return
	}

	amount := big.NewInt(int64(record.Amount * 1e18))
	price := big.NewInt(int64(record.AssetPrice * 1e18))
	volatility := big.NewInt(int64(record.Volatility * 1e18))

	txHash, err := h.blockchainClient.SubmitCompliance(
		record.AssetType,
		amount,
		record.RiskScore,
		record.TxHash,
		record.FDCVerified,
		price,
		volatility,
	)

	if err != nil {
		log.Error("Blockchain submission failed",
			zap.Error(err),
			zap.Uint("record_id", record.ID),
		)
		return
	}

	// Update record with blockchain transaction hash
	h.db.Model(&record).Update("blockchain_id", txHash)
	log.Info("Compliance submitted to blockchain",
		zap.Uint("record_id", record.ID),
		zap.String("tx_hash", txHash),
	)
}

func (h *Handler) broadcastUpdate(msgType string, payload interface{}) {
	message := models.WebSocketMessage{
		Type:    msgType,
		Payload: payload,
	}

	data, err := json.Marshal(message)
	if err != nil {
		logger.Error("Failed to marshal WebSocket message", zap.Error(err))
		return
	}

	h.wsClientsMutex.RLock()
	defer h.wsClientsMutex.RUnlock()

	for client := range h.wsClients {
		if err := client.WriteMessage(websocket.TextMessage, data); err != nil {
			logger.Warn("Failed to send WebSocket message", zap.Error(err))
		}
	}

	logger.Debug("Broadcast update sent",
		zap.String("type", msgType),
		zap.Int("clients", len(h.wsClients)),
	)
}
