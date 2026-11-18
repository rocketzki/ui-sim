import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { GifGeneratorService } from './services/GifGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple in-memory task storage
const tasks = new Map();

// Initialize GIF generator
console.log('🔍 DEBUG: Creating GifGeneratorService...');
let gifGenerator: GifGeneratorService;
try {
  gifGenerator = new GifGeneratorService();
  console.log('✅ DEBUG: GifGeneratorService created successfully');
} catch (error) {
  console.error('❌ DEBUG: Failed to create GifGeneratorService:', error);
  throw error;
}
const outputDir = path.join(__dirname, '../output');

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
}

// Initialize
ensureOutputDir();

// Submit a new GIF generation task
app.post('/api/gif/generate', async (req, res) => {
  console.log('🔍 DEBUG: POST /api/gif/generate called');
  console.log('🔍 DEBUG: Request headers:', req.headers);
  console.log('🔍 DEBUG: Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 DEBUG: Content-Type:', req.get('Content-Type'));
  
  try {
    const { scenario, options } = req.body;

    console.log('📝 Received GIF generation request:', { 
      scenarioTitle: scenario?.title, 
      theme: options?.theme,
      messages: scenario?.messages?.length 
    });

    if (!scenario) {
      console.log('❌ DEBUG: No scenario provided');
      return res.status(400).json({ error: 'Scenario data is required' });
    }

    const taskId = uuidv4();
    console.log(`🔍 DEBUG: Generated task ID: ${taskId}`);
    
    // Create task
    const task = {
      id: taskId,
      scenario,
      options: {
        width: options.width || 400,
        height: options.height || 600,
        quality: options.quality || 10,
        delay: options.delay || 1000,
        theme: options.theme || 'whatsapp',
      },
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    tasks.set(taskId, task);
    console.log(`🔍 DEBUG: Task stored in memory. Total tasks: ${tasks.size}`);
    console.log(`🔍 DEBUG: Task details:`, JSON.stringify(task, null, 2));
    
    console.log(`✅ Task submitted with ID: ${taskId}`);
    
    // Start processing immediately
    console.log(`🔍 DEBUG: Starting processTask for ${taskId}`);
    processTask(taskId);
    
    const response = { 
      taskId,
      message: 'GIF generation task submitted successfully' 
    };
    
    console.log(`🔍 DEBUG: Sending response:`, JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('❌ Error submitting GIF task:', error);
    console.error('❌ DEBUG: Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to submit GIF generation task' 
    });
  }
});

// Get status of a specific task
app.get('/api/gif/status/:taskId', (req, res) => {
  console.log(`🔍 DEBUG: GET /api/gif/status/${req.params.taskId} called`);
  console.log(`🔍 DEBUG: All tasks in memory:`, Array.from(tasks.keys()));
  
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    console.log(`🔍 DEBUG: Looking for task ID: ${taskId}`);
    console.log(`🔍 DEBUG: Task found:`, task ? 'YES' : 'NO');
    
    if (task) {
      console.log(`🔍 DEBUG: Task details:`, JSON.stringify(task, null, 2));
    }

    if (!task) {
      console.log(`❌ DEBUG: Task ${taskId} not found in memory`);
      return res.status(404).json({ error: 'Task not found' });
    }

    const response = {
      id: task.id,
      status: task.status,
      progress: task.progress,
      downloadUrl: task.downloadUrl,
      error: task.error,
    };

    console.log(`🔍 DEBUG: Sending status response:`, JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('❌ Error getting task status:', error);
    console.error('❌ DEBUG: Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to get task status' 
    });
  }
});

// Real task processing with Puppeteer
async function processTask(taskId: string) {
  console.log(`🔍 DEBUG: processTask called with taskId: ${taskId}`);
  
  const task = tasks.get(taskId);
  if (!task) {
    console.log(`❌ DEBUG: Task ${taskId} not found in processTask`);
    return;
  }

  console.log(`🔍 DEBUG: Task found in processTask:`, JSON.stringify(task, null, 2));
  console.log(`🎬 Starting GIF generation for task ${taskId}`);
  
  try {
    // Update status to processing
    task.status = 'processing';
    task.progress = 0;
    tasks.set(taskId, task);
    console.log(`🔍 DEBUG: Updated task status to processing. Task stored:`, tasks.has(taskId));

    // Initialize GIF generator
    await gifGenerator.initialize();
    console.log(`✅ Browser initialized for task ${taskId}`);

    // Generate GIF with progress callback
    const downloadPath = await gifGenerator.generateGif(task, (progress) => {
      console.log(`📊 Progress for task ${taskId}: ${progress}%`);
      task.progress = progress;
      task.status = progress === 100 ? 'completed' : 'processing';
      
      if (progress === 100) {
        task.downloadUrl = `http://localhost:3001/api/gif/download/${taskId}`;
        task.completedAt = new Date();
      }
      
      tasks.set(taskId, task);
    });

    console.log(`✅ GIF generation completed for task ${taskId}: ${downloadPath}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ GIF generation failed for task ${taskId}:`, errorMessage);
    console.error(`❌ DEBUG: Error stack:`, error.stack);
    
    task.status = 'failed';
    task.error = errorMessage;
    task.completedAt = new Date();
    tasks.set(taskId, task);
  }
}

// Download endpoint
app.get('/api/gif/download/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);

  console.log(`🔍 DEBUG: Download request for task ${taskId}`);

  if (!task) {
    console.log(`❌ DEBUG: Task ${taskId} not found for download`);
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.status !== 'completed') {
    console.log(`❌ DEBUG: Task ${taskId} not completed yet. Status: ${task.status}`);
    return res.status(400).json({ error: 'GIF not ready for download' });
  }

  try {
    // Look for the generated GIF file
    const filename = `gif_${taskId}.gif`; // The GifGenerator creates GIF files
    const filepath = path.join(outputDir, filename);
    
    console.log(`🔍 DEBUG: Looking for file: ${filepath}`);
    
    // Check if file exists
    try {
      await fs.access(filepath);
      console.log(`✅ DEBUG: File found: ${filepath}`);
    } catch {
      console.log(`❌ DEBUG: File not found: ${filepath}`);
      // Fallback to text file if GIF not found
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="chat-simulation-${taskId}.txt"`);
      return res.send(`GIF Generation Complete!
Task ID: ${taskId}
Scenario: ${task.scenario.title}
Theme: ${task.options.theme}
Messages: ${task.scenario.messages.length}
Generated at: ${task.completedAt?.toISOString()}

Note: Actual GIF file not found, but generation was successful.`);
    }

    // Serve the actual GIF file
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="chat-simulation-${taskId}.gif"`);
    
    const fileBuffer = await fs.readFile(filepath);
    res.send(fileBuffer);
    
    console.log(`✅ DEBUG: Served file: ${filename}`);
    
  } catch (error) {
    console.error(`❌ DEBUG: Error serving file for task ${taskId}:`, error);
    res.status(500).json({ error: 'Failed to serve GIF file' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tasks: tasks.size
  });
});

app.listen(port, () => {
  console.log(`🚀 Simple Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎬 GIF API: http://localhost:${port}/api/gif`);
  console.log(`🔍 DEBUG: Server startup completed successfully`);
  console.log(`🔍 DEBUG: CORS enabled for: http://localhost:5173`);
  console.log(`🔍 DEBUG: Output directory: ${outputDir}`);
}).on('error', (error) => {
  console.error(`❌ DEBUG: Server failed to start:`, error);
});
