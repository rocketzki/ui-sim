import axios, { AxiosResponse } from 'axios';
import { GifGenerationTask } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';

export class PythonGifGeneratorService {
  private pythonServiceUrl: string;
  private outputDir: string;

  constructor(outputDir: string, pythonServiceUrl: string = 'http://localhost:5000') {
    this.outputDir = outputDir;
    this.pythonServiceUrl = pythonServiceUrl;
    console.log(`🐍 Python GIF Generator initialized`);
    console.log(`🔍 DEBUG: Python service URL: ${pythonServiceUrl}`);
    console.log(`🔍 DEBUG: Output directory: ${outputDir}`);
  }

  async generateGif(task: GifGenerationTask, frames: Buffer[]): Promise<string> {
    console.log(`🐍 Generating GIF using Python service for task: ${task.id}`);
    console.log(`🔍 DEBUG: Frames count: ${frames.length}`);
    console.log(`🔍 DEBUG: Dimensions: ${task.options.width}x${task.options.height}`);
    console.log(`🔍 DEBUG: Delay: ${task.options.delay || 1000}ms`);

    try {
      // Check if Python service is available
      await this.checkPythonServiceHealth();

      // Convert PNG buffers to base64 strings
      const framesBase64 = frames.map(frame => frame.toString('base64'));
      console.log(`🔍 DEBUG: Converted ${framesBase64.length} frames to base64`);

      // Call Python service
      const response: AxiosResponse = await axios.post(`${this.pythonServiceUrl}/generate-gif`, {
        frames: framesBase64,
        width: task.options.width,
        height: task.options.height,
        duration: task.options.delay || 1000,
        loop: 0,
        task_id: task.id
      });

      if (response.data.success) {
        console.log(`✅ Python service generated GIF successfully`);
        console.log(`🔍 DEBUG: Python response:`, response.data);

        // Download the GIF from Python service
        const gifFilename = response.data.filename;
        const gifPath = await this.downloadGifFromPythonService(gifFilename, task.id);
        
        // Clean up the file from Python service
        await this.cleanupPythonServiceFile(gifFilename);

        return gifPath;
      } else {
        throw new Error(`Python service failed: ${response.data.error}`);
      }

    } catch (error) {
      console.error(`❌ Error with Python GIF generation:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Python GIF service is not running. Please start it with: docker-compose up -d');
        }
        throw new Error(`Python service error: ${error.message}`);
      }
      
      throw error;
    }
  }

  private async checkPythonServiceHealth(): Promise<void> {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, { timeout: 5000 });
      if (response.status === 200) {
        console.log(`✅ Python service is healthy:`, response.data);
      } else {
        throw new Error(`Python service health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Python service health check failed:`, error);
      throw new Error('Python GIF service is not available');
    }
  }

  private async downloadGifFromPythonService(filename: string, taskId: string): Promise<string> {
    try {
      console.log(`🔍 DEBUG: Downloading GIF ${filename} from Python service...`);
      
      const response = await axios.get(`${this.pythonServiceUrl}/download/${filename}`, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      if (response.status === 200) {
        // Save to our output directory
        const localFilename = `gif_${taskId}.gif`;
        const localPath = path.join(this.outputDir, localFilename);
        
        await fs.writeFile(localPath, response.data);
        
        // Verify file was created
        const stats = await fs.stat(localPath);
        console.log(`✅ GIF downloaded and saved: ${localPath} (${stats.size} bytes)`);
        
        return localPath;
      } else {
        throw new Error(`Failed to download GIF: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error downloading GIF from Python service:`, error);
      throw error;
    }
  }

  private async cleanupPythonServiceFile(filename: string): Promise<void> {
    try {
      console.log(`🔍 DEBUG: Cleaning up Python service file: ${filename}`);
      await axios.post(`${this.pythonServiceUrl}/cleanup`, { filename });
      console.log(`✅ Python service file cleaned up`);
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup Python service file:`, error);
      // Don't throw here, cleanup failure shouldn't break the main flow
    }
  }
}
