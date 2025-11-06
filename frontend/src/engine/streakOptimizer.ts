/**
 * Streak Optimizer Engine
 * Finds safest pick combinations for PrizePicks/Underdog style streaks
 */

import { PropAnalysis } from './analysisEngine';

export interface StreakCombo {
  picks: PropAnalysis[];
  combinedSafety: number;
  expectedHitRate: string;
  reasoning: string;
  size: number;
}

/**
 * Streak Optimizer Class
 * Recommends safe combinations for 2-5 pick streaks
 */
export class StreakOptimizer {
  private allProps: PropAnalysis[];
  
  constructor(allProps: PropAnalysis[]) {
    this.allProps = allProps;
  }
  
  /**
   * Get top safe picks sorted by safety score
   */
  getSafestPicks(count: number = 10): PropAnalysis[] {
    return this.allProps
      .filter(p => p.safetyScore >= 75)
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, count);
  }
  
  /**
   * Get picks to avoid (high risk)
   */
  getAvoidList(count: number = 5): PropAnalysis[] {
    return this.allProps
      .filter(p => p.safetyScore < 60 || p.risk.level === 'AVOID')
      .sort((a, b) => a.safetyScore - b.safetyScore)
      .slice(0, count);
  }
  
  /**
   * Recommend best 2-5 pick combos
   */
  recommendCombos(minPicks: number = 2, maxPicks: number = 5): StreakCombo[] {
    const safe = this.allProps.filter(p => p.safetyScore >= 80);
    const combos: StreakCombo[] = [];
    
    // Generate combinations for each size
    for (let size = minPicks; size <= maxPicks; size++) {
      const combo = this.findBestCombo(safe, size);
      if (combo) {
        combos.push(combo);
      }
    }
    
    return combos;
  }
  
  /**
   * Generate pre-built combo recommendations
   */
  getPrebuiltCombos(): {
    ultraSafe: StreakCombo | null;
    balanced: StreakCombo | null;
    highReward: StreakCombo | null;
  } {
    const allSafe = this.allProps.filter(p => p.safetyScore >= 75);
    
    return {
      ultraSafe: this.findBestCombo(allSafe.filter(p => p.safetyScore >= 90), 2),
      balanced: this.findBestCombo(allSafe.filter(p => p.safetyScore >= 85), 3),
      highReward: this.findBestCombo(allSafe.filter(p => p.safetyScore >= 80), 4)
    };
  }
  
  /**
   * Find best combination for a given size
   */
  private findBestCombo(picks: PropAnalysis[], size: number): StreakCombo | null {
    if (picks.length < size) return null;
    
    // Sort by safety score
    const sorted = picks.sort((a, b) => b.safetyScore - a.safetyScore);
    
    // Take top picks ensuring diversity (different games)
    const selected: PropAnalysis[] = [];
    const usedGames = new Set<string>();
    
    for (const pick of sorted) {
      const gameKey = `${pick.team}-${pick.opponent}`;
      if (!usedGames.has(gameKey) && selected.length < size) {
        selected.push(pick);
        usedGames.add(gameKey);
      }
      
      if (selected.length === size) break;
    }
    
    // Need exact size
    if (selected.length < size) return null;
    
    // Calculate combined metrics
    const avgSafety = this.average(selected.map(p => p.safetyScore));
    const combinedHitRate = selected.reduce((acc, p) => acc * p.metrics.hitRate, 1);
    
    return {
      picks: selected,
      combinedSafety: Math.round(avgSafety),
      expectedHitRate: (combinedHitRate * 100).toFixed(1) + '%',
      reasoning: this.generateReasoning(selected),
      size: selected.length
    };
  }
  
  /**
   * Generate reasoning for combo
   */
  private generateReasoning(picks: PropAnalysis[]): string {
    const reasons: string[] = [];
    
    // Check average variance
    const avgVariance = this.average(picks.map(p => p.metrics.variance));
    if (avgVariance < 1.5) {
      reasons.push('Low variance across all picks');
    }
    
    // Check if all different games
    const gameKeys = picks.map(p => `${p.team}-${p.opponent}`);
    const uniqueGames = new Set(gameKeys);
    if (uniqueGames.size === picks.length) {
      reasons.push('Picks from different games (no correlation)');
    }
    
    // Check average consistency
    const avgConsistency = this.average(picks.map(p => p.metrics.consistency));
    if (avgConsistency > 0.8) {
      reasons.push('High consistency players');
    }
    
    // Check injury status
    const allHealthy = picks.every(p => p.context.injuryStatus === 'healthy');
    if (allHealthy) {
      reasons.push('All players healthy');
    }
    
    // Check trends
    const increasingTrends = picks.filter(p => p.metrics.trend === 'increasing').length;
    if (increasingTrends >= picks.length / 2) {
      reasons.push('Majority trending upward');
    }
    
    return reasons.length > 0 ? reasons.join(' • ') : 'Solid combination';
  }
  
  /**
   * Build custom streak with user-selected picks
   */
  buildCustomStreak(pickIds: string[]): StreakCombo | null {
    // Filter props by IDs (would need ID field added to PropAnalysis)
    const selected = this.allProps.filter((p, i) => pickIds.includes(String(i)));
    
    if (selected.length < 2 || selected.length > 5) {
      return null;
    }
    
    const avgSafety = this.average(selected.map(p => p.safetyScore));
    const combinedHitRate = selected.reduce((acc, p) => acc * p.metrics.hitRate, 1);
    
    return {
      picks: selected,
      combinedSafety: Math.round(avgSafety),
      expectedHitRate: (combinedHitRate * 100).toFixed(1) + '%',
      reasoning: this.generateReasoning(selected),
      size: selected.length
    };
  }
  
  /**
   * Optimize an existing streak
   * Finds better alternatives to improve safety score
   */
  optimizeStreak(currentPicks: PropAnalysis[]): {
    original: StreakCombo;
    optimized: StreakCombo | null;
    improvement: number;
  } {
    const originalSafety = this.average(currentPicks.map(p => p.safetyScore));
    
    // Try to find better combo of same size
    const optimized = this.findBestCombo(this.allProps, currentPicks.length);
    
    const improvement = optimized 
      ? optimized.combinedSafety - originalSafety 
      : 0;
    
    return {
      original: {
        picks: currentPicks,
        combinedSafety: Math.round(originalSafety),
        expectedHitRate: this.calculateExpectedHitRate(currentPicks),
        reasoning: this.generateReasoning(currentPicks),
        size: currentPicks.length
      },
      optimized,
      improvement: Math.round(improvement)
    };
  }
  
  /**
   * Calculate expected hit rate for picks
   */
  private calculateExpectedHitRate(picks: PropAnalysis[]): string {
    const combined = picks.reduce((acc, p) => acc * p.metrics.hitRate, 1);
    return (combined * 100).toFixed(1) + '%';
  }
  
  /**
   * Utility: Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  /**
   * Get picks by risk level
   */
  getPicksByRisk(level: 'ELITE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AVOID'): PropAnalysis[] {
    return this.allProps.filter(p => p.risk.level === level);
  }
  
  /**
   * Get picks by confidence threshold
   */
  getPicksByConfidence(minConfidence: number): PropAnalysis[] {
    return this.allProps
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get today's top play (single highest safety score)
   */
  getTopPlay(): PropAnalysis | null {
    const safe = this.getSafestPicks(1);
    return safe.length > 0 ? safe[0] : null;
  }
  
  /**
   * Get contrarian picks (low public ownership, high safety)
   * Would need ownership data from platforms
   */
  getContrarianPicks(): PropAnalysis[] {
    // Placeholder - would need actual ownership data
    return this.getSafestPicks(5);
  }
}
