/**
 * Enhanced Predictions Tab - Real AI Predictions with Live Analysis
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeAIPredictionsService, RealAIPrediction } from '../../../services/realTimeAIPredictions';

export const EnhancedPredictionsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [valueFilter, setValueFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'expectedValue' | 'time'>('confidence');

  const { data: aiPredictions, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-predictions', selectedSport],
    queryFn: async () => {
      console.log('🤖 Generating real-time AI predictions...');
      const predictions = await realTimeAIPredictionsService.generateLivePredictions();
      console.log(`✅ Generated ${predictions.length} AI predictions`);
      return predictions;
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  const filteredPredictions = React.useMemo(() => {
    if (!aiPredictions) return [];

    let filtered = aiPredictions.filter(pred => {
      // Sport filter
      if (selectedSport !== 'all' && pred.sport !== selectedSport) return false;
      
      // Confidence filter
      const maxConfidence = Math.max(
        pred.predictions.moneyline.confidence,
        pred.predictions.spread.confidence,
        pred.predictions.total.confidence
      );
      if (maxConfidence < confidenceFilter) return false;
      
      // Value filter
      if (valueFilter !== 'all' && pred.analysis.value !== valueFilter) return false;
      
      return true;
    });

    // Sort predictions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          const aMaxConf = Math.max(a.predictions.moneyline.confidence, a.predictions.spread.confidence, a.predictions.total.confidence);
          const bMaxConf = Math.max(b.predictions.moneyline.confidence, b.predictions.spread.confidence, b.predictions.total.confidence);
          return bMaxConf - aMaxConf;
        case 'expectedValue':
          const aMaxEV = Math.max(a.predictions.moneyline.expectedValue, a.predictions.spread.expectedValue, a.predictions.total.expectedValue);
          const bMaxEV = Math.max(b.predictions.moneyline.expectedValue, b.predictions.spread.expectedValue, b.predictions.total.expectedValue);
          return bMaxEV - aMaxEV;
        case 'time':
          return new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [aiPredictions, selectedSport, confidenceFilter, valueFilter, sortBy]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return '🔥';
    if (confidence >= 60) return '⚡';
    return '⚠️';
  };

  const getValueColor = (value: string) => {
    switch (value) {
      case 'high': return 'text-green-400 bg-green-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-red-300 font-semibold text-lg mb-2">AI Analysis Unavailable</h3>
          <p className="text-red-200 text-sm mb-4">
            Unable to generate AI predictions. This could be due to limited game data or API issues.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🤖 Retry AI Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <span>🤖</span>
          <span>Nova AI Predictions</span>
          <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full">LIVE</span>
        </h2>
        <p className="text-gray-300 text-sm">
          Real-time AI analysis and betting predictions • Model: Nova-AI-v3.1
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Sport Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">🏆 All Sports</option>
            <option value="NFL">🏈 NFL</option>
            <option value="NBA">🏀 NBA</option>
            <option value="College Football">🏫 College Football</option>
            <option value="MLB">⚾ MLB</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Confidence ({confidenceFilter}%)
          </label>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Value Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
          <select
            value={valueFilter}
            onChange={(e) => setValueFilter(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Values</option>
            <option value="high">🔥 High Value</option>
            <option value="medium">⚡ Medium Value</option>
            <option value="low">💤 Low Value</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="confidence">Confidence</option>
            <option value="expectedValue">Expected Value</option>
            <option value="time">Game Time</option>
          </select>
        </div>

        {/* Manual Refresh */}
        <div className="flex items-end">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? '🧠' : '🤖'}</span>
            <span>{isLoading ? 'Analyzing...' : 'Refresh AI'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{filteredPredictions.length}</div>
          <div className="text-sm text-gray-400">Active Predictions</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {filteredPredictions.filter(p => p.analysis.value === 'high').length}
          </div>
          <div className="text-sm text-gray-400">High Value Bets</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {filteredPredictions.filter(p => 
              Math.max(p.predictions.moneyline.confidence, p.predictions.spread.confidence, p.predictions.total.confidence) >= 80
            ).length}
          </div>
          <div className="text-sm text-gray-400">High Confidence</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(
              filteredPredictions.reduce((sum, p) => sum + Math.max(p.predictions.moneyline.expectedValue, p.predictions.spread.expectedValue, p.predictions.total.expectedValue), 0) / filteredPredictions.length * 100
            ) || 0}%
          </div>
          <div className="text-sm text-gray-400">Avg Expected Value</div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="text-4xl mb-4">🧠</div>
            <div className="text-white font-medium">AI Analyzing Games...</div>
            <div className="text-gray-400 text-sm">Generating predictions and calculating value</div>
          </div>
        </div>
      )}

      {/* Predictions List */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-white mb-2">No Predictions Available</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters or check back when more games are available.
                </p>
                <button
                  onClick={() => {
                    setSelectedSport('all');
                    setConfidenceFilter(0);
                    setValueFilter('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredPredictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors"
                >
                  <div className="p-6">
                    {/* Game Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-blue-400">
                            {prediction.sport}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getValueColor(prediction.analysis.value)}`}>
                            {prediction.analysis.value.toUpperCase()} VALUE
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-gray-700 ${getRiskColor(prediction.analysis.riskLevel)}`}>
                            {prediction.analysis.riskLevel.toUpperCase()} RISK
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {prediction.awayTeam} @ {prediction.homeTeam}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {prediction.gameDate} • {prediction.gameTime} ET
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-1">AI Model</div>
                        <div className="text-sm font-medium text-white">{prediction.modelVersion}</div>
                      </div>
                    </div>

                    {/* AI Predictions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Moneyline Prediction */}
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Moneyline</h4>
                          <span className={`text-sm flex items-center space-x-1 ${getConfidenceColor(prediction.predictions.moneyline.confidence)}`}>
                            <span>{getConfidenceIcon(prediction.predictions.moneyline.confidence)}</span>
                            <span>{prediction.predictions.moneyline.confidence}%</span>
                          </span>
                        </div>
                        <div className="text-white font-semibold mb-1">
                          {prediction.predictions.moneyline.pick === 'home' ? prediction.homeTeam : prediction.awayTeam}
                        </div>
                        <div className="text-xs text-green-400 mb-2">
                          Expected Value: {prediction.predictions.moneyline.expectedValue > 0 ? '+' : ''}{prediction.predictions.moneyline.expectedValue}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {prediction.predictions.moneyline.reasoning}
                        </div>
                      </div>

                      {/* Spread Prediction */}
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Spread</h4>
                          <span className={`text-sm flex items-center space-x-1 ${getConfidenceColor(prediction.predictions.spread.confidence)}`}>
                            <span>{getConfidenceIcon(prediction.predictions.spread.confidence)}</span>
                            <span>{prediction.predictions.spread.confidence}%</span>
                          </span>
                        </div>
                        <div className="text-white font-semibold mb-1">
                          {prediction.predictions.spread.pick === 'home' ? prediction.homeTeam : prediction.awayTeam} {prediction.predictions.spread.line > 0 ? '+' : ''}{prediction.predictions.spread.line}
                        </div>
                        <div className="text-xs text-green-400 mb-2">
                          Expected Value: {prediction.predictions.spread.expectedValue > 0 ? '+' : ''}{prediction.predictions.spread.expectedValue}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {prediction.predictions.spread.reasoning}
                        </div>
                      </div>

                      {/* Total Prediction */}
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Total</h4>
                          <span className={`text-sm flex items-center space-x-1 ${getConfidenceColor(prediction.predictions.total.confidence)}`}>
                            <span>{getConfidenceIcon(prediction.predictions.total.confidence)}</span>
                            <span>{prediction.predictions.total.confidence}%</span>
                          </span>
                        </div>
                        <div className="text-white font-semibold mb-1">
                          {prediction.predictions.total.pick.toUpperCase()} {prediction.predictions.total.line}
                        </div>
                        <div className="text-xs text-green-400 mb-2">
                          Expected Value: {prediction.predictions.total.expectedValue > 0 ? '+' : ''}{prediction.predictions.total.expectedValue}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {prediction.predictions.total.reasoning}
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="border-t border-gray-600 pt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">AI Analysis</h4>
                      
                      {/* Key Factors */}
                      {prediction.analysis.keyFactors.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs text-gray-400 mb-1">Key Factors:</h5>
                          <div className="flex flex-wrap gap-2">
                            {prediction.analysis.keyFactors.map((factor, i) => (
                              <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trends */}
                      {prediction.analysis.trends.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs text-gray-400 mb-1">Trends:</h5>
                          <div className="text-xs text-gray-300">
                            {prediction.analysis.trends.join(' • ')}
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div className="flex space-x-4">
                          {prediction.analysis.weather && (
                            <span>Weather: {prediction.analysis.weather}</span>
                          )}
                          {prediction.analysis.injuries.length > 0 && (
                            <span>⚠️ Injuries: {prediction.analysis.injuries.length}</span>
                          )}
                        </div>
                        <div>
                          Updated: {new Date(prediction.lastUpdated).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Disclaimer */}
      <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-purple-400 text-lg">🧠</div>
          <div>
            <h4 className="font-medium text-purple-300 mb-1">Nova AI Predictions</h4>
            <p className="text-purple-200 text-sm">
              Powered by advanced machine learning algorithms analyzing team performance, 
              recent trends, injuries, and market inefficiencies. 
              Predictions update every 10 minutes with live data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};