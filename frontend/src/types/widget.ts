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
  containerId?: string;
  
  // Legacy color support
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  
  // Features
  features?: {
    showPredictions: boolean;
    showOdds: boolean;
    showParlays: boolean;
    enableBetting: boolean;
    showPlayerStats: boolean;
    allowCustomStakes: boolean;
  };
  
  // Content Filters
  leagues?: string[];
  sports?: string[];
  maxGames?: number;
  maxPlayerStats?: number;
  
  // Behavior
  refreshInterval?: number; // seconds
  autoRefresh?: boolean;
  defaultOddsFormat?: string;
  
  // Legal & Compliance
  requireAgeVerification?: boolean;
  minimumAge?: number;
  blockedRegions?: string[];
  showDisclaimers?: boolean;
  
  // Monetization
  affiliateLinks?: Record<string, string>;
  enableAffiliate?: boolean;
  
  // Analytics
  trackingId?: string;
  enableAnalytics?: boolean;
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
  'data-odds-format'?: string;
  'data-min-age'?: string;
  'data-blocked-regions'?: string; // comma-separated
  'data-affiliate-links'?: string; // JSON string
  'data-tracking-id'?: string;
  'data-width'?: string;
  'data-height'?: string;
  'data-refresh-interval'?: string;
}

// Sport and League types
export type SportType = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'tennis' | 'golf';
export type LeagueType = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'MLS' | 'NCAA' | 'EPL' | 'PGA';