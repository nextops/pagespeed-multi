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

export interface BatchPageSpeedRequest {
  urls: string[];
  apiKey: string;
  concurrency?: number; // Number of concurrent requests
  delayBetweenRequests?: number; // Delay in ms between requests
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
