# Smart PowerShell startup script with port conflict handling
# This script will kill existing processes and ask for user confirmation

param(
    [switch]$Force,
    [switch]$NoPrompt
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to kill processes on a port
function Stop-PortProcesses {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($processes) {
            Write-Warning "Killing processes on port $Port"
            Stop-Process -Id $processes -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    } catch {
        # Fallback method
        $netstat = netstat -ano | Select-String ":$Port "
        if ($netstat) {
            $pids = $netstat | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
            foreach ($pid in $pids) {
                if ($pid -match '^\d+$') {
                    Write-Warning "Killing process $pid on port $Port"
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}

# Function to kill all Node.js related processes
function Stop-NodeProcesses {
    Write-Status "Checking for existing Node.js processes..."
    
    # Kill npm processes
    $npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    if ($npmProcesses) {
        Write-Warning "Killing npm processes: $($npmProcesses.Id -join ', ')"
        $npmProcesses | Stop-Process -Force
    }
    
    # Kill node processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Warning "Killing node processes: $($nodeProcesses.Id -join ', ')"
        $nodeProcesses | Stop-Process -Force
    }
    
    # Kill any processes with "vite" in command line
    $viteProcesses = Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like "*vite*" }
    if ($viteProcesses) {
        Write-Warning "Killing vite processes: $($viteProcesses.ProcessId -join ', ')"
        $viteProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    }
    
    Start-Sleep -Seconds 2
}

# Function to ask user for confirmation
function Get-UserConfirmation {
    param([string]$Message)
    if ($NoPrompt) { return $true }
    
    Write-Host $Message -ForegroundColor Yellow
    $response = Read-Host "Do you want to continue? (y/N)"
    return $response -match '^[Yy]$'
}

# Main script
Write-Host "🚀 Smart Chat Simulator Startup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop first."
    exit 1
}

# Check for existing processes
$port5000InUse = Test-Port 5000
$port5173InUse = Test-Port 5173

if ($port5000InUse -or $port5173InUse) {
    Write-Warning "Found existing processes on ports 5000 or 5173"
    Write-Host ""
    Write-Host "What would you like to do?"
    Write-Host "1) Kill all Node.js processes and use ports 5000/5173"
    Write-Host "2) Find alternative ports (keep existing processes running)"
    Write-Host "3) Cancel"
    Write-Host ""
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Status "Killing all Node.js processes..."
            Stop-NodeProcesses
            $UseAlternativePorts = $false
        }
        "2" {
            Write-Status "Looking for alternative ports..."
            $UseAlternativePorts = $true
        }
        "3" {
            Write-Error "Operation cancelled by user"
            exit 1
        }
        default {
            Write-Error "Invalid choice. Exiting."
            exit 1
        }
    }
} else {
    Write-Success "No conflicting processes found"
    $UseAlternativePorts = $false
}

# Set default ports
$PythonPort = 5000
$FrontendPort = 5173

# Handle alternative port finding
if ($UseAlternativePorts) {
    Write-Status "Finding alternative ports..."
    
    # Find alternative Python port
    $alternativePythonPorts = @(5001, 5002, 5003, 5004, 5005)
    foreach ($port in $alternativePythonPorts) {
        if (-not (Test-Port $port)) {
            $PythonPort = $port
            Write-Success "Using Python port: $PythonPort"
            break
        }
    }
    
    # Find alternative frontend port
    $alternativeFrontendPorts = @(5174, 5175, 5176, 5177, 5178, 5179, 5180)
    foreach ($port in $alternativeFrontendPorts) {
        if (-not (Test-Port $port)) {
            $FrontendPort = $port
            Write-Success "Using Frontend port: $FrontendPort"
            break
        }
    }
    
    if ((Test-Port $PythonPort) -or (Test-Port $FrontendPort)) {
        Write-Error "Could not find free ports. Please kill existing processes or try again later."
        exit 1
    }
} else {
    # Clean up any remaining processes on default ports
    Stop-PortProcesses 5000
    Stop-PortProcesses 5173
}

# Update configuration
Write-Status "Updating configuration..."
$env:PYTHON_PORT = $PythonPort
$env:FRONTEND_PORT = $FrontendPort
& .\update-config.ps1 -PythonPort $PythonPort -FrontendPort $FrontendPort

Write-Host ""
Write-Status "Starting Python GIF Generator..."

# Start Python service
Set-Location "python-gif-generator"

# Update docker-compose.yml with the correct port if using alternative port
if ($PythonPort -ne 5000) {
    Write-Status "Updating Python service to use port $PythonPort..."
    # Create a temporary docker-compose override
    $overrideContent = @"
version: '3.8'
services:
  python-gif-generator:
    ports:
      - "$PythonPort`:5000"
"@
    $overrideContent | Out-File -FilePath "docker-compose.override.yml" -Encoding UTF8
}

$dockerStatus = docker-compose ps
if ($dockerStatus -match "python-gif-generator.*Up") {
    Write-Warning "Python service is already running, restarting..."
    docker-compose restart
} else {
    docker-compose up -d
}
Set-Location ".."

# Wait for Python service to be ready
Write-Status "Waiting for Python service to be ready..."
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$PythonPort/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Python service is ready!"
            break
        }
    } catch {
        if ($i -eq 30) {
            Write-Error "Python service failed to start"
            exit 1
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Status "Starting Frontend..."

# Start frontend
Write-Status "Installing dependencies (if needed)..."
npm install --silent

# Start frontend with dynamic port
Write-Status "Starting frontend on port $FrontendPort..."

# Set environment variables for Vite
$env:VITE_PORT = $FrontendPort
$env:PORT = $FrontendPort

$frontendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    $env:VITE_PORT = $using:FrontendPort
    $env:PORT = $using:FrontendPort
    npm run dev 
}

# Wait for frontend to start
Write-Status "Waiting for frontend to be ready..."
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is ready!"
            break
        }
    } catch {
        if ($i -eq 30) {
            Write-Error "Frontend failed to start"
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            exit 1
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Success "Python GIF Generator: http://localhost:$PythonPort"
Write-Success "Frontend: http://localhost:$FrontendPort"
Write-Host ""
Write-Status "Services running:"
Write-Host "  - Python GIF Generator (Docker) on port $PythonPort"
Write-Host "  - Frontend (Vite) on port $FrontendPort"
Write-Host ""
if ($UseAlternativePorts) {
    Write-Warning "Note: Using alternative ports due to conflicts"
    Write-Warning "Make sure to update your frontend configuration if needed"
    Write-Host ""
}
Write-Status "To stop services, run: .\stop-services.ps1"
Write-Status "To view Python logs, run: .\view-python-logs.ps1"
Write-Host ""
Write-Warning "Press Ctrl+C to stop this script (services will continue running)"
Write-Host ""

# Keep script running and show status
try {
    while ($true) {
        Start-Sleep -Seconds 10
        if ($frontendJob.State -eq "Failed") {
            Write-Error "Frontend process died, restarting..."
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            $frontendJob = Start-Job -ScriptBlock { 
                Set-Location $using:PWD
                $env:VITE_PORT = $using:FrontendPort
                $env:PORT = $using:FrontendPort
                npm run dev 
            }
        }
    }
} finally {
    Write-Status "Cleaning up..."
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Remove docker-compose override if it was created
    if (Test-Path "python-gif-generator/docker-compose.override.yml") {
        Remove-Item "python-gif-generator/docker-compose.override.yml" -Force
    }
}
