/**
 * Enhanced Player Search Service - Canonical ID Lookup and Props Integration
 * Provides robust player search with ID resolution and quick-track UX support
 */

import { playerDataService, PlayerData } from './playerDataService';

export interface CanonicalPlayer {
  canonicalId: string;
  name: string;
  alternateNames: string[];
  team: string;
  position: string;
  sport: string;
  jerseyNumber?: number;
  stats?: any;
  propsAvailable: boolean;
  trackingEnabled: boolean;
}

export interface PlayerProps {
  playerId: string;
  playerName: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  recommendation: 'over' | 'under' | 'avoid';
}

export interface SearchResult {
  player: CanonicalPlayer;
  matchScore: number;
  matchReason: string;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  type: 'track' | 'props' | 'compare' | 'parlay' | 'insights';
  icon: string;
  enabled: boolean;
}

class EnhancedPlayerSearchService {
  private canonicalPlayersCache: Map<string, CanonicalPlayer> = new Map();
  private playerPropsCache: Map<string, PlayerProps[]> = new Map();
  private searchIndexCache: Map<string, CanonicalPlayer[]> = new Map();

  // Enhanced player database with canonical IDs and alternate names
  private getCanonicalPlayerDatabase(): CanonicalPlayer[] {
    return [
      // NBA Stars
      {
        canonicalId: 'nba_lebron_james',
        name: 'LeBron James',
        alternateNames: ['LeBron', 'King James', 'The King', 'LBJ', 'James, LeBron'],
        team: 'Los Angeles Lakers',
        position: 'SF',
        sport: 'NBA',
        jerseyNumber: 23,
        stats: { points: 25.3, rebounds: 7.3, assists: 7.3, games: 71 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_stephen_curry',
        name: 'Stephen Curry',
        alternateNames: ['Steph Curry', 'Curry', 'Chef Curry', 'Steph', 'Stephen', 'Curry, Stephen'],
        team: 'Golden State Warriors',
        position: 'PG',
        sport: 'NBA',
        jerseyNumber: 30,
        stats: { points: 26.4, rebounds: 4.5, assists: 5.1, threePointers: 4.8 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_kevin_durant',
        name: 'Kevin Durant',
        alternateNames: ['KD', 'Durant', 'Kevin', 'The Slim Reaper', 'Durant, Kevin'],
        team: 'Phoenix Suns',
        position: 'PF/SF',
        sport: 'NBA',
        jerseyNumber: 35,
        stats: { points: 27.1, rebounds: 6.7, assists: 5.0, fieldGoalPercentage: 52.3 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_giannis_antetokounmpo',
        name: 'Giannis Antetokounmpo',
        alternateNames: ['Giannis', 'The Greek Freak', 'Antetokounmpo', 'Greek Freak'],
        team: 'Milwaukee Bucks',
        position: 'PF',
        sport: 'NBA',
        jerseyNumber: 34,
        stats: { points: 31.1, rebounds: 11.8, assists: 5.7, blocks: 1.2 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_luka_doncic',
        name: 'Luka Dončić',
        alternateNames: ['Luka Doncic', 'Luka', 'Doncic', 'Dončić', 'Wonder Boy'],
        team: 'Dallas Mavericks',
        position: 'PG',
        sport: 'NBA',
        jerseyNumber: 77,
        stats: { points: 32.4, rebounds: 8.6, assists: 8.0, tripleDobules: 13 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_jayson_tatum',
        name: 'Jayson Tatum',
        alternateNames: ['Tatum', 'JT', 'Jayson', 'Tatum, Jayson'],
        team: 'Boston Celtics',
        position: 'SF',
        sport: 'NBA',
        jerseyNumber: 0,
        stats: { points: 27.0, rebounds: 8.4, assists: 4.9, threePointers: 3.1 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nba_joel_embiid',
        name: 'Joel Embiid',
        alternateNames: ['Embiid', 'Joel', 'The Process', 'Embiid, Joel'],
        team: 'Philadelphia 76ers',
        position: 'C',
        sport: 'NBA',
        jerseyNumber: 21,
        stats: { points: 33.1, rebounds: 10.2, assists: 4.2, blocks: 1.7 },
        propsAvailable: true,
        trackingEnabled: true
      },

      // NFL Stars
      {
        canonicalId: 'nfl_patrick_mahomes',
        name: 'Patrick Mahomes',
        alternateNames: ['Mahomes', 'Patrick', 'Pat Mahomes', 'Mahomes II'],
        team: 'Kansas City Chiefs',
        position: 'QB',
        sport: 'NFL',
        jerseyNumber: 15,
        stats: { passingYards: 4183, passingTDs: 27, completionPercentage: 67.2 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nfl_josh_allen',
        name: 'Josh Allen',
        alternateNames: ['Allen', 'Josh', 'Josh Allen Bills', 'Allen, Josh'],
        team: 'Buffalo Bills',
        position: 'QB',
        sport: 'NFL',
        jerseyNumber: 17,
        stats: { passingYards: 4306, passingTDs: 29, rushingTDs: 15 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nfl_travis_kelce',
        name: 'Travis Kelce',
        alternateNames: ['Kelce', 'Travis', 'Trav', 'Kelce, Travis'],
        team: 'Kansas City Chiefs',
        position: 'TE',
        sport: 'NFL',
        jerseyNumber: 87,
        stats: { receptions: 93, receivingYards: 984, receivingTDs: 5 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nfl_christian_mccaffrey',
        name: 'Christian McCaffrey',
        alternateNames: ['McCaffrey', 'CMC', 'Christian', 'McCaffrey, Christian'],
        team: 'San Francisco 49ers',
        position: 'RB',
        sport: 'NFL',
        jerseyNumber: 23,
        stats: { rushingYards: 1459, rushingTDs: 14, receivingTDs: 7 },
        propsAvailable: true,
        trackingEnabled: true
      },
      {
        canonicalId: 'nfl_tyreek_hill',
        name: 'Tyreek Hill',
        alternateNames: ['Hill', 'Tyreek', 'Cheetah', 'Hill, Tyreek'],
        team: 'Miami Dolphins',
        position: 'WR',
        sport: 'NFL',
        jerseyNumber: 10,
        stats: { receptions: 119, receivingYards: 1799, receivingTDs: 13 },
        propsAvailable: true,
        trackingEnabled: true
      }
    ];
  }

  // Initialize canonical players cache
  private initializeCanonicalCache(): void {
    const players = this.getCanonicalPlayerDatabase();
    players.forEach(player => {
      this.canonicalPlayersCache.set(player.canonicalId, player);
      
      // Also cache by alternate names for faster lookup
      player.alternateNames.forEach(altName => {
        const key = this.normalizeSearchTerm(altName);
        if (!this.searchIndexCache.has(key)) {
          this.searchIndexCache.set(key, []);
        }
        this.searchIndexCache.get(key)!.push(player);
      });

      // Cache by main name
      const mainKey = this.normalizeSearchTerm(player.name);
      if (!this.searchIndexCache.has(mainKey)) {
        this.searchIndexCache.set(mainKey, []);
      }
      this.searchIndexCache.get(mainKey)!.push(player);
    });
  }

  private normalizeSearchTerm(term: string): string {
    return term.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Enhanced search with canonical ID resolution
   */
  async searchPlayersWithCanonicalId(query: string, sport?: string): Promise<SearchResult[]> {
    // Initialize cache if needed
    if (this.canonicalPlayersCache.size === 0) {
      this.initializeCanonicalCache();
    }

    console.log(`🔍 Enhanced Search: Looking for "${query}" in sport: ${sport || 'all'}`);
    
    const normalizedQuery = this.normalizeSearchTerm(query);
    const results: SearchResult[] = [];

    // 1. Direct canonical lookup from enhanced database
    for (const [key, players] of this.searchIndexCache.entries()) {
      if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
        players.forEach(player => {
          if (sport && player.sport !== sport) return;

          const matchScore = this.calculateMatchScore(query, player);
          if (matchScore > 0.3) { // Only include decent matches
            results.push({
              player,
              matchScore,
              matchReason: this.getMatchReason(query, player),
              quickActions: this.generateQuickActions(player)
            });
          }
        });
      }
    }

    // 2. Fallback to existing player data service for additional players
    const fallbackPlayers = playerDataService.searchPlayers(query, sport);
    for (const fallbackPlayer of fallbackPlayers) {
      // Convert to canonical format
      const canonicalPlayer = this.convertToCanonicalPlayer(fallbackPlayer);
      
      // Check if already in results
      if (!results.some(r => r.player.canonicalId === canonicalPlayer.canonicalId)) {
        results.push({
          player: canonicalPlayer,
          matchScore: 0.7, // Lower score for fallback
          matchReason: 'Name match',
          quickActions: this.generateQuickActions(canonicalPlayer)
        });
      }
    }

    // 3. Sort by match score and relevance
    results.sort((a, b) => {
      // Prioritize exact name matches
      if (a.matchScore > 0.9 && b.matchScore <= 0.9) return -1;
      if (b.matchScore > 0.9 && a.matchScore <= 0.9) return 1;
      
      // Then by match score
      if (Math.abs(a.matchScore - b.matchScore) > 0.1) {
        return b.matchScore - a.matchScore;
      }
      
      // Finally by tracking availability
      if (a.player.trackingEnabled && !b.player.trackingEnabled) return -1;
      if (b.player.trackingEnabled && !a.player.trackingEnabled) return 1;
      
      return 0;
    });

    console.log(`✅ Enhanced Search: Found ${results.length} canonical results for "${query}"`);
    return results.slice(0, 12); // Limit to top results
  }

  private calculateMatchScore(query: string, player: CanonicalPlayer): number {
    const normalizedQuery = this.normalizeSearchTerm(query);
    const normalizedName = this.normalizeSearchTerm(player.name);
    
    // Exact name match
    if (normalizedName === normalizedQuery) return 1.0;
    
    // Check alternate names
    for (const altName of player.alternateNames) {
      const normalizedAlt = this.normalizeSearchTerm(altName);
      if (normalizedAlt === normalizedQuery) return 0.95;
      if (normalizedAlt.includes(normalizedQuery) || normalizedQuery.includes(normalizedAlt)) {
        return 0.85;
      }
    }
    
    // Partial matches
    if (normalizedName.includes(normalizedQuery)) return 0.8;
    if (normalizedQuery.includes(normalizedName)) return 0.7;
    
    // Word-by-word matching
    const queryWords = normalizedQuery.split(' ');
    const nameWords = normalizedName.split(' ');
    
    let matchingWords = 0;
    for (const queryWord of queryWords) {
      for (const nameWord of nameWords) {
        if (nameWord.includes(queryWord) || queryWord.includes(nameWord)) {
          matchingWords++;
          break;
        }
      }
    }
    
    const wordMatchRatio = matchingWords / Math.max(queryWords.length, nameWords.length);
    
    // Team name matching
    const teamScore = this.normalizeSearchTerm(player.team).includes(normalizedQuery) ? 0.6 : 0;
    
    return Math.max(wordMatchRatio * 0.8, teamScore);
  }

  private getMatchReason(query: string, player: CanonicalPlayer): string {
    const normalizedQuery = this.normalizeSearchTerm(query);
    const normalizedName = this.normalizeSearchTerm(player.name);
    
    if (normalizedName === normalizedQuery) return 'Exact name match';
    
    for (const altName of player.alternateNames) {
      if (this.normalizeSearchTerm(altName) === normalizedQuery) {
        return `Matched alternate name: ${altName}`;
      }
    }
    
    if (normalizedName.includes(normalizedQuery)) return 'Name contains search term';
    if (this.normalizeSearchTerm(player.team).includes(normalizedQuery)) return 'Team name match';
    
    return 'Partial name match';
  }

  private convertToCanonicalPlayer(player: PlayerData): CanonicalPlayer {
    return {
      canonicalId: player.id,
      name: player.name,
      alternateNames: [player.name],
      team: player.team,
      position: player.position,
      sport: 'NBA', // Default, could be enhanced
      jerseyNumber: player.jerseyNumber,
      stats: player.stats,
      propsAvailable: true,
      trackingEnabled: true
    };
  }

  private generateQuickActions(player: CanonicalPlayer): QuickAction[] {
    const actions: QuickAction[] = [
      {
        id: 'track',
        label: 'Track Player',
        type: 'track',
        icon: '❤️',
        enabled: player.trackingEnabled
      },
      {
        id: 'props',
        label: 'View Props',
        type: 'props',
        icon: '📊',
        enabled: player.propsAvailable
      },
      {
        id: 'insights',
        label: 'AI Insights',
        type: 'insights',
        icon: '🧠',
        enabled: true
      },
      {
        id: 'compare',
        label: 'Compare',
        type: 'compare',
        icon: '⚖️',
        enabled: true
      }
    ];

    // Add sport-specific actions
    if (player.sport === 'NBA' || player.sport === 'NFL') {
      actions.push({
        id: 'parlay',
        label: 'Add to Parlay',
        type: 'parlay',
        icon: '💰',
        enabled: player.propsAvailable
      });
    }

    return actions;
  }

  /**
   * Get player props by canonical ID
   */
  async getPlayerPropsByCanonicalId(canonicalId: string): Promise<PlayerProps[]> {
    if (this.playerPropsCache.has(canonicalId)) {
      return this.playerPropsCache.get(canonicalId)!;
    }

    const player = this.canonicalPlayersCache.get(canonicalId);
    if (!player) {
      console.warn(`Player not found for canonical ID: ${canonicalId}`);
      return [];
    }

    // Generate realistic props based on player stats and position
    const props = this.generateEnhancedPlayerProps(player);
    this.playerPropsCache.set(canonicalId, props);
    
    console.log(`✅ Generated ${props.length} props for ${player.name}`);
    return props;
  }

  private generateEnhancedPlayerProps(player: CanonicalPlayer): PlayerProps[] {
    const props: PlayerProps[] = [];
    
    if (player.sport === 'NBA') {
      // Points prop
      if (player.stats?.points) {
        const basePoints = player.stats.points;
        const line = basePoints + (Math.random() * 4 - 2); // Variance
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'points',
          line: Math.round(line * 2) / 2, // Round to 0.5
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Total Points`,
          confidence: basePoints > 25 ? 'high' : basePoints > 15 ? 'medium' : 'low',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      }

      // Rebounds (for forwards and centers)
      if (player.position.includes('F') || player.position.includes('C')) {
        const baseRebounds = player.stats?.rebounds || 6;
        const line = baseRebounds + (Math.random() * 2 - 1);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'rebounds',
          line: Math.round(line * 2) / 2,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Total Rebounds`,
          confidence: baseRebounds > 8 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      }

      // Assists (for guards)
      if (player.position.includes('G')) {
        const baseAssists = player.stats?.assists || 4;
        const line = baseAssists + (Math.random() * 2 - 1);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'assists',
          line: Math.round(line * 2) / 2,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Total Assists`,
          confidence: baseAssists > 6 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      }

      // Three-pointers (for shooters)
      if (player.stats?.threePointers || player.position.includes('G')) {
        const baseThrees = player.stats?.threePointers || 2;
        const line = baseThrees + (Math.random() * 1.5 - 0.75);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'three_pointers',
          line: Math.max(0.5, Math.round(line * 2) / 2),
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Made Three-Pointers`,
          confidence: baseThrees > 3 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      }
    } else if (player.sport === 'NFL') {
      if (player.position === 'QB') {
        // Passing yards
        const baseYards = player.stats?.passingYards || 250;
        const weeklyYards = baseYards / 17; // Average per game
        const line = weeklyYards + (Math.random() * 50 - 25);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'passing_yards',
          line: Math.round(line / 5) * 5, // Round to nearest 5
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Passing Yards`,
          confidence: baseYards > 4000 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });

        // Passing TDs
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'passing_touchdowns',
          line: 1.5 + Math.random(),
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Passing Touchdowns`,
          confidence: 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      } else if (player.position === 'RB') {
        // Rushing yards
        const baseYards = player.stats?.rushingYards || 70;
        const weeklyYards = baseYards / 17;
        const line = weeklyYards + (Math.random() * 30 - 15);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'rushing_yards',
          line: Math.round(line / 5) * 5,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Rushing Yards`,
          confidence: baseYards > 1000 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      } else if (player.position.includes('WR') || player.position.includes('TE')) {
        // Receiving yards
        const baseYards = player.stats?.receivingYards || 50;
        const weeklyYards = baseYards / 17;
        const line = weeklyYards + (Math.random() * 25 - 12.5);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'receiving_yards',
          line: Math.round(line / 5) * 5,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Receiving Yards`,
          confidence: baseYards > 1000 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });

        // Receptions
        const baseReceptions = player.stats?.receptions || 4;
        const weeklyReceptions = baseReceptions / 17;
        const receptionLine = weeklyReceptions + (Math.random() * 2 - 1);
        
        props.push({
          playerId: player.canonicalId,
          playerName: player.name,
          propType: 'receptions',
          line: Math.max(0.5, Math.round(receptionLine * 2) / 2),
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Receptions`,
          confidence: baseReceptions > 80 ? 'high' : 'medium',
          recommendation: Math.random() > 0.5 ? 'over' : 'under'
        });
      }
    }

    return props;
  }

  /**
   * Quick track action - add player to tracking list
   */
  async quickTrackPlayer(canonicalId: string): Promise<boolean> {
    try {
      const player = this.canonicalPlayersCache.get(canonicalId);
      if (!player) {
        console.error(`Cannot track: Player not found for ID ${canonicalId}`);
        return false;
      }

      // Get current tracked players
      const trackedPlayers = JSON.parse(localStorage.getItem('trackedPlayers') || '[]');
      
      // Check if already tracked
      const isAlreadyTracked = trackedPlayers.some((p: any) => p.canonicalId === canonicalId);
      if (isAlreadyTracked) {
        console.log(`Player ${player.name} is already being tracked`);
        return false;
      }

      // Add to tracking list
      const trackingEntry = {
        canonicalId: player.canonicalId,
        name: player.name,
        team: player.team,
        position: player.position,
        sport: player.sport,
        addedAt: new Date().toISOString(),
        quickTrack: true
      };

      trackedPlayers.push(trackingEntry);
      localStorage.setItem('trackedPlayers', JSON.stringify(trackedPlayers));
      
      console.log(`✅ Quick-tracked player: ${player.name}`);
      return true;
    } catch (error) {
      console.error('Error in quick track:', error);
      return false;
    }
  }

  /**
   * Get canonical player by ID
   */
  getCanonicalPlayer(canonicalId: string): CanonicalPlayer | null {
    return this.canonicalPlayersCache.get(canonicalId) || null;
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.canonicalPlayersCache.clear();
    this.playerPropsCache.clear();
    this.searchIndexCache.clear();
  }
}

export const enhancedPlayerSearchService = new EnhancedPlayerSearchService();