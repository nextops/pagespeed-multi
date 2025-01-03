import { XMLParser } from '../utils/xml';
import { URLSource } from './index';
import { RobotsParser } from '../utils/robots-parser';

export class SitemapURLSource implements URLSource {
  private static readonly DEFAULT_PATHS = [
    // Standard names from protocol
    '/sitemap.xml',
    '/sitemap.xml.gz',
    '/sitemap_index.xml',
    '/sitemap_index.xml.gz',
    '/sitemap-index.xml',
    '/sitemap-index.xml.gz',
    
    // Common CMS and platform variations
    '/sitemapindex.xml',
    '/sitemapindex.xml.gz',
    '/sitemap/sitemap.xml',
    '/sitemap/sitemap.xml.gz',
    '/sitemap/index.xml',
    '/sitemap/index.xml.gz',
    
    // Common content-specific sitemaps
    '/post-sitemap.xml',
    '/post-sitemap.xml.gz',
    '/page-sitemap.xml',
    '/page-sitemap.xml.gz',
    '/category-sitemap.xml',
    '/category-sitemap.xml.gz',
    '/product-sitemap.xml',
    '/product-sitemap.xml.gz',
    
    // Legacy and alternative formats
    '/sitemap.php',
    '/sitemap.txt'
  ];

  constructor(private readonly paths: string[] = SitemapURLSource.DEFAULT_PATHS) {}

  async getUrls(baseUrl: string, onProgress?: (message: string) => void): Promise<{ 
    urls: string[]; 
    sitemaps: Array<{ url: string; urlCount: number }> 
  }> {
    const logProgress = (message: string): void => {
      console.log('SitemapURLSource:', message);
      onProgress?.(message);
    };

    logProgress('🔍 Checking for sitemaps...');
    const robotsSitemaps = await RobotsParser.getSitemapUrls(baseUrl);
    
    if (robotsSitemaps.length > 0) {
      logProgress(`📋 Found ${robotsSitemaps.length} sitemaps in robots.txt`);
    }

    // Combine robots.txt sitemaps with default paths
    const pathsToTry = [...robotsSitemaps];
    if (pathsToTry.length === 0) {
      for (const path of this.paths) {
        pathsToTry.push(new URL(path, baseUrl).toString());
      }
    }

    const allUrls: Set<string> = new Set();
    const sitemaps: Array<{ url: string; urlCount: number }> = [];

    for (const sitemapUrl of pathsToTry) {
      logProgress(`📁 Checking ${sitemapUrl}`);
      
      const xml = await XMLParser.fetch(sitemapUrl);
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