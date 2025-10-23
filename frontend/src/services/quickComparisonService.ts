/**
 * Quick Comparison Service - Dynamic comparison suggestions
 * Generate comparison options from live data and user tracking
 */

import { aiReasoningEngine } from './aiReasoningEngine';
import { realTimeOddsService } from './realTimeOddsService';

export interface ComparisonItem {
  id: string;
  name: string;
  type: 'player' | 'team';
  sport: string;
  team?: string;
}

export interface QuickComparison {
  id: string;
  title: string;
  items: ComparisonItem[];
  priority: number;
}

class QuickComparisonService {
  private cache: Map<string, { comparisons: QuickComparison[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  
  /**
   * Get dynamic quick comparison suggestions based on:
   * 1. User's tracked entities
   * 2. Live games happening today
   * 3. Popular matchups
   */
  async getQuickComparisons(): Promise<QuickComparison[]> {
    const cached = this.getFromCache('quick_comparisons');
    if (cached) {
      console.log('🔄 Quick Comparisons: Using cached suggestions');
      return cached;
    }

    try {
      console.log('🎯 Quick Comparisons: Generating dynamic suggestions...');
      
      const [trackedEntities, liveGames] = await Promise.allSettled([
        Promise.resolve(aiReasoningEngine.getTrackedEntities()),
        realTimeOddsService.getLiveOddsAllSports()
      ]);
      
      const comparisons: QuickComparison[] = [];
      
      // Generate from tracked entities
      if (trackedEntities.status === 'fulfilled') {
        comparisons.push(...this.generateTrackedComparisons(trackedEntities.value));
      }
      
      // Generate from live games
      if (liveGames.status === 'fulfilled' && liveGames.value?.length > 0) {
        comparisons.push(...this.generateLiveGameComparisons(liveGames.value));
      }
      
      // Add popular/default comparisons if needed
      if (comparisons.length < 3) {
        comparisons.push(...this.getPopularComparisons());
      }
      
      // Sort by priority and take top 6
      const sortedComparisons = comparisons
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 6);
      
      this.setCache('quick_comparisons', sortedComparisons);
      
      console.log(`✅ Quick Comparisons: Generated ${sortedComparisons.length} dynamic suggestions`);
      return sortedComparisons;
      
    } catch (error) {
      console.error('❌ Quick Comparisons generation failed:', error);
      return this.getPopularComparisons(); // Fallback to popular ones
    }
  }
  
  /**
   * Generate comparisons from user's tracked entities
   */
  private generateTrackedComparisons(trackedEntities: any): QuickComparison[] {
    const comparisons: QuickComparison[] = [];
    
    // Player vs Player comparisons from tracked players
    if (trackedEntities.players?.length >= 2) {
      const players = trackedEntities.players;
      
      // Find players in same sport for comparison
      const sportGroups = this.groupBySport(players);
      
      for (const [sport, sportPlayers] of Object.entries(sportGroups)) {
        if (sportPlayers.length >= 2) {
          const player1 = sportPlayers[0];
          const player2 = sportPlayers[1];
          
          comparisons.push({
            id: `tracked_players_${player1.name}_${player2.name}`,
            title: `${this.getFirstName(player1.name)} vs ${this.getFirstName(player2.name)}`,
            items: [
              {
                id: `player_${player1.name}`,
                name: player1.name,
                type: 'player',
                sport: player1.sport,
                team: player1.team
              },
              {
                id: `player_${player2.name}`,
                name: player2.name,
                type: 'player',
                sport: player2.sport,
                team: player2.team
              }
            ],
            priority: 10 // High priority for tracked entities
          });
        }
      }
    }
    
    // Team vs Team comparisons from tracked teams
    if (trackedEntities.teams?.length >= 2) {
      const teams = trackedEntities.teams;
      const sportGroups = this.groupBySport(teams);
      
      for (const [sport, sportTeams] of Object.entries(sportGroups)) {
        if (sportTeams.length >= 2) {
          const team1 = sportTeams[0];
          const team2 = sportTeams[1];
          
          comparisons.push({
            id: `tracked_teams_${team1.name}_${team2.name}`,
            title: `${this.getShortTeamName(team1.name)} vs ${this.getShortTeamName(team2.name)}`,
            items: [
              {
                id: `team_${team1.name}`,
                name: team1.name,
                type: 'team',
                sport: team1.sport
              },
              {
                id: `team_${team2.name}`,
                name: team2.name,
                type: 'team',
                sport: team2.sport
              }
            ],
            priority: 9 // High priority for tracked teams
          });
        }
      }
    }
    
    return comparisons;
  }
  
  /**
   * Generate comparisons from live games
   */
  private generateLiveGameComparisons(liveGames: any[]): QuickComparison[] {
    const comparisons: QuickComparison[] = [];
    
    // Get games happening today or soon
    const upcomingGames = liveGames.filter(game => {
      const gameTime = new Date(game.commence_time);
      const now = new Date();
      const hoursUntilGame = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilGame >= 0 && hoursUntilGame <= 24; // Within 24 hours
    });
    
    // Create team vs team comparisons for live games
    upcomingGames.slice(0, 3).forEach(game => {
      comparisons.push({
        id: `live_game_${game.id}`,
        title: `${this.getShortTeamName(game.away_team)} vs ${this.getShortTeamName(game.home_team)}`,
        items: [
          {
            id: `team_${game.away_team}`,
            name: game.away_team,
            type: 'team',
            sport: this.getSportFromKey(game.sport_key)
          },
          {
            id: `team_${game.home_team}`,
            name: game.home_team,
            type: 'team',
            sport: this.getSportFromKey(game.sport_key)
          }
        ],
        priority: 8 // Good priority for live games
      });
    });
    
    return comparisons;
  }
  
  /**
   * Get popular/default comparisons as fallback
   * These are based on well-known, frequently compared entities
   */
  private getPopularComparisons(): QuickComparison[] {
    return [
      {
        id: 'popular_nba_players',
        title: 'LeBron vs Curry',
        items: [
          { id: 'lebron', name: 'LeBron James', type: 'player', sport: 'NBA', team: 'Lakers' },
          { id: 'curry', name: 'Stephen Curry', type: 'player', sport: 'NBA', team: 'Warriors' }
        ],
        priority: 5
      },
      {
        id: 'popular_nba_teams',
        title: 'Lakers vs Warriors',
        items: [
          { id: 'lakers', name: 'Los Angeles Lakers', type: 'team', sport: 'NBA' },
          { id: 'warriors', name: 'Golden State Warriors', type: 'team', sport: 'NBA' }
        ],
        priority: 4
      },
      {
        id: 'popular_nfl_teams',
        title: 'Chiefs vs Bills',
        items: [
          { id: 'chiefs', name: 'Kansas City Chiefs', type: 'team', sport: 'NFL' },
          { id: 'bills', name: 'Buffalo Bills', type: 'team', sport: 'NFL' }
        ],
        priority: 4
      },
      {
        id: 'popular_nba_mvps',
        title: 'Tatum vs Dončić',
        items: [
          { id: 'tatum', name: 'Jayson Tatum', type: 'player', sport: 'NBA', team: 'Celtics' },
          { id: 'doncic', name: 'Luka Dončić', type: 'player', sport: 'NBA', team: 'Mavericks' }
        ],
        priority: 3
      }
    ];
  }
  
  /**
   * Helper methods
   */
  private groupBySport(entities: any[]): Record<string, any[]> {
    return entities.reduce((groups, entity) => {
      const sport = entity.sport;
      if (!groups[sport]) groups[sport] = [];
      groups[sport].push(entity);
      return groups;
    }, {} as Record<string, any[]>);
  }
  
  private getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }
  
  private getShortTeamName(teamName: string): string {
    // Extract the main team name (remove city)
    const parts = teamName.split(' ');
    return parts[parts.length - 1]; // Return last word (usually team name)
  }
  
  private getSportFromKey(sportKey: string): string {
    if (sportKey.includes('basketball')) return 'NBA';
    if (sportKey.includes('americanfootball_nfl')) return 'NFL';
    if (sportKey.includes('americanfootball_ncaaf')) return 'NCAAF';
    if (sportKey.includes('basketball_ncaab')) return 'NCAAB';
    if (sportKey.includes('baseball')) return 'MLB';
    if (sportKey.includes('hockey')) return 'NHL';
    return 'Sports';
  }
  
  /**
   * Cache management
   */
  private getFromCache(key: string): QuickComparison[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.comparisons;
    }
    this.cache.delete(key);
    return null;
  }
  
  private setCache(key: string, comparisons: QuickComparison[]): void {
    this.cache.set(key, {
      comparisons,
      timestamp: Date.now()
    });
  }
}

// Export instance
export const quickComparisonService = new QuickComparisonService();