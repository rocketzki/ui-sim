export interface GifGenerationTask {
  id: string;
  scenario: any; // Scenario data from frontend
  options: {
    width: number;
    height: number;
    quality: number;
    delay: number;
    theme: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  downloadUrl?: string;
}

export interface CreateGifRequest {
  scenario: any;
  options: {
    width?: number;
    height?: number;
    quality?: number;
    delay?: number;
    theme?: string;
  };
}

export interface GifStatusResponse {
  id: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}
