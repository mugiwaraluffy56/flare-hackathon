package worker

import (
	"context"
	"math/big"

	"github.com/xenora/backend/internal/blockchain"
	"github.com/xenora/backend/internal/logger"
	"github.com/xenora/backend/internal/metrics"
	"github.com/xenora/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// BlockchainSubmissionJob submits compliance records to blockchain
type BlockchainSubmissionJob struct {
	record           models.ComplianceRecord
	blockchainClient *blockchain.Client
	db               *gorm.DB
}

// NewBlockchainSubmissionJob creates a new blockchain submission job
func NewBlockchainSubmissionJob(record models.ComplianceRecord, client *blockchain.Client, db *gorm.DB) *BlockchainSubmissionJob {
	return &BlockchainSubmissionJob{
		record:           record,
		blockchainClient: client,
		db:               db,
	}
}

// Execute executes the blockchain submission job
func (j *BlockchainSubmissionJob) Execute(ctx context.Context) error {
	if j.blockchainClient == nil {
		logger.Warn("Blockchain client not initialized, skipping submission")
		return nil
	}

	amount := big.NewInt(int64(j.record.Amount * 1e18))
	price := big.NewInt(int64(j.record.AssetPrice * 1e18))
	volatility := big.NewInt(int64(j.record.Volatility * 1e18))

	txHash, err := j.blockchainClient.SubmitCompliance(
		j.record.AssetType,
		amount,
		j.record.RiskScore,
		j.record.TxHash,
		j.record.FDCVerified,
		price,
		volatility,
	)

	if err != nil {
		logger.Error("Blockchain submission failed",
			zap.Uint("record_id", j.record.ID),
			zap.Error(err),
		)
		return err
	}

	// Update record with blockchain transaction hash
	if err := j.db.Model(&j.record).Update("blockchain_id", txHash).Error; err != nil {
		logger.Error("Failed to update blockchain_id",
			zap.Uint("record_id", j.record.ID),
			zap.Error(err),
		)
		return err
	}

	logger.Info("Compliance submitted to blockchain",
		zap.Uint("record_id", j.record.ID),
		zap.String("tx_hash", txHash),
	)

	return nil
}

// Name returns the job name
func (j *BlockchainSubmissionJob) Name() string {
	return "blockchain_submission"
}

// CacheWarmupJob warms up the cache with frequently accessed data
type CacheWarmupJob struct {
	db *gorm.DB
}

// NewCacheWarmupJob creates a new cache warmup job
func NewCacheWarmupJob(db *gorm.DB) *CacheWarmupJob {
	return &CacheWarmupJob{db: db}
}

// Execute executes the cache warmup job
func (j *CacheWarmupJob) Execute(ctx context.Context) error {
	// This is a placeholder - implement actual cache warmup logic
	logger.Info("Cache warmup job executed")
	return nil
}

// Name returns the job name
func (j *CacheWarmupJob) Name() string {
	return "cache_warmup"
}

// MetricsAggregationJob aggregates metrics periodically
type MetricsAggregationJob struct {
	db *gorm.DB
}

// NewMetricsAggregationJob creates a new metrics aggregation job
func NewMetricsAggregationJob(db *gorm.DB) *MetricsAggregationJob {
	return &MetricsAggregationJob{db: db}
}

// Execute executes the metrics aggregation job
func (j *MetricsAggregationJob) Execute(ctx context.Context) error {
	// Get database stats
	sqlDB, err := j.db.DB()
	if err == nil {
		stats := sqlDB.Stats()
		metrics.SetDBConnections(stats.InUse)
	}

	logger.Debug("Metrics aggregation job executed")
	return nil
}

// Name returns the job name
func (j *MetricsAggregationJob) Name() string {
	return "metrics_aggregation"
}
