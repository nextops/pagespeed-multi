import { PageSpeedResponse, PageSpeedResult } from './types';

interface Metric {
  name: string;
  value: string;
  category: string;
}

export class PageSpeedService implements PageSpeedResult {
  constructor(public raw: PageSpeedResponse) {}

  getPerformanceScore(): number {
    const categories = this.raw.lighthouseResult && this.raw.lighthouseResult.categories;
    const performance = categories && categories.performance;
    return (performance && performance.score) || 0;
  }

  getLoadingMetrics(): Metric[] {
    const metrics: Metric[] = [];
    const loadingMetrics = this.raw.loadingExperience && this.raw.loadingExperience.metrics;
    
    if (loadingMetrics) {
      Object.keys(loadingMetrics).forEach(name => {
        const data = loadingMetrics[name];
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