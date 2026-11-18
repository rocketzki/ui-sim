# PowerShell stop script for Chat Simulator Services
# This script stops all running services

Write-Host "🛑 Stopping Chat Simulator Services" -ForegroundColor Red
Write-Host "==================================" -ForegroundColor Red

# Stop Python GIF Generator Service
Write-Host "🐍 Stopping Python GIF Generator Service..." -ForegroundColor Yellow

if (Test-Path "python-gif-generator") {
    Set-Location "python-gif-generator"
    
    # Stop Docker containers
    Write-Host "🐳 Stopping Docker containers..." -ForegroundColor Gray
    docker-compose down
    
    # Remove any orphaned containers
    docker-compose down --remove-orphans
    
    Set-Location ".."
    Write-Host "✅ Python service stopped" -ForegroundColor Green
} else {
    Write-Host "⚠️  Python service directory not found" -ForegroundColor Yellow
}

# Stop Node.js processes
Write-Host "🟢 Stopping Node.js processes..." -ForegroundColor Yellow

# Find and stop Node.js processes related to our services
$nodeProcesses = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and (
        $_.CommandLine -like "*simple-server*" -or
        $_.CommandLine -like "*tsx*" -or
        $_.CommandLine -like "*vite*" -or
        $_.CommandLine -like "*npm*"
    )
}

if ($nodeProcesses) {
    Write-Host "🔍 Found $($nodeProcesses.Count) Node.js processes to stop..." -ForegroundColor Gray
    
    foreach ($process in $nodeProcesses) {
        try {
            Write-Host "   Stopping process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force
        }
        catch {
            Write-Host "   ⚠️  Could not stop process $($process.Id): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Blue
}

# Stop any remaining Node.js processes (more aggressive)
Write-Host "🧹 Cleaning up any remaining Node.js processes..." -ForegroundColor Gray

$remainingNodeProcesses = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and 
    $_.MainWindowTitle -eq "" -and  # Background processes
    $_.CommandLine -like "*chat-simulator*"
}

if ($remainingNodeProcesses) {
    foreach ($process in $remainingNodeProcesses) {
        try {
            Write-Host "   Force stopping: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force
        }
        catch {
            Write-Host "   ⚠️  Could not force stop process $($process.Id)" -ForegroundColor Yellow
        }
    }
}

# Clean up Docker resources
Write-Host "🐳 Cleaning up Docker resources..." -ForegroundColor Yellow

# Remove unused containers
Write-Host "   Removing unused containers..." -ForegroundColor Gray
docker container prune -f | Out-Null

# Remove unused images (optional - commented out to avoid removing other images)
# Write-Host "   Removing unused images..." -ForegroundColor Gray
# docker image prune -f | Out-Null

# Remove unused volumes
Write-Host "   Removing unused volumes..." -ForegroundColor Gray
docker volume prune -f | Out-Null

Write-Host "✅ Docker cleanup completed" -ForegroundColor Green

# Check if ports are still in use
Write-Host "🔍 Checking if ports are free..." -ForegroundColor Cyan

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

$ports = @(5000, 3001, 5173)
$allPortsFree = $true

foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "⚠️  Port $port is still in use" -ForegroundColor Yellow
        $allPortsFree = $false
    } else {
        Write-Host "✅ Port $port is free" -ForegroundColor Green
    }
}

Write-Host ""
if ($allPortsFree) {
    Write-Host "🎉 All services stopped successfully!" -ForegroundColor Green
    Write-Host "All ports are now free and available for use." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services may still be running" -ForegroundColor Yellow
    Write-Host "You may need to manually stop remaining processes." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "   Python GIF Service (Port 5000): $(if (Test-Port -Port 5000) { 'Running' } else { 'Stopped' })" -ForegroundColor Gray
Write-Host "   Node.js API Server (Port 3001): $(if (Test-Port -Port 3001) { 'Running' } else { 'Stopped' })" -ForegroundColor Gray
Write-Host "   Frontend App (Port 5173): $(if (Test-Port -Port 5173) { 'Running' } else { 'Stopped' })" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 To restart services, run: .\start-services.ps1" -ForegroundColor Cyan
