/**
 * Parlay Optimizer with Correlation Intelligence
 * Detects correlated picks and optimizes multi-leg parlays
 */

import { PropAnalysis } from './propAnalysisEngine';

export interface ParlayLeg {
  player: string;
  prop: string;
  line: number;
  pick: 'HIGHER' | 'LOWER' | 'home' | 'away' | 'over' | 'under';
  odds: number;
  gameId: string;
  team: string;
}

export interface CorrelationWarning {
  legs: string[];
  correlation: number; // -1 to 1
  warning: string;
  type: 'positive' | 'negative';
}

export interface ParlayAnalysis {
  legs: ParlayLeg[];
  correlationWarnings: CorrelationWarning[];
  recommendations: {
    instead: string;
    alternatives: Array<{
      game: string;
      safePick: string;
      reason: string;
    }>;
  };
  trueOdds: {
    naive: number; // Just multiplying probabilities
    adjusted: number; // After correlation adjustment
    difference: string;
  };
  expectedValue: number;
  independenceScore: number; // 0-100, higher = more independent (REAL calculation, not static)
  riskScore: number; // 0-100, lower is better
}

export interface ParlayRecommendation {
  name: string;
  legs: ParlayLeg[];
  trueOdds: number;
  expectedValue: number;
  reasoning: string;
}

export class ParlayOptimizer {
  private readonly MAX_PARLAY_LEGS = 5;
  
  /**
   * Analyze a parlay for correlations and value
   */
  analyzeParlay(legs: ParlayLeg[]): ParlayAnalysis {
    if (legs.length > this.MAX_PARLAY_LEGS) {
      console.warn(`Parlay has ${legs.length} legs, maximum recommended is ${this.MAX_PARLAY_LEGS}`);
    }
    
    // Detect correlations
    const correlationWarnings = this.detectCorrelations(legs);
    
    // Calculate independence score (REAL calculation, not static 100)
    const independenceScore = this.calculateIndependenceScore(legs, correlationWarnings);
    
    // Calculate true odds
    const trueOdds = this.calculateTrueOdds(legs, correlationWarnings);
    
    // Calculate expected value
    const expectedValue = this.calculateExpectedValue(legs, trueOdds);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(legs, correlationWarnings);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(legs, correlationWarnings);
    
    console.log(`📊 Parlay Analysis: Independence ${independenceScore}/100, Risk ${riskScore}/100, EV: ${expectedValue.toFixed(2)}`);
    
    return {
      legs,
      correlationWarnings,
      recommendations,
      trueOdds,
      expectedValue,
      independenceScore,
      riskScore
    };
  }
  
  /**
   * Build optimized parlay with uncorrelated picks
   */
  buildOptimizedParlay(
    availableLegs: ParlayLeg[],
    targetLegs: number = 3
  ): ParlayRecommendation {
    // Group by game to identify potential correlations
    const byGame = availableLegs.reduce((acc, leg) => {
      if (!acc[leg.gameId]) acc[leg.gameId] = [];
      acc[leg.gameId].push(leg);
      return acc;
    }, {} as Record<string, ParlayLeg[]>);
    
    // Select one leg per game to avoid same-game correlations
    const selectedLegs: ParlayLeg[] = [];
    
    for (const [gameId, gameLegs] of Object.entries(byGame)) {
      if (selectedLegs.length >= targetLegs) break;
      
      // Pick the best value leg from this game
      const bestLeg = gameLegs.reduce((max, leg) => 
        this.calculateLegValue(leg) > this.calculateLegValue(max) ? leg : max
      );
      if (bestLeg) {
        selectedLegs.push(bestLeg);
      }
    }
    
    // Calculate true odds and EV
    const analysis = this.analyzeParlay(selectedLegs);
    
    return {
      name: `${targetLegs}-Leg Optimized Parlay`,
      legs: selectedLegs,
      trueOdds: analysis.trueOdds.adjusted,
      expectedValue: analysis.expectedValue,
      reasoning: 'Spread across independent games to minimize correlation risk'
    };
  }
  
  /**
   * Suggest safe parlay alternatives
   */
  suggestSafeAlternatives(
    problematicLegs: ParlayLeg[],
    safeProps: PropAnalysis[]
  ): ParlayLeg[] {
    // Convert safe props to parlay legs
    const safeLegs: ParlayLeg[] = safeProps
      .filter(prop => prop.safetyScore >= 80)
      .slice(0, 3)
      .map((prop, index) => ({
        player: prop.player,
        prop: prop.prop,
        line: prop.line,
        pick: prop.recommendation as 'HIGHER' | 'LOWER',
        odds: -110, // Standard odds
        gameId: `game_${index}`,
        team: `Team ${index + 1}`
      }));
    
    return safeLegs;
  }
  
  // ============ PRIVATE METHODS ============
  
  /**
   * Detect correlated picks
   */
  private detectCorrelations(legs: ParlayLeg[]): CorrelationWarning[] {
    const warnings: CorrelationWarning[] = [];
    
    // Check same-game correlations
    const gameGroups = legs.reduce((acc, leg) => {
      if (!acc[leg.gameId]) acc[leg.gameId] = [];
      acc[leg.gameId].push(leg);
      return acc;
    }, {} as Record<string, ParlayLeg[]>);
    
    for (const [gameId, gameLegs] of Object.entries(gameGroups)) {
      if (gameLegs.length > 1) {
        // Analyze pairs for correlation
        for (let i = 0; i < gameLegs.length; i++) {
          for (let j = i + 1; j < gameLegs.length; j++) {
            const correlation = this.calculateCorrelation(gameLegs[i], gameLegs[j]);
            
            if (Math.abs(correlation) > 0.3) {
              warnings.push({
                legs: [
                  `${gameLegs[i].player} ${gameLegs[i].pick} ${gameLegs[i].line} ${gameLegs[i].prop}`,
                  `${gameLegs[j].player} ${gameLegs[j].pick} ${gameLegs[j].line} ${gameLegs[j].prop}`
                ],
                correlation,
                warning: correlation > 0 
                  ? 'These props move together - reduces true odds'
                  : 'These props oppose each other',
                type: correlation > 0 ? 'positive' : 'negative'
              });
            }
          }
        }
      }
    }
    
    return warnings;
  }
  
  /**
   * Calculate correlation between two legs
   */
  private calculateCorrelation(leg1: ParlayLeg, leg2: ParlayLeg): number {
    // Same game correlation
    if (leg1.gameId !== leg2.gameId) return 0;
    
    // Same team positive correlation
    if (leg1.team === leg2.team) {
      // QB passing yards and WR receiving yards (high positive)
      if (this.isPasserReceiver(leg1, leg2)) return 0.68;
      
      // Same team player props (moderate positive)
      if (leg1.player !== leg2.player) return 0.42;
      
      // Same player different props (moderate)
      return 0.35;
    }
    
    // Opposing teams (potential negative correlation)
    // Team total OVER vs Opponent Kicker UNDER
    if (this.isOpposingOutcomes(leg1, leg2)) return -0.42;
    
    // Different players, same game (slight positive - pace)
    return 0.15;
  }
  
  /**
   * Check if legs represent passer-receiver combo
   */
  private isPasserReceiver(leg1: ParlayLeg, leg2: ParlayLeg): boolean {
    const passing Props = ['passing_yards', 'pass_tds', 'completions'];
    const receivingProps = ['receiving_yards', 'receptions', 'rec_tds'];
    
    const leg1Passing = passingProps.some(p => leg1.prop.toLowerCase().includes(p));
    const leg2Receiving = receivingProps.some(p => leg2.prop.toLowerCase().includes(p));
    
    return (leg1Passing && leg2Receiving) || (leg2Passing && leg1Receiving);
  }
  
  /**
   * Check if legs have opposing outcomes
   */
  private isOpposingOutcomes(leg1: ParlayLeg, leg2: ParlayLeg): boolean {
    // Simplified check for opposing outcomes
    if (leg1.pick === 'over' && leg2.pick === 'under') return true;
    if (leg1.pick === 'HIGHER' && leg2.pick === 'LOWER') return true;
    
    return false;
  }
  
  /**
   * Calculate true odds accounting for correlations
   */
  private calculateTrueOdds(legs: ParlayLeg[], warnings: CorrelationWarning[]) {
    // Naive calculation (independent events)
    const naiveProb = legs.reduce((acc, leg) => {
      const prob = this.oddsToProb ability(leg.odds);
      return acc * prob;
    }, 1);
    
    // Adjust for correlations
    let adjustedProb = naiveProb;
    
    warnings.forEach(warning => {
      if (warning.type === 'positive') {
        // Positive correlation reduces true probability
        adjustedProb *= (1 - Math.abs(warning.correlation) * 0.3);
      }
    });
    
    const difference = ((1 - adjustedProb / naiveProb) * 100).toFixed(0);
    
    return {
      naive: Math.round(naiveProb * 1000) / 1000,
      adjusted: Math.round(adjustedProb * 1000) / 1000,
      difference: `${difference}% lower than displayed`
    };
  }
  
  /**
   * Convert American odds to probability
   */
  private oddsToProbability(americanOdds: number): number {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100);
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
  }
  
  /**
   * Calculate expected value
   */
  private calculateExpectedValue(legs: ParlayLeg[], trueOdds: any): number {
    // Calculate parlay payout
    const parlayOdds = this.calculateParlayOdds(legs);
    const payout = parlayOdds > 0 ? (parlayOdds / 100) + 1 : (100 / Math.abs(parlayOdds)) + 1;
    
    // EV = (Probability * Payout) - 1
    const ev = (trueOdds.adjusted * payout) - 1;
    
    return Math.round(ev * 100) / 100;
  }
  
  /**
   * Calculate combined parlay odds
   */
  private calculateParlayOdds(legs: ParlayLeg[]): number {
    // Simplified: Use average of -110 for multi-leg parlay
    const legCount = legs.length;
    
    // Approximate parlay payouts
    const payouts: { [key: number]: number } = {
      2: 260,   // +260
      3: 600,   // +600
      4: 1100,  // +1100
      5: 2000   // +2000
    };
    
    return payouts[Math.min(legCount, 5)] || 2000;
  }
  
  /**
   * Calculate independence score (0-100) - REAL calculation based on correlations
   * 100 = fully independent legs (different games, no correlations)
   * 0 = highly correlated (same game, same team, related props)
   */
  private calculateIndependenceScore(legs: ParlayLeg[], warnings: CorrelationWarning[]): number {
    if (legs.length <= 1) return 100;
    
    // Calculate average correlation across all leg pairs
    let totalCorrelation = 0;
    let pairCount = 0;
    
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const correlation = this.calculateCorrelation(legs[i], legs[j]);
        totalCorrelation += Math.abs(correlation);
        pairCount++;
      }
    }
    
    const avgCorrelation = pairCount > 0 ? totalCorrelation / pairCount : 0;
    
    // Convert to 0-100 score (0 correlation = 100 score, 1 correlation = 0 score)
    const score = Math.round((1 - avgCorrelation) * 100);
    
    // Additional penalties for same-game parlays
    const gameGroups = legs.reduce((acc, leg) => {
      if (!acc[leg.gameId]) acc[leg.gameId] = 0;
      acc[leg.gameId]++;
      return acc;
    }, {} as Record<string, number>);
    
    const sameGamePenalty = Object.values(gameGroups).reduce((penalty, count) => {
      if (count > 1) {
        // 10 points penalty per additional leg in same game
        penalty += (count - 1) * 10;
      }
      return penalty;
    }, 0);
    
    const finalScore = Math.max(0, Math.min(100, score - sameGamePenalty));
    
    console.log(`🎯 Independence Score: ${finalScore}/100 (avg correlation: ${(avgCorrelation * 100).toFixed(1)}%, same-game penalty: ${sameGamePenalty})`);
    
    return finalScore;
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(legs: ParlayLeg[], warnings: CorrelationWarning[]): number {
    let risk = 0;
    
    // Base risk from leg count
    risk += legs.length * 15;
    
    // Add risk for correlations
    risk += warnings.length * 10;
    
    // Add risk for same-game parlays
    const gameGroupsForRisk = legs.reduce((acc, leg) => {
      if (!acc[leg.gameId]) acc[leg.gameId] = [];
      acc[leg.gameId].push(leg);
      return acc;
    }, {} as Record<string, ParlayLeg[]>);
    const sameGameLegs = Object.values(gameGroupsForRisk).filter(g => g.length > 1).length;
    risk += sameGameLegs * 20;
    
    return Math.min(100, risk);
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(legs: ParlayLeg[], warnings: CorrelationWarning[]) {
    const instead = warnings.length > 0
      ? 'Consider spreading across games for true independence'
      : 'Parlay structure looks good';
    
    const alternatives = [
      {
        game: 'Alternative Game 1',
        safePick: 'Player A HIGHER 6.5 rebounds',
        reason: 'High safety score, uncorrelated'
      },
      {
        game: 'Alternative Game 2',
        safePick: 'Player B LOWER 14.5 points',
        reason: 'Strong recent trend'
      }
    ];
    
    return { instead, alternatives };
  }
  
  /**
   * Calculate value of a single leg
   */
  private calculateLegValue(leg: ParlayLeg): number {
    // Simplified value calculation
    // In production, use actual prop analysis
    const prob = this.oddsToProbability(leg.odds);
    return prob;
  }
}

// Export singleton instance
export const parlayOptimizer = new ParlayOptimizer();
