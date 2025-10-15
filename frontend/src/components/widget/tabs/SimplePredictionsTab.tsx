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
  BookOpen
} from 'lucide-react';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { SportsBettingLegend } from '../../ui/SportsBettingLegend';

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
  const [minConfidence, setMinConfidence] = useState(30); // Much lower threshold for more results
  const [showLegend, setShowLegend] = useState(false);

  // Fetch AI predictions
  const { data: predictions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simple-predictions', selectedSport, minConfidence],
    queryFn: async () => {
      console.log(`🤖 Generating AI predictions for ${selectedSport}...`);
      
      try {
        const allPredictions = await realTimeAIPredictionsService.generateLivePredictions();
        
        console.log(`📊 Generated ${allPredictions.length} predictions`);
        
        if (allPredictions.length > 0) {
          console.log('Sample prediction structure:', allPredictions[0]);
        }
        
        // Debug: Log first few predictions to understand structure
        if (allPredictions.length > 0) {
          console.log('🔍 Debug first prediction:', JSON.stringify(allPredictions[0], null, 2));
          console.log('🔍 Prediction sports found:', [...new Set(allPredictions.map(p => p.sport || p.sport_key || 'unknown'))]);
        }
        
        // Filter by sport and confidence with robust checks
        const filtered = allPredictions
          .filter(pred => {
            // Much more lenient filtering - only check basic structure
            if (!pred) {
              console.warn('⚠️ Null prediction:', pred);
              return false;
            }
            
            // Very lenient sport filter - accept almost everything when 'all' is selected
            const sportMatch = selectedSport === 'all' || 
                              (pred.sport && pred.sport.toLowerCase().includes(selectedSport.toLowerCase())) ||
                              (pred.sport_key && pred.sport_key.toLowerCase().includes(selectedSport.toLowerCase())) ||
                              selectedSport === 'all';
            
            // Very lenient confidence filter - accept almost anything
            const confidence = pred.predictions?.moneyline?.confidence || 
                              pred.confidence ||
                              75; // Default confidence if missing
            const confidenceMatch = minConfidence <= 30 ? true : confidence >= minConfidence;
            
            const passed = sportMatch && confidenceMatch;
            if (!passed) {
              console.log(`❌ Filtered out prediction: sport=${pred.sport || pred.sport_key}, confidence=${confidence}, sportMatch=${sportMatch}, confidenceMatch=${confidenceMatch}`);
            }
            
            return passed;
          })
          .slice(0, 50); // Much higher limit for more results
          
        console.log(`✅ Filtered to ${filtered.length} predictions (sport: ${selectedSport}, minConfidence: ${minConfidence})`);
        return filtered;
        
      } catch (error) {
        console.error('Error fetching predictions:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400 bg-green-900/30';
    if (confidence >= 80) return 'text-blue-400 bg-blue-900/30';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-slate-400 bg-slate-900/30';
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-red-400 font-semibold mb-2">AI Predictions Unavailable</h3>
          <p className="text-red-300 text-sm mb-4">Unable to load predictions. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-100">AI Predictions</h2>
          <HelpTooltip 
            content="AI analyzes team stats, recent performance, injuries, and historical data to generate predictive recommendations with confidence scores." 
            position="bottom"
            size="lg"
          />
        </div>
        <p className="text-slate-300">Advanced machine learning predictions</p>
      </div>

      {/* Controls - Mobile Optimized */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-4">
          {/* Sport Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">Sport:</span>
            <HelpTooltip content="Filter AI predictions by sport league. Each sport uses different statistical models for optimal accuracy." position="top" size="md" />
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

          {/* Confidence Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">Min Confidence:</span>
            <HelpTooltip 
              content="Filter predictions by AI confidence level. Higher percentages indicate stronger algorithmic certainty in the prediction." 
              position="top"
              size="md"
            />
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
              {[60, 70, 80, 90].map((conf) => (
                <button
                  key={conf}
                  onClick={() => setMinConfidence(conf)}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-all
                    ${minConfidence === conf
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  {conf}%+
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

      {/* Predictions */}
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
              <div className="text-slate-300 font-medium">Generating AI predictions...</div>
            </div>
          </motion.div>
        ) : predictions.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="text-slate-400 mb-4">No predictions found for the selected filters</div>
            <button
              onClick={() => {
                setSelectedSport('all');
                setMinConfidence(60);
              }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="predictions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {predictions.map((prediction: any, index: number) => (
              <motion.div
                key={prediction.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-600 rounded-xl overflow-hidden hover:border-slate-500 transition-all"
              >
                {/* Prediction Header */}
                <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 bg-purple-600 text-white rounded font-medium">
                        AI PREDICTION
                      </div>
                      <div className="text-slate-300 text-sm">
                        {prediction.sport?.toUpperCase() || 'NFL'}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded font-medium ${getConfidenceColor(prediction.predictions?.moneyline?.confidence || prediction.confidence || 75)} flex items-center gap-1`}>
                      <Star className="h-3 w-3" />
                      {prediction.predictions?.moneyline?.confidence || prediction.confidence || 75}% Confidence
                      <HelpTooltip 
                        content="AI confidence level based on data analysis. 90%+ = Very High, 80%+ = High, 70%+ = Medium confidence." 
                        position="left"
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                {/* Game & Prediction */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-100 mb-2">
                        {prediction.awayTeam} @ {prediction.homeTeam}
                      </h3>
                      <div className="text-slate-400 text-sm">
                        {prediction.gameDate ? new Date(prediction.gameDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Today'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-100 font-semibold mb-1">
                        Prediction: {prediction.predictions?.moneyline?.pick || 'home'}
                      </div>
                      <div className="text-sm text-green-400 flex items-center gap-1">
                        +{prediction.predictions?.moneyline?.expectedValue || 5}% EV
                        <HelpTooltip content="Expected Value - indicates if this bet is theoretically profitable over time. Positive EV suggests good long-term value." position="left" size="lg" />
                      </div>
                    </div>
                  </div>

                  {/* All Predictions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Moneyline */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                        MONEYLINE
                        <HelpTooltip content="AI prediction for which team will win the game outright, regardless of the score margin." position="top" size="md" />
                      </div>
                      <div className="text-center">
                        <div className="text-slate-100 font-semibold">
                          {prediction.predictions?.moneyline?.pick || 'home'}
                        </div>
                        <div className="text-green-400 text-sm">
                          {prediction.predictions?.moneyline?.confidence || 75}% conf.
                        </div>
                      </div>
                    </div>

                    {/* Spread */}
                    {prediction.predictions?.spread && (
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                          SPREAD
                          <HelpTooltip content="AI prediction for point spread betting. The favorite must win by more than the spread number." position="top" size="md" />
                        </div>
                        <div className="text-center">
                          <div className="text-slate-100 font-semibold">
                            {prediction.predictions?.spread?.pick || 'home'}
                          </div>
                          <div className="text-blue-400 text-sm">
                            {prediction.predictions?.spread?.confidence || 75}% conf.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    {prediction.predictions?.total && (
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-xs text-slate-400 mb-2 text-center flex items-center justify-center gap-1">
                          TOTAL
                          <HelpTooltip content="AI prediction for Over/Under betting on the combined points scored by both teams." position="top" size="md" />
                        </div>
                        <div className="text-center">
                          <div className="text-slate-100 font-semibold">
                            {prediction.predictions?.total?.pick || 'over'}
                          </div>
                          <div className="text-yellow-400 text-sm">
                            {prediction.predictions?.total?.confidence || 75}% conf.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {prediction.analysis && (
                    <div className="mt-4 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <div className="text-xs text-blue-300 font-semibold mb-2 flex items-center gap-1">
                        AI ANALYSIS
                        <HelpTooltip content="Detailed AI reasoning based on team statistics, recent performance, injuries, and historical matchup data." position="top" size="lg" />
                      </div>
                      <div className="text-slate-300 text-sm">
                        {typeof prediction.analysis === 'string' ? prediction.analysis.slice(0, 150) : 'AI analysis available'}...
                      </div>
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