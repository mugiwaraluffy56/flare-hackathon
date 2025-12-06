package worker

import (
	"context"
	"sync"
	"time"

	"github.com/xenora/backend/internal/logger"
	"go.uber.org/zap"
)

// Job represents a background job
type Job interface {
	Execute(ctx context.Context) error
	Name() string
}

// Worker represents a background worker
type Worker struct {
	id       int
	jobQueue chan Job
	quit     chan bool
	wg       *sync.WaitGroup
}

// Pool represents a worker pool
type Pool struct {
	workers   []*Worker
	jobQueue  chan Job
	wg        sync.WaitGroup
	quit      chan bool
	isRunning bool
	mu        sync.Mutex
}

// NewPool creates a new worker pool
func NewPool(numWorkers int, queueSize int) *Pool {
	jobQueue := make(chan Job, queueSize)

	pool := &Pool{
		workers:  make([]*Worker, numWorkers),
		jobQueue: jobQueue,
		quit:     make(chan bool),
	}

	for i := 0; i < numWorkers; i++ {
		worker := &Worker{
			id:       i + 1,
			jobQueue: jobQueue,
			quit:     make(chan bool),
			wg:       &pool.wg,
		}
		pool.workers[i] = worker
	}

	return pool
}

// Start starts the worker pool
func (p *Pool) Start() {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.isRunning {
		return
	}

	p.isRunning = true

	for _, worker := range p.workers {
		p.wg.Add(1)
		go worker.start()
	}

	logger.Info("Worker pool started", zap.Int("workers", len(p.workers)))
}

// Stop stops the worker pool gracefully
func (p *Pool) Stop() {
	p.mu.Lock()
	defer p.mu.Unlock()

	if !p.isRunning {
		return
	}

	logger.Info("Stopping worker pool...")

	close(p.quit)

	for _, worker := range p.workers {
		worker.quit <- true
	}

	p.wg.Wait()
	p.isRunning = false

	logger.Info("Worker pool stopped")
}

// Submit submits a job to the worker pool
func (p *Pool) Submit(job Job) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if !p.isRunning {
		logger.Warn("Worker pool not running, job not submitted", zap.String("job", job.Name()))
		return nil
	}

	select {
	case p.jobQueue <- job:
		logger.Debug("Job submitted", zap.String("job", job.Name()))
		return nil
	case <-time.After(5 * time.Second):
		logger.Warn("Job queue full, job dropped", zap.String("job", job.Name()))
		return nil
	}
}

// start starts a worker
func (w *Worker) start() {
	defer w.wg.Done()

	logger.Debug("Worker started", zap.Int("worker_id", w.id))

	for {
		select {
		case job := <-w.jobQueue:
			w.executeJob(job)
		case <-w.quit:
			logger.Debug("Worker stopped", zap.Int("worker_id", w.id))
			return
		}
	}
}

// executeJob executes a job with timeout
func (w *Worker) executeJob(job Job) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	start := time.Now()

	logger.Debug("Executing job",
		zap.Int("worker_id", w.id),
		zap.String("job", job.Name()),
	)

	if err := job.Execute(ctx); err != nil {
		logger.Error("Job execution failed",
			zap.Int("worker_id", w.id),
			zap.String("job", job.Name()),
			zap.Error(err),
		)
		return
	}

	duration := time.Since(start)
	logger.Info("Job completed",
		zap.Int("worker_id", w.id),
		zap.String("job", job.Name()),
		zap.Duration("duration", duration),
	)
}
