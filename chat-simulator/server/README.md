# Chat Simulator Server

Backend server for the Chat Simulator application that handles GIF generation using a queue-based system.

## Features

- **Queue-based GIF Generation**: Uses Bull queue with Redis for reliable task processing
- **Server-side Rendering**: Uses Puppeteer to render chat simulations and capture frames
- **Real-time Updates**: WebSocket support for live progress updates
- **RESTful API**: Clean API endpoints for task submission and status checking
- **Error Handling**: Comprehensive error handling and retry mechanisms

## Prerequisites

- Node.js 18+ 
- Redis (optional, falls back to in-memory queue)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
# .env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/gif/generate
Submit a new GIF generation task.

**Request Body:**
```json
{
  "scenario": {
    "id": "scenario-id",
    "title": "Chat Title",
    "theme": "whatsapp",
    "participants": [...],
    "messages": [...],
    "settings": {...}
  },
  "options": {
    "width": 400,
    "height": 600,
    "quality": 10,
    "delay": 1000,
    "theme": "whatsapp"
  }
}
```

**Response:**
```json
{
  "taskId": "uuid-string",
  "message": "GIF generation task submitted successfully"
}
```

### GET /api/gif/status/:taskId
Get the status of a specific task.

**Response:**
```json
{
  "id": "task-id",
  "status": "completed",
  "progress": 100,
  "downloadUrl": "/path/to/generated/gif",
  "error": null
}
```

### GET /api/gif/tasks
Get all tasks (for debugging/admin purposes).

### GET /api/gif/download/:taskId
Download a completed GIF.

### WebSocket /ws/gif-status/:taskId
Real-time status updates for a specific task.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API   │    │   Task Queue    │
│                 │───▶│                 │───▶│   (Bull/Redis)  │
│ React App       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   WebSocket     │    │  GIF Generator  │
                       │   Updates       │    │   (Puppeteer)   │
                       └─────────────────┘    └─────────────────┘
```

## Task Flow

1. **Task Submission**: Frontend submits scenario data to `/api/gif/generate`
2. **Queue Processing**: Task is added to Bull queue with Redis backend
3. **GIF Generation**: Puppeteer renders chat simulation and captures frames
4. **Progress Updates**: Real-time updates via WebSocket
5. **Completion**: Download URL provided when GIF is ready

## Configuration

### Queue Options
- **Retry Attempts**: 3 attempts with exponential backoff
- **Job Cleanup**: Keeps last 10 completed and 5 failed jobs
- **Timeout**: 5 minutes per task

### Puppeteer Options
- **Headless Mode**: Always runs in headless mode
- **Sandbox**: Disabled for container compatibility
- **Memory**: Optimized for server environments

## Error Handling

- **Network Errors**: Automatic retry with exponential backoff
- **Render Errors**: Graceful fallback with error reporting
- **Queue Errors**: Dead letter queue for failed jobs
- **Client Errors**: Detailed error messages via WebSocket

## Monitoring

- **Health Check**: `GET /health` endpoint
- **Task Status**: Real-time status via WebSocket
- **Logging**: Structured logging for debugging

## Development

### Adding New Themes
1. Update `GifGeneratorService.getThemeStyles()`
2. Add CSS variables for the new theme
3. Test with sample scenarios

### Extending API
1. Add new routes in `src/routes/`
2. Update types in `src/types/`
3. Add tests for new endpoints

## Deployment

### Docker (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables
- `PORT`: Server port (default: 3001)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `FRONTEND_URL`: CORS origin (default: http://localhost:5173)
- `NODE_ENV`: Environment (development/production)
