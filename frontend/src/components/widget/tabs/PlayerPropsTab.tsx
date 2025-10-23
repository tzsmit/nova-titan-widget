/**
 * Smart Player Insights Tab - AI-Driven Performance Analytics & Safe Picks Engine
 * Transforms betting-focused props into educational performance intelligence
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { smartPlayerInsightsService, PlayerInsight } from '../../../services/smartPlayerInsightsService';
import { PlayerInsightModal } from '../../ui/PlayerInsightModal';

export const PlayerPropsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('NBA');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<'safe' | 'hot' | 'risky' | 'all'>('all');
  const [showAICoach, setShowAICoach] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    name: string;
    team?: string;
    position?: string;
    sport?: string;
    id?: string;
  } | null>(null);

  const { data: playerInsights, isLoading, error, refetch } = useQuery({
    queryKey: ['player-insights', selectedSport, selectedMetric, selectedCategory],
    queryFn: async () => {
      console.log(`🧠 Fetching Smart Player Insights for ${selectedSport}...`);
      const insights = await smartPlayerInsightsService.getPlayerInsights(
        selectedSport,
        selectedMetric === 'all' ? undefined : selectedMetric,
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      console.log(`✅ Generated ${insights.length} player insights`);
      return insights;
    },
    refetchInterval: false,
    staleTime: 10 * 60 * 1000, // 10 minutes for insights
  });

  const filteredInsights = playerInsights?.filter(insight => {
    if (selectedMetric !== 'all' && insight.metric !== selectedMetric) return false;
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    if (!insight.isActive) return false;
    return true;
  }) || [];

  const insightsStats = playerInsights ? smartPlayerInsightsService.getInsightsStats(playerInsights) : null;

  const getMetricsForSport = (sport: string) => {
    const metrics: Record<string, Array<{value: string; label: string}>> = {
      'NBA': [
        { value: 'all', label: '📊 All Metrics' },
        { value: 'Points', label: '🏀 Points' },
        { value: 'Rebounds', label: '📦 Rebounds' },
        { value: 'Assists', label: '🎯 Assists' },
        { value: 'Steals', label: '🔥 Steals' },
        { value: 'Blocks', label: '🛡️ Blocks' }
      ],
      'NFL': [
        { value: 'all', label: '📊 All Metrics' },
        { value: 'Passing Yards', label: '🏈 Passing Yards' },
        { value: 'Rushing Yards', label: '🏃 Rushing Yards' },
        { value: 'Receiving Yards', label: '🤲 Receiving Yards' },
        { value: 'Touchdowns', label: '🎯 Touchdowns' }
      ],
      'CFB': [
        { value: 'all', label: '📊 All Metrics' },
        { value: 'Passing Yards', label: '🏈 Passing Yards' },
        { value: 'Rushing Yards', label: '🏃 Rushing Yards' },
        { value: 'Receiving Yards', label: '🤲 Receiving Yards' },
        { value: 'Touchdowns', label: '🎯 Touchdowns' }
      ]
    };
    return metrics[sport] || metrics['NBA'];
  };

  const categoryFilters = [
    { value: 'all', label: '📊 All Picks', color: 'gray' },
    { value: 'safe', label: '🔒 Safe Picks', color: 'green' },
    { value: 'hot', label: '⚡ Hot Picks', color: 'orange' },
    { value: 'risky', label: '⚠️ Risky Picks', color: 'red' },
  ];

  const getCategoryColor = (category: 'safe' | 'hot' | 'risky') => {
    return {
      safe: 'green',
      hot: 'orange', 
      risky: 'red'
    }[category];
  };

  const getCategoryIcon = (category: 'safe' | 'hot' | 'risky') => {
    return {
      safe: '🔒',
      hot: '⚡',
      risky: '⚠️'
    }[category];
  };

  const getMetricIcon = (metric: string) => {
    const icons: Record<string, string> = {
      'Points': '🏀',
      'Rebounds': '📦',
      'Assists': '🎯',
      'Steals': '🔥',
      'Blocks': '🛡️',
      'Passing Yards': '🏈',
      'Rushing Yards': '🏃',
      'Receiving Yards': '🤲',
      'Touchdowns': '💪'
    };
    return icons[metric] || '📊';
  };

  const formatSafePickScore = (score: number) => {
    return `${score}/100`;
  };

  if (error) {
    return (
      <div className="p-6 text-center">
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
          <div className="text-5xl mb-4">🧠</div>
          <h3 
            className="font-bold text-lg mb-2"
            style={{ color: 'var(--nova-error)' }}
          >
            Unable to Generate Player Insights
          </h3>
          <p 
            className="text-sm mb-6"
            style={{ color: 'var(--nova-text-secondary)' }}
          >
            There was an issue generating smart player insights. This might be a temporary issue.
          </p>
          <motion.button
            onClick={() => refetch()}
            className="nova-btn-primary"
            style={{
              background: 'var(--nova-error)',
              borderColor: 'var(--nova-error)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Regenerate Insights
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-6 h-full overflow-y-auto"
      style={{ 
        fontFamily: 'var(--nova-font-family)',
        color: 'var(--nova-text-primary)'
      }}
    >
      {/* Nova Titan Header */}
      <div 
        className="p-6 rounded-2xl nova-animate-fade-in"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
          boxShadow: 'var(--nova-shadow-lg)'
        }}
      >
        <h2 className="nova-text-gradient text-2xl sm:text-3xl font-bold mb-3">
          🧠 Smart Player Insights
        </h2>
        <p 
          className="text-sm sm:text-base"
          style={{ color: 'var(--nova-text-secondary)' }}
        >
          AI-driven performance analytics and safe picks engine - educational intelligence, not gambling advice
        </p>
      </div>

      {/* AI Coach Toggle & Quick Stats */}
      {insightsStats && (
        <div 
          className="p-6 rounded-2xl nova-animate-slide-left"
          style={{
            background: 'linear-gradient(135deg, var(--nova-primary-900) 0%, var(--nova-purple-600) 100%)',
            border: 'var(--nova-card-border)',
            backdropFilter: 'var(--nova-glass-backdrop)',
            WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
            boxShadow: 'var(--nova-shadow-xl)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <h3 
                className="font-bold text-lg sm:text-xl"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                AI Performance Dashboard
              </h3>
            </div>
            <motion.button
              onClick={() => setShowAICoach(!showAICoach)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors self-start ${
                showAICoach 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {showAICoach ? 'Hide' : 'Show'} AI Coach
            </motion.button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{insightsStats.totalPlayers}</div>
              <div className="text-gray-300">Players Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{insightsStats.safeCount}</div>
              <div className="text-gray-300">🔒 Safe Picks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{insightsStats.hotCount}</div>
              <div className="text-gray-300">⚡ Hot Picks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{insightsStats.riskyCount}</div>
              <div className="text-gray-300">⚠️ Risky Picks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{insightsStats.avgSafePickScore}</div>
              <div className="text-gray-300">Avg Safe Score</div>
            </div>
          </div>
          
          <AnimatePresence>
            {showAICoach && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-blue-500/20"
              >
                <div className="bg-blue-900/20 rounded-lg p-3 text-sm text-blue-200">
                  <div className="font-medium mb-2">🎯 AI Coach Recommendations:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Focus on 🔒 Safe Picks for consistent performance tracking</li>
                    <li>• ⚡ Hot Picks show players with strong recent momentum</li>
                    <li>• ⚠️ Risky Picks offer high variance but educational value</li>
                    <li>• Safe Pick Scores above 75 indicate highest confidence</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
          {/* Sport Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setSelectedMetric('all'); // Reset metric when sport changes
              }}
              className="w-full bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="NBA">🏀 NBA</option>
              <option value="NFL">🏈 NFL</option>
              <option value="CFB">🏫 College Football</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Performance Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {getMetricsForSport(selectedSport).map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Refresh */}
          <div>
            <motion.button
              onClick={() => {
                smartPlayerInsightsService.clearCache();
                refetch();
              }}
              disabled={isLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs sm:text-sm"
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? '🔄' : '🧠'} <span className="hidden sm:inline">Generate Fresh</span> Insights
            </motion.button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Pick Category</label>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((category) => (
              <motion.button
                key={category.value}
                onClick={() => setSelectedCategory(category.value as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors border flex-1 sm:flex-initial ${
                  selectedCategory === category.value
                    ? `bg-${category.color}-600 text-white border-${category.color}-500`
                    : `bg-gray-800 text-gray-300 border-gray-600 hover:border-${category.color}-500 hover:text-${category.color}-300`
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Nova Titan Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center py-12"
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
            <div className="text-6xl mb-4 nova-animate-glow">🧠</div>
            <div 
              className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
              style={{
                border: '3px solid transparent',
                borderTop: '3px solid var(--nova-text-accent)',
                borderRight: '3px solid var(--nova-primary-400)'
              }}
            ></div>
            <div 
              className="font-semibold text-lg"
              style={{ 
                color: 'var(--nova-text-primary)',
                fontFamily: 'var(--nova-font-family)'
              }}
            >
              Generating Player Insights...
            </div>
            <div 
              className="text-sm mt-2"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              AI analyzing performance data
            </div>
          </div>
        </motion.div>
      )}

      {/* Player Insights Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredInsights.map((insight, index) => {
              const categoryColor = getCategoryColor(insight.category);
              const categoryIcon = getCategoryIcon(insight.category);
              const metricIcon = getMetricIcon(insight.metric);
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800 rounded-lg p-3 sm:p-4 border-2 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                    categoryColor === 'green' ? 'border-green-500/30 hover:border-green-400' :
                    categoryColor === 'orange' ? 'border-orange-500/30 hover:border-orange-400' :
                    'border-red-500/30 hover:border-red-400'
                  }`}
                  onClick={() => {
                    console.log(`🎯 PLAYER CLICKED: "${insight.playerName}" - Opening Player Insight Modal`);
                    setSelectedPlayer({
                      name: insight.playerName,
                      team: insight.team,
                      position: insight.position,
                      sport: selectedSport,
                      id: insight.id
                    });
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Header with Safe Pick Score */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-base sm:text-lg flex-shrink-0">{categoryIcon}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-xs sm:text-sm truncate hover:text-blue-300 transition-colors">
                          {insight.playerName}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {insight.team} vs {insight.opponent} • {insight.position}
                        </p>
                        <p className="text-xs text-blue-400 mt-1 opacity-75">
                          Click for insights & tracking →
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg sm:text-xl font-bold ${
                        categoryColor === 'green' ? 'text-green-400' :
                        categoryColor === 'orange' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {insight.safePickScore}
                      </div>
                      <div className="text-xs text-gray-400">Safe Score</div>
                    </div>
                  </div>

                  {/* Metric & Performance */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg">{metricIcon}</span>
                        <span className="text-xs sm:text-sm text-gray-300">{insight.metric}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-white">
                        {insight.projectedValue} proj
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">{insight.seasonAvg}</div>
                        <div className="text-gray-400">Season</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-semibold">{insight.last10Avg}</div>
                        <div className="text-gray-400">L10</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${
                          insight.last5Avg > insight.seasonAvg ? 'text-green-400' : 
                          insight.last5Avg < insight.seasonAvg ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {insight.last5Avg}
                        </div>
                        <div className="text-gray-400">L5</div>
                      </div>
                    </div>

                    {/* Safe Pick Score Meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Safe Pick Score</span>
                        <span className={`font-semibold ${
                          insight.safePickScore >= 75 ? 'text-green-400' :
                          insight.safePickScore >= 55 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {formatSafePickScore(insight.safePickScore)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            insight.safePickScore >= 75 ? 'bg-green-500' :
                            insight.safePickScore >= 55 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.safePickScore}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Analytics Breakdown */}
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">{insight.consistency}</div>
                        <div className="text-gray-400">Consistency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-semibold">{insight.formTrend}</div>
                        <div className="text-gray-400">Form</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-semibold">{insight.opponentWeakness}</div>
                        <div className="text-gray-400">Matchup</div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className={`p-3 rounded-lg text-xs ${
                      categoryColor === 'green' ? 'bg-green-900/20 text-green-200' :
                      categoryColor === 'orange' ? 'bg-orange-900/20 text-orange-200' :
                      'bg-red-900/20 text-red-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        <span className="text-sm">🤖</span>
                        <div>
                          <div className="font-medium mb-1">AI Analysis:</div>
                          <div>{insight.insight}</div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence & Category */}
                    <div className="flex justify-between items-center text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          insight.confidenceLevel === 'high'
                            ? 'bg-green-600/20 text-green-300'
                            : insight.confidenceLevel === 'medium'
                            ? 'bg-yellow-600/20 text-yellow-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}
                      >
                        {insight.confidenceLevel.toUpperCase()} CONFIDENCE
                      </span>
                      <span className="text-gray-500">
                        {new Date(insight.gameTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nova Titan Empty State */}
      {!isLoading && filteredInsights.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
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
            <h3 
              className="text-lg font-semibold mb-3"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              No Player Insights Available
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              {selectedMetric === 'all' && selectedCategory === 'all'
                ? `No player insights found for ${selectedSport}`
                : `No ${selectedCategory === 'all' ? '' : selectedCategory + ' '}${selectedMetric === 'all' ? 'insights' : selectedMetric + ' insights'} available`
              }
            </p>
            <motion.button
              onClick={() => {
                setSelectedMetric('all');
                setSelectedCategory('all');
              }}
              className="nova-btn-primary"
              whileTap={{ scale: 0.95 }}
            >
              🔄 Show All Insights
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Nova Titan Educational Banner */}
      <div 
        className="p-6 rounded-2xl nova-animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, var(--nova-success) 0%, var(--nova-info) 100%)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
          opacity: 0.9
        }}
      >
        <div className="flex items-start space-x-4">
          <div className="text-3xl">🎯</div>
          <div>
            <h4 
              className="font-bold text-lg mb-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              Educational Performance Intelligence
            </h4>
            <p className="text-green-200 text-sm">
              This system analyzes player performance data to identify consistent performers (🔒), trending players (⚡), and high-variance opportunities (⚠️). 
              Safe Pick Scores combine consistency, recent form, and matchup advantages for educational analysis only.
            </p>
          </div>
        </div>
      </div>

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