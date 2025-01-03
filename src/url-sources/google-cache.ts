import { URLSource } from './index';

export class GoogleCacheURLSource implements URLSource {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async getUrls(baseUrl: string, onProgress?: (message: string) => void): Promise<{ 
    urls: string[]; 
    sitemaps: Array<{ url: string; urlCount: number }> 
  }> {
    console.warn('Google Cache URL source not yet implemented');
    return { urls: [], sitemaps: [] };
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
} 