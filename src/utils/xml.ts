export class XMLParser {
  static async fetch(url: string, onProgress?: (message: string) => void): Promise<string | null> {
    try {
      onProgress?.(`Fetching XML from ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/xml, application/xml, text/plain',
        }
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status} - ${response.statusText}`);
        onProgress?.(`Failed to fetch ${url}: ${error.message}`);
        throw error;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('xml') && !contentType?.includes('text')) {
        const error = new Error(`Unexpected content type: ${contentType}`);
        onProgress?.(`Invalid content type for ${url}: ${contentType}`);
        throw error;
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('CORS error: Browser security prevented access to sitemap');
        }
        throw error;
      }
      throw new Error(`Failed to fetch ${url}: ${error}`);
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