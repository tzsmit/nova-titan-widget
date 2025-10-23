/**
 * Comprehensive Data Validation and Cache Management Service - Priority Fix #14
 * Ensures data integrity, freshness validation, and robust cache management
 */

// Data validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  dataQuality: number; // 0-100 score
  lastValidated: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface DataFreshnessInfo {
  lastUpdated: Date;
  maxAge: number; // milliseconds
  isStale: boolean;
  staleness: number; // 0-1, where 1 is completely stale
  nextUpdate?: Date;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  validationResult?: ValidationResult;
  freshnessInfo: DataFreshnessInfo;
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  stalEntries: number;
  invalidEntries: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

// Game data validation schemas
const GAME_DATA_SCHEMA = {
  required: ['id', 'home_team', 'away_team', 'commence_time'],
  optional: ['sport_key', 'bookmakers', 'odds'],
  types: {
    id: 'string',
    home_team: 'string',
    away_team: 'string',
    commence_time: 'string', // ISO date
    sport_key: 'string'
  },
  constraints: {
    home_team: { minLength: 2, maxLength: 50 },
    away_team: { minLength: 2, maxLength: 50 },
    commence_time: { futureOnly: true } // Games should be in future or recent past
  }
};

const ODDS_DATA_SCHEMA = {
  required: ['bookmaker', 'markets'],
  types: {
    bookmaker: 'string',
    markets: 'array'
  },
  constraints: {
    bookmaker: { minLength: 2 },
    markets: { minItems: 1 }
  }
};

export class DataValidationService {
  private static instance: DataValidationService;
  private cache = new Map<string, CacheEntry<any>>();
  private validationRules = new Map<string, any>();
  private cacheHits = 0;
  private cacheMisses = 0;

  static getInstance(): DataValidationService {
    if (!this.instance) {
      this.instance = new DataValidationService();
    }
    return this.instance;
  }

  constructor() {
    this.setupValidationRules();
    this.setupCacheCleanup();
  }

  /**
   * Validate game data with comprehensive checks
   */
  validateGameData(data: any): ValidationResult {
    console.log('🛡️ Data Validation: Validating game data:', data?.length || 'single item');
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataQuality: 100,
      lastValidated: new Date()
    };

    if (!data) {
      result.errors.push({
        field: 'root',
        message: 'Data is null or undefined',
        severity: 'critical',
        code: 'NULL_DATA'
      });
      result.isValid = false;
      result.dataQuality = 0;
      return result;
    }

    if (Array.isArray(data)) {
      // Validate array of games
      data.forEach((game, index) => {
        const gameValidation = this.validateSingleGame(game, index);
        result.errors.push(...gameValidation.errors);
        result.warnings.push(...gameValidation.warnings);
        if (!gameValidation.isValid) {
          result.isValid = false;
        }
      });
      
      // Calculate average data quality
      const validGames = data.length - result.errors.filter(e => e.severity === 'critical').length;
      result.dataQuality = Math.max(0, (validGames / data.length) * 100);
    } else {
      // Validate single game
      const gameValidation = this.validateSingleGame(data);
      result.errors = gameValidation.errors;
      result.warnings = gameValidation.warnings;
      result.isValid = gameValidation.isValid;
      result.dataQuality = gameValidation.dataQuality;
    }

    console.log('🛡️ Validation Results:', {
      isValid: result.isValid,
      errors: result.errors.length,
      warnings: result.warnings.length,
      quality: result.dataQuality
    });

    return result;
  }

  private validateSingleGame(game: any, index?: number): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataQuality: 100,
      lastValidated: new Date()
    };

    const gamePrefix = index !== undefined ? `games[${index}]` : 'game';

    // Check required fields
    for (const field of GAME_DATA_SCHEMA.required) {
      if (!(field in game) || game[field] == null) {
        result.errors.push({
          field: `${gamePrefix}.${field}`,
          message: `Required field '${field}' is missing or null`,
          severity: 'critical',
          code: 'MISSING_REQUIRED_FIELD'
        });
        result.isValid = false;
      }
    }

    // Validate data types
    for (const [field, expectedType] of Object.entries(GAME_DATA_SCHEMA.types)) {
      if (field in game && game[field] != null) {
        const actualType = typeof game[field];
        if (actualType !== expectedType) {
          result.errors.push({
            field: `${gamePrefix}.${field}`,
            message: `Field '${field}' should be ${expectedType}, got ${actualType}`,
            severity: 'major',
            code: 'TYPE_MISMATCH'
          });
        }
      }
    }

    // Validate constraints
    if (game.home_team && game.away_team && game.home_team === game.away_team) {
      result.errors.push({
        field: `${gamePrefix}`,
        message: 'Home team and away team cannot be the same',
        severity: 'critical',
        code: 'DUPLICATE_TEAMS'
      });
      result.isValid = false;
    }

    // Validate game time
    if (game.commence_time) {
      const gameTime = new Date(game.commence_time);
      if (isNaN(gameTime.getTime())) {
        result.errors.push({
          field: `${gamePrefix}.commence_time`,
          message: 'Invalid date format',
          severity: 'major',
          code: 'INVALID_DATE'
        });
      } else {
        const now = new Date();
        const daysDiff = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        // Warn about very old games
        if (daysDiff < -7) {
          result.warnings.push({
            field: `${gamePrefix}.commence_time`,
            message: 'Game is more than 7 days in the past',
            suggestion: 'Consider filtering out old games for better user experience'
          });
        }
        
        // Warn about very future games
        if (daysDiff > 365) {
          result.warnings.push({
            field: `${gamePrefix}.commence_time`,
            message: 'Game is more than a year in the future',
            suggestion: 'Verify this is not a data error'
          });
        }
      }
    }

    // Validate odds data if present
    if (game.bookmakers && Array.isArray(game.bookmakers)) {
      game.bookmakers.forEach((bookmaker: any, bmIndex: number) => {
        const oddsValidation = this.validateOddsData(bookmaker, `${gamePrefix}.bookmakers[${bmIndex}]`);
        result.errors.push(...oddsValidation.errors);
        result.warnings.push(...oddsValidation.warnings);
      });
    }

    // Calculate quality score
    const criticalErrors = result.errors.filter(e => e.severity === 'critical').length;
    const majorErrors = result.errors.filter(e => e.severity === 'major').length;
    const minorErrors = result.errors.filter(e => e.severity === 'minor').length;

    if (criticalErrors > 0) {
      result.dataQuality = 0;
      result.isValid = false;
    } else {
      result.dataQuality = Math.max(0, 100 - (majorErrors * 25) - (minorErrors * 10) - (result.warnings.length * 5));
    }

    return result;
  }

  private validateOddsData(odds: any, fieldPrefix: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataQuality: 100,
      lastValidated: new Date()
    };

    if (!odds.key) {
      result.errors.push({
        field: `${fieldPrefix}.key`,
        message: 'Bookmaker key is required',
        severity: 'major',
        code: 'MISSING_BOOKMAKER_KEY'
      });
    }

    if (!odds.markets || !Array.isArray(odds.markets) || odds.markets.length === 0) {
      result.errors.push({
        field: `${fieldPrefix}.markets`,
        message: 'Markets array is required and must not be empty',
        severity: 'major',
        code: 'MISSING_MARKETS'
      });
    }

    return result;
  }

  /**
   * Check data freshness based on timestamps
   */
  checkDataFreshness(data: any, maxAge: number = 5 * 60 * 1000): DataFreshnessInfo {
    const now = new Date();
    let lastUpdated = now;

    // Try to extract timestamp from data
    if (data && typeof data === 'object') {
      if (data.timestamp) {
        lastUpdated = new Date(data.timestamp);
      } else if (data.lastUpdated) {
        lastUpdated = new Date(data.lastUpdated);
      } else if (Array.isArray(data) && data.length > 0 && data[0].timestamp) {
        lastUpdated = new Date(data[0].timestamp);
      }
    }

    const age = now.getTime() - lastUpdated.getTime();
    const staleness = Math.min(age / maxAge, 1);
    const isStale = age > maxAge;

    return {
      lastUpdated,
      maxAge,
      isStale,
      staleness,
      nextUpdate: isStale ? now : new Date(lastUpdated.getTime() + maxAge)
    };
  }

  /**
   * Enhanced cache operations with validation
   */
  setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000, tags: string[] = []): void {
    const validation = this.validateData(data);
    const freshness = this.checkDataFreshness(data, ttl);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl,
      validationResult: validation,
      freshnessInfo: freshness,
      accessCount: 0,
      lastAccessed: new Date(),
      tags
    };

    this.cache.set(key, entry);
    
    console.log('💾 Cache Set:', {
      key,
      dataSize: JSON.stringify(data).length,
      isValid: validation.isValid,
      ttl: ttl / 1000 + 's',
      tags
    });
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    const now = new Date();
    const age = now.getTime() - entry.timestamp.getTime();

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      console.log('💾 Cache Miss (expired):', key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.cacheHits++;

    console.log('💾 Cache Hit:', {
      key,
      age: Math.round(age / 1000) + 's',
      accessCount: entry.accessCount,
      dataQuality: entry.validationResult?.dataQuality
    });

    return entry.data;
  }

  /**
   * Invalidate cache entries by tags or patterns
   */
  invalidateCache(pattern?: string | RegExp, tags?: string[]): number {
    let invalidatedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      let shouldInvalidate = false;

      // Check pattern match
      if (pattern) {
        if (typeof pattern === 'string') {
          shouldInvalidate = key.includes(pattern);
        } else {
          shouldInvalidate = pattern.test(key);
        }
      }

      // Check tag match
      if (tags && !shouldInvalidate) {
        shouldInvalidate = tags.some(tag => entry.tags.includes(tag));
      }

      if (shouldInvalidate) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    console.log('💾 Cache Invalidation:', {
      pattern: pattern?.toString(),
      tags,
      invalidated: invalidatedCount
    });

    return invalidatedCount;
  }

  /**
   * Get comprehensive cache statistics
   */
  getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = new Date();

    let totalSize = 0;
    let staleEntries = 0;
    let invalidEntries = 0;
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;

    for (const entry of entries) {
      // Calculate size
      totalSize += JSON.stringify(entry.data).length;

      // Check staleness
      const age = now.getTime() - entry.timestamp.getTime();
      if (age > entry.ttl) {
        staleEntries++;
      }

      // Check validity
      if (entry.validationResult && !entry.validationResult.isValid) {
        invalidEntries++;
      }

      // Track oldest/newest
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      stalEntries: staleEntries,
      invalidEntries,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Generic data validation dispatcher
   */
  private validateData(data: any): ValidationResult {
    // Try to determine data type and validate accordingly
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.home_team || firstItem.away_team) {
        return this.validateGameData(data);
      }
    } else if (data && (data.home_team || data.away_team)) {
      return this.validateGameData(data);
    }

    // Default validation for unknown data types
    return {
      isValid: true,
      errors: [],
      warnings: [],
      dataQuality: 100,
      lastValidated: new Date()
    };
  }

  private setupValidationRules(): void {
    this.validationRules.set('games', GAME_DATA_SCHEMA);
    this.validationRules.set('odds', ODDS_DATA_SCHEMA);
  }

  private setupCacheCleanup(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredEntries(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now.getTime() - entry.timestamp.getTime();
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log('🧹 Cache Cleanup: Removed', cleanedCount, 'expired entries');
    }
  }

  /**
   * Clear all cache data
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('💾 Cache: Completely cleared');
  }

  /**
   * Force validation of all cached data
   */
  validateAllCachedData(): { valid: number; invalid: number; revalidated: number } {
    let valid = 0;
    let invalid = 0;
    let revalidated = 0;

    for (const [key, entry] of this.cache.entries()) {
      const newValidation = this.validateData(entry.data);
      entry.validationResult = newValidation;
      revalidated++;

      if (newValidation.isValid) {
        valid++;
      } else {
        invalid++;
      }
    }

    console.log('🛡️ Cache Validation Complete:', { valid, invalid, revalidated });
    return { valid, invalid, revalidated };
  }
}

// Export singleton instance
export const dataValidationService = DataValidationService.getInstance();