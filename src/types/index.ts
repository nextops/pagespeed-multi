import { URLSourceOptions } from '../url-sources';

export interface PageSpeedResponse {
  id: string;
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

export interface PageSpeedResult {
  raw: PageSpeedResponse;
  getPerformanceScore(): number;
  getLoadingMetrics(): Array<{
    name: string;
    value: string;
    category: string;
  }>;
}

export interface BatchRequest {
  urls: string[];
  apiKey: string;
  concurrency?: number;
  delayBetweenRequests?: number;
  urlSource?: URLSourceOptions;
}

export interface BatchResponse {
  results: {
    url: string;
    response?: PageSpeedResponse;
    error?: string;
  }[];
  summary: {
    totalUrls: number;
    successfulRequests: number;
    failedRequests: number;
    averagePerformanceScore: number;
  };
} 