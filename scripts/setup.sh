#!/bin/bash

echo "🚀 FACE - Flare Autonomous Compliance Engine"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

# Check Go
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed${NC}"
    echo "Please install Go 1.21+ from https://golang.org/"
    exit 1
fi
echo -e "${GREEN}✓ Go installed: $(go version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install contract dependencies
echo "1️⃣ Installing smart contract dependencies..."
cd contracts
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Contract dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install contract dependencies${NC}"
    exit 1
fi
cd ..

# Install AI engine dependencies
echo ""
echo "2️⃣ Installing AI engine dependencies..."
cd ai-engine
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ AI engine dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install AI engine dependencies${NC}"
    exit 1
fi
cd ..

# Install backend dependencies
echo ""
echo "3️⃣ Installing backend dependencies..."
cd backend
go mod download
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "4️⃣ Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file - please update with your values${NC}"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
fi

if [ ! -f ai-engine/.env ]; then
    cp ai-engine/.env.example ai-engine/.env
    echo -e "${GREEN}✓ Created ai-engine/.env${NC}"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env with your Coston2 private key"
echo "2. Deploy contracts: cd contracts && npx hardhat run deployment/deploy.js --network coston2"
echo "3. Update .env with deployed contract addresses"
echo "4. Start services: ./scripts/start-all.sh"
echo ""
