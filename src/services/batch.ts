import { PageSpeedAPI } from '../api/client';
import { PageSpeedService } from './page-speed';
import { BatchRequest, BatchResponse } from '../types/index';
import { URLSource, URLSourceMethod } from '../url-sources';
import { SitemapURLSource } from '../url-sources/sitemap';
import { GoogleCacheURLSource } from '../url-sources/google-cache';

interface ProgressCallback {
  onStart?: (total: number) => void;
  onProgress?: (current: number, total: number) => void;
  onSitemapProgress?: (message: string) => void;
  onDiscoveryComplete?: (sitemaps: Array<{ url: string; urlCount: number }>) => void;
}

export class BatchService {
  static async getUrlsFromSource(
    options: BatchRequest['urlSource'], 
    progress?: ProgressCallback
  ): Promise<{ urls: string[]; sitemaps: Array<{ url: string; urlCount: number }> }> {
    if (!options) return { urls: [], sitemaps: [] };

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
    return urlSource.getUrls(options.baseUrl, progress?.onSitemapProgress);
  }

  static async analyze({
    urls,
    apiKey,
    concurrency = 3,
    delayBetweenRequests = 1000,
    urlSource
  }: BatchRequest, progress?: ProgressCallback): Promise<BatchResponse> {
    console.log('BatchService: Starting analysis with progress callbacks:', progress);
    
    // Discovery phase
    console.log('BatchService: Starting URL discovery');
    const { urls: urlsToAnalyze, sitemaps } = urlSource 
      ? await this.getUrlsFromSource(urlSource, progress)
      : { urls, sitemaps: [] };

    console.log('BatchService: Discovery complete', { urlCount: urlsToAnalyze.length, sitemaps });

    progress?.onSitemapProgress?.(`Discovery complete! Found ${urlsToAnalyze.length} URLs across ${sitemaps.length} sitemaps`);

    // Notify about discovered sitemaps and URLs
    if (progress?.onDiscoveryComplete) {
      progress?.onSitemapProgress?.('Preparing batch processing...');
      await progress.onDiscoveryComplete(sitemaps);
      progress?.onSitemapProgress?.('Batch processing configuration confirmed');
    }

    progress?.onStart?.(urlsToAnalyze.length);
    progress?.onSitemapProgress?.(`Starting to process ${urlsToAnalyze.length} URLs (${concurrency} at a time, with ${delayBetweenRequests}ms delay between batches)`);

    const results = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalPerformanceScore = 0;
    let processedCount = 0;

    // Process URLs in chunks based on concurrency
    for (let i = 0; i < urlsToAnalyze.length; i += concurrency) {
      const chunk = urlsToAnalyze.slice(i, i + concurrency);
      progress?.onSitemapProgress?.(`Processing batch ${Math.floor(i/concurrency) + 1} of ${Math.ceil(urlsToAnalyze.length/concurrency)}`);
      
      const promises = chunk.map(async (url) => {
        try {
          progress?.onSitemapProgress?.(`Starting analysis of ${url}`);
          const response = await PageSpeedAPI.analyze(url, apiKey);
          const service = new PageSpeedService(response);
          successfulRequests++;
          const score = service.getPerformanceScore();
          totalPerformanceScore += score;
          progress?.onSitemapProgress?.(`✅ Completed ${url} (Score: ${Math.round(score * 100)}%)`);
          return { url, response };
        } catch (error) {
          failedRequests++;
          progress?.onSitemapProgress?.(`❌ Failed ${url}: ${(error as Error).message}`);
          return { url, error: (error as Error).message };
        } finally {
          processedCount++;
          progress?.onProgress?.(processedCount, urlsToAnalyze.length);
        }
      });

      results.push(...await Promise.all(promises));

      // Add delay between chunks if not the last chunk
      if (i + concurrency < urlsToAnalyze.length) {
        progress?.onSitemapProgress?.(`Waiting ${delayBetweenRequests}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    progress?.onSitemapProgress?.('✨ Processing complete!');

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