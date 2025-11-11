/**
 * Live Score Widget Component
 * 
 * Features:
 * - Real-time scores from ESPN API
 * - Game clock and quarter/period display
 * - Team logos and records
 * - Live game status (Pre-game, Live, Final)
 * - Score animations on updates
 * - Possession indicator
 * - Auto-refresh every 15-30 seconds
 * 
 * Phase 3: Frontend UI
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, AlertCircle, Play } from 'lucide-react';

export interface TeamScore {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  score: number;
  record?: string;
  isHome: boolean;
  hasPossession?: boolean;
}

export interface GameStatus {
  state: 'pre' | 'in' | 'post'; // Pre-game, In-progress, Post-game
  period: number; // Quarter, Period, Inning
  clock?: string; // Game clock (e.g., "5:23")
  displayClock?: string; // Formatted clock
}

export interface LiveScore {
  eventId: string;
  sport: string;
  awayTeam: TeamScore;
  homeTeam: TeamScore;
  status: GameStatus;
  venue?: string;
  startTime: Date;
  lastUpdate: Date;
}

export interface LiveScoreWidgetProps {
  eventId: string;
  sport: string;
  compact?: boolean; // Compact mode for small widgets
  showRecord?: boolean;
  showVenue?: boolean;
  refreshInterval?: number; // milliseconds
  onScoreUpdate?: (score: LiveScore) => void;
}

const LiveScoreWidget: React.FC<LiveScoreWidgetProps> = ({
  eventId,
  sport,
  compact = false,
  showRecord = true,
  showVenue = false,
  refreshInterval = 20000, // 20 seconds
  onScoreUpdate,
}) => {
  const [score, setScore] = useState<LiveScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousScore, setPreviousScore] = useState<{ away: number; home: number } | null>(null);

  // Fetch live scores
  const fetchScore = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/scores/live?sport=${sport}&eventId=${eventId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch score');
      }

      const newScore: LiveScore = data.data;

      // Detect score changes for animation
      if (score) {
        if (newScore.awayTeam.score !== score.awayTeam.score || newScore.homeTeam.score !== score.homeTeam.score) {
          setPreviousScore({ away: score.awayTeam.score, home: score.homeTeam.score });
          setTimeout(() => setPreviousScore(null), 2000); // Clear animation after 2s
        }
      }

      setScore(newScore);
      setLoading(false);

      // Callback for parent component
      if (onScoreUpdate) {
        onScoreUpdate(newScore);
      }
    } catch (err) {
      console.error('Error fetching score:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchScore(); // Initial fetch

    const interval = setInterval(fetchScore, refreshInterval);
    return () => clearInterval(interval);
  }, [eventId, sport, refreshInterval]);

  // Format period name based on sport
  const formatPeriod = (period: number): string => {
    if (sport === 'basketball_nba') {
      if (period <= 4) return `Q${period}`;
      return `OT${period - 4}`;
    } else if (sport === 'americanfootball_nfl') {
      if (period <= 4) return `Q${period}`;
      return 'OT';
    } else if (sport === 'icehockey_nhl') {
      if (period <= 3) return `P${period}`;
      return 'OT';
    } else if (sport === 'baseball_mlb') {
      return `T${period}`;
    }
    return `P${period}`;
  };

  // Get status color
  const getStatusColor = (state: string): string => {
    switch (state) {
      case 'pre':
        return 'text-gray-400';
      case 'in':
        return 'text-green-400';
      case 'post':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get status text
  const getStatusText = (status: GameStatus, startTime: Date): string => {
    switch (status.state) {
      case 'pre':
        return `${startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      case 'in':
        return `${formatPeriod(status.period)} ${status.displayClock || status.clock || ''}`;
      case 'post':
        return 'FINAL';
      default:
        return 'Scheduled';
    }
  };

  if (loading && !score) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400 text-sm">Loading score...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/30 border border-red-700 rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-red-400" />
          <span className="text-red-400 text-sm">Failed to load score</span>
        </div>
      </div>
    );
  }

  if (!score) return null;

  // Compact mode
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-3"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Away Team */}
          <div className="flex items-center gap-2 flex-1">
            <img src={score.awayTeam.logo} alt={score.awayTeam.name} className="w-6 h-6" />
            <span className="text-white font-medium text-sm">{score.awayTeam.abbreviation}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <motion.span
              key={`away-${score.awayTeam.score}`}
              initial={previousScore ? { scale: 1.5, color: '#10b981' } : {}}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white font-bold text-lg"
            >
              {score.awayTeam.score}
            </motion.span>
            <span className="text-gray-500">-</span>
            <motion.span
              key={`home-${score.homeTeam.score}`}
              initial={previousScore ? { scale: 1.5, color: '#10b981' } : {}}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white font-bold text-lg"
            >
              {score.homeTeam.score}
            </motion.span>
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-white font-medium text-sm">{score.homeTeam.abbreviation}</span>
            <img src={score.homeTeam.logo} alt={score.homeTeam.name} className="w-6 h-6" />
          </div>
        </div>

        {/* Status */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {score.status.state === 'in' && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          )}
          <span className={`text-xs font-medium ${getStatusColor(score.status.state)}`}>
            {getStatusText(score.status, score.startTime)}
          </span>
        </div>
      </motion.div>
    );
  }

  // Full mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4"
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {score.status.state === 'in' && (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <Play size={14} className="text-green-400" />
            </>
          )}
          <span className={`text-sm font-semibold ${getStatusColor(score.status.state)}`}>
            {getStatusText(score.status, score.startTime)}
          </span>
        </div>

        {showVenue && score.venue && (
          <span className="text-xs text-gray-400">{score.venue}</span>
        )}
      </div>

      {/* Teams and Scores */}
      <div className="space-y-3">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={score.awayTeam.logo} alt={score.awayTeam.name} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{score.awayTeam.name}</span>
                {score.awayTeam.hasPossession && score.status.state === 'in' && (
                  <TrendingUp size={14} className="text-green-400" />
                )}
              </div>
              {showRecord && score.awayTeam.record && (
                <span className="text-xs text-gray-400">{score.awayTeam.record}</span>
              )}
            </div>
          </div>

          <motion.div
            key={`away-score-${score.awayTeam.score}`}
            initial={previousScore && previousScore.away !== score.awayTeam.score ? { scale: 1.3, color: '#10b981' } : {}}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white"
          >
            {score.awayTeam.score}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={score.homeTeam.logo} alt={score.homeTeam.name} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{score.homeTeam.name}</span>
                {score.homeTeam.hasPossession && score.status.state === 'in' && (
                  <TrendingUp size={14} className="text-green-400" />
                )}
              </div>
              {showRecord && score.homeTeam.record && (
                <span className="text-xs text-gray-400">{score.homeTeam.record}</span>
              )}
            </div>
          </div>

          <motion.div
            key={`home-score-${score.homeTeam.score}`}
            initial={previousScore && previousScore.home !== score.homeTeam.score ? { scale: 1.3, color: '#10b981' } : {}}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-white"
          >
            {score.homeTeam.score}
          </motion.div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
        <Clock size={12} />
        Updated {score.lastUpdate.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

export default LiveScoreWidget;
