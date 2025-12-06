#!/bin/bash

echo "🛑 Stopping FACE services..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop services
if [ -f logs/ai-engine.pid ]; then
    AI_PID=$(cat logs/ai-engine.pid)
    kill $AI_PID 2>/dev/null
    echo -e "${GREEN}✓ Stopped AI Engine (PID: $AI_PID)${NC}"
    rm logs/ai-engine.pid
fi

if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Stopped Backend (PID: $BACKEND_PID)${NC}"
    rm logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Stopped Frontend (PID: $FRONTEND_PID)${NC}"
    rm logs/frontend.pid
fi

echo ""
echo "✅ All services stopped"
