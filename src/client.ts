import { PageSpeedService } from './service';
import type { BatchPageSpeedRequest, BatchPageSpeedResponse, PageSpeedResponse } from './types';

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

  static async analyzeBatch({
    urls,
    apiKey,
    concurrency = 3,
    delayBetweenRequests = 1000
  }: BatchPageSpeedRequest): Promise<BatchPageSpeedResponse> {
    const results = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalPerformanceScore = 0;

    // Process URLs in chunks based on concurrency
    for (let i = 0; i < urls.length; i += concurrency) {
      const chunk = urls.slice(i, i + concurrency);
      const promises = chunk.map(async (url) => {
        try {
          const result = await this.analyze(url, apiKey);
          successfulRequests++;
          const score = result.getPerformanceScore();
          totalPerformanceScore += score;
          return { url, response: result.raw };
        } catch (error) {
          failedRequests++;
          return { url, error: (error as Error).message };
        }
      });

      results.push(...await Promise.all(promises));

      // Add delay between chunks if not the last chunk
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    return {
      results,
      summary: {
        totalUrls: urls.length,
        successfulRequests,
        failedRequests,
        averagePerformanceScore: successfulRequests > 0 
          ? totalPerformanceScore / successfulRequests 
          : 0
      }
    };
  }
}

// Make PageSpeed available globally
window.PageSpeed = PageSpeed;