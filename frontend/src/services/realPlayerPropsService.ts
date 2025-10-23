/**
 * Real Player Props Service - Live Player Prop Data from The Odds API
 * Fetches actual player prop odds and statistics from real sportsbooks
 * Replaces the mock/synthetic data that was causing incorrect displays
 */

export interface RealPlayerProp {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  team: string;
  opponent: string;
  position: string;
  sport: string;
  
  // Real prop bet details
  propType: string; // e.g., "player_points", "player_rushing_yards", "player_assists"
  market: string; // e.g., "Points", "Rushing Yards", "Assists"
  line: number; // The actual betting line (e.g., 25.5 points)
  
  // Real bookmaker odds
  bookmakers: {
    [bookmaker: string]: {
      over: number; // American odds for over
      under: number; // American odds for under
      lastUpdated: string;
    };
  };
  
  // Game context
  gameTime: string;
  venue: string;
  isActive: boolean;
  
  // Metadata
  lastUpdated: string;
}

class RealPlayerPropsService {
  private readonly API_KEY = process.env.VITE_PRIMARY_ODDS_API_KEY || 'effdb0775abef82ff5dd944ae2180cae';
  private readonly BASE_URL = 'https://api.the-odds-api.com/v4';
  private cache = new Map<string, { data: RealPlayerProp[]; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get real player props for all games and all sports
   * This replaces the fake/mock data generation
   */
  async getRealPlayerProps(sport?: string): Promise<RealPlayerProp[]> {
    console.log('🏈 Fetching REAL player props from The Odds API...');
    
    const cacheKey = `real_props_${sport || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Using cached real player props: ${cached.length} props`);
      return cached;
    }

    try {
      // For now, return empty array with clear logging
      // Player props require separate API calls per game per market type
      // and are more expensive, so we'll implement this progressively
      
      console.log('⚠️ REAL PLAYER PROPS: Not yet fully implemented');
      console.log('💡 Reason: Player props require expensive API calls per game per market');
      console.log('🔄 Next steps: Will integrate when budget allows or on-demand basis');
      console.log('✅ This prevents showing fake/incorrect player data');
      
      const emptyResult: RealPlayerProp[] = [];
      this.setCache(cacheKey, emptyResult, this.CACHE_TTL);
      return emptyResult;

    } catch (error) {
      console.error('❌ Error fetching real player props:', error);
      return [];
    }
  }

  /**
   * Get real player props for a specific game
   * More targeted and cost-effective than fetching all games
   */
  async getRealPlayerPropsForGame(
    sport: string, 
    gameId: string, 
    markets: string[] = ['player_points', 'player_rebounds', 'player_assists']
  ): Promise<RealPlayerProp[]> {
    console.log(`🎯 Fetching real player props for game ${gameId} in ${sport}`);
    
    const cacheKey = `game_props_${gameId}_${markets.join('_')}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const allProps: RealPlayerProp[] = [];

      // Fetch each market separately (required by The Odds API)
      for (const market of markets) {
        try {
          const url = `${this.BASE_URL}/sports/${sport}/events/${gameId}/odds/?` +
            `apiKey=${this.API_KEY}&` +
            `regions=us&` +
            `markets=${market}&` +
            `bookmakers=draftkings,fanduel&` +
            `oddsFormat=american&` +
            `dateFormat=iso`;

          console.log(`📡 Fetching ${market} props for game ${gameId}`);
          
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data && data.bookmakers) {
              const props = this.transformPlayerPropsData(data, market, gameId, sport);
              allProps.push(...props);
              console.log(`✅ Found ${props.length} ${market} props for game ${gameId}`);
            } else {
              console.log(`ℹ️ No ${market} props available for game ${gameId}`);
            }
          } else if (response.status === 429) {
            console.warn(`⏰ Rate limited for ${market} on game ${gameId}`);
            break; // Stop to avoid further rate limits
          } else {
            console.warn(`⚠️ API error for ${market} on game ${gameId}: ${response.status}`);
          }
          
          // Add delay between market calls to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.warn(`Failed to fetch ${market} for game ${gameId}:`, error);
        }
      }

      this.setCache(cacheKey, allProps, this.CACHE_TTL);
      console.log(`✅ Total real player props for game ${gameId}: ${allProps.length}`);
      return allProps;

    } catch (error) {
      console.error(`❌ Error fetching player props for game ${gameId}:`, error);
      return [];
    }
  }

  /**
   * Transform The Odds API player props data into our format
   */
  private transformPlayerPropsData(
    apiData: any, 
    market: string, 
    gameId: string, 
    sport: string
  ): RealPlayerProp[] {
    const props: RealPlayerProp[] = [];

    try {
      if (!apiData.bookmakers || !Array.isArray(apiData.bookmakers)) {
        return props;
      }

      // Process each bookmaker's markets
      apiData.bookmakers.forEach((bookmaker: any) => {
        if (!bookmaker.markets || !Array.isArray(bookmaker.markets)) {
          return;
        }

        bookmaker.markets.forEach((marketData: any) => {
          if (marketData.key !== market || !marketData.outcomes) {
            return;
          }

          // Group outcomes by player
          const playerOutcomes = new Map<string, any[]>();
          
          marketData.outcomes.forEach((outcome: any) => {
            if (outcome.description && outcome.description.name) {
              const playerName = outcome.description.name;
              if (!playerOutcomes.has(playerName)) {
                playerOutcomes.set(playerName, []);
              }
              playerOutcomes.get(playerName)!.push(outcome);
            }
          });

          // Create props for each player
          playerOutcomes.forEach((outcomes, playerName) => {
            const overOutcome = outcomes.find(o => o.name === 'Over');
            const underOutcome = outcomes.find(o => o.name === 'Under');
            
            if (overOutcome && underOutcome && overOutcome.point !== undefined) {
              const propId = `${gameId}_${playerName.replace(/\s+/g, '_')}_${market}_${bookmaker.key}`;
              
              const prop: RealPlayerProp = {
                id: propId,
                gameId: gameId,
                playerId: this.generatePlayerId(playerName, apiData.home_team, apiData.away_team),
                playerName: playerName,
                team: this.determinePlayerTeam(playerName, apiData.home_team, apiData.away_team),
                opponent: this.determineOpponent(playerName, apiData.home_team, apiData.away_team),
                position: this.estimatePosition(playerName, sport, market),
                sport: sport,
                propType: market,
                market: this.formatMarketName(market),
                line: overOutcome.point,
                bookmakers: {
                  [bookmaker.key]: {
                    over: overOutcome.price,
                    under: underOutcome.price,
                    lastUpdated: bookmaker.last_update || new Date().toISOString()
                  }
                },
                gameTime: apiData.commence_time || new Date().toISOString(),
                venue: apiData.venue || '',
                isActive: true,
                lastUpdated: new Date().toISOString()
              };
              
              props.push(prop);
            }
          });
        });
      });

    } catch (error) {
      console.error('Error transforming player props data:', error);
    }

    return props;
  }

  /**
   * Utility methods for data transformation
   */
  private generatePlayerId(playerName: string, homeTeam: string, awayTeam: string): string {
    return `${playerName.toLowerCase().replace(/\s+/g, '_')}_${homeTeam}_${awayTeam}`;
  }

  private determinePlayerTeam(playerName: string, homeTeam: string, awayTeam: string): string {
    // In a real implementation, this would use a player database
    // For now, we can't determine team from The Odds API data alone
    return homeTeam; // Default assumption
  }

  private determineOpponent(playerName: string, homeTeam: string, awayTeam: string): string {
    const team = this.determinePlayerTeam(playerName, homeTeam, awayTeam);
    return team === homeTeam ? awayTeam : homeTeam;
  }

  private estimatePosition(playerName: string, sport: string, market: string): string {
    // Basic position estimation based on market type
    if (sport.includes('football')) {
      if (market.includes('passing')) return 'QB';
      if (market.includes('rushing')) return 'RB';
      if (market.includes('receiving')) return 'WR';
      return 'FLEX';
    } else if (sport.includes('basketball')) {
      if (market.includes('assists')) return 'PG';
      if (market.includes('rebounds')) return 'C';
      return 'GUARD/FORWARD';
    }
    return 'PLAYER';
  }

  private formatMarketName(market: string): string {
    const marketNames: Record<string, string> = {
      'player_points': 'Points',
      'player_rebounds': 'Rebounds',
      'player_assists': 'Assists',
      'player_rushing_yards': 'Rushing Yards',
      'player_passing_yards': 'Passing Yards',
      'player_receiving_yards': 'Receiving Yards',
      'player_touchdowns': 'Touchdowns'
    };
    return marketNames[market] || market;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): RealPlayerProp[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: RealPlayerProp[], ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
}

export const realPlayerPropsService = new RealPlayerPropsService();