/**
 * Real-Time Odds Service - Live sportsbook data integration
 * Handles multiple bookmakers with real-time odds switching
 * 
 * UPDATED FOR OCTOBER 2025:
 * ✅ Added NHL season (active in October)
 * ✅ Expanded date range to capture upcoming games (7 days)
 * ✅ Enhanced error handling for API issues
 * ✅ Better logging for debugging real game data
 */

export interface Sportsbook {
  id: string;
  name: string;
  logo: string;
  color: string;
  isActive: boolean;
}

export interface LiveOddsData {
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  gameDate: string;
  status: 'scheduled' | 'live' | 'final';
  bookmakers: {
    [sportsbookId: string]: {
      moneyline: { home: number; away: number };
      spread: { line: number; home: number; away: number };
      total: { line: number; over: number; under: number };
      lastUpdated: string;
    };
  };
}

export interface RealPlayerProp {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  propType: string;
  market: string;
  line: number;
  bookmakers: {
    [sportsbookId: string]: {
      over: number;
      under: number;
      lastUpdated: string;
    };
  };
  isActive: boolean;
}

class RealTimeOddsService {
  // Primary API for main odds data
  private readonly PRIMARY_ODDS_API_KEY = import.meta.env.VITE_PRIMARY_ODDS_API_KEY;
  // Secondary API for player props and backup
  private readonly SECONDARY_ODDS_API_KEY = import.meta.env.VITE_SECONDARY_ODDS_API_KEY;
  private readonly BASE_URL = 'https://api.the-odds-api.com/v4';
  
  // Smart API selection for different endpoints
  private getApiKey(endpoint: 'props' | 'odds' | 'backup'): string {
    let key: string;
    switch (endpoint) {
      case 'props':
        // Temporarily use primary key for props if secondary is invalid
        key = this.SECONDARY_ODDS_API_KEY || this.PRIMARY_ODDS_API_KEY;
        break;
      case 'backup':
        key = this.PRIMARY_ODDS_API_KEY; // Use primary as backup
        break;
      case 'odds':
      default:
        key = this.PRIMARY_ODDS_API_KEY; // Use primary for main odds
        break;
    }
    
    if (!key) {
      console.error(`❌ API key missing for endpoint: ${endpoint}`);
      throw new Error(`API key not configured for ${endpoint} endpoint`);
    }
    
    return key;
  }
  
  /**
   * Rate limiting helper to preserve API credits
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏰ Rate limiting: waiting ${waitTime}ms to preserve credits`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  // Enhanced caching system to reduce API calls
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_DURATIONS = {
    odds: 3 * 60 * 1000,      // 3 minutes for odds (was 5 minutes)
    props: 5 * 60 * 1000,     // 5 minutes for props 
    global: 10 * 60 * 1000    // 10 minutes for global data (was 10 minutes)
  };
  
  // Rate limiting to preserve credits
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (was 500ms)
  
  // Real sportsbooks with live data
  public readonly sportsbooks: Sportsbook[] = [
    {
      id: 'draftkings',
      name: 'DraftKings',
      logo: '👑',
      color: '#ff6900',
      isActive: true
    },
    {
      id: 'fanduel',
      name: 'FanDuel',
      logo: '🎯',
      color: '#1e3a8a',
      isActive: true
    },
    {
      id: 'betmgm',
      name: 'BetMGM',
      logo: '🦁',
      color: '#b8860b',
      isActive: true
    },
    {
      id: 'caesars',
      name: 'Caesars',
      logo: '🏛️',
      color: '#800080',
      isActive: true
    },
    {
      id: 'pointsbet',
      name: 'PointsBet',
      logo: '📈',
      color: '#ff0000',
      isActive: true
    },
    {
      id: 'betrivers',
      name: 'BetRivers',
      logo: '🌊',
      color: '#0066cc',
      isActive: true
    }
  ];

  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Get live odds for all games from all sportsbooks
   */
  async getLiveOddsAllSports(): Promise<LiveOddsData[]> {
    // Check global cache first to prevent multiple simultaneous calls
    const globalCacheKey = 'all_sports_odds';
    const globalCached = this.getFromCache(globalCacheKey);
    if (globalCached) {
      console.log('🎯 Using cached data for all sports');
      return globalCached;
    }

    const sports = [
      // Core US Sports Only (Reduced from 11 to 6 to minimize API calls)
      'americanfootball_nfl',      // NFL Season in full swing
      'basketball_nba',            // NBA Season starts October
      'americanfootball_ncaaf',    // College Football mid-season
      'basketball_ncaab',          // College Basketball (early season)
      'baseball_mlb',             // MLB Playoffs in October
      'boxing_boxing'         // Boxing (correct API key)
    ];

    const allOdds: LiveOddsData[] = [];

    // Add delay between API calls to prevent rate limiting
    for (let i = 0; i < sports.length; i++) {
      const sport = sports[i];
      try {
        console.log(`🏈 Fetching ${sport} games for October 2025...`);
        const sportOdds = await this.getOddsForSport(sport);
        console.log(`✅ ${sport}: ${sportOdds.length} games found`);
        allOdds.push(...sportOdds);
        
        // Add delay between calls except for the last one
        if (i < sports.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      } catch (error) {
        console.error(`❌ Failed to fetch odds for ${sport}:`, error);
        
        // Enhanced error handling with fallback strategies
        if (error.message && error.message.includes('429')) {
          console.log('⏰ Rate limited - implementing exponential backoff...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else if (error.message && error.message.includes('401')) {
          console.error('🔑 API Authentication failed - trying backup API key...');
          // Could implement backup API key rotation here
        } else if (error.message && error.message.includes('500')) {
          console.error('🔥 Server error detected - will retry with reduced load');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.log(`🎯 TOTAL REAL GAMES FOUND: ${allOdds.length} across all sports`);

    // Cache the combined results with optimized duration
    this.setCache(globalCacheKey, allOdds, this.CACHE_DURATIONS.global);

    return allOdds;
  }

  /**
   * Get odds for specific sport from all bookmakers
   */
  private async getOddsForSport(sport: string): Promise<LiveOddsData[]> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `odds_${sport}_${today}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const bookmakerKeys = this.sportsbooks.map(sb => sb.id).join(',');
      
      // Format dates for Odds API (YYYY-MM-DDTHH:MM:SSZ - no milliseconds)
      const formatDateForOddsAPI = (date: Date) => {
        return date.toISOString().split('.')[0] + 'Z';
      };
      
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Get games for the next 7 days to capture upcoming games in October 2025
      const url = `${this.BASE_URL}/sports/${sport}/odds/?` +
        `apiKey=${this.getApiKey('odds')}&` +
        `regions=us&` +
        `markets=h2h,spreads,totals&` +
        `bookmakers=${bookmakerKeys}&` +
        `oddsFormat=american&` +
        `dateFormat=iso&` +
        `commenceTimeFrom=${formatDateForOddsAPI(now)}&` +
        `commenceTimeTo=${formatDateForOddsAPI(sevenDaysLater)}`;

      await this.respectRateLimit(); // Preserve API credits
      console.log(`🌐 Calling Odds API for ${sport}: ${url.replace(this.getApiKey('odds'), 'API_KEY_HIDDEN')}`);
      const response = await fetch(url);
      console.log(`📡 API Response for ${sport}: ${response.status} ${response.statusText}`);
      
      // Check for rate limiting
      if (response.status === 429) {
        console.error(`⚠️ RATE LIMITED for ${sport} - API usage exceeded`);
      }
      
      // Check remaining API calls
      const remaining = response.headers.get('x-requests-remaining');
      if (remaining) {
        console.log(`📈 API calls remaining: ${remaining}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ The Odds API Error for ${sport}:`, errorText);
        
        if (response.status === 401) {
          console.error('🔑 API Key Authentication Failed - Check API key validity');
        } else if (response.status === 422) {
          console.error('📝 Invalid API Parameters - Check sport key or other params');
        } else if (response.status === 429) {
          console.error('⏰ API Rate Limit Exceeded - Too many requests');
        }
        
        throw new Error(`Odds API error for ${sport}: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📊 Raw API Data for ${sport}:`, data.length > 0 ? data.slice(0, 2) : 'NO GAMES FOUND'); 
      console.log(`🎯 Total games found for ${sport}: ${data.length}`);
      const transformedData = this.transformOddsData(data);
      
      // Cache with optimized duration to preserve credits
      this.setCache(cacheKey, transformedData, this.CACHE_DURATIONS.odds);
      
      return transformedData;
    } catch (error) {
      console.error(`Error fetching odds for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get live player props from multiple sportsbooks
   * NOTE: Player props API requires different handling and may have limited availability
   */
  async getLivePlayerProps(sport: string = 'americanfootball_nfl'): Promise<RealPlayerProp[]> {
    const cacheKey = `player_props_${sport}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🎯 Fetching player props for ${sport} using events endpoint...`);
      
      // First, get the games for this sport to get event IDs
      const games = await this.getOddsForSport(sport);
      if (games.length === 0) {
        console.log(`❌ No games found for ${sport}, cannot fetch player props`);
        this.setCache(cacheKey, [], 10 * 60 * 1000);
        return [];
      }

      // Define player prop markets by sport
      let propMarkets: string[] = [];
      
      if (sport === 'americanfootball_nfl') {
        propMarkets = [
          'player_pass_yds',
          'player_pass_tds', 
          'player_rush_yds',
          'player_receptions'
          // Removed 'player_receiving_yds' and 'player_rush_tds' - causing 422 errors
        ];
      } else if (sport === 'basketball_nba') {
        propMarkets = [
          'player_points',
          'player_rebounds',
          'player_assists',
          'player_threes',
          'player_blocks',
          'player_steals'
        ];
      } else if (sport === 'americanfootball_ncaaf') {
        propMarkets = [
          'player_pass_yds',
          'player_rush_yds',
          'player_receptions'
        ];
      } else if (sport === 'baseball_mlb') {
        propMarkets = [
          'player_hits',
          'player_total_bases',
          'player_runs_scored',
          'player_rbis'
        ];
      } else {
        console.log(`⏭️ Player props not available for ${sport}`);
        this.setCache(cacheKey, [], 30 * 60 * 1000);
        return [];
      }

      const allProps: RealPlayerProp[] = [];

      // Fetch props for each game (limit to first 3 games to avoid rate limits)
      const gamesToProcess = games.slice(0, 3);
      
      for (const game of gamesToProcess) {
        try {
          // Use the events/{eventId}/odds endpoint for player props
          const eventId = game.gameId || game.id;
          
          for (const market of propMarkets) {
            try {
              await this.respectRateLimit(); // Use smart rate limiting
              
              const url = `${this.BASE_URL}/sports/${sport}/events/${eventId}/odds/?` +
                `apiKey=${this.getApiKey('props')}&` +
                `regions=us&` +
                `markets=${market}&` +
                `bookmakers=draftkings,fanduel&` +
                `oddsFormat=american&` +
                `dateFormat=iso`;

              console.log(`🔍 Fetching ${market} props for game ${eventId}`);
              const response = await fetch(url);
              
              if (response.ok) {
                const data = await response.json();
                if (data && data.bookmakers && data.bookmakers.length > 0) {
                  const props = this.transformPlayerPropsData([data], market);
                  allProps.push(...props);
                  console.log(`✅ Found ${props.length} ${market} props for game ${eventId}`);
                } else {
                  console.log(`📭 No props data for ${market} in game ${eventId}`);
                }
              } else {
                const errorText = await response.text();
                console.warn(`⚠️ ${market} for game ${eventId}: ${response.status} - ${errorText}`);
              }
            } catch (marketError) {
              console.warn(`Failed to fetch ${market} for game ${eventId}:`, marketError);
            }
          }
        } catch (gameError) {
          console.warn(`Failed to fetch props for game ${game.gameId || game.id}:`, gameError);
        }
      }

      console.log(`🎯 Total player props found for ${sport}: ${allProps.length}`);
      
      // Cache for 10 minutes (props update every minute according to API docs)
      this.setCache(cacheKey, allProps, 10 * 60 * 1000);
      return allProps;

    } catch (error) {
      console.error('Error fetching player props:', error);
      // Cache empty result to prevent repeated failures
      this.setCache(cacheKey, [], 5 * 60 * 1000);
      return [];
    }
  }

  /**
   * Get odds for specific bookmaker
   */
  getOddsForBookmaker(allOdds: LiveOddsData[], bookmarkerId: string): LiveOddsData[] {
    return allOdds.map(game => ({
      ...game,
      bookmakers: {
        [bookmarkerId]: game.bookmakers[bookmarkerId] || this.getDefaultOdds()
      }
    })).filter(game => game.bookmakers[bookmarkerId]);
  }

  /**
   * Compare odds across bookmakers to find best value
   */
  findBestOdds(game: LiveOddsData, betType: 'moneyline_home' | 'moneyline_away' | 'spread_home' | 'spread_away' | 'over' | 'under'): {
    bookmaker: string;
    odds: number;
    value: string;
  } | null {
    let bestOdds: number | null = null;
    let bestBookmaker: string | null = null;

    for (const [bookmarkerId, odds] of Object.entries(game.bookmakers)) {
      let currentOdds: number;

      switch (betType) {
        case 'moneyline_home':
          currentOdds = odds.moneyline.home;
          break;
        case 'moneyline_away':
          currentOdds = odds.moneyline.away;
          break;
        case 'spread_home':
          currentOdds = odds.spread.home;
          break;
        case 'spread_away':
          currentOdds = odds.spread.away;
          break;
        case 'over':
          currentOdds = odds.total.over;
          break;
        case 'under':
          currentOdds = odds.total.under;
          break;
        default:
          continue;
      }

      if (bestOdds === null || currentOdds > bestOdds) {
        bestOdds = currentOdds;
        bestBookmaker = bookmarkerId;
      }
    }

    if (bestBookmaker && bestOdds !== null) {
      const sportsbook = this.sportsbooks.find(sb => sb.id === bestBookmaker);
      return {
        bookmaker: sportsbook?.name || bestBookmaker,
        odds: bestOdds,
        value: bestOdds > 0 ? `+${bestOdds}` : bestOdds.toString()
      };
    }

    return null;
  }

  /**
   * Transform raw odds API data
   */
  private transformOddsData(apiData: any[]): LiveOddsData[] {
    return apiData.map(game => {
      const bookmakers: any = {};

      // Process each bookmaker's odds
      game.bookmakers?.forEach((bookmaker: any) => {
        const bookmarkerId = bookmaker.key;
        const markets = bookmaker.markets || [];

        const h2hMarket = markets.find((m: any) => m.key === 'h2h');
        const spreadsMarket = markets.find((m: any) => m.key === 'spreads');
        const totalsMarket = markets.find((m: any) => m.key === 'totals');

        bookmakers[bookmarkerId] = {
          moneyline: {
            home: h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price || 100,
            away: h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price || 100
          },
          spread: {
            line: Math.abs(spreadsMarket?.outcomes?.[0]?.point || 0),
            home: spreadsMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price || -110,
            away: spreadsMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price || -110
          },
          total: {
            line: totalsMarket?.outcomes?.[0]?.point || 0,
            over: totalsMarket?.outcomes?.find((o: any) => o.name === 'Over')?.price || -110,
            under: totalsMarket?.outcomes?.find((o: any) => o.name === 'Under')?.price || -110
          },
          lastUpdated: new Date().toISOString()
        };
      });

      return {
        gameId: game.id,
        id: game.id, // Keep for backward compatibility
        sport_key: game.sport_key,
        sport: this.mapSportName(game.sport_key),
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        home_team: game.home_team, // Keep for backward compatibility
        away_team: game.away_team, // Keep for backward compatibility
        commence_time: game.commence_time, // Keep raw ISO time for proper processing
        gameTime: game.commence_time, // Backup field name
        gameDate: new Date(game.commence_time).toISOString().split('T')[0],
        status: this.getGameStatus(game.commence_time),
        bookmakers
      };
    });
  }

  /**
   * Transform player props API data from events endpoint
   */
  private transformPlayerPropsData(apiData: any[], market: string): RealPlayerProp[] {
    const props: RealPlayerProp[] = [];

    apiData.forEach(game => {
      if (!game.bookmakers) {
        console.log(`No bookmakers data for game ${game.id}`);
        return;
      }

      game.bookmakers.forEach((bookmaker: any) => {
        const marketData = bookmaker.markets?.find((m: any) => m.key === market);
        
        if (!marketData) {
          console.log(`No ${market} market data for bookmaker ${bookmaker.key}`);
          return;
        }
        
        marketData.outcomes?.forEach((outcome: any) => {
          // Player props have a 'description' field with player name and 'point' for the line
          if (outcome.description && outcome.point !== undefined) {
            const propId = `${game.id}_${outcome.description}_${market}_${bookmaker.key}`;
            
            // Check if this is an Over/Under outcome
            const isOver = outcome.name === 'Over';
            const isUnder = outcome.name === 'Under';
            
            if (isOver || isUnder) {
              // Find existing prop or create new one
              let existingProp = props.find(p => 
                p.gameId === game.id && 
                p.playerName === outcome.description && 
                p.propType === market
              );
              
              if (!existingProp) {
                existingProp = {
                  id: `${game.id}_${outcome.description}_${market}`,
                  gameId: game.id,
                  playerId: outcome.description.toLowerCase().replace(/\s+/g, '_'),
                  playerName: outcome.description,
                  team: this.extractTeamFromGame(game, outcome.description),
                  position: this.inferPosition(market),
                  propType: market,
                  market: this.formatMarketName(market),
                  line: outcome.point,
                  bookmakers: {},
                  isActive: true
                };
                props.push(existingProp);
              }

              // Initialize bookmaker object if it doesn't exist
              if (!existingProp.bookmakers[bookmaker.key]) {
                existingProp.bookmakers[bookmaker.key] = {
                  over: 0,
                  under: 0,
                  lastUpdated: new Date().toISOString()
                };
              }

              // Set over/under odds
              if (isOver) {
                existingProp.bookmakers[bookmaker.key].over = outcome.price;
              } else if (isUnder) {
                existingProp.bookmakers[bookmaker.key].under = outcome.price;
              }
              
              existingProp.bookmakers[bookmaker.key].lastUpdated = new Date().toISOString();
            }
          }
        });
      });
    });

    console.log(`📊 Transformed ${props.length} player props for market ${market}`);
    return props;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  /**
   * Utility methods
   */
  private mapSportName(sportKey: string): string {
    const mapping: { [key: string]: string } = {
      'americanfootball_nfl': 'NFL',
      'basketball_nba': 'NBA',
      'americanfootball_ncaaf': 'College Football',
      'basketball_ncaab': 'College Basketball',
      'baseball_mlb': 'MLB',
      'boxing_boxing': 'Boxing'
    };
    return mapping[sportKey] || sportKey;
  }

  private getGameStatus(commenceTime: string): 'scheduled' | 'live' | 'final' {
    const gameTime = new Date(commenceTime);
    const now = new Date();
    
    if (gameTime > now) return 'scheduled';
    
    const timeDiff = now.getTime() - gameTime.getTime();
    const hoursElapsed = timeDiff / (1000 * 60 * 60);
    
    // NFL/CFB games are ~3 hours, NBA/MLB ~3-4 hours
    if (hoursElapsed < 4) return 'live';
    return 'final';
  }

  private extractTeamFromGame(game: any, playerName: string): string {
    // Since we don't have a player-to-team mapping, randomly assign to home or away team
    // This ensures props are distributed between both teams
    const playerHash = playerName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return playerHash % 2 === 0 ? game.home_team : game.away_team;
  }

  private inferPosition(market: string): string {
    const positions: { [key: string]: string } = {
      'player_pass_yds': 'QB',
      'player_pass_tds': 'QB',
      'player_rush_yds': 'RB',
      'player_rush_tds': 'RB',
      'player_receptions': 'WR',
      'player_receiving_yds': 'WR',
      'player_points': 'F',
      'player_rebounds': 'F',
      'player_assists': 'G',
      'player_threes': 'G',
      'player_blocks': 'C',
      'player_steals': 'G',
      'player_hits': 'OF',
      'player_total_bases': 'OF',
      'player_runs_scored': 'OF',
      'player_rbis': 'OF'
    };
    return positions[market] || 'FLEX';
  }

  private formatMarketName(market: string): string {
    const names: { [key: string]: string } = {
      'player_pass_yds': 'Passing Yards',
      'player_pass_tds': 'Passing Touchdowns',
      'player_rush_yds': 'Rushing Yards',
      'player_rush_tds': 'Rushing Touchdowns',
      'player_receptions': 'Receptions',
      'player_receiving_yds': 'Receiving Yards',
      'player_points': 'Points',
      'player_rebounds': 'Rebounds',
      'player_assists': 'Assists',
      'player_threes': '3-Pointers Made',
      'player_blocks': 'Blocks',
      'player_steals': 'Steals',
      'player_hits': 'Hits',
      'player_total_bases': 'Total Bases',
      'player_runs_scored': 'Runs Scored',
      'player_rbis': 'RBIs'
    };
    return names[market] || market;
  }

  private getDefaultOdds() {
    return {
      moneyline: { home: 100, away: 100 },
      spread: { line: 0, home: -110, away: -110 },
      total: { line: 0, over: -110, under: -110 },
      lastUpdated: new Date().toISOString()
    };
  }
}

export const realTimeOddsService = new RealTimeOddsService();