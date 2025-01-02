import { PageSpeedService } from './service';
import { URLSourceMethod } from './types';
import type { BatchPageSpeedRequest, BatchPageSpeedResponse, PageSpeedResponse, URLSourceOptions } from './types';

declare global {
  interface Window {
    PageSpeed: typeof PageSpeed;
  }
}

class PageSpeed {
  private static API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  private static DEFAULT_SITEMAP_PATHS = [
    '/sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap_index.xml'
  ];

  private static async getUrlsFromSitemap(baseUrl: string, paths: string[] = PageSpeed.DEFAULT_SITEMAP_PATHS): Promise<string[]> {
    for (const path of paths) {
      try {
        const sitemapUrl = new URL(path, baseUrl).toString();
        const response = await fetch(sitemapUrl);
        if (!response.ok) continue;

        const text = await response.text();
        // Basic XML parsing to extract URLs
        const urls = text.match(/<loc>(.*?)<\/loc>/g)
          ?.map(loc => loc.replace(/<\/?loc>/g, '')) || [];
        
        if (urls.length > 0) return urls;
      } catch (error) {
        console.warn(`Failed to fetch sitemap at ${path}:`, error);
      }
    }
    throw new Error('No valid sitemap found');
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  private static async getUrlsFromGoogleCache(baseUrl: string): Promise<string[]> {
    // Placeholder for future implementation
    console.warn('Google Cache URL source not yet implemented');
    return [];
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  static async getUrls(options: URLSourceOptions): Promise<string[]> {
    switch (options.method) {
    case URLSourceMethod.SITEMAP:
      return this.getUrlsFromSitemap(
        options.baseUrl,
        options.sitemapOptions?.paths
      );
    case URLSourceMethod.GOOGLE_CACHE:
      return this.getUrlsFromGoogleCache(options.baseUrl);
    default:
      throw new Error(`Unsupported URL source method: ${options.method}`);
    }
  }

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
    delayBetweenRequests = 1000,
    urlSource
  }: BatchPageSpeedRequest): Promise<BatchPageSpeedResponse> {
    const urlsToAnalyze = urlSource 
      ? await this.getUrls(urlSource)
      : urls;

    const results = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalPerformanceScore = 0;

    // Process URLs in chunks based on concurrency
    for (let i = 0; i < urlsToAnalyze.length; i += concurrency) {
      const chunk = urlsToAnalyze.slice(i, i + concurrency);
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
      if (i + concurrency < urlsToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    return {
      results,
      summary: {
        totalUrls: urlsToAnalyze.length,
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