import { PageSpeedAPI } from './api/client';
import { BatchService } from './services/batch';
import { PageSpeedService } from './services/page-speed';
import type { BatchRequest, BatchResponse, ProgressCallback } from './types';

class PageSpeed {
  static async analyze(url: string, apiKey: string): Promise<PageSpeedService> {
    const response = await PageSpeedAPI.analyze(url, apiKey);
    return new PageSpeedService(response);
  }

  static analyzeBatch(request: BatchRequest, progress?: ProgressCallback): Promise<BatchResponse> {
    console.log('PageSpeed.analyzeBatch called with progress:', progress); // Debug
    return BatchService.analyze(request, progress);
  }
}

// Make PageSpeed available globally
declare global {
  interface Window {
    PageSpeed: typeof PageSpeed;
  }
}

window.PageSpeed = PageSpeed; 