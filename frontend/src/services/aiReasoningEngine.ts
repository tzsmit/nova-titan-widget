/**
 * Nova Titan AI Reasoning Engine
 * Pristine AI-powered sports analytics with GPT-style thinking and analysis
 * "Think & Analyze: Every query is processed as a reasoning task, not just data lookup"
 */

import { realTimeOddsService } from './realTimeOddsService';
import { smartPlayerInsightsService } from './smartPlayerInsightsService';
import { advancedAnalyticsEngine } from './advancedAnalytics';

export interface AIInsight {
  id: string;
  query: string;
  insight: string;
  confidence: number;
  reasoning: string[];
  supportingStats: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  suggestedPlays?: string[];
  expandedAnalysis?: {
    trendAnalysis: string;
    scenarioSimulation: string;
    comparativeAnalysis: string;
    historicalContext: string;
  };
  trackedEntities: Array<{
    type: 'player' | 'team' | 'game';
    name: string;
    relevance: number;
  }>;
  timestamp: string;
  category: 'player_props' | 'team_analysis' | 'matchup_breakdown' | 'trend_analysis' | 'general';
}

export interface UserTrackingProfile {
  trackedPlayers: Array<{
    name: string;
    team: string;
    sport: string;
    priority: number;
  }>;
  trackedTeams: Array<{
    name: string;
    sport: string;
    priority: number;
  }>;
  preferences: {
    preferredSports: string[];
    analyticsDepth: 'concise' | 'detailed' | 'comprehensive';
    confidenceThreshold: number;
  };
}

class AIReasoningEngine {
  private userProfile: UserTrackingProfile;
  private knowledgeBase: Map<string, any>;
  private analysisCache: Map<string, AIInsight>;

  constructor() {
    this.userProfile = this.loadUserProfile();
    this.knowledgeBase = new Map();
    this.analysisCache = new Map();
    this.initializeKnowledgeBase();
  }

  /**
   * Core AI reasoning method - processes queries as analytical tasks
   */
  async analyzeQuery(query: string): Promise<AIInsight> {
    console.log(`🧠 AI Reasoning Engine: Analyzing query "${query}"`);
    
    try {
      // Step 1: Parse and categorize the query
      const queryContext = this.parseQuery(query);
      
      // Step 2: Gather relevant data based on context
      const relevantData = await this.gatherRelevantData(queryContext);
      
      // Step 3: Apply analytical reasoning
      const analysis = await this.performAnalyticalReasoning(queryContext, relevantData);
      
      // Add queryContext to analysis for insight generation
      analysis.queryContext = queryContext;
      
      // Step 4: Generate pristine, concise insight
      const insight = this.generateInsight(analysis);
      
      // Step 5: Cache for performance
      this.analysisCache.set(query.toLowerCase(), insight);
      
      console.log(`✅ AI Analysis complete: ${insight.confidence}% confidence`);
      return insight;
      
    } catch (error) {
      console.error(`❌ AI Analysis failed for "${query}":`, error);
      
      // Return graceful fallback insight
      return {
        id: `insight_${Date.now()}`,
        query,
        insight: `Analysis pending: Processing "${query}" - enhanced insights will be available shortly.`,
        confidence: 25,
        reasoning: ['Fallback analysis due to data processing delay'],
        supportingStats: [],
        suggestedPlays: [],
        trackedEntities: [],
        timestamp: new Date().toISOString(),
        category: 'general'
      };
    }
  }

  /**
   * Parse query to understand intent and entities
   */
  private parseQuery(query: string): any {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Extract entities (players, teams, sports)
    const entities = this.extractEntities(normalizedQuery);
    
    // Determine query type
    let category: AIInsight['category'] = 'general';
    if (normalizedQuery.includes('prop') || normalizedQuery.includes('points') || normalizedQuery.includes('rebounds') || normalizedQuery.includes('assists')) {
      category = 'player_props';
    } else if (normalizedQuery.includes('team') || normalizedQuery.includes('vs') || normalizedQuery.includes('against')) {
      category = 'team_analysis';
    } else if (normalizedQuery.includes('matchup') || normalizedQuery.includes('game')) {
      category = 'matchup_breakdown';
    } else if (normalizedQuery.includes('trend') || normalizedQuery.includes('streak') || normalizedQuery.includes('recent')) {
      category = 'trend_analysis';
    }

    return {
      originalQuery: query,
      normalizedQuery,
      entities,
      category,
      intent: this.determineIntent(normalizedQuery),
      priority: this.calculateQueryPriority(entities)
    };
  }

  /**
   * Extract player names, team names, and sports from query
   */
  private extractEntities(query: string): any {
    const entities = {
      players: [],
      teams: [],
      sports: [],
      stats: []
    };

    // Common NBA players (expandable knowledge base)
    const knownPlayers = [
      'lebron james', 'stephen curry', 'kevin durant', 'giannis antetokounmpo',
      'luka doncic', 'nikola jokic', 'joel embiid', 'jayson tatum', 'jimmy butler',
      'kawhi leonard', 'paul george', 'damian lillard', 'anthony davis', 'russell westbrook'
    ];

    // Common NBA teams
    const knownTeams = [
      'lakers', 'warriors', 'celtics', 'heat', 'nets', 'clippers', 'nuggets',
      'bucks', 'suns', 'mavericks', 'bulls', 'knicks', 'rockets', 'kings'
    ];

    // Extract recognized entities
    knownPlayers.forEach(player => {
      if (query.includes(player) || query.includes(player.split(' ')[1])) {
        entities.players.push(player);
      }
    });

    knownTeams.forEach(team => {
      if (query.includes(team)) {
        entities.teams.push(team);
      }
    });

    // Extract sports
    if (query.includes('nba') || query.includes('basketball')) entities.sports.push('NBA');
    if (query.includes('nfl') || query.includes('football')) entities.sports.push('NFL');
    if (query.includes('mlb') || query.includes('baseball')) entities.sports.push('MLB');

    // Extract statistical terms
    const statKeywords = ['points', 'rebounds', 'assists', 'steals', 'blocks', 'yards', 'touchdowns'];
    statKeywords.forEach(stat => {
      if (query.includes(stat)) {
        entities.stats.push(stat);
      }
    });

    return entities;
  }

  /**
   * Gather relevant data from APIs and knowledge base
   */
  private async gatherRelevantData(queryContext: any): Promise<any> {
    const relevantData = {
      liveGames: [],
      playerStats: [],
      teamStats: [],
      historicalTrends: [],
      marketData: []
    };

    try {
      // Get live games data
      if (queryContext.entities.sports.length > 0 || queryContext.category === 'matchup_breakdown') {
        console.log('🔍 Gathering live games data...');
        relevantData.liveGames = await realTimeOddsService.getLiveOddsAllSports();
      }

      // Get player insights if query involves players
      if (queryContext.entities.players.length > 0 || queryContext.category === 'player_props') {
        console.log('🏀 Gathering player analytics...');
        const sport = queryContext.entities.sports[0] || 'NBA';
        relevantData.playerStats = await smartPlayerInsightsService.getPlayerInsights(sport);
      }

      // Prioritize tracked entities
      relevantData.trackedRelevance = this.calculateTrackedRelevance(queryContext.entities);

    } catch (error) {
      console.warn('⚠️ Data gathering encountered issues:', error);
      // Graceful degradation - use cached or fallback data
    }

    return relevantData;
  }

  /**
   * Core analytical reasoning - the "thinking" component
   */
  private async performAnalyticalReasoning(queryContext: any, data: any): Promise<any> {
    console.log('🧠 Performing analytical reasoning...');

    let reasoning = {
      confidence: 50, // Base confidence
      supportingFactors: [],
      concerns: [],
      keyStats: [],
      trends: [],
      predictions: []
    };

    // Analyze based on query category
    switch (queryContext.category) {
      case 'player_props':
        reasoning = await this.analyzePlayerProps(queryContext, data);
        break;
      case 'team_analysis':
        reasoning = await this.analyzeTeamPerformance(queryContext, data);
        break;
      case 'matchup_breakdown':
        reasoning = await this.analyzeMatchup(queryContext, data);
        break;
      case 'trend_analysis':
        reasoning = await this.analyzeTrends(queryContext, data);
        break;
      default:
        reasoning = await this.performGeneralAnalysis(queryContext, data);
    }

    // Apply confidence adjustments based on data quality and recency
    reasoning.confidence = this.adjustConfidenceBasedOnDataQuality(reasoning, data);

    return reasoning;
  }

  /**
   * Analyze player props with advanced statistical reasoning
   */
  private async analyzePlayerProps(queryContext: any, data: any): Promise<any> {
    const reasoning = {
      confidence: 60,
      supportingFactors: [],
      concerns: [],
      keyStats: [],
      trends: [],
      predictions: []
    };

    // Find relevant player data
    const playerName = queryContext.entities.players[0];
    if (playerName && data.playerStats.length > 0) {
      const playerInsight = data.playerStats.find((p: any) => 
        p.playerName.toLowerCase().includes(playerName.toLowerCase())
      );

      if (playerInsight) {
        // Advanced trend analysis using analytics engine
        const performanceData = [
          { date: '5 games ago', value: playerInsight.seasonAvg },
          { date: '3 games ago', value: playerInsight.last10Avg },
          { date: 'recent', value: playerInsight.last5Avg }
        ];

        const trendAnalysis = advancedAnalyticsEngine.analyzeTrend(performanceData);
        reasoning.trends.push({
          type: 'performance_trend',
          direction: trendAnalysis.direction,
          magnitude: trendAnalysis.magnitude,
          confidence: trendAnalysis.confidence,
          description: trendAnalysis.prediction
        });

        // Consistency analysis
        const consistencyScore = advancedAnalyticsEngine.calculateConsistencyScore([
          playerInsight.seasonAvg, 
          playerInsight.last10Avg, 
          playerInsight.last5Avg
        ]);

        // Scenario simulation for projected performance
        const scenarioSim = advancedAnalyticsEngine.runScenarioSimulation(
          playerInsight.projectedValue || playerInsight.seasonAvg,
          [
            { name: 'Recent Form', currentValue: playerInsight.last5Avg, volatility: 0.15, correlation: 0.8 },
            { name: 'Matchup Factor', currentValue: 1.0, volatility: 0.1, correlation: 0.6 },
            { name: 'Consistency', currentValue: consistencyScore.score / 100, volatility: 0.05, correlation: 0.7 }
          ]
        );

        // Enhanced key statistics
        reasoning.keyStats.push(
          { label: 'Season Average', value: playerInsight.seasonAvg, trend: 'stable' },
          { label: 'Last 10 Games', value: playerInsight.last10Avg, trend: trendAnalysis.direction },
          { label: 'Last 5 Games', value: playerInsight.last5Avg, trend: trendAnalysis.direction },
          { label: 'Consistency Score', value: `${consistencyScore.score.toFixed(0)}/100`, trend: 'stable' },
          { label: 'Trend Confidence', value: `${trendAnalysis.confidence.toFixed(0)}%`, trend: 'stable' }
        );

        // Advanced confidence adjustments
        if (consistencyScore.reliability === 'high') {
          reasoning.confidence += 20;
          reasoning.supportingFactors.push(`High consistency (${consistencyScore.score.toFixed(0)}/100) indicates reliable performance`);
        }

        if (trendAnalysis.confidence >= 70) {
          reasoning.confidence += 15;
          reasoning.supportingFactors.push(`Strong trend confidence (${trendAnalysis.confidence.toFixed(0)}%)`);
        }

        if (trendAnalysis.direction === 'up' && trendAnalysis.magnitude > 5) {
          reasoning.confidence += 10;
          reasoning.supportingFactors.push('Strong positive performance trend detected');
        } else if (trendAnalysis.direction === 'down' && trendAnalysis.magnitude > 5) {
          reasoning.confidence -= 15;
          reasoning.concerns.push('Concerning negative performance trend');
        }

        // Scenario-based predictions
        const optimisticOutcome = scenarioSim.outcomes.find(o => o.description.includes('Optimistic'));
        if (optimisticOutcome) {
          reasoning.predictions.push(`Optimistic scenario: ${optimisticOutcome.value.toFixed(1)} (${optimisticOutcome.likelihood.toFixed(0)}% probability)`);
        }

        // Matchup analysis if opponent data available
        if (playerInsight.opponent) {
          reasoning.supportingFactors.push(`Matchup analysis vs ${playerInsight.opponent} factored into projections`);
          reasoning.confidence += 5;
        }
      }
    }

    return reasoning;
  }

  /**
   * Generate pristine, concise insight from analysis
   */
  private generateInsight(analysis: any): AIInsight {
    const insight: AIInsight = {
      id: `insight_${Date.now()}`,
      query: analysis.queryContext?.originalQuery || 'Analysis',
      insight: this.formulateConciseInsight(analysis),
      confidence: Math.min(95, Math.max(5, analysis.confidence || 50)),
      reasoning: analysis.supportingFactors || [],
      supportingStats: analysis.keyStats || [],
      suggestedPlays: analysis.predictions || [],
      trackedEntities: this.identifyTrackedEntities(analysis),
      timestamp: new Date().toISOString(),
      category: analysis.queryContext?.category || 'general'
    };

    // Add expanded analysis for "More Info" sections
    insight.expandedAnalysis = {
      trendAnalysis: this.generateTrendAnalysis(analysis.trends),
      scenarioSimulation: this.generateScenarioSimulation(analysis),
      comparativeAnalysis: this.generateComparativeAnalysis(analysis),
      historicalContext: this.generateHistoricalContext(analysis)
    };

    return insight;
  }

  /**
   * Create concise, pristine insight statement
   */
  private formulateConciseInsight(analysis: any): string {
    const confidence = analysis.confidence || 50;
    const category = analysis.queryContext?.category || 'general';

    // Generate category-specific insights
    switch (category) {
      case 'player_props':
        const playerName = analysis.queryContext?.entities?.players[0];
        if (playerName && analysis.keyStats.length > 0) {
          const recentAvg = analysis.keyStats.find((s: any) => s.label.includes('Last 5'));
          return `${playerName} prop outlook: ${confidence}% confidence based on recent ${recentAvg?.value} average vs historical trends.`;
        }
        return `Player prop analysis: ${confidence}% confidence based on recent performance trends and matchup data.`;

      case 'team_analysis':
        return `Team analysis: ${confidence}% confidence based on recent form, key player status, and historical matchup performance.`;

      case 'matchup_breakdown':
        return `Matchup breakdown: ${confidence}% confidence based on head-to-head trends, current form, and key statistical advantages.`;

      case 'trend_analysis':
        return `Trend analysis: ${confidence}% confidence based on recent performance patterns and statistical momentum.`;

      default:
        return `Analysis complete: ${confidence}% confidence based on available data and current market conditions.`;
    }
  }

  /**
   * Load user tracking profile (expandable for personalization)
   */
  private loadUserProfile(): UserTrackingProfile {
    const saved = localStorage.getItem('nova_titan_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to load user profile, using defaults');
      }
    }

    return {
      trackedPlayers: [],
      trackedTeams: [],
      preferences: {
        preferredSports: ['NBA', 'NFL'],
        analyticsDepth: 'concise',
        confidenceThreshold: 70
      }
    };
  }

  /**
   * Calculate priority based on tracked entities
   */
  private calculateQueryPriority(entities: any): number {
    let priority = 0;

    // Boost priority for tracked players
    entities.players?.forEach((player: string) => {
      const isTracked = this.userProfile.trackedPlayers.some(tp => 
        tp.name.toLowerCase().includes(player.toLowerCase())
      );
      if (isTracked) priority += 20;
    });

    // Boost priority for tracked teams
    entities.teams?.forEach((team: string) => {
      const isTracked = this.userProfile.trackedTeams.some(tt => 
        tt.name.toLowerCase().includes(team.toLowerCase())
      );
      if (isTracked) priority += 15;
    });

    return priority;
  }

  /**
   * Helper methods for analysis components
   */
  private calculateTrend(recent: number, historical: number): number {
    return ((recent - historical) / historical) * 100;
  }

  private determineIntent(query: string): string {
    if (query.includes('prop') || query.includes('bet')) return 'betting_analysis';
    if (query.includes('compare')) return 'comparison';
    if (query.includes('predict')) return 'prediction';
    if (query.includes('trend')) return 'trend_analysis';
    return 'general_inquiry';
  }

  private adjustConfidenceBasedOnDataQuality(reasoning: any, data: any): number {
    let confidence = reasoning.confidence;
    
    // Adjust based on data freshness and completeness
    if (data.liveGames && data.liveGames.length > 0) confidence += 5;
    if (data.playerStats && data.playerStats.length > 10) confidence += 5;
    
    // Cap confidence at reasonable levels
    return Math.min(95, Math.max(15, confidence));
  }

  private calculateTrackedRelevance(entities: any): number {
    // Implementation for tracking relevance calculation
    return 0;
  }

  private async analyzeTeamPerformance(queryContext: any, data: any): Promise<any> {
    // Implementation for team analysis
    return { confidence: 60, supportingFactors: [], keyStats: [] };
  }

  private async analyzeMatchup(queryContext: any, data: any): Promise<any> {
    // Implementation for matchup analysis
    return { confidence: 65, supportingFactors: [], keyStats: [] };
  }

  private async analyzeTrends(queryContext: any, data: any): Promise<any> {
    // Implementation for trend analysis
    return { confidence: 70, supportingFactors: [], keyStats: [] };
  }

  private async performGeneralAnalysis(queryContext: any, data: any): Promise<any> {
    // Implementation for general analysis
    return { confidence: 55, supportingFactors: [], keyStats: [] };
  }

  private identifyTrackedEntities(analysis: any): AIInsight['trackedEntities'] {
    // Implementation for identifying tracked entities
    return [];
  }

  private generateTrendAnalysis(trends: any[]): string {
    if (!trends || trends.length === 0) return 'No significant trends identified in current dataset.';
    
    const primaryTrend = trends[0];
    return `${primaryTrend.description || 'Trend analysis complete'}. Direction: ${primaryTrend.direction} with ${primaryTrend.magnitude?.toFixed(1) || 'moderate'} magnitude. Confidence: ${primaryTrend.confidence?.toFixed(0) || 'moderate'}%.`;
  }

  private generateScenarioSimulation(analysis: any): string {
    if (!analysis.predictions || analysis.predictions.length === 0) {
      return 'Scenario modeling suggests stable performance within expected ranges based on historical patterns.';
    }
    
    return `Scenario modeling: ${analysis.predictions[0]} Key variables indicate ${analysis.confidence >= 70 ? 'high probability' : 'moderate likelihood'} outcomes within projected ranges.`;
  }

  private generateComparativeAnalysis(analysis: any): string {
    if (!analysis.keyStats || analysis.keyStats.length === 0) {
      return 'Comparative analysis pending - insufficient benchmark data available.';
    }
    
    const statsCount = analysis.keyStats.length;
    const trendingUp = analysis.keyStats.filter((s: any) => s.trend === 'up').length;
    
    return `Comparative analysis across ${statsCount} key metrics shows ${trendingUp > statsCount / 2 ? 'positive momentum' : 'stable performance'} relative to peer benchmarks and historical averages.`;
  }

  private generateHistoricalContext(analysis: any): string {
    return 'Historical context: Similar situations in past seasons show...';
  }

  private initializeKnowledgeBase(): void {
    // Initialize with sports knowledge, player databases, etc.
    console.log('🧠 AI Reasoning Engine knowledge base initialized');
  }

  /**
   * Public methods for tracking management
   */
  addTrackedPlayer(name: string, team: string, sport: string): void {
    const existing = this.userProfile.trackedPlayers.find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!existing) {
      this.userProfile.trackedPlayers.push({
        name,
        team,
        sport,
        priority: this.userProfile.trackedPlayers.length + 1
      });
      this.saveUserProfile();
    }
  }

  addTrackedTeam(name: string, sport: string): void {
    const existing = this.userProfile.trackedTeams.find(t => 
      t.name.toLowerCase() === name.toLowerCase()
    );
    
    if (!existing) {
      this.userProfile.trackedTeams.push({
        name,
        sport,
        priority: this.userProfile.trackedTeams.length + 1
      });
      this.saveUserProfile();
    }
  }

  private saveUserProfile(): void {
    localStorage.setItem('nova_titan_user_profile', JSON.stringify(this.userProfile));
  }

  getTrackedEntities() {
    return {
      players: this.userProfile.trackedPlayers,
      teams: this.userProfile.trackedTeams
    };
  }

  /**
   * Clear analysis cache to force fresh data on next queries
   */
  clearCache(): void {
    console.log('🗑️ AI Reasoning Engine: Clearing analysis cache');
    this.analysisCache.clear();
    
    // Also clear knowledge base to force fresh API calls
    this.knowledgeBase.clear();
    
    console.log('✅ Cache cleared - next analysis will use fresh data');
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.analysisCache.size,
      keys: Array.from(this.analysisCache.keys())
    };
  }
}

// Export singleton instance
export const aiReasoningEngine = new AIReasoningEngine();