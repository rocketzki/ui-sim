const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple in-memory task storage
const tasks = new Map();

// Submit a new GIF generation task
app.post('/api/gif/generate', async (req, res) => {
  try {
    const { scenario, options } = req.body;

    console.log('📝 Received GIF generation request:', { 
      scenarioTitle: scenario?.title, 
      theme: options?.theme,
      messages: scenario?.messages?.length 
    });

    if (!scenario) {
      return res.status(400).json({ error: 'Scenario data is required' });
    }

    const taskId = uuidv4();
    
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
    
    console.log(`✅ Task submitted with ID: ${taskId}`);
    
    // Start processing immediately
    processTask(taskId);
    
    res.json({ 
      taskId,
      message: 'GIF generation task submitted successfully' 
    });
  } catch (error) {
    console.error('❌ Error submitting GIF task:', error);
    res.status(500).json({ 
      error: 'Failed to submit GIF generation task' 
    });
  }
});

// Get status of a specific task
app.get('/api/gif/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const response = {
      id: task.id,
      status: task.status,
      progress: task.progress,
      downloadUrl: task.downloadUrl,
      error: task.error,
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting task status:', error);
    res.status(500).json({ 
      error: 'Failed to get task status' 
    });
  }
});

// Simple task processing
async function processTask(taskId) {
  const task = tasks.get(taskId);
  if (!task) return;

  console.log(`🎬 Starting GIF generation for task ${taskId}`);
  
  try {
    // Update status to processing
    task.status = 'processing';
    task.progress = 0;
    tasks.set(taskId, task);

    // Simulate processing with progress updates
    const steps = [
      { progress: 10, message: 'Initializing...' },
      { progress: 25, message: 'Capturing frames...' },
      { progress: 50, message: 'Processing animation...' },
      { progress: 75, message: 'Optimizing GIF...' },
      { progress: 90, message: 'Finalizing...' },
      { progress: 100, message: 'Complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
      task.progress = step.progress;
      task.status = step.progress === 100 ? 'completed' : 'processing';
      
      if (step.progress === 100) {
        task.downloadUrl = `http://localhost:3001/api/gif/download/${taskId}`;
        task.completedAt = new Date();
      }
      
      tasks.set(taskId, task);
      console.log(`📊 Progress for task ${taskId}: ${step.progress}% - ${step.message}`);
    }

    console.log(`✅ GIF generation completed for task ${taskId}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ GIF generation failed for task ${taskId}:`, errorMessage);
    
    task.status = 'failed';
    task.error = errorMessage;
    task.completedAt = new Date();
    tasks.set(taskId, task);
  }
}

// Download endpoint
app.get('/api/gif/download/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.status !== 'completed') {
    return res.status(400).json({ error: 'GIF not ready for download' });
  }

  // Return a simple text file for now
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="chat-simulation-${taskId}.txt"`);
  res.send(`GIF Generation Complete!
Task ID: ${taskId}
Scenario: ${task.scenario.title}
Theme: ${task.options.theme}
Messages: ${task.scenario.messages.length}
Generated at: ${task.completedAt?.toISOString()}`);
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
  console.log(`🚀 Test Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🎬 GIF API: http://localhost:${port}/api/gif`);
});
