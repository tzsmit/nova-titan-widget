/**
 * Parlay Optimizer Hook - Phase 2 Advanced Features
 * Multi-book optimization, live recalculation, edge detection, bet sizing
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface OptimizedLeg {
  id: string;
  eventId: string;
  market: string;
  selection: string;
  odds: number;
  bookmaker: string;
  alternativeOdds?: Array<{
    bookmaker: string;
    odds: number;
    edge: number;
  }>;
  edgeVsMarket?: number;
  confidence?: number;
}

export interface OptimizationResult {
  originalParlay: {
    totalOdds: number;
    payout: number;
  };
  optimizedParlay: {
    totalOdds: number;
    payout: number;
    legs: OptimizedLeg[];
  };
  improvement: {
    oddsImprovement: number;
    payoutIncrease: number;
    percentIncrease: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface LineMovement {
  eventId: string;
  market: string;
  bookmaker: string;
  originalOdds: number;
  currentOdds: number;
  direction: 'improving' | 'worsening' | 'stable';
  changePercent: number;
  timestamp: string;
}

export interface BetSizingRecommendation {
  minBet: number;
  maxBet: number;
  recommendedBet: number;
  confidence: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  reasoning: string[];
  kellyFraction: number;
  expectedReturn: number;
}

/**
 * Hook for optimizing parlay across multiple bookmakers
 */
export function useParlayOptimizer(
  legs: Array<{
    eventId: string;
    market: string;
    selection: string;
    currentOdds: number;
    currentBookmaker: string;
  }>,
  sport: string = 'basketball_nba'
) {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimize = useCallback(async () => {
    if (legs.length === 0) {
      setOptimization(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/parlay/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs, sport }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOptimization(result.data);
      } else {
        throw new Error(result.error || 'Optimization failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  }, [legs, sport]);

  useEffect(() => {
    optimize();
  }, [optimize]);

  return {
    optimization,
    loading,
    error,
    reoptimize: optimize,
  };
}

/**
 * Hook for live parlay recalculation
 */
export function useLiveRecalculation(
  originalLegs: Array<{
    legId: string;
    eventId: string;
    market: string;
    selection: string;
    odds: number;
    bookmaker: string;
  }>,
  sport: string = 'basketball_nba',
  refreshInterval: number = 30000 // 30 seconds
) {
  const [recalculation, setRecalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recalculate = useCallback(async () => {
    if (originalLegs.length === 0) {
      setRecalculation(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/parlay/live-recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalLegs, sport }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setRecalculation(result.data);
      } else {
        throw new Error(result.error || 'Recalculation failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Recalculation error:', error);
    } finally {
      setLoading(false);
    }
  }, [originalLegs, sport]);

  useEffect(() => {
    recalculate();

    // Set up auto-refresh
    const interval = setInterval(recalculate, refreshInterval);

    return () => clearInterval(interval);
  }, [recalculate, refreshInterval]);

  return {
    recalculation,
    loading,
    error,
    refresh: recalculate,
  };
}

/**
 * Hook for edge detection
 */
export function useEdgeDetection(
  legs: Array<{
    eventId: string;
    market: string;
    selection: string;
    odds: number;
    bookmaker: string;
  }>,
  sport: string = 'basketball_nba'
) {
  const [edgeAnalysis, setEdgeAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectEdge = useCallback(async () => {
    if (legs.length === 0) {
      setEdgeAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/parlay/edge-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs, sport }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setEdgeAnalysis(result.data);
      } else {
        throw new Error(result.error || 'Edge detection failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Edge detection error:', error);
    } finally {
      setLoading(false);
    }
  }, [legs, sport]);

  useEffect(() => {
    detectEdge();
  }, [detectEdge]);

  return {
    edgeAnalysis,
    loading,
    error,
    refresh: detectEdge,
  };
}

/**
 * Hook for bet sizing recommendations
 */
export function useBetSizing(
  parlayOdds: number,
  trueProbability: number,
  bankroll: number,
  expectedValue: number,
  correlationWarnings: number
) {
  const [recommendation, setRecommendation] = useState<BetSizingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!parlayOdds || !trueProbability) {
      setRecommendation(null);
      return;
    }

    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/parlay/bet-sizing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parlayOdds,
            trueProbability,
            bankroll,
            expectedValue,
            correlationWarnings,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setRecommendation(result.data);
        } else {
          throw new Error(result.error || 'Bet sizing failed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('Bet sizing error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [parlayOdds, trueProbability, bankroll, expectedValue, correlationWarnings]);

  return {
    recommendation,
    loading,
    error,
  };
}

/**
 * Hook for line movement tracking
 */
export function useLineMovement(legId: string) {
  const [movements, setMovements] = useState<LineMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!legId) {
      setMovements([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/parlay/line-movement/${legId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setMovements(result.data.movements || []);
      } else {
        throw new Error(result.error || 'Failed to fetch line movements');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Line movement error:', error);
    } finally {
      setLoading(false);
    }
  }, [legId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    refresh: fetchMovements,
  };
}

/**
 * Hook for Same Game Parlay validation
 */
export function useSGPValidation(
  legs: Array<{
    eventId: string;
    market: string;
    selection: string;
    playerId?: string;
  }>
) {
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (legs.length < 2) {
      setValidation(null);
      return;
    }

    const validate = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/parlay/sgp-validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ legs }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setValidation(result.data);
        } else {
          throw new Error(result.error || 'Validation failed');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('SGP validation error:', error);
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [legs]);

  return {
    validation,
    loading,
    error,
  };
}

export default {
  useParlayOptimizer,
  useLiveRecalculation,
  useEdgeDetection,
  useBetSizing,
  useLineMovement,
  useSGPValidation,
};
