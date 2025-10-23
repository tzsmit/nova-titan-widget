/**
 * Quick Compare Panel - Fast Player/Team Comparison Tools
 * Replace Legacy AI Analysis with professional comparison interface
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  GitCompare,
  User,
  Shield,
  Search,
  Plus,
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Star,
  Clock,
  ArrowRight,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import { quickComparisonService, QuickComparison } from '../../services/quickComparisonService';

// Using ComparisonItem interface from quickComparisonService
import type { ComparisonItem } from '../../services/quickComparisonService';

interface QuickComparePanelProps {
  className?: string;
}

export const QuickComparePanel: React.FC<QuickComparePanelProps> = ({ 
  className = '' 
}) => {
  const [selectedItems, setSelectedItems] = useState<ComparisonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Fetch dynamic quick comparison suggestions from live data
  const { 
    data: quickComparisons = [], 
    isLoading: quickComparisonsLoading,
    refetch: refetchQuickComparisons 
  } = useQuery({
    queryKey: ['quick-comparisons'],
    queryFn: () => quickComparisonService.getQuickComparisons(),
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const addItem = (item: ComparisonItem) => {
    if (selectedItems.length < 4 && !selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const runComparison = async () => {
    if (selectedItems.length < 2) return;

    setIsComparing(true);
    
    // Simulate comparison analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setComparisonResults({
      winner: selectedItems[0],
      confidence: 78,
      keyDifferences: [
        'Recent performance trending upward',
        'Better matchup advantages',
        'Statistical edge in key metrics'
      ],
      metrics: selectedItems.map((item, index) => ({
        name: item.name,
        stats: {
          performance: 75 + (index * 5),
          consistency: 80 - (index * 3),
          trend: index === 0 ? 'up' : 'down',
          value: 8.5 + (index * 0.3)
        }
      }))
    });
    
    setIsComparing(false);
  };

  const loadQuickComparison = (comparison: QuickComparison) => {
    setSelectedItems(comparison.items);
    setComparisonResults(null);
  };

  return (
    <div className={`nova-card ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--nova-cyan-500) 0%, var(--nova-primary-500) 100%)' 
              }}
            >
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                Quick Compare
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Compare players and teams instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Comparison Buttons */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 
              className="text-sm font-semibold"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              Quick Comparisons
            </h4>
            <motion.button
              onClick={() => refetchQuickComparisons()}
              disabled={quickComparisonsLoading}
              whileHover={{ scale: quickComparisonsLoading ? 1 : 1.05 }}
              whileTap={{ scale: quickComparisonsLoading ? 1 : 0.95 }}
              className="nova-btn-secondary p-1 text-xs"
              title="Refresh comparisons"
            >
              <RefreshCw className={`w-3 h-3 ${quickComparisonsLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickComparisonsLoading ? (
              <div className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
                Loading dynamic comparisons...
              </div>
            ) : quickComparisons.length > 0 ? (
              quickComparisons.map((comparison) => (
                <motion.button
                  key={comparison.id}
                  onClick={() => loadQuickComparison(comparison)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="nova-btn-secondary text-sm"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {comparison.title}
                </motion.button>
              ))
            ) : (
              <div className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
                No comparisons available
              </div>
            )}
          </div>
        </div>

        {/* Selected Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 
              className="text-sm font-semibold"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              Selected ({selectedItems.length}/4)
            </h4>
            {selectedItems.length > 0 && (
              <button
                onClick={() => setSelectedItems([])}
                className="nova-btn-secondary text-xs px-2 py-1"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {selectedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="nova-metric-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        item.type === 'player' 
                          ? 'bg-blue-500/20' 
                          : 'bg-purple-500/20'
                      }`}>
                        {item.type === 'player' ? (
                          <User className={`w-3 h-3 ${
                            item.type === 'player' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                        ) : (
                          <Shield className={`w-3 h-3 ${
                            item.type === 'player' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div 
                          className="text-sm font-medium"
                          style={{ color: 'var(--nova-text-primary)' }}
                        >
                          {item.name}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: 'var(--nova-text-secondary)' }}
                        >
                          {item.team || item.sport}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="nova-btn-secondary p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8 border-2 border-dashed rounded-xl"
              style={{ borderColor: 'var(--nova-glass-border)' }}
            >
              <GitCompare 
                className="w-12 h-12 mx-auto mb-3" 
                style={{ color: 'var(--nova-text-muted)' }} 
              />
              <p 
                className="text-sm"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Select items to compare or use quick comparisons above
              </p>
            </div>
          )}

          {/* Compare Button */}
          {selectedItems.length >= 2 && (
            <motion.button
              onClick={runComparison}
              disabled={isComparing}
              whileHover={{ scale: isComparing ? 1 : 1.02 }}
              whileTap={{ scale: isComparing ? 1 : 0.98 }}
              className="nova-btn-primary w-full py-3"
            >
              {isComparing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                  </motion.div>
                  Analyzing Comparison...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare {selectedItems.length} Items
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Comparison Results */}
        <AnimatePresence>
          {comparisonResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="nova-card p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 
                  className="text-base font-semibold"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  Comparison Results
                </h4>
                <button
                  onClick={() => setComparisonResults(null)}
                  className="nova-btn-secondary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Winner */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div 
                    className="text-sm font-semibold text-green-400"
                  >
                    Recommended: {comparisonResults.winner.name}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--nova-text-secondary)' }}
                  >
                    {comparisonResults.confidence}% confidence
                  </div>
                </div>
              </div>

              {/* Key Differences */}
              <div className="mb-4">
                <h5 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  Key Advantages
                </h5>
                <div className="space-y-1">
                  {comparisonResults.keyDifferences.map((diff: string, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span style={{ color: 'var(--nova-text-secondary)' }}>
                        {diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {comparisonResults.metrics.map((metric: any, index: number) => (
                  <div 
                    key={index}
                    className="nova-metric-card p-3"
                  >
                    <div 
                      className="text-sm font-medium mb-2"
                      style={{ color: 'var(--nova-text-primary)' }}
                    >
                      {metric.name}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--nova-text-secondary)' }}
                        >
                          Performance
                        </span>
                        <span 
                          className="text-xs font-medium"
                          style={{ color: 'var(--nova-text-primary)' }}
                        >
                          {metric.stats.performance}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--nova-text-secondary)' }}
                        >
                          Trend
                        </span>
                        <div className="flex items-center gap-1">
                          {metric.stats.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span 
                            className={`text-xs font-medium ${
                              metric.stats.trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {metric.stats.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};