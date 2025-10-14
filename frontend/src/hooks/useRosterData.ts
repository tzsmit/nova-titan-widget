/**
 * useRosterData Hook - Provides easy access to player and team roster data
 */

import { useQuery } from '@tanstack/react-query';
import { rosterManager } from '../services/rosterManager';

/**
 * Get teams by sport/league
 */
export function useTeams(sport?: string, league?: string) {
  return useQuery({
    queryKey: ['teams', sport, league],
    queryFn: () => rosterManager.getTeams(sport, league),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Get roster for a specific team
 */
export function useTeamRoster(teamId: string) {
  return useQuery({
    queryKey: ['team-roster', teamId],
    queryFn: () => rosterManager.getTeamRoster(teamId),
    enabled: !!teamId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Search players across all teams
 */
export function usePlayerSearch(query: string, sport?: string, league?: string) {
  return useQuery({
    queryKey: ['player-search', query, sport, league],
    queryFn: () => rosterManager.searchPlayers(query, sport, league),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Get roster sync status and statistics
 */
export function useRosterStats() {
  return useQuery({
    queryKey: ['roster-stats'],
    queryFn: () => rosterManager.getRosterStats(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 15 * 1000 // 15 seconds
  });
}

/**
 * Hook to trigger manual roster sync
 */
export function useRosterSync() {
  return {
    syncAll: () => rosterManager.forceSyncNow(),
    syncTeam: (teamId: string, sport: string) => rosterManager.syncTeam(teamId, sport),
    getStatus: () => rosterManager.getSyncStatus()
  };
}