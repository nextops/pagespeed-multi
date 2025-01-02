import { XMLParser } from '../utils/xml';
import { URLSource } from './index';

export class SitemapURLSource implements URLSource {
  private static readonly DEFAULT_PATHS = [
    '/sitemap.xml',
    '/sitemap-index.xml',
    '/sitemap_index.xml'
  ];

  constructor(private readonly paths: string[] = SitemapURLSource.DEFAULT_PATHS) {}

  async getUrls(baseUrl: string): Promise<string[]> {
    const allUrls: Set<string> = new Set();

    for (const path of this.paths) {
      const sitemapUrl = new URL(path, baseUrl).toString();
      const xml = await XMLParser.fetch(sitemapUrl);
      if (!xml) continue;

      const sitemapUrls = XMLParser.extractSitemapUrls(xml);
      if (sitemapUrls.length > 0) {
        for (const url of sitemapUrls) {
          const subXml = await XMLParser.fetch(url);
          if (subXml) {
            XMLParser.extractPageUrls(subXml).forEach(url => allUrls.add(url));
          }
        }
      } else {
        XMLParser.extractPageUrls(xml).forEach(url => allUrls.add(url));
      }

      if (allUrls.size > 0) break;
    }

    if (allUrls.size === 0) {
      throw new Error('No valid sitemap found');
    }

    return Array.from(allUrls);
  }
} 