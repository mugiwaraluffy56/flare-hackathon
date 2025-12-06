package repository

import (
	"github.com/xenora/backend/internal/models"
	"gorm.io/gorm"
)

// ComplianceRepository handles database operations for compliance records
type ComplianceRepository struct {
	db *gorm.DB
}

// NewComplianceRepository creates a new compliance repository
func NewComplianceRepository(db *gorm.DB) *ComplianceRepository {
	return &ComplianceRepository{db: db}
}

// Create creates a new compliance record
func (r *ComplianceRepository) Create(record *models.ComplianceRecord) error {
	return r.db.Create(record).Error
}

// GetByID retrieves a compliance record by ID
func (r *ComplianceRepository) GetByID(id uint) (*models.ComplianceRecord, error) {
	var record models.ComplianceRecord
	err := r.db.First(&record, id).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetByUser retrieves compliance records for a user with pagination
func (r *ComplianceRepository) GetByUser(userAddress string, limit, offset int) ([]models.ComplianceRecord, int64, error) {
	var records []models.ComplianceRecord
	var total int64

	// Count total
	if err := r.db.Model(&models.ComplianceRecord{}).
		Where("user_address = ?", userAddress).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get records with pagination
	err := r.db.Where("user_address = ?", userAddress).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&records).Error

	return records, total, err
}

// GetAll retrieves all compliance records with pagination
func (r *ComplianceRepository) GetAll(limit, offset int) ([]models.ComplianceRecord, int64, error) {
	var records []models.ComplianceRecord
	var total int64

	// Count total
	if err := r.db.Model(&models.ComplianceRecord{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get records with pagination
	err := r.db.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&records).Error

	return records, total, err
}

// Update updates a compliance record
func (r *ComplianceRepository) Update(record *models.ComplianceRecord) error {
	return r.db.Save(record).Error
}

// Delete deletes a compliance record
func (r *ComplianceRepository) Delete(id uint) error {
	return r.db.Delete(&models.ComplianceRecord{}, id).Error
}

// GetByStatus retrieves compliance records by status
func (r *ComplianceRepository) GetByStatus(status string, limit, offset int) ([]models.ComplianceRecord, int64, error) {
	var records []models.ComplianceRecord
	var total int64

	// Count total
	if err := r.db.Model(&models.ComplianceRecord{}).
		Where("status = ?", status).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get records
	err := r.db.Where("status = ?", status).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&records).Error

	return records, total, err
}

// GetStats retrieves compliance statistics for a user
func (r *ComplianceRepository) GetStats(userAddress string) (map[string]int64, error) {
	stats := make(map[string]int64)

	// Total count
	var total int64
	r.db.Model(&models.ComplianceRecord{}).
		Where("user_address = ?", userAddress).
		Count(&total)
	stats["total"] = total

	// Count by status
	var statusCounts []struct {
		Status string
		Count  int64
	}

	r.db.Model(&models.ComplianceRecord{}).
		Select("status, count(*) as count").
		Where("user_address = ?", userAddress).
		Group("status").
		Scan(&statusCounts)

	for _, sc := range statusCounts {
		stats[sc.Status] = sc.Count
	}

	return stats, nil
}
