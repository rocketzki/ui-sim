# Python GIF Generator Service

A containerized Python service for generating animated GIFs from PNG frames using Pillow.

## Features

- ✅ High-quality GIF generation using Pillow (PIL)
- ✅ Base64 PNG frame input
- ✅ Configurable dimensions, duration, and loop settings
- ✅ RESTful API with Flask
- ✅ Docker containerization
- ✅ Health checks and error handling
- ✅ File cleanup and management

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and version information.

### Generate GIF
```
POST /generate-gif
```
**Request Body:**
```json
{
  "frames": ["base64_png_1", "base64_png_2", ...],
  "width": 400,
  "height": 600,
  "duration": 1000,
  "loop": 0,
  "task_id": "unique_task_id"
}
```

**Response:**
```json
{
  "success": true,
  "gif_path": "/tmp/gif_generator/gif_task_id.gif",
  "filename": "gif_task_id.gif",
  "task_id": "unique_task_id"
}
```

### Download GIF
```
GET /download/<filename>
```
Downloads the generated GIF file.

### Cleanup
```
POST /cleanup
```
**Request Body:**
```json
{
  "filename": "gif_task_id.gif"
}
```

## Quick Start

### Using Docker Compose (Recommended)
```bash
# Build and start the service
docker-compose up --build

# Run in background
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Using Docker
```bash
# Build the image
docker build -t python-gif-generator .

# Run the container
docker run -p 5000:5000 python-gif-generator

# Run with volume mount for file persistence
docker run -p 5000:5000 -v $(pwd)/temp:/tmp/gif_generator python-gif-generator
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

## Testing

Run the test script to verify the service works:

```bash
# Make sure the service is running first
python test_gif_generator.py
```

## Integration with Node.js

The Node.js server can call this Python service:

```javascript
const axios = require('axios');

async function generateGifWithPython(frames, options) {
  const response = await axios.post('http://localhost:5000/generate-gif', {
    frames: frames.map(frame => frame.toString('base64')),
    width: options.width,
    height: options.height,
    duration: options.delay,
    loop: 0,
    task_id: options.taskId
  });
  
  return response.data;
}
```

## Configuration

Environment variables:
- `PORT`: Service port (default: 5000)

## Dependencies

- **Flask**: Web framework
- **Pillow**: Image processing and GIF generation
- **Werkzeug**: WSGI utilities

## Performance

- Handles multiple concurrent requests
- Optimized GIF compression
- Memory-efficient frame processing
- Automatic cleanup of temporary files
