/**
 * Simple in-memory cache with TTL support
 * For server-side caching of frequently accessed data
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL (in milliseconds)
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Clear expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 5 * 60 * 1000);
}

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATION = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
  HOUR: 60 * 60 * 1000,    // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Cached fetch wrapper
 * Caches GET requests with specified TTL
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = CACHE_DURATION.MEDIUM
): Promise<T> {
  // Only cache GET requests
  if (options.method && options.method !== 'GET') {
    const response = await fetch(url, options);
    return response.json();
  }

  // Generate cache key
  const cacheKey = `fetch:${url}`;

  // Check cache
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string | RegExp): void {
  const keys = cache.getStats().keys;
  
  if (typeof pattern === 'string') {
    // Exact match
    cache.delete(pattern);
    // Pattern match (contains)
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  } else {
    // Regex match
    keys.forEach(key => {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    });
  }
}
