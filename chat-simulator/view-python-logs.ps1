# PowerShell script to view Python GIF Generator logs

param(
    [switch]$Follow,
    [switch]$f,
    [switch]$Help,
    [switch]$h
)

# Function to check if Python service is running
function Test-PythonService {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to show static logs
function Show-StaticLogs {
    Write-Host "🐍 Python GIF Generator Logs (Static)" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-PythonService) {
        Write-Host "✅ Python service is running on port 5000" -ForegroundColor Green
    } else {
        Write-Host "❌ Python service is not running on port 5000" -ForegroundColor Red
        Write-Host "   Start it with: .\start-services.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "📋 Recent logs (last 50 lines):" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    # Get logs from Docker container
    Set-Location "python-gif-generator"
    docker-compose logs --tail=50 python-gif-generator
    Set-Location ".."
    
    Write-Host ""
    Write-Host "🔄 To follow logs in real-time, run:" -ForegroundColor Cyan
    Write-Host "   .\view-python-logs.ps1 -Follow" -ForegroundColor Gray
    Write-Host "   or" -ForegroundColor Gray
    Write-Host "   .\view-python-logs.ps1 -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📊 To check service status:" -ForegroundColor Cyan
    Write-Host "   Invoke-WebRequest http://localhost:5000/health" -ForegroundColor Gray
    Write-Host ""
}

# Function to show live logs
function Show-LiveLogs {
    Write-Host "🐍 Python GIF Generator Logs (Live)" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-PythonService) {
        Write-Host "✅ Python service is running on port 5000" -ForegroundColor Green
    } else {
        Write-Host "❌ Python service is not running on port 5000" -ForegroundColor Red
        Write-Host "   Start it with: .\start-services.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "📋 Following logs in real-time..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    # Follow logs from Docker container
    Set-Location "python-gif-generator"
    docker-compose logs -f python-gif-generator
    Set-Location ".."
}

# Function to show help
function Show-Help {
    Write-Host "🐍 Python GIF Generator Logs Viewer" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\view-python-logs.ps1           # Show recent logs (static)" -ForegroundColor Gray
    Write-Host "  .\view-python-logs.ps1 -Follow  # Follow logs in real-time" -ForegroundColor Gray
    Write-Host "  .\view-python-logs.ps1 -f       # Follow logs in real-time (short)" -ForegroundColor Gray
    Write-Host "  .\view-python-logs.ps1 -Help    # Show this help" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Follow, -f    Follow logs in real-time" -ForegroundColor Gray
    Write-Host "  -Help, -h      Show this help message" -ForegroundColor Gray
    Write-Host ""
}

# Parse command line arguments
if ($Help -or $h) {
    Show-Help
} elseif ($Follow -or $f) {
    Show-LiveLogs
} else {
    Show-StaticLogs
}
