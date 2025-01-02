import { PageSpeedAPI } from '../api/client';
import { PageSpeedService } from './page-speed';
import { BatchRequest, BatchResponse } from '../types/index';
import { URLSource, URLSourceMethod } from '../url-sources';
import { SitemapURLSource } from '../url-sources/sitemap';
import { GoogleCacheURLSource } from '../url-sources/google-cache';

export class BatchService {
  static async getUrlsFromSource(options: BatchRequest['urlSource']): Promise<string[]> {
    if (!options) return [];

    let urlSource: URLSource;
    switch (options.method) {
    case URLSourceMethod.SITEMAP:
      urlSource = new SitemapURLSource(options.sitemapOptions?.paths);
      break;
    case URLSourceMethod.GOOGLE_CACHE:
      urlSource = new GoogleCacheURLSource();
      break;
    default:
      throw new Error(`Unsupported URL source method: ${options.method}`);
    }
    return urlSource.getUrls(options.baseUrl);
  }

  static async analyze({
    urls,
    apiKey,
    concurrency = 3,
    delayBetweenRequests = 1000,
    urlSource
  }: BatchRequest): Promise<BatchResponse> {
    const urlsToAnalyze = urlSource 
      ? await this.getUrlsFromSource(urlSource)
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
          const response = await PageSpeedAPI.analyze(url, apiKey);
          const service = new PageSpeedService(response);
          successfulRequests++;
          const score = service.getPerformanceScore();
          totalPerformanceScore += score;
          return { url, response };
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