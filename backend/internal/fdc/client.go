package fdc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/face/backend/internal/models"
)

// Client handles FDC (Flare Data Connector) interactions
type Client struct {
	apiURL     string
	httpClient *http.Client
}

// NewClient creates a new FDC client
func NewClient(apiURL string) *Client {
	return &Client{
		apiURL: apiURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// VerifyTransaction verifies an external chain transaction via FDC
func (c *Client) VerifyTransaction(req models.FDCAttestationRequest) (*models.FDCAttestationResponse, error) {
	// In production, this would call the actual FDC API
	// For demo purposes, we'll simulate the verification
	
	// Simulate API call delay
	time.Sleep(100 * time.Millisecond)
	
	// For demo: verify if tx hash is valid format (non-empty)
	verified := len(req.TxHash) > 10
	
	// Generate attestation ID
	attestationID := fmt.Sprintf("fdc_%s_%d", req.SourceChain, time.Now().Unix())
	
	response := &models.FDCAttestationResponse{
		Verified:      verified,
		AttestationID: attestationID,
		Timestamp:     time.Now(),
	}
	
	return response, nil
}

// VerifyTransactionReal would be the production implementation
func (c *Client) VerifyTransactionReal(req models.FDCAttestationRequest) (*models.FDCAttestationResponse, error) {
	// Prepare request body
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}
	
	// Make HTTP request to FDC API
	resp, err := c.httpClient.Post(
		fmt.Sprintf("%s/verify", c.apiURL),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call FDC API: %w", err)
	}
	defer resp.Body.Close()
	
	// Parse response
	var response models.FDCAttestationResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return &response, nil
}

// GetAttestationStatus retrieves the status of an attestation
func (c *Client) GetAttestationStatus(attestationID string) (bool, error) {
	// Simulate checking attestation status
	time.Sleep(50 * time.Millisecond)
	return true, nil
}
