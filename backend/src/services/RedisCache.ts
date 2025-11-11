/**
 * Redis Caching Service
 * Implements cache-aside pattern with Upstash Redis
 * TTL: 30-60 seconds for real-time data freshness
 */

import { Redis } from '@upstash/redis';

export interface CacheConfig {
  url?: string;
  token?: string;
  defaultTTL?: number; // seconds
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export class RedisCacheService {
  private redis: Redis;
  private defaultTTL: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  constructor(config?: CacheConfig) {
    // Initialize Redis client
    const url = config?.url || process.env.UPSTASH_REDIS_REST_URL;
    const token = config?.token || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Redis URL and token are required. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.');
    }

    this.redis = new Redis({
      url,
      token,
    });

    this.defaultTTL = config?.defaultTTL || 60; // 60 seconds default
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      
      if (data !== null) {
        this.stats.hits++;
        this.updateHitRate();
        return data as T;
      }

      this.stats.misses++;
      this.updateHitRate();
      return null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.defaultTTL;
      await this.redis.setex(key, ttl, JSON.stringify(value));
      this.stats.sets++;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.stats.deletes++;
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache by pattern
   * Uses SCAN for safe pattern matching without blocking
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      let cursor = 0;
      let deletedCount = 0;
      const keys: string[] = [];

      // Use SCAN to find matching keys (safer than KEYS for production)
      do {
        const result = await this.redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        
        cursor = result[0];
        const matchedKeys = result[1];
        
        if (matchedKeys && matchedKeys.length > 0) {
          keys.push(...matchedKeys);
        }
      } while (cursor !== 0);

      // Delete all matched keys
      if (keys.length > 0) {
        await this.redis.del(...keys);
        deletedCount = keys.length;
        this.stats.deletes += deletedCount;
      }

      return deletedCount;
    } catch (error) {
      console.error(`Redis INVALIDATE PATTERN error for ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Cache warming - pre-populate cache with frequently accessed data
   */
  async warm(keys: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      for (const item of keys) {
        const ttl = item.ttl || this.defaultTTL;
        pipeline.setex(item.key, ttl, JSON.stringify(item.value));
      }

      await pipeline.exec();
      this.stats.sets += keys.length;
      console.log(`Cache warmed with ${keys.length} keys`);
    } catch (error) {
      console.error('Redis WARM error:', error);
      throw error;
    }
  }

  /**
   * Get multiple keys at once (pipeline)
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];

      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.get(key));
      
      const results = await pipeline.exec();
      
      return results.map((result, index) => {
        if (result !== null) {
          this.stats.hits++;
          return result as T;
        }
        this.stats.misses++;
        return null;
      });
    } catch (error) {
      console.error('Redis MGET error:', error);
      keys.forEach(() => this.stats.misses++);
      return keys.map(() => null);
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set multiple keys at once (pipeline)
   */
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      if (items.length === 0) return;

      const pipeline = this.redis.pipeline();

      for (const item of items) {
        const ttl = item.ttl || this.defaultTTL;
        pipeline.setex(item.key, ttl, JSON.stringify(item.value));
      }

      await pipeline.exec();
      this.stats.sets += items.length;
    } catch (error) {
      console.error('Redis MSET error:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Flush entire cache (use with caution!)
   */
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushdb();
      console.warn('Cache flushed - all keys deleted');
    } catch (error) {
      console.error('Redis FLUSH error:', error);
      throw error;
    }
  }

  /**
   * Ping Redis to check connection
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<any> {
    try {
      const info = await this.redis.info();
      return info;
    } catch (error) {
      console.error('Redis INFO error:', error);
      return null;
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // Sports and events
  sports: () => 'sports:all',
  events: (sport: string) => `events:${sport}`,
  event: (sport: string, eventId: string) => `event:${sport}:${eventId}`,
  
  // Bookmakers
  bookmakers: (region?: string) => region ? `bookmakers:${region}` : 'bookmakers:all',
  
  // Player props
  props: (eventId: string) => `props:${eventId}`,
  playerProps: (playerId: string) => `player:${playerId}:props`,
  
  // Parlay calculations (short TTL)
  parlay: (hash: string) => `parlay:${hash}`,
  
  // Market insights
  insights: (sport: string) => `insights:${sport}`,
  edges: (sport: string) => `edges:${sport}`,
  
  // Live scores
  scores: (sport: string) => `scores:${sport}`,
  liveGames: () => 'games:live',
  
  // API quota
  quota: () => 'api:quota',
};

/**
 * TTL presets for different data types
 */
export const CacheTTL = {
  REALTIME: 30,      // 30 seconds for live odds
  SHORT: 60,         // 1 minute for frequently updated data
  MEDIUM: 300,       // 5 minutes for semi-static data
  LONG: 3600,        // 1 hour for rarely changing data
  DAILY: 86400,      // 24 hours for daily data
  PARLAY: 15,        // 15 seconds for parlay calculations (very short)
};

/**
 * Singleton instance for global access
 */
let cacheInstance: RedisCacheService | null = null;

export function getCache(config?: CacheConfig): RedisCacheService {
  if (!cacheInstance) {
    cacheInstance = new RedisCacheService(config);
  }
  return cacheInstance;
}

export default RedisCacheService;
