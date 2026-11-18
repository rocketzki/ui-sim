n#!/bin/bash

# Chat Simulator Startup Script

echo "🚀 Starting Chat Simulator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Check if Redis is running (optional)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. The app will use in-memory queue (less reliable)"
        echo "   To install Redis: https://redis.io/docs/getting-started/installation/"
    fi
else
    echo "⚠️  Redis not found. The app will use in-memory queue (less reliable)"
fi

# Start the application
echo "🎬 Starting Chat Simulator..."
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

npm run dev:all
