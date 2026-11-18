import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import expressWs from 'express-ws';
import gifRoutes from './routes/gif.js';
import { TaskQueueService } from './services/TaskQueue.js';

const app = express();
const port = process.env.PORT || 3001;

// Initialize WebSocket support
expressWs(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize task queue
console.log('🔍 DEBUG: Initializing TaskQueueService...');
let taskQueue: TaskQueueService;
try {
  taskQueue = new TaskQueueService();
  console.log('✅ DEBUG: TaskQueueService initialized successfully');
} catch (error) {
  console.error('❌ DEBUG: Failed to initialize TaskQueueService:', error);
  throw error;
}

// Routes
app.use('/api/gif', gifRoutes);

// WebSocket endpoint for real-time updates
app.ws('/ws/gif-status/:taskId', (ws, req) => {
  const { taskId } = req.params;
  
  if (!taskId) {
    ws.close(1000, 'Task ID required');
    return;
  }

  // Send initial status
  const initialTask = taskQueue.getTaskStatus(taskId);
  if (initialTask) {
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        id: initialTask.id,
        status: initialTask.status,
        progress: initialTask.progress,
        downloadUrl: initialTask.downloadUrl,
        error: initialTask.error,
      }
    }));
  }

  // Set up periodic status updates
  const interval = setInterval(() => {
    const task = taskQueue.getTaskStatus(taskId);
    if (task) {
      ws.send(JSON.stringify({
        type: 'status',
        data: {
          id: task.id,
          status: task.status,
          progress: task.progress,
          downloadUrl: task.downloadUrl,
          error: task.error,
        }
      }));

      // Close connection if task is completed or failed
      if (task.status === 'completed' || task.status === 'failed') {
        clearInterval(interval);
        ws.close(1000, 'Task completed');
      }
    } else {
      ws.close(1000, 'Task not found');
    }
  }, 1000); // Update every second

  ws.on('close', () => {
    clearInterval(interval);
  });
});

// Python service logs endpoint
app.get('/api/python/logs', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Get Python service logs from Docker
    const { stdout, stderr } = await execAsync('docker-compose -f python-gif-generator/docker-compose.yml logs --tail=100 python-gif-generator');
    
    res.json({
      success: true,
      logs: stdout,
      errors: stderr,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Python logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Python service logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Python service status endpoint
app.get('/api/python/status', async (req, res) => {
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    
    res.json({
      success: true,
      status: 'healthy',
      pythonService: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      pythonGifGenerator: 'http://localhost:5000',
      frontend: 'http://localhost:5173'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await taskQueue.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await taskQueue.cleanup();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎬 GIF API: http://localhost:${port}/api/gif`);
  console.log(`🐍 Python logs: http://localhost:${port}/api/python/logs`);
  console.log(`🐍 Python status: http://localhost:${port}/api/python/status`);
  console.log(`🔍 DEBUG: Server startup completed successfully`);
}).on('error', (error) => {
  console.error(`❌ DEBUG: Server failed to start:`, error);
});
