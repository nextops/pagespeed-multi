export class RobotsParser {
  static async getSitemapUrls(baseUrl: string): Promise<string[]> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString();
      const response = await fetch(robotsUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/plain'
        }
      });
      
      if (response.status === 404) {
        // Silently handle missing robots.txt
        return [];
      }

      if (!response.ok) {
        console.warn(`Unable to access robots.txt at ${robotsUrl} (${response.status})`);
        return [];
      }

      const text = await response.text();
      const sitemapUrls: string[] = [];
      
      // Split into lines and find Sitemap: directives
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('sitemap:')) {
          const url = trimmed.substring(8).trim();
          if (this.isValidUrl(url)) {
            sitemapUrls.push(url);
          }
        }
      }

      return sitemapUrls;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('CORS')) {
        // Silently handle CORS errors
        return [];
      }
      console.warn('Error accessing robots.txt:', error);
      return [];
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
} 