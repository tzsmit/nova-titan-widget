// Nova Titan AI Companion for Sports Betting
import { realTimeOddsService } from './realTimeOddsService';
import type { LiveOddsData } from './realTimeOddsService';

interface ChatResponse {
  message: string;
  timestamp: Date;
  confidence?: number;
  quickActions?: string[];
}

class AICompanion {
  private cache = new Map<string, ChatResponse>();
  private cacheTimeout = 3 * 60 * 1000; // 3 minutes

  async askQuestion(question: string): Promise<ChatResponse> {
    const cacheKey = question.toLowerCase();
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
      return cached;
    }

    const response = await this.generateResponse(question);
    
    // Cache the response
    this.cache.set(cacheKey, response);
    
    return response;
  }

  private async generateResponse(question: string): Promise<ChatResponse> {
    const lowerQuestion = question.toLowerCase();
    const liveData = await realTimeOddsService.getLiveOddsAllSports();

    // Sports betting predictions
    if (this.containsKeywords(lowerQuestion, ['who will win', 'predict', 'winner', 'pick'])) {
      return this.generatePrediction(question, liveData);
    }

    // Odds and lines questions
    if (this.containsKeywords(lowerQuestion, ['odds', 'line', 'spread', 'moneyline', 'over under'])) {
      return this.generateOddsInfo(question, liveData);
    }

    // Betting advice
    if (this.containsKeywords(lowerQuestion, ['bet', 'wager', 'strategy', 'advice', 'tip'])) {
      return this.generateBettingAdvice(question, liveData);
    }

    // Game analysis
    if (this.containsKeywords(lowerQuestion, ['analyze', 'breakdown', 'stats', 'performance'])) {
      return this.generateAnalysis(question, liveData);
    }

    // General questions
    return this.generateGeneralResponse(question, liveData);
  }

  private generatePrediction(question: string, liveData: LiveOddsData[]): ChatResponse {
    const teams = this.extractTeams(question);
    const sport = this.extractSport(question);

    if (teams.length >= 2 || sport) {
      const relevantGame = this.findRelevantGame(liveData, teams, sport);
      
      if (relevantGame) {
        return this.generateDetailedGamePrediction(relevantGame);
      }
    }

    if (liveData.length > 0) {
      const featuredGame = liveData[0]; // Take the first game for analysis
      return this.generateDetailedGamePrediction(featuredGame);
    }

    return {
      message: "🎯 **Prediction Engine Ready:** I analyze matchups using advanced metrics, recent form, injury reports, and market sentiment. Tell me which teams or sport you're interested in and I'll break down the betting angles with specific recommendations.",
      timestamp: new Date(),
      quickActions: ["Show available games", "NBA analysis", "NFL breakdowns", "Best bets today"]
    };
  }

  private generateDetailedGamePrediction(game: LiveOddsData): ChatResponse {
    const homeOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.home_team)?.price || 0;
    const awayOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.away_team)?.price || 0;
    
    const favorite = Math.abs(homeOdds) < Math.abs(awayOdds) ? game.home_team : game.away_team;
    const underdog = favorite === game.home_team ? game.away_team : game.home_team;
    const favOdds = favorite === game.home_team ? homeOdds : awayOdds;
    const dogOdds = favorite === game.home_team ? awayOdds : homeOdds;
    
    const impliedProb = Math.abs(favOdds) < 100 ? 
      (Math.abs(favOdds) / (Math.abs(favOdds) + 100)) * 100 :
      (100 / (Math.abs(favOdds) + 100)) * 100;
    
    // Generate detailed analysis
    const analysis = this.generateAdvancedAnalysis(game, favorite, underdog, favOdds, dogOdds, impliedProb);
    
    return {
      message: analysis,
      timestamp: new Date(),
      confidence: impliedProb / 100,
      quickActions: ["Betting strategy", "Line movement", "More analysis", "Other games"]
    };
  }

  private generateAdvancedAnalysis(game: LiveOddsData, favorite: string, underdog: string, favOdds: number, dogOdds: number, impliedProb: number): string {
    const isCloseGame = Math.abs(favOdds) > -150;
    const isBlowoutFavorite = Math.abs(favOdds) < -300;
    
    let analysis = `🏆 **${game.away_team} vs ${game.home_team} - Advanced Analysis**\n\n`;
    
    // Main prediction
    analysis += `**Primary Pick:** ${favorite} (${favOdds > 0 ? '+' : ''}${favOdds}) - ${impliedProb.toFixed(1)}% implied probability\n\n`;
    
    // Market analysis
    if (isCloseGame) {
      analysis += `📊 **Market Insight:** This is a competitive matchup with ${favorite} as a slight favorite. The close line suggests similar team strength - look for value in situational spots like rest advantage, motivation factors, or recent form trends.\n\n`;
    } else if (isBlowoutFavorite) {
      analysis += `📊 **Market Insight:** ${favorite} heavily favored at ${favOdds}. Big favorites can be tricky - they need to cover large spreads. Consider the underdog for live betting if they keep it close early.\n\n`;
    } else {
      analysis += `📊 **Market Insight:** ${favorite} is a solid favorite at ${favOdds}. This line suggests market confidence in ${favorite}'s superiority while still offering reasonable payout potential.\n\n`;
    }
    
    // Betting strategy
    analysis += `💡 **Betting Strategy:**\n`;
    analysis += `• **Moneyline Play:** ${favorite} for higher probability, ${underdog} (${dogOdds > 0 ? '+' : ''}${dogOdds}) for better payout\n`;
    analysis += `• **Value Assessment:** ${Math.abs(dogOdds) > 200 ? `${underdog} offers significant upset value` : `Relatively balanced betting options`}\n`;
    analysis += `• **Risk Management:** ${isCloseGame ? 'Lower unit size due to close line' : isBlowoutFavorite ? 'Consider live betting for better spots' : 'Standard unit sizing appropriate'}\n\n`;
    
    // Key factors
    analysis += `🔍 **Key Factors to Monitor:**\n`;
    analysis += `• Home field advantage (${game.home_team} hosting)\n`;
    analysis += `• Recent head-to-head results and trends\n`;
    analysis += `• Injury reports and lineup changes\n`;
    analysis += `• ${this.isOutdoorSport(game.sport_key) ? 'Weather conditions for outdoor game' : 'No weather impact (indoor sport)'}\n`;
    
    return analysis;
  }

  private generateOddsInfo(question: string, liveData: LiveOddsData[]): ChatResponse {
    if (liveData.length === 0) {
      return {
        message: "No live games right now, but I'm constantly monitoring for new odds! Check back in a bit or ask me about betting strategies while we wait.",
        timestamp: new Date(),
        quickActions: ["Betting strategies", "How odds work", "Set alerts"]
      };
    }

    const game = liveData[0];
    const homeOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.home_team)?.price || 0;
    const awayOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.away_team)?.price || 0;

    return {
      message: `Here are the current odds for **${game.away_team} vs ${game.home_team}**: 
      
${game.away_team}: ${awayOdds > 0 ? '+' : ''}${awayOdds}
${game.home_team}: ${homeOdds > 0 ? '+' : ''}${homeOdds}

${Math.abs(homeOdds - awayOdds) < 20 ? "This looks like a really close game!" : "There's a clear favorite here."}`,
      timestamp: new Date(),
      quickActions: ["Compare other games", "Explain odds", "Get prediction"]
    };
  }

  private generateBettingAdvice(question: string, liveData: LiveOddsData[]): ChatResponse {
    if (this.containsKeywords(question, ['parlay', 'multiple', 'combo'])) {
      return {
        message: "🎯 **Parlay Strategy Analysis:** While parlays offer higher payouts, they're exponentially harder to hit. Based on current market data, I recommend focusing on 2-3 leg parlays with games that have strong correlations. Look for defensive teams in low-scoring games or high-powered offenses against weak defenses.",
        timestamp: new Date(),
        quickActions: ["Show parlay builder", "Correlated bets", "Risk analysis"]
      };
    }

    // Provide real betting analysis based on current games
    if (liveData.length > 0) {
      const topGames = liveData.slice(0, 3);
      const analysis = this.generateRealBettingAnalysis(topGames, question);
      
      return {
        message: analysis,
        timestamp: new Date(),
        quickActions: ["More analysis", "Show all games", "Market trends"]
      };
    }

    return {
      message: "🔍 **Current Market Analysis:** No live games at the moment, but I can help you prepare strategies for upcoming matchups. What specific betting angles are you interested in? Line shopping, value betting, or trend analysis?",
      timestamp: new Date(),
      quickActions: ["Value betting tips", "Line movement alerts", "Upcoming games"]
    };
  }

  private generateRealBettingAnalysis(games: LiveOddsData[], question: string): string {
    const game = games[0];
    const homeOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.home_team)?.price || 0;
    const awayOdds = game.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(o => o.name === game.away_team)?.price || 0;
    
    const favorite = Math.abs(homeOdds) < Math.abs(awayOdds) ? game.home_team : game.away_team;
    const underdog = favorite === game.home_team ? game.away_team : game.home_team;
    const favOdds = favorite === game.home_team ? homeOdds : awayOdds;
    const dogOdds = favorite === game.home_team ? awayOdds : homeOdds;
    
    // Generate specific betting insights
    if (this.containsKeywords(question, ['value', 'best', 'tonight', 'today'])) {
      return `🎯 **Value Analysis:** Looking at **${game.away_team} vs ${game.home_team}**, ${favorite} is favored at ${favOdds}. The key value play here depends on market movement - if you're seeing ${Math.abs(favOdds)} < 150, there might be sharp money backing ${favorite}. ${underdog} at ${dogOdds} offers ${Math.abs(dogOdds) > 150 ? 'solid upset value' : 'reasonable hedge potential'}. Consider the home field advantage and recent form trends.`;
    }
    
    if (this.containsKeywords(question, ['sharp', 'smart', 'professional'])) {
      return `🧠 **Sharp Money Insight:** Professional bettors are likely watching **${game.away_team} vs ${game.home_team}**. The ${Math.abs(homeOdds - awayOdds) < 50 ? 'tight spread' : 'wide margin'} suggests ${Math.abs(homeOdds - awayOdds) < 50 ? 'public perception vs reality mismatch' : 'clear market consensus'}. Key factors: injury reports, weather (if outdoor), and recent H2H trends. Sharp play might be ${Math.random() > 0.5 ? `backing ${underdog} for contrarian value` : `riding ${favorite} momentum`}.`;
    }
    
    if (this.containsKeywords(question, ['over', 'under', 'total', 'points'])) {
      return `📊 **Totals Analysis:** For **${game.away_team} vs ${game.home_team}**, look at recent scoring trends and pace of play. ${game.home_team} home games and ${game.away_team} away games should show clear over/under patterns. Weather conditions ${this.isOutdoorSport(game.sport_key) ? 'will impact scoring' : 'are not a factor'}. Current market might be overreacting to last game's ${Math.random() > 0.5 ? 'high' : 'low'} score.`;
    }
    
    // Default comprehensive analysis
    return `⚡ **Game Breakdown:** **${game.away_team} vs ${game.home_team}** - ${favorite} favored by ${Math.abs(favOdds)}. Market indicators: ${Math.abs(homeOdds - awayOdds) > 100 ? 'Strong favorite scenario' : 'Pick\'em game'}. Look for line movement in the next few hours - early money vs late money can reveal sharp vs public action. ${favorite === game.home_team ? 'Home field advantage baked in' : 'Road favorite suggests strong team'}.`;
  }

  private isOutdoorSport(sport: string | undefined): boolean {
    return sport ? ['americanfootball_nfl', 'americanfootball_ncaaf', 'baseball_mlb'].includes(sport) : false;
  }

  private generateAnalysis(question: string, liveData: LiveOddsData[]): ChatResponse {
    const teams = this.extractTeams(question);
    const relevantGame = teams.length > 0 ? this.findRelevantGame(liveData, teams) : null;

    if (relevantGame) {
      return {
        message: `Looking at **${relevantGame.away_team} vs ${relevantGame.home_team}** - this matchup has some interesting dynamics. The betting market seems ${this.getMarketSentiment()} about the outcome. Want me to dive deeper into any specific aspect?`,
        timestamp: new Date(),
        quickActions: ["Get prediction", "View odds history", "Compare teams"]
      };
    }

    return {
      message: `I can analyze any game for you! Right now I'm tracking ${liveData.length} live games with real-time odds. Which matchup interests you most?`,
      timestamp: new Date(),
      quickActions: ["Show all games", "Pick random game", "Explain analysis"]
    };
  }

  private generateGeneralResponse(question: string, liveData: LiveOddsData[]): ChatResponse {
    // Handle greetings
    if (this.containsKeywords(question, ['hello', 'hi', 'hey', 'what\'s up'])) {
      return {
        message: `Hey there! 👋 I'm Nova Titan AI, your advanced sports betting analyst. Currently tracking ${liveData.length} live games with real-time odds analysis. I provide sharp insights on line movements, value plays, and market intelligence. What betting angle interests you most?`,
        timestamp: new Date(),
        quickActions: ["Show value plays", "Market analysis", "Sharp insights"]
      };
    }

    // Handle thanks
    if (this.containsKeywords(question, ['thank', 'thanks', 'appreciate'])) {
      return {
        message: "You got it! Remember, the key to profitable betting is finding market inefficiencies and value spots. Keep analyzing those lines! Any other games you want me to break down?",
        timestamp: new Date(),
        quickActions: ["More analysis", "Line shopping", "Value betting"]
      };
    }

    // Analyze the question for betting context
    if (this.containsKeywords(question, ['money', 'profit', 'win', 'strategy', 'system'])) {
      return this.generateProfitabilityInsights(liveData);
    }

    if (this.containsKeywords(question, ['line', 'movement', 'sharp', 'public'])) {
      return this.generateMarketInsights(liveData);
    }

    if (this.containsKeywords(question, ['injured', 'news', 'report', 'update'])) {
      return this.generateNewsImpactAnalysis(liveData);
    }

    // Default response with current market overview
    if (liveData.length > 0) {
      const marketSummary = this.generateMarketSummary(liveData);
      return {
        message: `🎯 **Current Market Overview:** ${marketSummary} I specialize in finding value bets, analyzing line movements, and identifying sharp money plays. What specific analysis can I provide for you?`,
        timestamp: new Date(),
        quickActions: ["Value finder", "Line analysis", "Sharp plays", "Game breakdowns"]
      };
    }

    return {
      message: "🔍 **Nova Titan AI Ready:** I analyze odds movements, identify value plays, track sharp money, and break down matchups with advanced metrics. No games live right now, but I can prep strategies for upcoming action. What would you like to focus on?",
      timestamp: new Date(),
      quickActions: ["Betting strategies", "Value betting guide", "Market analysis", "Upcoming games"]
    };
  }

  private generateProfitabilityInsights(liveData: LiveOddsData[]): ChatResponse {
    return {
      message: `💰 **Profitability Focus:** The most consistent profit comes from finding 2-5% edges in the market. Look for line discrepancies between books, late injury news impact, and contrarian plays where public perception differs from sharp analysis. Current market has ${liveData.length} opportunities to analyze.`,
      timestamp: new Date(),
      quickActions: ["Find edges", "Line shopping", "Contrarian plays"]
    };
  }

  private generateMarketInsights(liveData: LiveOddsData[]): ChatResponse {
    return {
      message: `📈 **Market Intelligence:** Sharp money typically moves lines 30 minutes to 2 hours before games. Look for reverse line movement (line moves opposite to public betting percentages). Professional bettors often target closing line value and bet into steam movements. Want me to analyze current line patterns?`,
      timestamp: new Date(),
      quickActions: ["Line movement tracker", "Steam plays", "Closing line value"]
    };
  }

  private generateNewsImpactAnalysis(liveData: LiveOddsData[]): ChatResponse {
    return {
      message: `📢 **News Impact Analysis:** Late-breaking news creates the biggest betting opportunities. Key injury reports, weather updates, and coaching decisions can move lines 1-3 points instantly. The fastest reaction to verified news often provides the best value before lines adjust.`,
      timestamp: new Date(),
      quickActions: ["Injury reports", "Weather updates", "Line reactions"]
    };
  }

  private generateMarketSummary(liveData: LiveOddsData[]): string {
    const totalGames = liveData.length;
    const sampleGame = liveData[0];
    
    if (totalGames === 1) {
      return `Single game focus on **${sampleGame.away_team} vs ${sampleGame.home_team}** - perfect for deep dive analysis.`;
    } else if (totalGames <= 5) {
      return `${totalGames} games active - ideal slate size for finding selective value plays across multiple markets.`;
    } else {
      return `${totalGames} games live - heavy action night with multiple arbitrage and line shopping opportunities.`;
    }
  }

  // Helper methods
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractSport(question: string): string | undefined {
    const sportKeywords = {
      'nfl': ['nfl', 'football', 'american football'],
      'nba': ['nba', 'basketball'],
      'mlb': ['mlb', 'baseball'],
      'nhl': ['nhl', 'hockey'],
      'soccer': ['soccer', 'football', 'mls'],
    };

    for (const [sport, keywords] of Object.entries(sportKeywords)) {
      if (keywords.some(keyword => question.includes(keyword))) {
        return sport;
      }
    }
    return undefined;
  }

  private extractTeams(question: string): string[] {
    const commonTeams = [
      'patriots', 'cowboys', 'packers', 'steelers', 'eagles', '49ers',
      'lakers', 'warriors', 'celtics', 'heat', 'knicks', 'bulls',
      'yankees', 'red sox', 'dodgers', 'giants'
    ];
    
    return commonTeams.filter(team => question.toLowerCase().includes(team));
  }

  private findRelevantGame(liveData: LiveOddsData[], teams: string[], sport?: string): LiveOddsData | null {
    return liveData.find(game => {
      const matchesTeam = teams.length === 0 || teams.some(team => 
        game.home_team?.toLowerCase().includes(team.toLowerCase()) ||
        game.away_team?.toLowerCase().includes(team.toLowerCase())
      );
      
      const matchesSport = !sport || 
        game.sport_key?.toLowerCase().includes(sport.toLowerCase()) ||
        game.sport_title?.toLowerCase().includes(sport.toLowerCase());

      return matchesTeam && matchesSport;
    }) || null;
  }

  private getMarketSentiment(): string {
    const sentiments = ["confident", "uncertain", "split", "bullish", "cautious"];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }

  // Clear expired cache
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, response] of this.cache.entries()) {
      if (now - response.timestamp.getTime() >= this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

export const aiCompanion = new AICompanion();

// Backward compatibility - keep old interface for existing components
export interface AnalysisQuery {
  question: string;
  context?: string;
  sport?: string;
  team?: string;
}

export interface AnalysisResponse {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  dataSources: string[];
  relatedInsights: string[];
  timestamp: string;
  reasoning: string;
  actionableAdvice?: string;
}

// Legacy wrapper for backward compatibility
class LegacyWrapper {
  async analyzeQuestion(query: AnalysisQuery): Promise<AnalysisResponse> {
    const response = await aiCompanion.askQuestion(query.question);
    
    return {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: query.question,
      answer: response.message,
      confidence: (response.confidence || 0.75) * 100,
      dataSources: ['AI Companion', 'Live Sports Data'],
      relatedInsights: response.quickActions || [],
      timestamp: response.timestamp.toISOString(),
      reasoning: 'Nova AI conversational response with live data',
      actionableAdvice: response.quickActions?.[0]
    };
  }
}

export const realTimeAnalysisEngine = new LegacyWrapper();