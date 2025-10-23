import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Calendar, Users, Target, Trophy, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService, LiveOddsData } from '../../../services/realTimeOddsService';
import { playerDataService, PlayerData } from '../../../services/playerDataService';
import { betManagementService } from '../../../services/betManagementService';
import { enhancedPlayerSearchService, SearchResult as PlayerSearchResult } from '../../../services/enhancedPlayerSearchService';

interface SearchResult {
  id: string;
  type: 'game' | 'team' | 'player' | 'bet' | 'prop';
  title: string;
  subtitle: string;
  metadata: string;
  data: any;
  icon: React.ReactNode;
}

interface SimpleSearchComponentProps {
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

export const SimpleSearchComponent: React.FC<SimpleSearchComponentProps> = ({
  className = '',
  onResultSelect,
  placeholder = 'Search games, teams, players, or bets...'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch live games for search with enhanced stability
  const { data: liveGames = [] } = useQuery({
    queryKey: ['live-odds-search'],
    queryFn: async () => {
      try {
        console.log('🔍 Search: Fetching live games data...');
        const odds = await realTimeOddsService.getLiveOddsAllSports();
        console.log(`✅ Search: Loaded ${odds?.length || 0} games for search`);
        return odds || [];
      } catch (error) {
        console.warn('Search games fetch error:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disable automatic refetching
    enabled: query.length >= 2, // Only fetch when actually searching
    retry: 1, // Limit retries
  });

  // Enhanced search results with async canonical player search
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Async search function
  const performSearch = useCallback(async (searchQuery: string, category: string) => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const searchTerm = searchQuery.toLowerCase().trim();

    // PRIORITY 1: Search players FIRST with enhanced canonical database
    if (selectedCategory === 'all' || selectedCategory === 'players') {
      try {
        console.log(`🔍 Enhanced Canonical Search: Searching players for "${searchTerm}"`);
        const playerResults = await enhancedPlayerSearchService.searchPlayersWithCanonicalId(searchTerm);
        console.log(`✅ Enhanced Search: Found ${playerResults.length} canonical players`);
        
        playerResults.slice(0, 8).forEach((searchResult: PlayerSearchResult) => {
          const player = searchResult.player;
          results.push({
            id: player.canonicalId,
            type: 'player',
            title: player.name,
            subtitle: `${player.position} • ${player.team}`,
            metadata: `${player.jerseyNumber ? `#${player.jerseyNumber} ` : ''}${searchResult.matchReason}`,
            data: {
              canonicalId: player.canonicalId,
              name: player.name,
              team: player.team,
              position: player.position,
              sport: player.sport,
              jerseyNumber: player.jerseyNumber,
              quickActions: searchResult.quickActions,
              propsAvailable: player.propsAvailable,
              trackingEnabled: player.trackingEnabled
            },
            icon: <Target className="w-4 h-4 text-orange-400" />
          });
        });

        // Fallback to basic service for additional coverage
        if (results.length < 4) {
          const fallbackPlayers = playerDataService.searchPlayers(searchTerm);
          console.log(`🔄 Fallback search found ${fallbackPlayers.length} additional players`);
          
          fallbackPlayers.slice(0, 6).forEach(player => {
            // Check if already included from canonical search
            if (!results.some(r => r.title.toLowerCase() === player.name.toLowerCase())) {
              results.push({
                id: `fallback_${player.id}`,
                type: 'player',
                title: player.name,
                subtitle: `${player.position} • ${player.team}`,
                metadata: `${player.jerseyNumber ? `#${player.jerseyNumber} ` : ''}Player`,
                data: {
                  canonicalId: player.id,
                  name: player.name,
                  team: player.team,
                  position: player.position,
                  sport: 'NBA', // Default
                  jerseyNumber: player.jerseyNumber,
                  quickActions: [],
                  propsAvailable: true,
                  trackingEnabled: true
                },
                icon: <Target className="w-4 h-4 text-orange-400" />
              });
            }
          });
        }
        
      } catch (error) {
        console.warn('Enhanced canonical search error:', error);
        
        // Fallback to original search on error
        const players = playerDataService.searchPlayers(searchTerm);
        players.slice(0, 8).forEach(player => {
          results.push({
            id: `error_fallback_${player.id}`,
            type: 'player',
            title: player.name,
            subtitle: `${player.position} • ${player.team}`,
            metadata: `${player.jerseyNumber ? `#${player.jerseyNumber} ` : ''}Player`,
            data: player,
            icon: <Target className="w-4 h-4 text-orange-400" />
          });
        });
      }
    }

    // PRIORITY 2: Search games - using stable empty array if liveGames is undefined
    const games = Array.isArray(liveGames) ? liveGames : [];
    if ((selectedCategory === 'all' || selectedCategory === 'games') && query.length >= 2) {
      games.forEach((game, index) => {
        const homeTeam = game.home_team?.toLowerCase() || '';
        const awayTeam = game.away_team?.toLowerCase() || '';
        const sport = game.sport_key?.toLowerCase() || '';
        
        if (homeTeam.includes(searchTerm) || awayTeam.includes(searchTerm) || sport.includes(searchTerm)) {
          results.push({
            id: `game_${game.id || index}`,
            type: 'game',
            title: `${game.away_team} @ ${game.home_team}`,
            subtitle: new Date(game.commence_time).toLocaleDateString(),
            metadata: game.sport_title || 'Unknown Sport',
            data: game,
            icon: <Calendar className="w-4 h-4 text-blue-400" />
          });
        }
      });
    }

    // Search teams (from games)
    if (selectedCategory === 'all' || selectedCategory === 'teams') {
      const teams = new Set<string>();
      games.forEach(game => {
        if (game.home_team) teams.add(game.home_team);
        if (game.away_team) teams.add(game.away_team);
      });

      Array.from(teams).forEach(team => {
        if (team.toLowerCase().includes(searchTerm)) {
          const teamGames = games.filter(g => g.home_team === team || g.away_team === team);
          results.push({
            id: `team_${team}`,
            type: 'team',
            title: team,
            subtitle: `${teamGames.length} upcoming game${teamGames.length !== 1 ? 's' : ''}`,
            metadata: 'Team',
            data: { team, games: teamGames },
            icon: <Users className="w-4 h-4 text-green-400" />
          });
        }
      });
    }

    // Search players with enhanced NBA/NFL integration
    if (selectedCategory === 'all' || selectedCategory === 'players') {
      try {
        console.log(`🔍 SimpleSearch: Searching players for "${searchTerm}"`);
        const players = playerDataService.searchPlayers(searchTerm);
        console.log(`✅ SimpleSearch: Found ${players.length} players`);
        
        players.slice(0, 8).forEach(player => { // Limit to 8 results
          results.push({
            id: `player_${player.id}`,
            type: 'player',
            title: player.name,
            subtitle: `${player.position} • ${player.team}`,
            metadata: 'Player',
            data: player,
            icon: <Target className="w-4 h-4 text-orange-400" />
          });
        });
        
        // Add popular players for quick access
        const quickPlayers = [
          { id: 'lebron-quick', name: 'LeBron James', team: 'Lakers', position: 'SF' },
          { id: 'curry-quick', name: 'Stephen Curry', team: 'Warriors', position: 'PG' },
          { id: 'mahomes-quick', name: 'Patrick Mahomes', team: 'Chiefs', position: 'QB' },
          { id: 'allen-quick', name: 'Josh Allen', team: 'Bills', position: 'QB' },
          { id: 'sengun-quick', name: 'Alperen Şengün', team: 'Rockets', position: 'C' },
          { id: 'durant-quick', name: 'Kevin Durant', team: 'Suns', position: 'SF' },
          { id: 'doncic-quick', name: 'Luka Dončić', team: 'Mavericks', position: 'PG' }
        ].filter(p => p.name.toLowerCase().includes(searchTerm));
        
        quickPlayers.forEach(player => {
          if (!results.some(r => r.title === player.name)) {
            results.push({
              id: player.id,
              type: 'player',
              title: player.name,
              subtitle: `${player.position} • ${player.team}`,
              metadata: 'Star Player',
              data: player,
              icon: <Target className="w-4 h-4 text-orange-400" />
            });
          }
        });
      } catch (error) {
        console.warn('Player search error:', error);
        
        // Fallback popular players if search fails
        const fallbackPlayers = [
          { id: 'lebron-fallback', name: 'LeBron James', team: 'Lakers', position: 'SF' },
          { id: 'curry-fallback', name: 'Stephen Curry', team: 'Warriors', position: 'PG' },
          { id: 'durant-fallback', name: 'Kevin Durant', team: 'Suns', position: 'SF' }
        ].filter(p => p.name.toLowerCase().includes(searchTerm));
        
        fallbackPlayers.forEach(player => {
          results.push({
            id: player.id,
            type: 'player',
            title: player.name,
            subtitle: `${player.position} • ${player.team}`,
            metadata: 'Popular Player',
            data: player,
            icon: <Target className="w-4 h-4 text-orange-400" />
          });
        });
      }
    }

    // Search current bets
    if (selectedCategory === 'all' || selectedCategory === 'bets') {
      try {
        const bets = betManagementService.searchBets(searchTerm);
        bets.slice(0, 5).forEach((bet, index) => {
          if ('legs' in bet) {
            // It's a parlay
            results.push({
              id: `parlay_${bet.id}`,
              type: 'bet',
              title: `${bet.legs.length}-Leg Parlay`,
              subtitle: `$${bet.stake} stake • ${bet.legs.length} selections`,
              metadata: 'Parlay',
              data: bet,
              icon: <Trophy className="w-4 h-4 text-yellow-400" />
            });
          } else {
            // It's a single bet
            results.push({
              id: `bet_${bet.id}`,
              type: 'bet',
              title: bet.description,
              subtitle: bet.team,
              metadata: 'Single Bet',
              data: bet,
              icon: <Zap className="w-4 h-4 text-purple-400" />
            });
          }
        });
      } catch (error) {
        console.warn('Bet search error:', error);
      }
    }

    setSearchResults(results.slice(0, 20)); // Limit total results
  }, [liveGames]);

  // Trigger search when query or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 1) {
        performSearch(query, selectedCategory);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, selectedCategory, performSearch]);

  // Use keyboard navigation
  useSearchKeyboard(isOpen, () => setIsOpen(false));

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    // Enhanced navigation for teams and players
    if (result.type === 'team' || result.type === 'player') {
      // Show navigation options modal/dropdown
      const options = [];
      
      if (result.type === 'team') {
        options.push(
          { label: 'View Team Stats', action: () => navigateToTeamStats(result.data) },
          { label: 'Player Props for Team', action: () => navigateToTeamPlayerProps(result.data) },
          { label: 'Parlays with Team', action: () => navigateToTeamParlays(result.data) }
        );
      } else if (result.type === 'player') {
        // Enhanced player actions with canonical ID support
        const playerData = result.data;
        console.log(`🎯 Enhanced Player Click: ${playerData.name} (Canonical ID: ${playerData.canonicalId})`);
        
        options.push(
          { label: 'View Player Insights', action: () => navigateToPlayerStats(playerData) },
          { label: 'Player Props', action: () => navigateToPlayerProps(playerData) },
          { label: 'Quick Track', action: () => quickTrackPlayer(playerData) },
          { label: 'Parlays with Player', action: () => navigateToPlayerParlays(playerData) }
        );
      }
      
      // For now, we'll trigger the callback with navigation info
      if (onResultSelect) {
        onResultSelect({
          ...result,
          navigationOptions: options
        });
      }
    } else {
      if (onResultSelect) {
        onResultSelect(result);
      }
    }
  };

  // Navigation helper functions
  const navigateToTeamStats = (teamData: any) => {
    console.log('Navigate to team stats:', teamData);
    // Would navigate to team stats view
  };

  const navigateToTeamPlayerProps = (teamData: any) => {
    console.log('Navigate to team player props:', teamData);
    // Would navigate to player props filtered by team
  };

  const navigateToTeamParlays = (teamData: any) => {
    console.log('Navigate to team parlays:', teamData);
    // Would navigate to parlays featuring this team
  };

  const navigateToPlayerStats = (playerData: any) => {
    console.log('Navigate to player insights:', playerData);
    // Trigger the onResultSelect with enhanced player data for modal opening
    if (onResultSelect) {
      onResultSelect({
        id: playerData.canonicalId || playerData.id,
        type: 'player',
        title: playerData.name,
        subtitle: `${playerData.position} • ${playerData.team}`,
        metadata: 'Player Insights',
        data: playerData
      });
    }
  };

  const navigateToPlayerProps = (playerData: any) => {
    console.log('Navigate to player props:', playerData);
    // Could switch to player props tab and filter by this player
    // For now, we'll just show the result selection
    if (onResultSelect) {
      onResultSelect({
        id: playerData.canonicalId || playerData.id,
        type: 'player_props',
        title: `${playerData.name} Props`,
        subtitle: `View betting lines for ${playerData.name}`,
        metadata: 'Player Props',
        data: playerData
      });
    }
  };

  const quickTrackPlayer = async (playerData: any) => {
    console.log('Quick track player:', playerData);
    try {
      if (playerData.canonicalId) {
        const success = await enhancedPlayerSearchService.quickTrackPlayer(playerData.canonicalId);
        if (success) {
          console.log(`✅ Successfully quick-tracked ${playerData.name}`);
          // Could show a toast notification here
        } else {
          console.log(`ℹ️ Player ${playerData.name} already tracked or tracking failed`);
        }
      } else {
        // Fallback for non-canonical players
        const trackedPlayers = JSON.parse(localStorage.getItem('trackedPlayers') || '[]');
        const isAlreadyTracked = trackedPlayers.some((p: any) => p.name === playerData.name);
        
        if (!isAlreadyTracked) {
          trackedPlayers.push({
            id: playerData.id || `quick_${Date.now()}`,
            name: playerData.name,
            team: playerData.team,
            position: playerData.position,
            sport: playerData.sport || 'NBA',
            addedAt: new Date().toISOString(),
            quickTrack: true
          });
          localStorage.setItem('trackedPlayers', JSON.stringify(trackedPlayers));
          console.log(`✅ Successfully quick-tracked ${playerData.name} (fallback)`);
        }
      }
    } catch (error) {
      console.error('Error quick tracking player:', error);
    }
  };

  const navigateToPlayerParlays = (playerData: any) => {
    console.log('Navigate to player parlays:', playerData);
    // Could switch to parlays tab with this player pre-selected
    if (onResultSelect) {
      onResultSelect({
        id: playerData.canonicalId || playerData.id,
        type: 'parlay',
        title: `Parlay with ${playerData.name}`,
        subtitle: `Create parlays featuring ${playerData.name}`,
        metadata: 'Parlay Builder',
        data: playerData
      });
    }
  };

  const categories = [
    { id: 'all', label: 'All', count: searchResults.length },
    { id: 'games', label: 'Games', count: searchResults.filter(r => r.type === 'game').length },
    { id: 'teams', label: 'Teams', count: searchResults.filter(r => r.type === 'team').length },
    { id: 'players', label: 'Players', count: searchResults.filter(r => r.type === 'player').length },
    { id: 'bets', label: 'Bets', count: searchResults.filter(r => r.type === 'bet').length },
  ];

  const filteredResults = selectedCategory === 'all' 
    ? searchResults 
    : searchResults.filter(r => {
        if (selectedCategory === 'games') return r.type === 'game';
        if (selectedCategory === 'teams') return r.type === 'team';
        if (selectedCategory === 'players') return r.type === 'player';
        if (selectedCategory === 'bets') return r.type === 'bet';
        return true;
      });

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
          style={{ color: 'var(--nova-text-muted)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="nova-search-input pl-10 pr-10 py-3"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded nova-transition"
            style={{
              color: 'var(--nova-text-muted)',
              ':hover': { backgroundColor: 'var(--nova-glass-border)' }
            }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="backdrop-blur-md rounded-xl shadow-2xl max-h-96 overflow-hidden"
            style={{
              background: 'var(--nova-glass-bg)',
              border: 'var(--nova-card-border)',
              boxShadow: 'var(--nova-shadow-xl)',
              zIndex: 2100, // Higher than header (2000) but reasonable
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              width: '100%'
            }}
          >
            {/* Category Filters */}
            <div 
              className="flex items-center space-x-1 p-3"
              style={{ borderBottom: 'var(--nova-card-border)' }}
            >
              <Filter 
                className="w-4 h-4 mr-2" 
                style={{ color: 'var(--nova-text-muted)' }}
              />
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔍 Search: Category selected: ${category.id}`);
                    setSelectedCategory(category.id);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-medium nova-transition border-0 cursor-pointer"
                  style={{
                    background: selectedCategory === category.id
                      ? 'var(--nova-interactive-default)'
                      : 'var(--nova-glass-border)',
                    color: selectedCategory === category.id
                      ? 'var(--nova-text-primary)'
                      : 'var(--nova-text-secondary)',
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                >
                  {category.label} {category.count > 0 && `(${category.count})`}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="p-2">
                  {filteredResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(`🔍 Search: Result clicked: ${result.title}`);
                          handleResultClick(result);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg nova-transition text-left group border-0 cursor-pointer"
                        style={{
                          background: 'transparent',
                          zIndex: 10000,
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--nova-glass-border)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div className="flex-shrink-0">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-medium nova-transition truncate"
                            style={{ 
                              color: 'var(--nova-text-primary)',
                              groupHover: { color: 'var(--nova-text-accent)' }
                            }}
                          >
                            {result.title}
                          </div>
                          <div 
                            className="text-sm truncate"
                            style={{ color: 'var(--nova-text-secondary)' }}
                          >
                            {result.subtitle}
                          </div>
                          {result.type === 'player' && (
                            <div 
                              className="text-xs mt-1 flex items-center gap-2"
                              style={{ color: 'var(--nova-text-accent)' }}
                            >
                              <span>Click for insights & quick-track →</span>
                              {result.data?.propsAvailable && (
                                <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400 rounded text-xs">Props Available</span>
                              )}
                              {result.data?.canonicalId && (
                                <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">Enhanced</span>
                              )}
                            </div>
                          )}
                          {result.type === 'team' && (
                            <div 
                              className="text-xs mt-1"
                              style={{ color: 'var(--nova-text-accent)' }}
                            >
                              Click for team stats & analysis →
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              color: 'var(--nova-text-muted)',
                              backgroundColor: 'var(--nova-glass-border)'
                            }}
                          >
                            {result.metadata}
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Search 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: 'var(--nova-text-muted)' }}
                  />
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--nova-text-secondary)' }}
                  >
                    No results found for "{query}"
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: 'var(--nova-text-muted)' }}
                  >
                    Try searching for team names, player names, or sports
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="p-3"
              style={{ 
                borderTop: 'var(--nova-card-border)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                className="flex items-center justify-between text-xs"
                style={{ color: 'var(--nova-text-muted)' }}
              >
                <span>
                  {filteredResults.length > 0 
                    ? `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} found`
                    : 'Search across games, teams, players & bets'
                  }
                </span>
                <span>Press ESC to close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close - with proper z-index management */}
      {isOpen && (
        <div 
          className="fixed inset-0"
          style={{ zIndex: 2050 }} // Below search dropdown (2100) but above header (2000)
          onClick={() => {
            console.log('🔍 Search: Click outside detected, closing dropdown');
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Internal keyboard navigation hook - not exported to fix HMR issues
const useSearchKeyboard = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};