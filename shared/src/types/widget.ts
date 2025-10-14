// Widget-specific Types

export interface WidgetState {
  isLoaded: boolean;
  isLoading: boolean;
  error?: string;
  config: WidgetConfig;
  selectedGame?: string;
  selectedTab: WidgetTab;
  ageVerified: boolean;
  showLegalModal: boolean;
}

export type WidgetTab = 'games' | 'predictions' | 'parlays' | 'settings';

export interface WidgetTheme {
  primary: string;
  accent: string;
  neutral: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  // Component-specific colors
  card: string;
  button: string;
  input: string;
}

export interface WidgetConfig {
  // API Configuration
  apiUrl: string;
  apiKey?: string;
  
  // Appearance
  theme?: Partial<WidgetTheme>;
  logo?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  
  // Features
  features: {
    showPredictions: boolean;
    showOdds: boolean;
    showParlays: boolean;
    enableBetting: boolean;
    showPlayerStats: boolean;
    allowCustomStakes: boolean;
  };
  
  // Content Filters
  leagues: LeagueType[];
  sports: SportType[];
  maxGames: number;
  maxPlayerStats: number;
  
  // Behavior
  refreshInterval: number; // seconds
  autoRefresh: boolean;
  defaultOddsFormat: OddsFormat;
  
  // Legal & Compliance
  requireAgeVerification: boolean;
  minimumAge: number;
  blockedRegions: string[];
  showDisclaimers: boolean;
  
  // Monetization
  affiliateLinks: Record<string, string>;
  enableAffiliate: boolean;
  
  // Analytics
  trackingId?: string;
  enableAnalytics: boolean;
}

export interface WidgetProps {
  config: WidgetConfig;
  containerId?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onBetPlaced?: (bet: Bet) => void;
  onParlayCreated?: (parlay: Parlay) => void;
}

export interface EmbedOptions {
  // Required
  apiUrl: string;
  
  // Optional configuration via data attributes
  'data-theme-primary'?: string;
  'data-theme-accent'?: string;
  'data-theme-neutral'?: string;
  'data-logo-url'?: string;
  'data-title'?: string;
  'data-leagues'?: string; // comma-separated
  'data-sports'?: string; // comma-separated
  'data-max-games'?: string;
  'data-enable-predictions'?: string;
  'data-enable-odds'?: string;
  'data-enable-parlays'?: string;
  'data-enable-betting'?: string;
  'data-odds-format'?: OddsFormat;
  'data-min-age'?: string;
  'data-blocked-regions'?: string; // comma-separated
  'data-affiliate-links'?: string; // JSON string
  'data-tracking-id'?: string;
  'data-width'?: string;
  'data-height'?: string;
  'data-refresh-interval'?: string;
}

export interface WidgetAnalytics {
  // User Interactions
  gameViews: Record<string, number>;
  predictionViews: Record<string, number>;
  betClicks: Record<string, number>;
  parlayCreations: number;
  
  // Performance Metrics
  loadTime: number;
  errorCount: number;
  apiResponseTimes: number[];
  
  // User Behavior
  sessionDuration: number;
  tabSwitches: Record<WidgetTab, number>;
  scrollDepth: number;
  
  // Business Metrics
  affiliateClicks: Record<string, number>;
  conversionEvents: number;
}

export interface WidgetError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  recoverable: boolean;
}

// Widget Event System
export type WidgetEvent = 
  | 'widget:loaded'
  | 'widget:error'
  | 'game:selected'
  | 'prediction:requested'
  | 'bet:recommended'
  | 'parlay:optimized'
  | 'age:verified'
  | 'affiliate:clicked';

export interface WidgetEventData {
  'widget:loaded': { loadTime: number };
  'widget:error': { error: WidgetError };
  'game:selected': { gameId: string };
  'prediction:requested': { gameId: string; types: PredictionType[] };
  'bet:recommended': { bet: Bet; confidence: number };
  'parlay:optimized': { parlay: Parlay; mode: string };
  'age:verified': { age: number; timestamp: string };
  'affiliate:clicked': { bookmaker: string; betType: string };
}

// Component Props Types
export interface GameCardProps {
  game: Game;
  showOdds?: boolean;
  showPredictions?: boolean;
  onSelect?: (gameId: string) => void;
  compact?: boolean;
}

export interface PredictionCardProps {
  predictions: Prediction[];
  explanation?: PredictionExplanation;
  showDetails?: boolean;
  onBetRecommendation?: (bet: BettingRecommendation) => void;
}

export interface PlayerTileProps {
  player: Player;
  stats: PlayerStats[];
  maxStats?: number;
  showTrends?: boolean;
  compact?: boolean;
}

export interface ParlayBuilderProps {
  availableBets: BettingRecommendation[];
  onOptimize?: (request: ParlayOptimizeRequest) => void;
  maxLegs?: number;
  bankrollSettings?: BankrollSettings;
}

export interface OddsDisplayProps {
  odds: Odds;
  format?: OddsFormat;
  showImpliedProbability?: boolean;
  highlight?: boolean;
}

export interface StakeAdvisorProps {
  kelly: KellyResult;
  bankroll: BankrollSettings;
  showAdvanced?: boolean;
}

// Import types
import { LeagueType, SportType } from './sports';
import { OddsFormat, Bet, Parlay, BettingRecommendation, BankrollSettings } from './betting';
import { Prediction, PredictionType, PredictionExplanation } from './predictions';
import { Game, Player, PlayerStats } from './sports';
import { KellyResult } from './betting';