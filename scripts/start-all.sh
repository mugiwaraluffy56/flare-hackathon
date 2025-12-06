#!/bin/bash

echo "🚀 Starting FACE - Flare Autonomous Compliance Engine"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create logs directory
mkdir -p logs

# Start AI Engine
echo -e "${GREEN}Starting AI Engine...${NC}"
cd ai-engine
npm start > ../logs/ai-engine.log 2>&1 &
AI_PID=$!
echo "AI Engine PID: $AI_PID"
cd ..

# Wait for AI engine to start
sleep 2

# Start Backend
echo -e "${GREEN}Starting Backend API...${NC}"
cd backend
go run cmd/api/main.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8080"
echo "  AI Engine: http://localhost:3001"
echo ""
echo "📝 Logs:"
echo "  AI Engine: logs/ai-engine.log"
echo "  Backend:   logs/backend.log"
echo "  Frontend:  logs/frontend.log"
echo ""
echo "🛑 To stop all services, run: ./scripts/stop-all.sh"
echo ""

# Save PIDs
echo $AI_PID > logs/ai-engine.pid
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid
