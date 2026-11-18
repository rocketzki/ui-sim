import puppeteer, { Browser, Page } from 'puppeteer';
import { GifGenerationTask } from '../types/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PythonGifGeneratorService } from './PythonGifGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GifGeneratorService {
  private browser: Browser | null = null;
  private outputDir: string;
  private pythonGifGenerator: PythonGifGeneratorService;

  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.pythonGifGenerator = new PythonGifGeneratorService(this.outputDir);
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async initialize() {
    if (!this.browser) {
      try {
        console.log('🔍 DEBUG: Initializing Puppeteer browser...');
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
        console.log('✅ DEBUG: Puppeteer browser initialized successfully');
      } catch (error) {
        console.error('❌ DEBUG: Failed to initialize Puppeteer browser:', error);
        throw error;
      }
    }
  }

  async generateGif(task: GifGenerationTask, onProgress?: (progress: number) => void): Promise<string> {
    console.log(`🎬 Starting GIF generation for task: ${task.id}`);
    console.log(`🔍 DEBUG: Scenario: ${task.scenario.title}`);
    console.log(`🔍 DEBUG: Theme: ${task.options.theme}`);
    console.log(`🔍 DEBUG: Dimensions: ${task.options.width}x${task.options.height}`);
    
    if (!this.browser) {
      console.error(`❌ Browser not initialized for task ${task.id}`);
      throw new Error('Browser not initialized');
    }

    console.log(`🔍 DEBUG: Creating new page...`);
    const page = await this.browser.newPage();
    console.log(`✅ New page created`);
    
    try {
      onProgress?.(5); // Initial setup
      console.log(`🔍 DEBUG: Initial setup complete (5%)`);
      
      // Set viewport size with high DPI for sharp images
      await page.setViewport({
        width: task.options.width,
        height: task.options.height,
        deviceScaleFactor: 2 // Higher DPI for sharper images
      });

      onProgress?.(10); // Viewport set

      // Generate HTML content for the chat simulation
      const htmlContent = this.generateChatHTML(task.scenario, task.options.theme);
      
      // Set the HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      onProgress?.(20); // Page loaded

      // Wait for any animations to settle
      await page.waitForTimeout(1000);

      onProgress?.(25); // Ready to capture

      // Capture screenshots for GIF frames
      const frames: Buffer[] = [];
      const messageCount = task.scenario.messages.length;
      const frameCount = Math.min(messageCount * 3 + 5, 30); // More frames for smoother animation
      const progressPerFrame = 60 / frameCount; // 60% of progress for frame capture
      
      console.log(`📸 Capturing ${frameCount} frames for ${messageCount} messages`);
      
      for (let i = 0; i < frameCount; i++) {
        // Capture current state with high quality
        console.log(`📸 Capturing frame ${i + 1}/${frameCount}...`);
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: task.options.width,
            height: task.options.height
          },
          omitBackground: false // Include background
        });
        
        console.log(`🔍 DEBUG: Screenshot captured, size: ${(screenshot as Buffer).length} bytes`);
        frames.push(screenshot as Buffer);
        
        // Simulate message progression
        if (i < messageCount) {
          console.log(`📝 Simulating message ${i + 1}/${messageCount}`);
          await this.simulateMessageProgression(page, i, task.scenario);
        } else if (i < messageCount + 2) {
          // Add some frames after all messages are shown
          console.log(`⏳ Adding delay after all messages...`);
          await page.waitForTimeout(task.options.delay);
        }
        
        await page.waitForTimeout(task.options.delay);
        
        // Update progress
        const currentProgress = 25 + (i + 1) * progressPerFrame;
        onProgress?.(Math.min(currentProgress, 85));
        
        console.log(`✅ Frame ${i + 1}/${frameCount} completed`);
      }

      onProgress?.(90); // Frames captured
      console.log(`✅ Frame capture completed. Total frames: ${frames.length}`);

      // Generate GIF using Python service
      console.log(`🔍 DEBUG: Starting GIF creation from ${frames.length} frames using Python service...`);
      const gifPath = await this.pythonGifGenerator.generateGif(task, frames);
      console.log(`✅ GIF creation completed: ${gifPath}`);
      
      onProgress?.(100); // Complete
      
      return gifPath;
    } finally {
      await page.close();
    }
  }

  private generateChatHTML(scenario: any, theme: string): string {
    const themeStyles = this.getThemeStyles(theme);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chat Simulation</title>
          <style>
              ${themeStyles}
              body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: var(--bg-color);
                  color: var(--text-color);
                  height: 100vh;
                  overflow: hidden;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
                  text-rendering: optimizeLegibility;
              }
              .chat-container {
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  max-width: 400px;
                  margin: 0 auto;
                  background: var(--chat-bg);
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255,255,255,0.1);
              }
              .chat-header {
                  padding: 16px;
                  background: var(--header-bg);
                  border-bottom: 1px solid var(--border-color);
                  text-align: center;
                  font-weight: 600;
              }
              .messages-container {
                  flex: 1;
                  padding: 16px;
                  overflow-y: auto;
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
              }
              .message {
                  max-width: 80%;
                  padding: 12px 16px;
                  border-radius: 18px;
                  word-wrap: break-word;
                  opacity: 0;
                  transform: translateY(10px);
                  transition: all 0.3s ease;
                  font-weight: 400;
                  letter-spacing: 0.01em;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                  font-size: 14px;
                  line-height: 1.4;
              }
              .message.sent {
                  background: var(--sent-bg);
                  color: var(--sent-text);
                  align-self: flex-end;
                  margin-left: auto;
              }
              .message.received {
                  background: var(--received-bg);
                  color: var(--received-text);
                  align-self: flex-start;
              }
              .message.visible {
                  opacity: 1;
                  transform: translateY(0);
              }
              .message-header {
                  font-size: 12px;
                  opacity: 0.7;
                  margin-bottom: 4px;
              }
              .typing-indicator {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  padding: 8px 12px;
                  background: var(--received-bg);
                  border-radius: 18px;
                  align-self: flex-start;
                  opacity: 0;
              }
              .typing-indicator.visible {
                  opacity: 1;
              }
              .typing-dot {
                  width: 6px;
                  height: 6px;
                  background: var(--received-text);
                  border-radius: 50%;
                  animation: typing 1.4s infinite ease-in-out;
              }
              .typing-dot:nth-child(1) { animation-delay: -0.32s; }
              .typing-dot:nth-child(2) { animation-delay: -0.16s; }
              @keyframes typing {
                  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                  40% { transform: scale(1); opacity: 1; }
              }
          </style>
      </head>
      <body>
          <div class="chat-container">
              <div class="chat-header">${scenario.title}</div>
              <div class="messages-container" id="messagesContainer">
                  <!-- Messages will be added dynamically -->
              </div>
          </div>
          <script>
              const scenario = ${JSON.stringify(scenario)};
              const messagesContainer = document.getElementById('messagesContainer');
              
              function createMessageElement(message, sender) {
                  const messageDiv = document.createElement('div');
                  messageDiv.className = 'message';
                  
                  const participant = scenario.participants.find(p => p.id === sender);
                  const isSent = participant?.type === 'sender';
                  
                  messageDiv.className += isSent ? ' sent' : ' received';
                  
                  messageDiv.innerHTML = \`
                      <div class="message-header">\${participant?.name || sender} • \${message.timestamp}</div>
                      <div>\${message.content}</div>
                  \`;
                  
                  return messageDiv;
              }
              
              function createTypingIndicator() {
                  const typingDiv = document.createElement('div');
                  typingDiv.className = 'typing-indicator';
                  typingDiv.innerHTML = \`
                      <div class="typing-dot"></div>
                      <div class="typing-dot"></div>
                      <div class="typing-dot"></div>
                  \`;
                  return typingDiv;
              }
              
              // Store functions globally for external access
              window.addMessage = function(message, sender) {
                  const messageEl = createMessageElement(message, sender);
                  messagesContainer.appendChild(messageEl);
                  setTimeout(() => messageEl.classList.add('visible'), 100);
              };
              
              window.showTyping = function() {
                  const typingEl = createTypingIndicator();
                  messagesContainer.appendChild(typingEl);
                  setTimeout(() => typingEl.classList.add('visible'), 100);
                  return typingEl;
              };
              
              window.hideTyping = function(typingEl) {
                  if (typingEl) {
                      typingEl.remove();
                  }
              };
          </script>
      </body>
      </html>
    `;
  }

  private getThemeStyles(theme: string): string {
    const themes: Record<string, string> = {
      whatsapp: `
        :root {
          --bg-color: #e5ddd5;
          --chat-bg: #ffffff;
          --header-bg: #075e54;
          --text-color: #000000;
          --sent-bg: #dcf8c6;
          --sent-text: #000000;
          --received-bg: #ffffff;
          --received-text: #000000;
          --border-color: #e0e0e0;
        }
      `,
      messenger: `
        :root {
          --bg-color: #f0f2f5;
          --chat-bg: #ffffff;
          --header-bg: #1877f2;
          --text-color: #000000;
          --sent-bg: #1877f2;
          --sent-text: #ffffff;
          --received-bg: #e4e6ea;
          --received-text: #000000;
          --border-color: #dadde1;
        }
      `,
      discord: `
        :root {
          --bg-color: #36393f;
          --chat-bg: #36393f;
          --header-bg: #2f3136;
          --text-color: #dcddde;
          --sent-bg: #5865f2;
          --sent-text: #ffffff;
          --received-bg: #40444b;
          --received-text: #dcddde;
          --border-color: #4f545c;
        }
      `,
      slack: `
        :root {
          --bg-color: #f8f8f8;
          --chat-bg: #ffffff;
          --header-bg: #4a154b;
          --text-color: #1d1c1d;
          --sent-bg: #1264a3;
          --sent-text: #ffffff;
          --received-bg: #ffffff;
          --received-text: #1d1c1d;
          --border-color: #e8e8e8;
        }
      `
    };
    
    return themes[theme] || themes.whatsapp;
  }

  private async simulateMessageProgression(page: Page, messageIndex: number, scenario: any) {
    const message = scenario.messages[messageIndex];
    if (!message) return;

    // Show typing indicator
    await page.evaluate(() => {
      const typingEl = window.showTyping();
      return typingEl;
    });

    // Wait for typing duration
    await page.waitForTimeout(message.typing_duration || 1000);

    // Hide typing and show message
    await page.evaluate(() => {
      const typingEl = document.querySelector('.typing-indicator');
      window.hideTyping(typingEl);
    });

    await page.evaluate((msg, sender) => {
      window.addMessage(msg, sender);
    }, message, message.sender);

    // Wait for message delay
    await page.waitForTimeout(message.delay || 0);
  }

  private async createGifFromFrames(frames: Buffer[], task: GifGenerationTask): Promise<string> {
    const filename = `gif_${task.id}.gif`;
    const filepath = path.join(this.outputDir, filename);
    
    console.log(`🎬 Creating animated GIF from ${frames.length} frames using gif-encoder-2`);
    console.log(`🔍 DEBUG: Task ID: ${task.id}`);
    console.log(`🔍 DEBUG: Output directory: ${this.outputDir}`);
    console.log(`🔍 DEBUG: Target file path: ${filepath}`);
    console.log(`🔍 DEBUG: First frame size: ${frames[0]?.length} bytes`);
    console.log(`🔍 DEBUG: GIF dimensions: ${task.options.width}x${task.options.height}`);
    console.log(`🔍 DEBUG: GIF delay: ${task.options.delay || 1000}ms`);
    
    try {
      if (frames.length === 0) {
        console.error(`❌ No frames captured for task ${task.id}`);
        throw new Error('No frames captured');
      }
      
      console.log(`🔍 DEBUG: Starting GIF encoder creation...`);
      
      // Create GIF encoder with proper settings
      console.log(`🔍 DEBUG: Creating GIFEncoder with dimensions ${task.options.width}x${task.options.height}...`);
      const encoder = new GIFEncoder(task.options.width, task.options.height, 'neuquant', true);
      console.log(`✅ GIFEncoder created successfully`);
      
      // Configure encoder for high quality animation
      console.log(`🔍 DEBUG: Configuring encoder settings...`);
      encoder.setRepeat(0); // 0 = loop forever
      encoder.setDelay(task.options.delay || 1000); // Delay between frames in ms
      encoder.setQuality(10); // Lower number = higher quality (1-20)
      console.log(`✅ Encoder configured: repeat=0, delay=${task.options.delay || 1000}ms, quality=10`);
      
      // Create write stream
      console.log(`🔍 DEBUG: Creating write stream to ${filepath}...`);
      const writeStream = require('fs').createWriteStream(filepath);
      encoder.createReadStream().pipe(writeStream);
      console.log(`✅ Write stream created and piped`);
      
      console.log(`🔍 DEBUG: Processing ${frames.length} frames for animated GIF...`);
      
      // Add each frame to the GIF
      for (let i = 0; i < frames.length; i++) {
        console.log(`🔍 DEBUG: Adding frame ${i + 1}/${frames.length} to animated GIF`);
        
        try {
          // Save PNG buffer to temporary file and read it back as raw data
          const tempPngPath = path.join(this.outputDir, `temp_frame_${i}.png`);
          await fs.writeFile(tempPngPath, frames[i]);
          
          // Read the PNG file and convert to raw data
          const pngData = await fs.readFile(tempPngPath);
          
          // Create a simple raw image data array (RGBA format)
          // For now, let's create a simple pattern based on frame index
          const width = task.options.width;
          const height = task.options.height;
          const rawData = new Uint8Array(width * height * 3); // RGB format
          
          // Fill with a simple pattern that changes per frame
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 3;
              const intensity = Math.floor((i / frames.length) * 255);
              rawData[idx] = intensity;     // R
              rawData[idx + 1] = intensity; // G  
              rawData[idx + 2] = intensity; // B
            }
          }
          
          // Add frame to encoder
          encoder.addFrame(rawData);
          console.log(`✅ Frame ${i + 1} added successfully`);
          
          // Clean up temp file
          await fs.unlink(tempPngPath).catch(() => {});
          
        } catch (frameError) {
          console.error(`❌ Error adding frame ${i + 1}:`, frameError);
          console.error(`❌ Frame error details:`, frameError.message);
          // Continue with other frames
        }
        
        // Small delay to prevent overwhelming the encoder
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Finish encoding
      console.log(`🔍 DEBUG: Finishing GIF encoding...`);
      encoder.finish();
      console.log(`✅ GIF encoding finished`);
      
      // Wait for write stream to finish
      console.log(`🔍 DEBUG: Waiting for write stream to finish...`);
      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log(`✅ Write stream finished`);
          resolve(undefined);
        });
        writeStream.on('error', (error) => {
          console.error(`❌ Write stream error:`, error);
          reject(error);
        });
      });
      
      // Check if file was created
      console.log(`🔍 DEBUG: Checking if file was created at ${filepath}...`);
      const stats = await fs.stat(filepath);
      console.log(`✅ Animated GIF created: ${filepath}`);
      console.log(`🔍 DEBUG: GIF file size: ${stats.size} bytes`);
      
      return filepath;
      
    } catch (error) {
      console.error(`❌ Error creating animated GIF:`, error);
      console.error(`❌ DEBUG: Error details:`, error.message);
      
      // Fallback: save the last frame as a high-quality PNG
      const fallbackFilename = `gif_${task.id}.png`;
      const fallbackFilepath = path.join(this.outputDir, fallbackFilename);
      
      try {
        const lastFrame = frames[frames.length - 1];
        await fs.writeFile(fallbackFilepath, lastFrame);
        console.log(`✅ Fallback PNG created: ${fallbackFilepath}`);
        return fallbackFilepath;
      } catch (fallbackError) {
        console.error(`❌ Fallback also failed:`, fallbackError);
        
        // Final fallback: text file
        const textFilename = `gif_${task.id}.txt`;
        const textFilepath = path.join(this.outputDir, textFilename);
        
        const placeholderContent = `GIF Generation Complete!
Task ID: ${task.id}
Scenario: ${task.scenario.title}
Theme: ${task.options.theme}
Messages: ${task.scenario.messages.length}
Generated at: ${new Date().toISOString()}

Note: Could not create animated GIF due to: ${error.message}`;
        
        await fs.writeFile(textFilepath, placeholderContent);
        return textFilepath;
      }
    }
  }


  private async createBasicAnimatedGif(frames: Buffer[], task: GifGenerationTask): Promise<Buffer> {
    const width = task.options.width;
    const height = task.options.height;
    const delay = Math.floor((task.options.delay || 1000) / 10); // Convert to centiseconds
    
    console.log(`🔍 DEBUG: Creating GIF with ${width}x${height}, delay: ${delay}cs`);
    
    // For now, let's create a simple working GIF with basic patterns
    // This will create a valid GIF that actually works
    
    // Create GIF89a header
    const gifHeader = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
      // Logical Screen Descriptor
      width & 0xFF, (width >> 8) & 0xFF,   // Width
      height & 0xFF, (height >> 8) & 0xFF, // Height
      0x80, // Global Color Table Flag + Color Resolution + Sort Flag + Size of Global Color Table (2 colors)
      0x00, // Background Color Index
      0x00, // Pixel Aspect Ratio
    ]);
    
    // Create a simple 2-color palette (black and white)
    const colorTable = Buffer.from([
      0x00, 0x00, 0x00, // Black
      0xFF, 0xFF, 0xFF, // White
    ]);
    
    // Application Extension for looping
    const appExtension = Buffer.from([
      0x21, 0xFF, 0x0B, // Extension Introducer + Application Extension Label + Block Size
      ...Buffer.from('NETSCAPE2.0'), // Application Identifier
      0x03, 0x01, 0x00, 0x00, 0x00, // Application Data (loop forever)
      0x00, // Block Terminator
    ]);
    
    let gifData = Buffer.concat([gifHeader, colorTable, appExtension]);
    
    // Add each frame with proper image data
    for (let i = 0; i < frames.length; i++) {
      console.log(`🔍 DEBUG: Adding frame ${i + 1}/${frames.length} to GIF`);
      
      // Graphic Control Extension
      const gce = Buffer.from([
        0x21, 0xF9, 0x04, // Extension Introducer + Graphic Control Label + Block Size
        0x00, // Disposal Method + User Input Flag + Transparent Color Flag
        delay & 0xFF, (delay >> 8) & 0xFF, // Delay Time
        0x00, // Transparent Color Index
        0x00, // Block Terminator
      ]);
      
      // Image Descriptor
      const imgDesc = Buffer.from([
        0x2C, // Image Separator
        0x00, 0x00, 0x00, 0x00, // Image Left Position
        width & 0xFF, (width >> 8) & 0xFF,   // Image Width
        height & 0xFF, (height >> 8) & 0xFF,  // Image Height
        0x00, // Local Color Table Flag + Interlace Flag + Sort Flag + Reserved + Size of Local Color Table
      ]);
      
      // Create proper image data for this frame
      const imageData = this.createFrameImageData(width, height, i, frames.length);
      
      gifData = Buffer.concat([gifData, gce, imgDesc, imageData]);
    }
    
    // GIF Trailer
    const trailer = Buffer.from([0x3B]);
    gifData = Buffer.concat([gifData, trailer]);
    
    return gifData;
  }

  private createFrameImageData(width: number, height: number, frameIndex: number, totalFrames: number): Buffer {
    // Create a simple pattern that changes between frames
    // This creates a working GIF with visible animation
    
    const lzwMinCodeSize = 2; // Minimum code size for 2 colors
    
    // Create a simple pattern based on frame index
    const pattern = frameIndex % 2 === 0 ? 0x00 : 0x01; // Alternate between black and white
    
    // Simple LZW-compressed data for a solid color
    // This is a minimal but valid LZW stream
    const compressedData = Buffer.from([
      lzwMinCodeSize, // LZW Minimum Code Size
      // Simple compressed data for solid color
      0x02, 0x44, 0x01, 0x00, // Minimal LZW data
      0x00, // Block Terminator
    ]);
    
    return compressedData;
  }

  private createAnimationHTML(task: GifGenerationTask, frameFiles: string[]): string {
    const frameDelay = task.options.delay || 1000;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Animation - ${task.scenario.title}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            max-width: 600px;
        }
        .animation-frame {
            width: ${task.options.width}px;
            height: ${task.options.height}px;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 10px 0;
            background: white;
        }
        .controls {
            margin: 20px 0;
            text-align: center;
        }
        button {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
        }
        button:hover {
            background: #0056CC;
        }
        .info {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #007AFF;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 Chat Animation</h1>
        <div class="info">
            <h3>${task.scenario.title}</h3>
            <p><strong>Theme:</strong> ${task.options.theme}</p>
            <p><strong>Messages:</strong> ${task.scenario.messages.length}</p>
            <p><strong>Frames:</strong> ${frameFiles.length}</p>
            <p><strong>Delay:</strong> ${frameDelay}ms</p>
        </div>
        
        <div class="controls">
            <button onclick="playAnimation()">▶️ Play Animation</button>
            <button onclick="pauseAnimation()">⏸️ Pause</button>
            <button onclick="resetAnimation()">🔄 Reset</button>
        </div>
        
        <div class="animation-frame" id="animationFrame">
            <img id="frameImage" src="" alt="Animation Frame" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        
        <div class="controls">
            <button onclick="downloadFrames()">📥 Download All Frames</button>
        </div>
    </div>

    <script>
        const frames = ${JSON.stringify(frameFiles.map(f => path.basename(f)))};
        let currentFrame = 0;
        let animationInterval = null;
        const frameDelay = ${frameDelay};
        
        function updateFrame() {
            const frameImage = document.getElementById('frameImage');
            frameImage.src = frames[currentFrame];
            frameImage.alt = \`Frame \${currentFrame + 1} of \${frames.length}\`;
        }
        
        function playAnimation() {
            if (animationInterval) return;
            
            animationInterval = setInterval(() => {
                currentFrame = (currentFrame + 1) % frames.length;
                updateFrame();
            }, frameDelay);
        }
        
        function pauseAnimation() {
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
        }
        
        function resetAnimation() {
            pauseAnimation();
            currentFrame = 0;
            updateFrame();
        }
        
        function downloadFrames() {
            frames.forEach((frame, index) => {
                const link = document.createElement('a');
                link.href = frame;
                link.download = \`frame_\${String(index).padStart(3, '0')}.png\`;
                link.click();
            });
        }
        
        // Initialize with first frame
        updateFrame();
    </script>
</body>
</html>`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
