import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for parlay data structures
export interface ParlayPick {
  id: string;
  gameId: string;
  type: 'moneyline' | 'spread' | 'total' | 'props';
  selection: string;
  odds: number;
  team?: string;
  line?: number;
  player?: string;
  market?: string;
  value?: string;
  // Game info
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  sport: string;
}

export interface Parlay {
  id: string;
  name: string;
  picks: ParlayPick[];
  totalOdds: number;
  potentialPayout: number;
  stake: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ParlayState {
  // State
  savedParlays: Parlay[];
  currentParlay: ParlayPick[];
  currentStake: number;
  
  // Actions
  addPickToCurrentParlay: (pick: ParlayPick) => void;
  removePickFromCurrentParlay: (pickId: string) => void;
  clearCurrentParlay: () => void;
  setCurrentStake: (stake: number) => void;
  
  // Parlay CRUD operations
  saveCurrentParlay: (name: string) => string;
  getSavedParlays: () => Parlay[];
  getParlay: (id: string) => Parlay | undefined;
  updateParlay: (id: string, updates: Partial<Parlay>) => void;
  deleteParlay: (id: string) => void;
  duplicateParlay: (id: string) => string;
  
  // Utility functions
  calculateParlayOdds: (picks: ParlayPick[]) => number;
  calculatePotentialPayout: (odds: number, stake: number) => number;
  isPickInCurrentParlay: (pickId: string) => boolean;
  
  // Maintenance
  clearAllParlays: () => void;
  exportParlays: () => string;
  importParlays: (data: string) => boolean;
}

// Utility functions
const calculateOdds = (picks: ParlayPick[]): number => {
  if (picks.length === 0) return 0;
  
  const totalOdds = picks.reduce((acc, pick) => {
    // Convert American odds to decimal
    const decimal = pick.odds > 0 
      ? (pick.odds / 100) + 1 
      : (100 / Math.abs(pick.odds)) + 1;
    return acc * decimal;
  }, 1);
  
  // Convert back to American odds
  return totalOdds >= 2 
    ? Math.round((totalOdds - 1) * 100)
    : Math.round(-100 / (totalOdds - 1));
};

const calculatePayout = (odds: number, stake: number): number => {
  if (stake <= 0 || odds === 0) return 0;
  
  const decimal = odds > 0 
    ? (odds / 100) + 1 
    : (100 / Math.abs(odds)) + 1;
  
  return parseFloat((stake * decimal).toFixed(2));
};

const generateId = (): string => {
  return `parlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generatePickId = (pick: Partial<ParlayPick>): string => {
  return `pick_${pick.gameId}_${pick.type}_${pick.selection}_${Date.now()}`;
};

// Create the store
export const useParlayStore = create<ParlayState>()(
  persist(
    (set, get) => ({
      // Initial state
      savedParlays: [],
      currentParlay: [],
      currentStake: 0,

      // Current parlay management
      addPickToCurrentParlay: (pick) => {
        set(state => {
          // Ensure pick has an ID
          const pickWithId = { ...pick, id: pick.id || generatePickId(pick) };
          
          // Check if pick already exists (same game + type + selection)
          const existingIndex = state.currentParlay.findIndex(p => 
            p.gameId === pickWithId.gameId && 
            p.type === pickWithId.type && 
            p.selection === pickWithId.selection
          );
          
          let updatedParlay;
          if (existingIndex >= 0) {
            // Replace existing pick
            updatedParlay = [...state.currentParlay];
            updatedParlay[existingIndex] = pickWithId;
          } else {
            // Add new pick
            updatedParlay = [...state.currentParlay, pickWithId];
          }
          
          console.log('➕ Pick added to current parlay:', pickWithId);
          return { currentParlay: updatedParlay };
        });
      },

      removePickFromCurrentParlay: (pickId) => {
        set(state => {
          const updatedParlay = state.currentParlay.filter(pick => pick.id !== pickId);
          console.log('➖ Pick removed from current parlay:', pickId);
          return { currentParlay: updatedParlay };
        });
      },

      clearCurrentParlay: () => {
        set({ currentParlay: [], currentStake: 0 });
        console.log('🧹 Current parlay cleared');
      },

      setCurrentStake: (stake) => {
        set({ currentStake: Math.max(0, stake) });
      },

      // Saved parlay operations
      saveCurrentParlay: (name) => {
        const state = get();
        const id = generateId();
        const now = new Date().toISOString();
        
        const parlay: Parlay = {
          id,
          name: name || `Parlay ${state.savedParlays.length + 1}`,
          picks: [...state.currentParlay],
          totalOdds: state.calculateParlayOdds(state.currentParlay),
          potentialPayout: state.calculatePotentialPayout(
            state.calculateParlayOdds(state.currentParlay), 
            state.currentStake
          ),
          stake: state.currentStake,
          createdAt: now,
          updatedAt: now,
          status: 'active'
        };
        
        set(state => {
          const updatedParlays = [...state.savedParlays, parlay];
          console.log('💾 Parlay saved:', parlay);
          return { 
            savedParlays: updatedParlays,
            currentParlay: [],
            currentStake: 0
          };
        });
        
        return id;
      },

      getSavedParlays: () => {
        return get().savedParlays;
      },

      getParlay: (id) => {
        return get().savedParlays.find(parlay => parlay.id === id);
      },

      updateParlay: (id, updates) => {
        set(state => {
          const updatedParlays = state.savedParlays.map(parlay => 
            parlay.id === id 
              ? { 
                  ...parlay, 
                  ...updates, 
                  updatedAt: new Date().toISOString(),
                  // Recalculate odds if picks were updated
                  ...(updates.picks && {
                    totalOdds: state.calculateParlayOdds(updates.picks),
                    potentialPayout: state.calculatePotentialPayout(
                      state.calculateParlayOdds(updates.picks),
                      updates.stake || parlay.stake
                    )
                  })
                }
              : parlay
          );
          
          console.log('✏️ Parlay updated:', id, updates);
          return { savedParlays: updatedParlays };
        });
      },

      deleteParlay: (id) => {
        set(state => {
          const updatedParlays = state.savedParlays.filter(parlay => parlay.id !== id);
          console.log('🗑️ Parlay deleted:', id);
          console.log('📊 Parlays before deletion:', state.savedParlays.length);
          console.log('📊 Parlays after deletion:', updatedParlays.length);
          return { savedParlays: updatedParlays };
        });
      },

      duplicateParlay: (id) => {
        const state = get();
        const originalParlay = state.savedParlays.find(p => p.id === id);
        
        if (!originalParlay) {
          console.error('❌ Parlay not found for duplication:', id);
          return '';
        }
        
        const newId = generateId();
        const now = new Date().toISOString();
        
        const duplicatedParlay: Parlay = {
          ...originalParlay,
          id: newId,
          name: `${originalParlay.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          status: 'active'
        };
        
        set(state => {
          const updatedParlays = [...state.savedParlays, duplicatedParlay];
          console.log('📋 Parlay duplicated:', newId);
          return { savedParlays: updatedParlays };
        });
        
        return newId;
      },

      // Utility functions
      calculateParlayOdds: (picks) => calculateOdds(picks),
      
      calculatePotentialPayout: (odds, stake) => calculatePayout(odds, stake),
      
      isPickInCurrentParlay: (pickId) => {
        return get().currentParlay.some(pick => pick.id === pickId);
      },

      // Maintenance operations
      clearAllParlays: () => {
        set({ savedParlays: [], currentParlay: [], currentStake: 0 });
        console.log('🧹 All parlays cleared');
      },

      exportParlays: () => {
        const state = get();
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          parlays: state.savedParlays,
          currentParlay: state.currentParlay,
          currentStake: state.currentStake
        };
        return JSON.stringify(exportData, null, 2);
      },

      importParlays: (data) => {
        try {
          const parsedData = JSON.parse(data);
          
          if (!parsedData.parlays || !Array.isArray(parsedData.parlays)) {
            console.error('❌ Invalid import data format');
            return false;
          }
          
          set({
            savedParlays: parsedData.parlays,
            currentParlay: parsedData.currentParlay || [],
            currentStake: parsedData.currentStake || 0
          });
          
          console.log('📥 Parlays imported successfully:', parsedData.parlays.length);
          return true;
        } catch (error) {
          console.error('❌ Failed to import parlays:', error);
          return false;
        }
      }
    }),
    {
      name: 'nova-titan-parlays', // localStorage key
      version: 1,
      
      // Storage configuration
      partialize: (state) => ({
        savedParlays: state.savedParlays,
        currentParlay: state.currentParlay,
        currentStake: state.currentStake
      }),
      
      // Migration function for future versions
      migrate: (persistedState: any, version: number) => {
        console.log('🔄 Migrating parlay store from version:', version);
        return persistedState;
      },
      
      // Error handling
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💧 Parlay store rehydrated with', state.savedParlays?.length || 0, 'saved parlays');
        }
      }
    }
  )
);

// Export utility functions for external use
export { calculateOdds, calculatePayout, generateId, generatePickId };

// Hook for easy parlay operations
export const useParlayOperations = () => {
  const store = useParlayStore();
  
  return {
    // Quick actions
    addPick: store.addPickToCurrentParlay,
    removePick: store.removePickFromCurrentParlay,
    clearCurrent: store.clearCurrentParlay,
    saveParlay: store.saveCurrentParlay,
    deleteParlay: store.deleteParlay,
    
    // Getters
    currentParlay: store.currentParlay,
    savedParlays: store.savedParlays,
    currentStake: store.currentStake,
    
    // Calculations
    currentOdds: store.calculateParlayOdds(store.currentParlay),
    currentPayout: store.calculatePotentialPayout(
      store.calculateParlayOdds(store.currentParlay),
      store.currentStake
    ),
    
    // State queries
    hasCurrentPicks: store.currentParlay.length > 0,
    hasSavedParlays: store.savedParlays.length > 0
  };
};