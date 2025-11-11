/**
 * Parlay Optimizer - Advanced Features for Phase 2
 * Multi-leg optimization, line shopping, edge detection, live recalculation
 */

import { NormalizedMarket } from './OddsAPI';

export interface OptimizedLeg {
  id: string;
  eventId: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string;
  odds: number;
  line?: number;
  bookmaker: string;
  alternativeOdds?: Array<{
    bookmaker: string;
    odds: number;
    edge: number; // Difference in cents per dollar
  }>;
  edgeVsMarket?: number; // Edge vs average market odds
  confidence?: number; // 0-1 confidence score
}

export interface LineMovement {
  eventId: string;
  market: string;
  bookmaker: string;
  originalOdds: number;
  currentOdds: number;
  direction: 'improving' | 'worsening' | 'stable';
  changePercent: number;
  timestamp: string;
}

export interface OptimizationResult {
  originalParlay: {
    totalOdds: number;
    payout: number;
  };
  optimizedParlay: {
    totalOdds: number;
    payout: number;
    legs: OptimizedLeg[];
  };
  improvement: {
    oddsImprovement: number;
    payoutIncrease: number;
    percentIncrease: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface LiveRecalculation {
  legChanges: Array<{
    legId: string;
    previousOdds: number;
    currentOdds: number;
    changePercent: number;
  }>;
  previousParlayOdds: number;
  currentParlayOdds: number;
  previousPayout: number;
  currentPayout: number;
  payoutChange: number;
  shouldReconsider: boolean;
  reasons: string[];
}

export interface BetSizingRecommendation {
  minBet: number;
  maxBet: number;
  recommendedBet: number;
  confidence: number; // 0-1
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  reasoning: string[];
  kellyFraction: number;
  expectedReturn: number;
}

export class ParlayOptimizer {
  private static readonly SIGNIFICANT_MOVEMENT_THRESHOLD = 0.05; // 5% odds change
  private static readonly MIN_EDGE_FOR_RECOMMENDATION = 0.02; // 2% edge
  
  /**
   * Find the best odds for each leg across all bookmakers
   */
  static optimizeParlay(
    legs: Array<{
      eventId: string;
      market: string;
      selection: string;
      currentOdds: number;
      currentBookmaker: string;
    }>,
    allMarkets: NormalizedMarket[]
  ): OptimizationResult {
    const optimizedLegs: OptimizedLeg[] = [];
    let originalOddsProduct = 1;
    let optimizedOddsProduct = 1;

    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Group markets by event
    const marketsByEvent = new Map<string, NormalizedMarket[]>();
    for (const market of allMarkets) {
      if (!marketsByEvent.has(market.eventId)) {
        marketsByEvent.set(market.eventId, []);
      }
      marketsByEvent.get(market.eventId)!.push(market);
    }

    // Optimize each leg
    for (const leg of legs) {
      const eventMarkets = marketsByEvent.get(leg.eventId) || [];
      
      // Find best odds for this selection
      const oddsOptions = this.findBestOddsForSelection(
        leg.market,
        leg.selection,
        eventMarkets
      );

      if (oddsOptions.length === 0) {
        warnings.push(`No odds found for ${leg.selection} in ${leg.market}`);
        continue;
      }

      // Best odds
      const bestOdds = oddsOptions[0];
      const currentLegOdds = this.americanToDecimal(leg.currentOdds);
      const bestLegOdds = this.americanToDecimal(bestOdds.odds);

      originalOddsProduct *= currentLegOdds;
      optimizedOddsProduct *= bestLegOdds;

      // Calculate edge vs current bookmaker
      const edgeVsCurrent = ((bestLegOdds - currentLegOdds) / currentLegOdds) * 100;

      // Calculate edge vs market average
      const avgOdds = oddsOptions.reduce((sum, opt) => 
        sum + this.americanToDecimal(opt.odds), 0
      ) / oddsOptions.length;
      const edgeVsMarket = ((bestLegOdds - avgOdds) / avgOdds) * 100;

      optimizedLegs.push({
        id: `${leg.eventId}-${leg.market}`,
        eventId: leg.eventId,
        market: leg.market as any,
        selection: leg.selection,
        odds: bestOdds.odds,
        bookmaker: bestOdds.bookmaker,
        alternativeOdds: oddsOptions.slice(1, 4).map(opt => ({
          bookmaker: opt.bookmaker,
          odds: opt.odds,
          edge: ((this.americanToDecimal(opt.odds) - currentLegOdds) / currentLegOdds) * 100,
        })),
        edgeVsMarket,
        confidence: this.calculateConfidence(oddsOptions, bestOdds.odds),
      });

      // Generate recommendations
      if (edgeVsCurrent > this.MIN_EDGE_FOR_RECOMMENDATION * 100) {
        recommendations.push(
          `Switch to ${bestOdds.bookmaker} for ${leg.selection} (${edgeVsCurrent.toFixed(2)}% better odds)`
        );
      }

      if (edgeVsMarket < -5) {
        warnings.push(
          `${leg.selection} at ${bestOdds.bookmaker} is ${Math.abs(edgeVsMarket).toFixed(2)}% worse than market average`
        );
      }
    }

    // Calculate improvement
    const originalPayout = (originalOddsProduct - 1) * 100;
    const optimizedPayout = (optimizedOddsProduct - 1) * 100;
    const payoutIncrease = optimizedPayout - originalPayout;
    const percentIncrease = (payoutIncrease / originalPayout) * 100;

    return {
      originalParlay: {
        totalOdds: this.decimalToAmerican(originalOddsProduct),
        payout: originalPayout,
      },
      optimizedParlay: {
        totalOdds: this.decimalToAmerican(optimizedOddsProduct),
        payout: optimizedPayout,
        legs: optimizedLegs,
      },
      improvement: {
        oddsImprovement: optimizedOddsProduct - originalOddsProduct,
        payoutIncrease,
        percentIncrease,
      },
      recommendations,
      warnings,
    };
  }

  /**
   * Find best odds across all bookmakers for a specific selection
   */
  private static findBestOddsForSelection(
    market: string,
    selection: string,
    markets: NormalizedMarket[]
  ): Array<{ bookmaker: string; odds: number }> {
    const options: Array<{ bookmaker: string; odds: number }> = [];

    for (const m of markets) {
      let odds: number | undefined;

      switch (market) {
        case 'moneyline':
          if (m.moneyline) {
            odds = selection === 'home' ? m.moneyline.home : m.moneyline.away;
          }
          break;
        case 'spread':
          if (m.spread) {
            odds = selection === 'home' ? m.spread.home : m.spread.away;
          }
          break;
        case 'total':
          if (m.total) {
            odds = selection === 'over' ? m.total.over : m.total.under;
          }
          break;
      }

      if (odds !== undefined && odds !== 0) {
        options.push({ bookmaker: m.bookmaker, odds });
      }
    }

    // Sort by best odds (highest decimal value)
    return options.sort((a, b) => 
      this.americanToDecimal(b.odds) - this.americanToDecimal(a.odds)
    );
  }

  /**
   * Calculate confidence score based on odds consistency
   */
  private static calculateConfidence(
    allOdds: Array<{ odds: number }>,
    bestOdds: number
  ): number {
    if (allOdds.length === 0) return 0;
    if (allOdds.length === 1) return 0.5;

    const decimalOdds = allOdds.map(o => this.americanToDecimal(o.odds));
    const avg = decimalOdds.reduce((sum, o) => sum + o, 0) / decimalOdds.length;
    const variance = decimalOdds.reduce((sum, o) => sum + Math.pow(o - avg, 2), 0) / decimalOdds.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher confidence
    const coefficientOfVariation = stdDev / avg;
    const confidence = Math.max(0, Math.min(1, 1 - (coefficientOfVariation * 5)));

    return confidence;
  }

  /**
   * Track line movement and detect significant changes
   */
  static trackLineMovement(
    legId: string,
    previousOdds: number,
    currentOdds: number,
    eventId: string,
    market: string,
    bookmaker: string
  ): LineMovement {
    const previousDecimal = this.americanToDecimal(previousOdds);
    const currentDecimal = this.americanToDecimal(currentOdds);
    
    const changePercent = ((currentDecimal - previousDecimal) / previousDecimal) * 100;
    
    let direction: 'improving' | 'worsening' | 'stable';
    if (Math.abs(changePercent) < 1) {
      direction = 'stable';
    } else if (changePercent > 0) {
      direction = 'improving'; // Better odds for bettor
    } else {
      direction = 'worsening'; // Worse odds for bettor
    }

    return {
      eventId,
      market,
      bookmaker,
      originalOdds: previousOdds,
      currentOdds,
      direction,
      changePercent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Recalculate parlay with live odds changes
   */
  static liveRecalculation(
    originalLegs: Array<{
      legId: string;
      odds: number;
    }>,
    currentLegs: Array<{
      legId: string;
      odds: number;
    }>
  ): LiveRecalculation {
    const legChanges = [];
    let previousOddsProduct = 1;
    let currentOddsProduct = 1;
    let significantChanges = 0;

    // Compare each leg
    for (let i = 0; i < originalLegs.length; i++) {
      const original = originalLegs[i];
      const current = currentLegs[i];

      const prevDecimal = this.americanToDecimal(original.odds);
      const currDecimal = this.americanToDecimal(current.odds);

      previousOddsProduct *= prevDecimal;
      currentOddsProduct *= currDecimal;

      const changePercent = ((currDecimal - prevDecimal) / prevDecimal) * 100;

      if (Math.abs(changePercent) > this.SIGNIFICANT_MOVEMENT_THRESHOLD * 100) {
        significantChanges++;
      }

      legChanges.push({
        legId: original.legId,
        previousOdds: original.odds,
        currentOdds: current.odds,
        changePercent,
      });
    }

    const previousPayout = (previousOddsProduct - 1) * 100;
    const currentPayout = (currentOddsProduct - 1) * 100;
    const payoutChange = currentPayout - previousPayout;

    // Determine if bettor should reconsider
    const shouldReconsider = 
      significantChanges > 0 || 
      Math.abs(payoutChange) > previousPayout * 0.1; // >10% payout change

    const reasons = [];
    if (significantChanges > 0) {
      reasons.push(`${significantChanges} leg(s) have moved significantly (>5%)`);
    }
    if (payoutChange < 0) {
      reasons.push(`Payout decreased by $${Math.abs(payoutChange).toFixed(2)} (${((payoutChange / previousPayout) * 100).toFixed(2)}%)`);
    } else if (payoutChange > 0) {
      reasons.push(`Payout improved by $${payoutChange.toFixed(2)} (${((payoutChange / previousPayout) * 100).toFixed(2)}%)`);
    }

    return {
      legChanges,
      previousParlayOdds: this.decimalToAmerican(previousOddsProduct),
      currentParlayOdds: this.decimalToAmerican(currentOddsProduct),
      previousPayout,
      currentPayout,
      payoutChange,
      shouldReconsider,
      reasons,
    };
  }

  /**
   * Generate bet sizing recommendation
   */
  static recommendBetSize(
    parlayOdds: number,
    trueProbability: number,
    bankroll: number,
    ev: number,
    correlationWarnings: number
  ): BetSizingRecommendation {
    const reasoning: string[] = [];
    
    // Base Kelly Criterion
    const decimal = this.americanToDecimal(parlayOdds);
    const edge = trueProbability * (decimal - 1) - (1 - trueProbability);
    const kellyFull = edge / (decimal - 1);
    const kellyFraction = Math.max(0, kellyFull / 4); // 1/4 Kelly

    // Adjust for correlation
    const correlationAdjustment = Math.max(0.5, 1 - (correlationWarnings * 0.1));
    const adjustedKelly = kellyFraction * correlationAdjustment;

    if (correlationWarnings > 0) {
      reasoning.push(`Reduced bet size by ${((1 - correlationAdjustment) * 100).toFixed(0)}% due to ${correlationWarnings} correlation warning(s)`);
    }

    // Determine risk level and confidence
    let confidence = 0.7; // Default
    let riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';

    if (ev < 0) {
      riskLevel = 'conservative';
      confidence = 0.3;
      reasoning.push('Negative expected value - not recommended');
    } else if (ev < 0.05) {
      riskLevel = 'conservative';
      confidence = 0.5;
      reasoning.push('Low expected value (<5%)');
    } else if (ev > 0.15) {
      riskLevel = 'aggressive';
      confidence = 0.9;
      reasoning.push('High expected value (>15%) - strong opportunity');
    }

    // Adjust for parlay length (more legs = more risk)
    const legCount = correlationWarnings + 2; // Rough estimate
    if (legCount > 5) {
      confidence *= 0.9;
      reasoning.push(`${legCount}-leg parlay - increased risk`);
    }

    // Calculate bet sizes
    const maxBet = bankroll * 0.05; // Never more than 5%
    const recommendedBet = Math.min(adjustedKelly * bankroll, maxBet);
    const minBet = recommendedBet * 0.5;

    // Conservative recommendation
    const finalRecommendedBet = Math.max(10, Math.min(recommendedBet, maxBet));

    if (finalRecommendedBet >= maxBet) {
      reasoning.push(`Capped at 5% of bankroll ($${maxBet.toFixed(2)}) for risk management`);
    }

    const expectedReturn = finalRecommendedBet * ev;

    return {
      minBet,
      maxBet,
      recommendedBet: finalRecommendedBet,
      confidence,
      riskLevel,
      reasoning,
      kellyFraction: adjustedKelly,
      expectedReturn,
    };
  }

  /**
   * Detect edge opportunities per leg
   */
  static detectEdgePerLeg(
    legs: Array<{
      eventId: string;
      market: string;
      selection: string;
      odds: number;
      bookmaker: string;
    }>,
    allMarkets: NormalizedMarket[]
  ): Array<{
    legId: string;
    hasEdge: boolean;
    edge: number;
    marketAvgOdds: number;
    bestOdds: number;
    bestBookmaker: string;
    reasoning: string;
  }> {
    const marketsByEvent = new Map<string, NormalizedMarket[]>();
    for (const market of allMarkets) {
      if (!marketsByEvent.has(market.eventId)) {
        marketsByEvent.set(market.eventId, []);
      }
      marketsByEvent.get(market.eventId)!.push(market);
    }

    return legs.map(leg => {
      const eventMarkets = marketsByEvent.get(leg.eventId) || [];
      const oddsOptions = this.findBestOddsForSelection(
        leg.market,
        leg.selection,
        eventMarkets
      );

      if (oddsOptions.length === 0) {
        return {
          legId: `${leg.eventId}-${leg.market}`,
          hasEdge: false,
          edge: 0,
          marketAvgOdds: leg.odds,
          bestOdds: leg.odds,
          bestBookmaker: leg.bookmaker,
          reasoning: 'No market data available',
        };
      }

      const currentDecimal = this.americanToDecimal(leg.odds);
      const bestOdds = oddsOptions[0];
      const bestDecimal = this.americanToDecimal(bestOdds.odds);
      
      const avgDecimal = oddsOptions.reduce((sum, opt) => 
        sum + this.americanToDecimal(opt.odds), 0
      ) / oddsOptions.length;

      const edge = ((currentDecimal - avgDecimal) / avgDecimal) * 100;
      const hasEdge = edge > this.MIN_EDGE_FOR_RECOMMENDATION * 100;

      let reasoning = '';
      if (hasEdge) {
        reasoning = `${edge.toFixed(2)}% above market average - positive edge`;
      } else if (edge < -this.MIN_EDGE_FOR_RECOMMENDATION * 100) {
        reasoning = `${Math.abs(edge).toFixed(2)}% below market average - negative edge`;
      } else {
        reasoning = 'At market average';
      }

      return {
        legId: `${leg.eventId}-${leg.market}`,
        hasEdge,
        edge,
        marketAvgOdds: this.decimalToAmerican(avgDecimal),
        bestOdds: bestOdds.odds,
        bestBookmaker: bestOdds.bookmaker,
        reasoning,
      };
    });
  }

  // Utility functions
  private static americanToDecimal(american: number): number {
    return american > 0 ? (american / 100) + 1 : (100 / Math.abs(american)) + 1;
  }

  private static decimalToAmerican(decimal: number): number {
    return decimal >= 2 ? Math.round((decimal - 1) * 100) : Math.round(-100 / (decimal - 1));
  }
}

export default ParlayOptimizer;
