/**
 * Pristine AI Interface - Minimal, Elegant Sports Analytics Engine
 * "Concise Output: Only essential insights are displayed"
 * "Clean formatting, no clutter, minimal UI distractions"
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  Send, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Users,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Mic,
  MicOff,
  RefreshCw
} from 'lucide-react';
import { aiReasoningEngine, AIInsight } from '../../services/aiReasoningEngine';
import { dataValidationService } from '../../services/dataValidationService';
import { realTimeOddsService } from '../../services/realTimeOddsService';

interface PristineAIInterfaceProps {
  className?: string;
}

export const PristineAIInterface: React.FC<PristineAIInterfaceProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [showCacheStats, setShowCacheStats] = useState(false); // Priority Fix #14
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [quickSuggestions] = useState([
    "🏀 Top NBA prop tonight",
    "🏈 College football upset picks", 
    "📈 Best trending over/unders",
    "⚡ Sharp money movements",
    "🎯 High confidence parlays",
    "📊 Player performance analysis"
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to insight when new one appears
  useEffect(() => {
    if (currentInsight && insightRef.current) {
      insightRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentInsight]);

  const handleAnalyze = async (queryText: string = query) => {
    if (!queryText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setQuery('');

    try {
      console.log(`🧠 Processing query: "${queryText}"`);
      const insight = await aiReasoningEngine.analyzeQuery(queryText);
      
      setCurrentInsight(insight);
      setRecentInsights(prev => [insight, ...prev.slice(0, 4)]); // Keep last 5
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setCurrentInsight({
        id: 'error_' + Date.now(),
        query: queryText,
        insight: 'Unable to analyze query at the moment. Please try rephrasing or check back shortly.',
        confidence: 0,
        reasoning: ['Analysis engine temporarily unavailable'],
        supportingStats: [],
        trackedEntities: [],
        timestamp: new Date().toISOString(),
        category: 'general'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || isAnalyzing) return;
    
    setIsRefreshing(true);
    
    try {
      console.log('🔄 Refreshing AI Pro - invalidating cache and fetching fresh data');
      
      // Priority Fix #14: Clear all caches for comprehensive refresh
      aiReasoningEngine.clearCache();
      dataValidationService.clearCache();
      realTimeOddsService.clearCache();
      console.log('💾 All caches cleared - AI reasoning, data validation, and live odds');
      
      // If there's a current insight, re-run the analysis with fresh data
      if (currentInsight) {
        console.log(`🧠 Re-analyzing: "${currentInsight.query}"`);
        const freshInsight = await aiReasoningEngine.analyzeQuery(currentInsight.query);
        
        setCurrentInsight(freshInsight);
        
        // Update recent insights with the refreshed version
        setRecentInsights(prev => {
          const filtered = prev.filter(insight => insight.id !== currentInsight.id);
          return [freshInsight, ...filtered.slice(0, 4)];
        });
        
        console.log('✅ Refresh complete - fresh data loaded');
        
        // Show success indicator
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
      } else {
        console.log('✅ Cache cleared - next query will use fresh data');
        
        // Show success indicator even when no current insight
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000);
      }
      
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleExpanded = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'var(--nova-success)';
    if (confidence >= 60) return 'var(--nova-warning)';
    return 'var(--nova-error)';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const renderInsightCard = (insight: AIInsight, isMain: boolean = false) => (
    <motion.div
      ref={isMain ? insightRef : undefined}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`nova-card ${isMain ? 'mb-6' : 'mb-4'}`}
      style={{
        background: 'var(--nova-glass-bg)',
        border: 'var(--nova-card-border)',
        backdropFilter: 'var(--nova-glass-backdrop)',
        WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
        boxShadow: isMain ? 'var(--nova-shadow-xl)' : 'var(--nova-shadow-md)',
        borderRadius: 'var(--nova-radius-xl)',
        padding: isMain ? 'var(--nova-space-6)' : 'var(--nova-space-4)'
      }}
    >
      {/* Query Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div 
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--nova-text-secondary)' }}
          >
            {insight.query}
          </div>
          <div 
            className={`text-xs px-2 py-1 rounded-full font-medium inline-block`}
            style={{
              background: insight.category === 'player_props' ? 'rgba(59, 130, 246, 0.2)' :
                         insight.category === 'team_analysis' ? 'rgba(16, 185, 129, 0.2)' :
                         insight.category === 'matchup_breakdown' ? 'rgba(139, 92, 246, 0.2)' :
                         'rgba(148, 163, 184, 0.2)',
              color: insight.category === 'player_props' ? 'var(--nova-primary-400)' :
                     insight.category === 'team_analysis' ? 'var(--nova-success)' :
                     insight.category === 'matchup_breakdown' ? 'var(--nova-purple-500)' :
                     'var(--nova-text-secondary)'
            }}
          >
            {insight.category.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        
        {/* Confidence Indicator */}
        <div className="flex flex-col items-end">
          <div 
            className="text-xl font-bold"
            style={{ color: getConfidenceColor(insight.confidence) }}
          >
            {insight.confidence}%
          </div>
          <div 
            className="text-xs"
            style={{ color: getConfidenceColor(insight.confidence) }}
          >
            {getConfidenceLabel(insight.confidence)}
          </div>
        </div>
      </div>

      {/* Main Insight - Concise and Essential */}
      <div 
        className={`${isMain ? 'text-lg' : 'text-base'} font-medium mb-4 leading-relaxed`}
        style={{ 
          color: 'var(--nova-text-primary)',
          lineHeight: 1.6
        }}
      >
        {insight.insight}
      </div>

      {/* Key Supporting Stats - Minimal but Informative */}
      {insight.supportingStats.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insight.supportingStats.slice(0, 4).map((stat, index) => (
              <div 
                key={index}
                className="text-center p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--nova-glass-border)'
                }}
              >
                <div 
                  className="text-sm font-semibold flex items-center justify-center gap-1"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                  {stat.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {stat.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                  {stat.value}
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Bar - Visual Cue */}
      <div className="mb-4">
        <div 
          className="h-2 bg-gray-700 rounded-full overflow-hidden"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: getConfidenceColor(insight.confidence) }}
            initial={{ width: 0 }}
            animate={{ width: `${insight.confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span style={{ color: 'var(--nova-text-secondary)' }}>Confidence</span>
          <span style={{ color: getConfidenceColor(insight.confidence) }}>
            {insight.confidence}%
          </span>
        </div>
      </div>

      {/* Expandable Details - "More Info" Sections */}
      {(insight.reasoning.length > 0 || insight.expandedAnalysis) && (
        <div className="space-y-3">
          {/* Reasoning Section */}
          {insight.reasoning.length > 0 && (
            <div>
              <button
                onClick={() => toggleExpanded(`reasoning-${insight.id}`)}
                className="flex items-center justify-between w-full p-2 rounded-lg nova-transition"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--nova-glass-border)'
                }}
              >
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  Key Reasoning ({insight.reasoning.length})
                </span>
                {expandedSections.has(`reasoning-${insight.id}`) ? 
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--nova-text-secondary)' }} /> :
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--nova-text-secondary)' }} />
                }
              </button>
              
              <AnimatePresence>
                {expandedSections.has(`reasoning-${insight.id}`) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div 
                      className="p-3 rounded-lg space-y-2"
                      style={{
                        background: 'rgba(0, 0, 0, 0.1)',
                        border: '1px solid var(--nova-glass-border)'
                      }}
                    >
                      {insight.reasoning.map((reason, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                          <span style={{ color: 'var(--nova-text-secondary)' }}>
                            {reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Expanded Analysis Sections */}
          {insight.expandedAnalysis && (
            <div className="space-y-2">
              {['trendAnalysis', 'scenarioSimulation', 'comparativeAnalysis'].map((section) => {
                const sectionKey = `analysis-${section}-${insight.id}`;
                const sectionTitle = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const sectionContent = insight.expandedAnalysis?.[section as keyof typeof insight.expandedAnalysis];
                
                if (!sectionContent) return null;
                
                return (
                  <div key={section}>
                    <button
                      onClick={() => toggleExpanded(sectionKey)}
                      className="flex items-center justify-between w-full p-2 rounded-lg nova-transition"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--nova-glass-border)'
                      }}
                    >
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--nova-text-primary)' }}
                      >
                        {sectionTitle}
                      </span>
                      {expandedSections.has(sectionKey) ? 
                        <ChevronUp className="w-4 h-4" style={{ color: 'var(--nova-text-secondary)' }} /> :
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--nova-text-secondary)' }} />
                      }
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.has(sectionKey) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2"
                        >
                          <div 
                            className="p-3 rounded-lg text-sm"
                            style={{
                              background: 'rgba(0, 0, 0, 0.1)',
                              border: '1px solid var(--nova-glass-border)',
                              color: 'var(--nova-text-secondary)'
                            }}
                          >
                            {sectionContent}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div 
        className="text-xs mt-4 pt-3 border-t flex items-center gap-2"
        style={{ 
          borderColor: 'var(--nova-glass-border)',
          color: 'var(--nova-text-muted)'
        }}
      >
        <Clock className="w-3 h-3" />
        {new Date(insight.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );

  return (
    <div 
      className={`w-full max-w-4xl mx-auto p-4 ${className}`}
      style={{ 
        fontFamily: 'var(--nova-font-family)',
        color: 'var(--nova-text-primary)'
      }}
    >
      {/* Pristine Header */}
      <div 
        className="p-6 rounded-2xl mb-6 nova-animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, var(--nova-primary-900) 0%, var(--nova-purple-600) 100%)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
          boxShadow: 'var(--nova-shadow-xl)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Nova Titan AI Engine
              </h1>
              <p className="text-white/80 text-sm">
                Think & Analyze • Pristine Sports Intelligence
              </p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <div className="relative">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing || isAnalyzing}
              whileHover={{ scale: isRefreshing ? 1 : 1.05 }}
              whileTap={{ scale: isRefreshing ? 1 : 0.95 }}
              className="p-3 rounded-xl nova-transition flex items-center gap-2"
              style={{
                background: (isRefreshing || isAnalyzing) 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: (isRefreshing || isAnalyzing) ? 'not-allowed' : 'pointer',
                opacity: (isRefreshing || isAnalyzing) ? 0.6 : 1,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title={isRefreshing ? 'Refreshing data...' : 'Refresh data and clear cache'}
            >
              <RefreshCw 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              <span className="text-sm font-medium hidden sm:inline">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </motion.button>

            {/* Priority Fix #14: Cache Statistics Button */}
            <motion.button
              onClick={() => setShowCacheStats(!showCacheStats)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg nova-transition"
              style={{
                background: showCacheStats 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title="View cache statistics and data quality metrics"
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </motion.button>
            
            {/* Success Indicator */}
            <AnimatePresence>
              {refreshSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  className="absolute -right-2 -top-2 bg-green-500/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-white shadow-lg"
                >
                  ✓ Fresh data
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Interface - Clean and Minimal */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about sports, analytics, or betting insights..."
                disabled={isAnalyzing}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-white/60 border-0 outline-none nova-transition"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <motion.button
              onClick={() => handleAnalyze()}
              disabled={!query.trim() || isAnalyzing}
              whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
              whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
              className="p-4 rounded-xl font-medium nova-transition"
              style={{
                background: (!query.trim() || isAnalyzing) 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, var(--nova-cyan-500) 0%, var(--nova-primary-500) 100%)',
                color: 'white',
                cursor: (!query.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
                opacity: (!query.trim() || isAnalyzing) ? 0.5 : 1
              }}
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Quick Suggestions */}
          {!currentInsight && !isAnalyzing && (
            <div className="flex flex-wrap gap-2 mt-4">
              {quickSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnalyze(suggestion)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-2 rounded-lg text-sm font-medium nova-transition"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white/80',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center py-12"
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
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div 
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: '3px solid transparent',
                  borderTop: '3px solid var(--nova-text-accent)',
                  borderRight: '3px solid var(--nova-primary-400)'
                }}
              ></div>
              <div className="absolute inset-2 flex items-center justify-center">
                <Brain className="w-8 h-8" style={{ color: 'var(--nova-text-accent)' }} />
              </div>
            </div>
            <div 
              className="font-semibold text-lg mb-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              Analyzing Query...
            </div>
            <div 
              className="text-sm"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              AI reasoning engine processing data
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Insight - Main Result */}
      {currentInsight && !isAnalyzing && renderInsightCard(currentInsight, true)}

      {/* Recent Insights - Secondary Results */}
      {recentInsights.length > 1 && !isAnalyzing && (
        <div className="mt-8">
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--nova-text-primary)' }}
          >
            Recent Analyses
          </h3>
          <div className="space-y-3">
            {recentInsights.slice(1, 4).map((insight) => renderInsightCard(insight, false))}
          </div>
        </div>
      )}

      {/* Priority Fix #14: Cache Statistics Panel */}
      <AnimatePresence>
        {showCacheStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 rounded-xl overflow-hidden"
            style={{
              background: 'var(--nova-glass-bg)',
              border: 'var(--nova-card-border)',
              backdropFilter: 'var(--nova-glass-backdrop)',
              WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--nova-text-primary)' }}>
                Data Validation & Cache Statistics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const cacheStats = dataValidationService.getCacheStats();
                const aiCacheStats = aiReasoningEngine.getCacheStats();
                
                return (
                  <>
                    {/* Cache Performance */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                      <div className="text-sm font-medium text-blue-300 mb-2">Cache Performance</div>
                      <div className="text-2xl font-bold text-white mb-1">{cacheStats.hitRate.toFixed(1)}%</div>
                      <div className="text-xs text-blue-200">Hit Rate</div>
                      <div className="text-xs text-blue-300 mt-2">{cacheStats.totalEntries} entries</div>
                    </div>

                    {/* Data Quality */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                      <div className="text-sm font-medium text-green-300 mb-2">Data Quality</div>
                      <div className="text-2xl font-bold text-white mb-1">{Math.max(0, cacheStats.totalEntries - cacheStats.invalidEntries)}</div>
                      <div className="text-xs text-green-200">Valid Entries</div>
                      {cacheStats.invalidEntries > 0 && (
                        <div className="text-xs text-red-300 mt-2">{cacheStats.invalidEntries} invalid</div>
                      )}
                    </div>

                    {/* AI Analysis Cache */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                      <div className="text-sm font-medium text-purple-300 mb-2">AI Analysis</div>
                      <div className="text-2xl font-bold text-white mb-1">{aiCacheStats.size}</div>
                      <div className="text-xs text-purple-200">Cached Analyses</div>
                      <div className="text-xs text-purple-300 mt-2">{aiCacheStats.queries.length} queries</div>
                    </div>

                    {/* Cache Freshness */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                      <div className="text-sm font-medium text-amber-300 mb-2">Cache Freshness</div>
                      <div className="text-2xl font-bold text-white mb-1">{cacheStats.stalEntries}</div>
                      <div className="text-xs text-amber-200">Stale Entries</div>
                      {cacheStats.newestEntry && (
                        <div className="text-xs text-amber-300 mt-2">
                          Latest: {new Date(cacheStats.newestEntry).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    {/* Memory Usage */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30">
                      <div className="text-sm font-medium text-cyan-300 mb-2">Memory Usage</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {(cacheStats.totalSize / 1024).toFixed(1)}
                      </div>
                      <div className="text-xs text-cyan-200">KB Cached</div>
                      <div className="text-xs text-cyan-300 mt-2">
                        {(cacheStats.totalSize / cacheStats.totalEntries || 0).toFixed(0)} bytes/entry
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
                      <div className="text-sm font-medium text-slate-300 mb-3">Cache Actions</div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            dataValidationService.validateAllCachedData();
                            console.log('🛡️ Validated all cached data');
                          }}
                          className="px-3 py-1 text-xs rounded bg-slate-600/50 text-slate-200 hover:bg-slate-500/50 transition-colors"
                        >
                          Validate All Data
                        </button>
                        <button
                          onClick={() => {
                            const invalidated = dataValidationService.invalidateCache(/stale/, ['odds']);
                            console.log('🗑️ Invalidated', invalidated, 'stale entries');
                          }}
                          className="px-3 py-1 text-xs rounded bg-slate-600/50 text-slate-200 hover:bg-slate-500/50 transition-colors"
                        >
                          Clear Stale Data
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};