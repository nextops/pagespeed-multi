import { URLSource } from './index';

export class GoogleCacheURLSource implements URLSource {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async getUrls(baseUrl: string): Promise<string[]> {
    console.warn('Google Cache URL source not yet implemented');
    return [];
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
} 