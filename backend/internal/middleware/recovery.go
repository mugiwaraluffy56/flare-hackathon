package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/face/backend/internal/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Recovery middleware recovers from panics and logs them
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				stack := string(debug.Stack())

				fields := []zap.Field{
					zap.Any("error", err),
					zap.String("stack", stack),
					zap.String("method", c.Request.Method),
					zap.String("path", c.Request.URL.Path),
					zap.String("client_ip", c.ClientIP()),
				}

				if requestID, exists := c.Get("request_id"); exists {
					fields = append(fields, zap.String("request_id", requestID.(string)))
				}

				logger.Error("Panic recovered", fields...)

				// Return error response
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "internal_server_error",
					"message": "An unexpected error occurred. Please try again later.",
				})

				c.Abort()
			}
		}()

		c.Next()
	}
}

// SecurityHeaders adds security headers to responses
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Next()
	}
}

// Timeout middleware adds request timeout
func Timeout(timeout int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Note: Gin doesn't have built-in timeout support
		// This is a placeholder for context timeout
		c.Next()
	}
}

// ValidateContentType ensures requests have correct content type
func ValidateContentType(contentTypes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut {
			contentType := c.GetHeader("Content-Type")
			valid := false

			for _, ct := range contentTypes {
				if contentType == ct {
					valid = true
					break
				}
			}

			if !valid {
				c.JSON(http.StatusUnsupportedMediaType, gin.H{
					"error":   "invalid_content_type",
					"message": fmt.Sprintf("Content-Type must be one of: %v", contentTypes),
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
