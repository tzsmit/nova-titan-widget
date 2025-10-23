import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, User, Search, Target, DollarSign, TrendingUp } from 'lucide-react';
import { useWidgetStore } from '../../stores/widgetStore';
import { betManagementService } from '../../services/betManagementService';

interface QuickAccessPanelProps {
  className?: string;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ className = '' }) => {
  const { setSelectedTab } = useWidgetStore();
  
  // Get current bet slip summary
  const betSummary = betManagementService.getBetSlipSummary();

  const quickActions = [
    {
      id: 'parlays',
      title: 'Build Parlays',
      description: 'Create multi-leg parlays',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      action: () => setSelectedTab('parlays'),
      badge: betSummary.totalParlays > 0 ? betSummary.totalParlays : null
    },
    {
      id: 'player-props',
      title: 'Player Props',
      description: 'Search players & build props',
      icon: User,
      color: 'from-blue-500 to-purple-500',
      action: () => setSelectedTab('player-props'),
      badge: betSummary.totalBets > 0 ? betSummary.totalBets : null
    },
    {
      id: 'search',
      title: 'Quick Search',
      description: 'Find teams, players & bets',
      icon: Search,
      color: 'from-green-500 to-teal-500',
      action: () => {
        // Focus search input in header
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    }
  ];

  return (
    <div className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
        </div>
        {betSummary.totalStake > 0 && (
          <div className="flex items-center space-x-2 text-sm bg-green-600/20 text-green-300 px-2 py-1 rounded">
            <DollarSign className="w-3 h-3" />
            <span>${betSummary.totalStake.toFixed(0)} staked</span>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.action}
            className="relative group bg-slate-700/40 hover:bg-slate-600/40 rounded-lg p-4 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50"
          >
            {/* Badge */}
            {action.badge && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {action.badge}
              </div>
            )}

            {/* Icon with gradient background */}
            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-105 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors">
                {action.title}
              </h4>
              <p className="text-slate-400 text-xs">
                {action.description}
              </p>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>

      {/* Current Bets Summary */}
      {!betSummary.isEmpty && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-slate-600/30"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Active Bets: {betSummary.totalBets}</span>
            </div>
            <div className="text-green-400 font-semibold">
              Potential: ${betSummary.potentialPayout.toFixed(0)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Call to Action */}
      <div className="mt-4 text-center">
        <p className="text-slate-500 text-xs">
          Start building your bets with real NBA player data
        </p>
      </div>
    </div>
  );
};