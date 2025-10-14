/**
 * Live Odds API Integration for Nova TitanAI
 * Fetches real-time odds from major sportsbooks including Underdog Fantasy
 */

export interface LiveOdds {
  id: string;
  sport: string;
  game: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  odds: {
    moneyline?: {
      home: number;
      away: number;
    };
    spread?: {
      home: number;
      away: number;
      points: number;
    };
    total?: {
      over: number;
      under: number;
      points: number;
    };
  };
  lastUpdated: string;
}

export interface BestOddsComparison {
  bestMoneyline?: {
    homeBook: string;
    awayBook: string;
    homeOdds: number;
    awayOdds: number;
  };
  arbitrageOpportunities: ArbitrageOpportunity[];
}

export interface ArbitrageOpportunity {
  type: 'moneyline' | 'spread' | 'total';
  profit: string;
  description: string;
  books: {
    book1: string;
    book2: string;
    odds1: number;
    odds2: number;
  };
  expiresIn?: number;
}

// Cache to prevent excessive API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

class OddsAPIService {
  private readonly baseUrl = 'https://api.the-odds-api.com/v4';
  private readonly apiKey = import.meta.env.VITE_ODDS_API_KEY || '6731f3f87993c07a3ac993c94e51f2cc';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 30000; // 30 seconds minimum between requests

  // Major sportsbooks including Underdog Fantasy
  private readonly bookmakers = [
    'draftkings',
    'fanduel', 
    'betmgm',
    'caesars',
    'underdog',
    'prizepicks',
    'betrivers',
    'pointsbet',
    'barstool'
  ];

  async getLiveOdds(sport: string = 'americanfootball_nfl'): Promise<LiveOdds[]> {
    // Check cache first
    const cacheKey = `odds_${sport}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached odds data - no API call made');
      return cached.data;
    }

    // Rate limiting - prevent calls within 30 seconds
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      console.warn(`Rate limited - using demo data. Wait ${Math.ceil((this.minRequestInterval - (now - this.lastRequestTime)) / 1000)} seconds`);
      return this.getDemoOdds();
    }

    try {
      this.requestCount++;
      this.lastRequestTime = now;
      console.log(`Making API request #${this.requestCount} to The-Odds-API`);

      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/odds?` +
        `apiKey=${this.apiKey}&` +
        `regions=us&` +
        `markets=h2h,spreads,totals&` +
        `bookmakers=${this.bookmakers.join(',')}&` +
        `oddsFormat=american&` +
        `dateFormat=unix`
      );
      
      if (!response.ok) {
        console.warn(`Odds API returned ${response.status}, using demo data. Requests made: ${this.requestCount}`);
        return this.getDemoOdds();
      }

      const data = await response.json();
      const transformedData = this.transformOddsData(data);
      
      // Cache the result
      cache.set(cacheKey, { data: transformedData, timestamp: now });
      console.log(`API request successful. Total requests: ${this.requestCount}`);
      
      return transformedData;
    } catch (error) {
      console.warn(`Using demo odds data. Total requests made: ${this.requestCount}`, error);
      return this.getDemoOdds();
    }
  }

  async getBestOddsComparison(sport: string): Promise<BestOddsComparison> {
    const allOdds = await this.getLiveOdds(sport);
    
    if (allOdds.length === 0) {
      return { arbitrageOpportunities: [] };
    }

    return {
      bestMoneyline: this.findBestMoneylineOdds(allOdds),
      arbitrageOpportunities: this.findArbitrageOpportunities(allOdds)
    };
  }

  async getArbitrageOpportunities(sport: string): Promise<ArbitrageOpportunity[]> {
    const allOdds = await this.getLiveOdds(sport);
    return this.findArbitrageOpportunities(allOdds);
  }

  private findArbitrageOpportunities(gameOdds: LiveOdds[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    // Group by game
    const gameGroups = this.groupOddsByGame(gameOdds);
    
    Object.values(gameGroups).forEach(odds => {
      const moneylineArb = this.checkMoneylineArbitrage(odds);
      if (moneylineArb) opportunities.push(moneylineArb);
    });
    
    return opportunities;
  }

  private checkMoneylineArbitrage(gameOdds: LiveOdds[]): ArbitrageOpportunity | null {
    const moneylineOdds = gameOdds.filter(o => o.odds.moneyline);
    if (moneylineOdds.length < 2) return null;

    const bestHome = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.home > best.odds.moneyline!.home ? current : best
    );
    
    const bestAway = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.away > best.odds.moneyline!.away ? current : best
    );

    const homeImplied = this.oddsToImpliedProbability(bestHome.odds.moneyline!.home);
    const awayImplied = this.oddsToImpliedProbability(bestAway.odds.moneyline!.away);
    const totalImplied = homeImplied + awayImplied;
    
    if (totalImplied < 0.98) {
      const profit = ((1 / totalImplied) - 1) * 100;
      return {
        type: 'moneyline',
        profit: profit.toFixed(2) + '%',
        description: `${bestHome.homeTeam} vs ${bestHome.awayTeam} - Risk-free profit`,
        books: {
          book1: bestHome.bookmaker,
          book2: bestAway.bookmaker,
          odds1: bestHome.odds.moneyline!.home,
          odds2: bestAway.odds.moneyline!.away
        },
        expiresIn: 15
      };
    }
    
    return null;
  }

  private groupOddsByGame(odds: LiveOdds[]): Record<string, LiveOdds[]> {
    return odds.reduce((groups, odd) => {
      if (!groups[odd.id]) {
        groups[odd.id] = [];
      }
      groups[odd.id].push(odd);
      return groups;
    }, {} as Record<string, LiveOdds[]>);
  }

  private oddsToImpliedProbability(americanOdds: number): number {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100);
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
  }

  private findBestMoneylineOdds(gameOdds: LiveOdds[]) {
    const moneylineOdds = gameOdds.filter(o => o.odds.moneyline);
    if (moneylineOdds.length === 0) return undefined;

    const bestHome = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.home > best.odds.moneyline!.home ? current : best
    );
    
    const bestAway = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.away > best.odds.moneyline!.away ? current : best
    );

    return {
      homeBook: bestHome.bookmaker,
      awayBook: bestAway.bookmaker,
      homeOdds: bestHome.odds.moneyline!.home,
      awayOdds: bestAway.odds.moneyline!.away
    };
  }

  private transformOddsData(apiData: any[]): LiveOdds[] {
    return apiData.flatMap(game => {
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      
      return game.bookmakers.map((bookmaker: any) => ({
        id: game.id,
        sport: game.sport_key,
        game: `${awayTeam} @ ${homeTeam}`,
        homeTeam,
        awayTeam,
        bookmaker: bookmaker.key,
        odds: this.extractOddsFromMarkets(bookmaker.markets),
        lastUpdated: new Date(game.commence_time * 1000).toISOString()
      }));
    });
  }

  private extractOddsFromMarkets(markets: any[]) {
    const odds: any = {};
    
    markets.forEach(market => {
      switch (market.key) {
        case 'h2h':
          odds.moneyline = {
            home: market.outcomes[0]?.price || 0,
            away: market.outcomes[1]?.price || 0
          };
          break;
        case 'spreads':
          const spreadOutcome = market.outcomes[0];
          odds.spread = {
            home: spreadOutcome.price,
            away: market.outcomes[1].price,
            points: spreadOutcome.point
          };
          break;
        case 'totals':
          const totalOutcome = market.outcomes.find((o: any) => o.name === 'Over');
          if (totalOutcome) {
            odds.total = {
              over: totalOutcome.price,
              under: market.outcomes.find((o: any) => o.name === 'Under')?.price || 0,
              points: totalOutcome.point
            };
          }
          break;
      }
    });
    
    return odds;
  }

  // Demo data fallback
  private getDemoOdds(): LiveOdds[] {
    return [
      {
        id: 'demo_nfl_1',
        sport: 'americanfootball_nfl',
        game: 'Chiefs @ Bills',
        homeTeam: 'Buffalo Bills',
        awayTeam: 'Kansas City Chiefs',
        bookmaker: 'draftkings',
        odds: {
          moneyline: { home: +120, away: -140 },
          spread: { home: +3, away: -3, points: 3 },
          total: { over: -110, under: -110, points: 47.5 }
        },
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'demo_nfl_1',
        sport: 'americanfootball_nfl', 
        game: 'Chiefs @ Bills',
        homeTeam: 'Buffalo Bills',
        awayTeam: 'Kansas City Chiefs',
        bookmaker: 'underdog',
        odds: {
          moneyline: { home: +125, away: -135 },
          spread: { home: +3, away: -3, points: 3 },
          total: { over: -105, under: -115, points: 47.5 }
        },
        lastUpdated: new Date().toISOString()
      }
    ];
  }
}

export const oddsAPI = new OddsAPIService();