/**
 * Smart Player Insights Service - Safe Picks Engine
 * Transforms betting-focused props into educational performance analytics
 * 
 * 🧠 Core Concept: Data-driven player performance intelligence
 * 🔒 Safe Picks - Consistent performers, high confidence, low volatility
 * ⚡ Hot Picks - High upside, trending players with momentum
 * ⚠️ Risky Picks - Volatile stats with potential big returns (educational)
 */

export interface PlayerInsight {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  team: string;
  opponent: string;
  position: string;
  
  // Core Analytics
  safePickScore: number; // 0-100 calculated score
  category: 'safe' | 'hot' | 'risky';
  
  // Performance Metrics
  metric: string; // e.g., "Points", "Rushing Yards", "Assists"
  seasonAvg: number;
  last5Avg: number;
  last10Avg: number;
  projectedValue: number;
  
  // Intelligence Factors
  consistency: number; // 0-100 (variance-based)
  formTrend: number; // 0-100 (recent performance trend)
  opponentWeakness: number; // 0-100 (matchup advantage)
  
  // AI Insights
  insight: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  opportunityFactors: string[];
  
  // Metadata
  isActive: boolean;
  lastUpdated: string;
  gameTime: string;
}

export interface PlayerPerformanceData {
  playerId: string;
  games: Array<{
    date: string;
    opponent: string;
    stats: Record<string, number>; // flexible stats structure
  }>;
  seasonStats: Record<string, number>;
  opponentStats?: Record<string, number>; // how opponent performs vs this metric
}

class SmartPlayerInsightsService {
  private performanceCache: Map<string, PlayerPerformanceData> = new Map();
  private insightsCache: Map<string, PlayerInsight[]> = new Map();
  
  /**
   * Calculate Safe Pick Score using weighted formula
   * Formula: safePickScore = (consistency * 0.5) + (formTrend * 0.3) + (opponentWeakness * 0.2)
   */
  private calculateSafePickScore(
    consistency: number, 
    formTrend: number, 
    opponentWeakness: number
  ): number {
    const score = (consistency * 0.5) + (formTrend * 0.3) + (opponentWeakness * 0.2);
    return Math.round(Math.max(0, Math.min(100, score)));
  }
  
  /**
   * Calculate consistency score based on performance variance
   * Lower variance = higher consistency = safer pick
   */
  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 50; // Default for insufficient data
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to consistency score (0-100)
    // Lower standard deviation relative to mean = higher consistency
    const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) : 1;
    const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 100));
    
    return Math.round(consistencyScore);
  }
  
  /**
   * Calculate form trend based on recent vs season performance
   * Recent improvement = higher trend score
   */
  private calculateFormTrend(seasonAvg: number, last5Avg: number, last10Avg: number): number {
    if (seasonAvg <= 0) return 50; // Default for no data
    
    // Weight recent performance more heavily
    const recentPerformance = (last5Avg * 0.6) + (last10Avg * 0.4);
    const trendRatio = recentPerformance / seasonAvg;
    
    // Convert to 0-100 scale
    let trendScore = 50; // Baseline
    if (trendRatio > 1.1) {
      trendScore = Math.min(100, 50 + ((trendRatio - 1) * 50));
    } else if (trendRatio < 0.9) {
      trendScore = Math.max(0, 50 - ((1 - trendRatio) * 50));
    }
    
    return Math.round(trendScore);
  }
  
  /**
   * Calculate opponent weakness score for matchup advantage
   * Higher opponent weakness = better opportunity
   */
  private calculateOpponentWeakness(
    playerMetric: string, 
    opponentDefensiveRank: number,
    leagueAverage: number,
    opponentAvgAllowed: number
  ): number {
    // Default scoring if no opponent data
    if (!opponentAvgAllowed || opponentAvgAllowed <= 0) {
      // Use defensive rank if available (lower rank = better defense = lower opportunity)
      if (opponentDefensiveRank) {
        return Math.max(0, 100 - (opponentDefensiveRank * 3)); // Rough conversion
      }
      return 50; // Default neutral
    }
    
    // Calculate how much more the opponent allows vs league average
    const allowanceRatio = opponentAvgAllowed / leagueAverage;
    
    let weaknessScore = 50; // Baseline
    if (allowanceRatio > 1.1) {
      weaknessScore = Math.min(100, 50 + ((allowanceRatio - 1) * 50));
    } else if (allowanceRatio < 0.9) {
      weaknessScore = Math.max(0, 50 - ((1 - allowanceRatio) * 50));
    }
    
    return Math.round(weaknessScore);
  }
  
  /**
   * Generate AI insights based on performance data and analytics
   */
  private generateAIInsight(insight: PlayerInsight): string {
    const { safePickScore, consistency, formTrend, opponentWeakness, category } = insight;
    
    const insights: string[] = [];
    
    // Category-based insights
    if (category === 'safe') {
      insights.push(`🔒 Reliable performer with ${consistency}% consistency rating.`);
    } else if (category === 'hot') {
      insights.push(`⚡ Trending upward with strong recent form (${formTrend}% trend score).`);
    } else {
      insights.push(`⚠️ High-variance player with potential for big performances.`);
    }
    
    // Consistency insights
    if (consistency >= 80) {
      insights.push(`Highly consistent performer - rarely disappoints.`);
    } else if (consistency >= 60) {
      insights.push(`Generally reliable with occasional variance.`);
    } else if (consistency < 40) {
      insights.push(`Volatile performer - high risk, high reward potential.`);
    }
    
    // Form insights
    if (formTrend >= 75) {
      insights.push(`On fire recently - significantly outperforming season averages.`);
    } else if (formTrend >= 55) {
      insights.push(`Good recent form - performing above expectations.`);
    } else if (formTrend < 40) {
      insights.push(`Recent struggles - performing below season standards.`);
    }
    
    // Matchup insights
    if (opponentWeakness >= 70) {
      insights.push(`Excellent matchup - opponent struggles against this metric.`);
    } else if (opponentWeakness >= 55) {
      insights.push(`Favorable matchup conditions.`);
    } else if (opponentWeakness < 40) {
      insights.push(`Tough matchup - opponent has strong defense against this stat.`);
    }
    
    return insights.slice(0, 2).join(' '); // Return top 2 insights
  }
  
  /**
   * Determine pick category based on Safe Pick Score and other factors
   */
  private determineCategory(safePickScore: number, consistency: number, formTrend: number): 'safe' | 'hot' | 'risky' {
    // Safe Picks: High consistency, decent score
    if (consistency >= 70 && safePickScore >= 65) {
      return 'safe';
    }
    
    // Hot Picks: Good trend, good score, but maybe lower consistency
    if (formTrend >= 70 && safePickScore >= 60) {
      return 'hot';
    }
    
    // Everything else is risky (including high upside but volatile players)
    return 'risky';
  }
  
  /**
   * Generate mock performance data for a player
   * In production, this would fetch real data from sports APIs
   */
  private generateMockPlayerData(playerId: string, playerName: string, metric: string): PlayerPerformanceData {
    const games: Array<{ date: string; opponent: string; stats: Record<string, number> }> = [];
    
    // Generate last 15 games with realistic variance
    const baseValue = this.getBaseValueForMetric(metric);
    const variance = baseValue * 0.3; // 30% variance
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString();
      const randomVariance = (Math.random() - 0.5) * 2 * variance;
      const value = Math.max(0, baseValue + randomVariance);
      
      games.push({
        date,
        opponent: this.getRandomOpponent(),
        stats: { [metric.toLowerCase().replace(' ', '_')]: Math.round(value * 10) / 10 }
      });
    }
    
    // Calculate season stats (average of all games)
    const seasonStats: Record<string, number> = {};
    const metricKey = metric.toLowerCase().replace(' ', '_');
    const allValues = games.map(g => g.stats[metricKey]).filter(v => v !== undefined);
    seasonStats[metricKey] = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    
    return { playerId, games, seasonStats };
  }
  
  private getBaseValueForMetric(metric: string): number {
    const baselines: Record<string, number> = {
      'Points': 18.5,
      'Rebounds': 8.2,
      'Assists': 5.8,
      'Rushing Yards': 85.0,
      'Passing Yards': 245.0,
      'Receiving Yards': 65.0,
      'Touchdowns': 0.8,
      'Field Goals': 1.2,
      'Steals': 1.1,
      'Blocks': 0.9
    };
    return baselines[metric] || 10.0;
  }
  
  private getRandomOpponent(): string {
    const opponents = ['BOS', 'MIA', 'PHI', 'TOR', 'NYK', 'BRK', 'ATL', 'CHA', 'ORL', 'WAS',
                     'MIL', 'CLE', 'IND', 'CHI', 'DET', 'DEN', 'MIN', 'OKC', 'POR', 'UTA',
                     'PHX', 'SAC', 'GSW', 'LAC', 'LAL', 'SAS', 'DAL', 'HOU', 'MEM', 'NOP'];
    return opponents[Math.floor(Math.random() * opponents.length)];
  }
  
  /**
   * Get player insights for a specific sport and filters
   * FIXED: Now returns empty array instead of fake data until real data integration is complete
   */
  async getPlayerInsights(
    sport: string, 
    metric?: string, 
    category?: 'safe' | 'hot' | 'risky'
  ): Promise<PlayerInsight[]> {
    console.log(`⚠️ REAL DATA MODE: Player insights temporarily disabled until real API integration`);
    console.log(`🔍 Request for ${sport} ${metric || 'all metrics'} ${category || 'all categories'}`);
    
    // Return empty array instead of fake/mock data
    // This prevents showing incorrect player props and statistics
    return [];
  }
  
  /**
   * Generate insights for a specific sport
   */
  private async generateInsightsForSport(sport: string, specificMetric?: string): Promise<PlayerInsight[]> {
    const insights: PlayerInsight[] = [];
    
    // Get metrics for sport
    const metrics = this.getMetricsForSport(sport);
    const targetMetrics = specificMetric ? [specificMetric] : metrics;
    
    // Get sample players for sport
    const players = this.getSamplePlayersForSport(sport);
    
    for (const player of players) {
      for (const metric of targetMetrics) {
        // Generate or get cached performance data
        const performanceKey = `${player.id}-${metric}`;
        let performanceData = this.performanceCache.get(performanceKey);
        
        if (!performanceData) {
          performanceData = this.generateMockPlayerData(player.id, player.name, metric);
          this.performanceCache.set(performanceKey, performanceData);
        }
        
        // Calculate analytics
        const metricKey = metric.toLowerCase().replace(' ', '_');
        const seasonAvg = performanceData.seasonStats[metricKey] || 0;
        
        const recentGames = performanceData.games.slice(0, 10);
        const last5Games = performanceData.games.slice(0, 5);
        
        const last10Values = recentGames.map(g => g.stats[metricKey]).filter(v => v !== undefined);
        const last5Values = last5Games.map(g => g.stats[metricKey]).filter(v => v !== undefined);
        
        const last10Avg = last10Values.length > 0 
          ? last10Values.reduce((sum, val) => sum + val, 0) / last10Values.length 
          : seasonAvg;
        const last5Avg = last5Values.length > 0 
          ? last5Values.reduce((sum, val) => sum + val, 0) / last5Values.length 
          : last10Avg;
        
        // Calculate core metrics
        const consistency = this.calculateConsistency(last10Values);
        const formTrend = this.calculateFormTrend(seasonAvg, last5Avg, last10Avg);
        const opponentWeakness = this.calculateOpponentWeakness(metric, 15, seasonAvg * 1.1, seasonAvg * 1.15);
        
        const safePickScore = this.calculateSafePickScore(consistency, formTrend, opponentWeakness);
        const category = this.determineCategory(safePickScore, consistency, formTrend);
        
        // Create insight
        const insight: PlayerInsight = {
          id: `${player.id}-${metric.toLowerCase().replace(' ', '_')}`,
          gameId: `game_${Math.random().toString(36).substr(2, 9)}`,
          playerId: player.id,
          playerName: player.name,
          team: player.team,
          opponent: this.getRandomOpponent(),
          position: player.position,
          
          safePickScore,
          category,
          
          metric,
          seasonAvg: Math.round(seasonAvg * 10) / 10,
          last5Avg: Math.round(last5Avg * 10) / 10,
          last10Avg: Math.round(last10Avg * 10) / 10,
          projectedValue: Math.round((last5Avg * 0.4 + last10Avg * 0.3 + seasonAvg * 0.3) * 10) / 10,
          
          consistency,
          formTrend,
          opponentWeakness,
          
          insight: '',
          confidenceLevel: safePickScore >= 75 ? 'high' : safePickScore >= 55 ? 'medium' : 'low',
          riskFactors: this.generateRiskFactors(consistency, formTrend, opponentWeakness),
          opportunityFactors: this.generateOpportunityFactors(consistency, formTrend, opponentWeakness),
          
          isActive: true,
          lastUpdated: new Date().toISOString(),
          gameTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Generate AI insight after creating the object
        insight.insight = this.generateAIInsight(insight);
        
        insights.push(insight);
      }
    }
    
    // Sort by Safe Pick Score (highest first)
    return insights.sort((a, b) => b.safePickScore - a.safePickScore);
  }
  
  private generateRiskFactors(consistency: number, formTrend: number, opponentWeakness: number): string[] {
    const factors: string[] = [];
    
    if (consistency < 50) factors.push('High performance variance');
    if (formTrend < 40) factors.push('Recent poor form');
    if (opponentWeakness < 40) factors.push('Strong opponent defense');
    if (consistency < 30) factors.push('Extremely volatile performer');
    
    return factors;
  }
  
  private generateOpportunityFactors(consistency: number, formTrend: number, opponentWeakness: number): string[] {
    const factors: string[] = [];
    
    if (consistency >= 70) factors.push('Highly reliable performer');
    if (formTrend >= 70) factors.push('Strong recent momentum');
    if (opponentWeakness >= 70) factors.push('Favorable matchup');
    if (formTrend >= 80 && opponentWeakness >= 60) factors.push('Perfect storm opportunity');
    
    return factors;
  }
  
  private getMetricsForSport(sport: string): string[] {
    const sportMetrics: Record<string, string[]> = {
      'NBA': ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks'],
      'NFL': ['Passing Yards', 'Rushing Yards', 'Receiving Yards', 'Touchdowns'],
      'CFB': ['Passing Yards', 'Rushing Yards', 'Receiving Yards', 'Touchdowns'],
      'MLB': ['Hits', 'Home Runs', 'RBIs', 'Strikeouts'],
      'NHL': ['Goals', 'Assists', 'Points', 'Shots']
    };
    
    return sportMetrics[sport] || ['Points'];
  }
  
  private getSamplePlayersForSport(sport: string): Array<{ id: string; name: string; team: string; position: string }> {
    if (sport === 'NBA') {
      return [
        { id: 'lal_lebron', name: 'LeBron James', team: 'LAL', position: 'SF' },
        { id: 'lal_davis', name: 'Anthony Davis', team: 'LAL', position: 'PF' },
        { id: 'bos_tatum', name: 'Jayson Tatum', team: 'BOS', position: 'SF' },
        { id: 'gsw_curry', name: 'Stephen Curry', team: 'GSW', position: 'PG' },
        { id: 'mia_butler', name: 'Jimmy Butler', team: 'MIA', position: 'SF' },
        { id: 'bos_brown', name: 'Jaylen Brown', team: 'BOS', position: 'SG' },
        { id: 'mia_adebayo', name: 'Bam Adebayo', team: 'MIA', position: 'C' },
        { id: 'gsw_thompson', name: 'Klay Thompson', team: 'GSW', position: 'SG' }
      ];
    }
    
    if (sport === 'NFL') {
      return [
        { id: 'kc_mahomes', name: 'Patrick Mahomes', team: 'KC', position: 'QB' },
        { id: 'buf_allen', name: 'Josh Allen', team: 'BUF', position: 'QB' },
        { id: 'sf_mccaffrey', name: 'Christian McCaffrey', team: 'SF', position: 'RB' },
        { id: 'kc_kelce', name: 'Travis Kelce', team: 'KC', position: 'TE' },
        { id: 'buf_diggs', name: 'Stefon Diggs', team: 'BUF', position: 'WR' },
        { id: 'sf_purdy', name: 'Brock Purdy', team: 'SF', position: 'QB' },
        { id: 'dal_prescott', name: 'Dak Prescott', team: 'DAL', position: 'QB' },
        { id: 'dal_lamb', name: 'CeeDee Lamb', team: 'DAL', position: 'WR' }
      ];
    }
    
    // Default players for other sports
    return [
      { id: 'player1', name: 'Star Player', team: 'TEA', position: 'POS' },
      { id: 'player2', name: 'Rising Star', team: 'TEB', position: 'POS' },
      { id: 'player3', name: 'Veteran Pro', team: 'TEC', position: 'POS' }
    ];
  }
  
  /**
   * Clear caches (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.performanceCache.clear();
    this.insightsCache.clear();
    console.log('🧹 Smart Player Insights cache cleared');
  }
  
  /**
   * Get insights statistics for dashboard
   */
  getInsightsStats(insights: PlayerInsight[]): {
    totalPlayers: number;
    safeCount: number;
    hotCount: number;
    riskyCount: number;
    avgSafePickScore: number;
    highConfidenceCount: number;
  } {
    return {
      totalPlayers: insights.length,
      safeCount: insights.filter(i => i.category === 'safe').length,
      hotCount: insights.filter(i => i.category === 'hot').length,
      riskyCount: insights.filter(i => i.category === 'risky').length,
      avgSafePickScore: insights.length > 0 
        ? Math.round(insights.reduce((sum, i) => sum + i.safePickScore, 0) / insights.length)
        : 0,
      highConfidenceCount: insights.filter(i => i.confidenceLevel === 'high').length
    };
  }
}

// Export singleton instance
export const smartPlayerInsightsService = new SmartPlayerInsightsService();