export enum URLSourceMethod {
  SITEMAP = 'sitemap',
  GOOGLE_CACHE = 'googleCache'
}

export interface URLSourceOptions {
  method: URLSourceMethod;
  baseUrl: string;
  sitemapOptions?: {
    paths?: string[];
  };
  googleCacheOptions?: Record<string, never>;
}

export interface URLSource {
  getUrls(baseUrl: string): Promise<string[]>;
} 