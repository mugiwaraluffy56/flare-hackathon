package models

import (
	"time"
)

// ComplianceStatus represents the status of a compliance check
type ComplianceStatus string

const (
	StatusPending     ComplianceStatus = "PENDING"
	StatusApproved    ComplianceStatus = "APPROVED"
	StatusRejected    ComplianceStatus = "REJECTED"
	StatusUnderReview ComplianceStatus = "UNDER_REVIEW"
)

// ComplianceRecord represents a compliance check record
type ComplianceRecord struct {
	ID           uint             `json:"id" gorm:"primaryKey"`
	UserAddress  string           `json:"user_address" gorm:"index"`
	AssetType    string           `json:"asset_type"`
	Amount       float64          `json:"amount"`
	RiskScore    uint8            `json:"risk_score"`
	Status       ComplianceStatus `json:"status"`
	TxHash       string           `json:"tx_hash"`
	FDCVerified  bool             `json:"fdc_verified"`
	AssetPrice   float64          `json:"asset_price"`
	Volatility   float64          `json:"volatility"`
	BlockchainID uint             `json:"blockchain_id"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
}

// SubmitAssetRequest represents the request to submit an asset for compliance
type SubmitAssetRequest struct {
	AssetType   string  `json:"asset_type" binding:"required" validate:"required,asset_type"`
	Amount      float64 `json:"amount" binding:"required,gt=0" validate:"required,gt=0"`
	TxHash      string  `json:"tx_hash" binding:"required" validate:"required,tx_hash"`
	SourceChain string  `json:"source_chain" binding:"required" validate:"required,source_chain"`
	BlockNumber uint64  `json:"block_number" binding:"required" validate:"required"`
	UserAddress string  `json:"user_address" binding:"required" validate:"required,eth_address"`
}

// RiskAnalysisRequest represents request to AI engine
type RiskAnalysisRequest struct {
	AssetType   string  `json:"asset_type"`
	Amount      float64 `json:"amount"`
	Price       float64 `json:"price"`
	Volatility  float64 `json:"volatility"`
	FDCVerified bool    `json:"fdc_verified"`
	UserHistory int     `json:"user_history"`
}

// RiskAnalysisResponse represents response from AI engine
type RiskAnalysisResponse struct {
	RiskScore      uint8    `json:"risk_score"`
	Recommendation string   `json:"recommendation"`
	Factors        []string `json:"factors"`
}

// FTSOPriceData represents price data from FTSO
type FTSOPriceData struct {
	Symbol     string    `json:"symbol"`
	Price      float64   `json:"price"`
	Timestamp  time.Time `json:"timestamp"`
	Volatility float64   `json:"volatility"`
}

// FDCAttestationRequest represents FDC verification request
type FDCAttestationRequest struct {
	TxHash      string `json:"tx_hash"`
	SourceChain string `json:"source_chain"`
	BlockNumber uint64 `json:"block_number"`
}

// FDCAttestationResponse represents FDC verification response
type FDCAttestationResponse struct {
	Verified      bool      `json:"verified"`
	AttestationID string    `json:"attestation_id"`
	Timestamp     time.Time `json:"timestamp"`
}

// WebSocketMessage represents a real-time update message
type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
