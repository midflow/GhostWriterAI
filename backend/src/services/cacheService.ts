import crypto from 'crypto';

interface CacheEntry {
  value: string[];
  expiresAt: number;
}

/**
 * In-memory cache for LLM results
 * In production, consider using Redis
 */
class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key from message and tone
   */
  private generateKey(message: string, tone: string): string {
    const combined = `${message}:${tone}`;
    return crypto.createHash('md5').update(combined).digest('hex');
  }

  /**
   * Get cached result
   */
  get(message: string, tone: string): string[] | null {
    const key = this.generateKey(message, tone);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cache entry
   */
  set(message: string, tone: string, value: string[], ttl: number = this.DEFAULT_TTL): void {
    const key = this.generateKey(message, tone);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, entry.expiresAt - Date.now()),
      })),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Run cleanup every hour
setInterval(() => {
  cacheService.cleanup();
}, 60 * 60 * 1000);

export default cacheService;
