import { PageSpeedAPI } from './api/client';
import { BatchService } from './services/batch';
import { PageSpeedService } from './services/page-speed';
import type { BatchRequest, BatchResponse } from './types';

class PageSpeed {
  static async analyze(url: string, apiKey: string): Promise<PageSpeedService> {
    const response = await PageSpeedAPI.analyze(url, apiKey);
    return new PageSpeedService(response);
  }

  static analyzeBatch(request: BatchRequest): Promise<BatchResponse> {
    return BatchService.analyze(request);
  }
}

// Make PageSpeed available globally
declare global {
  interface Window {
    PageSpeed: typeof PageSpeed;
  }
}

window.PageSpeed = PageSpeed; 