/**
 * Simplified Games Tab - Clean, Fast, and User-Friendly
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService } from '../../../services/realTimeOddsService';
import { DateSelector } from '../../ui/DateSelector';
import { SearchBar } from '../../ui/SearchBar';
import { processGameData, formatOdds, ProcessedGame } from '../../../utils/gameDataHelper';
import { testOddsAPI } from '../../../utils/apiTester';
import { 
  Calendar,
  Clock,
  MapPin,
  Tv,
  Loader2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { SportsBettingLegend } from '../../ui/SportsBettingLegend';
import { TeamStatsModal } from '../../ui/TeamStatsModal';

import { useWidgetStore } from '../../../stores/widgetStore';
import { PlayerInsightModal } from '../../ui/PlayerInsightModal';



const SPORTS = [
  { id: 'all', name: 'All Sports', emoji: '🏆' },
  
  // Core US Sports Only
  { id: 'americanfootball_nfl', name: 'NFL', emoji: '🏈' },
  { id: 'basketball_nba', name: 'NBA', emoji: '🏀' },
  { id: 'americanfootball_ncaaf', name: 'College Football', emoji: '🏈' },
  { id: 'basketball_ncaab', name: 'College Basketball', emoji: '🏀' },
  { id: 'baseball_mlb', name: 'MLB', emoji: '⚾' },
  { id: 'boxing_boxing', name: 'Boxing', emoji: '🥊' }
];

const BOOKMAKERS = [
  { id: 'all', name: 'All Books', color: 'bg-slate-700' },
  { id: 'draftkings', name: 'DraftKings', color: 'bg-orange-600' },
  { id: 'fanduel', name: 'FanDuel', color: 'bg-blue-600' },
  { id: 'betmgm', name: 'BetMGM', color: 'bg-yellow-600' },
  { id: 'caesars', name: 'Caesars', color: 'bg-purple-600' },
  { id: 'unibet', name: 'Underdog Fantasy', color: 'bg-green-600' }
];

export const SimpleGamesTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' })
  ); // Use CST for consistency
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ type: 'all' as const, sport: 'all' as const });
  const [showOnlyUpcomingLive, setShowOnlyUpcomingLive] = useState(true); // Priority Fix #10: Filter AI Predictions by schedule
  const [showLegend, setShowLegend] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{name: string, logo: string, sport?: string} | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    name: string;
    team?: string;
    position?: string;
    sport?: string;
    id?: string;
  } | null>(null);

  // Refs for auto-scroll functionality - Priority Fix #11
  const gamesContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when filters change - Priority Fix #11
  const scrollToGamesTop = () => {
    if (gamesContainerRef.current) {
      gamesContainerRef.current.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
      console.log('🎯 Auto-scrolled to top of games list');
    }
  };

  // Auto-scroll when sport/bookmaker/date filters change
  useEffect(() => {
    scrollToGamesTop();
  }, [selectedSport, selectedBookmaker, selectedDate, showOnlyUpcomingLive]);

  const handleTeamClick = (teamName: string, teamLogo: string, sport?: string) => {
    console.log(`🎯🔍 TEAM CLICKED: "${teamName}" (Sport: ${sport || 'unknown'}) - Will be passed to appropriate sports data service`);
    setSelectedTeam({ name: teamName, logo: teamLogo, sport });
    
    // Priority Fix #11: Auto-scroll to top of modal content when team modal opens
    setTimeout(() => {
      const modalElement = document.getElementById('team-stats-modal-content');
      if (modalElement) {
        modalElement.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('🎯 Auto-scrolled to team stats modal content');
      }
    }, 100); // Small delay to ensure modal is rendered
  };

  // Test API on component mount (disabled to prevent rate limiting)
  useEffect(() => {
    // testOddsAPI(); // Commented out to reduce API calls
    console.log('🎯 SimpleGamesTab loaded - API testing disabled to prevent rate limiting');
  }, []);

  // Fetch games with proper error handling - no mock data used
  const { data: games = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-games-v4', selectedSport, selectedDate, selectedBookmaker, searchQuery, showOnlyUpcomingLive], // Include all filters in query key
    queryFn: async (): Promise<ProcessedGame[]> => {
      console.log(`🎯 Fetching games for sport: ${selectedSport}, date: ${selectedDate}`);
      
      try {
        // Try to fetch real data first
        console.log('🔄 Attempting to fetch live odds from The Odds API...');
        const allGames = await realTimeOddsService.getLiveOddsAllSports();
        console.log(`📊 Live API Response: ${allGames.length} real games received for today`);
        
        if (allGames.length > 0) {
          console.log('📋 Games breakdown by sport:');
          const sportCounts = allGames.reduce((acc: any, game: any) => {
            acc[game.sport] = (acc[game.sport] || 0) + 1;
            return acc;
          }, {});
          console.log(sportCounts);
        }
        
        // Always use real data from API, even if empty
        let rawGames = allGames;
        
        if (allGames.length === 0) {
          console.warn('⚠️ No live games currently scheduled from API - showing empty state');
          console.log('📅 Check back later for upcoming games or try a different sport/date');
          return []; // Return empty array instead of fake data
        } else {
          console.log('✅ Using live data from The Odds API');
        }
        
        // Process games using the helper
        let processedGames = processGameData(rawGames, selectedBookmaker);
        console.log(`🔧 Processing results: ${rawGames.length} raw -> ${processedGames.length} processed`);
        
        // Filter by sport if not 'all'
        if (selectedSport !== 'all') {
          const beforeSportFilter = processedGames.length;
          processedGames = processedGames.filter(game => 
            game.sport_key === selectedSport || game.sport === selectedSport
          );
          console.log(`🏈 Sport filter (${selectedSport}): ${beforeSportFilter} -> ${processedGames.length} games`);
        }

        // DEBUG: First let's see all the games and their dates without filtering
        console.log('🔍 DEBUGGING ALL GAMES AND DATES:');
        console.log(`📊 Total processed games before date filtering: ${processedGames.length}`);
        
        // Group games by date for better debugging
        const gamesByDate: { [date: string]: any[] } = {};
        processedGames.forEach((game, idx) => {
          if (game.commence_time) {
            const gameDateTime = new Date(game.commence_time);
            const cstDate = gameDateTime.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
            
            if (!gamesByDate[cstDate]) gamesByDate[cstDate] = [];
            gamesByDate[cstDate].push(game);
            
            console.log(`📊 Game ${idx + 1}: ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team} (${game.sport_key})`);
            console.log(`   Time: ${game.commence_time} -> CST Date: ${cstDate}`);
          }
        });
        
        console.log('📅 GAMES BY DATE:');
        Object.keys(gamesByDate).sort().forEach(date => {
          console.log(`📅 ${date}: ${gamesByDate[date].length} games`);
          gamesByDate[date].forEach(game => {
            console.log(`   - ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
          });
        });
        console.log(`🎯 User selected date: ${selectedDate}`);
        
        // Date filtering with improved logic for future dates
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); 
        console.log(`📅 Today's date (CST): ${today}, Selected date: ${selectedDate}`);
        
        const beforeFilter = processedGames.length;
        processedGames = processedGames.filter(game => {
          if (!game.commence_time) {
            console.log(`❌ Filtering out game with no commence_time: ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
            return false;
          }
          
          try {
            const gameDateTime = new Date(game.commence_time);
            if (isNaN(gameDateTime.getTime())) {
              console.log(`❌ Filtering out game with invalid date: ${game.commence_time}`);
              return false;
            }
            
            // Convert to YYYY-MM-DD format in CST (local time zone)
            const cstDate = gameDateTime.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
            
            // For today: show games on selected date + live/recent games
            // For future dates: show only games on that specific date
            const isSelectedDate = cstDate === selectedDate;
            const isToday = selectedDate === today;
            
            if (isToday) {
              // Today: show selected date games + live/recent games from other dates
              const now = new Date();
              const hoursSinceStart = (now.getTime() - gameDateTime.getTime()) / (1000 * 60 * 60);
              
              const isLive = game.status === 'live' || (hoursSinceStart >= 0 && hoursSinceStart < 4);
              const isRecentlyEnded = game.status === 'final' || (hoursSinceStart >= 4 && hoursSinceStart < 6);
              
              const shouldKeep = isSelectedDate || isLive || isRecentlyEnded;
              
              if (shouldKeep) {
                console.log(`✅ TODAY: Keeping game ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
                console.log(`   Game date: ${cstDate}, Selected: ${selectedDate}, Status: ${game.status || 'calculated'}`);
              }
              return shouldKeep;
            } else {
              // Future date: show only games on that exact date
              if (isSelectedDate) {
                console.log(`✅ FUTURE: Keeping game ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
                console.log(`   Game date: ${cstDate}, Selected: ${selectedDate}`);
              } else {
                console.log(`❌ FUTURE: Filtering out game ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
                console.log(`   Game date: ${cstDate} != Selected: ${selectedDate}`);
              }
              return isSelectedDate;
            }
            
          } catch (error) {
            console.error('Date filtering error:', error, game);
            return false;
          }
        });
        console.log(`📅 Enhanced filter result: ${beforeFilter} games → ${processedGames.length} games (including live/recent)`);

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          processedGames = processedGames.filter(game => 
(game.homeTeam || game.home_team).toLowerCase().includes(query) || 
            (game.awayTeam || game.away_team).toLowerCase().includes(query)
          );
        }

        // Priority Fix #10: Filter by schedule - only upcoming/live games (exclude final games)
        if (showOnlyUpcomingLive) {
          const beforeScheduleFilter = processedGames.length;
          processedGames = processedGames.filter(game => {
            if (!game.commence_time) return false;
            
            try {
              const gameTime = new Date(game.commence_time);
              const now = new Date();
              const timeDiff = gameTime.getTime() - now.getTime();
              const hoursUntilGame = timeDiff / (1000 * 60 * 60);
              
              // Game is live if it started within the last 4 hours and hasn't been over for more than 1 hour
              const isLive = hoursUntilGame <= 0 && hoursUntilGame >= -5;
              const isUpcoming = hoursUntilGame > 0;
              
              // Only show LIVE or UPCOMING games, exclude FINAL games
              const shouldShow = isLive || isUpcoming;
              
              if (!shouldShow) {
                console.log(`🚫 Schedule Filter: Excluding FINAL game ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
              }
              
              return shouldShow;
            } catch (error) {
              console.error('Schedule filtering error:', error, game);
              return false;
            }
          });
          console.log(`⏰ Schedule filter (upcoming/live only): ${beforeScheduleFilter} -> ${processedGames.length} games`);
        }

        console.log(`✅ Returning ${processedGames.length} processed games`);
        return processedGames;
        
      } catch (error) {
        console.error('❌ API Error - Failed to fetch live data:', error);
        console.log('🚫 NO MOCK DATA - Please check your internet connection and try again');
        // Return empty array - NO FAKE DATA
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes to prevent rate limiting
    staleTime: 2 * 60 * 1000, // 2 minute stale time
    cacheTime: 10 * 60 * 1000 // 10 minute cache
  });



  if (error) {
    return (
      <div className="p-8 text-center">
        <div 
          className="nova-card p-8 max-w-md mx-auto"
          style={{
            background: 'var(--nova-glass-bg)',
            border: '1px solid var(--nova-error)',
            backdropFilter: 'var(--nova-glass-backdrop)',
            WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
            borderRadius: 'var(--nova-radius-2xl)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div className="text-5xl mb-4">⚠️</div>
          <h3 
            className="font-bold text-lg mb-2"
            style={{ color: 'var(--nova-error)' }}
          >
            Unable to Load Games
          </h3>
          <p 
            className="text-sm mb-6"
            style={{ color: 'var(--nova-text-secondary)' }}
          >
            Please try refreshing or check back later
          </p>
          <button
            onClick={() => refetch()}
            className="nova-btn-primary"
            style={{
              background: 'var(--nova-error)',
              borderColor: 'var(--nova-error)'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle search
  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
    console.log(`🔍 Search result selected: ${result.type} - ${result.title}`);
    
    if (result.type === 'team') {
      // Open team stats modal for searched team
      setSelectedTeam({ 
        name: result.title, 
        sport: 'basketball_nba', // Default for team search - could be enhanced with sport detection
        logo: result.image || `data:image/svg+xml;base64,${btoa(`
          <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="#3B82F6"/>
            <text x="24" y="30" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
              ${result.title.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
            </text>
          </svg>
        `)}`
      });

      // Priority Fix #11: Auto-scroll to team modal content 
      setTimeout(() => {
        const modalElement = document.getElementById('team-stats-modal-content');
        if (modalElement) {
          modalElement.scrollTo({ top: 0, behavior: 'smooth' });
          console.log('🎯 Auto-scrolled to team stats modal content (from search)');
        }
      }, 100);

    } else if (result.type === 'player') {
      // Open Player Insight Modal for player clicks
      console.log(`🎯 PLAYER CLICKED FROM SEARCH: "${result.title}" - Opening Player Insight Modal`);
      const teamName = result.subtitle.split(' • ')[1] || 'Unknown';
      const position = result.subtitle.split(' • ')[0] || 'Unknown';
      
      setSelectedPlayer({
        name: result.title,
        team: teamName,
        position: position,
        sport: 'NBA', // Default - could be enhanced with sport detection from result data
        id: result.id
      });

      // Priority Fix #11: Auto-scroll to player modal content
      setTimeout(() => {
        const playerModalElement = document.getElementById('player-insight-modal-content');
        if (playerModalElement) {
          playerModalElement.scrollTo({ top: 0, behavior: 'smooth' });
          console.log('🎯 Auto-scrolled to player insight modal content (from search)');
        }
      }, 100);
    } else if (result.type === 'game') {
      // For games, could show game details or team comparison
      console.log(`🎮 Game selected: ${result.title}`);
    }
  };

  return (
    <div 
      className="w-full mx-auto flex flex-col gap-6 h-full overflow-hidden"
      style={{ 
        fontFamily: 'var(--nova-font-family)',
        color: 'var(--nova-text-primary)'
      }}
    >
      {/* Nova Titan Enhanced Controls */}
      <div 
        className="p-6 rounded-2xl mb-6 nova-animate-fade-in"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
          boxShadow: 'var(--nova-shadow-md)'
        }}
      >
        {/* Date Selector and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <SearchBar
            placeholder="Search teams or players..."
            onSearch={handleSearch}
            onResultSelect={handleSearchResultSelect}
            className="w-full"
          />
        </div>

        {/* Nova Titan Filters */}
        <div className="space-y-4">
          {/* Sport Filter */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                🏆 Sport:
              </span>
              <HelpTooltip 
                content="Filter games by sport league. Choose 'All Sports' to see games from all leagues." 
                position="top"
                size="md"
              />
            </div>
            <select
              value={selectedSport}
              onChange={(e) => {
                console.log(`🎯 Sport Filter: Selected ${e.target.value}`);
                setSelectedSport(e.target.value);
              }}
              className="nova-input w-full"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                color: 'var(--nova-text-primary)',
                fontSize: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--nova-radius-lg)',
                cursor: 'pointer',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
              }}
            >
              {SPORTS.map((sport) => (
                <option 
                  key={sport.id} 
                  value={sport.id}
                  style={{
                    background: 'var(--nova-surface)',
                    color: 'var(--nova-text-primary)'
                  }}
                >
                  {sport.emoji} {sport.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sportsbook Filter - Compact Dropdown */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                🏢 Sportsbook:
              </span>
              <HelpTooltip 
                content="Filter odds by sportsbook. Different sportsbooks offer different odds on the same games." 
                position="top"
                size="md"
              />
            </div>
            <select
              value={selectedBookmaker}
              onChange={(e) => {
                console.log(`🎯 Bookmaker Filter: Selected ${BOOKMAKERS.find(b => b.id === e.target.value)?.name} (${e.target.value})`);
                setSelectedBookmaker(e.target.value);
              }}
              className="nova-input w-full"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'var(--nova-card-border)',
                borderRadius: 'var(--nova-radius-lg)',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 'var(--nova-font-medium)',
                fontFamily: 'var(--nova-font-family)',
                color: 'var(--nova-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {BOOKMAKERS.map((book) => (
                <option 
                  key={book.id} 
                  value={book.id}
                  style={{
                    background: 'var(--nova-surface)',
                    color: 'var(--nova-text-primary)'
                  }}
                >
                  {book.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Fix #10: Schedule Filter - Only Upcoming/Live Games */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                ⏰ Schedule Filter:
              </span>
              <HelpTooltip 
                content="Show only upcoming and live games. Uncheck to include completed games." 
                position="top"
                size="md"
              />
            </div>
            <label 
              className="flex items-center gap-3 cursor-pointer"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'var(--nova-card-border)',
                borderRadius: 'var(--nova-radius-lg)',
                padding: '0.75rem 1rem',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={showOnlyUpcomingLive}
                onChange={(e) => {
                  console.log(`⏰ Schedule Filter: ${e.target.checked ? 'Enabled' : 'Disabled'} - showing ${e.target.checked ? 'upcoming/live only' : 'all games'}`);
                  setShowOnlyUpcomingLive(e.target.checked);
                }}
                className="w-4 h-4 accent-blue-500"
                style={{
                  accentColor: 'var(--nova-primary-500)'
                }}
              />
              <span 
                className="text-sm font-medium"
                style={{ 
                  color: 'var(--nova-text-primary)',
                  fontFamily: 'var(--nova-font-family)'
                }}
              >
                {showOnlyUpcomingLive ? '🟢 Upcoming & Live Games Only' : '🔴 Show All Games (Including Completed)'}
              </span>
            </label>
          </div>

          {/* Action Buttons with Enhanced Nova Titan Styling */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                console.log('📖 Opening betting guide...');
                setShowLegend(true);
              }}
              className="nova-btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Betting Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🔄 Refreshing games data and resetting filters...');
                setSelectedSport('all');
                setSelectedBookmaker('all');
                setSelectedDate(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }));
                setSearchQuery('');
                setShowOnlyUpcomingLive(true); // Reset to default (upcoming/live only)
                refetch();
                // Priority Fix #11: Auto-scroll to top after reset
                setTimeout(() => scrollToGamesTop(), 200);
              }}
              disabled={isLoading}
              className="nova-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              style={{
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>



      {/* Games Display - Flexible container */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center py-20"
          >
            <div 
              className="text-center nova-card p-8"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
                borderRadius: 'var(--nova-radius-2xl)'
              }}
            >
              <Loader2 
                className="h-16 w-16 animate-spin mx-auto mb-4"
                style={{ color: 'var(--nova-text-accent)' }}
              />
              <div 
                className="font-semibold text-lg mb-2"
                style={{ 
                  color: 'var(--nova-text-primary)',
                  fontFamily: 'var(--nova-font-family)'
                }}
              >
                Loading Live Games
              </div>
              <div 
                className="text-sm mb-4"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Fetching real-time sports data from The Odds API...
              </div>
              <div 
                className="flex items-center justify-center gap-2 text-xs"
                style={{ color: 'var(--nova-text-muted)' }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--nova-cyan-500)' }}></div>
                <span>NBA</span>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--nova-primary-500)', animationDelay: '0.2s' }}></div>
                <span>NFL</span>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--nova-purple-500)', animationDelay: '0.4s' }}></div>
                <span>College Sports</span>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--nova-cyan-500)', animationDelay: '0.6s' }}></div>
                <span>MLB & More</span>
              </div>
            </div>
          </motion.div>
        ) : games.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20"
          >
            <div 
              className="nova-card p-8 max-w-md mx-auto"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
                borderRadius: 'var(--nova-radius-2xl)'
              }}
            >
              <div className="text-6xl mb-4">🎯</div>
              <div 
                className="font-semibold text-lg mb-4"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                No Games Found
              </div>
              <div 
                className="text-sm mb-4"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                No live games currently scheduled for <strong>{selectedSport === 'all' ? 'any sport' : SPORTS.find(s => s.id === selectedSport)?.name || selectedSport.toUpperCase()}</strong> on <strong>{selectedDate}</strong>
              </div>
              <div 
                className="text-xs mb-6 px-4 py-3 rounded-lg"
                style={{ 
                  color: 'var(--nova-text-muted)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                💡 <strong>Tip:</strong> Try selecting a different sport, date, or bookmaker. All data is live from The Odds API with real-time updates.
              </div>
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedBookmaker('all');
                  setSelectedDate(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }));
                  setSearchQuery('');
                }}
                className="nova-btn-primary"
              >
                🔄 Reset to Today's Games
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="games"
            ref={gamesContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full overflow-y-auto mobile-scrollable prevent-horizontal-scroll"
            style={{
              width: '100%',
              maxWidth: '100%',
              overflowX: 'hidden', // Strengthen horizontal scroll prevention
              boxSizing: 'border-box'
            }}
          >
            <div 
              className="grid gap-4 pb-4 px-1 sm:px-0"
              style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden',
                boxSizing: 'border-box'
              }}
            >
            {games.map((game: ProcessedGame, index: number) => (
              <motion.div
                key={game.id || index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="nova-card nova-transition overflow-hidden min-w-0 hover:scale-[1.02]"
                style={{
                  background: 'var(--nova-glass-bg)',
                  border: 'var(--nova-card-border)',
                  backdropFilter: 'var(--nova-glass-backdrop)',
                  WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
                  boxShadow: 'var(--nova-shadow-lg)',
                  borderRadius: 'var(--nova-radius-xl)',
                  // Priority Fix #11: Prevent horizontal scroll in game cards
                  width: '100%',
                  maxWidth: '100%',
                  overflowX: 'hidden',
                  boxSizing: 'border-box'
                }}
                whileHover={{
                  boxShadow: 'var(--nova-shadow-xl)',
                  y: -4
                }}
              >
                {/* Game Header - Nova Titan Styling */}
                <div 
                  className="px-4 sm:px-6 py-4 sm:py-5"
                  style={{
                    background: 'linear-gradient(135deg, var(--nova-primary-900) 0%, var(--nova-dark-800) 100%)',
                    borderBottom: 'var(--nova-card-border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {(() => {
                        const gameTime = new Date(game.commence_time);
                        const now = new Date();
                        const timeDiff = gameTime.getTime() - now.getTime();
                        const hoursUntilGame = timeDiff / (1000 * 60 * 60);
                        
                        // Game is live if it started within the last 4 hours and hasn't been over for more than 1 hour
                        // Most sports games last 2-4 hours
                        const isLive = hoursUntilGame <= 0 && hoursUntilGame >= -5;
                        const isUpcoming = hoursUntilGame > 0;
                        
                        if (isLive) {
                          return (
                            <div 
                              className="text-xs px-3 py-1 rounded-full font-semibold animate-pulse nova-animate-glow"
                              style={{
                                background: 'linear-gradient(135deg, var(--nova-error) 0%, #ff6b6b 100%)',
                                color: 'var(--nova-text-primary)',
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
                              }}
                            >
                              🔴 LIVE
                            </div>
                          );
                        } else if (isUpcoming) {
                          return (
                            <div 
                              className="text-xs px-3 py-1 rounded-full font-semibold"
                              style={{
                                background: 'linear-gradient(135deg, var(--nova-success) 0%, #34d399 100%)',
                                color: 'var(--nova-text-primary)',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              ⏰ UPCOMING
                            </div>
                          );
                        } else {
                          return (
                            <div 
                              className="text-xs px-3 py-1 rounded-full font-semibold"
                              style={{
                                background: 'var(--nova-dark-600)',
                                color: 'var(--nova-text-secondary)'
                              }}
                            >
                              ✅ FINAL
                            </div>
                          );
                        }
                      })()}
                      {/* Sport Category Badge */}
                      <div className="text-xs px-2 py-1 bg-purple-600/80 text-purple-100 rounded font-medium">
                        {SPORTS.find(s => s.id === game.sport_key)?.name || 
                         game.sport || 
                         (game.sport_key === 'americanfootball_nfl' ? 'NFL' :
                          game.sport_key === 'basketball_nba' ? 'NBA' :
                          game.sport_key === 'americanfootball_ncaaf' ? 'CFB' :
                          game.sport_key === 'baseball_mlb' ? 'MLB' :
                          game.sport_key === 'boxing_boxing' ? 'Boxing' : 'Sports')}
                      </div>
                      <div className="text-slate-300 text-sm hidden sm:block">
                        {game.displayDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-100 font-semibold text-sm sm:text-base">{game.displayTime}</div>
                      <div className="text-xs text-slate-400">Central Time</div>
                    </div>
                  </div>
                  {/* Mobile Date Display */}
                  <div className="text-slate-300 text-sm mt-2 sm:hidden">
                    {game.displayDate}
                  </div>
                </div>

                {/* Teams - Mobile Optimized */}
                <div className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    {/* Away Team */}
                    <button 
                      onClick={() => handleTeamClick(game.away_team, game.awayTeamLogo, game.sport_key)}
                      className="flex items-center gap-2 sm:gap-4 flex-1 hover:bg-slate-700/30 rounded-lg p-2 -ml-2 transition-colors cursor-pointer group"
                    >
                      <img 
                        src={game.awayTeamLogo}
                        alt={game.away_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-600 bg-slate-700 group-hover:border-blue-500 transition-colors"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-semibold text-slate-100 text-sm sm:text-base truncate group-hover:text-blue-300 transition-colors max-w-[120px] sm:max-w-none" title={game.away_team}>{game.away_team}</div>
                        <div className="text-xs text-slate-400">Away • Click for stats</div>
                      </div>
                    </button>

                    {/* VS with Sport Category and Venue */}
                    <div className="flex flex-col items-center mx-2 sm:mx-4">
                      <div className="text-slate-500 text-lg sm:text-2xl font-bold">VS</div>
                      <div className="text-xs text-slate-400 mt-1 text-center">
                        <div className="hidden sm:block">
                          {SPORTS.find(s => s.id === game.sport_key)?.emoji || '🏆'}
                        </div>
                        {game.venue && (
                          <div className="text-xs text-slate-500 mt-1 max-w-20 truncate">
                            {game.venue}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Home Team */}
                    <button 
                      onClick={() => handleTeamClick(game.home_team, game.homeTeamLogo, game.sport_key)}
                      className="flex items-center gap-2 sm:gap-4 flex-1 justify-end hover:bg-slate-700/30 rounded-lg p-2 -mr-2 transition-colors cursor-pointer group"
                    >
                      <div className="text-right min-w-0 flex-1">
                        <div className="font-semibold text-slate-100 text-sm sm:text-base truncate group-hover:text-blue-300 transition-colors max-w-[120px] sm:max-w-none ml-auto" title={game.home_team}>{game.home_team}</div>
                        <div className="text-xs text-slate-400">Home • Click for stats</div>
                      </div>
                      <img 
                        src={game.homeTeamLogo}
                        alt={game.home_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-600 bg-slate-700 group-hover:border-blue-500 transition-colors"
                      />
                    </button>
                  </div>

                  {/* Enhanced Responsive Odds Display */}
                  {game.odds ? (
                    <div className="space-y-4">
                      {/* Mobile: Stacked Layout, Desktop: 3-Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* Moneyline */}
                        <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-xl p-3 sm:p-4 border border-slate-600/50 backdrop-blur-sm hover:border-green-500/50 transition-all group">
                          <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1 font-semibold">
                            💰 MONEYLINE
                            <HelpTooltip 
                              content="Bet on which team wins outright. Positive odds (+150) show profit on $100 bet. Negative odds (-200) show amount needed to win $100." 
                              position="top"
                              size="lg"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium truncate max-w-[120px]" title={game.away_team}>
                                {game.away_team}
                              </span>
                              <span className="text-green-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.moneyline?.away)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium truncate max-w-[120px]" title={game.home_team}>
                                {game.home_team}
                              </span>
                              <span className="text-green-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.moneyline?.home)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Spread */}
                        <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-xl p-3 sm:p-4 border border-slate-600/50 backdrop-blur-sm hover:border-blue-500/50 transition-all group">
                          <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1 font-semibold">
                            📊 SPREAD
                            <HelpTooltip 
                              content="Point spread betting. The favorite must win by more than the spread number. The underdog can lose by less than the spread or win outright." 
                              position="top"
                              size="lg"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium truncate max-w-[100px]" title={`${game.away_team} ${game.odds.spread?.line ? `+${Math.abs(game.odds.spread.line)}` : ''}`}>
                                <span className="block truncate">{game.away_team}</span>
                                <span className="text-xs text-blue-400">
                                  {game.odds.spread?.line ? `+${Math.abs(game.odds.spread.line)}` : ''}
                                </span>
                              </span>
                              <span className="text-blue-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.spread?.away)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium truncate max-w-[100px]" title={`${game.home_team} ${game.odds.spread?.line ? `-${Math.abs(game.odds.spread.line)}` : ''}`}>
                                <span className="block truncate">{game.home_team}</span>
                                <span className="text-xs text-blue-400">
                                  {game.odds.spread?.line ? `-${Math.abs(game.odds.spread.line)}` : ''}
                                </span>
                              </span>
                              <span className="text-blue-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.spread?.home)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-xl p-3 sm:p-4 border border-slate-600/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all group sm:col-span-2 lg:col-span-1">
                          <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1 font-semibold">
                            🎯 TOTAL {game.odds.total?.line ? `(${game.odds.total.line.toFixed(1)})` : ''}
                            <HelpTooltip 
                              content="Bet on the combined total points/goals scored by both teams. Choose 'Over' if you think the total will exceed the line, 'Under' if below." 
                              position="top"
                              size="lg"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium">
                                Over {game.odds.total?.line ? game.odds.total.line.toFixed(1) : ''}
                              </span>
                              <span className="text-yellow-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.total?.over)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-slate-800/50 rounded-lg px-2 py-1.5">
                              <span className="text-slate-200 font-medium">
                                Under {game.odds.total?.line ? game.odds.total.line.toFixed(1) : ''}
                              </span>
                              <span className="text-yellow-400 font-bold ml-2 flex-shrink-0">
                                {formatOdds(game.odds.total?.under)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 text-center">
                      <div className="text-slate-400 text-sm">Odds loading...</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Sports Betting Legend */}
      <SportsBettingLegend 
        isOpen={showLegend} 
        onClose={() => setShowLegend(false)} 
      />

      {/* Team Stats Modal */}
      <TeamStatsModal
        isOpen={selectedTeam !== null}
        onClose={() => setSelectedTeam(null)}
        teamName={selectedTeam?.name || ''}
        teamLogo={selectedTeam?.logo || ''}
        sport={selectedTeam?.sport}
        onViewFullStats={() => {
          console.log('Navigating to AI Insights for detailed stats...');
          useWidgetStore.getState().setSelectedTab('ai-insights');
        }}
        onPlayerProps={() => {
          console.log('Navigating to Player Props tab...');
          useWidgetStore.getState().setSelectedTab('player-props');
        }}
      />

      {/* Player Insight Modal */}
      <PlayerInsightModal
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
        playerName={selectedPlayer?.name || ''}
        team={selectedPlayer?.team}
        position={selectedPlayer?.position}
        sport={selectedPlayer?.sport}
        playerId={selectedPlayer?.id}
      />
    </div>
  );
};