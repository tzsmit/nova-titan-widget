/**
 * Real-Time Odds Polling Hook
 * Automatically fetches and updates odds every 15-30 seconds
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface OddsData {
  eventId: string;
  sport: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  moneyline?: {
    home: number;
    away: number;
    homeDecimal: number;
    awayDecimal: number;
  };
  spread?: {
    home: number;
    homePoints: number;
    away: number;
    awayPoints: number;
  };
  total?: {
    over: number;
    overPoints: number;
    under: number;
    underPoints: number;
  };
  lastUpdated: string;
  impliedProbability?: {
    home: number;
    away: number;
  };
  fairOdds?: {
    home: number;
    away: number;
  };
  hold?: number;
}

export interface UseRealTimeOddsOptions {
  sport?: string;
  refreshInterval?: number; // milliseconds
  autoRefresh?: boolean;
  onUpdate?: (data: OddsData[]) => void;
  onError?: (error: Error) => void;
}

export interface UseRealTimeOddsResult {
  odds: OddsData[];
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isStale: boolean;
  stats: {
    totalEvents: number;
    totalBookmakers: number;
    refreshCount: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const DEFAULT_REFRESH_INTERVAL = 20000; // 20 seconds
const STALE_THRESHOLD = 60000; // 60 seconds

export function useRealTimeOdds(options: UseRealTimeOddsOptions = {}): UseRealTimeOddsResult {
  const {
    sport = 'basketball_nba',
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    autoRefresh = true,
    onUpdate,
    onError,
  } = options;

  const [odds, setOdds] = useState<OddsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const isMountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if data is stale
  const isStale = lastUpdated 
    ? Date.now() - lastUpdated.getTime() > STALE_THRESHOLD
    : true;

  // Fetch odds from API
  const fetchOdds = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/events?sport=${sport}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setOdds(result.data);
        setLastUpdated(new Date());
        setRefreshCount(prev => prev + 1);
        
        // Call onUpdate callback
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch odds');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Call onError callback
      if (onError) {
        onError(error);
      }

      console.error('Error fetching odds:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [sport, onUpdate, onError]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchOdds();
  }, [fetchOdds]);

  // Set up automatic refresh
  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchOdds();

    // Set up interval for auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchOdds();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [sport, refreshInterval, autoRefresh, fetchOdds]);

  // Calculate stats
  const stats = {
    totalEvents: odds.length,
    totalBookmakers: new Set(odds.map(o => o.bookmaker)).size,
    refreshCount,
  };

  return {
    odds,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale,
    stats,
  };
}

/**
 * Hook for fetching a specific event's odds
 */
export function useEventOdds(sport: string, eventId: string, options: UseRealTimeOddsOptions = {}) {
  const {
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    autoRefresh = true,
    onUpdate,
    onError,
  } = options;

  const [odds, setOdds] = useState<OddsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEventOdds = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}?sport=${sport}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setOdds(result.data);
        setLastUpdated(new Date());
        
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch event odds');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [sport, eventId, onUpdate, onError]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchEventOdds();
  }, [fetchEventOdds]);

  useEffect(() => {
    isMountedRef.current = true;

    fetchEventOdds();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchEventOdds();
      }, refreshInterval);
    }

    return () => {
      isMountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sport, eventId, refreshInterval, autoRefresh, fetchEventOdds]);

  const isStale = lastUpdated 
    ? Date.now() - lastUpdated.getTime() > STALE_THRESHOLD
    : true;

  return {
    odds,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale,
    stats: {
      totalEvents: odds.length,
      totalBookmakers: new Set(odds.map(o => o.bookmaker)).size,
      refreshCount: 0,
    },
  };
}

/**
 * Hook for calculating parlay odds in real-time
 */
export interface ParlayLeg {
  id: string;
  eventId: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string;
  odds: number;
  line?: number;
  sport?: string;
  teams?: { home: string; away: string };
}

export interface ParlayResult {
  legs: ParlayLeg[];
  parlayOdds: number;
  parlayDecimalOdds: number;
  trueProbability: number;
  payout: number;
  expectedValue: number;
  kellyFraction: number;
  recommendedBankroll: number;
  correlationWarnings: any[];
  isValid: boolean;
  errors: string[];
}

export function useParlay(legs: ParlayLeg[], bankroll: number = 1000) {
  const [result, setResult] = useState<ParlayResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const calculateParlay = useCallback(async () => {
    if (legs.length < 2) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/price/parlay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legs, bankroll }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to calculate parlay');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error calculating parlay:', error);
    } finally {
      setLoading(false);
    }
  }, [legs, bankroll]);

  useEffect(() => {
    calculateParlay();
  }, [calculateParlay]);

  return {
    result,
    loading,
    error,
    recalculate: calculateParlay,
  };
}

export default useRealTimeOdds;
