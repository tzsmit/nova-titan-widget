/**
 * The Odds API Integration Service
 * Real-time odds aggregation from multiple bookmakers
 */

import axios, { AxiosInstance } from 'axios';

export interface NormalizedMarket {
  eventId: string;
  sport: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  
  // Main markets
  moneyline?: {
    home: number;
    away: number;
    homeDecimal: number;
    awayDecimal: number;
  };
  
  spread?: {
    home: number;
    homePoints: number;
    away: number;
    awayPoints: number;
  };
  
  total?: {
    over: number;
    overPoints: number;
    under: number;
    underPoints: number;
  };
  
  // Props
  props?: PlayerProp[];
  
  // Metadata
  lastUpdated: string;
  impliedProbability?: {
    home: number;
    away: number;
  };
  fairOdds?: {
    home: number;
    away: number;
  };
  hold?: number;
}

export interface PlayerProp {
  playerId?: string;
  playerName: string;
  market: string; // 'points', 'rebounds', 'assists', etc.
  line: number;
  over: number;
  under: number;
  overDecimal: number;
  underDecimal: number;
}

export interface OddsAPIConfig {
  apiKey: string;
  baseURL?: string;
  regions?: string;
  markets?: string;
}

export class OddsAPIService {
  private client: AxiosInstance;
  private apiKey: string;
  private regions: string;
  private markets: string;

  constructor(config: OddsAPIConfig) {
    this.apiKey = config.apiKey;
    this.regions = config.regions || 'us';
    this.markets = config.markets || 'h2h,spreads,totals';
    
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.the-odds-api.com/v4',
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });
  }

  /**
   * Get list of available sports
   */
  async getSports(): Promise<any[]> {
    try {
      const response = await this.client.get('/sports', {
        params: { apiKey: this.apiKey }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw new Error('Failed to fetch sports list');
    }
  }

  /**
   * Get live and upcoming events for a sport
   */
  async getEvents(sport: string): Promise<NormalizedMarket[]> {
    try {
      const response = await this.client.get(`/sports/${sport}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: this.regions,
          markets: this.markets,
          oddsFormat: 'american',
        }
      });

      // Normalize the response
      return this.normalizeEvents(response.data);
    } catch (error) {
      console.error(`Error fetching events for ${sport}:`, error);
      throw new Error(`Failed to fetch events for ${sport}`);
    }
  }

  /**
   * Get odds for a specific event
   */
  async getEventOdds(sport: string, eventId: string): Promise<NormalizedMarket[]> {
    try {
      const response = await this.client.get(`/sports/${sport}/events/${eventId}/odds`, {
        params: {
          apiKey: this.apiKey,
          regions: this.regions,
          markets: this.markets,
          oddsFormat: 'american',
        }
      });

      return this.normalizeEvents([response.data]);
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw new Error(`Failed to fetch event ${eventId}`);
    }
  }

  /**
   * Normalize API response to unified schema
   */
  private normalizeEvents(events: any[]): NormalizedMarket[] {
    const normalized: NormalizedMarket[] = [];

    for (const event of events) {
      for (const bookmaker of event.bookmakers || []) {
        const market: NormalizedMarket = {
          eventId: event.id,
          sport: event.sport_key,
          commenceTime: event.commence_time,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          bookmaker: bookmaker.key,
          lastUpdated: bookmaker.last_update || new Date().toISOString(),
        };

        // Process markets
        for (const marketData of bookmaker.markets || []) {
          if (marketData.key === 'h2h') {
            // Moneyline
            const homeOutcome = marketData.outcomes.find((o: any) => o.name === event.home_team);
            const awayOutcome = marketData.outcomes.find((o: any) => o.name === event.away_team);

            if (homeOutcome && awayOutcome) {
              market.moneyline = {
                home: homeOutcome.price,
                away: awayOutcome.price,
                homeDecimal: this.americanToDecimal(homeOutcome.price),
                awayDecimal: this.americanToDecimal(awayOutcome.price),
              };

              // Calculate implied probability and hold
              const homeProb = this.oddsToImpliedProbability(homeOutcome.price);
              const awayProb = this.oddsToImpliedProbability(awayOutcome.price);
              
              market.impliedProbability = {
                home: homeProb,
                away: awayProb,
              };

              market.hold = (homeProb + awayProb) - 1;

              // Calculate fair odds (remove vig)
              const totalProb = homeProb + awayProb;
              const fairHomeProb = homeProb / totalProb;
              const fairAwayProb = awayProb / totalProb;

              market.fairOdds = {
                home: this.probabilityToOdds(fairHomeProb),
                away: this.probabilityToOdds(fairAwayProb),
              };
            }
          } else if (marketData.key === 'spreads') {
            // Spreads
            const homeOutcome = marketData.outcomes.find((o: any) => o.name === event.home_team);
            const awayOutcome = marketData.outcomes.find((o: any) => o.name === event.away_team);

            if (homeOutcome && awayOutcome) {
              market.spread = {
                home: homeOutcome.price,
                homePoints: homeOutcome.point,
                away: awayOutcome.price,
                awayPoints: awayOutcome.point,
              };
            }
          } else if (marketData.key === 'totals') {
            // Totals
            const overOutcome = marketData.outcomes.find((o: any) => o.name === 'Over');
            const underOutcome = marketData.outcomes.find((o: any) => o.name === 'Under');

            if (overOutcome && underOutcome) {
              market.total = {
                over: overOutcome.price,
                overPoints: overOutcome.point,
                under: underOutcome.price,
                underPoints: underOutcome.point,
              };
            }
          }
        }

        normalized.push(market);
      }
    }

    return normalized;
  }

  /**
   * Convert American odds to Decimal
   */
  private americanToDecimal(american: number): number {
    if (american > 0) {
      return (american / 100) + 1;
    } else {
      return (100 / Math.abs(american)) + 1;
    }
  }

  /**
   * Convert odds to implied probability
   */
  private oddsToImpliedProbability(american: number): number {
    if (american > 0) {
      return 100 / (american + 100);
    } else {
      return Math.abs(american) / (Math.abs(american) + 100);
    }
  }

  /**
   * Convert probability to American odds
   */
  private probabilityToOdds(probability: number): number {
    if (probability >= 0.5) {
      return Math.round(-100 * probability / (1 - probability));
    } else {
      return Math.round(100 * (1 - probability) / probability);
    }
  }

  /**
   * Get remaining API quota
   */
  async getQuota(): Promise<{ used: number; remaining: number }> {
    try {
      const response = await this.client.get('/sports', {
        params: { apiKey: this.apiKey }
      });

      return {
        used: parseInt(response.headers['x-requests-used'] || '0'),
        remaining: parseInt(response.headers['x-requests-remaining'] || '0'),
      };
    } catch (error) {
      console.error('Error fetching quota:', error);
      return { used: 0, remaining: 0 };
    }
  }
}

/**
 * ESPN API Integration (for scores and additional data)
 */
export class ESPNAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://site.api.espn.com/apis/site/v2/sports',
      timeout: 10000,
    });
  }

  /**
   * Get live scores for a sport
   */
  async getScoreboard(sport: string, league: string): Promise<any> {
    try {
      const response = await this.client.get(`/${sport}/${league}/scoreboard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scoreboard for ${sport}/${league}:`, error);
      throw new Error(`Failed to fetch scoreboard`);
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(sport: string, league: string, teamId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${sport}/${league}/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team stats:`, error);
      throw new Error(`Failed to fetch team stats`);
    }
  }
}
