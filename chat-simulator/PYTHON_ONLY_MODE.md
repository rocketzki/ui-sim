# Python-Only Mode Configuration

## Overview
The Chat Simulator has been configured to run in **Python-Only Mode**, where the frontend connects directly to the Python GIF generator service, bypassing the Node.js server entirely.

## Architecture Changes

### Before (Multi-Service)
```
Frontend (5173) → Node.js Server (3001) → Python Service (5000)
```

### After (Python-Only)
```
Frontend (5173) → Python Service (5000)
```

## What's Changed

### ✅ Enabled
- **Python GIF Generator Service** (port 5000) - Primary GIF generation
- **Frontend** (port 5173) - React app with direct Python connection
- **Python Logs Viewer** - Direct access to Python service logs

### 🔄 Disabled (but preserved)
- **Node.js Server** (port 3001) - Disabled but code preserved for future use
- **Server-side GIF processing** - Now handled entirely by Python

## New Components

### Frontend Hook
- `src/hooks/usePythonGifGenerator.ts` - Direct Python service integration
- Replaces `useServerGifGenerator` for direct communication

### Log Viewing
- `view-python-logs.sh` - Enhanced bash script with two modes:
  - **Static mode**: `./view-python-logs.sh` - Shows recent logs (last 50 lines)
  - **Live mode**: `./view-python-logs.sh --follow` or `./view-python-logs.sh -f` - Follows logs in real-time
  - **Help**: `./view-python-logs.sh --help` - Shows usage information
- `view-python-logs.ps1` - PowerShell script with same functionality:
  - **Static mode**: `.\view-python-logs.ps1` - Shows recent logs
  - **Live mode**: `.\view-python-logs.ps1 -Follow` or `.\view-python-logs.ps1 -f` - Follows logs in real-time
  - **Help**: `.\view-python-logs.ps1 -Help` - Shows usage information
- Enhanced DebugPanel with direct Python service status

## Startup Scripts

### Bash (Linux/WSL)
```bash
./start-services.sh
```

### PowerShell (Windows)
```powershell
.\start-services.ps1
```

Both scripts now:
- Start only Python service and frontend
- Skip Node.js server entirely
- Provide direct Python service health checks

## API Endpoints

### Python Service (port 5000)
- `GET /health` - Service health check
- `POST /generate-gif` - Generate GIF from frames
- `GET /download/{filename}` - Download generated GIF
- `POST /cleanup` - Clean up temporary files

### Frontend Integration
- Direct HTTP calls to Python service
- Real-time progress simulation
- Error handling and retry logic

## Benefits

1. **Simplified Architecture** - One less service to manage
2. **Reduced Resource Usage** - No Node.js server overhead
3. **Faster GIF Generation** - Direct communication with Python
4. **Easier Debugging** - Direct access to Python logs
5. **Better Performance** - Fewer network hops

## Reverting to Multi-Service Mode

To re-enable the Node.js server:

1. Update `src/components/Chat/ChatSimulator.tsx`:
   ```typescript
   // Change from:
   import { usePythonGifGenerator } from '@/hooks/usePythonGifGenerator';
   const { ... } = usePythonGifGenerator();
   
   // To:
   import { useServerGifGenerator } from '@/hooks/useServerGifGenerator';
   const { ... } = useServerGifGenerator();
   ```

2. Update startup scripts to include Node.js server startup

3. Start Node.js server: `cd server && npm run dev`

## Troubleshooting

### Python Service Not Starting
```bash
# Check Docker status
docker ps

# View recent Python logs (static)
./view-python-logs.sh

# Follow Python logs in real-time
./view-python-logs.sh --follow

# Restart Python service
cd python-gif-generator && docker-compose restart
```

### Frontend Connection Issues
- Ensure Python service is running on port 5000
- Check browser console for CORS errors
- Verify Python service health: `curl http://localhost:5000/health`

### GIF Generation Failures
- Check Python logs for detailed error messages
- Verify Docker container has sufficient resources
- Ensure Python dependencies are properly installed
