export class XMLParser {
  static async fetch(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.warn(`Failed to fetch XML from ${url}:`, error);
      return null;
    }
  }

  static extractPageUrls(xml: string): string[] {
    const urlRegex = /<url>[^<]*<loc>([^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(xml)) !== null) {
      urls.push(match[1].trim());
    }
    return urls;
  }

  static extractSitemapUrls(xml: string): string[] {
    const sitemapRegex = /<sitemap>[^<]*<loc>([^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match;
    
    while ((match = sitemapRegex.exec(xml)) !== null) {
      urls.push(match[1].trim());
    }
    return urls;
  }
} 