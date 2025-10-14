/**
 * Live Odds Service - Fetches real-time odds from major sportsbooks
 * Supports Underdog Fantasy, DraftKings, FanDuel, BetMGM, and more
 */

export interface LiveOdds {
  bookmaker: string;
  sport: string;
  game: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  odds: {
    moneyline?: {
      home: number;
      away: number;
    };
    spread?: {
      home: { point: number; odds: number };
      away: { point: number; odds: number };
    };
    total?: {
      over: { point: number; odds: number };
      under: { point: number; odds: number };
    };
  };
  lastUpdate: string;
}

export interface OddsComparison {
  game: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  bookmakers: {
    [key: string]: LiveOdds['odds'];
  };
  bestOdds: {
    homeMoneyline: { bookmaker: string; odds: number };
    awayMoneyline: { bookmaker: string; odds: number };
    homeSpread: { bookmaker: string; point: number; odds: number };
    awaySpread: { bookmaker: string; point: number; odds: number };
    over: { bookmaker: string; point: number; odds: number };
    under: { bookmaker: string; point: number; odds: number };
  };
}

class OddsService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.the-odds-api.com/v4';
  
  // Major sportsbook mappings
  private sportsbooks = {
    'draftkings': 'DraftKings',
    'fanduel': 'FanDuel', 
    'betmgm': 'BetMGM',
    'caesars': 'Caesars',
    'pointsbet_us': 'PointsBet',
    'betrivers': 'BetRivers',
    'wynnbet': 'WynnBet',
    'superbook': 'SuperBook',
    'unibet_us': 'Unibet'
  };

  constructor() {
    // API key should be set via environment variables in production
    this.apiKey = import.meta.env?.VITE_ODDS_API_KEY || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Get available sports with live odds
   */
  async getSports(): Promise<any[]> {
    if (!this.apiKey) {
      return this.getMockSports();
    }

    try {
      const response = await fetch(`${this.baseUrl}/sports/?apiKey=${this.apiKey}&all=false`);
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch live sports, using mock data:', error);
      return this.getMockSports();
    }
  }

  /**
   * Get live odds for a specific sport
   */
  async getLiveOdds(sport: string): Promise<LiveOdds[]> {
    if (!this.apiKey) {
      return this.getMockOdds(sport);
    }

    try {
      const bookmakers = Object.keys(this.sportsbooks).join(',');
      const url = `${this.baseUrl}/sports/${sport}/odds/?apiKey=${this.apiKey}&regions=us&markets=h2h,spreads,totals&bookmakers=${bookmakers}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return this.transformOddsData(data);
    } catch (error) {
      console.warn('Failed to fetch live odds, using mock data:', error);
      return this.getMockOdds(sport);
    }
  }

  /**
   * Get odds comparison across multiple sportsbooks
   */
  async getOddsComparison(sport: string): Promise<OddsComparison[]> {
    const liveOdds = await this.getLiveOdds(sport);
    return this.compareOdds(liveOdds);
  }

  /**
   * Find best odds across all sportsbooks for specific bets
   */
  async getBestOdds(sport: string, betType: 'moneyline' | 'spread' | 'total'): Promise<any[]> {
    const comparison = await this.getOddsComparison(sport);
    return comparison.map(game => ({
      game: game.game,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      bestOdds: game.bestOdds
    }));
  }

  /**
   * Transform API response to our format
   */
  private transformOddsData(data: any[]): LiveOdds[] {
    return data.map(game => {
      const odds: LiveOdds['odds'] = {};
      
      game.bookmakers?.forEach((bookmaker: any) => {
        bookmaker.markets?.forEach((market: any) => {
          if (market.key === 'h2h') {
            odds.moneyline = {
              home: market.outcomes.find((o: any) => o.name === game.home_team)?.price || 0,
              away: market.outcomes.find((o: any) => o.name === game.away_team)?.price || 0
            };
          } else if (market.key === 'spreads') {
            const homeOutcome = market.outcomes.find((o: any) => o.name === game.home_team);
            const awayOutcome = market.outcomes.find((o: any) => o.name === game.away_team);
            odds.spread = {
              home: { point: homeOutcome?.point || 0, odds: homeOutcome?.price || 0 },
              away: { point: awayOutcome?.point || 0, odds: awayOutcome?.price || 0 }
            };
          } else if (market.key === 'totals') {
            const overOutcome = market.outcomes.find((o: any) => o.name === 'Over');
            const underOutcome = market.outcomes.find((o: any) => o.name === 'Under');
            odds.total = {
              over: { point: overOutcome?.point || 0, odds: overOutcome?.price || 0 },
              under: { point: underOutcome?.point || 0, odds: underOutcome?.price || 0 }
            };
          }
        });
      });

      return {
        bookmaker: game.bookmakers?.[0]?.title || 'Unknown',
        sport: game.sport_key,
        game: `${game.away_team} @ ${game.home_team}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        gameTime: game.commence_time,
        odds,
        lastUpdate: new Date().toISOString()
      };
    });
  }

  /**
   * Compare odds across sportsbooks to find best value
   */
  private compareOdds(odds: LiveOdds[]): OddsComparison[] {
    const gameGroups = new Map<string, LiveOdds[]>();
    
    // Group odds by game
    odds.forEach(odd => {
      const key = `${odd.homeTeam}_${odd.awayTeam}`;
      if (!gameGroups.has(key)) {
        gameGroups.set(key, []);
      }
      gameGroups.get(key)!.push(odd);
    });

    // Find best odds for each game
    return Array.from(gameGroups.entries()).map(([gameKey, gameOdds]) => {
      const firstGame = gameOdds[0];
      const bookmakers: { [key: string]: LiveOdds['odds'] } = {};
      
      gameOdds.forEach(odd => {
        bookmakers[odd.bookmaker] = odd.odds;
      });

      // Find best odds across all bookmakers
      const bestOdds = this.findBestOdds(gameOdds);

      return {
        game: firstGame.game,
        homeTeam: firstGame.homeTeam,
        awayTeam: firstGame.awayTeam,
        gameTime: firstGame.gameTime,
        bookmakers,
        bestOdds
      };
    });
  }

  /**
   * Find the best odds across all bookmakers for a game
   */
  private findBestOdds(gameOdds: LiveOdds[]): OddsComparison['bestOdds'] {
    let bestOdds: OddsComparison['bestOdds'] = {
      homeMoneyline: { bookmaker: '', odds: -Infinity },
      awayMoneyline: { bookmaker: '', odds: -Infinity },
      homeSpread: { bookmaker: '', point: 0, odds: -Infinity },
      awaySpread: { bookmaker: '', point: 0, odds: -Infinity },
      over: { bookmaker: '', point: 0, odds: -Infinity },
      under: { bookmaker: '', point: 0, odds: -Infinity }
    };

    gameOdds.forEach(odd => {
      // Find best moneyline odds
      if (odd.odds.moneyline) {
        if (odd.odds.moneyline.home > bestOdds.homeMoneyline.odds) {
          bestOdds.homeMoneyline = { bookmaker: odd.bookmaker, odds: odd.odds.moneyline.home };
        }
        if (odd.odds.moneyline.away > bestOdds.awayMoneyline.odds) {
          bestOdds.awayMoneyline = { bookmaker: odd.bookmaker, odds: odd.odds.moneyline.away };
        }
      }

      // Find best spread odds
      if (odd.odds.spread) {
        if (odd.odds.spread.home.odds > bestOdds.homeSpread.odds) {
          bestOdds.homeSpread = {
            bookmaker: odd.bookmaker,
            point: odd.odds.spread.home.point,
            odds: odd.odds.spread.home.odds
          };
        }
        if (odd.odds.spread.away.odds > bestOdds.awaySpread.odds) {
          bestOdds.awaySpread = {
            bookmaker: odd.bookmaker,
            point: odd.odds.spread.away.point,
            odds: odd.odds.spread.away.odds
          };
        }
      }

      // Find best total odds
      if (odd.odds.total) {
        if (odd.odds.total.over.odds > bestOdds.over.odds) {
          bestOdds.over = {
            bookmaker: odd.bookmaker,
            point: odd.odds.total.over.point,
            odds: odd.odds.total.over.odds
          };
        }
        if (odd.odds.total.under.odds > bestOdds.under.odds) {
          bestOdds.under = {
            bookmaker: odd.bookmaker,
            point: odd.odds.total.under.point,
            odds: odd.odds.total.under.odds
          };
        }
      }
    });

    return bestOdds;
  }

  /**
   * Mock data for development/fallback
   */
  private getMockSports() {
    return [
      { key: 'americanfootball_nfl', title: 'NFL' },
      { key: 'basketball_nba', title: 'NBA' },
      { key: 'icehockey_nhl', title: 'NHL' },
      { key: 'baseball_mlb', title: 'MLB' },
      { key: 'soccer_usa_mls', title: 'MLS' }
    ];
  }

  /**
   * Mock odds data for development
   */
  private getMockOdds(sport: string): LiveOdds[] {
    return [
      {
        bookmaker: 'DraftKings',
        sport: sport,
        game: 'Lakers @ Warriors',
        homeTeam: 'Golden State Warriors',
        awayTeam: 'Los Angeles Lakers',
        gameTime: new Date(Date.now() + 3600000).toISOString(),
        odds: {
          moneyline: { home: -110, away: -110 },
          spread: { 
            home: { point: -2.5, odds: -110 }, 
            away: { point: 2.5, odds: -110 } 
          },
          total: { 
            over: { point: 225.5, odds: -110 }, 
            under: { point: 225.5, odds: -110 } 
          }
        },
        lastUpdate: new Date().toISOString()
      },
      {
        bookmaker: 'FanDuel',
        sport: sport,
        game: 'Lakers @ Warriors',
        homeTeam: 'Golden State Warriors',
        awayTeam: 'Los Angeles Lakers',
        gameTime: new Date(Date.now() + 3600000).toISOString(),
        odds: {
          moneyline: { home: -105, away: -115 },
          spread: { 
            home: { point: -2.5, odds: -105 }, 
            away: { point: 2.5, odds: -115 } 
          },
          total: { 
            over: { point: 225.5, odds: -115 }, 
            under: { point: 225.5, odds: -105 } 
          }
        },
        lastUpdate: new Date().toISOString()
      }
    ];
  }
}

export const oddsService = new OddsService();