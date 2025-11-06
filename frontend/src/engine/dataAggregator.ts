/**
 * Data Aggregator
 * Fetches and aggregates data from multiple sources with intelligent caching
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache manager
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: Record<string, CacheConfig>;
  
  constructor(config: Record<string, CacheConfig>) {
    this.config = config;
  }
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const cacheTtl = ttl || this.config['default']?.ttl || 3600000; // 1 hour default
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTtl
    };
    
    this.cache.set(key, entry);
  }
  
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Clear keys matching pattern
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
  
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Data Source Clients
 */

// Odds API Client
export class OddsAPIClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.the-odds-api.com/v4';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getGames(sport: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/odds/?apiKey=${this.apiKey}&regions=us&markets=h2h,spreads,totals`
      );
      
      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching odds:', error);
      return [];
    }
  }
  
  async getPlayerProps(sport: string, market: string = 'player_points'): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/odds/?apiKey=${this.apiKey}&regions=us&markets=${market}`
      );
      
      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching player props:', error);
      return [];
    }
  }
}

// NBA Stats Client
export class NBAStatsClient {
  private baseUrl: string = 'https://stats.nba.com/stats';
  private headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://www.nba.com/',
  };
  
  async getPlayerGameLog(playerId: string, season: string = '2024-25'): Promise<any[]> {
    try {
      const endpoint = `${this.baseUrl}/playergamelog`;
      const params = new URLSearchParams({
        PlayerID: playerId,
        Season: season,
        SeasonType: 'Regular Season',
      });
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`NBA Stats API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseGameLog(data);
    } catch (error) {
      console.error('Error fetching player game log:', error);
      return [];
    }
  }
  
  async getPlayerStats(playerId: string): Promise<any> {
    try {
      const endpoint = `${this.baseUrl}/commonplayerinfo`;
      const params = new URLSearchParams({
        PlayerID: playerId
      });
      
      const response = await fetch(`${endpoint}?${params}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`NBA Stats API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }
  
  private parseGameLog(data: any): any[] {
    if (!data.resultSets || data.resultSets.length === 0) {
      return [];
    }
    
    const headers = data.resultSets[0].headers;
    const rows = data.resultSets[0].rowSet;
    
    return rows.map((row: any[]) => {
      const game: any = {};
      headers.forEach((header: string, i: number) => {
        game[header] = row[i];
      });
      return game;
    });
  }
}

// Injury Report Client (ESPN)
export class InjuryReportClient {
  async getStatus(playerId: string, sport: string = 'nba'): Promise<any> {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/${sport}/injuries`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Find player in injury report
      const injury = data.injuries?.find((i: any) => i.athlete.id === playerId);
      
      return {
        status: injury ? injury.status : 'healthy',
        details: injury ? injury.details : null,
        returnDate: injury ? injury.returnDate : null,
      };
    } catch (error) {
      console.error('Error fetching injury status:', error);
      return {
        status: 'healthy',
        details: null,
        returnDate: null
      };
    }
  }
  
  async getAllInjuries(sport: string = 'nba'): Promise<any[]> {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/${sport}/injuries`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.injuries || [];
    } catch (error) {
      console.error('Error fetching injuries:', error);
      return [];
    }
  }
}

// News API Client (placeholder)
export class NewsAPIClient {
  async getRecentNews(playerId: string): Promise<any[]> {
    // Placeholder - would integrate with news API
    return [];
  }
}

// Weather API Client
export class WeatherAPIClient {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }
  
  async getTodaysConditions(): Promise<any[]> {
    // Placeholder - would integrate with weather API for outdoor sports
    return [];
  }
}

/**
 * Main Data Aggregator
 * Orchestrates all data sources with intelligent caching
 */
export class DataAggregator {
  private oddsClient: OddsAPIClient;
  private playerStatsClient: NBAStatsClient;
  private injuryClient: InjuryReportClient;
  private newsClient: NewsAPIClient;
  private weatherClient: WeatherAPIClient;
  private cache: CacheManager;
  
  constructor(config?: {
    oddsApiKey?: string;
    weatherApiKey?: string;
  }) {
    this.oddsClient = new OddsAPIClient(config?.oddsApiKey || '');
    this.playerStatsClient = new NBAStatsClient();
    this.injuryClient = new InjuryReportClient();
    this.newsClient = new NewsAPIClient();
    this.weatherClient = new WeatherAPIClient(config?.weatherApiKey);
    
    // Initialize cache with TTL configs
    this.cache = new CacheManager({
      teamData: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
      playerStats: { ttl: 12 * 60 * 60 * 1000 }, // 12 hours
      recentGames: { ttl: 60 * 60 * 1000 }, // 1 hour
      liveOdds: { ttl: 5 * 60 * 1000 }, // 5 minutes
      injuries: { ttl: 30 * 60 * 1000 }, // 30 minutes
      default: { ttl: 3600000 } // 1 hour
    });
  }
  
  /**
   * Get complete player data from all sources
   */
  async getCompletePlayerData(playerId: string): Promise<any> {
    const cacheKey = `player_${playerId}_complete`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch from all sources in parallel
    const [stats, injuries, news, games] = await Promise.all([
      this.playerStatsClient.getPlayerStats(playerId),
      this.injuryClient.getStatus(playerId),
      this.newsClient.getRecentNews(playerId),
      this.playerStatsClient.getPlayerGameLog(playerId),
    ]);
    
    const complete = {
      ...stats,
      injuryStatus: injuries.status,
      injuryDetails: injuries.details,
      recentNews: news.slice(0, 3),
      lastTenGames: games.slice(0, 10),
      updatedAt: new Date().toISOString(),
    };
    
    // Cache result for 1 hour
    await this.cache.set(cacheKey, complete, 3600000);
    
    return complete;
  }
  
  /**
   * Get today's games for a sport
   */
  async getTodaysGames(sport: string = 'basketball_nba'): Promise<any[]> {
    const cacheKey = `games_${sport}_today`;
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch odds and weather in parallel
    const [odds, weather] = await Promise.all([
      this.oddsClient.getGames(sport),
      this.weatherClient.getTodaysConditions(),
    ]);
    
    // Enrich games with weather (for outdoor sports)
    if (['american_football_nfl', 'baseball_mlb'].includes(sport)) {
      odds.forEach((game: any) => {
        const venue = game.venue;
        game.weather = weather.find((w: any) => w.location === venue);
      });
    }
    
    // Cache for 5 minutes (live odds change frequently)
    await this.cache.set(cacheKey, odds, 5 * 60 * 1000);
    
    return odds;
  }
  
  /**
   * Get player props for today
   */
  async getPlayerProps(sport: string = 'basketball_nba'): Promise<any[]> {
    const cacheKey = `props_${sport}_today`;
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch all prop markets
    const propMarkets = [
      'player_points',
      'player_rebounds',
      'player_assists',
      'player_threes',
      'player_blocks',
      'player_steals'
    ];
    
    const allProps = await Promise.all(
      propMarkets.map(market => this.oddsClient.getPlayerProps(sport, market))
    );
    
    // Flatten and deduplicate
    const props = allProps.flat();
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, props, 5 * 60 * 1000);
    
    return props;
  }
  
  /**
   * Get injury reports
   */
  async getInjuryReports(sport: string = 'nba'): Promise<any[]> {
    const cacheKey = `injuries_${sport}`;
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const injuries = await this.injuryClient.getAllInjuries(sport);
    
    // Cache for 30 minutes
    await this.cache.set(cacheKey, injuries, 30 * 60 * 1000);
    
    return injuries;
  }
  
  /**
   * Clear all caches
   */
  clearCache(pattern?: string): void {
    this.cache.clear(pattern);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return this.cache.getStats();
  }
}
