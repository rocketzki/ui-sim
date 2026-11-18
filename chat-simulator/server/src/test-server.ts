import express from 'express';
import cors from 'cors';

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🔍 DEBUG: Health check called');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test GIF endpoint
app.post('/api/gif/generate', (req, res) => {
  console.log('🔍 DEBUG: GIF generation endpoint called');
  console.log('🔍 DEBUG: Request body:', req.body);
  
  res.json({
    taskId: 'test-task-123',
    message: 'Test GIF generation task submitted'
  });
});

app.listen(port, () => {
  console.log(`🚀 Test Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎬 GIF API: http://localhost:${port}/api/gif/generate`);
}).on('error', (error) => {
  console.error(`❌ DEBUG: Server failed to start:`, error);
});

console.log('🔍 DEBUG: Test server script loaded');
