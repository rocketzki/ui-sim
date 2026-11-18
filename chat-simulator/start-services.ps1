# PowerShell startup script for Chat Simulator Services (Python Only)
# This script starts the Python GIF Generator and frontend

Write-Host "🚀 Starting Chat Simulator Services (Python Only)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true  # Port is in use
    }
    catch {
        return $false  # Port is free
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        Write-Host "   Attempt $i/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start within timeout" -ForegroundColor Red
    return $false
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running or not installed" -ForegroundColor Red
    Write-Host "   Please install Docker Desktop and start it" -ForegroundColor Yellow
    exit 1
}


# Check if Node.js is available
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is available" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "   Please install Node.js: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Start Python GIF Generator Service
Write-Host "🐍 Starting Python GIF Generator Service..." -ForegroundColor Cyan

if (Test-Port -Port 5000) {
    Write-Host "⚠️  Port 5000 is already in use. Stopping existing service..." -ForegroundColor Yellow
    Set-Location "python-gif-generator"
    docker-compose down
    Set-Location ".."
}

Set-Location "python-gif-generator"

Write-Host "📦 Building and starting Python service..." -ForegroundColor Cyan

# Start the Python service
Write-Host "🚀 Starting Python service container..." -ForegroundColor Gray
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Python service container" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

# Wait for Python service to be ready
if (-not (Wait-ForService -Url "http://localhost:5000/health" -ServiceName "Python GIF Service")) {
    Write-Host "❌ Python service failed to start" -ForegroundColor Red
    exit 1
}

# Start frontend
Write-Host "🎨 Starting frontend..." -ForegroundColor Cyan

if (Test-Port -Port 5173) {
    Write-Host "⚠️  Port 5173 is already in use. Stopping existing service..." -ForegroundColor Yellow
    # Kill existing Vite processes
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.CommandLine -like "*vite*"} | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Gray
    npm install
}

# Start frontend in background
Write-Host "🚀 Starting frontend..." -ForegroundColor Gray
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "🐍 Python GIF Service: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🎨 Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Health Checks:" -ForegroundColor Yellow
Write-Host "   Python Service: Invoke-WebRequest http://localhost:5000/health" -ForegroundColor Gray
Write-Host "   View Python Logs: .\view-python-logs.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Yellow
Write-Host "   docker-compose -f python-gif-generator/docker-compose.yml down" -ForegroundColor Gray
Write-Host "   Get-Process | Where-Object {`$_.ProcessName -like '*node*'} | Stop-Process -Force" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Yellow
Write-Host "   Python Service: docker-compose -f python-gif-generator/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "ℹ️  Note: Node.js server is disabled. App connects directly to Python service." -ForegroundColor Cyan
Write-Host ""

# Open browser to frontend
Write-Host "🌐 Opening frontend in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
