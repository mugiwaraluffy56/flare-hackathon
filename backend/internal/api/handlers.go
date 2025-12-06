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

	"github.com/face/backend/internal/blockchain"
	"github.com/face/backend/internal/fdc"
	"github.com/face/backend/internal/ftso"
	"github.com/face/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

// Handler contains all API handlers
type Handler struct {
	db               *gorm.DB
	fdcClient        *fdc.Client
	ftsoClient       *ftso.Client
	blockchainClient *blockchain.Client
	aiEngineURL      string
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
) *Handler {
	return &Handler{
		db:               db,
		fdcClient:        fdcClient,
		ftsoClient:       ftsoClient,
		blockchainClient: blockchainClient,
		aiEngineURL:      aiEngineURL,
		wsClients:        make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for demo
			},
		},
	}
}

// SubmitAsset handles asset submission for compliance check
func (h *Handler) SubmitAsset(c *gin.Context) {
	var req models.SubmitAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Step 1: Verify transaction via FDC
	fdcReq := models.FDCAttestationRequest{
		TxHash:      req.TxHash,
		SourceChain: req.SourceChain,
		BlockNumber: req.BlockNumber,
	}

	fdcResp, err := h.fdcClient.VerifyTransaction(fdcReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "FDC verification failed"})
		return
	}

	// Step 2: Get price and volatility from FTSO
	priceData, err := h.ftsoClient.GetPrice(req.AssetType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Risk analysis failed"})
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

	if err := h.db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save record"})
		return
	}

	// Step 7: Submit to blockchain (async)
	go h.submitToBlockchain(record)

	// Step 8: Broadcast to WebSocket clients
	h.broadcastUpdate("compliance_submitted", record)

	c.JSON(http.StatusOK, gin.H{
		"id":             record.ID,
		"status":         record.Status,
		"risk_score":     record.RiskScore,
		"recommendation": riskResp.Recommendation,
		"fdc_verified":   fdcResp.Verified,
		"asset_price":    priceData.Price,
		"volatility":     priceData.Volatility,
	})
}

// GetCompliance retrieves a compliance record by ID
func (h *Handler) GetCompliance(c *gin.Context) {
	id := c.Param("id")

	var record models.ComplianceRecord
	if err := h.db.First(&record, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, record)
}

// GetTransactions retrieves transaction history
func (h *Handler) GetTransactions(c *gin.Context) {
	userAddress := c.Query("user")
	limit := 50

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	var records []models.ComplianceRecord
	query := h.db.Order("created_at DESC").Limit(limit)

	if userAddress != "" {
		query = query.Where("user_address = ?", userAddress)
	}

	if err := query.Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, records)
}

// GetRiskScore retrieves risk score for an asset
func (h *Handler) GetRiskScore(c *gin.Context) {
	asset := c.Param("asset")

	priceData, err := h.ftsoClient.GetPrice(asset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"asset":      asset,
		"price":      priceData.Price,
		"volatility": priceData.Volatility,
		"timestamp":  priceData.Timestamp,
	})
}

// HandleWebSocket handles WebSocket connections
func (h *Handler) HandleWebSocket(c *gin.Context) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	h.wsClientsMutex.Lock()
	h.wsClients[conn] = true
	h.wsClientsMutex.Unlock()

	defer func() {
		h.wsClientsMutex.Lock()
		delete(h.wsClients, conn)
		h.wsClientsMutex.Unlock()
		conn.Close()
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

	if err == nil {
		h.db.Model(&record).Update("blockchain_id", txHash)
	}
}

func (h *Handler) broadcastUpdate(msgType string, payload interface{}) {
	message := models.WebSocketMessage{
		Type:    msgType,
		Payload: payload,
	}

	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.wsClientsMutex.RLock()
	defer h.wsClientsMutex.RUnlock()

	for client := range h.wsClients {
		client.WriteMessage(websocket.TextMessage, data)
	}
}

// HealthCheck returns API health status
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now(),
	})
}
