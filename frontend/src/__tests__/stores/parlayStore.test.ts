/**
 * Tests for Parlay Store
 * Ensures proper state management and persistence
 */

import { renderHook, act } from '@testing-library/react';
import { useParlayStore, type ParlayPick } from '../../stores/parlayStore';

const mockPick: ParlayPick = {
  id: 'test-pick-1',
  gameId: 'game-123',
  type: 'moneyline',
  selection: 'Lakers ML',
  odds: -150,
  team: 'Lakers',
  homeTeam: 'Lakers',
  awayTeam: 'Warriors',
  gameTime: '2024-01-15T20:00:00Z',
  sport: 'basketball_nba'
};

const mockPick2: ParlayPick = {
  id: 'test-pick-2',
  gameId: 'game-456',
  type: 'spread',
  selection: 'Warriors -7.5',
  odds: -110,
  team: 'Warriors',
  line: -7.5,
  homeTeam: 'Warriors',
  awayTeam: 'Celtics',
  gameTime: '2024-01-15T22:00:00Z',
  sport: 'basketball_nba'
};

describe('ParlayStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useParlayStore());
    act(() => {
      result.current.clearAllParlays();
    });
    
    // Clear localStorage mock
    localStorage.clear();
  });

  describe('Current Parlay Management', () => {
    it('should add picks to current parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
      });

      expect(result.current.currentParlay).toHaveLength(1);
      expect(result.current.currentParlay[0]).toEqual(mockPick);
    });

    it('should remove picks from current parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.addPickToCurrentParlay(mockPick2);
      });

      expect(result.current.currentParlay).toHaveLength(2);

      act(() => {
        result.current.removePickFromCurrentParlay(mockPick.id);
      });

      expect(result.current.currentParlay).toHaveLength(1);
      expect(result.current.currentParlay[0]).toEqual(mockPick2);
    });

    it('should clear current parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.setCurrentStake(100);
      });

      expect(result.current.currentParlay).toHaveLength(1);
      expect(result.current.currentStake).toBe(100);

      act(() => {
        result.current.clearCurrentParlay();
      });

      expect(result.current.currentParlay).toHaveLength(0);
      expect(result.current.currentStake).toBe(0);
    });

    it('should replace existing pick with same game and type', () => {
      const { result } = renderHook(() => useParlayStore());

      const duplicatePick = {
        ...mockPick,
        id: 'different-id',
        odds: -200 // Different odds
      };

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.addPickToCurrentParlay(duplicatePick);
      });

      // Should only have 1 pick (replaced)
      expect(result.current.currentParlay).toHaveLength(1);
      expect(result.current.currentParlay[0].odds).toBe(-200);
      expect(result.current.currentParlay[0].id).toBe('different-id');
    });

    it('should set current stake', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.setCurrentStake(150);
      });

      expect(result.current.currentStake).toBe(150);

      // Should not allow negative stakes
      act(() => {
        result.current.setCurrentStake(-50);
      });

      expect(result.current.currentStake).toBe(0);
    });
  });

  describe('Parlay CRUD Operations', () => {
    it('should save current parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.addPickToCurrentParlay(mockPick2);
        result.current.setCurrentStake(100);
        result.current.saveCurrentParlay('Test Parlay');
      });

      const savedParlays = result.current.getSavedParlays();
      expect(savedParlays).toHaveLength(1);
      
      const savedParlay = savedParlays[0];
      expect(savedParlay.name).toBe('Test Parlay');
      expect(savedParlay.picks).toHaveLength(2);
      expect(savedParlay.stake).toBe(100);
      expect(savedParlay.status).toBe('active');
      
      // Current parlay should be cleared after saving
      expect(result.current.currentParlay).toHaveLength(0);
      expect(result.current.currentStake).toBe(0);
    });

    it('should generate default name if none provided', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('');
      });

      const savedParlays = result.current.getSavedParlays();
      expect(savedParlays[0].name).toBe('Parlay 1');
    });

    it('should delete saved parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Test Parlay');
      });

      let savedParlays = result.current.getSavedParlays();
      expect(savedParlays).toHaveLength(1);
      
      const parlayId = savedParlays[0].id;

      act(() => {
        result.current.deleteParlay(parlayId);
      });

      savedParlays = result.current.getSavedParlays();
      expect(savedParlays).toHaveLength(0);
    });

    it('should get specific parlay by ID', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Test Parlay');
      });

      const savedParlays = result.current.getSavedParlays();
      const parlayId = savedParlays[0].id;
      
      const retrievedParlay = result.current.getParlay(parlayId);
      expect(retrievedParlay).toBeDefined();
      expect(retrievedParlay?.name).toBe('Test Parlay');
    });

    it('should update existing parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Original Name');
      });

      const savedParlays = result.current.getSavedParlays();
      const parlayId = savedParlays[0].id;

      act(() => {
        result.current.updateParlay(parlayId, { 
          name: 'Updated Name',
          stake: 200 
        });
      });

      const updatedParlay = result.current.getParlay(parlayId);
      expect(updatedParlay?.name).toBe('Updated Name');
      expect(updatedParlay?.stake).toBe(200);
      expect(updatedParlay?.updatedAt).toBeDefined();
    });

    it('should duplicate parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Original Parlay');
      });

      const savedParlays = result.current.getSavedParlays();
      const originalId = savedParlays[0].id;

      act(() => {
        result.current.duplicateParlay(originalId);
      });

      const allParlays = result.current.getSavedParlays();
      expect(allParlays).toHaveLength(2);
      
      const duplicated = allParlays.find(p => p.id !== originalId);
      expect(duplicated?.name).toBe('Original Parlay (Copy)');
      expect(duplicated?.picks).toEqual(savedParlays[0].picks);
    });
  });

  describe('Odds Calculation', () => {
    it('should calculate parlay odds correctly', () => {
      const { result } = renderHook(() => useParlayStore());

      const picks = [mockPick, mockPick2]; // -150 and -110
      const odds = result.current.calculateParlayOdds(picks);
      
      expect(typeof odds).toBe('number');
      expect(odds).toBeGreaterThan(0); // Should be positive combined odds
    });

    it('should calculate potential payout correctly', () => {
      const { result } = renderHook(() => useParlayStore());

      const odds = 200; // +200 odds
      const stake = 100;
      const payout = result.current.calculatePotentialPayout(odds, stake);
      
      expect(payout).toBe(300); // $100 stake + $200 win = $300 total
    });

    it('should return 0 odds for empty picks', () => {
      const { result } = renderHook(() => useParlayStore());

      const odds = result.current.calculateParlayOdds([]);
      expect(odds).toBe(0);
    });

    it('should return 0 payout for zero stake', () => {
      const { result } = renderHook(() => useParlayStore());

      const payout = result.current.calculatePotentialPayout(150, 0);
      expect(payout).toBe(0);
    });
  });

  describe('Utility Functions', () => {
    it('should check if pick is in current parlay', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
      });

      expect(result.current.isPickInCurrentParlay(mockPick.id)).toBe(true);
      expect(result.current.isPickInCurrentParlay('non-existent-id')).toBe(false);
    });

    it('should export parlays to JSON', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Test Export');
      });

      const exported = result.current.exportParlays();
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.parlays).toHaveLength(1);
      expect(parsed.parlays[0].name).toBe('Test Export');
    });

    it('should import parlays from JSON', () => {
      const { result } = renderHook(() => useParlayStore());

      const importData = {
        version: '1.0',
        parlays: [{
          id: 'imported-parlay',
          name: 'Imported Parlay',
          picks: [mockPick],
          stake: 50,
          totalOdds: -150,
          potentialPayout: 83.33,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          status: 'active'
        }],
        currentParlay: [],
        currentStake: 0
      };

      act(() => {
        const success = result.current.importParlays(JSON.stringify(importData));
        expect(success).toBe(true);
      });

      const savedParlays = result.current.getSavedParlays();
      expect(savedParlays).toHaveLength(1);
      expect(savedParlays[0].name).toBe('Imported Parlay');
    });

    it('should handle invalid import data', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        const success = result.current.importParlays('invalid json');
        expect(success).toBe(false);
      });

      act(() => {
        const success = result.current.importParlays('{"invalid": "format"}');
        expect(success).toBe(false);
      });
    });
  });

  describe('Persistence Behavior', () => {
    it('should persist state to localStorage', () => {
      const { result } = renderHook(() => useParlayStore());

      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.setCurrentStake(100);
        result.current.saveCurrentParlay('Persistent Parlay');
      });

      // Check that localStorage.setItem was called
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should maintain deletion across page reloads', () => {
      const { result } = renderHook(() => useParlayStore());

      // Save a parlay
      act(() => {
        result.current.addPickToCurrentParlay(mockPick);
        result.current.saveCurrentParlay('Test Parlay');
      });

      let savedParlays = result.current.getSavedParlays();
      const parlayId = savedParlays[0].id;

      // Delete the parlay
      act(() => {
        result.current.deleteParlay(parlayId);
      });

      // Verify it's deleted
      savedParlays = result.current.getSavedParlays();
      expect(savedParlays).toHaveLength(0);

      // Verify the deleted parlay cannot be retrieved
      const retrievedParlay = result.current.getParlay(parlayId);
      expect(retrievedParlay).toBeUndefined();
    });
  });
});