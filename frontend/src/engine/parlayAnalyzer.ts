/**
 * Parlay Correlation Analyzer
 * Detects and warns about correlated props in parlays
 * Calculates true odds adjusted for correlation
 */

import { PropAnalysis } from './analysisEngine';

export interface CorrelationWarning {
  picks: string[]; // Player names
  correlation: number; // -1 to 1
  type: 'positive' | 'negative';
  warning: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AdjustedOdds {
  naive: number; // Simple multiplication
  adjusted: number; // Accounting for correlation
  difference: string; // Penalty percentage
  explanation: string;
}

/**
 * Parlay Correlation Analyzer
 */
export class ParlayCorrelationAnalyzer {
  /**
   * Detect correlations between picks
   */
  detectCorrelations(picks: PropAnalysis[]): CorrelationWarning[] {
    const warnings: CorrelationWarning[] = [];
    
    // Check all pairs
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        const p1 = picks[i];
        const p2 = picks[j];
        
        // Same game check
        if (this.isSameGame(p1, p2)) {
          const correlation = this.calculateCorrelation(p1, p2);
          
          if (Math.abs(correlation) > 0.3) {
            warnings.push({
              picks: [p1.player, p2.player],
              correlation: correlation,
              type: correlation > 0 ? 'positive' : 'negative',
              warning: this.getCorrelationWarning(correlation, p1, p2),
              severity: Math.abs(correlation) > 0.5 ? 'high' : 'medium'
            });
          }
        }
      }
    }
    
    return warnings;
  }
  
  /**
   * Check if two props are from the same game
   */
  private isSameGame(p1: PropAnalysis, p2: PropAnalysis): boolean {
    // Same team or opponent
    return (p1.team === p2.team || p1.opponent === p2.opponent) ||
           (p1.team === p2.opponent && p1.opponent === p2.team);
  }
  
  /**
   * Calculate correlation between two props
   * Uses known correlation rules and heuristics
   */
  calculateCorrelation(p1: PropAnalysis, p2: PropAnalysis): number {
    // Known correlation rules (can be expanded with ML)
    const correlationRules: Record<string, number> = {
      // NBA Positive Correlations
      'PG-assists_team-total': 0.60,
      'PG-assists_SG-points': 0.55,
      'C-rebounds_team-defensive-rebounds': 0.70,
      'PF-rebounds_C-rebounds': -0.35, // Compete for same boards
      
      // NBA Negative Correlations
      'team-pace_C-rebounds': -0.40,
      'team-defensive-rating_opponent-points': -0.65,
      
      // NFL Positive Correlations
      'QB-pass-yards_WR-rec-yards': 0.70,
      'QB-pass-TDs_WR-rec-TDs': 0.60,
      'QB-pass-attempts_WR-receptions': 0.65,
      'RB-rush-yards_team-time-possession': 0.50,
      
      // NFL Negative Correlations
      'RB-rush-yards_QB-pass-attempts': -0.45,
      'team-total-points_opp-kicker-FG': -0.50,
      'DEF-sacks_QB-pass-yards': -0.55,
      
      // General Same-Player Correlations
      'same-player-high-volume': 0.40, // If one stat is high, others may be lower
    };
    
    // Check for same player
    if (p1.player === p2.player) {
      // High correlation for volume stats on same player
      if (this.isVolumeStatPair(p1.prop, p2.prop)) {
        return 0.50; // Moderate positive correlation
      }
    }
    
    // Check position-based correlations
    const key1 = this.getCorrelationKey(p1, p2);
    const key2 = this.getCorrelationKey(p2, p1);
    
    const correlation = correlationRules[key1] || correlationRules[key2] || 0;
    
    // Check for same-team correlations
    if (p1.team === p2.team && Math.abs(correlation) < 0.3) {
      return 0.25; // Default positive correlation for teammates
    }
    
    return correlation;
  }
  
  /**
   * Get correlation key for lookup
   */
  private getCorrelationKey(p1: PropAnalysis, p2: PropAnalysis): string {
    // Simplified - would need position data
    return `${p1.prop}_${p2.prop}`;
  }
  
  /**
   * Check if two props are volume-correlated
   */
  private isVolumeStatPair(prop1: string, prop2: string): boolean {
    const volumeStats = ['points', 'rebounds', 'assists', 'pass-yards', 'rush-yards', 'receptions'];
    return volumeStats.includes(prop1) && volumeStats.includes(prop2);
  }
  
  /**
   * Get correlation warning message
   */
  private getCorrelationWarning(correlation: number, p1: PropAnalysis, p2: PropAnalysis): string {
    if (correlation > 0.5) {
      return `Strong positive correlation: When ${p1.player}'s ${p1.prop} goes over, ${p2.player}'s ${p2.prop} is likely to go over too. This reduces true parlay odds.`;
    } else if (correlation > 0.3) {
      return `Moderate positive correlation: These props tend to move together, reducing the independence of your parlay.`;
    } else if (correlation < -0.5) {
      return `Strong negative correlation: When ${p1.player}'s ${p1.prop} goes over, ${p2.player}'s ${p2.prop} is likely to go under. Consider this trade-off.`;
    } else if (correlation < -0.3) {
      return `Moderate negative correlation: These props tend to oppose each other.`;
    }
    
    return 'These props may be correlated.';
  }
  
  /**
   * Calculate adjusted odds accounting for correlation
   */
  calculateAdjustedOdds(picks: PropAnalysis[]): AdjustedOdds {
    // Naive probability (assuming independence)
    const naive = picks.reduce((acc, p) => acc * p.metrics.hitRate, 1);
    
    // Detect correlations
    const correlations = this.detectCorrelations(picks);
    
    // Apply correlation penalty
    let adjustment = 1.0;
    
    for (const corr of correlations) {
      if (corr.type === 'positive') {
        // Positive correlation reduces true probability
        // Higher correlation = bigger penalty
        const penalty = Math.abs(corr.correlation) * 0.25;
        adjustment *= (1 - penalty);
      } else {
        // Negative correlation may actually increase probability in some cases
        // But we'll be conservative and not boost it
        // adjustment *= (1 + Math.abs(corr.correlation) * 0.05);
      }
    }
    
    const adjusted = naive * adjustment;
    const penaltyPct = ((1 - adjustment) * 100).toFixed(1);
    
    return {
      naive: naive,
      adjusted: adjusted,
      difference: `${penaltyPct}% penalty`,
      explanation: this.generateOddsExplanation(correlations, naive, adjusted)
    };
  }
  
  /**
   * Generate explanation for odds adjustment
   */
  private generateOddsExplanation(
    correlations: CorrelationWarning[],
    naive: number,
    adjusted: number
  ): string {
    if (correlations.length === 0) {
      return `No significant correlations detected. Your picks appear independent.`;
    }
    
    const highSeverity = correlations.filter(c => c.severity === 'high').length;
    const reductionPct = ((1 - (adjusted / naive)) * 100).toFixed(1);
    
    if (highSeverity > 0) {
      return `⚠️ ${highSeverity} high-correlation warning(s). True odds reduced by ~${reductionPct}%. Consider uncorrelated alternatives.`;
    }
    
    return `${correlations.length} correlation(s) detected. True odds reduced by ~${reductionPct}%.`;
  }
  
  /**
   * Calculate expected value of parlay
   */
  calculateExpectedValue(picks: PropAnalysis[], parlayOdds: number): number {
    const { adjusted } = this.calculateAdjustedOdds(picks);
    
    // EV = (True Probability × Payout) - 1
    // Assuming $1 bet
    const payout = parlayOdds; // American odds to decimal conversion needed
    const ev = (adjusted * payout) - 1;
    
    return ev;
  }
  
  /**
   * Suggest uncorrelated alternatives
   */
  suggestAlternatives(
    problematicPick: PropAnalysis,
    allProps: PropAnalysis[],
    currentPicks: PropAnalysis[]
  ): PropAnalysis[] {
    // Find props that are:
    // 1. Not in current picks
    // 2. Similar safety score
    // 3. Not from same game as problematic pick
    // 4. Not correlated with other picks
    
    const alternatives = allProps.filter(p => {
      // Skip if already selected
      if (currentPicks.some(cp => cp.player === p.player && cp.prop === p.prop)) {
        return false;
      }
      
      // Skip if same game
      if (this.isSameGame(p, problematicPick)) {
        return false;
      }
      
      // Similar safety score (±10)
      if (Math.abs(p.safetyScore - problematicPick.safetyScore) > 10) {
        return false;
      }
      
      // Check correlation with other picks
      const hasCorrelation = currentPicks
        .filter(cp => cp.player !== problematicPick.player)
        .some(cp => Math.abs(this.calculateCorrelation(p, cp)) > 0.3);
      
      if (hasCorrelation) {
        return false;
      }
      
      return true;
    });
    
    // Sort by safety score
    return alternatives
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 5);
  }
  
  /**
   * Validate parlay for optimal independence
   */
  validateParlay(picks: PropAnalysis[]): {
    isOptimal: boolean;
    score: number; // 0-100
    recommendations: string[];
  } {
    const correlations = this.detectCorrelations(picks);
    const highCorrelations = correlations.filter(c => c.severity === 'high').length;
    const mediumCorrelations = correlations.filter(c => c.severity === 'medium').length;
    
    // Calculate independence score
    let score = 100;
    score -= (highCorrelations * 20);
    score -= (mediumCorrelations * 10);
    score = Math.max(0, score);
    
    const recommendations: string[] = [];
    
    if (highCorrelations > 0) {
      recommendations.push('Replace highly correlated picks with independent alternatives');
    }
    
    if (mediumCorrelations > 2) {
      recommendations.push('Too many correlated picks - consider diversifying across games');
    }
    
    const sameGamePicks = this.countSameGamePicks(picks);
    if (sameGamePicks > picks.length / 2) {
      recommendations.push('Over 50% of picks from same games - reduces true odds significantly');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Parlay looks good! Picks are well-diversified.');
    }
    
    return {
      isOptimal: score >= 80,
      score,
      recommendations
    };
  }
  
  /**
   * Count same-game picks
   */
  private countSameGamePicks(picks: PropAnalysis[]): number {
    let count = 0;
    const games = new Set<string>();
    
    for (const pick of picks) {
      const gameKey = `${pick.team}-${pick.opponent}`;
      if (games.has(gameKey)) {
        count++;
      }
      games.add(gameKey);
    }
    
    return count;
  }
}
