/**
 * Nova Titan Widget Store
 * Global state management using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface WidgetConfig {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
    card?: string;
    button?: string;
    input?: string;
  };
  logo?: string;
  brandName?: string;
  themeMode?: 'dark' | 'light';
  currency?: string;
  odds_format?: 'american' | 'decimal' | 'fractional';
  
  // Widget features
  leagues?: string[];
  sports?: string[];
  maxGames?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showDisclaimers?: boolean;
  minimumAge?: number;
  
  notifications?: {
    enabled: boolean;
    sound: boolean;
    push: boolean;
  };
  risk_management?: {
    max_bet: number;
    daily_limit: number;
    loss_limit: number;
  };
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  sport: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  homeOdds?: number;
  awayOdds?: number;
  spread?: number;
  total?: number;
}

export interface Prediction {
  id: string;
  gameId: string;
  type: 'moneyline' | 'spread' | 'total';
  prediction: string;
  confidence: number;
  expectedValue: number;
  reasoning: string;
}

export type WidgetTab = 'games' | 'predictions' | 'parlays' | 'settings';

interface WidgetStore {
  // Configuration
  config: WidgetConfig;
  
  // Navigation
  activeTab: WidgetTab;
  selectedTab: WidgetTab;
  
  // Data
  games: Game[];
  predictions: Prediction[];
  selectedGame: Game | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingGames: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Age verification
  isAgeVerified: boolean;
  showAgeGate: boolean;
  showLegalModal: boolean;
  
  // Actions
  updateConfig: (config: Partial<WidgetConfig>) => void;
  setConfig: (config: any) => void;
  setActiveTab: (tab: WidgetTab) => void;
  setSelectedTab: (tab: WidgetTab) => void;
  setGames: (games: Game[]) => void;
  setPredictions: (predictions: Prediction[]) => void;
  setSelectedGame: (game: Game | null) => void;
  setLoading: (loading: boolean) => void;
  setGamesLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGamesError: (error: string | null) => void;
  refreshData: () => void;
  setAgeVerified: (verified: boolean) => void;
  setShowLegalModal: (show: boolean) => void;
}

const defaultConfig: WidgetConfig = {
  colors: {
    primary: '#1a365d',     // Nova Titan dark navy
    secondary: '#2d5a87',   // Nova Titan medium blue  
    accent: '#4299e1',      // Nova Titan light blue
    background: '#1a202c'   // Dark background
  },
  theme: {
    primary: '#1a365d',
    secondary: '#2d5a87',
    accent: '#4299e1',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#ffffff',
    button: '#1a365d',
    input: '#f9fafb'
  },
  logo: 'https://page.gensparksite.com/v1/base64_upload/b12f5870654d8f0d2849b96fdb25cab2',
  brandName: 'Nova Titan Sports',
  themeMode: 'dark',
  currency: 'USD',
  odds_format: 'american',
  leagues: ['NBA', 'NFL'],
  sports: ['basketball', 'football'],
  maxGames: 8,
  autoRefresh: true,
  refreshInterval: 300,
  showDisclaimers: true,
  minimumAge: 18,
  notifications: {
    enabled: true,
    sound: true,
    push: false
  },
  risk_management: {
    max_bet: 1000,
    daily_limit: 5000,
    loss_limit: 2000
  }
};

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      // Initial state
      config: defaultConfig,
      activeTab: 'games',
      selectedTab: 'games',
      games: [],
      predictions: [],
      selectedGame: null,
      isLoading: false,
      isLoadingGames: false,
      isLoaded: true,
      error: null,
      isAgeVerified: true,
      showAgeGate: false,
      showLegalModal: false,

      // Actions
      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig }
        })),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      setGames: (games) =>
        set({ 
          games,
          isLoading: false,
          error: null
        }),

      setPredictions: (predictions) =>
        set({ 
          predictions,
          isLoading: false,
          error: null
        }),

      setSelectedGame: (game) =>
        set({ selectedGame: game }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setError: (error) =>
        set({ 
          error,
          isLoading: false
        }),

      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig }
        })),

      setSelectedTab: (tab) =>
        set({ selectedTab: tab, activeTab: tab }),

      setGamesLoading: (loading) =>
        set({ isLoadingGames: loading }),

      setGamesError: (error) =>
        set({ 
          error,
          isLoadingGames: false
        }),

      refreshData: () => {
        // This would trigger data refetch
        set({ isLoading: true });
        // In a real app, this would call API endpoints
        setTimeout(() => {
          set({ isLoading: false });
        }, 1000);
      },

      setAgeVerified: (verified) =>
        set({ isAgeVerified: verified }),

      setShowLegalModal: (show) =>
        set({ showLegalModal: show }),
    }),
    {
      name: 'nova-titan-widget-storage',
      partialize: (state) => ({
        config: state.config,
        activeTab: state.activeTab
      }),
    }
  )
);