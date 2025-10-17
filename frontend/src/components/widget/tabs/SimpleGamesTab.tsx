/**
 * Simplified Games Tab - Clean, Fast, and User-Friendly
 */

import React, { useState, useEffect } from 'react';
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
  const [showLegend, setShowLegend] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{name: string, logo: string} | null>(null);

  const handleTeamClick = (teamName: string, teamLogo: string) => {
    setSelectedTeam({ name: teamName, logo: teamLogo });
  };

  // Test API on component mount (disabled to prevent rate limiting)
  useEffect(() => {
    // testOddsAPI(); // Commented out to reduce API calls
    console.log('🎯 SimpleGamesTab loaded - API testing disabled to prevent rate limiting');
  }, []);

  // Fetch games with proper error handling - no mock data used
  const { data: games = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-games-v2', selectedSport, selectedDate, selectedBookmaker], // Added bookmaker to trigger re-query
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
        processedGames.forEach((game, idx) => {
          if (game.commence_time) {
            const gameDateTime = new Date(game.commence_time);
            const cstDate = gameDateTime.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
            const utcDate = gameDateTime.toISOString().split('T')[0];
            console.log(`📊 Game ${idx + 1}: ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
            console.log(`   Time: ${game.commence_time} -> CST: ${cstDate}, UTC: ${utcDate}`);
          }
        });
        
        // Enhanced filtering to keep live games visible
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); 
        console.log(`📅 Today's date (CST): ${today}, Selected date: ${selectedDate}`);
        
        const beforeFilter = processedGames.length;
        processedGames = processedGames.filter(game => {
          if (!game.commence_time) {
            return false;
          }
          
          try {
            const gameDateTime = new Date(game.commence_time);
            if (isNaN(gameDateTime.getTime())) {
              return false;
            }
            
            // Convert to YYYY-MM-DD format in CST (local time zone)
            const cstDate = gameDateTime.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
            
            // Enhanced logic: keep games visible if they are:
            // 1. On the selected date
            // 2. Live (started but not finished)
            // 3. Recently finished (within 6 hours)
            const isSelectedDate = cstDate === selectedDate;
            const now = new Date();
            const hoursSinceStart = (now.getTime() - gameDateTime.getTime()) / (1000 * 60 * 60);
            
            // Determine game status
            const isUpcoming = gameDateTime > now;
            const isLive = game.status === 'live' || (hoursSinceStart >= 0 && hoursSinceStart < 4);
            const isRecentlyEnded = game.status === 'final' || (hoursSinceStart >= 4 && hoursSinceStart < 6);
            
            // Keep games that match the selected date OR are currently live/recently ended
            const shouldKeep = isSelectedDate || isLive || (selectedDate === today && isRecentlyEnded);
            
            if (shouldKeep) {
              console.log(`✅ KEEPING GAME: ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`);
              console.log(`   Date: ${cstDate}, Status: ${game.status || 'calculated'}, Hours since start: ${hoursSinceStart.toFixed(1)}`);
            }
            
            return shouldKeep;
            
          } catch (error) {
            console.error('Date filtering error:', error);
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
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">Unable to Load Games</h3>
          <p className="text-red-300 text-sm mb-4">Please try refreshing or check back later</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
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
        logo: result.image || `data:image/svg+xml;base64,${btoa(`
          <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="#3B82F6"/>
            <text x="24" y="30" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
              ${result.title.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
            </text>
          </svg>
        `)}`
      });
    } else if (result.type === 'player') {
      // For now, just show team stats for the player's team
      // Extract team name from subtitle (e.g., "QB • Kansas City Chiefs")
      const teamName = result.subtitle.split(' • ')[1] || result.title;
      setSelectedTeam({ 
        name: teamName, 
        logo: result.image || `data:image/svg+xml;base64,${btoa(`
          <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="8" fill="#10B981"/>
            <text x="24" y="30" font-family="Arial" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
              ${result.title.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
            </text>
          </svg>
        `)}`
      });
    } else if (result.type === 'game') {
      // For games, could show game details or team comparison
      console.log(`🎮 Game selected: ${result.title}`);
    }
  };

  return (
    <div className="w-full max-w-screen-sm sm:max-w-screen-md mx-auto p-2 sm:p-4 flex flex-col gap-4">
      {/* Enhanced Controls - Mobile Optimized */}
      <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
        {/* Date Selector and Search Bar - Mobile First */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

        {/* Sport and Bookmaker Filters - Mobile Optimized */}
        <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-4 mb-3 md:mb-4">
          {/* Sport Filter - Mobile Stack */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Sport:</span>
              <HelpTooltip 
                content="Filter games by sport league. Choose 'All Sports' to see games from all leagues." 
                position="top"
                size="md"
              />
            </div>
            {/* Mobile-friendly sport selector */}
            <div className="grid grid-cols-2 sm:flex bg-slate-800 rounded-lg p-1 border border-slate-600 gap-1">
              {SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`
                    px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all text-center
                    ${selectedSport === sport.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  <span className="block sm:inline">{sport.emoji}</span>
                  <span className="hidden sm:inline ml-1">{sport.name}</span>
                  <span className="block sm:hidden text-xs">{sport.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bookmaker Filter - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm font-medium">Sportsbook:</span>
              <HelpTooltip 
                content="Filter odds by sportsbook. Different sportsbooks offer different odds on the same games." 
                position="top"
                size="md"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex bg-slate-800 rounded-lg p-1 border border-slate-600 gap-1">
              {BOOKMAKERS.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookmaker(book.id)}
                  className={`
                    px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all text-center
                    ${selectedBookmaker === book.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:ml-auto gap-2 sm:gap-3">
            <button
              onClick={() => setShowLegend(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm box-border"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guide</span>
              <span className="sm:hidden">Help</span>
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm box-border"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Games Display */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
              <div className="text-slate-300 font-medium">Loading games...</div>
            </div>
          </motion.div>
        ) : games.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="text-slate-400 mb-4">
              📅 No live games currently scheduled for {selectedSport === 'all' ? 'any sport' : SPORTS.find(s => s.id === selectedSport)?.name || selectedSport.toUpperCase()} on {selectedDate}
            </div>
            <div className="text-slate-500 text-sm mb-4">
              Try selecting a different sport or date. Real games are fetched from The Odds API.
            </div>
            <button
              onClick={() => {
                setSelectedSport('all');
                setSelectedBookmaker('all');
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Reset to Today's Games
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="games"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col gap-3 sm:gap-5 overflow-y-auto max-h-[60vh] sm:max-h-[70vh] p-2 sm:p-4"
          >
            {games.map((game: ProcessedGame, index: number) => (
              <motion.div
                key={game.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-card shadow-md overflow-hidden bg-slate-800/50 border border-slate-600 hover:border-slate-500 transition-all"
              >
                {/* Game Header - Mobile Optimized */}
                <div className="bg-slate-900/50 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-700">
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
                            <div className="text-xs px-2 py-1 bg-red-600 text-white rounded font-medium animate-pulse">
                              LIVE
                            </div>
                          );
                        } else if (isUpcoming) {
                          return (
                            <div className="text-xs px-2 py-1 bg-green-600 text-white rounded font-medium">
                              UPCOMING
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-xs px-2 py-1 bg-gray-600 text-white rounded font-medium">
                              FINAL
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
                      onClick={() => handleTeamClick(game.away_team, game.awayTeamLogo)}
                      className="flex items-center gap-2 sm:gap-4 flex-1 hover:bg-slate-700/30 rounded-lg p-2 -ml-2 transition-colors cursor-pointer group"
                    >
                      <img 
                        src={game.awayTeamLogo}
                        alt={game.away_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-600 bg-slate-700 group-hover:border-blue-500 transition-colors"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-semibold text-slate-100 text-sm sm:text-base truncate group-hover:text-blue-300 transition-colors">{game.away_team}</div>
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
                      onClick={() => handleTeamClick(game.home_team, game.homeTeamLogo)}
                      className="flex items-center gap-2 sm:gap-4 flex-1 justify-end hover:bg-slate-700/30 rounded-lg p-2 -mr-2 transition-colors cursor-pointer group"
                    >
                      <div className="text-right min-w-0 flex-1">
                        <div className="font-semibold text-slate-100 text-sm sm:text-base truncate group-hover:text-blue-300 transition-colors">{game.home_team}</div>
                        <div className="text-xs text-slate-400">Home • Click for stats</div>
                      </div>
                      <img 
                        src={game.homeTeamLogo}
                        alt={game.home_team}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-slate-600 bg-slate-700 group-hover:border-blue-500 transition-colors"
                      />
                    </button>
                  </div>

                  {/* Odds */}
                  {game.odds ? (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Moneyline */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                          MONEYLINE
                          <HelpTooltip 
                            content="Bet on which team wins outright. Positive odds (+150) show profit on $100 bet. Negative odds (-200) show amount needed to win $100." 
                            position="top"
                            size="lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">{game.away_team}</span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.moneyline?.away)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">{game.home_team}</span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.moneyline?.home)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Spread */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                          SPREAD
                          <HelpTooltip 
                            content="Point spread betting. The favorite must win by more than the spread number. The underdog can lose by less than the spread or win outright." 
                            position="top"
                            size="lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">
                              {game.away_team} {game.odds.spread?.line ? `+${Math.abs(game.odds.spread.line)}` : ''}
                            </span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.spread?.away)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">
                              {game.home_team} {game.odds.spread?.line ? `-${Math.abs(game.odds.spread.line)}` : ''}
                            </span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.spread?.home)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                          TOTAL {game.odds.total?.line ? `(${game.odds.total.line})` : ''}
                          <HelpTooltip 
                            content="Bet on the combined total points/goals scored by both teams. Choose 'Over' if you think the total will exceed the line, 'Under' if below." 
                            position="top"
                            size="lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Over</span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.total?.over)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Under</span>
                            <span className="text-green-400 font-semibold">
                              {formatOdds(game.odds.total?.under)}
                            </span>
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
          </motion.div>
        )}
      </AnimatePresence>

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
        onViewFullStats={() => {
          console.log('Navigating to AI Insights for detailed stats...');
          useWidgetStore.getState().setSelectedTab('ai-insights');
        }}
        onPlayerProps={() => {
          console.log('Navigating to Player Props tab...');
          useWidgetStore.getState().setSelectedTab('player-props');
        }}
      />
    </div>
  );
};