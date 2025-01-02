import { XMLParser } from '../utils/xml';
import { URLSource } from './index';

export class SitemapURLSource implements URLSource {
  private static readonly DEFAULT_PATHS = [
    '/sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap_index.xml'
  ];

  constructor(private readonly paths: string[] = SitemapURLSource.DEFAULT_PATHS) {}

  async getUrls(baseUrl: string, onProgress?: (message: string) => void): Promise<{ 
    urls: string[]; 
    sitemaps: Array<{ url: string; urlCount: number }> 
  }> {
    console.log('SitemapURLSource: Starting getUrls with progress callback:', !!onProgress);
    
    const allUrls: Set<string> = new Set();
    const sitemaps: Array<{ url: string; urlCount: number }> = [];
    
    const logProgress = (message: string): void => {
      console.log('SitemapURLSource:', message);
      onProgress?.(message);
    };
    
    logProgress('🔍 Starting sitemap discovery...');

    for (const path of this.paths) {
      const sitemapUrl = new URL(path, baseUrl).toString();
      const xml = await XMLParser.fetch(sitemapUrl, onProgress);
      if (!xml) continue;

      const sitemapUrls = XMLParser.extractSitemapUrls(xml, onProgress);
      if (sitemapUrls.length > 0) {
        onProgress?.(`📚 Found sitemap index with ${sitemapUrls.length} sitemaps`);
        
        for (const [index, url] of sitemapUrls.entries()) {
          onProgress?.(`📄 Loading sitemap ${index + 1}/${sitemapUrls.length}: ${url}`);
          const subXml = await XMLParser.fetch(url, onProgress);
          if (subXml) {
            const pageUrls = XMLParser.extractPageUrls(subXml, onProgress);
            sitemaps.push({ url, urlCount: pageUrls.length });
            onProgress?.(`✅ Found ${pageUrls.length} URLs in sitemap ${index + 1}`);
            pageUrls.forEach(url => allUrls.add(url));
          }
        }
      } else {
        const pageUrls = XMLParser.extractPageUrls(xml, onProgress);
        if (pageUrls.length > 0) {
          sitemaps.push({ url: sitemapUrl, urlCount: pageUrls.length });
          onProgress?.(`✅ Found ${pageUrls.length} URLs in sitemap`);
          pageUrls.forEach(url => allUrls.add(url));
        }
      }

      if (allUrls.size > 0) break;
    }

    if (allUrls.size === 0) {
      onProgress?.('❌ No valid URLs found in any sitemap');
      throw new Error('No valid sitemap found');
    }

    onProgress?.(`🎉 Discovery complete! Found ${allUrls.size} unique URLs across ${sitemaps.length} sitemaps`);
    return { urls: Array.from(allUrls), sitemaps };
  }
} 