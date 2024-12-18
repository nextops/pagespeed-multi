import { PageSpeedService } from './service';
import type { PageSpeedResponse } from './types';

declare global {
  interface Window {
    PageSpeed: typeof PageSpeed;
  }
}

class PageSpeed {
  private static API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  static async analyze(url: string, apiKey: string): Promise<PageSpeedService> {
    const apiUrl = new URL(this.API_URL);
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', apiKey);

    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as PageSpeedResponse;
    return new PageSpeedService(data);
  }
}

// Make PageSpeed available globally
window.PageSpeed = PageSpeed;