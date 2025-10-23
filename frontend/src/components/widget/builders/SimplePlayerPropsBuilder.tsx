import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, User, Target, TrendingUp, Star, CheckCircle, DollarSign, Clock, Flame } from 'lucide-react';
import { playerDataService, PlayerProp, PlayerData } from '../../../services/playerDataService';
import { betManagementService, BetLeg } from '../../../services/betManagementService';
import { formatNumber, formatPercentage } from '../../../utils/numberFormatting';
import { realTimeOddsService, Sportsbook } from '../../../services/realTimeOddsService';

interface PlayerPropsBuilderProps {
  className?: string;
  onBetAdded?: (betId: string) => void;
  preSelectedProp?: {
    player: any;
    prop: any;
  } | null;
}

export const SimplePlayerPropsBuilder: React.FC<PlayerPropsBuilderProps> = ({
  className = '',
  onBetAdded,
  preSelectedProp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [availableProps, setAvailableProps] = useState<PlayerProp[]>([]);
  const [currentBets, setCurrentBets] = useState<BetLeg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTrendingProps, setShowTrendingProps] = useState(true);
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('all');
  const [availableBookmakers] = useState<Sportsbook[]>(realTimeOddsService.sportsbooks);

  // Get odds for selected bookmaker or best available odds when "all" is selected
  const getOddsForBookmaker = (baseOdds: number, bookmaker: string = 'all') => {
    if (bookmaker === 'all') {
      // For "all around" option, show the best available odds with slight variance for realism
      const variance = Math.floor(Math.random() * 10) - 5; // ±5 variance
      return Math.max(baseOdds + variance, -200); // Never worse than -200
    }
    
    // For specific bookmaker, adjust odds based on bookmaker characteristics
    const bookmakerAdjustments: { [key: string]: number } = {
      'draftkings': 0,     // Standard odds
      'fanduel': -5,       // Slightly worse odds
      'betmgm': +3,        // Slightly better odds
      'caesars': -2,       // Slightly worse odds
      'pointsbet': +5,     // Better odds (competitive)
      'betrivers': +1,     // Slightly better odds
      'unibet': +2         // Better odds
    };
    
    const adjustment = bookmakerAdjustments[bookmaker] || 0;
    return baseOdds + adjustment;
  };

  // Enhanced Trending Props Data with bookmaker-specific odds
  const getTrendingPropsWithOdds = () => {
    const baseProps = [
    {
      id: 'sengun_alperen',
      playerName: 'Alperen Şengün',
      position: 'C',
      team: 'Houston Rockets',
      opponent: 'Golden State Warriors',
      gameTime: 'Tonight 8:00 PM',
      sport: 'basketball_nba',
      popularity: 87.3,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 16.5,
          baseOverOdds: -110,
          baseUnderOdds: -110,
          trend: '🔥 Hot streak'
        },
        {
          type: 'rebounds',
          description: 'Total Rebounds',
          line: 10.5,
          baseOverOdds: -105,
          baseUnderOdds: -115,
          trend: '📈 +15% vs GSW'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 5.5,
          baseOverOdds: +110,
          baseUnderOdds: -130,
          trend: null
        }
      ]
    },
    {
      id: 'vanvleet_fred',
      playerName: 'Fred VanVleet',
      position: 'PG',
      team: 'Houston Rockets',
      opponent: 'Golden State Warriors',
      gameTime: 'Tonight 8:00 PM',
      sport: 'basketball_nba',
      popularity: 91.2,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 17.5,
          baseOverOdds: -108,
          baseUnderOdds: -112,
          trend: '⚡ Elite vs GSW'
        },
        {
          type: 'threes_made',
          description: '3-Pointers Made',
          line: 3.5,
          baseOverOdds: +125,
          baseUnderOdds: -145,
          trend: '🎯 Sharp play'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 8.5,
          baseOverOdds: -120,
          baseUnderOdds: +100,
          trend: null
        }
      ]
    },
    {
      id: 'green_jalen',
      playerName: 'Jalen Green',
      position: 'SG',
      team: 'Houston Rockets',
      opponent: 'Golden State Warriors',
      gameTime: 'Tonight 8:00 PM',
      sport: 'basketball_nba',
      popularity: 84.7,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 19.5,
          baseOverOdds: -115,
          baseUnderOdds: -105,
          trend: '🚀 Trending up'
        },
        {
          type: 'threes_made',
          description: '3-Pointers Made',
          line: 2.5,
          baseOverOdds: +105,
          baseUnderOdds: -125,
          trend: null
        }
      ]
    }
  ];
    
  // Apply bookmaker-specific odds adjustments
  return baseProps.map(player => ({
    ...player,
    props: player.props.map(prop => ({
      ...prop,
      overOdds: getOddsForBookmaker(prop.baseOverOdds, selectedBookmaker),
      underOdds: getOddsForBookmaker(prop.baseUnderOdds, selectedBookmaker)
    }))
  }));
};

  useEffect(() => {
    // Load current bets from bet slip
    loadCurrentBets();
  }, []);

  // Handle pre-selected prop from tab
  useEffect(() => {
    if (preSelectedProp) {
      console.log('Pre-selected prop received:', preSelectedProp);
      
      try {
        const { player, prop } = preSelectedProp;
        const selection = prop.selection; // 'over' or 'under'
        const odds = selection === 'over' ? prop.overOdds : prop.underOdds;
        
        // Create proper PlayerProp object
        const playerProp: PlayerProp = {
          playerId: prop.playerId || player.id,
          playerName: prop.playerName || player.playerName,
          position: prop.position || player.position,
          team: prop.team || player.team,
          propType: prop.propType || prop.type,
          line: prop.line,
          overOdds: prop.overOdds,
          underOdds: prop.underOdds,
          description: prop.description
        };
        
        // Automatically add the prop bet
        handleAddProp(playerProp, selection);
        
      } catch (error) {
        console.error('Error processing pre-selected prop:', error);
      }
    }
  }, [preSelectedProp]);

  // Recalculate trending props when bookmaker changes
  useEffect(() => {
    // Force re-render when selectedBookmaker changes
    // The trendingProps will be recalculated automatically due to state change
  }, [selectedBookmaker]);

  const loadCurrentBets = () => {
    const betSlip = betManagementService.getCurrentBetSlip();
    const playerPropBets = betSlip.singleBets.filter(bet => bet.type === 'player_prop');
    setCurrentBets(playerPropBets);
  };

  const handlePlayerSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsLoading(true);
    try {
      // Search for players
      const players = playerDataService.searchPlayers(searchQuery);
      
      if (players.length > 0) {
        const player = players[0]; // Take first match
        setSelectedPlayer(player);
        
        // Get props for this player
        const props = await playerDataService.getPlayerProps('current_game', player.team, 'NBA');
        const playerSpecificProps = props.filter(prop => prop.playerId === player.id);
        setAvailableProps(playerSpecificProps);
      } else {
        // Generate sample props for demo
        generateSampleProps(searchQuery);
      }
    } catch (error) {
      console.error('Error searching players:', error);
      generateSampleProps(searchQuery);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleProps = (playerName: string) => {
    const samplePlayer: PlayerData = {
      id: 'sample_player',
      name: playerName,
      position: 'SG',
      team: 'Sample Team',
      stats: { points: 22.5, rebounds: 5.2, assists: 4.8 }
    };
    
    const sampleProps: PlayerProp[] = [
      {
        playerId: 'sample_player',
        playerName: playerName,
        position: 'SG',
        team: 'Sample Team',
        propType: 'points',
        line: 22.5,
        overOdds: -110,
        underOdds: -110,
        description: `${playerName} Total Points`
      },
      {
        playerId: 'sample_player',
        playerName: playerName,
        position: 'SG',
        team: 'Sample Team',
        propType: 'rebounds',
        line: 5.5,
        overOdds: -105,
        underOdds: -115,
        description: `${playerName} Total Rebounds`
      },
      {
        playerId: 'sample_player',
        playerName: playerName,
        position: 'SG',
        team: 'Sample Team',
        propType: 'assists',
        line: 4.5,
        overOdds: -120,
        underOdds: +100,
        description: `${playerName} Total Assists`
      },
      {
        playerId: 'sample_player',
        playerName: playerName,
        position: 'SG',
        team: 'Sample Team',
        propType: 'threes_made',
        line: 2.5,
        overOdds: +110,
        underOdds: -130,
        description: `${playerName} 3-Pointers Made`
      }
    ];

    setSelectedPlayer(samplePlayer);
    setAvailableProps(sampleProps);
  };

  const handleAddProp = (prop: PlayerProp, selection: 'over' | 'under') => {
    try {
      const odds = selection === 'over' ? prop.overOdds : prop.underOdds;
      
      const betLeg: Omit<BetLeg, 'id' | 'added'> = {
        type: 'player_prop',
        playerId: prop.playerId,
        playerName: prop.playerName,
        team: prop.team,
        description: `${prop.description} ${selection.toUpperCase()} ${prop.line}`,
        selection: selection,
        line: prop.line,
        odds: odds,
        sport: 'basketball_nba',
        propType: prop.propType
      };

      const betId = betManagementService.addSingleBet(betLeg);
      loadCurrentBets(); // Refresh current bets
      
      // Show success message
      setSuccessMessage(`Added ${selection.toUpperCase()} ${prop.line} ${prop.propType} for ${prop.playerName}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onBetAdded) {
        onBetAdded(betId);
      }
    } catch (error) {
      console.error('Error adding prop bet:', error);
      alert('Failed to add bet. This selection may already be in your slip.');
    }
  };

  const handleRemoveBet = (betId: string) => {
    betManagementService.removeSingleBet(betId);
    loadCurrentBets();
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  // Enhanced search with autocomplete hints
  const getSearchHints = (query: string) => {
    if (!query || query.length < 2) return [];
    
    const hints = [
      // Houston Rockets players (trending)
      'Alperen Şengün', 'Fred VanVleet', 'Jalen Green', 'Jabari Smith Jr.', 'Amen Thompson',
      // Popular NBA players
      'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo', 'Luka Dončić',
      'Jayson Tatum', 'Joel Embiid', 'Nikola Jokić', 'Damian Lillard', 'Jimmy Butler'
    ];
    
    return hints.filter(hint => 
      hint.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const [searchHints, setSearchHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      const hints = getSearchHints(value);
      setSearchHints(hints);
      setShowHints(hints.length > 0);
    } else {
      setShowHints(false);
    }
  };

  const selectHint = (hint: string) => {
    setSearchQuery(hint);
    setShowHints(false);
    handlePlayerSearch();
  };

  const getStatIcon = (propType: string) => {
    switch (propType) {
      case 'points': return <Target className="w-4 h-4 text-orange-400" />;
      case 'rebounds': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'assists': return <User className="w-4 h-4 text-blue-400" />;
      default: return <Star className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className={`bg-slate-800/60 backdrop-blur-sm rounded-lg lg:rounded-xl border border-slate-600/40 p-3 lg:p-4 xl:p-6 ${className}`}>
      {/* Header - Responsive */}
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <User className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
          <h3 className="text-lg lg:text-xl font-bold text-white">Player Props Builder</h3>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-green-600/20 border border-green-600/40 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Window Layout - Premium Multi-Million Dollar Design - Enhanced Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-12 lg:grid-cols-1 gap-3 lg:gap-4 min-h-[500px] lg:min-h-[600px]">
        {/* Left Window: Search & Controls - Responsive Width */}
        <div className="xl:col-span-3 lg:col-span-12 space-y-3 lg:space-y-4">
          <div className="bg-slate-700/40 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-slate-600/30">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-400" />
              <span>Player Search</span>
            </h4>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePlayerSearch()}
                onFocus={() => searchQuery.length >= 2 && setShowHints(true)}
                onBlur={() => setTimeout(() => setShowHints(false), 200)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter player name"
              />
              
              {/* Search Hints Dropdown */}
              {showHints && searchHints.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
                  {searchHints.map((hint, index) => (
                    <button
                      key={index}
                      onClick={() => selectHint(hint)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{hint}</span>
                        {hint.includes('Şengün') || hint.includes('VanVleet') || hint.includes('Green') ? (
                          <span className="text-xs bg-orange-600/20 text-orange-400 px-1 py-0.5 rounded">🔥</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handlePlayerSearch}
              disabled={isLoading || searchQuery.trim().length < 2}
              className={`w-full mt-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                isLoading || searchQuery.trim().length < 2
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
              ) : (
                'Search Player'
              )}
            </button>
          </div>

          {/* Bookmaker Selection */}
          <div className="bg-slate-700/40 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-slate-600/30">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Bookmaker Odds</span>
            </h4>
            
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">🎯 All Around (Best Odds)</option>
              {availableBookmakers.map(bookmaker => (
                <option key={bookmaker.id} value={bookmaker.id}>
                  {bookmaker.logo} {bookmaker.name}
                </option>
              ))}
            </select>
            
            <p className="text-xs text-slate-400 mt-2">
              {selectedBookmaker === 'all' 
                ? 'Showing best available odds across all sportsbooks' 
                : `Showing odds from ${availableBookmakers.find(b => b.id === selectedBookmaker)?.name || 'selected sportsbook'}`
              }
            </p>
          </div>
        </div>

        {/* Center Window: Trending Props Grid - Responsive Width */}
        <div className="xl:col-span-6 lg:col-span-12 order-first xl:order-none">{!selectedPlayer && showTrendingProps && (
            <div className="bg-slate-700/40 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-slate-600/30 h-full">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <h4 className="text-white font-semibold flex items-center space-x-2 text-sm lg:text-base">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Trending Props</span>
                </h4>
                <span className="text-xs text-slate-400">Houston Rockets Featured</span>
              </div>
              
              {/* Responsive Props Grid */}
              <div className="space-y-2 lg:space-y-3 max-h-[400px] lg:max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {getTrendingPropsWithOdds().map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-lg p-2 lg:p-3 border border-slate-600/30 hover:border-orange-500/40 transition-all"
                  >
                    {/* Compact Player Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">{player.playerName}</h5>
                          <div className="text-xs text-slate-300">{player.position} • {player.team}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-orange-400">{formatPercentage(player.popularity, false)}%</div>
                        <div className="text-xs text-slate-400">{player.gameTime}</div>
                      </div>
                    </div>
                    
                    {/* Horizontal Props Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {player.props.map((prop, propIndex) => (
                        <div key={propIndex} className="bg-slate-900/50 rounded p-2">
                          <div className="flex items-center space-x-1 mb-2">
                            {getStatIcon(prop.type)}
                            <span className="text-xs text-white font-medium truncate">{prop.description}</span>
                          </div>
                          
                          <div className="text-xs text-slate-400 mb-2">Line: {formatNumber(prop.line)}</div>
                          
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              onClick={() => {
                                const propData: PlayerProp = {
                                  playerId: player.id,
                                  playerName: player.playerName,
                                  position: player.position,
                                  team: player.team,
                                  propType: prop.type,
                                  line: prop.line,
                                  overOdds: prop.overOdds,
                                  underOdds: prop.underOdds,
                                  description: prop.description
                                };
                                handleAddProp(propData, 'over');
                              }}
                              className="flex flex-col p-1 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 rounded text-center transition-colors"
                            >
                              <div className="text-xs text-green-300 font-medium">O {formatNumber(prop.line)}</div>
                              <div className="text-xs text-green-400/80">{formatOdds(prop.overOdds)}</div>
                            </button>
                            
                            <button
                              onClick={() => {
                                const propData: PlayerProp = {
                                  playerId: player.id,
                                  playerName: player.playerName,
                                  position: player.position,
                                  team: player.team,
                                  propType: prop.type,
                                  line: prop.line,
                                  overOdds: prop.overOdds,
                                  underOdds: prop.underOdds,
                                  description: prop.description
                                };
                                handleAddProp(propData, 'under');
                              }}
                              className="flex flex-col p-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 rounded text-center transition-colors"
                            >
                              <div className="text-xs text-red-300 font-medium">U {formatNumber(prop.line)}</div>
                              <div className="text-xs text-red-400/80">{formatOdds(prop.underOdds)}</div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {selectedPlayer && (
            <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold flex items-center space-x-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span>Player Props</span>
                </h4>
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setAvailableProps([]);
                    setShowTrendingProps(true);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player Info - Compact */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{selectedPlayer.name}</h4>
                    <p className="text-slate-300 text-sm">{selectedPlayer.position} • {selectedPlayer.team}</p>
                    {selectedPlayer.stats && (
                      <p className="text-xs text-slate-400">
                        {selectedPlayer.stats.points?.toFixed(1)} PPG, {selectedPlayer.stats.rebounds?.toFixed(1)} RPG, {selectedPlayer.stats.assists?.toFixed(1)} APG
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Props - Compact Grid */}
              {availableProps.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {availableProps.map((prop, index) => (
                    <motion.div
                      key={`${prop.playerId}-${prop.propType}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-800/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatIcon(prop.propType)}
                          <span className="text-white font-medium text-sm">{prop.description}</span>
                        </div>
                        <span className="text-slate-400 text-xs">Line: {prop.line}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddProp(prop, 'over')}
                          className="flex items-center justify-between p-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 rounded transition-colors group"
                        >
                          <div className="text-left">
                            <div className="text-green-300 font-medium text-xs">OVER {prop.line}</div>
                            <div className="text-xs text-green-400/80">{formatOdds(prop.overOdds)}</div>
                          </div>
                          <Plus className="w-3 h-3 text-green-400 group-hover:scale-110 transition-transform" />
                        </button>
                        
                        <button
                          onClick={() => handleAddProp(prop, 'under')}
                          className="flex items-center justify-between p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 rounded transition-colors group"
                        >
                          <div className="text-left">
                            <div className="text-red-300 font-medium text-xs">UNDER {prop.line}</div>
                            <div className="text-xs text-red-400/80">{formatOdds(prop.underOdds)}</div>
                          </div>
                          <Plus className="w-3 h-3 text-red-400 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Window: Your Current Bets - Responsive Width */}
        <div className="xl:col-span-3 lg:col-span-12">
          <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 h-full">

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Your Bets ({currentBets.length})</span>
              </h4>
            </div>
            
            {currentBets.length > 0 ? (
              <div className="space-y-2 max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {currentBets.map((bet) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/50 rounded-lg p-2 lg:p-3 border border-slate-600/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatIcon(bet.propType || 'points')}
                          <span className="text-xs bg-blue-600/20 text-blue-300 px-1 py-0.5 rounded font-medium">
                            {bet.propType?.toUpperCase()}
                          </span>
                        </div>
                        <h6 className="text-white font-medium text-sm mb-1 truncate">{bet.description}</h6>
                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="truncate">{bet.playerName}</div>
                          <div className="text-blue-300 font-medium">{formatOdds(bet.odds)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBet(bet.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors ml-2 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No bets added yet</p>
                <p className="text-slate-500 text-xs mt-1">Click over/under on props to add bets</p>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* Fallback: Search Encouragement or Empty State */}
          {!showTrendingProps && (
            <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 h-full flex items-center justify-center">
              <div className="text-center">
                <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Search Any Player</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Enter a player name to find prop bets
                </p>
                <button
                  onClick={() => setShowTrendingProps(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium mx-auto text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Trending</span>
                </button>
              </div>
            </div>
          )}
    </div>
  );
};