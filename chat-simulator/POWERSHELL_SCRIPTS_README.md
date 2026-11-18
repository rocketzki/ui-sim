# PowerShell Scripts for Chat Simulator

This directory contains PowerShell scripts to manage the Chat Simulator services on Windows.

## 📋 Prerequisites

Before running the scripts, ensure you have:

- **PowerShell 5.1+** (included with Windows 10/11)
- **Docker Desktop** installed and running
- **Maven** installed and in PATH
- **Node.js** (v16+) installed and in PATH
- **Git Bash** or **WSL** (for running shell scripts)

## 🚀 Quick Start

### Start All Services
```powershell
.\start-services.ps1
```

### Stop All Services
```powershell
.\stop-services.ps1
```

### Check Service Health
```powershell
.\health-check.ps1
```

## 📜 Script Details

### `start-services.ps1`
**Purpose**: Starts all Chat Simulator services in the correct order

**What it does**:
1. ✅ Checks prerequisites (Docker, Maven, Node.js)
2. ☕ Builds and starts Java GIF Generator service
3. 🟢 Starts Node.js API server
4. 🎨 Starts frontend development server
5. 🌐 Opens browser to the application

**Features**:
- Port conflict detection and resolution
- Service health checks with timeouts
- Automatic browser opening
- Comprehensive error handling
- Background process management

### `stop-services.ps1`
**Purpose**: Stops all running Chat Simulator services

**What it does**:
1. 🐳 Stops Docker containers
2. 🟢 Terminates Node.js processes
3. 🧹 Cleans up Docker resources
4. 🔍 Verifies ports are free

**Features**:
- Graceful process termination
- Docker cleanup (containers, volumes)
- Port availability verification
- Service status reporting

### `health-check.ps1`
**Purpose**: Checks the health status of all services

**What it does**:
1. 🔍 Tests each service endpoint
2. 🐳 Checks Docker container status
3. 📊 Provides detailed health report
4. 🔧 Suggests troubleshooting steps

**Features**:
- HTTP endpoint testing
- Port connectivity checks
- JSON response parsing
- Comprehensive status summary

## 🎯 Service Endpoints

| Service | URL | Port | Health Check |
|---------|-----|------|--------------|
| Java GIF Generator | http://localhost:8080 | 8080 | `/health` |
| Node.js API Server | http://localhost:3001 | 3001 | `/health` |
| Frontend App | http://localhost:5173 | 5173 | `/` |

## 🔧 Troubleshooting

### Common Issues

#### "Docker is not running"
```powershell
# Start Docker Desktop manually, then retry
.\start-services.ps1
```

#### "Maven is not installed"
1. Download Maven from https://maven.apache.org/download.cgi
2. Add Maven to your PATH environment variable
3. Restart PowerShell and retry

#### "Port already in use"
```powershell
# Stop all services first
.\stop-services.ps1

# Then start again
.\start-services.ps1
```

#### "Java service build failed"
```powershell
# Check if you have Java 11+ installed
java -version

# If not, install OpenJDK 11+ from https://adoptium.net/
```

### Manual Service Management

#### Start Java Service Only
```powershell
cd java-gif-generator
.\build.sh
docker-compose up -d
cd ..
```

#### Start Node.js Server Only
```powershell
cd server
npm run dev
```

#### Start Frontend Only
```powershell
npm run dev
```

#### View Service Logs
```powershell
# Java service logs
docker-compose -f java-gif-generator/docker-compose.yml logs -f

# Node.js server logs (if running in foreground)
cd server
npm run dev
```

## 🎨 Customization

### Change Ports
Edit the scripts and modify these variables:
- Java service: Port 8080
- Node.js server: Port 3001  
- Frontend: Port 5173

### Add Services
To add new services to the startup script:
1. Add port checking logic
2. Add service startup commands
3. Add health check logic
4. Update the summary output

### Modify Timeouts
Change the `MaxAttempts` parameter in `Wait-ForService` function:
```powershell
Wait-ForService -Url "http://localhost:8080/health" -ServiceName "Java Service" -MaxAttempts 60
```

## 🔒 Security Notes

- Scripts run with current user privileges
- Docker commands require Docker Desktop to be running
- No elevated permissions required for normal operation
- Scripts use standard Windows networking APIs

## 📝 Logs and Debugging

### Enable Verbose Output
Add `-Verbose` to PowerShell commands:
```powershell
.\start-services.ps1 -Verbose
```

### Check Process Details
```powershell
# List all Node.js processes
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# List Docker containers
docker ps -a

# Check port usage
netstat -an | findstr ":8080"
```

## 🆘 Support

If you encounter issues:

1. **Run health check**: `.\health-check.ps1`
2. **Check prerequisites**: Ensure Docker, Maven, Node.js are installed
3. **Restart services**: `.\stop-services.ps1` then `.\start-services.ps1`
4. **Check logs**: Use Docker logs and PowerShell process monitoring
5. **Verify ports**: Ensure no other applications are using ports 8080, 3001, 5173

## 🔄 Updates

To update the scripts:
1. Download new versions
2. Stop services: `.\stop-services.ps1`
3. Replace script files
4. Start services: `.\start-services.ps1`
