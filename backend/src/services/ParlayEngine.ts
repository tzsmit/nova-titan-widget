/**
 * Parlay Calculation Engine
 * Handles parlay pricing, EV calculation, Kelly Criterion, and correlation detection
 */

export interface ParlayLeg {
  id: string;
  eventId: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string; // 'home', 'away', 'over', 'under', player name
  odds: number; // American odds
  line?: number; // For spreads/totals/props
  sport?: string;
  teams?: { home: string; away: string };
}

export interface ParlayResult {
  legs: ParlayLeg[];
  parlayOdds: number; // American odds
  parlayDecimalOdds: number;
  trueProbability: number;
  payout: number; // Per $100 bet
  expectedValue: number;
  kellyFraction: number;
  recommendedBankroll: number;
  correlationWarnings: CorrelationWarning[];
  isValid: boolean;
  errors: string[];
}

export interface CorrelationWarning {
  leg1: string;
  leg2: string;
  type: 'positive' | 'negative' | 'prohibited';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export class ParlayEngine {
  private static readonly KELLY_DIVISOR = 4; // Use fractional Kelly (1/4)
  private static readonly MIN_EDGE = 0.01; // 1% minimum edge for Kelly
  private static readonly MAX_BANKROLL = 0.05; // Never bet more than 5% of bankroll

  /**
   * Calculate parlay odds and metrics
   */
  static calculate(legs: ParlayLeg[], bankroll: number = 1000): ParlayResult {
    const result: ParlayResult = {
      legs,
      parlayOdds: 0,
      parlayDecimalOdds: 1,
      trueProbability: 1,
      payout: 0,
      expectedValue: 0,
      kellyFraction: 0,
      recommendedBankroll: 0,
      correlationWarnings: [],
      isValid: true,
      errors: [],
    };

    // Validation
    if (legs.length < 2) {
      result.isValid = false;
      result.errors.push('Parlay must have at least 2 legs');
      return result;
    }

    if (legs.length > 15) {
      result.isValid = false;
      result.errors.push('Parlay cannot exceed 15 legs');
      return result;
    }

    // Check for correlations
    result.correlationWarnings = this.detectCorrelations(legs);
    
    // Block prohibited correlations (same game parlays with specific combinations)
    const prohibited = result.correlationWarnings.filter(w => w.type === 'prohibited');
    if (prohibited.length > 0) {
      result.isValid = false;
      result.errors.push(...prohibited.map(w => w.message));
      return result;
    }

    // Calculate combined decimal odds
    let combinedDecimal = 1;
    let combinedProbability = 1;

    for (const leg of legs) {
      const decimal = this.americanToDecimal(leg.odds);
      const probability = this.oddsToImpliedProbability(leg.odds);
      
      combinedDecimal *= decimal;
      combinedProbability *= probability;
    }

    result.parlayDecimalOdds = combinedDecimal;
    result.parlayOdds = this.decimalToAmerican(combinedDecimal);
    result.payout = (combinedDecimal - 1) * 100; // Payout on $100 bet

    // Adjust probability for correlations
    result.trueProbability = this.adjustForCorrelations(
      combinedProbability,
      result.correlationWarnings
    );

    // Calculate Expected Value (EV)
    result.expectedValue = this.calculateEV(
      result.trueProbability,
      combinedDecimal
    );

    // Calculate Kelly Criterion
    if (result.expectedValue > this.MIN_EDGE) {
      const edge = result.trueProbability * (combinedDecimal - 1) - (1 - result.trueProbability);
      const kellyFull = edge / (combinedDecimal - 1);
      result.kellyFraction = kellyFull / this.KELLY_DIVISOR; // Fractional Kelly
      result.recommendedBankroll = Math.min(
        result.kellyFraction * bankroll,
        this.MAX_BANKROLL * bankroll
      );
    }

    return result;
  }

  /**
   * Detect correlations between legs
   */
  private static detectCorrelations(legs: ParlayLeg[]): CorrelationWarning[] {
    const warnings: CorrelationWarning[] = [];

    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const leg1 = legs[i];
        const leg2 = legs[j];

        // Same game check
        if (leg1.eventId === leg2.eventId) {
          warnings.push(...this.checkSameGameCorrelation(leg1, leg2));
        }

        // Same team check (across games)
        if (leg1.teams && leg2.teams) {
          const sameTeam = 
            leg1.teams.home === leg2.teams.home ||
            leg1.teams.home === leg2.teams.away ||
            leg1.teams.away === leg2.teams.home ||
            leg1.teams.away === leg2.teams.away;

          if (sameTeam) {
            warnings.push({
              leg1: `${leg1.selection} in ${leg1.teams.home} vs ${leg1.teams.away}`,
              leg2: `${leg2.selection} in ${leg2.teams.home} vs ${leg2.teams.away}`,
              type: 'positive',
              severity: 'low',
              message: 'Same team involved in multiple legs - slight positive correlation'
            });
          }
        }
      }
    }

    return warnings;
  }

  /**
   * Check for same-game correlations
   */
  private static checkSameGameCorrelation(leg1: ParlayLeg, leg2: ParlayLeg): CorrelationWarning[] {
    const warnings: CorrelationWarning[] = [];

    // Moneyline + Total correlation
    if (leg1.market === 'moneyline' && leg2.market === 'total') {
      warnings.push({
        leg1: `${leg1.selection} ML`,
        leg2: `${leg2.selection} ${leg2.line}`,
        type: 'positive',
        severity: 'medium',
        message: 'Moneyline and total in same game - moderate positive correlation'
      });
    }

    // Total + Spread correlation
    if ((leg1.market === 'total' && leg2.market === 'spread') ||
        (leg1.market === 'spread' && leg2.market === 'total')) {
      warnings.push({
        leg1: `${leg1.market} ${leg1.line}`,
        leg2: `${leg2.market} ${leg2.line}`,
        type: 'positive',
        severity: 'medium',
        message: 'Spread and total in same game - may be correlated'
      });
    }

    // Moneyline + Spread (same team) - PROHIBITED in most books
    if ((leg1.market === 'moneyline' && leg2.market === 'spread') ||
        (leg1.market === 'spread' && leg2.market === 'moneyline')) {
      if (leg1.selection === leg2.selection) {
        warnings.push({
          leg1: `${leg1.selection} ML`,
          leg2: `${leg2.selection} Spread`,
          type: 'prohibited',
          severity: 'high',
          message: 'Cannot combine moneyline and spread for same team in same game'
        });
      }
    }

    // Player props from same game
    if (leg1.market === 'prop' && leg2.market === 'prop') {
      warnings.push({
        leg1: `${leg1.selection} ${leg1.market}`,
        leg2: `${leg2.selection} ${leg2.market}`,
        type: 'positive',
        severity: 'low',
        message: 'Multiple player props from same game - check for correlation'
      });
    }

    return warnings;
  }

  /**
   * Adjust probability for correlations
   */
  private static adjustForCorrelations(
    naiveProbability: number,
    correlations: CorrelationWarning[]
  ): number {
    let adjusted = naiveProbability;

    for (const corr of correlations) {
      if (corr.type === 'positive') {
        // Positive correlation reduces true probability
        const penalty = corr.severity === 'high' ? 0.15 :
                       corr.severity === 'medium' ? 0.10 : 0.05;
        adjusted *= (1 - penalty);
      } else if (corr.type === 'negative') {
        // Negative correlation increases probability (rare)
        const bonus = 0.05;
        adjusted *= (1 + bonus);
      }
    }

    return adjusted;
  }

  /**
   * Calculate Expected Value
   */
  private static calculateEV(trueProbability: number, decimalOdds: number): number {
    return (trueProbability * (decimalOdds - 1)) - (1 - trueProbability);
  }

  /**
   * Convert American to Decimal odds
   */
  private static americanToDecimal(american: number): number {
    if (american > 0) {
      return (american / 100) + 1;
    } else {
      return (100 / Math.abs(american)) + 1;
    }
  }

  /**
   * Convert Decimal to American odds
   */
  private static decimalToAmerican(decimal: number): number {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100);
    } else {
      return Math.round(-100 / (decimal - 1));
    }
  }

  /**
   * Convert odds to implied probability
   */
  private static oddsToImpliedProbability(american: number): number {
    if (american > 0) {
      return 100 / (american + 100);
    } else {
      return Math.abs(american) / (Math.abs(american) + 100);
    }
  }

  /**
   * Find best lines across bookmakers
   */
  static findBestLines(markets: any[], selection: string): {
    best: any;
    savings: number;
    bookmaker: string;
  } | null {
    if (!markets || markets.length === 0) return null;

    let bestOdds = -Infinity;
    let bestMarket = null;

    for (const market of markets) {
      const odds = market.odds || market.price;
      if (odds > bestOdds) {
        bestOdds = odds;
        bestMarket = market;
      }
    }

    if (!bestMarket) return null;

    // Calculate savings vs worst line
    const worstOdds = Math.min(...markets.map(m => m.odds || m.price));
    const savings = this.calculateLineSavings(bestOdds, worstOdds);

    return {
      best: bestMarket,
      savings,
      bookmaker: bestMarket.bookmaker || 'Unknown'
    };
  }

  /**
   * Calculate monetary value of line shopping
   */
  private static calculateLineSavings(bestOdds: number, worstOdds: number): number {
    const bestDecimal = this.americanToDecimal(bestOdds);
    const worstDecimal = this.americanToDecimal(worstOdds);
    
    // Savings per $100 bet
    return (bestDecimal - worstDecimal) * 100;
  }
}
