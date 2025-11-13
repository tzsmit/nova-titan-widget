/**
 * Advanced Prop Analysis Engine
 * Implements intelligent betting analytics with consistency, variance, and trend metrics
 */

import { mean, standardDeviation } from 'simple-statistics';

export interface PlayerPropData {
  player: string;
  prop: string; // 'rebounds', 'points', 'assists', etc.
  line: number;
  team: string;
  opponent: string;
  gameDate: string;
  isHome: boolean;
  
  // Historical Performance
  lastTenGames: number[];
  seasonAverage: number;
  homeAverage?: number;
  awayAverage?: number;
  vsOpponentHistory?: number[];
  
  // Context
  minutesPerGame: number;
  usageRate?: number;
  injuryStatus: 'healthy' | 'questionable' | 'out';
  restDays: number;
}

export interface PropAnalysis {
  player: string;
  prop: string;
  line: number;
  recommendation: 'HIGHER' | 'LOWER' | 'AVOID';
  confidence: number; // 0-100 scale
  
  // Core Analytics
  metrics: {
    consistency: number; // Hit rate over last 10 games (0-1)
    variance: number; // Standard deviation
    trend: 'increasing' | 'decreasing' | 'stable';
    recentAvg: number; // Last 5 games average
    seasonAvg: number;
    hitRate: number; // % of times clearing line
    floorGames: number; // % games within 1 unit of line
  };
  
  // Contextual Factors
  context: {
    matchupRating: 'favorable' | 'neutral' | 'unfavorable';
    paceImpact: string; // Expected pace adjustment
    usageRate: number;
    minutesTrend: 'stable' | 'increasing' | 'decreasing';
    injuryStatus: string;
    restDays: number;
  };
  
  // Risk Assessment
  risk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'AVOID';
    factors: string[];
    warnings: string[];
  };
  
  // Historical Performance
  history: {
    vsOpponent: string;
    lastFiveGames: number[];
    homeVsAway: { home: number; away: number };
    withWithout: string;
  };
  
  // Safety Score (for streak building)
  safetyScore: number; // 0-100
}

export class PropAnalysisEngine {
  /**
   * Analyze a single player prop
   */
  analyzeProp(propData: PlayerPropData): PropAnalysis {
    // Calculate core metrics
    const consistency = this.calculateConsistency(propData);
    const variance = this.calculateVariance(propData);
    const trend = this.calculateTrend(propData);
    const recentAvg = this.calculateRecentAverage(propData);
    const hitRate = this.calculateHitRate(propData);
    const floorGames = this.calculateFloorGames(propData);
    
    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(consistency, variance, hitRate);
    
    // Determine recommendation
    const recommendation = this.determineRecommendation(propData, recentAvg, safetyScore);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(consistency, variance, hitRate, safetyScore);
    
    // Analyze context
    const context = this.analyzeContext(propData);
    
    // Assess risk
    const risk = this.assessRisk(propData, consistency, variance, hitRate);
    
    // Historical analysis
    const history = this.analyzeHistory(propData);
    
    return {
      player: propData.player,
      prop: propData.prop,
      line: propData.line,
      recommendation,
      confidence,
      metrics: {
        consistency,
        variance,
        trend,
        recentAvg,
        seasonAvg: propData.seasonAverage,
        hitRate,
        floorGames
      },
      context,
      risk,
      history,
      safetyScore
    };
  }
  
  /**
   * Batch analyze multiple props
   */
  analyzeMultipleProps(props: PlayerPropData[]): PropAnalysis[] {
    return props.map(prop => this.analyzeProp(prop));
  }
  
  /**
   * Get top safe picks (for streak building)
   */
  getTopSafePicks(analyses: PropAnalysis[], count: number = 10): PropAnalysis[] {
    return analyses
      .sort((a, b) => {
        if (b.safetyScore !== a.safetyScore) {
          return b.safetyScore - a.safetyScore;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, count);
  }
  
  /**
   * Filter by safety threshold
   */
  filterBySafety(analyses: PropAnalysis[], minSafety: number = 80): PropAnalysis[] {
    return analyses.filter(a => a.safetyScore >= minSafety);
  }
  
  // ============ CORE METRIC CALCULATIONS ============
  
  /**
   * Calculate consistency score (games hitting within ±1 of line) / Total Games
   */
  private calculateConsistency(propData: PlayerPropData): number {
    const { lastTenGames, line } = propData;
    if (!lastTenGames || lastTenGames.length === 0) return 0;
    
    const withinRange = lastTenGames.filter(game => 
      Math.abs(game - line) <= 1
    ).length;
    
    return withinRange / lastTenGames.length;
  }
  
  /**
   * Calculate variance (standard deviation) - lower is safer
   */
  private calculateVariance(propData: PlayerPropData): number {
    const { lastTenGames } = propData;
    if (!lastTenGames || lastTenGames.length < 2) return 0;
    
    try {
      return standardDeviation(lastTenGames);
    } catch (error) {
      console.warn('Error calculating variance:', error);
      return 0;
    }
  }
  
  /**
   * Calculate trend (Recent 5 avg - Season avg) / Season avg
   */
  private calculateTrend(propData: PlayerPropData): 'increasing' | 'decreasing' | 'stable' {
    const recentAvg = this.calculateRecentAverage(propData);
    const { seasonAverage } = propData;
    
    if (!seasonAverage || seasonAverage === 0) return 'stable';
    
    const trendScore = (recentAvg - seasonAverage) / seasonAverage;
    
    if (trendScore > 0.1) return 'increasing';
    if (trendScore < -0.1) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Calculate recent average (last 5 games)
   */
  private calculateRecentAverage(propData: PlayerPropData): number {
    const { lastTenGames } = propData;
    if (!lastTenGames || lastTenGames.length === 0) return 0;
    
    const recentGames = lastTenGames.slice(-5);
    return mean(recentGames);
  }
  
  /**
   * Calculate hit rate (% of times clearing line)
   */
  private calculateHitRate(propData: PlayerPropData): number {
    const { lastTenGames, line } = propData;
    if (!lastTenGames || lastTenGames.length === 0) return 0;
    
    const hits = lastTenGames.filter(game => game > line).length;
    return hits / lastTenGames.length;
  }
  
  /**
   * Calculate floor games (% games within 1 unit of line)
   */
  private calculateFloorGames(propData: PlayerPropData): number {
    return this.calculateConsistency(propData); // Same calculation
  }
  
  /**
   * Calculate safety score: (Consistency * 0.4) + ((1/Variance) * 0.3) + (HitRate * 0.3)
   */
  private calculateSafetyScore(consistency: number, variance: number, hitRate: number): number {
    // Normalize variance inverse (lower variance = higher safety)
    const varianceScore = variance > 0 ? Math.min(1, 5 / variance) : 0.5;
    
    const rawScore = (consistency * 0.4) + (varianceScore * 0.3) + (Math.abs(hitRate - 0.5) * 0.6);
    
    return Math.round(Math.min(100, rawScore * 100));
  }
  
  /**
   * Determine recommendation based on analysis
   */
  private determineRecommendation(
    propData: PlayerPropData, 
    recentAvg: number, 
    safetyScore: number
  ): 'HIGHER' | 'LOWER' | 'AVOID' {
    const { line, lastTenGames } = propData;
    
    // Avoid if safety score is too low
    if (safetyScore < 60) return 'AVOID';
    
    // Avoid if not enough data
    if (!lastTenGames || lastTenGames.length < 5) return 'AVOID';
    
    const difference = recentAvg - line;
    
    // Strong signals
    if (difference > 1.5) return 'HIGHER';
    if (difference < -1.5) return 'LOWER';
    
    // Use hit rate for borderline cases
    const hitRate = this.calculateHitRate(propData);
    if (hitRate > 0.7) return 'HIGHER';
    if (hitRate < 0.3) return 'LOWER';
    
    // Check trend for tie-breaker
    const trend = this.calculateTrend(propData);
    if (difference > 0 && trend === 'increasing') return 'HIGHER';
    if (difference < 0 && trend === 'decreasing') return 'LOWER';
    
    return 'AVOID';
  }
  
  /**
   * Calculate confidence level (0-100)
   */
  private calculateConfidence(
    consistency: number, 
    variance: number, 
    hitRate: number, 
    safetyScore: number
  ): number {
    const consistencyWeight = consistency * 30;
    const varianceWeight = Math.max(0, (5 - variance) * 5);
    const hitRateWeight = Math.abs(hitRate - 0.5) * 40;
    const safetyWeight = safetyScore * 0.3;
    
    const rawConfidence = consistencyWeight + varianceWeight + hitRateWeight + safetyWeight;
    
    return Math.round(Math.min(95, rawConfidence));
  }
  
  /**
   * Analyze contextual factors
   */
  private analyzeContext(propData: PlayerPropData) {
    const { isHome, homeAverage, awayAverage, seasonAverage, usageRate, injuryStatus, restDays } = propData;
    
    // Matchup rating based on home/away performance
    let matchupRating: 'favorable' | 'neutral' | 'unfavorable' = 'neutral';
    if (homeAverage && awayAverage) {
      const currentAvg = isHome ? homeAverage : awayAverage;
      const diff = currentAvg - seasonAverage;
      if (diff > 1) matchupRating = 'favorable';
      if (diff < -1) matchupRating = 'unfavorable';
    }
    
    // Pace impact
    const paceImpact = this.calculatePaceImpact(propData);
    
    // Minutes trend
    const minutesTrend: 'stable' | 'increasing' | 'decreasing' = 'stable';
    
    return {
      matchupRating,
      paceImpact,
      usageRate: usageRate || 0,
      minutesTrend,
      injuryStatus: injuryStatus || 'healthy',
      restDays
    };
  }
  
  /**
   * Calculate pace impact
   */
  private calculatePaceImpact(propData: PlayerPropData): string {
    // Simplified pace calculation
    // In production, this would use actual team pace data
    return '+0.0';
  }
  
  /**
   * Assess risk level
   */
  private assessRisk(
    propData: PlayerPropData, 
    consistency: number, 
    variance: number, 
    hitRate: number
  ) {
    const factors: string[] = [];
    const warnings: string[] = [];
    
    // Consistency factors
    if (consistency > 0.75) {
      factors.push(`High consistency (${Math.round(consistency * 100)}%)`);
    } else if (consistency < 0.4) {
      warnings.push(`Low consistency (${Math.round(consistency * 100)}%)`);
    }
    
    // Variance factors
    if (variance < 1.5) {
      factors.push(`Low variance (σ=${variance.toFixed(1)})`);
    } else if (variance > 3.5) {
      warnings.push(`High variance (σ=${variance.toFixed(1)})`);
    }
    
    // Hit rate factors
    if (hitRate > 0.7 || hitRate < 0.3) {
      factors.push(`Strong directional signal (${Math.round(hitRate * 100)}% hit rate)`);
    }
    
    // Injury warnings
    if (propData.injuryStatus !== 'healthy') {
      warnings.push(`Injury concern: ${propData.injuryStatus}`);
    }
    
    // Data quantity warning
    if (propData.lastTenGames.length < 5) {
      warnings.push('Limited recent data');
    }
    
    // Determine overall risk level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'AVOID' = 'MEDIUM';
    
    if (warnings.length === 0 && factors.length >= 2) {
      level = 'LOW';
    } else if (warnings.length >= 2) {
      level = 'HIGH';
    } else if (warnings.length >= 3 || propData.injuryStatus === 'out') {
      level = 'AVOID';
    }
    
    return { level, factors, warnings };
  }
  
  /**
   * Analyze historical performance
   */
  private analyzeHistory(propData: PlayerPropData) {
    const { lastTenGames, line, homeAverage, awayAverage, vsOpponentHistory } = propData;
    
    const lastFive = lastTenGames.slice(-5);
    
    // VS Opponent
    let vsOpponent = 'No data';
    if (vsOpponentHistory && vsOpponentHistory.length > 0) {
      const hitsVsOpponent = vsOpponentHistory.filter(g => g > line).length;
      vsOpponent = `${hitsVsOpponent}/${vsOpponentHistory.length} games over line`;
    }
    
    // Home vs Away
    const homeVsAway = {
      home: homeAverage || propData.seasonAverage,
      away: awayAverage || propData.seasonAverage
    };
    
    // With/Without key players (simplified)
    const withWithout = `${propData.seasonAverage.toFixed(1)} avg overall`;
    
    return {
      vsOpponent,
      lastFiveGames: lastFive,
      homeVsAway,
      withWithout
    };
  }
}

// Utility function for simple statistics
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// Export singleton instance
export const propAnalysisEngine = new PropAnalysisEngine();
