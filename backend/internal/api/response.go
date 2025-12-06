package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response is the standard API response format
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
	Meta    *MetaInfo   `json:"meta,omitempty"`
}

// ErrorInfo contains error details
type ErrorInfo struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// MetaInfo contains pagination and other metadata
type MetaInfo struct {
	Page       int `json:"page,omitempty"`
	PerPage    int `json:"per_page,omitempty"`
	Total      int `json:"total,omitempty"`
	TotalPages int `json:"total_pages,omitempty"`
}

// Error codes
const (
	ErrCodeBadRequest         = "bad_request"
	ErrCodeUnauthorized       = "unauthorized"
	ErrCodeForbidden          = "forbidden"
	ErrCodeNotFound           = "not_found"
	ErrCodeConflict           = "conflict"
	ErrCodeValidation         = "validation_error"
	ErrCodeInternalServer     = "internal_server_error"
	ErrCodeServiceUnavailable = "service_unavailable"
	ErrCodeRateLimitExceeded  = "rate_limit_exceeded"
	ErrCodeInvalidContentType = "invalid_content_type"
)

// Success sends a successful response
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMeta sends a successful response with metadata
func SuccessWithMeta(c *gin.Context, data interface{}, meta *MetaInfo) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

// Created sends a 201 Created response
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

// NoContent sends a 204 No Content response
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// BadRequest sends a 400 Bad Request error
func BadRequest(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusBadRequest, ErrCodeBadRequest, message, details...)
}

// Unauthorized sends a 401 Unauthorized error
func Unauthorized(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusUnauthorized, ErrCodeUnauthorized, message, details...)
}

// Forbidden sends a 403 Forbidden error
func Forbidden(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusForbidden, ErrCodeForbidden, message, details...)
}

// NotFound sends a 404 Not Found error
func NotFound(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusNotFound, ErrCodeNotFound, message, details...)
}

// Conflict sends a 409 Conflict error
func Conflict(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusConflict, ErrCodeConflict, message, details...)
}

// ValidationError sends a 422 Validation Error
func ValidationError(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusUnprocessableEntity, ErrCodeValidation, message, details...)
}

// InternalServerError sends a 500 Internal Server Error
func InternalServerError(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusInternalServerError, ErrCodeInternalServer, message, details...)
}

// ServiceUnavailable sends a 503 Service Unavailable error
func ServiceUnavailable(c *gin.Context, message string, details ...interface{}) {
	sendError(c, http.StatusServiceUnavailable, ErrCodeServiceUnavailable, message, details...)
}

// sendError is a helper to send error responses
func sendError(c *gin.Context, status int, code, message string, details ...interface{}) {
	errorInfo := &ErrorInfo{
		Code:    code,
		Message: message,
	}

	if len(details) > 0 {
		errorInfo.Details = details[0]
	}

	c.JSON(status, Response{
		Success: false,
		Error:   errorInfo,
	})
}

// CalculatePagination calculates pagination metadata
func CalculatePagination(page, perPage, total int) *MetaInfo {
	totalPages := (total + perPage - 1) / perPage
	if totalPages < 1 {
		totalPages = 1
	}

	return &MetaInfo{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}
}
