/**
 * Roster Manager - Manages roster sync and provides easy access to player data
 */

import { rosterSyncService } from './rosterSyncService';

interface RosterSyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  totalTeams: number;
  totalPlayers: number;
  errors: string[];
}

class RosterManager {
  private syncStatus: RosterSyncStatus = {
    isRunning: false,
    lastSync: null,
    totalTeams: 0,
    totalPlayers: 0,
    errors: []
  };

  private readonly SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize roster manager and start automatic syncing
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Roster Manager...');

    // In production (static deployment), skip database operations
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Production mode: Using live APIs only (no database sync)');
      console.log('✅ Roster manager initialized for static deployment');
      return;
    }

    // Check if we need an initial sync
    const needsSync = await this.checkIfSyncNeeded();
    
    if (needsSync) {
      console.log('📊 No recent roster data found, starting initial sync...');
      await this.performFullSync();
    } else {
      console.log('✅ Recent roster data found, skipping initial sync');
    }

    // Start automatic daily sync
    this.startAutomaticSync();
    console.log('🔄 Automatic roster sync enabled (24 hour intervals)');
  }

  /**
   * Check if we need to sync rosters
   */
  private async checkIfSyncNeeded(): Promise<boolean> {
    // In static deployment (production), we always fetch fresh data from APIs
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Production mode: using live API data only');
      return false; // Don't sync to database, just use live APIs
    }

    try {
      const response = await fetch('/api/teams?limit=1');
      const data = await response.json();
      
      // If we have no teams or last sync was more than 24 hours ago
      if (!data.teams || data.teams.length === 0) {
        return true;
      }

      // Check if we have recent player data
      const playersResponse = await fetch('/api/players?limit=1');
      const playersData = await playersResponse.json();
      
      return !playersData.players || playersData.players.length === 0;

    } catch (error) {
      console.warn('⚠️ Could not check sync status, using live APIs only:', error);
      return false; // Use live APIs instead
    }
  }

  /**
   * Perform full roster sync for all sports
   */
  async performFullSync(): Promise<void> {
    if (this.syncStatus.isRunning) {
      console.log('⚠️ Roster sync already in progress, skipping...');
      return;
    }

    this.syncStatus.isRunning = true;
    this.syncStatus.errors = [];
    
    const startTime = Date.now();
    console.log('🔄 Starting complete roster sync for all sports...');

    try {
      // Perform the sync
      await rosterSyncService.syncAllRosters();
      
      // Update sync status
      this.syncStatus.lastSync = new Date();
      const duration = (Date.now() - startTime) / 1000;
      
      // Get updated counts
      await this.updateCounts();
      
      console.log(`✅ Roster sync completed successfully in ${duration.toFixed(1)}s`);
      console.log(`📊 Synced ${this.syncStatus.totalTeams} teams and ${this.syncStatus.totalPlayers} players`);

    } catch (error) {
      console.error('❌ Roster sync failed:', error);
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.syncStatus.isRunning = false;
    }
  }

  /**
   * Sync roster for a specific team
   */
  async syncTeam(teamId: string, sport: string): Promise<void> {
    console.log(`🔄 Syncing roster for team ${teamId} (${sport})...`);
    
    try {
      await rosterSyncService.syncTeamRoster(teamId, sport);
      console.log(`✅ Team roster synced successfully`);
    } catch (error) {
      console.error(`❌ Failed to sync team roster:`, error);
      throw error;
    }
  }

  /**
   * Get roster sync status
   */
  getSyncStatus(): RosterSyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Start automatic daily roster sync
   */
  private startAutomaticSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      console.log('🕐 Starting scheduled roster sync...');
      await this.performFullSync();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Stop automatic syncing
   */
  stopAutomaticSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('🛑 Automatic roster sync stopped');
    }
  }

  /**
   * Update team and player counts
   */
  private async updateCounts(): Promise<void> {
    try {
      const [teamsResponse, playersResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/players?limit=1')
      ]);

      const teamsData = await teamsResponse.json();
      const playersData = await playersResponse.json();

      this.syncStatus.totalTeams = teamsData.total || 0;
      this.syncStatus.totalPlayers = playersData.pagination?.total || 0;

    } catch (error) {
      console.warn('⚠️ Could not update roster counts:', error);
    }
  }

  /**
   * Get teams by sport/league
   */
  async getTeams(sport?: string, league?: string): Promise<any[]> {
    // In production, use cached roster data or return empty
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Production mode: teams data not available in static deployment');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (sport) params.append('sport', sport);
      if (league) params.append('league', league);

      const response = await fetch(`/api/teams?${params}`);
      const data = await response.json();
      
      return data.teams || [];
    } catch (error) {
      console.error('❌ Failed to fetch teams:', error);
      return [];
    }
  }

  /**
   * Get players for a team
   */
  async getTeamRoster(teamId: string): Promise<any[]> {
    if (process.env.NODE_ENV === 'production') {
      console.log('👥 Production mode: roster data not available in static deployment');
      return [];
    }

    try {
      const response = await fetch(`/api/players/team/${teamId}`);
      const data = await response.json();
      
      return data.players || [];
    } catch (error) {
      console.error('❌ Failed to fetch team roster:', error);
      return [];
    }
  }

  /**
   * Search players
   */
  async searchPlayers(query: string, sport?: string, league?: string): Promise<any[]> {
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Production mode: player search not available in static deployment');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (sport) params.append('sport', sport);
      if (league) params.append('league', league);

      const response = await fetch(`/api/players/search/${encodeURIComponent(query)}?${params}`);
      const data = await response.json();
      
      return data.players || [];
    } catch (error) {
      console.error('❌ Failed to search players:', error);
      return [];
    }
  }

  /**
   * Force immediate sync (for admin/debug)
   */
  async forceSyncNow(): Promise<void> {
    console.log('🔄 Force syncing rosters now...');
    await this.performFullSync();
  }

  /**
   * Get roster statistics
   */
  async getRosterStats(): Promise<any> {
    try {
      const [teamsResponse, playersResponse] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/players')
      ]);

      const teamsData = await teamsResponse.json();
      const playersData = await playersResponse.json();

      return {
        teams: {
          total: teamsData.total,
          bySport: teamsData.sports?.map((sport: string) => ({
            sport,
            count: teamsData.teams.filter((t: any) => t.sport === sport).length
          })) || [],
          byLeague: teamsData.leagues?.map((league: string) => ({
            league,
            count: teamsData.teams.filter((t: any) => t.league === league).length
          })) || []
        },
        players: {
          total: playersData.pagination?.total || 0,
          bySport: playersData.sports?.map((sport: string) => ({
            sport,
            count: playersData.players.filter((p: any) => p.team.sport === sport).length
          })) || [],
          byPosition: playersData.positions?.map((position: string) => ({
            position,
            count: playersData.players.filter((p: any) => p.position === position).length
          })) || []
        },
        syncStatus: this.getSyncStatus()
      };
    } catch (error) {
      console.error('❌ Failed to get roster stats:', error);
      return null;
    }
  }
}

export const rosterManager = new RosterManager();