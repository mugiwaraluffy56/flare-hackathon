.PHONY: help compile test deploy upgrade clean

# Colors
GREEN=\033[0;32m
NC=\033[0m

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "${GREEN}Installing dependencies...${NC}"
	npm install
	@echo "${GREEN}✓ Dependencies installed${NC}"

compile: ## Compile contracts
	@echo "${GREEN}Compiling contracts...${NC}"
	npx hardhat compile
	@echo "${GREEN}✓ Contracts compiled${NC}"

test: ## Run tests
	@echo "${GREEN}Running tests...${NC}"
	npx hardhat test

test-coverage: ## Run tests with coverage
	@echo "${GREEN}Running tests with coverage...${NC}"
	npx hardhat coverage

test-gas: ## Run tests with gas reporting
	@echo "${GREEN}Running gas report...${NC}"
	REPORT_GAS=true npx hardhat test

deploy-local: compile ## Deploy to local network
	@echo "${GREEN}Deploying to local network...${NC}"
	npx hardhat run deployment/deploy-upgradeable.js --network localhost

deploy-coston2: compile ## Deploy to Coston2 testnet
	@echo "${GREEN}Deploying to Coston2...${NC}"
	npx hardhat run deployment/deploy-upgradeable.js --network coston2

upgrade-coston2: ## Upgrade contracts on Coston2
	@echo "${GREEN}Upgrading on Coston2...${NC}"
	npx hardhat run deployment/upgrade.js --network coston2

verify: ## Verify contracts on explorer
	@echo "${GREEN}Verifying contracts...${NC}"
	npx hardhat verify --network coston2 $(ADDRESS)

node: ## Start local Hardhat node
	@echo "${GREEN}Starting local node...${NC}"
	npx hardhat node

console: ## Open Hardhat console
	@echo "${GREEN}Opening console...${NC}"
	npx hardhat console --network $(NETWORK)

clean: ## Clean artifacts
	@echo "${GREEN}Cleaning...${NC}"
	npx hardhat clean
	rm -rf cache artifacts deployments upgrades
	@echo "${GREEN}✓ Cleaned${NC}"

lint: ## Run Solidity linter
	@echo "${GREEN}Linting contracts...${NC}"
	npx solhint 'contracts/**/*.sol'

format: ## Format Solidity code
	@echo "${GREEN}Formatting contracts...${NC}"
	npx prettier --write 'contracts/**/*.sol'

security: ## Run security analysis
	@echo "${GREEN}Running security analysis...${NC}"
	@if command -v slither > /dev/null; then \
		slither .; \
	else \
		echo "Slither not found. Install from https://github.com/crytic/slither"; \
	fi

all: clean install compile test ## Run all checks

.DEFAULT_GOAL := help
