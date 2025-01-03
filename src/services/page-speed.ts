import { PageSpeedResponse, PageSpeedResult } from '../types';

interface Metric {
  name: string;
  value: string;
  category: string;
}

export class PageSpeedService implements PageSpeedResult {
  constructor(public raw: PageSpeedResponse) {}

  getPerformanceScore(): number {
    const categories = this.raw.lighthouseResult?.categories;
    const performance = categories?.performance;
    return performance?.score ?? 0;
  }

  getLoadingMetrics(): Metric[] {
    const metrics: Metric[] = [];
    const loadingMetrics = this.raw.loadingExperience?.metrics;
    
    if (loadingMetrics) {
      Object.entries(loadingMetrics).forEach(([name, data]) => {
        metrics.push({
          name,
          value: data.percentile.toString(),
          category: data.category
        });
      });
    }
    return metrics;
  }
} 