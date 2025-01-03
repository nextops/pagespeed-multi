import { PageSpeedResponse } from '../types';

export class PageSpeedAPI {
  private static readonly API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  static async analyze(url: string, apiKey: string): Promise<PageSpeedResponse> {
    const apiUrl = new URL(this.API_URL);
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', apiKey);

    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json() as PageSpeedResponse;
  }
} 