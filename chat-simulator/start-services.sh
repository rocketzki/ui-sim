#!/bin/bash

echo "🚀 Starting Chat Simulator Services (Python Only)"
echo "================================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start Python GIF Generator Service
echo "🐍 Starting Python GIF Generator Service..."
cd python-gif-generator

if check_port 5000; then
    echo "⚠️  Port 5000 is already in use. Stopping existing service..."
    docker-compose down
fi

echo "📦 Building and starting Python service..."
docker-compose up -d

# Wait for Python service to be ready
echo "⏳ Waiting for Python service to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:5000/health >/dev/null 2>&1; then
        echo "✅ Python service is ready!"
        break
    fi
    echo "   Attempt $i/30..."
    sleep 3
done

cd ..

# Start frontend
echo "🎨 Starting frontend..."
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Stopping existing service..."
    pkill -f "vite" || true
fi

echo "📦 Starting frontend..."
npm run dev &

echo ""
echo "🎉 All services started successfully!"
echo "=================================="
echo "🐍 Python GIF Service: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:5173"
echo ""
echo "📊 Health Checks:"
echo "   Python Service: curl http://localhost:5000/health"
echo "   View Python Logs: ./view-python-logs.sh"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose -f python-gif-generator/docker-compose.yml down"
echo "   pkill -f 'vite'"
echo ""
echo "ℹ️  Note: Node.js server is disabled. App connects directly to Python service."
echo ""
