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
  { id: 'caesars', name: 'Caesars', color: 'bg-purple-600' }
];

export const SimpleGamesTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ type: 'all' as const, sport: 'all' as const });
  const [showLegend, setShowLegend] = useState(false);

  // Test API on component mount (disabled to prevent rate limiting)
  useEffect(() => {
    // testOddsAPI(); // Commented out to reduce API calls
    console.log('🎯 SimpleGamesTab loaded - API testing disabled to prevent rate limiting');
  }, []);

  // Fetch games with proper error handling and fallback to mock data
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
            game.sport_key === selectedSport
          );
          console.log(`🏈 Sport filter (${selectedSport}): ${beforeSportFilter} -> ${processedGames.length} games`);
        }

        // Filter by date (October 2025) - ALWAYS apply date filter using CST
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); // YYYY-MM-DD in CST
        console.log(`📅 Today's date (CST): ${today}, Selected date: ${selectedDate}`);
        
        const beforeFilter = processedGames.length;
        processedGames = processedGames.filter(game => {
          if (!game.commence_time) {
            console.log(`❌ Game missing commence_time: ${game.away_team} @ ${game.home_team}`);
            return false;
          }
          
          // Convert game time to CST date
          const gameDate = new Date(game.commence_time).toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
          const matches = gameDate === selectedDate;
          
          // Log first few games and any matches for debugging
          if (processedGames.indexOf(game) < 3 || matches) {
            console.log(`📊 ${game.away_team} @ ${game.home_team}: ${game.commence_time} -> ${gameDate} (selected: ${selectedDate}) = ${matches}`);
          }
          
          return matches;
        });
        console.log(`📅 Date filter applied: ${beforeFilter} games → ${processedGames.length} games for ${selectedDate}`);

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          processedGames = processedGames.filter(game => 
            game.home_team.toLowerCase().includes(query) || 
            game.away_team.toLowerCase().includes(query)
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Controls */}
      <div className="mb-6 space-y-4">
        {/* Date Selector and Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DateSelector
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <SearchBar
            placeholder="Search teams or players..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>

        {/* Sport and Bookmaker Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Sport Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">Sport:</span>
            <HelpTooltip 
              content="Filter games by sport league. Choose 'All Sports' to see games from all leagues." 
              position="top"
              size="md"
            />
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
              {SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-all
                    ${selectedSport === sport.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  {sport.emoji} {sport.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmaker Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">Sportsbook:</span>
            <HelpTooltip 
              content="Filter odds by sportsbook. Different sportsbooks offer different odds on the same games." 
              position="top"
              size="md"
            />
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
              {BOOKMAKERS.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookmaker(book.id)}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-all
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

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowLegend(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Guide
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
            className="grid gap-4"
          >
            {games.map((game: ProcessedGame, index: number) => (
              <motion.div
                key={game.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-600 rounded-xl overflow-hidden hover:border-slate-500 transition-all"
              >
                {/* Game Header */}
                <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 bg-blue-600 text-white rounded font-medium">
                        LIVE
                      </div>
                      <div className="text-slate-300 text-sm">
                        {game.displayDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-100 font-semibold">{game.displayTime}</div>
                      <div className="text-xs text-slate-400">Central Time</div>
                    </div>
                  </div>
                </div>

                {/* Teams */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    {/* Away Team */}
                    <div className="flex items-center gap-4">
                      <img 
                        src={game.awayTeamLogo}
                        alt={game.away_team}
                        className="w-12 h-12 rounded-lg border border-slate-600 bg-slate-700"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const initials = game.away_team
                            .split(' ')
                            .filter(w => w.length > 0)
                            .map(w => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 3)
                            .replace(/[^A-Z0-9]/g, 'T');
                          img.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" fill="#1e293b"/>
                              <text x="24" y="30" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="bold">
                                ${initials}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <div>
                        <div className="font-semibold text-slate-100">{game.away_team}</div>
                        <div className="text-xs text-slate-400">Away</div>
                      </div>
                    </div>

                    <div className="text-slate-500 text-2xl font-bold">VS</div>

                    {/* Home Team */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-slate-100">{game.home_team}</div>
                        <div className="text-xs text-slate-400">Home</div>
                      </div>
                      <img 
                        src={game.homeTeamLogo}
                        alt={game.home_team}
                        className="w-12 h-12 rounded-lg border border-slate-600 bg-slate-700"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const initials = game.home_team
                            .split(' ')
                            .filter(w => w.length > 0)
                            .map(w => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 3)
                            .replace(/[^A-Z0-9]/g, 'T');
                          img.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" fill="#1e293b"/>
                              <text x="24" y="30" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" font-weight="bold">
                                ${initials}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                    </div>
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
    </div>
  );
};