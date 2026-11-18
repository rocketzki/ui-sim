import Queue from 'bull';
import { GifGenerationTask } from '../types/index.js';
import { GifGeneratorService } from './GifGenerator.js';
import { v4 as uuidv4 } from 'uuid';

export class TaskQueueService {
  private queue: Queue.Queue;
  private gifGenerator: GifGeneratorService;
  private tasks: Map<string, GifGenerationTask> = new Map();

  constructor() {
    // Initialize Redis connection (fallback to in-memory if Redis not available)
    this.queue = new Queue('gif generation', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.gifGenerator = new GifGeneratorService();
    this.setupQueue();
  }

  private setupQueue() {
    // Process jobs
    this.queue.process('generate-gif', async (job) => {
      const task = job.data as GifGenerationTask;
      
      console.log(`🎬 Starting GIF generation for task ${task.id}`);
      
      try {
        // Update task status to processing
        this.updateTaskStatus(task.id, 'processing', 0);
        
        // Initialize GIF generator if needed
        await this.gifGenerator.initialize();
        console.log(`✅ Browser initialized for task ${task.id}`);
        
        // Generate GIF with progress callback
        const downloadPath = await this.gifGenerator.generateGif(task, (progress) => {
          console.log(`📊 Progress for task ${task.id}: ${progress}%`);
          this.updateTaskStatus(task.id, 'processing', progress);
        });
        
        // Update task as completed
        this.updateTaskStatus(task.id, 'completed', 100, downloadPath);
        console.log(`✅ GIF generation completed for task ${task.id}: ${downloadPath}`);
        
        return { success: true, downloadPath };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ GIF generation failed for task ${task.id}:`, errorMessage);
        this.updateTaskStatus(task.id, 'failed', 0, undefined, errorMessage);
        throw error;
      }
    });

    // Handle job progress
    this.queue.on('progress', (job, progress) => {
      const taskId = job.data.id;
      this.updateTaskStatus(taskId, 'processing', progress);
    });

    // Handle job completion
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    // Handle job failure
    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err.message);
    });
  }

  async submitTask(scenario: any, options: any): Promise<string> {
    const taskId = uuidv4();
    
    const task: GifGenerationTask = {
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

    // Store task in memory
    this.tasks.set(taskId, task);

    // Add job to queue
    await this.queue.add('generate-gif', task, {
      jobId: taskId,
    });

    return taskId;
  }

  getTaskStatus(taskId: string): GifGenerationTask | null {
    return this.tasks.get(taskId) || null;
  }

  getAllTasks(): GifGenerationTask[] {
    return Array.from(this.tasks.values());
  }

  private updateTaskStatus(
    taskId: string, 
    status: GifGenerationTask['status'], 
    progress: number,
    downloadUrl?: string,
    error?: string
  ) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.progress = progress;
      
      if (downloadUrl) {
        task.downloadUrl = downloadUrl;
        task.completedAt = new Date();
      }
      
      if (error) {
        task.error = error;
        task.completedAt = new Date();
      }
      
      this.tasks.set(taskId, task);
    }
  }

  async cleanup() {
    await this.queue.close();
    await this.gifGenerator.cleanup();
  }
}
