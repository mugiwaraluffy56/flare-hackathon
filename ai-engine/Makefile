.PHONY: help install run test clean docker-build docker-run

# Colors
GREEN=\033[0;32m
NC=\033[0m

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "${GREEN}Installing dependencies...${NC}"
	pip install -r requirements.txt
	@echo "${GREEN}✓ Dependencies installed${NC}"

run: ## Run the application
	@echo "${GREEN}Starting AI engine...${NC}"
	uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload

run-prod: ## Run in production mode
	@echo "${GREEN}Starting AI engine (production)...${NC}"
	uvicorn app.main:app --host 0.0.0.0 --port 3001 --workers 4

test: ## Run tests
	@echo "${GREEN}Running tests...${NC}"
	pytest tests/ -v

test-cov: ## Run tests with coverage
	@echo "${GREEN}Running tests with coverage...${NC}"
	pytest tests/ -v --cov=app --cov-report=html
	@echo "${GREEN}✓ Coverage report: htmlcov/index.html${NC}"

lint: ## Run linters
	@echo "${GREEN}Running linters...${NC}"
	black app/ tests/
	flake8 app/ tests/
	mypy app/

format: ## Format code
	@echo "${GREEN}Formatting code...${NC}"
	black app/ tests/
	isort app/ tests/
	@echo "${GREEN}✓ Code formatted${NC}"

docker-build: ## Build Docker image
	@echo "${GREEN}Building Docker image...${NC}"
	docker build -t face-ai-engine:latest .
	@echo "${GREEN}✓ Docker image built${NC}"

docker-run: ## Run Docker container
	@echo "${GREEN}Running Docker container...${NC}"
	docker run -p 3001:3001 --env-file .env face-ai-engine:latest

clean: ## Clean cache and logs
	@echo "${GREEN}Cleaning...${NC}"
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache htmlcov .coverage
	rm -rf logs/*.log
	@echo "${GREEN}✓ Cleaned${NC}"

.DEFAULT_GOAL := help
