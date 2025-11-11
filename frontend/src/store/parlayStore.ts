/**
 * Parlay Store - Global State Management
 * Manages parlay legs, optimization, and real-time updates
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ParlayLeg {
  id: string;
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string;
  odds: number;
  line?: number;
  bookmaker: string;
  commenceTime: string;
  timestamp: number;
}

export interface OptimizationData {
  originalPayout: number;
  optimizedPayout: number;
  payoutIncrease: number;
  percentIncrease: number;
  recommendations: string[];
  warnings: string[];
}

export interface ParlayState {
  // Parlay legs
  legs: ParlayLeg[];
  
  // Settings
  bankroll: number;
  selectedSport: string;
  selectedBookmaker: string;
  userState: string;
  
  // UI state
  isDrawerOpen: boolean;
  isOptimizing: boolean;
  
  // Optimization data
  optimization: OptimizationData | null;
  
  // Actions
  addLeg: (leg: ParlayLeg) => void;
  removeLeg: (legId: string) => void;
  updateLeg: (legId: string, updates: Partial<ParlayLeg>) => void;
  clearLegs: () => void;
  
  setBankroll: (amount: number) => void;
  setSelectedSport: (sport: string) => void;
  setSelectedBookmaker: (bookmaker: string) => void;
  setUserState: (state: string) => void;
  
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  
  setOptimization: (data: OptimizationData | null) => void;
  setIsOptimizing: (value: boolean) => void;
}

export const useParlayStore = create<ParlayState>()(
  persist(
    (set, get) => ({
      // Initial state
      legs: [],
      bankroll: 1000,
      selectedSport: 'basketball_nba',
      selectedBookmaker: 'draftkings',
      userState: 'NY',
      isDrawerOpen: false,
      isOptimizing: false,
      optimization: null,

      // Actions
      addLeg: (leg) => {
        const legs = get().legs;
        
        // Prevent duplicates
        const exists = legs.some(l => 
          l.eventId === leg.eventId && 
          l.market === leg.market && 
          l.selection === leg.selection
        );
        
        if (!exists) {
          set({ 
            legs: [...legs, leg],
            isDrawerOpen: true, // Auto-open drawer when adding leg
          });
        }
      },

      removeLeg: (legId) => {
        set({ 
          legs: get().legs.filter(l => l.id !== legId),
          optimization: null, // Clear optimization when legs change
        });
      },

      updateLeg: (legId, updates) => {
        set({
          legs: get().legs.map(l => 
            l.id === legId ? { ...l, ...updates } : l
          ),
          optimization: null, // Clear optimization when legs change
        });
      },

      clearLegs: () => {
        set({ 
          legs: [],
          optimization: null,
        });
      },

      setBankroll: (amount) => {
        set({ bankroll: Math.max(0, amount) });
      },

      setSelectedSport: (sport) => {
        set({ selectedSport: sport });
      },

      setSelectedBookmaker: (bookmaker) => {
        set({ selectedBookmaker: bookmaker });
      },

      setUserState: (state) => {
        set({ userState: state });
      },

      toggleDrawer: () => {
        set({ isDrawerOpen: !get().isDrawerOpen });
      },

      openDrawer: () => {
        set({ isDrawerOpen: true });
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false });
      },

      setOptimization: (data) => {
        set({ optimization: data });
      },

      setIsOptimizing: (value) => {
        set({ isOptimizing: value });
      },
    }),
    {
      name: 'nova-titan-parlay-storage',
      partialize: (state) => ({
        legs: state.legs,
        bankroll: state.bankroll,
        selectedSport: state.selectedSport,
        selectedBookmaker: state.selectedBookmaker,
        userState: state.userState,
      }),
    }
  )
);

export default useParlayStore;
