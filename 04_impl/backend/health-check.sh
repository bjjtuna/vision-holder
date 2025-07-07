#!/bin/bash

# [clarify] Vision Holder Backend Health Check Script
# Verifies all backend services are healthy and responding

echo "🏥 Vision Holder Backend Health Check"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service definitions
services=(
    "Systemic Ledger API:3001"
    "AI Orchestrator API:3002"
    "Knowledge Base API:3003"
    "Terminal API:3004"
    "Analytics API:3005"
)

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    
    echo -n "🔍 Checking $service_name (port $port)... "
    
    # Try to connect to health endpoint
    response=$(curl -s -w "%{http_code}" "http://localhost:$port/health" 2>/dev/null)
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        echo "   Response: $body"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY (HTTP $http_code)${NC}"
        return 1
    fi
}

# Function to check if port is listening
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check all services
healthy_count=0
total_services=${#services[@]}

echo ""
echo "📊 Service Health Status:"
echo "-------------------------"

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    # First check if port is listening
    if check_port $port; then
        if check_service "$name" $port; then
            ((healthy_count++))
        fi
    else
        echo -e "🔍 Checking $name (port $port)... ${RED}❌ PORT NOT LISTENING${NC}"
    fi
    
    echo ""
done

# Summary
echo "======================================"
echo "📈 Health Summary:"
echo "   Healthy Services: $healthy_count/$total_services"

if [ $healthy_count -eq $total_services ]; then
    echo -e "   Overall Status: ${GREEN}✅ ALL SERVICES HEALTHY${NC}"
    echo ""
    echo "🎉 All backend services are running and responding correctly!"
    echo "🌐 Frontend should be able to connect to all APIs."
    exit 0
else
    echo -e "   Overall Status: ${RED}❌ SOME SERVICES UNHEALTHY${NC}"
    echo ""
    echo "🔧 Troubleshooting Steps:"
    echo "   1. Check if all services are started: ./start-services.sh"
    echo "   2. Verify no port conflicts: lsof -i :3001-3005"
    echo "   3. Check service logs for errors"
    echo "   4. Ensure all dependencies are installed: npm install"
    exit 1
fi 