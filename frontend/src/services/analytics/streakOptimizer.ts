/**
 * Streak Optimizer (Underdog/PrizePicks Style)
 * Identifies safest multi-pick combinations for betting streaks
 */

import { PropAnalysis } from './propAnalysisEngine';
import * as _ from 'lodash';

export interface StreakPick {
  rank: number;
  medal: string; // '🥇', '🥈', '🥉'
  player: string;
  prop: string;
  line: number;
  pick: 'HIGHER' | 'LOWER';
  safetyScore: number;
  reasoning: string;
  stats: {
    hitRate: number;
    lastTenGames: number[];
    variance: number;
  };
}

export interface StreakCombo {
  name: string;
  picks: string[];
  combinedSafety: number;
  expectedHitRate: number;
  reasoning: string;
  pickDetails: StreakPick[];
}

export interface StreakAvoid {
  player: string;
  prop: string;
  reason: string;
  lastTen: number[];
  variance: number;
}

export interface StreakRecommendations {
  recommended: StreakPick[];
  safeCombos: StreakCombo[];
  avoidToday: StreakAvoid[];
}

export class StreakOptimizer {
  /**
   * Generate streak recommendations from prop analyses
   */
  generateRecommendations(analyses: PropAnalysis[], topCount: number = 10): StreakRecommendations {
    // Filter for safe picks only
    const safePicks = analyses.filter(a => 
      a.safetyScore >= 75 && 
      a.recommendation !== 'AVOID' &&
      a.risk.level !== 'AVOID'
    );
    
    // Sort by safety score
    const sortedPicks = _.orderBy(safePicks, ['safetyScore', 'confidence'], ['desc', 'desc']);
    
    // Generate recommended picks
    const recommended = this.generateRecommendedPicks(sortedPicks, topCount);
    
    // Generate safe combos
    const safeCombos = this.generateSafeCombos(recommended);
    
    // Generate avoid list
    const avoidToday = this.generateAvoidList(analyses);
    
    return {
      recommended,
      safeCombos,
      avoidToday
    };
  }
  
  /**
   * Build custom streak based on user risk tolerance
   */
  buildCustomStreak(
    analyses: PropAnalysis[], 
    pickCount: number = 3, 
    riskTolerance: 'ultra-safe' | 'safe' | 'moderate' = 'safe'
  ): StreakCombo {
    // Set safety thresholds based on risk tolerance
    const safetyThresholds = {
      'ultra-safe': 90,
      'safe': 80,
      'moderate': 70
    };
    
    const minSafety = safetyThresholds[riskTolerance];
    
    // Filter and sort picks
    const safePicks = analyses
      .filter(a => a.safetyScore >= minSafety && a.recommendation !== 'AVOID')
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, pickCount);
    
    if (safePicks.length < pickCount) {
      throw new Error(`Not enough picks meeting ${riskTolerance} criteria (need ${pickCount}, found ${safePicks.length})`);
    }
    
    // Convert to streak picks
    const streakPicks: StreakPick[] = safePicks.map((analysis, index) => ({
      rank: index + 1,
      medal: this.getMedal(index + 1),
      player: analysis.player,
      prop: analysis.prop,
      line: analysis.line,
      pick: analysis.recommendation as 'HIGHER' | 'LOWER',
      safetyScore: analysis.safetyScore,
      reasoning: this.generateStreakReasoning(analysis),
      stats: {
        hitRate: analysis.metrics.hitRate,
        lastTenGames: analysis.history.lastFiveGames,
        variance: analysis.metrics.variance
      }
    }));
    
    // Calculate combined safety
    const combinedSafety = this.calculateCombinedSafety(streakPicks);
    
    // Calculate expected hit rate (product of individual hit rates)
    const expectedHitRate = streakPicks.reduce((acc, pick) => 
      acc * pick.stats.hitRate, 1
    );
    
    return {
      name: `${riskTolerance.toUpperCase()} ${pickCount}-Pick Streak`,
      picks: streakPicks.map(p => `${p.player} ${p.pick} ${p.line} ${p.prop}`),
      combinedSafety,
      expectedHitRate: Math.round(expectedHitRate * 100) / 100,
      reasoning: this.generateComboReasoning(streakPicks, riskTolerance),
      pickDetails: streakPicks
    };
  }
  
  /**
   * Find uncorrelated picks across different games
   */
  findUncorrelatedPicks(analyses: PropAnalysis[], count: number = 3): PropAnalysis[] {
    const safePicks = analyses.filter(a => a.safetyScore >= 80);
    
    // Group by team to avoid correlated picks
    const byTeam = _.groupBy(safePicks, 'player');
    
    // Take one pick per team
    const uncorrelated: PropAnalysis[] = [];
    for (const [, teamPicks] of Object.entries(byTeam)) {
      if (uncorrelated.length >= count) break;
      
      // Take highest safety pick from each team
      const bestPick = _.maxBy(teamPicks, 'safetyScore');
      if (bestPick) {
        uncorrelated.push(bestPick);
      }
    }
    
    return uncorrelated.slice(0, count);
  }
  
  // ============ PRIVATE METHODS ============
  
  private generateRecommendedPicks(analyses: PropAnalysis[], count: number): StreakPick[] {
    return analyses.slice(0, count).map((analysis, index) => ({
      rank: index + 1,
      medal: this.getMedal(index + 1),
      player: analysis.player,
      prop: analysis.prop,
      line: analysis.line,
      pick: analysis.recommendation as 'HIGHER' | 'LOWER',
      safetyScore: analysis.safetyScore,
      reasoning: this.generateStreakReasoning(analysis),
      stats: {
        hitRate: analysis.metrics.hitRate,
        lastTenGames: analysis.history.lastFiveGames,
        variance: analysis.metrics.variance
      }
    }));
  }
  
  private generateSafeCombos(picks: StreakPick[]): StreakCombo[] {
    const combos: StreakCombo[] = [];
    
    if (picks.length < 2) return combos;
    
    // Ultra Safe 2-Pick
    if (picks.length >= 2) {
      const topTwo = picks.slice(0, 2);
      combos.push({
        name: 'Ultra Safe 2-Pick',
        picks: topTwo.map(p => `${p.player} ${p.pick} ${p.line} ${p.prop}`),
        combinedSafety: Math.round((topTwo[0].safetyScore + topTwo[1].safetyScore) / 2),
        expectedHitRate: topTwo.reduce((acc, p) => acc * p.stats.hitRate, 1),
        reasoning: 'Highest safety scores with independent outcomes',
        pickDetails: topTwo
      });
    }
    
    // Balanced 3-Pick
    if (picks.length >= 3) {
      const topThree = picks.slice(0, 3);
      combos.push({
        name: 'Balanced 3-Pick',
        picks: topThree.map(p => `${p.player} ${p.pick} ${p.line} ${p.prop}`),
        combinedSafety: Math.round(topThree.reduce((sum, p) => sum + p.safetyScore, 0) / 3),
        expectedHitRate: topThree.reduce((acc, p) => acc * p.stats.hitRate, 1),
        reasoning: 'Best balance of safety and upside',
        pickDetails: topThree
      });
    }
    
    // Aggressive 4-Pick (if available)
    if (picks.length >= 4) {
      const topFour = picks.slice(0, 4);
      const avgSafety = topFour.reduce((sum, p) => sum + p.safetyScore, 0) / 4;
      
      if (avgSafety >= 80) {
        combos.push({
          name: 'High-Reward 4-Pick',
          picks: topFour.map(p => `${p.player} ${p.pick} ${p.line} ${p.prop}`),
          combinedSafety: Math.round(avgSafety),
          expectedHitRate: topFour.reduce((acc, p) => acc * p.stats.hitRate, 1),
          reasoning: 'Higher payout with still-strong safety metrics',
          pickDetails: topFour
        });
      }
    }
    
    return combos;
  }
  
  private generateAvoidList(analyses: PropAnalysis[]): StreakAvoid[] {
    // Find high-variance or low-consistency picks
    const avoidCandidates = analyses.filter(a => 
      a.metrics.variance > 3.5 || 
      a.metrics.consistency < 0.4 ||
      a.safetyScore < 60
    );
    
    return avoidCandidates.slice(0, 5).map(analysis => ({
      player: analysis.player,
      prop: analysis.prop,
      reason: this.generateAvoidReason(analysis),
      lastTen: analysis.history.lastFiveGames,
      variance: analysis.metrics.variance
    }));
  }
  
  private getMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }
  
  private generateStreakReasoning(analysis: PropAnalysis): string {
    const reasons: string[] = [];
    
    // Safety score
    if (analysis.safetyScore >= 90) {
      reasons.push('Elite safety profile');
    } else if (analysis.safetyScore >= 85) {
      reasons.push('Excellent consistency');
    } else {
      reasons.push('Solid track record');
    }
    
    // Consistency
    if (analysis.metrics.consistency > 0.8) {
      reasons.push(`${Math.round(analysis.metrics.consistency * 100)}% consistency rate`);
    }
    
    // Trend
    if (analysis.metrics.trend === 'increasing' && analysis.recommendation === 'HIGHER') {
      reasons.push('Strong upward trend');
    } else if (analysis.metrics.trend === 'decreasing' && analysis.recommendation === 'LOWER') {
      reasons.push('Clear downward trajectory');
    }
    
    // Variance
    if (analysis.metrics.variance < 1.5) {
      reasons.push('Low variance = predictable');
    }
    
    return reasons.join(', ');
  }
  
  private generateAvoidReason(analysis: PropAnalysis): string {
    if (analysis.metrics.variance > 4.0) {
      return `High variance (σ=${analysis.metrics.variance.toFixed(1)}) - too unpredictable`;
    }
    
    if (analysis.metrics.consistency < 0.3) {
      return `Low consistency (${Math.round(analysis.metrics.consistency * 100)}%) - unreliable performance`;
    }
    
    if (analysis.risk.warnings.length > 0) {
      return analysis.risk.warnings[0];
    }
    
    return 'Below safety threshold';
  }
  
  private calculateCombinedSafety(picks: StreakPick[]): number {
    if (picks.length === 0) return 0;
    
    // Weighted average with decay for each additional pick
    const weights = [1.0, 0.9, 0.85, 0.8, 0.75];
    let weightedSum = 0;
    let totalWeight = 0;
    
    picks.forEach((pick, index) => {
      const weight = weights[Math.min(index, weights.length - 1)];
      weightedSum += pick.safetyScore * weight;
      totalWeight += weight;
    });
    
    return Math.round(weightedSum / totalWeight);
  }
  
  private generateComboReasoning(picks: StreakPick[], riskTolerance: string): string {
    const avgSafety = Math.round(picks.reduce((sum, p) => sum + p.safetyScore, 0) / picks.length);
    const avgHitRate = picks.reduce((sum, p) => sum + p.stats.hitRate, 0) / picks.length;
    
    return `${picks.length}-pick ${riskTolerance} combo with ${avgSafety} avg safety score and ${(avgHitRate * 100).toFixed(0)}% individual hit rates`;
  }
}

// Export singleton instance
export const streakOptimizer = new StreakOptimizer();
