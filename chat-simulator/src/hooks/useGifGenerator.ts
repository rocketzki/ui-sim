import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import GIF from 'gif.js';

interface GifGeneratorOptions {
  width?: number;
  height?: number;
  quality?: number;
  delay?: number;
  repeat?: number;
}

interface GifGeneratorState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export const useGifGenerator = () => {
  const [state, setState] = useState<GifGeneratorState>({
    isGenerating: false,
    progress: 0,
    error: null,
  });

  const generateGif = useCallback(async (
    element: HTMLElement,
    options: GifGeneratorOptions = {}
  ): Promise<Blob | null> => {
    const {
      width = 400,
      height = 600,
      quality = 10,
      delay = 1000,
      repeat = 0
    } = options;

    setState({ isGenerating: true, progress: 0, error: null });

    try {
      // Create GIF instance
      const gif = new GIF({
        workers: 2,
        quality: quality,
        width: width,
        height: height,
        repeat: repeat,
      });

      // Set up progress tracking
      gif.on('progress', (p: number) => {
        setState(prev => ({ ...prev, progress: Math.round(p * 100) }));
      });

      // Capture the element multiple times to create animation frames
      const frames = 10; // Number of frames for the GIF
      const capturePromises = [];

      for (let i = 0; i < frames; i++) {
        capturePromises.push(
          html2canvas(element, {
            width: width,
            height: height,
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
          })
        );
      }

      // Wait for all captures to complete
      const canvases = await Promise.all(capturePromises);

      // Add frames to GIF
      canvases.forEach((canvas, index) => {
        gif.addFrame(canvas, { delay: delay });
      });

      // Generate the GIF
      return new Promise((resolve, reject) => {
        gif.on('finished', (blob: Blob) => {
          setState({ isGenerating: false, progress: 100, error: null });
          resolve(blob);
        });

        gif.on('error', (error: Error) => {
          setState({ isGenerating: false, progress: 0, error: error.message });
          reject(error);
        });

        gif.render();
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({ isGenerating: false, progress: 0, error: errorMessage });
      return null;
    }
  }, []);

  const downloadGif = useCallback((blob: Blob, filename: string = 'chat-simulation.gif') => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    generateGif,
    downloadGif,
    isGenerating: state.isGenerating,
    progress: state.progress,
    error: state.error,
  };
};
