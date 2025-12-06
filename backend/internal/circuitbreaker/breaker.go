package circuitbreaker

import (
	"time"

	"github.com/sony/gobreaker"
)

// Breaker wraps gobreaker.CircuitBreaker
type Breaker struct {
	*gobreaker.CircuitBreaker
}

// Settings for circuit breaker
type Settings struct {
	Name          string
	MaxRequests   uint32
	Interval      time.Duration
	Timeout       time.Duration
	ReadyToTrip   func(counts gobreaker.Counts) bool
	OnStateChange func(name string, from gobreaker.State, to gobreaker.State)
}

// New creates a new circuit breaker
func New(settings Settings) *Breaker {
	if settings.ReadyToTrip == nil {
		// Default: trip after 5 consecutive failures
		settings.ReadyToTrip = func(counts gobreaker.Counts) bool {
			failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
			return counts.Requests >= 3 && failureRatio >= 0.6
		}
	}

	if settings.OnStateChange == nil {
		settings.OnStateChange = func(name string, from gobreaker.State, to gobreaker.State) {
			// Default: no-op
		}
	}

	if settings.MaxRequests == 0 {
		settings.MaxRequests = 1
	}

	if settings.Interval == 0 {
		settings.Interval = 60 * time.Second
	}

	if settings.Timeout == 0 {
		settings.Timeout = 60 * time.Second
	}

	gbSettings := gobreaker.Settings{
		Name:          settings.Name,
		MaxRequests:   settings.MaxRequests,
		Interval:      settings.Interval,
		Timeout:       settings.Timeout,
		ReadyToTrip:   settings.ReadyToTrip,
		OnStateChange: settings.OnStateChange,
	}

	return &Breaker{
		CircuitBreaker: gobreaker.NewCircuitBreaker(gbSettings),
	}
}

// Execute runs the given function with circuit breaker protection
func (b *Breaker) Execute(fn func() (interface{}, error)) (interface{}, error) {
	return b.CircuitBreaker.Execute(fn)
}

// DefaultSettings returns default circuit breaker settings
func DefaultSettings(name string) Settings {
	return Settings{
		Name:        name,
		MaxRequests: 1,
		Interval:    60 * time.Second,
		Timeout:     60 * time.Second,
	}
}

// AggressiveSettings returns aggressive circuit breaker settings
// Trips faster, recovers slower
func AggressiveSettings(name string) Settings {
	return Settings{
		Name:        name,
		MaxRequests: 1,
		Interval:    30 * time.Second,
		Timeout:     120 * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			// Trip after 3 failures
			return counts.ConsecutiveFailures > 2
		},
	}
}

// LenientSettings returns lenient circuit breaker settings
// Trips slower, recovers faster
func LenientSettings(name string) Settings {
	return Settings{
		Name:        name,
		MaxRequests: 3,
		Interval:    120 * time.Second,
		Timeout:     30 * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			// Trip after 10 failures or 80% failure rate
			failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
			return counts.ConsecutiveFailures > 10 || (counts.Requests >= 10 && failureRatio >= 0.8)
		},
	}
}
