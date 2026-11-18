#!/bin/bash

# Smart startup script with port conflict handling
# This script will kill existing processes and ask for user confirmation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        print_warning "Killing processes on port $port: $pids"
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

# Function to kill all Node.js related processes
kill_node_processes() {
    print_status "Checking for existing Node.js processes..."
    
    # Kill npm processes
    local npm_pids=$(pgrep -f "npm" 2>/dev/null || true)
    if [ ! -z "$npm_pids" ]; then
        print_warning "Killing npm processes: $npm_pids"
        kill -9 $npm_pids 2>/dev/null || true
    fi
    
    # Kill node processes
    local node_pids=$(pgrep -f "node" 2>/dev/null || true)
    if [ ! -z "$node_pids" ]; then
        print_warning "Killing node processes: $node_pids"
        kill -9 $node_pids 2>/dev/null || true
    fi
    
    # Kill vite processes
    local vite_pids=$(pgrep -f "vite" 2>/dev/null || true)
    if [ ! -z "$vite_pids" ]; then
        print_warning "Killing vite processes: $vite_pids"
        kill -9 $vite_pids 2>/dev/null || true
    fi
    
    sleep 2
}

# Function to ask user for confirmation
ask_confirmation() {
    local message=$1
    echo -e "${YELLOW}$message${NC}"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Operation cancelled by user"
        exit 1
    fi
}

# Main script
echo "🚀 Smart Chat Simulator Startup Script"
echo "======================================"
echo

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check for existing processes
if check_port 5000 || check_port 5173; then
    print_warning "Found existing processes on ports 5000 or 5173"
    echo
    echo "What would you like to do?"
    echo "1) Kill all Node.js processes and use ports 5000/5173"
    echo "2) Find alternative ports (keep existing processes running)"
    echo "3) Cancel"
    echo
    read -p "Enter your choice (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            print_status "Killing all Node.js processes..."
            kill_node_processes
            ;;
        2)
            print_status "Looking for alternative ports..."
            # We'll handle port finding later
            USE_ALTERNATIVE_PORTS=true
            ;;
        3)
            print_error "Operation cancelled by user"
            exit 1
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    print_success "No conflicting processes found"
    USE_ALTERNATIVE_PORTS=false
fi

# Set default ports
PYTHON_PORT=5000
FRONTEND_PORT=5173

# Handle alternative port finding
if [ "$USE_ALTERNATIVE_PORTS" = true ]; then
    print_status "Finding alternative ports..."
    
    # Find alternative Python port
    for port in 5001 5002 5003 5004 5005; do
        if ! check_port $port; then
            PYTHON_PORT=$port
            print_success "Using Python port: $PYTHON_PORT"
            break
        fi
    done
    
    # Find alternative frontend port
    for port in 5174 5175 5176 5177 5178 5179 5180; do
        if ! check_port $port; then
            FRONTEND_PORT=$port
            print_success "Using Frontend port: $FRONTEND_PORT"
            break
        fi
    done
    
    if check_port $PYTHON_PORT || check_port $FRONTEND_PORT; then
        print_error "Could not find free ports. Please kill existing processes or try again later."
        exit 1
    fi
else
    # Clean up any remaining processes on default ports
    kill_port 5000
    kill_port 5173
fi

# Update configuration
print_status "Updating configuration..."
export PYTHON_PORT=$PYTHON_PORT
export FRONTEND_PORT=$FRONTEND_PORT
./update-config.sh

echo
print_status "Starting Python GIF Generator..."

# Start Python service
cd python-gif-generator

# Update docker-compose.yml with the correct port if using alternative port
if [ "$PYTHON_PORT" != "5000" ]; then
    print_status "Updating Python service to use port $PYTHON_PORT..."
    # Create a temporary docker-compose override
    cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  python-gif-generator:
    ports:
      - "$PYTHON_PORT:5000"
EOF
fi

if docker-compose ps | grep -q "python-gif-generator.*Up"; then
    print_warning "Python service is already running, restarting..."
    docker-compose restart
else
    docker-compose up -d
fi
cd ..

# Wait for Python service to be ready
print_status "Waiting for Python service to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:$PYTHON_PORT/health >/dev/null 2>&1; then
        print_success "Python service is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Python service failed to start"
        exit 1
    fi
    sleep 1
done

echo
print_status "Starting Frontend..."

# Start frontend
print_status "Installing dependencies (if needed)..."
npm install --silent

# Start frontend with dynamic port
print_status "Starting frontend on port $FRONTEND_PORT..."

# Set the port for Vite
export VITE_PORT=$FRONTEND_PORT
export PORT=$FRONTEND_PORT

npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
print_status "Waiting for frontend to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        print_success "Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Frontend failed to start"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo
echo "🎉 All services started successfully!"
echo "=================================="
echo
print_success "Python GIF Generator: http://localhost:$PYTHON_PORT"
print_success "Frontend: http://localhost:$FRONTEND_PORT"
echo
print_status "Services running:"
echo "  - Python GIF Generator (Docker) on port $PYTHON_PORT"
echo "  - Frontend (Vite) on port $FRONTEND_PORT"
echo
if [ "$USE_ALTERNATIVE_PORTS" = true ]; then
    print_warning "Note: Using alternative ports due to conflicts"
    print_warning "Make sure to update your frontend configuration if needed"
    echo
fi
print_status "To stop services, run: ./stop-services.sh"
echo "To view Python logs, run: ./view-python-logs.sh"
echo
print_warning "Press Ctrl+C to stop this script (services will continue running)"
echo

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Remove docker-compose override if it was created
    if [ -f "python-gif-generator/docker-compose.override.yml" ]; then
        rm "python-gif-generator/docker-compose.override.yml"
    fi
    
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and show status
while true; do
    sleep 10
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process died, restarting..."
        npm run dev &
        FRONTEND_PID=$!
    fi
done
