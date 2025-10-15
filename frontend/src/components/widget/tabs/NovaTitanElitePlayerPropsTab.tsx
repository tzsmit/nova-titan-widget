/**
 * Nova Titan Elite Player Props Tab - Empire-Grade Player Propositions Interface
 * Professional design with deep colors, excellent contrast, and branded experience
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService, RealPlayerProp } from '../../../services/realTimeOddsService';
import { 
  User,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  Activity,
  Award,
  Star,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Eye,
  Loader2,
  Crown,
  Sparkles,
  BarChart3,
  Trophy,
  Flame,
  CheckCircle,
  BookOpen,
  Trash2,
  Plus
} from 'lucide-react';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { SportsBettingLegend } from '../../ui/SportsBettingLegend';

interface PlayerPropBet {
  id: string;
  playerName: string;
  team: string;
  propType: string;
  line: number;
  betType: 'over' | 'under';
  odds: number;
  bookmaker: string;
  confidence?: number;
}

interface PropsParlay {
  bets: PlayerPropBet[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  impliedProbability: number;
}

export const NovaTitanElitePlayerPropsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('NFL');
  const [selectedProp, setSelectedProp] = useState('all');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showLegend, setShowLegend] = useState(false);
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [propsParlay, setPropsParlay] = useState<PropsParlay>({
    bets: [],
    stake: 100,
    totalOdds: 0,
    potentialPayout: 0,
    impliedProbability: 0
  });

  const { data: playerProps, isLoading, error, refetch } = useQuery({
    queryKey: ['player-props', selectedSport, selectedProp],
    queryFn: async () => {
      console.log(`🎯 Fetching live player props for ${selectedSport}...`);
      
      // Get REAL player props from The Odds API
      console.log('🎯 Fetching live player props from The Odds API...');
      
      const sportMap: { [key: string]: string } = {
        'NFL': 'americanfootball_nfl',
        'NBA': 'basketball_nba',
        'CFB': 'americanfootball_ncaaf'
      };
      
      try {
        const realPlayerProps = await realTimeOddsService.getLivePlayerProps(sportMap[selectedSport]);
        console.log(`✅ Found ${realPlayerProps.length} live player props from API`);
        
        // Debug first few props to check structure
        if (realPlayerProps.length > 0) {
          console.log('📊 Sample player props structure:', realPlayerProps.slice(0, 2).map(prop => ({
            playerName: prop.playerName,
            propType: prop.propType,
            market: prop.market,
            isActive: prop.isActive
          })));
        }
        
        return realPlayerProps;
      } catch (error) {
        console.error('❌ Failed to fetch real player props:', error);
        return []; // Return empty array - NO FAKE DATA
      }
    },
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes for live props
  });

  const filteredProps = playerProps?.filter(prop => {
    // Debug logging for prop filtering
    if (selectedProp !== 'all') {
      console.log(`🔍 Prop filtering: ${prop.playerName} - propType: "${prop.propType}", selected: "${selectedProp}", match: ${prop.propType === selectedProp}`);
    }
    
    if (selectedProp !== 'all' && prop.propType !== selectedProp) return false;
    if (showOnlyActive && !prop.isActive) return false;
    if (selectedPlayer && prop.playerName !== selectedPlayer) return false;
    return true;
  }) || [];

  const propTypes = [
    { value: 'all', label: '🎯 All Props', icon: Target },
    { value: 'passing_yards', label: '🏈 Passing Yards', icon: Zap },
    { value: 'rushing_yards', label: '🏃 Rushing Yards', icon: Activity },
    { value: 'receiving_yards', label: '🤲 Receiving Yards', icon: BarChart3 },
    { value: 'passing_touchdowns', label: '🎯 Pass TDs', icon: Trophy },
    { value: 'points', label: '🏀 Points (NBA)', icon: Crown },
    { value: 'rebounds', label: '📦 Rebounds', icon: Shield },
    { value: 'assists', label: '🎯 Assists', icon: Star },
  ];

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  // Helper functions to extract odds from RealPlayerProp structure
  const getOverOdds = (prop: any): number => {
    if (prop.overOdds) return prop.overOdds; // Legacy format
    
    // Extract from bookmakers object
    const bookmakerKeys = Object.keys(prop.bookmakers || {});
    if (bookmakerKeys.length > 0) {
      const firstBookmaker = prop.bookmakers[bookmakerKeys[0]];
      return firstBookmaker?.over || -110;
    }
    return -110; // Default
  };

  const getUnderOdds = (prop: any): number => {
    if (prop.underOdds) return prop.underOdds; // Legacy format
    
    // Extract from bookmakers object
    const bookmakerKeys = Object.keys(prop.bookmakers || {});
    if (bookmakerKeys.length > 0) {
      const firstBookmaker = prop.bookmakers[bookmakerKeys[0]];
      return firstBookmaker?.under || -110;
    }
    return -110; // Default
  };

  const getBookmakerName = (prop: any): string => {
    if (prop.bookmaker) return prop.bookmaker; // Legacy format
    
    // Extract from bookmakers object
    const bookmakerKeys = Object.keys(prop.bookmakers || {});
    if (bookmakerKeys.length > 0) {
      return bookmakerKeys[0].charAt(0).toUpperCase() + bookmakerKeys[0].slice(1);
    }
    return 'DraftKings'; // Default
  };

  const formatPropType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards', 
      'receiving_yards': 'Receiving Yards',
      'passing_touchdowns': 'Pass TDs',
      'points': 'Points',
      'rebounds': 'Rebounds',
      'assists': 'Assists'
    };
    return typeMap[type] || type;
  };

  // Get unique players for filter
  const uniquePlayers = [...new Set(playerProps?.map(prop => prop.playerName) || [])].sort();

  // Player Props Builder Functions
  const addPropToBuilder = (prop: any, betType: 'over' | 'under') => {
    const odds = betType === 'over' ? getOverOdds(prop) : getUnderOdds(prop);
    const bookmaker = getBookmakerName(prop);
    
    const newBet: PlayerPropBet = {
      id: `${prop.id}_${betType}_${Date.now()}`,
      playerName: prop.playerName,
      team: prop.team,
      propType: prop.propType,
      line: prop.line,
      betType,
      odds,
      bookmaker,
      confidence: prop.confidence || 70
    };

    // Prevent duplicate bets
    const isDuplicate = propsParlay.bets.some(bet => 
      bet.playerName === newBet.playerName && 
      bet.propType === newBet.propType && 
      bet.betType === newBet.betType
    );

    if (!isDuplicate) {
      updateParlayCalculations([...propsParlay.bets, newBet], propsParlay.stake);
    }
  };

  const removePropFromBuilder = (betId: string) => {
    const newBets = propsParlay.bets.filter(bet => bet.id !== betId);
    updateParlayCalculations(newBets, propsParlay.stake);
  };

  const updateStake = (newStake: number) => {
    updateParlayCalculations(propsParlay.bets, newStake);
  };

  const clearPropsBuilder = () => {
    setPropsParlay({
      bets: [],
      stake: 100,
      totalOdds: 0,
      potentialPayout: 0,
      impliedProbability: 0
    });
  };

  const updateParlayCalculations = (bets: PlayerPropBet[], stake: number) => {
    if (bets.length === 0) {
      setPropsParlay(prev => ({ ...prev, bets, stake, totalOdds: 0, potentialPayout: 0, impliedProbability: 0 }));
      return;
    }

    let combinedDecimalOdds = 1;
    let combinedImpliedProb = 1;

    bets.forEach(bet => {
      const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
      const impliedProb = bet.odds > 0 ? 100 / (bet.odds + 100) : Math.abs(bet.odds) / (Math.abs(bet.odds) + 100);
      
      combinedDecimalOdds *= decimalOdds;
      combinedImpliedProb *= impliedProb;
    });

    const potentialPayout = stake * combinedDecimalOdds;
    const americanOdds = combinedDecimalOdds >= 2 ? 
      Math.round((combinedDecimalOdds - 1) * 100) : 
      Math.round(-100 / (combinedDecimalOdds - 1));

    setPropsParlay({
      bets,
      stake,
      totalOdds: americanOdds,
      potentialPayout,
      impliedProbability: combinedImpliedProb * 100
    });
  };

  // Enhanced odds extraction with bookmaker selection
  const getOddsForBookmaker = (prop: any, bookmaker: string = 'all') => {
    const bookmakerKeys = Object.keys(prop.bookmakers || {});
    
    if (bookmaker === 'all' || !bookmakerKeys.includes(bookmaker)) {
      // Use first available bookmaker
      const firstBookmaker = bookmakerKeys[0];
      return prop.bookmakers?.[firstBookmaker] || { over: -110, under: -110 };
    }
    
    return prop.bookmakers?.[bookmaker] || { over: -110, under: -110 };
  };

  // Display different bookmaker odds
  const getAllBookmakerOdds = (prop: any) => {
    const bookmakerKeys = Object.keys(prop.bookmakers || {});
    return bookmakerKeys.map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      over: prop.bookmakers[key]?.over || -110,
      under: prop.bookmakers[key]?.under || -110
    }));
  };

  // Elite animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-400/20 mx-auto"></div>
          </div>
          <div className="text-slate-100 text-lg font-semibold mb-2">Nova Titan Elite</div>
          <div className="text-slate-300 text-sm">Loading player props...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Elite Header */}
      <motion.div 
        className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-slate-700 shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-100">Elite Player Props</h1>
                    <HelpTooltip content="Player propositions are bets on individual player statistics like points, yards, touchdowns, etc. rather than game outcomes." position="bottom" size="lg" />
                  </div>
                  <p className="text-slate-300 text-sm">Professional player proposition betting</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Globe className="h-3 w-3" />
                <span>Powered by </span>
                <a href="https://novatitan.net/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline hover:underline transition-colors font-medium">
                  novatitan.net
                </a>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span>Live Player Data</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">
                {filteredProps.length}
              </div>
              <div className="text-sm text-slate-300">Active Props</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Elite Controls */}
      <div className="p-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Sport</label>
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="NFL">🏈 NFL Football</option>
                <option value="NBA">🏀 NBA Basketball</option>
                <option value="CFB">🏈 College Football</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                Prop Type
                <HelpTooltip content="Different types of player statistics you can bet on - passing yards, rushing yards, points, rebounds, etc." position="top" size="md" />
              </label>
              <select 
                value={selectedProp} 
                onChange={(e) => setSelectedProp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {propTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Player</label>
              <select 
                value={selectedPlayer} 
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Players</option>
                {uniquePlayers.map(player => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Bookmaker</label>
              <select 
                value={selectedBookmaker} 
                onChange={(e) => setSelectedBookmaker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-slate-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Books</option>
                <option value="draftkings">DraftKings</option>
                <option value="fanduel">FanDuel</option>
                <option value="betmgm">BetMGM</option>
                <option value="caesars">Caesars</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showBuilder 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Target className="h-4 w-4" />
                Props Builder
              </button>
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                <RefreshCw className={`h-4 w-4 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="activeOnly" className="text-sm text-slate-300">
                Show only active props
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Activity className="h-4 w-4" />
              <span>Live Data</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Player Props Grid */}
        {error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Props</h3>
            <p className="text-red-300 text-sm mb-4">
              {error instanceof Error ? error.message : 'Failed to load player props'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProps.map((prop) => (
              <motion.div
                key={prop.id}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl overflow-hidden hover:border-purple-500 transition-all group"
              >
                {/* Player Header */}
                <div className="bg-gradient-to-r from-slate-900 to-purple-900/50 p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 mb-1">
                        {prop.playerName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-300">{prop.team}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{prop.opponent}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-slate-200">
                          {prop.confidence}%
                        </span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        prop.trend === 'up' ? 'bg-green-900/50 text-green-300' :
                        prop.trend === 'down' ? 'bg-red-900/50 text-red-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {prop.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                        ) : prop.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                        ) : null}
                        {prop.trend || 'Stable'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prop Details */}
                <div className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-sm text-slate-400 mb-1">
                      {formatPropType(prop.propType)}
                    </div>
                    <div className="text-2xl font-bold text-slate-100 mb-2">
                      {prop.line}
                    </div>
                    <div className="text-xs text-slate-500">
                      Season Avg: {prop.season_avg} • L5: {prop.last_5_avg}
                    </div>
                  </div>

                  {/* Over/Under Betting Options */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => showBuilder && addPropToBuilder(prop, 'over')}
                      className={`bg-slate-900/50 hover:bg-green-900/30 border border-slate-600 hover:border-green-500 rounded-lg p-3 transition-all group ${
                        showBuilder ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-1">Over {prop.line}</div>
                      <div className="text-lg font-bold text-slate-100 group-hover:text-green-400">
                        {formatOdds(getOverOdds(prop))}
                      </div>
                      {showBuilder && (
                        <div className="text-xs text-green-400 mt-1">+ Add to Builder</div>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => showBuilder && addPropToBuilder(prop, 'under')}
                      className={`bg-slate-900/50 hover:bg-red-900/30 border border-slate-600 hover:border-red-500 rounded-lg p-3 transition-all group ${
                        showBuilder ? 'cursor-pointer' : ''
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-1">Under {prop.line}</div>
                      <div className="text-lg font-bold text-slate-100 group-hover:text-red-400">
                        {formatOdds(getUnderOdds(prop))}
                      </div>
                      {showBuilder && (
                        <div className="text-xs text-red-400 mt-1">+ Add to Builder</div>
                      )}
                    </button>
                  </div>

                  {/* Bookmaker Odds Comparison */}
                  {selectedBookmaker === 'all' && getAllBookmakerOdds(prop).length > 1 && (
                    <div className="mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-600">
                      <div className="text-xs text-slate-400 mb-2">All Bookmakers:</div>
                      <div className="space-y-1">
                        {getAllBookmakerOdds(prop).map(book => (
                          <div key={book.key} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300">{book.name}</span>
                            <div className="flex gap-2">
                              <span className="text-green-400">O: {formatOdds(book.over)}</span>
                              <span className="text-red-400">U: {formatOdds(book.under)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookmaker Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700">
                    <span>{getBookmakerName(prop)}</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Props Builder Panel */}
        {showBuilder && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Player Props Builder ({propsParlay.bets.length} bets)
              </h3>
              {propsParlay.bets.length > 0 && (
                <button
                  onClick={clearPropsBuilder}
                  className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Selected Bets */}
              <div className="lg:col-span-2">
                <div className="space-y-3">
                  {propsParlay.bets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Target className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                      <p>No props selected. Click on Over/Under buttons to add bets.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {propsParlay.bets.map((bet) => (
                        <motion.div
                          key={bet.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-100">{bet.playerName}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-300">{bet.team}</span>
                              </div>
                              <div className="text-sm text-slate-400 mb-1">
                                {formatPropType(bet.propType)} - {bet.betType.toUpperCase()} {bet.line}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">{bet.bookmaker}</span>
                                {bet.confidence && (
                                  <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                                    {bet.confidence}% AI
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">{formatOdds(bet.odds)}</span>
                              <button
                                onClick={() => removePropFromBuilder(bet.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Payout Calculator */}
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-sm text-slate-400 mb-2">Stake Amount</div>
                  <input
                    type="number"
                    value={propsParlay.stake}
                    onChange={(e) => updateStake(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
                    min="1"
                    step="1"
                  />
                </div>

                {propsParlay.bets.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600">
                      <div className="text-sm text-purple-300 mb-1">Total Odds</div>
                      <div className="text-2xl font-bold text-purple-100">
                        {formatOdds(propsParlay.totalOdds)}
                      </div>
                    </div>

                    <div className="bg-green-900/20 rounded-lg p-4 border border-green-600">
                      <div className="text-sm text-green-300 mb-1">Potential Payout</div>
                      <div className="text-2xl font-bold text-green-100">
                        ${propsParlay.potentialPayout.toFixed(2)}
                      </div>
                      <div className="text-xs text-green-400 mt-1">
                        Profit: ${(propsParlay.potentialPayout - propsParlay.stake).toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="text-sm text-slate-400 mb-1">Implied Probability</div>
                      <div className="text-lg font-semibold text-slate-200">
                        {propsParlay.impliedProbability.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {filteredProps.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No Player Props Available
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or check back later for new props.
            </p>
          </div>
        )}
      </div>

      {/* Nova Titan Elite Branding */}
      <div className="text-center p-6 border-t border-slate-700">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="h-3 w-3" />
          <a href="https://novatitan.net/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 underline hover:underline transition-colors">
            Nova Titan Elite Platform
          </a>
          <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
          <span>Professional Player Intelligence</span>
        </div>
      </div>

      {/* Sports Betting Legend */}
      <SportsBettingLegend 
        isOpen={showLegend} 
        onClose={() => setShowLegend(false)} 
      />
    </div>
  );
};

export default NovaTitanElitePlayerPropsTab;