/**
 * Parlays Tab - Seamless Experience with Pop-up Builder
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Star, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Clock, 
  Edit,
  Trash2,
  Calculator,
  Zap,
  Crown,
  Fire,
  Trophy
} from 'lucide-react';
import { SimpleParlayBuilder } from '../builders/SimpleParlayBuilder';
import { realTimeParlayService, SuggestedParlay } from '../../../services/realTimeParlayService';
import { betManagementService, Parlay } from '../../../services/betManagementService';
import { useQuery } from '@tanstack/react-query';

interface ParlayBet {
  id: string;
  legs: Array<{
    game: string;
    bet: string;
    odds: number;
    status: 'pending' | 'won' | 'lost';
  }>;
  totalOdds: number;
  potentialPayout: number;
  wager: number;
  status: 'active' | 'won' | 'lost' | 'pending';
  createdAt: string;
  timeRemaining?: string;
}

export const SimpleParlaysTab: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingParlay, setEditingParlay] = useState<ParlayBet | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedParlay | null>(null);
  const [activeParlays, setActiveParlays] = useState<ParlayBet[]>([]);
  const [completedParlays, setCompletedParlays] = useState<ParlayBet[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'completed' | 'suggested'>('suggested');

  // Fetch real AI suggestions
  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    error: suggestionsError
  } = useQuery({
    queryKey: ['parlay-suggestions'],
    queryFn: () => realTimeParlayService.generateSuggestedParlays(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });

  const suggestedParlays = suggestionsData || [];

  // Load real parlay data from betManagementService
  useEffect(() => {
    const loadActiveParlays = () => {
      try {
        const realActiveParlays = betManagementService.getActiveParlays();
        console.log('Loading active parlays from betManagementService:', realActiveParlays.length, 'parlays');
        
        // If there are no real parlays, ensure empty state
        if (!realActiveParlays || realActiveParlays.length === 0) {
          setActiveParlays([]);
          return;
        }
        
        // Transform real parlay data to display format
        const displayParlays: ParlayBet[] = realActiveParlays.map(parlay => ({
          id: parlay.id,
          legs: parlay.legs.map(leg => ({
            game: `${leg.team} vs ${leg.opponent || 'TBD'}`,
            bet: leg.description,
            odds: leg.odds,
            status: 'pending' as const
          })),
          totalOdds: parlay.combinedOdds,
          potentialPayout: parlay.potentialPayout,
          wager: parlay.stake,
          status: parlay.status === 'placed' ? 'active' : 'pending' as any,
          createdAt: new Date(parlay.created).toLocaleDateString(),
          timeRemaining: undefined
        }));
        
        setActiveParlays(displayParlays);
      } catch (error) {
        console.warn('Failed to load active parlays:', error);
        setActiveParlays([]);
      }
    };

    loadActiveParlays();
    
    // Set up interval to refresh parlays data
    const interval = setInterval(loadActiveParlays, 1000);
    
    return () => clearInterval(interval);
  }, []);



  const handleParlayPlaced = (betSlipId: string) => {
    console.log('New parlay placed:', betSlipId);
    setShowBuilder(false);
    setSelectedSuggestion(null);
    
    // Force refresh of active parlays from betManagementService
    try {
      const realActiveParlays = betManagementService.getActiveParlays();
      console.log('Refreshing active parlays after placement:', realActiveParlays);
      
      const displayParlays: ParlayBet[] = realActiveParlays.map(parlay => ({
        id: parlay.id,
        legs: parlay.legs.map(leg => ({
          game: `${leg.team} vs ${leg.opponent || 'TBD'}`,
          bet: leg.description,
          odds: leg.odds,
          status: 'pending' as const
        })),
        totalOdds: parlay.combinedOdds,
        potentialPayout: parlay.potentialPayout,
        wager: parlay.stake,
        status: parlay.status === 'placed' ? 'active' : 'pending' as any,
        createdAt: new Date(parlay.created).toLocaleDateString(),
        timeRemaining: undefined
      }));
      
      setActiveParlays(displayParlays);
    } catch (error) {
      console.warn('Failed to refresh active parlays after placement:', error);
    }
  };

  const handleUseSuggestedParlay = (suggestion: SuggestedParlay) => {
    console.log('Using suggested parlay:', suggestion);
    setSelectedSuggestion(suggestion);
    setEditingParlay(null);
    setShowBuilder(true);
  };

  const handleEditParlay = (parlay: ParlayBet) => {
    setEditingParlay(parlay);
    setShowBuilder(true);
  };

  const handleDeleteParlay = (parlayId: string) => {
    // Delete from betManagementService first
    const deleted = betManagementService.deleteActiveParlay(parlayId);
    
    if (deleted) {
      // Update local state to reflect the deletion
      setActiveParlays(prev => prev.filter(p => p.id !== parlayId));
      console.log('🗑️ Parlay deleted successfully from SimpleParlaysTab:', parlayId);
    } else {
      console.error('❌ Failed to delete parlay from betManagementService:', parlayId);
    }
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-400 bg-green-400/10';
      case 'lost': return 'text-red-400 bg-red-400/10';
      case 'active': return 'text-blue-400 bg-blue-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'from-green-500 to-emerald-400';
    if (confidence >= 80) return 'from-yellow-500 to-orange-400';
    return 'from-orange-500 to-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
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
                  rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity }
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                🧠 AI Parlay Engine
              </h1>
              <p className="text-slate-400 text-sm">Pristine AI-powered multi-leg recommendations • Think & Analyze</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Development: Clear localStorage button */}
            {import.meta.env.DEV && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('nova_titan_bets');
                  localStorage.removeItem('novaTitanParlays');
                  console.log('🧹 Cleared parlay localStorage data');
                  window.location.reload(); // Force refresh to clear state
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Development: Clear all parlay data"
              >
                Clear Data
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingParlay(null);
                setShowBuilder(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>New Parlay</span>
            </motion.button>
          </div>
        </motion.div>

        {/* View Mode Selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: 'active', name: 'Active Parlays', icon: Zap, count: activeParlays.length },
            { id: 'suggested', name: 'AI Suggestions', icon: Crown, count: suggestedParlays.length },
            { id: 'completed', name: 'History', icon: Clock, count: completedParlays.length }
          ].map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <mode.icon className="w-5 h-5" />
              <span>{mode.name}</span>
              {mode.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  viewMode === mode.id ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {mode.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Active Parlays */}
          {viewMode === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {activeParlays.map((parlay, index) => (
                <motion.div
                  key={parlay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-indigo-400/50 transition-all"
                >
                  {/* Parlay Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(parlay.status)}`}>
                        {parlay.status.toUpperCase()}
                      </div>
                      <div className="text-slate-400 text-sm">{parlay.createdAt}</div>
                      {parlay.timeRemaining && (
                        <div className="flex items-center space-x-1 text-orange-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{parlay.timeRemaining}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditParlay(parlay)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteParlay(parlay.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Parlay Legs */}
                  <div className="space-y-3 mb-4">
                    {parlay.legs.map((leg, legIndex) => (
                      <div key={legIndex} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                        <div>
                          <div className="text-white font-medium">{leg.game}</div>
                          <div className="text-slate-400 text-sm">{leg.bet}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400 font-bold">{formatOdds(leg.odds)}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            leg.status === 'won' ? 'bg-green-400' : 
                            leg.status === 'lost' ? 'bg-red-400' : 'bg-yellow-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Parlay Summary */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-4 border border-indigo-500/30">
                    <div>
                      <div className="text-slate-400 text-sm">Wager</div>
                      <div className="text-white font-bold">${parlay.wager}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-sm">Total Odds</div>
                      <div className="text-yellow-400 font-bold">+{parlay.totalOdds}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Potential Payout</div>
                      <div className="text-green-400 font-bold text-lg">${parlay.potentialPayout}</div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {activeParlays.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <div className="text-xl font-medium text-slate-400 mb-2">No active parlays</div>
                  <div className="text-slate-500 mb-4">Create your first parlay to get started</div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowBuilder(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold"
                  >
                    Build Parlay
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* AI Suggestions */}
          {viewMode === 'suggested' && (
            <motion.div
              key="suggested"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {suggestedParlays.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-400/50 transition-all"
                >
                  {/* Suggestion Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{suggestion.title}</h3>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${getConfidenceColor(suggestion.confidence)} text-white text-sm font-bold`}>
                      <Target className="w-4 h-4" />
                      <span>{suggestion.confidence}%</span>
                    </div>
                  </div>

                  {/* Legs */}
                  <div className="space-y-2 mb-4">
                    {suggestion.legs.map((leg, legIndex) => (
                      <div key={legIndex} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-white font-medium text-sm">{leg}</div>
                      </div>
                    ))}
                  </div>

                  {/* Reasoning */}
                  <div className="bg-purple-600/20 rounded-lg p-3 mb-4 border border-purple-500/30">
                    <div className="text-purple-400 text-sm font-medium mb-1">AI Analysis</div>
                    <div className="text-slate-300 text-sm">{suggestion.reasoning}</div>
                  </div>

                  {/* Total Odds and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-sm">Total Odds</div>
                      <div className="text-yellow-400 font-bold text-lg">+{suggestion.totalOdds}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUseSuggestedParlay(suggestion)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      Use This Parlay
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Completed Parlays */}
          {viewMode === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {completedParlays.map((parlay, index) => (
                <motion.div
                  key={parlay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`inline-flex px-2 py-1 rounded text-xs font-bold ${getStatusColor(parlay.status)}`}>
                        {parlay.status.toUpperCase()}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">{parlay.createdAt} • {parlay.legs.length} legs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Wager: ${parlay.wager}</div>
                      <div className={`font-bold ${parlay.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {parlay.status === 'won' ? `+$${parlay.potentialPayout}` : `-$${parlay.wager}`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pop-out Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-700"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingParlay ? 'Edit Parlay' : 'Parlay Builder'}
                    </h2>
                    <p className="text-slate-400 text-sm">Create your perfect multi-leg bet</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBuilder(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400 hover:text-white" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <SimpleParlayBuilder
                  onBetPlaced={handleParlayPlaced}
                  prePopulatedParlay={selectedSuggestion ? {
                    title: selectedSuggestion.title,
                    legs: selectedSuggestion.legs,
                    totalOdds: selectedSuggestion.totalOdds,
                    reasoning: selectedSuggestion.reasoning
                  } : null}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};