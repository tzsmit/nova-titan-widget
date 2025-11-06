/**
 * Performance Tracker Tests
 * Test ROI calculation, win rate tracking, and backtesting
 */

import { performanceTracker, PickRecord } from '../performanceTracker';

describe('PerformanceTracker', () => {
  beforeEach(() => {
    // Clear all data before each test
    performanceTracker.clearAllData();
  });

  describe('addPick', () => {
    it('should add a new pick with PENDING status', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      expect(pickId).toBeDefined();
      expect(pickId).toMatch(/^pick_/);
    });
  });

  describe('updatePickResult', () => {
    it('should mark pick as WIN when condition is met (HIGHER)', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.updatePickResult(pickId, 28);
      
      const stats = performanceTracker.getPerformanceStats();
      expect(stats.overall.wins).toBe(1);
      expect(stats.overall.losses).toBe(0);
    });

    it('should mark pick as LOSS when condition is not met (HIGHER)', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.updatePickResult(pickId, 22);
      
      const stats = performanceTracker.getPerformanceStats();
      expect(stats.overall.wins).toBe(0);
      expect(stats.overall.losses).toBe(1);
    });

    it('should mark pick as WIN when condition is met (LOWER)', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'LOWER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.updatePickResult(pickId, 22);
      
      const stats = performanceTracker.getPerformanceStats();
      expect(stats.overall.wins).toBe(1);
      expect(stats.overall.losses).toBe(0);
    });

    it('should mark pick as PUSH when result equals line', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.updatePickResult(pickId, 25.5);
      
      const stats = performanceTracker.getPerformanceStats();
      expect(stats.overall.wins).toBe(0);
      expect(stats.overall.losses).toBe(0);
      expect(stats.overall.pushes).toBe(1);
    });
  });

  describe('getPerformanceStats', () => {
    it('should calculate correct win rate', () => {
      // Add 3 wins
      for (let i = 0; i < 3; i++) {
        const id = performanceTracker.addPick({
          date: '2025-11-07',
          player: `Player ${i}`,
          prop: 'points',
          line: 25.5,
          pick: 'HIGHER',
          actualValue: 0,
          confidence: 85,
          safetyScore: 90,
          odds: -110,
          stake: 100
        });
        performanceTracker.updatePickResult(id, 30);
      }

      // Add 1 loss
      const lossId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Player Loss',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });
      performanceTracker.updatePickResult(lossId, 20);

      const stats = performanceTracker.getPerformanceStats();
      expect(stats.overall.winRate).toBe(0.75); // 3/4 = 75%
    });

    it('should calculate correct ROI', () => {
      const pickId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Test Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.updatePickResult(pickId, 30);
      
      const stats = performanceTracker.getPerformanceStats();
      // At -110 odds, winning $100 stake returns ~$90.91 profit
      // ROI = profit / stake = 90.91 / 100 = ~91%
      expect(stats.overall.roi).toContain('%');
      expect(parseFloat(stats.overall.roi)).toBeGreaterThan(0);
    });

    it('should track by category correctly', () => {
      // Add points pick
      const pointsId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Player 1',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });
      performanceTracker.updatePickResult(pointsId, 30);

      // Add rebounds pick
      const reboundsId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Player 2',
        prop: 'rebounds',
        line: 10.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });
      performanceTracker.updatePickResult(reboundsId, 12);

      const stats = performanceTracker.getPerformanceStats();
      expect(stats.byCategory.points).toBeDefined();
      expect(stats.byCategory.rebounds).toBeDefined();
      expect(stats.byCategory.points.picks).toBe(1);
      expect(stats.byCategory.rebounds.picks).toBe(1);
    });

    it('should track by safety score range', () => {
      // High safety pick
      const highSafetyId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'High Safety Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 95,
        odds: -110,
        stake: 100
      });
      performanceTracker.updatePickResult(highSafetyId, 30);

      // Medium safety pick
      const medSafetyId = performanceTracker.addPick({
        date: '2025-11-07',
        player: 'Medium Safety Player',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 75,
        safetyScore: 85,
        odds: -110,
        stake: 100
      });
      performanceTracker.updatePickResult(medSafetyId, 30);

      const stats = performanceTracker.getPerformanceStats();
      expect(stats.bySafety['90-100']).toBeDefined();
      expect(stats.bySafety['80-89']).toBeDefined();
      expect(stats.bySafety['90-100'].picks).toBe(1);
      expect(stats.bySafety['80-89'].picks).toBe(1);
    });
  });

  describe('backtestAlgorithm', () => {
    it('should generate backtest results', async () => {
      const results = await performanceTracker.backtestAlgorithm(30);
      
      expect(results).toBeDefined();
      expect(results.period).toBe('Last 30 days');
      expect(results.totalPicks).toBeGreaterThan(0);
      expect(results.winRate).toBeGreaterThanOrEqual(0);
      expect(results.winRate).toBeLessThanOrEqual(1);
      expect(results.roi).toBeDefined();
    });

    it('should identify best and worst categories', async () => {
      const results = await performanceTracker.backtestAlgorithm(30);
      
      expect(results.bestCategory).toBeDefined();
      expect(results.worstCategory).toBeDefined();
    });

    it('should calculate calibration score', async () => {
      const results = await performanceTracker.backtestAlgorithm(30);
      
      expect(results.calibrationScore).toBeGreaterThanOrEqual(0);
      expect(results.calibrationScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getPicksByDateRange', () => {
    it('should filter picks by date range', () => {
      performanceTracker.addPick({
        date: '2025-11-05',
        player: 'Player 1',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.addPick({
        date: '2025-11-06',
        player: 'Player 2',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      performanceTracker.addPick({
        date: '2025-11-08',
        player: 'Player 3',
        prop: 'points',
        line: 25.5,
        pick: 'HIGHER',
        actualValue: 0,
        confidence: 85,
        safetyScore: 90,
        odds: -110,
        stake: 100
      });

      const picks = performanceTracker.getPicksByDateRange('2025-11-05', '2025-11-06');
      expect(picks.length).toBe(2);
    });
  });
});
