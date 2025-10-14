/**
 * Smart Cache Manager for Nova Titan AI
 * Intelligent caching system to minimize credit usage while keeping data fresh
 */

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  priority: 'low' | 'medium' | 'high' | 'critical';
  refreshStrategy: 'lazy' | 'background' | 'realtime';
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  config: CacheConfig;
}

class SmartCacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private refreshTimers = new Map<string, NodeJS.Timeout>();
  private backgroundRefreshQueue = new Set<string>();

  // Cache configurations for different data types
  private readonly cacheConfigs: Record<string, CacheConfig> = {
    // Games data - moderate refresh needed
    'games_nfl': { key: 'games_nfl', ttl: 10 * 60 * 1000, priority: 'high', refreshStrategy: 'background' }, // 10 min
    'games_nba': { key: 'games_nba', ttl: 10 * 60 * 1000, priority: 'high', refreshStrategy: 'background' }, // 10 min
    'games_cfb': { key: 'games_cfb', ttl: 15 * 60 * 1000, priority: 'medium', refreshStrategy: 'background' }, // 15 min
    'games_mlb': { key: 'games_mlb', ttl: 10 * 60 * 1000, priority: 'medium', refreshStrategy: 'background' }, // 10 min

    // Live scores - need frequent updates during games only
    'live_scores': { key: 'live_scores', ttl: 30 * 1000, priority: 'critical', refreshStrategy: 'realtime' }, // 30 sec
    
    // Odds data - expensive API calls, cache longer
    'odds_general': { key: 'odds_general', ttl: 5 * 60 * 1000, priority: 'high', refreshStrategy: 'lazy' }, // 5 min
    'odds_live': { key: 'odds_live', ttl: 2 * 60 * 1000, priority: 'critical', refreshStrategy: 'background' }, // 2 min
    
    // Player props - expensive, cache longer
    'player_props': { key: 'player_props', ttl: 20 * 60 * 1000, priority: 'medium', refreshStrategy: 'lazy' }, // 20 min
    
    // Team stats - rarely change, cache long
    'team_stats': { key: 'team_stats', ttl: 60 * 60 * 1000, priority: 'low', refreshStrategy: 'lazy' }, // 1 hour
    
    // Predictions - can cache for moderate time
    'predictions': { key: 'predictions', ttl: 15 * 60 * 1000, priority: 'medium', refreshStrategy: 'background' }, // 15 min

    // Standings - change infrequently
    'standings': { key: 'standings', ttl: 2 * 60 * 60 * 1000, priority: 'low', refreshStrategy: 'lazy' }, // 2 hours
  };

  /**
   * Get data from cache or fetch if needed
   */
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>,
    customConfig?: Partial<CacheConfig>
  ): Promise<T> {
    const config = { ...this.getConfig(key), ...customConfig };
    const cacheItem = this.cache.get(key);

    // Update access statistics
    if (cacheItem) {
      cacheItem.accessCount++;
      cacheItem.lastAccessed = Date.now();
    }

    // Check if cache is valid
    if (cacheItem && this.isCacheValid(cacheItem)) {
      // Setup background refresh if needed
      if (config.refreshStrategy === 'background' && this.shouldBackgroundRefresh(cacheItem)) {
        this.scheduleBackgroundRefresh(key, fetcher, config);
      }
      
      return cacheItem.data;
    }

    // Cache miss or expired - fetch fresh data
    console.log(`🔄 Cache miss for ${key}, fetching fresh data...`);
    const freshData = await fetcher();
    this.set(key, freshData, config);
    
    return freshData;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const finalConfig = config || this.getConfig(key);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      config: finalConfig
    });

    // Setup auto-refresh for critical data
    if (finalConfig.refreshStrategy === 'realtime') {
      this.setupRealtimeRefresh(key, finalConfig.ttl);
    }

    console.log(`💾 Cached ${key} for ${finalConfig.ttl / 1000}s (${finalConfig.priority} priority)`);
  }

  /**
   * Check if cache is valid based on TTL and game status
   */
  private isCacheValid<T>(cacheItem: CacheItem<T>): boolean {
    const age = Date.now() - cacheItem.timestamp;
    
    // Dynamic TTL based on access patterns
    const dynamicTTL = this.calculateDynamicTTL(cacheItem);
    
    return age < dynamicTTL;
  }

  /**
   * Calculate dynamic TTL based on access patterns and priority
   */
  private calculateDynamicTTL<T>(cacheItem: CacheItem<T>): number {
    const { config, accessCount, lastAccessed } = cacheItem;
    const timeSinceLastAccess = Date.now() - lastAccessed;
    
    // Frequently accessed data gets longer cache time
    const accessMultiplier = Math.min(1 + (accessCount * 0.1), 2);
    
    // Recently accessed data gets longer cache time
    const recencyMultiplier = timeSinceLastAccess > 5 * 60 * 1000 ? 0.5 : 1.2;
    
    return config.ttl * accessMultiplier * recencyMultiplier;
  }

  /**
   * Check if background refresh should be triggered
   */
  private shouldBackgroundRefresh<T>(cacheItem: CacheItem<T>): boolean {
    const age = Date.now() - cacheItem.timestamp;
    const refreshThreshold = cacheItem.config.ttl * 0.8; // Refresh at 80% of TTL
    
    return age > refreshThreshold && !this.backgroundRefreshQueue.has(cacheItem.config.key);
  }

  /**
   * Schedule background refresh
   */
  private scheduleBackgroundRefresh<T>(
    key: string, 
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): void {
    if (this.backgroundRefreshQueue.has(key)) return;

    this.backgroundRefreshQueue.add(key);
    
    // Small delay to batch multiple refresh requests
    setTimeout(async () => {
      try {
        console.log(`🔄 Background refreshing ${key}...`);
        const freshData = await fetcher();
        this.set(key, freshData, config);
      } catch (error) {
        console.warn(`⚠️ Background refresh failed for ${key}:`, error);
      } finally {
        this.backgroundRefreshQueue.delete(key);
      }
    }, 1000);
  }

  /**
   * Setup real-time refresh for critical data
   */
  private setupRealtimeRefresh(key: string, interval: number): void {
    // Clear existing timer
    if (this.refreshTimers.has(key)) {
      clearInterval(this.refreshTimers.get(key)!);
    }

    // Only setup realtime refresh during active game hours
    if (this.isActiveGameTime()) {
      const timer = setInterval(() => {
        // Mark cache as expired to force refresh on next access
        const cacheItem = this.cache.get(key);
        if (cacheItem) {
          cacheItem.timestamp = 0; // Force refresh
        }
      }, interval);

      this.refreshTimers.set(key, timer);
    }
  }

  /**
   * Check if it's active game time (when live updates are needed)
   */
  private isActiveGameTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Most games are Thursday-Monday, 12 PM - 12 AM
    const isGameDay = day >= 4 || day <= 1; // Thu, Fri, Sat, Sun, Mon
    const isGameHours = hour >= 12 || hour <= 0; // 12 PM - 12 AM
    
    return isGameDay && isGameHours;
  }

  /**
   * Get cache configuration for key
   */
  private getConfig(key: string): CacheConfig {
    // Try exact match first
    if (this.cacheConfigs[key]) {
      return this.cacheConfigs[key];
    }

    // Try pattern matching
    for (const [pattern, config] of Object.entries(this.cacheConfigs)) {
      if (key.includes(pattern.split('_')[0])) {
        return config;
      }
    }

    // Default config for unknown keys
    return {
      key,
      ttl: 5 * 60 * 1000, // 5 minutes default
      priority: 'medium',
      refreshStrategy: 'lazy'
    };
  }

  /**
   * Force refresh specific cache entries
   */
  invalidate(...keys: string[]): void {
    keys.forEach(key => {
      this.cache.delete(key);
      if (this.refreshTimers.has(key)) {
        clearInterval(this.refreshTimers.get(key)!);
        this.refreshTimers.delete(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();
    this.backgroundRefreshQueue.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.entries());
    const totalSize = entries.length;
    const hitRatio = entries.reduce((sum, [, item]) => sum + item.accessCount, 0) / totalSize || 0;
    
    const byPriority = entries.reduce((acc, [key, item]) => {
      acc[item.config.priority] = (acc[item.config.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: totalSize,
      averageHitRatio: hitRatio,
      byPriority,
      backgroundRefreshActive: this.backgroundRefreshQueue.size,
      realtimeTimers: this.refreshTimers.size
    };
  }

  /**
   * Optimize cache by removing least used entries if needed
   */
  optimize(): void {
    const maxEntries = 100;
    if (this.cache.size <= maxEntries) return;

    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        // Sort by access count and last accessed time
        const scoreA = a.accessCount * (Date.now() - a.lastAccessed);
        const scoreB = b.accessCount * (Date.now() - b.lastAccessed);
        return scoreA - scoreB;
      });

    // Remove oldest, least accessed entries
    const toRemove = entries.slice(0, entries.length - maxEntries);
    toRemove.forEach(([key]) => this.cache.delete(key));

    console.log(`🧹 Cache optimized: removed ${toRemove.length} entries`);
  }
}

export const smartCache = new SmartCacheManager();