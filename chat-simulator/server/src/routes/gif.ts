import { Router } from 'express';
import { TaskQueueService } from '../services/TaskQueue.js';
import { CreateGifRequest, GifStatusResponse } from '../types/index.js';

const router = Router();
const taskQueue = new TaskQueueService();

// Submit a new GIF generation task
router.post('/generate', async (req, res) => {
  try {
    const { scenario, options }: CreateGifRequest = req.body;

    console.log('📝 Received GIF generation request:', { 
      scenarioTitle: scenario?.title, 
      theme: options?.theme,
      messages: scenario?.messages?.length 
    });

    if (!scenario) {
      return res.status(400).json({ error: 'Scenario data is required' });
    }

    const taskId = await taskQueue.submitTask(scenario, options);
    
    console.log(`✅ Task submitted with ID: ${taskId}`);
    
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
router.get('/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskQueue.getTaskStatus(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const response: GifStatusResponse = {
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

// Get all tasks (for debugging/admin purposes)
router.get('/tasks', (req, res) => {
  try {
    const tasks = taskQueue.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error getting all tasks:', error);
    res.status(500).json({ 
      error: 'Failed to get tasks' 
    });
  }
});

// Download generated GIF
router.get('/download/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskQueue.getTaskStatus(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'completed' || !task.downloadUrl) {
      return res.status(400).json({ error: 'GIF not ready for download' });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', `attachment; filename="chat-simulation-${taskId}.gif"`);
    
    // In a real implementation, you'd stream the file
    res.json({ 
      message: 'Download endpoint ready',
      downloadUrl: task.downloadUrl 
    });
  } catch (error) {
    console.error('Error downloading GIF:', error);
    res.status(500).json({ 
      error: 'Failed to download GIF' 
    });
  }
});

export default router;
