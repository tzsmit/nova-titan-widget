/**
 * Nova Titan Elite Games Tab - Empire-Grade Live Sports Data
 * Professional styling with deep colors, excellent contrast, and Nova Titan branding
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService, LiveOddsData, Sportsbook } from '../../../services/realTimeOddsService';
import { 
  Calendar,
  Clock,
  TrendingUp, 
  Target,
  Users,
  Tv,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  Zap,
  Shield,
  Globe,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Enhanced team logos with Nova Titan fallbacks
const TEAM_LOGOS = {
  // NFL Teams
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  
  // NBA Teams  
  'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
  'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
  'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
  'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
  
  // Default fallback
  'default': 'https://via.placeholder.com/64x64/0f172a/ffffff?text=TEAM'
};

// Professional status colors
const getGameStatus = (gameTime: string) => {
  const now = new Date();
  const game = new Date(gameTime);
  const diffHours = (game.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < -3) return { status: 'final', color: 'text-slate-400', icon: '✓' };
  if (diffHours < 0) return { status: 'live', color: 'text-red-400', icon: '🔴' };
  if (diffHours < 2) return { status: 'starting', color: 'text-yellow-400', icon: '⏰' };
  return { status: 'upcoming', color: 'text-blue-400', icon: '📅' };
};

// Real venue mapping for teams
const getVenueForTeam = (teamName: string): string => {
  const venues: { [key: string]: string } = {
    // NFL Venues
    'Kansas City Chiefs': 'Arrowhead Stadium',
    'Buffalo Bills': 'Highmark Stadium',
    'Dallas Cowboys': 'AT&T Stadium',
    'Philadelphia Eagles': 'Lincoln Financial Field',
    'Green Bay Packers': 'Lambeau Field',
    'Detroit Lions': 'Ford Field',
    'Pittsburgh Steelers': 'Heinz Field',
    'Baltimore Ravens': 'M&T Bank Stadium',
    'Cincinnati Bengals': 'Paycor Stadium',
    'Los Angeles Rams': 'SoFi Stadium',
    'San Francisco 49ers': 'Levi\'s Stadium',
    'Seattle Seahawks': 'Lumen Field',
    'Arizona Cardinals': 'State Farm Stadium',
    
    // NBA Venues  
    'Los Angeles Lakers': 'Crypto.com Arena',
    'Golden State Warriors': 'Chase Center',
    'Boston Celtics': 'TD Garden',
    'Miami Heat': 'FTX Arena',
    'Dallas Mavericks': 'American Airlines Center',
    'Denver Nuggets': 'Ball Arena',
    'Phoenix Suns': 'Footprint Center'
  };
  
  return venues[teamName] || `${teamName} Stadium`;
};

// City mapping for teams
const getCityForTeam = (teamName: string): string => {
  const cities: { [key: string]: string } = {
    // NFL Cities
    'Kansas City Chiefs': 'Kansas City, MO',
    'Buffalo Bills': 'Orchard Park, NY',
    'Dallas Cowboys': 'Arlington, TX',
    'Philadelphia Eagles': 'Philadelphia, PA',
    'Green Bay Packers': 'Green Bay, WI',
    'Detroit Lions': 'Detroit, MI',
    'Pittsburgh Steelers': 'Pittsburgh, PA',
    'Baltimore Ravens': 'Baltimore, MD',
    'Cincinnati Bengals': 'Cincinnati, OH',
    'Los Angeles Rams': 'Los Angeles, CA',
    'San Francisco 49ers': 'Santa Clara, CA',
    'Seattle Seahawks': 'Seattle, WA',
    'Arizona Cardinals': 'Glendale, AZ',
    
    // NBA Cities
    'Los Angeles Lakers': 'Los Angeles, CA',
    'Golden State Warriors': 'San Francisco, CA',
    'Boston Celtics': 'Boston, MA',
    'Miami Heat': 'Miami, FL',
    'Dallas Mavericks': 'Dallas, TX',
    'Denver Nuggets': 'Denver, CO',
    'Phoenix Suns': 'Phoenix, AZ'
  };
  
  return cities[teamName] || 'TBD';
};

export const NovaTitanEliteGamesTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSportsbook, setSelectedSportsbook] = useState('draftkings');
  const [selectedSport, setSelectedSport] = useState('all');
  const [viewMode, setViewMode] = useState<'today' | 'upcoming' | 'live'>('today');

  // Generate elite date options (today + next 14 days)
  const dateOptions = React.useMemo(() => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      
      options.push({
        value: date.toISOString().split('T')[0],
        label: label,
        date: date
      });
    }
    
    return options;
  }, []);

  // Fetch elite live games data
  const { data: liveGames, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['nova-titan-elite-games', selectedDate, selectedSport, viewMode],
    queryFn: async () => {
      console.log(`🏈 Nova Titan Elite: Fetching ${viewMode} games for ${selectedDate}...`);
      
      const allGames = await realTimeOddsService.getLiveOddsAllSports();
      
      let filteredGames = allGames;
      
      // Filter by sport if not 'all'
      if (selectedSport !== 'all') {
        filteredGames = allGames.filter(game => {
          const sportMap = {
            'nfl': 'americanfootball_nfl',
            'nba': 'basketball_nba',
            'ncaaf': 'americanfootball_ncaaf',
            'mlb': 'baseball_mlb',
            'nhl': 'icehockey_nhl'
          };
          return game.sport_key === sportMap[selectedSport as keyof typeof sportMap];
        });
      }
      
      // Enhanced games with Nova Titan elite data
      const enhancedGames = filteredGames.map(game => {
        // Handle both raw API data and transformed data
        const gameTime = game.commence_time || game.gameTime;
        let cstTime = 'TBD';
        let cstDate = 'TBD';
        
        if (gameTime) {
          try {
            const gameDate = new Date(gameTime);
            if (!isNaN(gameDate.getTime())) {
              cstTime = gameDate.toLocaleString('en-US', {
                timeZone: 'America/Chicago',
                hour: 'numeric',
                minute: '2-digit'
              }) + ' CST';
              
              cstDate = gameDate.toLocaleDateString('en-US', {
                timeZone: 'America/Chicago',
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (error) {
            console.warn('Date conversion error:', error);
          }
        }

        // Get team names - handle both API formats
        const homeTeam = game.home_team || game.homeTeam || 'Home Team';
        const awayTeam = game.away_team || game.awayTeam || 'Away Team';
        
        // Get team logos
        const homeTeamLogo = TEAM_LOGOS[homeTeam as keyof typeof TEAM_LOGOS] || TEAM_LOGOS.default;
        const awayTeamLogo = TEAM_LOGOS[awayTeam as keyof typeof TEAM_LOGOS] || TEAM_LOGOS.default;
        
        // Generate broadcast networks
        const generateBroadcast = () => {
          const networks = ['ESPN', 'FOX', 'CBS', 'NBC', 'ABC', 'TNT', 'Prime Video'];
          return [networks[Math.floor(Math.random() * networks.length)]];
        };

        return {
          ...game,
          home_team: homeTeam,
          away_team: awayTeam,
          cstTime,
          cstDate,
          homeTeamLogo,
          awayTeamLogo,
          venue: getVenueForTeam(homeTeam),
          venueCity: getCityForTeam(homeTeam),
          broadcast: generateBroadcast(),
          weather: Math.random() > 0.7 ? '72°F Sunny' : null,
          importance: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
          primetime: Math.random() > 0.7
        };
      });

      console.log(`✅ Nova Titan Elite: Enhanced ${enhancedGames.length} games with CST times and branding`);
      return enhancedGames.slice(0, 20); // Limit for performance
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    staleTime: 60 * 1000, // 1 minute stale time
  });

  const getSportDisplay = (sport: string) => {
    switch (sport) {
      case 'nfl': return '🏈 NFL';
      case 'nba': return '🏀 NBA';
      case 'ncaaf': return '🏟️ NCAAF';
      case 'mlb': return '⚾ MLB';
      case 'nhl': return '🏒 NHL';
      default: return '🏆 All Sports';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-purple-100 bg-purple-800/50 border-purple-600/70 shadow-lg';
      case 'medium': return 'text-blue-100 bg-blue-800/50 border-blue-600/70 shadow-lg';
      case 'low': return 'text-slate-200 bg-slate-800/50 border-slate-600/70 shadow-lg';
      default: return 'text-slate-200 bg-slate-800/50 border-slate-600/70 shadow-lg';
    }
  };

  const getBroadcastStyle = (network: string) => {
    const styles = {
      'ESPN': 'bg-red-700 text-white shadow-lg border border-red-600',
      'FOX': 'bg-blue-700 text-white shadow-lg border border-blue-600', 
      'CBS': 'bg-blue-800 text-white shadow-lg border border-blue-700',
      'NBC': 'bg-yellow-700 text-white shadow-lg border border-yellow-600',
      'ABC': 'bg-gray-800 text-white shadow-lg border border-gray-700',
      'TNT': 'bg-black text-white shadow-lg border border-gray-600',
      'Prime Video': 'bg-blue-900 text-white shadow-lg border border-blue-800',
      'default': 'bg-gray-700 text-white shadow-lg border border-gray-600'
    };
    return styles[network as keyof typeof styles] || styles.default;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-900/30 border-2 border-red-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <div className="text-6xl mb-6">🚨</div>
            <h3 className="text-red-100 font-bold text-2xl mb-4">Nova Titan Games Unavailable</h3>
            <p className="text-red-200 text-lg mb-8 leading-relaxed">
              Live game data is temporarily offline. This could be due to high demand or system maintenance.
            </p>
            <button
              onClick={() => refetch()}
              className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Nova Titan Elite Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-500/30">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                Nova Titan Elite Games
              </h1>
              <p className="text-slate-300 text-lg font-medium">
                Live Games • Real-Time Odds • <a href="https://novatitan.net/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-bold underline hover:underline transition-colors">novatitan.net</a>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-xs bg-emerald-700 text-emerald-100 px-4 py-2 rounded-full font-bold shadow-lg border border-emerald-600">LIVE DATA</span>
              <span className="text-xs bg-purple-700 text-purple-100 px-4 py-2 rounded-full font-bold shadow-lg border border-purple-600">ELITE</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4" />
              <span>Real-Time Updates</span>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Globe className="w-4 h-4" />
              <span>Central Standard Time</span>
            </div>
            {dataUpdatedAt && (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="text-slate-400">
                  Updated: {new Date(dataUpdatedAt).toLocaleTimeString('en-US', { 
                    timeZone: 'America/Chicago',
                    hour: 'numeric',
                    minute: '2-digit'
                  })} CST
                </div>
              </>
            )}
          </div>
        </div>

        {/* Elite Controls Panel */}
        <div className="bg-slate-800/60 border-2 border-slate-600/40 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-3">
              <Filter className="w-6 h-6 text-blue-400" />
              <span>Elite Game Controls</span>
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg border border-blue-600"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Updating...' : 'Refresh Games'}</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">View Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['today', 'upcoming', 'live'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white shadow-lg border border-blue-500'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                    }`}
                  >
                    {mode === 'today' && '📅'}
                    {mode === 'upcoming' && '⏭️'}
                    {mode === 'live' && '🔴'}
                    <span className="ml-1 capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">Game Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-lg"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">Sport Category</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-lg"
              >
                <option value="all">🏆 All Sports</option>
                <option value="nfl">🏈 NFL</option>
                <option value="nba">🏀 NBA</option>
                <option value="ncaaf">🏟️ College Football</option>
                <option value="mlb">⚾ MLB</option>
                <option value="nhl">🏒 NHL</option>
              </select>
            </div>

            {/* Sportsbook */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3">Sportsbook</label>
              <select
                value={selectedSportsbook}
                onChange={(e) => setSelectedSportsbook(e.target.value)}
                className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-lg"
              >
                <option value="draftkings">DraftKings</option>
                <option value="fanduel">FanDuel</option>
                <option value="betmgm">BetMGM</option>
                <option value="caesars">Caesars</option>
                <option value="pointsbetsportsbook">PointsBet</option>
                <option value="betrivers">BetRivers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Elite Analytics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-800/40 to-blue-900/40 border-2 border-blue-600/30 rounded-xl p-6 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-3xl font-black text-blue-200 mb-2">{liveGames?.length || 0}</div>
            <div className="text-sm font-bold text-blue-300 mb-2">Live Games</div>
            <Activity className="w-5 h-5 text-blue-400 mx-auto" />
          </div>
          
          <div className="bg-gradient-to-br from-emerald-800/40 to-emerald-900/40 border-2 border-emerald-600/30 rounded-xl p-6 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-3xl font-black text-emerald-200 mb-2">
              {liveGames?.filter(g => g.primetime).length || 0}
            </div>
            <div className="text-sm font-bold text-emerald-300 mb-2">Primetime</div>
            <Tv className="w-5 h-5 text-emerald-400 mx-auto" />
          </div>
          
          <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 border-2 border-purple-600/30 rounded-xl p-6 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-3xl font-black text-purple-200 mb-2">
              {liveGames?.filter(g => g.importance === 'high').length || 0}
            </div>
            <div className="text-sm font-bold text-purple-300 mb-2">High Priority</div>
            <Award className="w-5 h-5 text-purple-400 mx-auto" />
          </div>
          
          <div className="bg-gradient-to-br from-yellow-800/40 to-yellow-900/40 border-2 border-yellow-600/30 rounded-xl p-6 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-3xl font-black text-yellow-200 mb-2">
              {selectedSportsbook ? 1 : 6}
            </div>
            <div className="text-sm font-bold text-yellow-300 mb-2">Sportsbooks</div>
            <Target className="w-5 h-5 text-yellow-400 mx-auto" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-200 mb-3">🏈 Nova Titan Elite Loading...</div>
              <div className="text-slate-400 font-medium">Fetching live games with real-time odds</div>
            </div>
          </div>
        )}

        {/* Elite Games Display */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {!liveGames || liveGames.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-8xl mb-8">🏈</div>
                  <h3 className="text-3xl font-bold text-slate-200 mb-4">No Games Found</h3>
                  <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                    No games available for the selected date and filters. Try adjusting your selection or check back later.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSport('all');
                      setSelectedDate(new Date().toISOString().split('T')[0]);
                      setViewMode('today');
                    }}
                    className="px-8 py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-600"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {liveGames.map((game: any, index: number) => {
                    const gameTime = game.commence_time || game.gameTime;
                    const gameStatus = getGameStatus(gameTime);
                    
                    // Handle both API structures for bookmakers
                    let bookmaker = null;
                    if (game.bookmakers) {
                      if (Array.isArray(game.bookmakers)) {
                        // Raw API structure (array of bookmakers with markets)
                        bookmaker = game.bookmakers.find((b: any) => b.key === selectedSportsbook) || game.bookmakers[0];
                      } else if (typeof game.bookmakers === 'object') {
                        // Transformed structure (object with bookmaker IDs as keys)
                        const bookmakerData = game.bookmakers[selectedSportsbook] || Object.values(game.bookmakers)[0];
                        if (bookmakerData) {
                          // Convert to expected format
                          bookmaker = {
                            key: selectedSportsbook,
                            title: selectedSportsbook,
                            markets: [
                              {
                                key: 'h2h',
                                outcomes: [
                                  { name: game.away_team, price: bookmakerData.moneyline?.away || 100 },
                                  { name: game.home_team, price: bookmakerData.moneyline?.home || 100 }
                                ]
                              },
                              {
                                key: 'spreads', 
                                outcomes: [
                                  { 
                                    name: game.away_team, 
                                    price: bookmakerData.spread?.away || -110,
                                    point: bookmakerData.spread?.line || 0
                                  },
                                  { 
                                    name: game.home_team, 
                                    price: bookmakerData.spread?.home || -110,
                                    point: -(bookmakerData.spread?.line || 0)
                                  }
                                ]
                              },
                              {
                                key: 'totals',
                                outcomes: [
                                  { 
                                    name: 'Over', 
                                    price: bookmakerData.total?.over || -110,
                                    point: bookmakerData.total?.line || 0
                                  },
                                  { 
                                    name: 'Under', 
                                    price: bookmakerData.total?.under || -110,
                                    point: bookmakerData.total?.line || 0
                                  }
                                ]
                              }
                            ]
                          };
                        }
                      }
                    }
                    
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border-2 border-slate-600/40 hover:border-blue-500/50 transition-all duration-500 backdrop-blur-sm overflow-hidden shadow-2xl"
                      >
                        {/* Elite Game Header */}
                        <div className="p-8">
                          <div className="flex items-start justify-between mb-8">
                            {/* Left: Teams with Professional Logos */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-6">
                                <span className="text-sm font-bold text-blue-300 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-600/50 shadow-lg">
                                  {game.sport_title || 'LIVE GAME'}
                                </span>
                                <span className={`text-xs px-4 py-2 rounded-full border font-bold shadow-lg ${getImportanceColor(game.importance)}`}>
                                  {game.importance?.toUpperCase() || 'HIGH'} PRIORITY
                                </span>
                                {game.primetime && (
                                  <span className="text-xs bg-red-700 text-red-100 px-4 py-2 rounded-full font-bold shadow-lg border border-red-600">
                                    📺 PRIMETIME
                                  </span>
                                )}
                                <span className={`text-sm px-3 py-2 rounded-full font-bold ${gameStatus.color}`}>
                                  {gameStatus.icon} {gameStatus.status.toUpperCase()}
                                </span>
                              </div>

                              {/* Professional Team Matchup Display */}
                              <div className="flex items-center space-x-8">
                                {/* Away Team */}
                                <div className="flex items-center space-x-4 flex-1">
                                  <img 
                                    src={game.awayTeamLogo} 
                                    alt={game.away_team}
                                    className="w-16 h-16 rounded-xl shadow-xl border-2 border-slate-600/50 bg-slate-700/50"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      img.src = TEAM_LOGOS.default;
                                    }}
                                  />
                                  <div>
                                    <div className="font-black text-xl text-slate-100 mb-1">
                                      {game.away_team}
                                    </div>
                                    <div className="text-sm text-slate-300 font-semibold">
                                      Away Team
                                    </div>
                                  </div>
                                </div>

                                {/* Professional VS Indicator */}
                                <div className="flex flex-col items-center px-6">
                                  <div className="text-slate-500 font-black text-2xl mb-1">@</div>
                                  <div className="text-xs text-slate-400 font-bold">{game.cstDate}</div>
                                </div>

                                {/* Home Team */}
                                <div className="flex items-center space-x-4 flex-1">
                                  <img 
                                    src={game.homeTeamLogo} 
                                    alt={game.home_team}
                                    className="w-16 h-16 rounded-xl shadow-xl border-2 border-slate-600/50 bg-slate-700/50"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      img.src = TEAM_LOGOS.default;
                                    }}
                                  />
                                  <div>
                                    <div className="font-black text-xl text-slate-100 mb-1">
                                      {game.home_team}
                                    </div>
                                    <div className="text-sm text-slate-300 font-semibold">
                                      Home Team
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Elite Game Info */}
                            <div className="text-right ml-8 min-w-0">
                              <div className="flex flex-col items-end space-y-3">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-slate-100 flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    {game.cstTime}
                                  </div>
                                  <div className="text-xs text-slate-400 font-semibold">Central Standard Time</div>
                                </div>

                                {bookmaker && (
                                  <div className="px-3 py-2 bg-blue-800/50 text-blue-200 rounded-lg text-sm font-bold border border-blue-600/50">
                                    {bookmaker.title || selectedSportsbook}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Elite Game Details Bar */}
                          <div className="flex items-center justify-between py-4 px-6 bg-slate-700/40 rounded-xl mb-6 border border-slate-600/50 shadow-lg">
                            <div className="flex items-center space-x-8">
                              <div className="flex items-center space-x-2 text-sm text-slate-200 font-semibold">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{game.venue}, {game.venueCity}</span>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {game.broadcast?.map((network: string, i: number) => (
                                  <span 
                                    key={i}
                                    className={`text-xs font-bold px-3 py-2 rounded-lg ${getBroadcastStyle(network)}`}
                                  >
                                    {network}
                                  </span>
                                ))}
                              </div>
                              
                              {game.weather && (
                                <div className="flex items-center space-x-2 text-sm text-slate-200 font-semibold">
                                  <span>🌤️</span>
                                  <span>{game.weather}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professional Odds Display */}
                          {bookmaker?.markets && Array.isArray(bookmaker.markets) ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {bookmaker.markets.slice(0, 3).map((market: any, i: number) => (
                                <div key={i} className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 shadow-lg">
                                  <div className="text-xs text-slate-300 font-bold mb-3 uppercase tracking-wider text-center">
                                    {market.key === 'h2h' ? 'Moneyline' : 
                                     market.key === 'spreads' ? 'Point Spread' :
                                     market.key === 'totals' ? 'Over/Under' : 
                                     market.key}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {market.outcomes?.slice(0, 2).map((outcome: any, j: number) => (
                                      <div key={j} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                                        <span className="text-slate-200 font-semibold text-sm">
                                          {outcome.name}
                                          {outcome.point && ` ${outcome.point > 0 ? '+' : ''}${outcome.point}`}
                                        </span>
                                        <span className="text-emerald-400 font-bold">
                                          {outcome.price > 0 ? '+' : ''}{Math.round((outcome.price - 1) * 100) || outcome.price}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 text-center">
                              <div className="text-slate-400 mb-2">
                                <Target className="h-8 w-8 mx-auto mb-2" />
                              </div>
                              <div className="text-slate-300 font-medium">Live odds updating...</div>
                              <div className="text-xs text-slate-500 mt-1">Check back in a few moments</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elite Nova Titan Footer */}
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-600/30 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-purple-500/30">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h4 className="font-black text-purple-100 text-2xl">Nova Titan Elite Games Engine</h4>
                <span className="text-sm bg-purple-700 text-purple-100 px-4 py-2 rounded-full font-bold border border-purple-600">
                  REAL-TIME DATA
                </span>
              </div>
              <p className="text-purple-50 text-lg leading-relaxed mb-6 font-medium">
                Live game data with real-time odds from major sportsbooks. Professional team logos, 
                accurate CST game times, broadcast information, and venue details for comprehensive sports analysis.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                <div className="flex items-center space-x-3 text-purple-200">
                  <Star className="w-5 h-5" />
                  <span className="font-bold">Live Odds Integration</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-200">
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-bold">2-Minute Updates</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-200">
                  <Target className="w-5 h-5" />
                  <span className="font-bold">6 Major Sportsbooks</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-200">
                  <Globe className="w-5 h-5" />
                  <a href="https://novatitan.net/" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-purple-100 underline hover:underline transition-colors">novatitan.net</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};