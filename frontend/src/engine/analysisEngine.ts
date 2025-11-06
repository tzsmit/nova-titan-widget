/**
 * Advanced Prop Analysis Engine
 * Implements all core analytics algorithms for player prop betting
 */

export interface PlayerProp {
  player: string;
  team: string;
  opponent: string;
  prop: string; // 'rebounds', 'points', 'assists', etc.
  line: number;
  historicalData: number[];
  contextData: ContextData;
  odds?: {
    over: number;
    under: number;
  };
}

export interface ContextData {
  opponent: string;
  isHome: boolean;
  pace?: number;
  usageRate?: number;
  recentMinutes?: number[];
  injuryStatus?: string;
  lastGameDate?: string;
  lineup?: any[];
}

export interface PropAnalysis {
  // Player & Prop Info
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number;
  
  // AI Recommendation
  recommendation: 'HIGHER' | 'LOWER' | 'AVOID';
  confidence: number; // 0-100 scale
  safetyScore: number; // 0-100 scale (higher = safer)
  
  // Core Metrics
  metrics: {
    consistency: number;
    variance: number;
    hitRate: number;
    floorGames: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recentAvg: number;
    seasonAvg: number;
  };
  
  // Contextual Factors
  context: {
    matchupRating: 'favorable' | 'neutral' | 'unfavorable';
    paceImpact?: string;
    usageRate?: number;
    minutesTrend?: string;
    injuryStatus: string;
    restDays?: number;
    location: 'home' | 'away';
    homeAwayDiff?: number;
  };
  
  // Risk Assessment
  risk: {
    level: 'ELITE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AVOID';
    factors: string[];
    warnings: string[];
  };
  
  // Historical Performance
  history: {
    lastTenGames: number[];
    vsOpponent?: number[];
    homeVsAway: {
      home: number;
      away: number;
    };
  };
  
  // For UI Display
  display: {
    playerImage?: string;
    statIcon: string;
    sparklineData: number[];
    quickStats: Array<{
      label: string;
      value: string;
    }>;
  };
}

/**
 * Core Analytics Engine
 */
export class AnalysisEngine {
  /**
   * Analyze a single player prop
   */
  analyzeProp(prop: PlayerProp): PropAnalysis {
    const { historicalData, line, contextData } = prop;
    
    // Calculate core metrics
    const consistency = this.calculateConsistency(historicalData, line);
    const variance = this.calculateVariance(historicalData);
    const hitRate = this.calculateHitRate(historicalData, line);
    const floorGames = this.calculateFloorGames(historicalData, line);
    const trend = this.calculateTrend(historicalData);
    const recentAvg = this.average(historicalData.slice(-5));
    const seasonAvg = this.average(historicalData);
    
    // Calculate safety score
    const safetyScore = this.calculateSafetyScore({
      consistency,
      variance,
      hitRate,
      recentAvg,
      seasonAvg
    });
    
    // Determine recommendation
    const recommendation = this.getRecommendation(recentAvg, seasonAvg, line, hitRate);
    const confidence = this.calculateConfidence(safetyScore, hitRate, consistency);
    
    // Analyze matchup
    const matchupRating = this.analyzeMatchup(seasonAvg, contextData.opponent);
    
    // Calculate risk
    const riskLevel = this.calculateRiskLevel(safetyScore);
    const riskFactors = this.getRiskFactors({ consistency, variance, hitRate, trend }, contextData);
    const warnings = this.getWarnings({ consistency, variance, hitRate }, contextData);
    
    // Build analysis object
    const analysis: PropAnalysis = {
      player: prop.player,
      team: prop.team,
      opponent: prop.opponent,
      prop: prop.prop,
      line: prop.line,
      
      recommendation,
      confidence,
      safetyScore,
      
      metrics: {
        consistency,
        variance,
        hitRate,
        floorGames,
        trend,
        recentAvg,
        seasonAvg
      },
      
      context: {
        matchupRating,
        usageRate: contextData.usageRate,
        injuryStatus: contextData.injuryStatus || 'healthy',
        restDays: this.calculateRestDays(contextData.lastGameDate),
        location: contextData.isHome ? 'home' : 'away',
        minutesTrend: this.analyzeMinutesTrend(contextData.recentMinutes)
      },
      
      risk: {
        level: riskLevel,
        factors: riskFactors,
        warnings
      },
      
      history: {
        lastTenGames: historicalData.slice(-10),
        homeVsAway: {
          home: seasonAvg, // Simplified - would need actual home/away split
          away: seasonAvg * 0.95 // Placeholder
        }
      },
      
      display: {
        statIcon: this.getStatIcon(prop.prop),
        sparklineData: historicalData.slice(-10),
        quickStats: [
          { label: 'Hit Rate', value: `${(hitRate * 100).toFixed(0)}%` },
          { label: 'Avg Last 5', value: recentAvg.toFixed(1) },
          { label: 'Consistency', value: `${(consistency * 100).toFixed(0)}%` }
        ]
      }
    };
    
    return analysis;
  }
  
  /**
   * 1. Consistency Score (0-1 scale)
   * Measures % of games within ±1 of line
   */
  calculateConsistency(games: number[], line: number): number {
    if (games.length === 0) return 0;
    const withinRange = games.filter(g => Math.abs(g - line) <= 1).length;
    return withinRange / games.length;
  }
  
  /**
   * 2. Variance Score (standard deviation)
   * Lower variance = more predictable
   */
  calculateVariance(games: number[]): number {
    if (games.length === 0) return 0;
    const avg = this.average(games);
    const squaredDiffs = games.map(g => Math.pow(g - avg, 2));
    return Math.sqrt(this.average(squaredDiffs));
  }
  
  /**
   * 3. Hit Rate (% clearing line)
   */
  calculateHitRate(games: number[], line: number, direction: 'higher' | 'lower' = 'higher'): number {
    if (games.length === 0) return 0;
    const hits = direction === 'higher' 
      ? games.filter(g => g > line).length
      : games.filter(g => g < line).length;
    return hits / games.length;
  }
  
  /**
   * 4. Floor Games (% within 1 unit of line)
   */
  calculateFloorGames(games: number[], line: number): number {
    if (games.length === 0) return 0;
    const floor = games.filter(g => Math.abs(g - line) <= 1).length;
    return floor / games.length;
  }
  
  /**
   * 5. Trend Score (recent vs season)
   */
  calculateTrend(games: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (games.length < 5) return 'stable';
    const recent = this.average(games.slice(-5));
    const season = this.average(games);
    const trendPct = ((recent - season) / season) * 100;
    
    if (trendPct > 5) return 'increasing';
    if (trendPct < -5) return 'decreasing';
    return 'stable';
  }
  
  /**
   * 6. Safety Score (weighted formula)
   * Combines consistency, hit rate, variance into 0-100 score
   */
  calculateSafetyScore(metrics: {
    consistency: number;
    variance: number;
    hitRate: number;
    recentAvg: number;
    seasonAvg: number;
  }): number {
    const weights = {
      consistency: 0.35,
      hitRate: 0.30,
      lowVariance: 0.25,
      recentForm: 0.10
    };
    
    // Normalize variance (lower is better)
    const varianceScore = Math.max(0, 1 - (metrics.variance / 5));
    
    // Recent form bonus
    const recentFormScore = metrics.recentAvg >= metrics.seasonAvg ? 1 : 0.7;
    
    const score = 
      (metrics.consistency * weights.consistency * 100) +
      (metrics.hitRate * weights.hitRate * 100) +
      (varianceScore * weights.lowVariance * 100) +
      (recentFormScore * weights.recentForm * 100);
      
    return Math.round(Math.min(100, Math.max(0, score)));
  }
  
  /**
   * 7. Matchup Rating
   */
  analyzeMatchup(seasonAvg: number, opponent: string): 'favorable' | 'neutral' | 'unfavorable' {
    // Placeholder - would need historical vs opponent data
    // For now, return neutral
    return 'neutral';
  }
  
  /**
   * 8. Risk Level Classification
   */
  calculateRiskLevel(safetyScore: number): 'ELITE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AVOID' {
    if (safetyScore >= 90) return 'ELITE';
    if (safetyScore >= 80) return 'LOW';
    if (safetyScore >= 70) return 'MEDIUM';
    if (safetyScore >= 60) return 'HIGH';
    return 'AVOID';
  }
  
  /**
   * Get recommendation based on analysis
   */
  private getRecommendation(
    recentAvg: number,
    seasonAvg: number,
    line: number,
    hitRate: number
  ): 'HIGHER' | 'LOWER' | 'AVOID' {
    const avg = (recentAvg + seasonAvg) / 2;
    
    // If hit rate is strong and average > line, recommend higher
    if (hitRate > 0.6 && avg > line) return 'HIGHER';
    
    // If hit rate is low and average < line, recommend lower
    if (hitRate < 0.4 && avg < line) return 'LOWER';
    
    // If too close to call, avoid
    if (Math.abs(avg - line) < 0.5) return 'AVOID';
    
    return avg > line ? 'HIGHER' : 'LOWER';
  }
  
  /**
   * Calculate confidence level
   */
  private calculateConfidence(safetyScore: number, hitRate: number, consistency: number): number {
    // Weighted combination
    const confidence = (safetyScore * 0.5) + (hitRate * 100 * 0.3) + (consistency * 100 * 0.2);
    return Math.round(Math.min(100, Math.max(0, confidence)));
  }
  
  /**
   * Get risk factors
   */
  private getRiskFactors(
    metrics: { consistency: number; variance: number; hitRate: number; trend: string },
    context: ContextData
  ): string[] {
    const factors: string[] = [];
    
    if (metrics.consistency > 0.8) {
      factors.push('High consistency in recent games');
    }
    
    if (metrics.variance < 2) {
      factors.push('Low variance indicates predictable performance');
    }
    
    if (metrics.hitRate > 0.7) {
      factors.push('Strong historical hit rate over this line');
    }
    
    if (metrics.trend === 'increasing') {
      factors.push('Recent performance trending upward');
    }
    
    if (context.injuryStatus === 'healthy') {
      factors.push('Player is healthy with no injury concerns');
    }
    
    return factors.length > 0 ? factors : ['Standard risk profile'];
  }
  
  /**
   * Get warnings
   */
  private getWarnings(
    metrics: { consistency: number; variance: number; hitRate: number },
    context: ContextData
  ): string[] {
    const warnings: string[] = [];
    
    if (metrics.variance > 4) {
      warnings.push('⚠️ High variance - unpredictable performance');
    }
    
    if (metrics.consistency < 0.5) {
      warnings.push('⚠️ Low consistency in hitting this line');
    }
    
    if (metrics.hitRate < 0.4) {
      warnings.push('⚠️ Poor historical hit rate');
    }
    
    if (context.injuryStatus && context.injuryStatus !== 'healthy') {
      warnings.push('🚨 Injury concern - proceed with caution');
    }
    
    return warnings;
  }
  
  /**
   * Utility: Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  /**
   * Calculate rest days
   */
  private calculateRestDays(lastGameDate?: string): number {
    if (!lastGameDate) return 0;
    
    const last = new Date(lastGameDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  /**
   * Analyze minutes trend
   */
  private analyzeMinutesTrend(recentMinutes?: number[]): string {
    if (!recentMinutes || recentMinutes.length < 3) return 'stable';
    
    const recent = this.average(recentMinutes.slice(-3));
    const earlier = this.average(recentMinutes.slice(0, -3));
    
    if (recent > earlier + 2) return 'increasing';
    if (recent < earlier - 2) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Get stat icon
   */
  private getStatIcon(stat: string): string {
    const icons: Record<string, string> = {
      points: '🏀',
      rebounds: '📦',
      assists: '🎯',
      steals: '🔒',
      blocks: '🛡️',
      threes: '🎯',
      'pass-yards': '🏈',
      'rush-yards': '🏃',
      'receptions': '🙌',
      'touchdowns': '🔥',
    };
    
    return icons[stat.toLowerCase()] || '⭐';
  }
}
