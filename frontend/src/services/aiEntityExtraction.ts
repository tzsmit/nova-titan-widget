/**
 * AI-Powered Entity Extraction Service - Priority Fix #13
 * Intelligent parsing of user queries to extract sports entities and betting concepts
 */

// Entity types that can be extracted from queries
export interface ExtractedEntity {
  type: 'player' | 'team' | 'game' | 'sport' | 'bet_type' | 'metric' | 'time_period';
  value: string;
  confidence: number;
  canonicalId?: string;
  alternateForm?: string;
  context?: string;
}

export interface QueryAnalysis {
  originalQuery: string;
  entities: ExtractedEntity[];
  intent: 'search' | 'prediction' | 'comparison' | 'analysis' | 'general';
  confidence: number;
  suggestedActions: string[];
  enhancedQuery?: string;
}

// Comprehensive sports entity database
const SPORTS_ENTITIES = {
  // NFL Teams with variations
  teams: {
    'chiefs': { canonical: 'Kansas City Chiefs', sport: 'nfl', variations: ['kc', 'kansas city', 'kingdom'] },
    'bills': { canonical: 'Buffalo Bills', sport: 'nfl', variations: ['buffalo', 'buf'] },
    'cowboys': { canonical: 'Dallas Cowboys', sport: 'nfl', variations: ['dallas', 'dal', 'america\'s team', 'boys'] },
    'packers': { canonical: 'Green Bay Packers', sport: 'nfl', variations: ['green bay', 'gb', 'pack', 'cheeseheads'] },
    'patriots': { canonical: 'New England Patriots', sport: 'nfl', variations: ['pats', 'ne', 'new england'] },
    '49ers': { canonical: 'San Francisco 49ers', sport: 'nfl', variations: ['niners', 'sf', 'san francisco', 'forty niners'] },
    'eagles': { canonical: 'Philadelphia Eagles', sport: 'nfl', variations: ['philly', 'phi', 'birds'] },
    'steelers': { canonical: 'Pittsburgh Steelers', sport: 'nfl', variations: ['pittsburgh', 'pit', 'steel curtain'] },
    
    // NBA Teams
    'lakers': { canonical: 'Los Angeles Lakers', sport: 'nba', variations: ['la lakers', 'lal', 'purple and gold'] },
    'warriors': { canonical: 'Golden State Warriors', sport: 'nba', variations: ['gsw', 'dubs', 'golden state'] },
    'celtics': { canonical: 'Boston Celtics', sport: 'nba', variations: ['boston', 'bos', 'c\'s', 'green'] },
    'heat': { canonical: 'Miami Heat', sport: 'nba', variations: ['miami', 'mia'] },
    'mavericks': { canonical: 'Dallas Mavericks', sport: 'nba', variations: ['mavs', 'dallas', 'dal'] },
    'nuggets': { canonical: 'Denver Nuggets', sport: 'nba', variations: ['denver', 'den'] },
    'bucks': { canonical: 'Milwaukee Bucks', sport: 'nba', variations: ['milwaukee', 'mil'] },
    
    // MLB Teams
    'yankees': { canonical: 'New York Yankees', sport: 'mlb', variations: ['yanks', 'nyy', 'bronx bombers'] },
    'dodgers': { canonical: 'Los Angeles Dodgers', sport: 'mlb', variations: ['lad', 'boys in blue'] },
    'astros': { canonical: 'Houston Astros', sport: 'mlb', variations: ['houston', 'hou'] },
    'red sox': { canonical: 'Boston Red Sox', sport: 'mlb', variations: ['redsox', 'sox', 'boston'] }
  },

  // Players with nicknames and variations
  players: {
    'mahomes': { canonical: 'Patrick Mahomes', team: 'Kansas City Chiefs', position: 'QB', variations: ['patrick mahomes', 'pat mahomes', 'pm15', 'showtime'] },
    'josh allen': { canonical: 'Josh Allen', team: 'Buffalo Bills', position: 'QB', variations: ['allen', 'ja17'] },
    'burrow': { canonical: 'Joe Burrow', team: 'Cincinnati Bengals', position: 'QB', variations: ['joe burrow', 'joey b', 'jb9', 'joe cool'] },
    'lamar': { canonical: 'Lamar Jackson', team: 'Baltimore Ravens', position: 'QB', variations: ['lamar jackson', 'lj8', 'action jackson'] },
    'dak': { canonical: 'Dak Prescott', team: 'Dallas Cowboys', position: 'QB', variations: ['dak prescott', 'prescott', 'dp4'] },
    
    // NBA Players
    'lebron': { canonical: 'LeBron James', team: 'Los Angeles Lakers', position: 'SF', variations: ['lebron james', 'lbj', 'the king', 'king james', 'chosen one'] },
    'curry': { canonical: 'Stephen Curry', team: 'Golden State Warriors', position: 'PG', variations: ['steph curry', 'stephen curry', 'steph', 'chef curry', 'sc30', 'baby faced assassin'] },
    'durant': { canonical: 'Kevin Durant', team: 'Phoenix Suns', position: 'SF', variations: ['kevin durant', 'kd', 'kd35', 'slim reaper', 'durantula'] },
    'giannis': { canonical: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', position: 'PF', variations: ['greek freak', 'ga34', 'antetokounmpo'] },
    'luka': { canonical: 'Luka Dončić', team: 'Dallas Mavericks', position: 'PG', variations: ['luka doncic', 'doncic', 'luka magic', 'ld77'] },
    'tatum': { canonical: 'Jayson Tatum', team: 'Boston Celtics', position: 'SF', variations: ['jayson tatum', 'jt0'] },
    'jokic': { canonical: 'Nikola Jokić', team: 'Denver Nuggets', position: 'C', variations: ['nikola jokic', 'joker', 'nj15'] },
    
    // MLB Players  
    'ohtani': { canonical: 'Shohei Ohtani', team: 'Los Angeles Dodgers', position: 'DH/P', variations: ['shohei ohtani', 'sho-time', 'unicorn', 'two-way ohtani'] },
    'judge': { canonical: 'Aaron Judge', team: 'New York Yankees', position: 'RF', variations: ['aaron judge', 'aj99', 'all rise'] },
    'betts': { canonical: 'Mookie Betts', team: 'Los Angeles Dodgers', position: 'RF', variations: ['mookie', 'mb50'] }
  },

  // Bet types and metrics
  betTypes: {
    'moneyline': { canonical: 'Moneyline', variations: ['ml', 'money line', 'straight up', 'to win'] },
    'spread': { canonical: 'Point Spread', variations: ['pts', 'points', 'line', 'handicap'] },
    'total': { canonical: 'Over/Under', variations: ['over under', 'o/u', 'totals', 'over', 'under'] },
    'prop': { canonical: 'Player Props', variations: ['props', 'player prop', 'prop bet'] },
    'parlay': { canonical: 'Parlay', variations: ['parlays', 'multi bet', 'combo bet'] },
    'teaser': { canonical: 'Teaser', variations: ['teasers', 'teaser bet'] }
  },

  // Sports and leagues
  sports: {
    'nfl': { canonical: 'NFL', variations: ['football', 'american football', 'national football league'] },
    'nba': { canonical: 'NBA', variations: ['basketball', 'national basketball association', 'hoops'] },
    'mlb': { canonical: 'MLB', variations: ['baseball', 'major league baseball'] },
    'nhl': { canonical: 'NHL', variations: ['hockey', 'national hockey league', 'ice hockey'] },
    'cfb': { canonical: 'College Football', variations: ['college football', 'ncaa football', 'cfb'] },
    'cbb': { canonical: 'College Basketball', variations: ['college basketball', 'ncaa basketball', 'march madness'] }
  },

  // Time periods
  timePeriods: {
    'today': { canonical: 'Today', variations: ['tonight', 'this evening'] },
    'tomorrow': { canonical: 'Tomorrow', variations: ['tmrw'] },
    'this week': { canonical: 'This Week', variations: ['week', 'weekly'] },
    'this season': { canonical: 'This Season', variations: ['season', 'year'] }
  },

  // Metrics and stats
  metrics: {
    'points': { canonical: 'Points', variations: ['pts', 'scoring'] },
    'yards': { canonical: 'Yards', variations: ['yds', 'rushing yards', 'passing yards'] },
    'touchdowns': { canonical: 'Touchdowns', variations: ['tds', 'td', 'scores'] },
    'assists': { canonical: 'Assists', variations: ['ast'] },
    'rebounds': { canonical: 'Rebounds', variations: ['reb', 'boards'] },
    'home runs': { canonical: 'Home Runs', variations: ['hr', 'homers', 'dingers'] },
    'rbi': { canonical: 'RBI', variations: ['runs batted in'] }
  }
};

// Intent patterns to determine user's goal
const INTENT_PATTERNS = {
  search: [
    /find|search|look for|show me/i,
    /who is|what is|tell me about/i,
    /stats for|statistics/i
  ],
  prediction: [
    /predict|prediction|forecast/i,
    /who will win|winner/i,
    /best bet|good bet|value/i,
    /odds|lines/i
  ],
  comparison: [
    /vs|versus|against|compare/i,
    /better|worse|who's better/i,
    /matchup/i
  ],
  analysis: [
    /analyze|analysis|breakdown/i,
    /why|how|explain/i,
    /trends|patterns/i
  ]
};

export class AIEntityExtraction {
  private static instance: AIEntityExtraction;
  private extractionCache = new Map<string, QueryAnalysis>();

  static getInstance(): AIEntityExtraction {
    if (!this.instance) {
      this.instance = new AIEntityExtraction();
    }
    return this.instance;
  }

  /**
   * Extract entities from a natural language query
   */
  async extractEntities(query: string): Promise<QueryAnalysis> {
    const cacheKey = query.toLowerCase().trim();
    
    // Check cache first
    if (this.extractionCache.has(cacheKey)) {
      console.log('🧠 Entity Extraction: Using cached analysis for:', query);
      return this.extractionCache.get(cacheKey)!;
    }

    console.log('🧠 Entity Extraction: Analyzing query:', query);
    
    const analysis: QueryAnalysis = {
      originalQuery: query,
      entities: [],
      intent: 'general',
      confidence: 0,
      suggestedActions: []
    };

    const queryLower = query.toLowerCase();
    
    // Extract teams
    this.extractTeams(queryLower, analysis);
    
    // Extract players  
    this.extractPlayers(queryLower, analysis);
    
    // Extract bet types
    this.extractBetTypes(queryLower, analysis);
    
    // Extract sports
    this.extractSports(queryLower, analysis);
    
    // Extract time periods
    this.extractTimePeriods(queryLower, analysis);
    
    // Extract metrics
    this.extractMetrics(queryLower, analysis);
    
    // Determine intent
    this.determineIntent(queryLower, analysis);
    
    // Generate suggested actions
    this.generateSuggestedActions(analysis);
    
    // Create enhanced query
    this.createEnhancedQuery(analysis);
    
    // Calculate overall confidence
    this.calculateConfidence(analysis);

    // Cache the result
    this.extractionCache.set(cacheKey, analysis);
    
    // Limit cache size
    if (this.extractionCache.size > 100) {
      const firstKey = this.extractionCache.keys().next().value;
      this.extractionCache.delete(firstKey);
    }

    console.log('🧠 Entity Extraction Results:', {
      entities: analysis.entities.length,
      intent: analysis.intent,
      confidence: analysis.confidence,
      entities_details: analysis.entities
    });

    return analysis;
  }

  private extractTeams(query: string, analysis: QueryAnalysis): void {
    for (const [key, team] of Object.entries(SPORTS_ENTITIES.teams)) {
      const variations = [key, team.canonical.toLowerCase(), ...team.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'team',
            value: team.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== team.canonical.toLowerCase() ? variation : undefined,
            context: team.sport
          });
          break;
        }
      }
    }
  }

  private extractPlayers(query: string, analysis: QueryAnalysis): void {
    for (const [key, player] of Object.entries(SPORTS_ENTITIES.players)) {
      const variations = [key, player.canonical.toLowerCase(), ...player.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'player',
            value: player.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== player.canonical.toLowerCase() ? variation : undefined,
            context: `${player.position} - ${player.team}`
          });
          break;
        }
      }
    }
  }

  private extractBetTypes(query: string, analysis: QueryAnalysis): void {
    for (const [key, betType] of Object.entries(SPORTS_ENTITIES.betTypes)) {
      const variations = [key, betType.canonical.toLowerCase(), ...betType.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'bet_type',
            value: betType.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== betType.canonical.toLowerCase() ? variation : undefined
          });
          break;
        }
      }
    }
  }

  private extractSports(query: string, analysis: QueryAnalysis): void {
    for (const [key, sport] of Object.entries(SPORTS_ENTITIES.sports)) {
      const variations = [key, sport.canonical.toLowerCase(), ...sport.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'sport',
            value: sport.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== sport.canonical.toLowerCase() ? variation : undefined
          });
          break;
        }
      }
    }
  }

  private extractTimePeriods(query: string, analysis: QueryAnalysis): void {
    for (const [key, period] of Object.entries(SPORTS_ENTITIES.timePeriods)) {
      const variations = [key, period.canonical.toLowerCase(), ...period.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'time_period',
            value: period.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== period.canonical.toLowerCase() ? variation : undefined
          });
          break;
        }
      }
    }
  }

  private extractMetrics(query: string, analysis: QueryAnalysis): void {
    for (const [key, metric] of Object.entries(SPORTS_ENTITIES.metrics)) {
      const variations = [key, metric.canonical.toLowerCase(), ...metric.variations];
      
      for (const variation of variations) {
        if (this.matchesEntity(query, variation)) {
          analysis.entities.push({
            type: 'metric',
            value: metric.canonical,
            confidence: this.calculateMatchConfidence(query, variation),
            canonicalId: key,
            alternateForm: variation !== metric.canonical.toLowerCase() ? variation : undefined
          });
          break;
        }
      }
    }
  }

  private matchesEntity(query: string, entity: string): boolean {
    // Exact match
    if (query.includes(entity)) return true;
    
    // Word boundary match (prevents false positives)
    const regex = new RegExp(`\\b${entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(query);
  }

  private calculateMatchConfidence(query: string, match: string): number {
    const queryLength = query.length;
    const matchLength = match.length;
    
    // Longer matches relative to query get higher confidence
    const lengthRatio = matchLength / queryLength;
    
    // Exact match gets highest confidence
    if (query === match) return 100;
    
    // Starts with match gets high confidence
    if (query.startsWith(match)) return 95;
    
    // Word boundary match gets good confidence
    const regex = new RegExp(`\\b${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(query)) return 85;
    
    // Contains match gets moderate confidence
    if (query.includes(match)) return 70;
    
    return 50;
  }

  private determineIntent(query: string, analysis: QueryAnalysis): void {
    let maxScore = 0;
    let detectedIntent: QueryAnalysis['intent'] = 'general';

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          score += 1;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent as QueryAnalysis['intent'];
      }
    }

    analysis.intent = detectedIntent;
  }

  private generateSuggestedActions(analysis: QueryAnalysis): void {
    const actions: string[] = [];
    
    // Based on entities found
    const hasPlayer = analysis.entities.some(e => e.type === 'player');
    const hasTeam = analysis.entities.some(e => e.type === 'team');
    const hasBetType = analysis.entities.some(e => e.type === 'bet_type');
    
    if (hasPlayer) {
      actions.push('View Player Stats', 'Player Props', 'Player Insights');
    }
    
    if (hasTeam) {
      actions.push('View Team Stats', 'Team Matchups', 'Team Analysis');
    }
    
    if (hasBetType) {
      actions.push('Find Best Bets', 'View Odds', 'Betting Analysis');
    }
    
    // Based on intent
    switch (analysis.intent) {
      case 'prediction':
        actions.push('AI Predictions', 'Betting Recommendations');
        break;
      case 'comparison':
        actions.push('Head-to-Head Stats', 'Compare Players');
        break;
      case 'analysis':
        actions.push('Deep Analysis', 'Statistical Breakdown');
        break;
    }
    
    analysis.suggestedActions = [...new Set(actions)]; // Remove duplicates
  }

  private createEnhancedQuery(analysis: QueryAnalysis): void {
    // Create a more structured query based on extracted entities
    const entityValues = analysis.entities.map(e => e.value);
    
    if (entityValues.length > 0) {
      analysis.enhancedQuery = entityValues.join(' + ');
    }
  }

  private calculateConfidence(analysis: QueryAnalysis): void {
    if (analysis.entities.length === 0) {
      analysis.confidence = 10;
      return;
    }
    
    const avgEntityConfidence = analysis.entities.reduce((sum, e) => sum + e.confidence, 0) / analysis.entities.length;
    const entityBonus = Math.min(analysis.entities.length * 10, 30); // Bonus for multiple entities
    
    analysis.confidence = Math.min(avgEntityConfidence + entityBonus, 100);
  }

  /**
   * Clear the extraction cache
   */
  clearCache(): void {
    this.extractionCache.clear();
    console.log('🧠 Entity Extraction: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; queries: string[] } {
    return {
      size: this.extractionCache.size,
      queries: Array.from(this.extractionCache.keys())
    };
  }
}

// Export singleton instance
export const aiEntityExtraction = AIEntityExtraction.getInstance();