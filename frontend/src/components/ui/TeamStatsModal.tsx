/**
 * Team Stats Modal - Display comprehensive team statistics
 * Shows when user clicks on team names or logos throughout the app
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { teamStatsService, TeamStats } from '../../services/teamStatsService';
import { 
  X, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Users,
  Calendar,
  MapPin,
  Star,
  Activity,
  Shield,
  Zap
} from 'lucide-react';



interface TeamStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  teamLogo: string;
  onViewFullStats?: () => void;
  onPlayerProps?: () => void;
}

export const TeamStatsModal: React.FC<TeamStatsModalProps> = ({
  isOpen,
  onClose,
  teamName,
  teamLogo,
  onViewFullStats,
  onPlayerProps
}) => {
  // Fetch real team stats using React Query
  const { data: teamStats, isLoading, error } = useQuery({
    queryKey: ['team-stats', teamName],
    queryFn: () => teamStatsService.getTeamStats(teamName),
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle button clicks
  const handleViewFullStats = () => {
    if (onViewFullStats) {
      onViewFullStats();
    } else {
      // Default behavior - could open a new tab with team stats
      console.log(`View full stats for ${teamName}`);
    }
    onClose();
  };

  const handlePlayerProps = () => {
    if (onPlayerProps) {
      onPlayerProps();
    } else {
      // Default behavior - could navigate to player props tab
      console.log(`View player props for ${teamName}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading || !teamStats) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600/40 shadow-2xl p-8 flex items-center justify-center"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-slate-300">Loading team stats...</span>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600/40 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-slate-600/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={teamStats.logo} 
                  alt={teamStats.teamName}
                  className="w-16 h-16 rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="12" fill="#3B82F6"/>
                        <text x="32" y="40" font-family="Arial" font-size="18" fill="white" text-anchor="middle" font-weight="bold">
                          ${teamStats.teamName.split(' ').map(w => w[0]).join('').slice(0, 3)}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{teamStats.teamName}</h2>
                  <p className="text-slate-300">{teamStats.record} • {teamStats.conference} {teamStats.division}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
            {/* Recent Form & Games */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700/40 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Recent Form</h3>
                </div>
                <div className="flex space-x-2 mb-4">
                  {teamStats.recentForm.map((result, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        result === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">Last: {teamStats.lastGame}</p>
                  <p className="text-slate-300">Next: {teamStats.nextGame}</p>
                </div>
              </div>

              <div className="bg-slate-700/40 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Key Statistics</h3>
                </div>
                <div className="space-y-3">
                  {teamStats.keyStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">{stat.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{stat.value}</span>
                        {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {stat.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Players */}
            <div className="bg-slate-700/40 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Top Players</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teamStats.topPlayers.map((player, i) => (
                  <div key={i} className="bg-slate-600/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{player.name}</span>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{player.position}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{player.stats}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Injury Report */}
            {teamStats.injuries.length > 0 && (
              <div className="bg-slate-700/40 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-white">Injury Report</h3>
                </div>
                <div className="space-y-3">
                  {teamStats.injuries.map((injury, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-white">{injury.player}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 text-sm">{injury.injury}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          injury.status === 'Out' ? 'bg-red-600 text-white' : 
                          injury.status === 'Questionable' ? 'bg-yellow-600 text-white' : 
                          'bg-green-600 text-white'
                        }`}>
                          {injury.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-800/60 p-4 border-t border-slate-600/40">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Stats updated live • Nova Titan Elite</span>
              <div className="flex space-x-4">
                <button 
                  onClick={handleViewFullStats}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
                >
                  View Full Stats
                </button>
                <button 
                  onClick={handlePlayerProps}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium hover:underline"
                >
                  Player Props
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};