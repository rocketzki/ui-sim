# PowerShell health check script for Chat Simulator Services
# This script checks the status of all services

Write-Host "🏥 Chat Simulator Services Health Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to test a service endpoint
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [string]$Port
    )
    
    Write-Host "🔍 Checking $ServiceName..." -ForegroundColor Yellow
    
    # Check if port is open
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        $portOpen = $true
    }
    catch {
        $portOpen = $false
    }
    
    if (-not $portOpen) {
        Write-Host "❌ $ServiceName - Port $Port is not open" -ForegroundColor Red
        return $false
    }
    
    # Check HTTP endpoint
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $responseData = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
            Write-Host "✅ $ServiceName - Healthy" -ForegroundColor Green
            
            if ($responseData) {
                Write-Host "   Status: $($responseData.status)" -ForegroundColor Gray
                if ($responseData.service) {
                    Write-Host "   Service: $($responseData.service)" -ForegroundColor Gray
                }
                if ($responseData.version) {
                    Write-Host "   Version: $($responseData.version)" -ForegroundColor Gray
                }
            }
            return $true
        } else {
            Write-Host "⚠️  $ServiceName - HTTP $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ $ServiceName - HTTP request failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check Java GIF Generator Service
$javaHealthy = Test-ServiceHealth -ServiceName "Java GIF Service" -Url "http://localhost:8080/health" -Port 8080

Write-Host ""

# Check Node.js API Server
$nodeHealthy = Test-ServiceHealth -ServiceName "Node.js API Server" -Url "http://localhost:3001/health" -Port 3001

Write-Host ""

# Check Frontend (different approach since it doesn't have a health endpoint)
Write-Host "🔍 Checking Frontend App..." -ForegroundColor Yellow

try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 5173)
    $connection.Close()
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend App - Healthy" -ForegroundColor Green
            Write-Host "   Status: Serving frontend" -ForegroundColor Gray
            $frontendHealthy = $true
        } else {
            Write-Host "⚠️  Frontend App - HTTP $($response.StatusCode)" -ForegroundColor Yellow
            $frontendHealthy = $false
        }
    }
    catch {
        Write-Host "❌ Frontend App - HTTP request failed: $($_.Exception.Message)" -ForegroundColor Red
        $frontendHealthy = $false
    }
}
catch {
    Write-Host "❌ Frontend App - Port 5173 is not open" -ForegroundColor Red
    $frontendHealthy = $false
}

Write-Host ""

# Check Docker containers
Write-Host "🐳 Checking Docker containers..." -ForegroundColor Yellow

try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Out-String
    
    if ($containers -like "*java-gif-generator*") {
        Write-Host "✅ Java GIF Generator container is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Java GIF Generator container is not running" -ForegroundColor Red
    }
    
    Write-Host "   Container Status:" -ForegroundColor Gray
    Write-Host $containers -ForegroundColor Gray
}
catch {
    Write-Host "❌ Could not check Docker containers: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "📊 Health Check Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$healthyServices = 0
$totalServices = 3

if ($javaHealthy) { $healthyServices++ }
if ($nodeHealthy) { $healthyServices++ }
if ($frontendHealthy) { $healthyServices++ }

Write-Host "Java GIF Service: $(if ($javaHealthy) { '✅ Healthy' } else { '❌ Unhealthy' })" -ForegroundColor $(if ($javaHealthy) { 'Green' } else { 'Red' })
Write-Host "Node.js API Server: $(if ($nodeHealthy) { '✅ Healthy' } else { '❌ Unhealthy' })" -ForegroundColor $(if ($nodeHealthy) { 'Green' } else { 'Red' })
Write-Host "Frontend App: $(if ($frontendHealthy) { '✅ Healthy' } else { '❌ Unhealthy' })" -ForegroundColor $(if ($frontendHealthy) { 'Green' } else { 'Red' })

Write-Host ""
Write-Host "Overall Status: $healthyServices/$totalServices services healthy" -ForegroundColor $(if ($healthyServices -eq $totalServices) { 'Green' } elseif ($healthyServices -gt 0) { 'Yellow' } else { 'Red' })

if ($healthyServices -eq $totalServices) {
    Write-Host "🎉 All services are running correctly!" -ForegroundColor Green
    Write-Host "You can access the application at: http://localhost:5173" -ForegroundColor Cyan
} elseif ($healthyServices -gt 0) {
    Write-Host "⚠️  Some services are not running properly" -ForegroundColor Yellow
    Write-Host "Consider restarting services with: .\start-services.ps1" -ForegroundColor Yellow
} else {
    Write-Host "❌ No services are running" -ForegroundColor Red
    Write-Host "Start services with: .\start-services.ps1" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
Write-Host "   Start services: .\start-services.ps1" -ForegroundColor Gray
Write-Host "   Stop services: .\stop-services.ps1" -ForegroundColor Gray
Write-Host "   View logs: docker-compose -f java-gif-generator/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host ""
