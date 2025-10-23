/**
 * Top Insights Panel - AI-Generated Key Insights and Recommendations
 * Replace Legacy AI Analysis with curated insights feed
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { liveInsightsService, LiveInsight } from '../../services/liveInsightsService';
import {
  Lightbulb,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  RefreshCw,
  Eye,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Flame,
  DollarSign,
  Filter,
  ArrowRight
} from 'lucide-react';

// Using LiveInsight interface from liveInsightsService
type TopInsight = LiveInsight;

interface TopInsightsPanelProps {
  className?: string;
}

// NO MORE SAMPLE DATA - All insights are generated from live data sources

export const TopInsightsPanel: React.FC<TopInsightsPanelProps> = ({ 
  className = '' 
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Fetch live insights from real data sources
  const { 
    data: insights = [], 
    isLoading, 
    refetch,
    error 
  } = useQuery({
    queryKey: ['live-insights', selectedFilter],
    queryFn: () => liveInsightsService.getLiveInsights(selectedFilter),
    refetchInterval: 3 * 60 * 1000, // 3 minutes for fresh insights
    staleTime: 90 * 1000, // 90 seconds - insights should be fresh
    retry: 3,
    retryDelay: 2000
  });

  const getInsightIcon = (type: TopInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-4 h-4" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation':
        return <Star className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: TopInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'trend':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'alert':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'recommendation':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: TopInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
    }
  };

  const categories = ['all', 'NBA', 'NFL', 'MLB', 'NHL', 'Market Intelligence', 'Streak Analysis', 'Line Movement', 'Tracked Entities'];

  if (error) {
    return (
      <div className={`nova-card p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Insights Unavailable
          </h3>
          <p className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
            Unable to load insights
          </p>
          <button
            onClick={() => refetch()}
            className="nova-btn-primary mt-4 px-4 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`nova-card ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--nova-warning) 0%, var(--nova-primary-500) 100%)' 
              }}
            >
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                Top Insights
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                AI-powered recommendations and alerts
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => refetch()}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className="nova-btn-secondary p-2"
            title="Refresh insights"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap nova-transition ${
                selectedFilter === category 
                  ? 'nova-btn-primary' 
                  : 'nova-btn-secondary'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 mx-auto mb-3"
              >
                <Lightbulb className="w-8 h-8" style={{ color: 'var(--nova-text-accent)' }} />
              </motion.div>
              <p className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
                Generating fresh insights...
              </p>
            </div>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="nova-metric-card cursor-pointer"
                onClick={() => setExpandedInsight(
                  expandedInsight === insight.id ? null : insight.id
                )}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 
                          className="text-sm font-semibold leading-tight"
                          style={{ color: 'var(--nova-text-primary)' }}
                        >
                          {insight.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-3">
                          <span className={`text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                            {insight.confidence}%
                          </span>
                          <ArrowRight 
                            className={`w-3 h-3 transition-transform ${
                              expandedInsight === insight.id ? 'rotate-90' : ''
                            }`}
                            style={{ color: 'var(--nova-text-muted)' }}
                          />
                        </div>
                      </div>
                      
                      <p 
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: 'var(--nova-text-secondary)' }}
                      >
                        {insight.description}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{ 
                              background: 'var(--nova-glass-bg)',
                              color: 'var(--nova-text-accent)'
                            }}
                          >
                            {insight.category}
                          </span>
                          <span 
                            className={`text-xs font-medium uppercase px-1 ${getPriorityColor(insight.priority)}`}
                          >
                            {insight.priority}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" style={{ color: 'var(--nova-text-muted)' }} />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--nova-text-muted)' }}
                          >
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedInsight === insight.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                        style={{ borderColor: 'var(--nova-glass-border)' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" style={{ color: 'var(--nova-text-accent)' }} />
                            <span 
                              className="text-sm font-medium"
                              style={{ color: 'var(--nova-text-primary)' }}
                            >
                              Source: {insight.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ 
                                backgroundColor: insight.impact === 'positive' ? 'var(--nova-success)' : 
                                                insight.impact === 'negative' ? 'var(--nova-error)' : 
                                                'var(--nova-text-muted)'
                              }}
                            ></div>
                            <span 
                              className="text-xs capitalize"
                              style={{ color: 'var(--nova-text-secondary)' }}
                            >
                              {insight.impact} impact
                            </span>
                          </div>
                        </div>
                        
                        {/* Confidence Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span style={{ color: 'var(--nova-text-secondary)' }}>
                              Confidence Level
                            </span>
                            <span style={{ color: 'var(--nova-text-primary)' }}>
                              {insight.confidence}%
                            </span>
                          </div>
                          <div 
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ 
                                background: insight.confidence >= 80 ? 'var(--nova-success)' :
                                           insight.confidence >= 60 ? 'var(--nova-warning)' :
                                           'var(--nova-error)'
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${insight.confidence}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="nova-btn-primary w-full py-2 text-sm"
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          Explore This Insight
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb 
              className="w-12 h-12 mx-auto mb-3" 
              style={{ color: 'var(--nova-text-muted)' }} 
            />
            <h4 
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              No insights available
            </h4>
            <p 
              className="text-sm"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Check back soon for fresh AI-generated insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
};