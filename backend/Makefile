.PHONY: help build run test clean lint fmt install dev

# Variables
BINARY_NAME=face-backend
MAIN_PATH=cmd/api/main.go
BUILD_DIR=.
GO=go
GOFLAGS=-v

# Colors
GREEN=\033[0;32m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "${GREEN}Installing dependencies...${NC}"
	$(GO) mod download
	$(GO) mod tidy
	@echo "${GREEN}✓ Dependencies installed${NC}"

build: ## Build the application
	@echo "${GREEN}Building $(BINARY_NAME)...${NC}"
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "${GREEN}✓ Build complete: $(BUILD_DIR)/$(BINARY_NAME)${NC}"

run: build ## Build and run the application
	@echo "${GREEN}Starting server...${NC}"
	./$(BUILD_DIR)/$(BINARY_NAME)

dev: ## Run in development mode with auto-reload (requires air)
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "air not found. Install with: go install github.com/cosmtrek/air@latest"; \
		echo "Running without auto-reload..."; \
		$(GO) run $(MAIN_PATH); \
	fi

test: ## Run tests
	@echo "${GREEN}Running tests...${NC}"
	$(GO) test -v -race -cover ./...

test-coverage: ## Run tests with coverage report
	@echo "${GREEN}Running tests with coverage...${NC}"
	$(GO) test -v -race -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "${GREEN}✓ Coverage report: coverage.html${NC}"

bench: ## Run benchmarks
	@echo "${GREEN}Running benchmarks...${NC}"
	$(GO) test -bench=. -benchmem ./...

lint: ## Run linter
	@echo "${GREEN}Running linter...${NC}"
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run; \
	else \
		echo "golangci-lint not found. Install from https://golangci-lint.run/usage/install/"; \
	fi

fmt: ## Format code
	@echo "${GREEN}Formatting code...${NC}"
	$(GO) fmt ./...
	@echo "${GREEN}✓ Code formatted${NC}"

vet: ## Run go vet
	@echo "${GREEN}Running go vet...${NC}"
	$(GO) vet ./...

clean: ## Clean build artifacts
	@echo "${GREEN}Cleaning...${NC}"
	rm -f $(BUILD_DIR)/$(BINARY_NAME)
	rm -f coverage.out coverage.html
	rm -rf ./data/*.db
	@echo "${GREEN}✓ Cleaned${NC}"

docker-build: ## Build Docker image
	@echo "${GREEN}Building Docker image...${NC}"
	docker build -t face-backend:latest .

docker-run: ## Run Docker container
	@echo "${GREEN}Running Docker container...${NC}"
	docker run -p 8080:8080 --env-file .env face-backend:latest

migrate: ## Run database migrations (placeholder)
	@echo "${GREEN}Running migrations...${NC}"
	@echo "Migrations not implemented yet"

seed: ## Seed database with test data (placeholder)
	@echo "${GREEN}Seeding database...${NC}"
	@echo "Seeding not implemented yet"

all: clean install lint test build ## Run all checks and build

.DEFAULT_GOAL := help
