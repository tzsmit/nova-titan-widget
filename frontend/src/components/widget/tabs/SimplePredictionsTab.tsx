/**
 * Simplified Predictions Tab - Clean AI Predictions Interface
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeAIPredictionsService } from '../../../services/realTimeAIPredictions';
import { 
  Brain,
  TrendingUp,
  Target,
  Star,
  Loader2,
  RefreshCw,
  Calendar,
  BookOpen,
  Search,
  X
} from 'lucide-react';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { SportsBettingLegend } from '../../ui/SportsBettingLegend';
import { formatPercentage, formatNumber } from '../../../utils/numberFormatting';
import { aiNetworkService } from '../../../services/aiNetworkService';

const SPORTS = [
  { id: 'all', name: 'All Sports', emoji: '🏆' },
  
  // Core US Sports (matching realTimeOddsService)
  { id: 'americanfootball_nfl', name: 'NFL', emoji: '🏈' },
  { id: 'basketball_nba', name: 'NBA', emoji: '🏀' },
  { id: 'americanfootball_ncaaf', name: 'College Football', emoji: '🏈' },
  { id: 'basketball_ncaab', name: 'College Basketball', emoji: '🏀' },
  { id: 'baseball_mlb', name: 'MLB', emoji: '⚾' },
  { id: 'boxing_boxing', name: 'Boxing', emoji: '🥊' }
];

export const SimplePredictionsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [minConfidence, setMinConfidence] = useState(30);
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHints, setSearchHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  
  // Generate search hints based on available data
  const getSearchHints = (query: string, predictions: any[]) => {
    if (!query || query.length < 2) return [];
    
    const teams = new Set<string>();
    const leagues = new Set<string>();
    
    predictions.forEach(pred => {
      if (pred.homeTeam?.toLowerCase().includes(query.toLowerCase())) {
        teams.add(pred.homeTeam);
      }
      if (pred.awayTeam?.toLowerCase().includes(query.toLowerCase())) {
        teams.add(pred.awayTeam);
      }
      const sport = SPORTS.find(s => s.id === pred.sport);
      if (sport && sport.name.toLowerCase().includes(query.toLowerCase())) {
        leagues.add(sport.name);
      }
    });
    
    return [...Array.from(teams), ...Array.from(leagues)].slice(0, 5);
  };

  const {
    data: predictionsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-predictions', selectedSport],
    queryFn: async () => {
      console.log(`🎯 AI Predictions Tab: Fetching predictions for sport "${selectedSport}"`);
      const result = await realTimeAIPredictionsService.getPredictions(selectedSport === 'all' ? undefined : selectedSport);
      console.log(`✅ AI Predictions Tab: Got ${result.predictions.length} predictions for sport "${selectedSport}"`);
      if (result.predictions.length > 0) {
        console.log('📝 Sample predictions:', result.predictions.slice(0, 3).map(p => ({
          sport: p.sport,
          teams: `${p.homeTeam} vs ${p.awayTeam}`,
          confidence: p.confidence
        })));
      }
      return result;
    },
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Update search hints when data or query changes
  React.useEffect(() => {
    if (predictionsData?.predictions && searchQuery) {
      const hints = getSearchHints(searchQuery, predictionsData.predictions);
      setSearchHints(hints);
      setShowHints(hints.length > 0);
    } else {
      setShowHints(false);
    }
  }, [searchQuery, predictionsData?.predictions]);

  const predictions = predictionsData?.predictions || [];
  
  // Filter predictions based on search and confidence
  const filteredPredictions = predictions.filter(prediction => {
    const confidenceMatch = (prediction.confidence || 0) >= minConfidence;
    if (!searchQuery) return confidenceMatch;
    
    const query = searchQuery.toLowerCase();
    const teamMatch = 
      prediction.homeTeam?.toLowerCase().includes(query) ||
      prediction.awayTeam?.toLowerCase().includes(query);
    const sportMatch = SPORTS.find(s => s.id === prediction.sport)?.name.toLowerCase().includes(query);
    
    return confidenceMatch && (teamMatch || sportMatch);
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'from-emerald-500 to-green-400';
    if (confidence >= 60) return 'from-blue-500 to-cyan-400';
    if (confidence >= 40) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <Star className="w-4 h-4" />;
    if (confidence >= 60) return <Target className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const handleSearchHintClick = (hint: string) => {
    setSearchQuery(hint);
    setShowHints(false);
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">Failed to load predictions</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      {/* Futuristic Header */}
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-3">
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
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Predictions Engine
              </h1>
              <p className="text-slate-400 text-sm">Advanced neural network sports intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLegend(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, leagues, or matchups..."
              className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Hints Dropdown */}
          <AnimatePresence>
            {showHints && searchHints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
              >
                {searchHints.map((hint, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchHintClick(hint)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sport Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">League Filter</label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <motion.button
                  key={sport.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSport === sport.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{sport.emoji}</span>
                  {sport.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="lg:w-80">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minimum Confidence: {minConfidence}%
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg pointer-events-none transition-all duration-300"
                style={{ width: `${minConfidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Brain className="w-12 h-12 text-cyan-400" />
              </motion.div>
              <div className="text-slate-300">Neural networks analyzing predictions...</div>
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredPredictions.map((prediction, index) => (
                <motion.div
                  key={`${prediction.gameId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {SPORTS.find(s => s.id === prediction.sport)?.emoji || '🏆'}
                        </span>
                        <span className="text-sm text-slate-400">
                          {SPORTS.find(s => s.id === prediction.sport)?.name || 'Sports'}
                        </span>
                      </div>
                      
                      {prediction.gameTime && (
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(prediction.gameTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span className="truncate">{prediction.homeTeam || 'Home Team'}</span>
                        <span className="mx-2 text-slate-400">vs</span>
                        <span className="truncate">{prediction.awayTeam || 'Away Team'}</span>
                      </div>
                    </div>

                    {/* Prediction */}
                    <div className="mb-4">
                      <div className="text-sm text-slate-400 mb-1">AI Prediction</div>
                      <div className="text-white font-medium">
                        {prediction.prediction || 'Processing...'}
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Confidence Level</span>
                        <div className="flex items-center space-x-1">
                          {getConfidenceIcon(prediction.confidence || 0)}
                          <span className="font-medium text-white">
                            {(prediction.confidence || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence || 0}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${getConfidenceColor(prediction.confidence || 0)}`}
                        />
                      </div>
                    </div>

                    {/* Analysis Section */}
                    {prediction.analysis && (
                      <div className="space-y-3">
                        {prediction.analysis.keyFactors && prediction.analysis.keyFactors.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-900/50 rounded-lg p-3"
                          >
                            <div className="text-sm font-medium text-cyan-400 mb-2">Key Factors</div>
                            <div className="text-xs text-slate-300 space-y-1">
                              {prediction.analysis.keyFactors.slice(0, 3).map((factor, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{factor}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {prediction.analysis.value && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-900/50 rounded-lg p-3"
                          >
                            <div className="text-sm font-medium text-green-400 mb-1">Value Assessment</div>
                            <div className="text-xs text-green-200">{prediction.analysis.value}</div>
                          </motion.div>
                        )}

                        {prediction.analysis.injuries && prediction.analysis.injuries.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-900/50 rounded-lg p-3"
                          >
                            <div className="text-sm font-medium text-red-400 mb-1">Injury Reports</div>
                            <div className="text-xs text-red-200">{prediction.analysis.injuries.join(', ')}</div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredPredictions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <div className="text-xl font-medium text-slate-400 mb-2">
              No predictions match your criteria
            </div>
            <div className="text-slate-500">
              Try adjusting your filters or search terms
            </div>
          </motion.div>
        )}
      </div>

      {/* Sports Betting Legend */}
      <SportsBettingLegend 
        isOpen={showLegend} 
        onClose={() => setShowLegend(false)} 
      />
    </div>
  );
};