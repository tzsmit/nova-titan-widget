/**
 * Real Live Odds Service - The Odds API Integration
 * NO MOCK DATA - 100% Real-time odds from The Odds API
 */

import axios from 'axios';

const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY || 'effdb0775abef82ff5dd944ae2180cae';
const BASE_URL = 'https://api.the-odds-api.com/v4';

export interface LiveOdds {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

export interface PropMarket {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        description: string;
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

export class RealOddsService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds for live odds

  /**
   * Fetch live odds for NBA games
   * Returns REAL data from The Odds API
   */
  async getNBAOdds(): Promise<LiveOdds[]> {
    const cacheKey = 'nba_odds_live';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Using cached NBA odds');
      return cached;
    }

    try {
      console.log('🔴 Fetching LIVE NBA odds from The Odds API...');
      
      const response = await axios.get<LiveOdds[]>(`${BASE_URL}/sports/basketball_nba/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso'
        },
        timeout: 10000
      });

      const odds = response.data;
      this.setCache(cacheKey, odds);
      
      console.log(`✅ Fetched ${odds.length} NBA games with REAL live odds`);
      console.log(`📊 API usage - Remaining requests:`, response.headers['x-requests-remaining']);
      
      return odds;
    } catch (error: any) {
      console.error('❌ Error fetching NBA odds:', error.message);
      if (error.response?.status === 401) {
        console.error('🔑 Invalid API key');
      } else if (error.response?.status === 429) {
        console.error('⏰ Rate limit exceeded');
      }
      return [];
    }
  }

  /**
   * Fetch live odds for NFL games
   * Returns REAL data from The Odds API
   */
  async getNFLOdds(): Promise<LiveOdds[]> {
    const cacheKey = 'nfl_odds_live';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Using cached NFL odds');
      return cached;
    }

    try {
      console.log('🏈 Fetching LIVE NFL odds from The Odds API...');
      
      const response = await axios.get<LiveOdds[]>(`${BASE_URL}/sports/americanfootball_nfl/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
          dateFormat: 'iso'
        },
        timeout: 10000
      });

      const odds = response.data;
      this.setCache(cacheKey, odds);
      
      console.log(`✅ Fetched ${odds.length} NFL games with REAL live odds`);
      console.log(`📊 API usage - Remaining requests:`, response.headers['x-requests-remaining']);
      
      return odds;
    } catch (error: any) {
      console.error('❌ Error fetching NFL odds:', error.message);
      if (error.response?.status === 401) {
        console.error('🔑 Invalid API key');
      } else if (error.response?.status === 429) {
        console.error('⏰ Rate limit exceeded');
      }
      return [];
    }
  }

  /**
   * Get player props from The Odds API
   * Returns REAL prop data - NO MOCK DATA
   */
  async getPlayerProps(sport: 'basketball_nba' | 'americanfootball_nfl', market?: string): Promise<PropMarket[]> {
    const cacheKey = `props_${sport}_${market || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 Using cached ${sport} props`);
      return cached;
    }

    try {
      console.log(`🎯 Fetching REAL player props for ${sport}...`);
      
      // Default markets for each sport
      const defaultMarkets = sport === 'basketball_nba'
        ? 'player_points,player_rebounds,player_assists,player_threes,player_double_double'
        : 'player_pass_tds,player_pass_yds,player_rush_yds,player_receptions';
      
      const response = await axios.get<PropMarket[]>(`${BASE_URL}/sports/${sport}/odds`, {
        params: {
          apiKey: ODDS_API_KEY,
          regions: 'us',
          markets: market || defaultMarkets,
          oddsFormat: 'american',
          dateFormat: 'iso'
        },
        timeout: 10000
      });

      const props = response.data;
      this.setCache(cacheKey, props);
      
      console.log(`✅ Fetched ${props.length} games with REAL player props`);
      console.log(`📊 API usage - Remaining requests:`, response.headers['x-requests-remaining']);
      
      return props;
    } catch (error: any) {
      console.error(`❌ Error fetching ${sport} props:`, error.message);
      if (error.response?.status === 401) {
        console.error('🔑 Invalid API key');
      } else if (error.response?.status === 429) {
        console.error('⏰ Rate limit exceeded');
      }
      return [];
    }
  }

  /**
   * Get available sports
   */
  async getSports(): Promise<any[]> {
    try {
      const response = await axios.get(`${BASE_URL}/sports`, {
        params: {
          apiKey: ODDS_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  }

  /**
   * Calculate fair probability from American odds (remove vig)
   */
  calculateFairOdds(americanOdds: number): number {
    const decimal = this.americanToDecimal(americanOdds);
    const implied = 1 / decimal;
    return implied;
  }

  /**
   * Convert American odds to decimal
   */
  americanToDecimal(american: number): number {
    if (american > 0) {
      return (american / 100) + 1;
    } else {
      return (100 / Math.abs(american)) + 1;
    }
  }

  /**
   * Convert decimal odds to American
   */
  decimalToAmerican(decimal: number): number {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100);
    } else {
      return Math.round(-100 / (decimal - 1));
    }
  }

  /**
   * Remove vig from two-way market
   */
  removeVig(odds1: number, odds2: number): { fair1: number; fair2: number } {
    const implied1 = this.calculateFairOdds(odds1);
    const implied2 = this.calculateFairOdds(odds2);
    const totalImplied = implied1 + implied2;
    
    // Normalize to remove vig
    const fair1 = implied1 / totalImplied;
    const fair2 = implied2 / totalImplied;
    
    return { fair1, fair2 };
  }

  /**
   * Calculate Expected Value (EV)
   */
  calculateEV(odds: number, trueProbability: number, stake: number = 100): number {
    const decimal = this.americanToDecimal(odds);
    const payout = stake * decimal;
    const expectedReturn = (trueProbability * payout) + ((1 - trueProbability) * 0);
    const ev = expectedReturn - stake;
    return ev;
  }

  /**
   * Calculate Kelly Criterion bet size
   */
  calculateKelly(odds: number, trueProbability: number, bankroll: number = 1000): number {
    const decimal = this.americanToDecimal(odds);
    const b = decimal - 1; // Net odds
    const p = trueProbability;
    const q = 1 - p;
    
    const kelly = (b * p - q) / b;
    
    // Return as percentage of bankroll, capped at 10%
    return Math.max(0, Math.min(kelly * bankroll, bankroll * 0.1));
  }

  /**
   * Get best odds across all bookmakers for a market
   */
  getBestOdds(bookmakers: any[], marketKey: string, outcomeName: string): {
    best: number;
    bookmaker: string;
  } | null {
    let bestOdds = -Infinity;
    let bestBookmaker = '';

    for (const book of bookmakers) {
      const market = book.markets?.find((m: any) => m.key === marketKey);
      if (!market) continue;

      const outcome = market.outcomes?.find((o: any) => o.name === outcomeName);
      if (!outcome) continue;

      if (outcome.price > bestOdds) {
        bestOdds = outcome.price;
        bestBookmaker = book.title;
      }
    }

    return bestOdds > -Infinity ? { best: bestOdds, bookmaker: bestBookmaker } : null;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      console.log(`🗑️ Cache expired for ${key}`);
      return null;
    }
    
    console.log(`✅ Cache hit for ${key} (${Math.floor(age / 1000)}s old)`);
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached ${key}`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const realOddsService = new RealOddsService();
