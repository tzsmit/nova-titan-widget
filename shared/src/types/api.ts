// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string; // Only in development
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Endpoints

// GET /api/games
export interface GamesListParams {
  date?: string; // YYYY-MM-DD
  sport?: string;
  league?: string;
  status?: 'scheduled' | 'live' | 'final';
  limit?: number;
  page?: number;
}

export type GamesListResponse = ApiResponse<PaginatedResponse<Game>>;

// GET /api/games/:id
export interface GameDetailsParams {
  includePredictions?: boolean;
  includeOdds?: boolean;
  includePlayerStats?: boolean;
}

export interface GameDetails extends Game {
  predictions?: Prediction[];
  odds?: Market[];
  playerStats?: {
    homeTeam: Player[];
    awayTeam: Player[];
  };
  teamStats?: {
    home: TeamSeasonStats;
    away: TeamSeasonStats;
  };
}

export type GameDetailsResponse = ApiResponse<GameDetails>;

// POST /api/predictions
export interface PredictionsRequest {
  gameId: string;
  features?: Partial<ModelFeatures>;
  types?: PredictionType[];
  includeExplanation?: boolean;
}

export interface PredictionsResult {
  predictions: Prediction[];
  explanation?: PredictionExplanation;
  recommendations?: BettingRecommendation[];
}

export type PredictionsResponse = ApiResponse<PredictionsResult>;

// POST /api/parlay/optimize
export interface ParlayOptimizeRequest {
  gameIds: string[];
  optimizationMode: 'max_probability' | 'max_payout';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  maxLegs?: number;
  bankrollSettings?: BankrollSettings;
  excludedBetTypes?: BetType[];
}

export interface ParlayOptimizeResult {
  parlays: Parlay[];
  alternatives: Parlay[];
  reasoning: string;
  expectedOutcomes: {
    winProbability: number;
    expectedValue: number;
    breakEvenProbability: number;
  };
}

export type ParlayOptimizeResponse = ApiResponse<ParlayOptimizeResult>;

// GET /api/odds
export interface OddsParams {
  gameId?: string;
  sport?: string;
  markets?: BetType[];
  bookmakers?: string[];
  format?: OddsFormat;
}

export type OddsResponse = ApiResponse<Market[]>;

// GET /api/players/:id/stats
export interface PlayerStatsParams {
  gameCount?: number; // default 5
  season?: number;
  includeProjections?: boolean;
}

export interface PlayerStatsResult {
  player: Player;
  recentStats: PlayerStats[];
  seasonAverages: Partial<PlayerStats>;
  projections?: Partial<PlayerStats>;
  trends: {
    stat: string;
    direction: 'up' | 'down' | 'stable';
    confidence: number;
  }[];
}

export type PlayerStatsResponse = ApiResponse<PlayerStatsResult>;

// Widget Configuration
export interface WidgetConfig {
  apiUrl: string;
  theme?: {
    primary?: string;
    accent?: string;
    neutral?: string;
  };
  features?: {
    showPredictions?: boolean;
    showOdds?: boolean;
    showParlays?: boolean;
    enableBetting?: boolean;
  };
  leagues?: LeagueType[];
  defaultSport?: SportType;
  maxGames?: number;
  refreshInterval?: number; // seconds
}

// Health Check
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    mlService: 'up' | 'down';
    externalApis: Record<string, 'up' | 'down'>;
  };
  lastUpdated: string;
}

export type HealthResponse = ApiResponse<HealthCheck>;

// Import shared types
import { Game, Player, PlayerStats, TeamSeasonStats } from './sports';
import { Market, BetType, Odds, OddsFormat, Parlay, BettingRecommendation, BankrollSettings } from './betting';
import { Prediction, PredictionType, ModelFeatures, PredictionExplanation } from './predictions';
import { LeagueType, SportType } from './sports';