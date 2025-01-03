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

    const allUrls: Set<string> = new Set();
    const sitemaps: Array<{ url: string; urlCount: number }> = [];
    let fetchError: Error | null = null;

    logProgress('🔍 Checking for sitemaps...');
    
    try {
      const robotsSitemaps = await RobotsParser.getSitemapUrls(baseUrl);
      
      // Combine robots.txt sitemaps with default paths
      const pathsToTry = [
        ...robotsSitemaps,
        ...this.paths.map(path => new URL(path, baseUrl).toString())
      ];

      // Try all possible sitemap locations
      for (const sitemapUrl of pathsToTry) {
        logProgress(`📁 Checking ${sitemapUrl}`);
        
        try {
          const xml = await XMLParser.fetch(sitemapUrl, onProgress);
          if (xml) {
            const pageUrls = XMLParser.extractPageUrls(xml);
            if (pageUrls.length > 0) {
              sitemaps.push({ url: sitemapUrl, urlCount: pageUrls.length });
              logProgress(`✅ Found ${pageUrls.length} URLs in ${sitemapUrl}`);
              pageUrls.forEach(url => allUrls.add(url));
              break;
            }
          }
        } catch (error) {
          // Log and store the error
          if (error instanceof Error) {
            fetchError = error;
            logProgress(`⚠️ ${error.message}`);
          }
        }
      }

      if (allUrls.size === 0) {
        if (fetchError) {
          throw fetchError;
        }
        throw new Error('No URLs found in any sitemap');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logProgress(`❌ Sitemap discovery failed: ${errorMessage}`);
      throw error;
    }

    logProgress(`🎉 Discovery complete! Found ${allUrls.size} unique URLs across ${sitemaps.length} sitemaps`);
    return { urls: Array.from(allUrls), sitemaps };
  }
} 