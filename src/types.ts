export interface PageSpeedResponse {
  id: string;  // Final URL after redirects
  loadingExperience: {
    metrics: {
      [key: string]: {
        category: 'FAST' | 'AVERAGE' | 'SLOW' | 'NONE';
        percentile: number;
      };
    };
  };
  lighthouseResult: {
    finalUrl: string;
    fetchTime: string;
    categories: {
      performance?: {
        score: number;
      };
    };
    audits: {
      [key: string]: {
        score: number;
        displayValue: string;
        title: string;
      };
    };
  };
}

export enum URLSourceMethod {
  SITEMAP = 'sitemap',
  GOOGLE_CACHE = 'googleCache' // Placeholder for future implementation
}

export interface URLSourceOptions {
  method: URLSourceMethod;
  baseUrl: string;
  // Add specific options for each method if needed
  sitemapOptions?: {
    paths?: string[]; // Optional override for default sitemap paths
  };
  // Placeholder for future Google Cache options
  googleCacheOptions?: Record<string, never>;
}

export interface BatchPageSpeedRequest {
  urls: string[];
  apiKey: string;
  concurrency?: number; // Number of concurrent requests
  delayBetweenRequests?: number; // Delay in ms between requests
  urlSource?: URLSourceOptions; // Optional to allow direct URL array input
}

export interface BatchPageSpeedResponse {
  results: {
    url: string;
    response?: PageSpeedResponse;  // Make response optional
    error?: string;
  }[];
  summary: {
    totalUrls: number;
    successfulRequests: number;
    failedRequests: number;
    averagePerformanceScore: number;
  };
}

export interface PageSpeedResult {
  raw: PageSpeedResponse;
  getPerformanceScore(): number;
  getLoadingMetrics(): Array<{
    name: string;
    value: string;
    category: string;
  }>;
}
