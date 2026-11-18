#!/bin/bash

# Check if Python service is running
if ! curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo "❌ Python service is not running on port 5000"
    echo "   Start it with: ./start-services.sh"
    exit 1
fi

# Function to show static logs
show_static_logs() {
    echo "🐍 Python GIF Generator Logs (Static)"
    echo "===================================="
    echo ""
    echo "✅ Python service is running on port 5000"
    echo ""
    echo "📋 Recent logs (last 50 lines):"
    echo "--------------------------------"
    
    # Get logs from Docker container
    docker-compose -f python-gif-generator/docker-compose.yml logs --tail=50 python-gif-generator
    
    echo ""
    echo "🔄 To follow logs in real-time, run:"
    echo "   ./view-python-logs.sh --follow"
    echo "   or"
    echo "   ./view-python-logs.sh -f"
    echo ""
    echo "📊 To check service status:"
    echo "   curl http://localhost:5000/health"
}

# Function to show live logs
show_live_logs() {
    echo "🐍 Python GIF Generator Logs (Live)"
    echo "==================================="
    echo ""
    echo "✅ Python service is running on port 5000"
    echo ""
    echo "📋 Following logs in real-time..."
    echo "Press Ctrl+C or ESC to exit"
    echo "--------------------------------"
    
    # Follow logs from Docker container
    docker-compose -f python-gif-generator/docker-compose.yml logs -f python-gif-generator
}

# Function to show help
show_help() {
    echo "🐍 Python GIF Generator Logs Viewer"
    echo "==================================="
    echo ""
    echo "Usage:"
    echo "  ./view-python-logs.sh           # Show recent logs (static)"
    echo "  ./view-python-logs.sh --follow  # Follow logs in real-time"
    echo "  ./view-python-logs.sh -f        # Follow logs in real-time (short)"
    echo "  ./view-python-logs.sh --help   # Show this help"
    echo ""
    echo "Options:"
    echo "  --follow, -f    Follow logs in real-time"
    echo "  --help, -h      Show this help message"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --follow|-f)
        show_live_logs
        ;;
    --help|-h)
        show_help
        ;;
    "")
        show_static_logs
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
