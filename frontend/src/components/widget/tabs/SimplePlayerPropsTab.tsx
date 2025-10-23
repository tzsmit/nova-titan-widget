/**
 * Player Props Tab - Beautiful Side-by-Side Layout with Pop-out Builder
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Star, 
  TrendingUp, 
  Target, 
  Clock, 
  Flame,
  Plus,
  X,
  Filter,
  Search,
  Settings,
  DollarSign
} from 'lucide-react';
import { SimplePlayerPropsBuilder } from '../builders/SimplePlayerPropsBuilder';

interface PlayerProp {
  id: string;
  playerName: string;
  position: string;
  team: string;
  opponent: string;
  gameTime: string;
  sport: string;
  popularity: number;
  props: Array<{
    type: string;
    description: string;
    line: number;
    overOdds: number;
    underOdds: number;
    trend?: string | null;
  }>;
}

export const SimplePlayerPropsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopularity, setFilterPopularity] = useState(0);

  // Enhanced trending props data
  const trendingProps: PlayerProp[] = [
    {
      id: 'curry_stephen',
      playerName: 'Stephen Curry',
      position: 'PG',
      team: 'Golden State Warriors',
      opponent: 'vs Lakers',
      gameTime: 'Tonight 7:00 PM',
      sport: 'basketball_nba',
      popularity: 95.2,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 28.5,
          overOdds: -110,
          underOdds: -110,
          trend: '🔥 Hot streak'
        },
        {
          type: 'threes_made',
          description: '3-Pointers Made',
          line: 5.5,
          overOdds: +115,
          underOdds: -135,
          trend: '🎯 Elite vs LAL'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 6.5,
          overOdds: -105,
          underOdds: -115,
          trend: null
        }
      ]
    },
    {
      id: 'james_lebron',
      playerName: 'LeBron James',
      position: 'SF',
      team: 'Los Angeles Lakers',
      opponent: 'vs Warriors',
      gameTime: 'Tonight 7:00 PM',
      sport: 'basketball_nba',
      popularity: 98.7,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 25.5,
          overOdds: -108,
          underOdds: -112,
          trend: '⚡ Prime time'
        },
        {
          type: 'rebounds',
          description: 'Total Rebounds',
          line: 7.5,
          overOdds: +102,
          underOdds: -122,
          trend: '📈 Strong vs GSW'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 8.5,
          overOdds: -115,
          underOdds: -105,
          trend: '🚀 Playmaker mode'
        }
      ]
    },
    {
      id: 'mahomes_patrick',
      playerName: 'Patrick Mahomes',
      position: 'QB',
      team: 'Kansas City Chiefs',
      opponent: 'vs Bills',
      gameTime: 'Sunday 1:00 PM',
      sport: 'americanfootball_nfl',
      popularity: 97.1,
      props: [
        {
          type: 'passing_yards',
          description: 'Passing Yards',
          line: 285.5,
          overOdds: -110,
          underOdds: -110,
          trend: '🔥 MVP form'
        },
        {
          type: 'passing_tds',
          description: 'Passing Touchdowns',
          line: 2.5,
          overOdds: +125,
          underOdds: -145,
          trend: '⚡ Red zone king'
        },
        {
          type: 'rushing_yards',
          description: 'Rushing Yards',
          line: 22.5,
          overOdds: -105,
          underOdds: -115,
          trend: null
        }
      ]
    },
    {
      id: 'allen_josh',
      playerName: 'Josh Allen',
      position: 'QB',
      team: 'Buffalo Bills',
      opponent: 'vs Chiefs',
      gameTime: 'Sunday 1:00 PM',
      sport: 'americanfootball_nfl',
      popularity: 94.3,
      props: [
        {
          type: 'passing_yards',
          description: 'Passing Yards',
          line: 275.5,
          overOdds: -108,
          underOdds: -112,
          trend: '📈 Big arm energy'
        },
        {
          type: 'rushing_yards',
          description: 'Rushing Yards',
          line: 35.5,
          overOdds: +110,
          underOdds: -130,
          trend: '🏃 Dual threat'
        },
        {
          type: 'passing_tds',
          description: 'Passing Touchdowns',
          line: 2.5,
          overOdds: +105,
          underOdds: -125,
          trend: null
        }
      ]
    },
    {
      id: 'tatum_jayson',
      playerName: 'Jayson Tatum',
      position: 'SF',
      team: 'Boston Celtics',
      opponent: 'vs 76ers',
      gameTime: 'Tomorrow 7:30 PM',
      sport: 'basketball_nba',
      popularity: 92.5,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 27.5,
          overOdds: -115,
          underOdds: -105,
          trend: '🎯 All-Star form'
        },
        {
          type: 'rebounds',
          description: 'Total Rebounds',
          line: 8.5,
          overOdds: +108,
          underOdds: -128,
          trend: '📊 Glass cleaner'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 4.5,
          overOdds: -102,
          underOdds: -118,
          trend: null
        }
      ]
    },
    {
      id: 'embiid_joel',
      playerName: 'Joel Embiid',
      position: 'C',
      team: 'Philadelphia 76ers',
      opponent: 'vs Celtics',
      gameTime: 'Tomorrow 7:30 PM',
      sport: 'basketball_nba',
      popularity: 89.8,
      props: [
        {
          type: 'points',
          description: 'Total Points',
          line: 29.5,
          overOdds: -105,
          underOdds: -115,
          trend: '💪 Dominant inside'
        },
        {
          type: 'rebounds',
          description: 'Total Rebounds',
          line: 11.5,
          overOdds: -120,
          underOdds: +100,
          trend: '🏀 Paint presence'
        },
        {
          type: 'assists',
          description: 'Total Assists',
          line: 5.5,
          overOdds: +125,
          underOdds: -145,
          trend: null
        }
      ]
    }
  ];

  // Filter props based on search and sport
  const filteredProps = trendingProps.filter(prop => {
    const matchesSport = selectedSport === 'all' || prop.sport === selectedSport;
    const matchesSearch = !searchQuery || 
      prop.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPopularity = prop.popularity >= filterPopularity;
    
    return matchesSport && matchesSearch && matchesPopularity;
  });

  const handlePropClick = (prop: PlayerProp, propData: any) => {
    setSelectedProp({ player: prop, prop: propData });
    setShowBuilder(true);
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 95) return 'from-red-500 to-orange-400';
    if (popularity >= 90) return 'from-orange-500 to-yellow-400';
    if (popularity >= 85) return 'from-yellow-500 to-green-400';
    return 'from-green-500 to-blue-400';
  };

  const getPopularityIcon = (popularity: number) => {
    if (popularity >= 95) return <Flame className="w-4 h-4" />;
    if (popularity >= 90) return <Star className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-slate-700/50">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Player Props Central
              </h1>
              <p className="text-slate-400 text-sm">Elite player performance betting intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBuilder(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Custom Builder</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players or teams..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          {/* Sport Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', name: 'All Sports', emoji: '🏆' },
              { id: 'basketball_nba', name: 'NBA', emoji: '🏀' },
              { id: 'americanfootball_nfl', name: 'NFL', emoji: '🏈' },
              { id: 'baseball_mlb', name: 'MLB', emoji: '⚾' },
            ].map((sport) => (
              <motion.button
                key={sport.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSport(sport.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSport === sport.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-2">{sport.emoji}</span>
                {sport.name}
              </motion.button>
            ))}
          </div>

          {/* Popularity Filter */}
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 text-sm whitespace-nowrap">Min Popularity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filterPopularity}
              onChange={(e) => setFilterPopularity(Number(e.target.value))}
              className="w-20 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white font-medium w-8">{filterPopularity}%</span>
          </div>
        </div>
      </div>

      {/* Player Props Grid - Side by Side in Threes */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredProps.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
                {/* Player Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{prop.playerName}</h3>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <span>{prop.position}</span>
                        <span>•</span>
                        <span>{prop.team}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Popularity Badge */}
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${getPopularityColor(prop.popularity)} text-white text-xs font-bold`}>
                    {getPopularityIcon(prop.popularity)}
                    <span>{prop.popularity}%</span>
                  </div>
                </div>

                {/* Game Info */}
                <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
                  <span>{prop.opponent}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{prop.gameTime}</span>
                  </div>
                </div>

                {/* Props List */}
                <div className="space-y-3">
                  {prop.props.map((propData, propIndex) => (
                    <motion.div
                      key={`${prop.id}-${propData.type}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handlePropClick(prop, propData)}
                      className="bg-slate-900/50 rounded-lg p-4 cursor-pointer hover:bg-slate-900/70 transition-all border border-slate-700/50 hover:border-purple-400/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{propData.description}</span>
                        {propData.trend && (
                          <span className="text-xs text-yellow-400 font-medium">{propData.trend}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-slate-400 text-sm">Line: <span className="text-white font-bold">{propData.line}</span></div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create proper prop data for over bet
                              const overPropData = {
                                ...propData,
                                playerId: prop.id,
                                playerName: prop.playerName,
                                position: prop.position,
                                team: prop.team,
                                propType: propData.type,
                                selection: 'over'
                              };
                              setSelectedProp({ player: prop, prop: overPropData });
                              setShowBuilder(true);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded font-bold transition-colors"
                          >
                            O {formatOdds(propData.overOdds)}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create proper prop data for under bet
                              const underPropData = {
                                ...propData,
                                playerId: prop.id,
                                playerName: prop.playerName,
                                position: prop.position,
                                team: prop.team,
                                propType: propData.type,
                                selection: 'under'
                              };
                              setSelectedProp({ player: prop, prop: underPropData });
                              setShowBuilder(true);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-bold transition-colors"
                          >
                            U {formatOdds(propData.underOdds)}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <div className="text-xl font-medium text-slate-400 mb-2">
              No player props match your criteria
            </div>
            <div className="text-slate-500">
              Try adjusting your filters or search terms
            </div>
          </motion.div>
        )}
      </div>

      {/* Pop-out Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Player Props Builder</h2>
                    <p className="text-slate-400 text-sm">Create custom prop bets with advanced analytics</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400 hover:text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <SimplePlayerPropsBuilder
                  onBetAdded={(betId) => {
                    console.log('Player prop bet added:', betId);
                    setShowBuilder(false);
                    setSelectedProp(null); // Clear selection after adding
                  }}
                  preSelectedProp={selectedProp}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};