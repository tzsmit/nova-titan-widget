/**
 * Live Timestamp Component
 * Shows when data was last updated with a live indicator
 */

import React, { useState, useEffect } from 'react';

export interface LiveTimestampProps {
  lastUpdate: Date;
  autoRefresh?: boolean;
  onRefresh?: () => void;
  label?: string;
}

export const LiveTimestamp: React.FC<LiveTimestampProps> = ({ 
  lastUpdate, 
  autoRefresh = false,
  onRefresh,
  label = 'Updated'
}) => {
  const [now, setNow] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const refreshInterval = setInterval(() => {
        onRefresh();
      }, 60000); // Refresh every 60 seconds
      return () => clearInterval(refreshInterval);
    }
  }, [autoRefresh, onRefresh]);

  const secondsAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);

  const getStatusColor = () => {
    if (secondsAgo < 30) return 'bg-green-400';
    if (secondsAgo < 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getTimeAgoText = () => {
    if (secondsAgo < 5) return 'just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  };

  const handleRefreshClick = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Live Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          secondsAgo < 60 ? 'animate-pulse' : ''
        }`} />
        <span className={
          secondsAgo < 30 ? 'text-green-400' : 
          secondsAgo < 60 ? 'text-yellow-400' : 
          'text-slate-400'
        }>
          {secondsAgo < 30 ? 'LIVE' : secondsAgo < 60 ? 'UPDATING' : 'STALE'}
        </span>
      </div>

      {/* Timestamp */}
      <span className="text-slate-400">
        {label}: {lastUpdate.toLocaleTimeString()} ({getTimeAgoText()})
      </span>

      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className={`
            px-2 py-1 rounded text-xs font-medium transition-colors
            ${isRefreshing 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }
          `}
          title="Refresh data"
        >
          {isRefreshing ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating...
            </span>
          ) : (
            '↻ Refresh'
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Simple loading spinner component
 */
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
};

/**
 * Empty state component
 */
export const EmptyState: React.FC<{ 
  title: string; 
  message: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title, message, icon = '📊', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Error state component
 */
export const ErrorState: React.FC<{ 
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Error', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-400 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
