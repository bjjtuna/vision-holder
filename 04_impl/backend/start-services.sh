#!/bin/bash

# [accelerate] Vision Holder Backend Services Startup Script
# Starts all backend APIs for the Vision Holder application

echo "🚀 Starting Vision Holder Backend Services..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local file=$3
    
    echo "🔧 Starting $service_name on port $port..."
    
    # Check if port is already in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Warning: Port $port is already in use. $service_name may not start properly."
    fi
    
    # Start the service in background
    npx ts-node-dev --respawn --transpile-only "$file" &
    local pid=$!
    
    # Wait a moment for the service to start
    sleep 2
    
    # Check if the service is running
    if kill -0 $pid 2>/dev/null; then
        echo "✅ $service_name started successfully (PID: $pid)"
        return 0
    else
        echo "❌ Failed to start $service_name"
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local port=$2
    
    echo "🏥 Checking $service_name health..."
    
    # Wait for service to be ready
    local attempts=0
    local max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            echo "✅ $service_name is healthy and responding"
            return 0
        fi
        
        attempts=$((attempts + 1))
        echo "⏳ Waiting for $service_name to be ready... (attempt $attempts/$max_attempts)"
        sleep 2
    done
    
    echo "❌ $service_name failed health check after $max_attempts attempts"
    return 1
}

# Start all services
echo "🎯 Starting all backend services..."

# Start Systemic Ledger API (Port 3001)
start_service "Systemic Ledger API" 3001 "[accelerate]-systemic-ledger-api.ts"
ledger_pid=$?

# Start AI Orchestrator API (Port 3002)
start_service "AI Orchestrator API" 3002 "[accelerate]-ai-orchestrator-api.ts"
orchestrator_pid=$?

# Start Knowledge Base API (Port 3003)
start_service "Knowledge Base API" 3003 "[accelerate]-knowledge-base-api.ts"
knowledge_pid=$?

# Start Terminal API (Port 3004)
start_service "Terminal API" 3004 "[safeguard]-terminal-api.ts"
terminal_pid=$?

# Check if all services started successfully
if [ $ledger_pid -eq 0 ] && [ $orchestrator_pid -eq 0 ] && [ $knowledge_pid -eq 0 ] && [ $terminal_pid -eq 0 ]; then
    echo ""
    echo "🎉 All services started successfully!"
    echo ""
    echo "📊 Service Status:"
    echo "   • Systemic Ledger API: http://localhost:3001"
    echo "   • AI Orchestrator API: http://localhost:3002"
    echo "   • Knowledge Base API: http://localhost:3003"
    echo "   • Terminal API: http://localhost:3004"
    echo ""
    echo "🌐 Frontend Application: http://localhost:3000"
    echo ""
    echo "📝 Logs will appear below. Press Ctrl+C to stop all services."
    echo "================================================================"
    
    # Wait for user to stop
    wait
else
    echo ""
    echo "❌ Some services failed to start. Please check the logs above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure ports 3001-3004 are not in use"
    echo "   2. Check that all dependencies are installed"
    echo "   3. Verify TypeScript files are present"
    echo "   4. Check for any syntax errors in the API files"
    echo ""
    
    # Kill any running services
    echo "🧹 Cleaning up..."
    pkill -f "ts-node-dev"
    
    exit 1
fi

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    pkill -f "ts-node-dev"
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
wait 