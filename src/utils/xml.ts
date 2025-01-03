export class XMLParser {
  static async fetch(url: string, onProgress?: (message: string) => void): Promise<string | null> {
    console.log('XMLParser: Starting fetch with progress callback:', !!onProgress);
    try {
      const message = `Fetching XML from ${url}`;
      console.log('XMLParser:', message);
      onProgress?.(message);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        onProgress?.(`Failed to fetch ${url}: HTTP ${response.status}`);
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('xml') && !contentType?.includes('text')) {
        onProgress?.(`Unexpected content type for ${url}: ${contentType}`);
        return null;
      }

      return await response.text();
    } catch (error) {
      onProgress?.(`Error fetching ${url}: ${error}`);
      return null;
    }
  }

  static extractPageUrls(xml: string, onProgress?: (message: string) => void): string[] {
    const urls = this.extractUrls(xml, /<(?:\w+:)?url>[^<]*<(?:\w+:)?loc>([^<]+)<\/(?:\w+:)?loc>/g);
    onProgress?.(`Found ${urls.length} page URLs`);
    return urls;
  }

  static extractSitemapUrls(xml: string, onProgress?: (message: string) => void): string[] {
    const urls = this.extractUrls(xml, /<(?:\w+:)?sitemap>[^<]*<(?:\w+:)?loc>([^<]+)<\/(?:\w+:)?loc>/g);
    onProgress?.(`Found ${urls.length} sitemap URLs`);
    return urls;
  }

  private static extractUrls(xml: string, regex: RegExp): string[] {
    const urls: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      urls.push(match[1].trim());
    }
    return urls;
  }
} 