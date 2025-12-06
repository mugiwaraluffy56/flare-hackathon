package ftso

import (
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/xenora/backend/internal/models"
)

// Client handles FTSO (Flare Time Series Oracle) interactions
type Client struct {
	apiURL     string
	httpClient *http.Client
	priceCache map[string]*models.FTSOPriceData
}

// NewClient creates a new FTSO client
func NewClient(apiURL string) *Client {
	return &Client{
		apiURL: apiURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		priceCache: make(map[string]*models.FTSOPriceData),
	}
}

// GetPrice fetches the current price for an asset from FTSO
func (c *Client) GetPrice(symbol string) (*models.FTSOPriceData, error) {
	// For demo purposes, we'll simulate FTSO price feeds
	// In production, this would call the actual FTSO API
	
	price := c.simulatePrice(symbol)
	volatility := c.calculateVolatility(symbol)
	
	priceData := &models.FTSOPriceData{
		Symbol:     symbol,
		Price:      price,
		Timestamp:  time.Now(),
		Volatility: volatility,
	}
	
	// Cache the price
	c.priceCache[symbol] = priceData
	
	return priceData, nil
}

// simulatePrice generates realistic price data for demo
func (c *Client) simulatePrice(symbol string) float64 {
	// Base prices for common assets
	basePrices := map[string]float64{
		"BTC":  43000.0,
		"ETH":  2300.0,
		"XRP":  0.62,
		"FLR":  0.035,
		"USDT": 1.0,
		"USDC": 1.0,
	}
	
	basePrice, exists := basePrices[symbol]
	if !exists {
		basePrice = 100.0 // Default for unknown assets
	}
	
	// Add small random variation (±2%)
	variation := (rand.Float64() - 0.5) * 0.04
	return basePrice * (1 + variation)
}

// calculateVolatility calculates price volatility
func (c *Client) calculateVolatility(symbol string) float64 {
	// Simulate volatility based on asset type
	volatilityMap := map[string]float64{
		"BTC":  0.15, // 15% volatility
		"ETH":  0.18,
		"XRP":  0.25,
		"FLR":  0.30,
		"USDT": 0.01, // Stablecoins have low volatility
		"USDC": 0.01,
	}
	
	volatility, exists := volatilityMap[symbol]
	if !exists {
		volatility = 0.20 // Default 20%
	}
	
	// Add small random variation
	variation := (rand.Float64() - 0.5) * 0.05
	return math.Max(0.01, volatility*(1+variation))
}

// GetPriceReal would be the production implementation
func (c *Client) GetPriceReal(symbol string) (*models.FTSOPriceData, error) {
	// Make HTTP request to FTSO API
	resp, err := c.httpClient.Get(
		fmt.Sprintf("%s/price/%s", c.apiURL, symbol),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call FTSO API: %w", err)
	}
	defer resp.Body.Close()
	
	// Parse response
	var priceData models.FTSOPriceData
	if err := json.NewDecoder(resp.Body).Decode(&priceData); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return &priceData, nil
}

// GetHistoricalPrices fetches historical price data
func (c *Client) GetHistoricalPrices(symbol string, duration time.Duration) ([]models.FTSOPriceData, error) {
	// Simulate historical data
	var prices []models.FTSOPriceData
	intervals := 10
	
	for i := 0; i < intervals; i++ {
		price := c.simulatePrice(symbol)
		prices = append(prices, models.FTSOPriceData{
			Symbol:     symbol,
			Price:      price,
			Timestamp:  time.Now().Add(-duration + time.Duration(i)*duration/time.Duration(intervals)),
			Volatility: c.calculateVolatility(symbol),
		})
	}
	
	return prices, nil
}
