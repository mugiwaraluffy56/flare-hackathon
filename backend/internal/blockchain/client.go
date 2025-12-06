package blockchain

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Client handles blockchain interactions
type Client struct {
	client     *ethclient.Client
	privateKey *ecdsa.PrivateKey
	chainID    *big.Int

	// Contract addresses
	complianceEngineAddr    common.Address
	smartAccountFactoryAddr common.Address
	fdcVerifierAddr         common.Address
}

// Config holds blockchain client configuration
type Config struct {
	RPCURL                     string
	PrivateKey                 string
	ComplianceEngineAddress    string
	SmartAccountFactoryAddress string
	FDCVerifierAddress         string
}

// NewClient creates a new blockchain client
func NewClient(cfg Config) (*Client, error) {
	// Connect to Ethereum client
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}

	// Get chain ID
	chainID, err := client.ChainID(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get chain ID: %w", err)
	}

	// Parse private key
	var privateKey *ecdsa.PrivateKey
	if cfg.PrivateKey != "" {
		privateKey, err = crypto.HexToECDSA(cfg.PrivateKey)
		if err != nil {
			return nil, fmt.Errorf("failed to parse private key: %w", err)
		}
	}

	return &Client{
		client:                  client,
		privateKey:              privateKey,
		chainID:                 chainID,
		complianceEngineAddr:    common.HexToAddress(cfg.ComplianceEngineAddress),
		smartAccountFactoryAddr: common.HexToAddress(cfg.SmartAccountFactoryAddress),
		fdcVerifierAddr:         common.HexToAddress(cfg.FDCVerifierAddress),
	}, nil
}

// SubmitCompliance submits a compliance record to the smart contract
func (c *Client) SubmitCompliance(
	assetType string,
	amount *big.Int,
	riskScore uint8,
	txHash string,
	fdcVerified bool,
	assetPrice *big.Int,
	volatility *big.Int,
) (string, error) {
	// For demo purposes, we'll return a simulated transaction hash
	// In production, this would interact with the actual smart contract
	// using the createTransactor() method to sign and submit the transaction

	txHashResult := fmt.Sprintf("0x%x", crypto.Keccak256([]byte(txHash)))

	return txHashResult, nil
}

// createTransactor creates a transaction signer
func (c *Client) createTransactor() (*bind.TransactOpts, error) {
	if c.privateKey == nil {
		return nil, fmt.Errorf("private key not configured")
	}

	nonce, err := c.client.PendingNonceAt(context.Background(), crypto.PubkeyToAddress(c.privateKey.PublicKey))
	if err != nil {
		return nil, fmt.Errorf("failed to get nonce: %w", err)
	}

	gasPrice, err := c.client.SuggestGasPrice(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get gas price: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, c.chainID)
	if err != nil {
		return nil, fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	return auth, nil
}

// GetComplianceRecord retrieves a compliance record from the blockchain
func (c *Client) GetComplianceRecord(recordID uint64) (map[string]interface{}, error) {
	// Simulate retrieving record
	// In production, this would call the smart contract
	record := map[string]interface{}{
		"id":        recordID,
		"status":    "APPROVED",
		"timestamp": "2024-01-01T00:00:00Z",
	}

	return record, nil
}

// Close closes the blockchain client connection
func (c *Client) Close() {
	if c.client != nil {
		c.client.Close()
	}
}
