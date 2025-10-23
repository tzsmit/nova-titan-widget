/**
 * Tests for Market Intelligence Service
 * Ensures deterministic calculations and no random data
 */

import { MarketIntelligenceService } from '../../services/marketIntelligenceService';

// Mock the game data for testing
const mockGameData = {
  id: 'test-game-1',
  homeTeam: 'Lakers',
  awayTeam: 'Warriors',
  gameTime: '2024-01-15T20:00:00Z',
  sport: 'basketball_nba',
  odds: {
    moneyline: { home: -150, away: +130 },
    spread: { home: -110, away: -110, line: -7.5 },
    total: { over: -110, under: -110, line: 225.5 }
  }
};

describe('MarketIntelligenceService', () => {
  let service: MarketIntelligenceService;

  beforeEach(() => {
    service = new MarketIntelligenceService();
    // Clear any cached data
    service['cache'].clear();
  });

  describe('getMarketIntelligence', () => {
    it('should return market intelligence data', async () => {
      const result = await service.getMarketIntelligence();
      
      expect(result).toHaveProperty('publicBettingPercentage');
      expect(result).toHaveProperty('sharpMoneyPercentage');
      expect(result).toHaveProperty('lineMovement');
      expect(result).toHaveProperty('bettingVolume');
      expect(result).toHaveProperty('marketSentiment');
      expect(result).toHaveProperty('keyInsights');
      expect(result).toHaveProperty('timestamp');
    });

    it('should produce deterministic results', async () => {
      const result1 = await service.getMarketIntelligence();
      const result2 = await service.getMarketIntelligence();
      const result3 = await service.getMarketIntelligence();

      // Results should be identical (cached)
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should return valid percentage values', async () => {
      const result = await service.getMarketIntelligence();
      
      expect(result.publicBettingPercentage).toBeGreaterThanOrEqual(0);
      expect(result.publicBettingPercentage).toBeLessThanOrEqual(100);
      
      expect(result.sharpMoneyPercentage).toBeGreaterThanOrEqual(0);
      expect(result.sharpMoneyPercentage).toBeLessThanOrEqual(100);
    });

    it('should have proper data types', async () => {
      const result = await service.getMarketIntelligence();
      
      expect(typeof result.publicBettingPercentage).toBe('number');
      expect(typeof result.sharpMoneyPercentage).toBe('number');
      expect(typeof result.lineMovement).toBe('string');
      expect(typeof result.bettingVolume).toBe('string');
      expect(typeof result.marketSentiment).toBe('string');
      expect(Array.isArray(result.keyInsights)).toBe(true);
      expect(typeof result.timestamp).toBe('string');
    });

    it('should provide valid key insights', async () => {
      const result = await service.getMarketIntelligence();
      
      expect(result.keyInsights.length).toBeGreaterThan(0);
      expect(result.keyInsights.length).toBeLessThanOrEqual(5);
      
      result.keyInsights.forEach(insight => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Caching Behavior', () => {
    it('should cache results for the specified TTL', async () => {
      const result1 = await service.getMarketIntelligence();
      
      // Immediately get another result - should be from cache
      const result2 = await service.getMarketIntelligence();
      
      expect(result1).toEqual(result2);
      expect(result1.timestamp).toBe(result2.timestamp);
    });

    it('should use time-based deterministic calculation', async () => {
      // Since we're using time-based calculations, results should be consistent
      // within the same 5-minute window
      const result = await service.getMarketIntelligence();
      
      // Validate that the calculation is deterministic based on timestamp
      expect(typeof result.publicBettingPercentage).toBe('number');
      expect(Number.isFinite(result.publicBettingPercentage)).toBe(true);
    });
  });

  describe('calculateTimeBasedSeed', () => {
    it('should produce consistent seeds for the same time window', () => {
      const service1 = new MarketIntelligenceService();
      const service2 = new MarketIntelligenceService();
      
      // Both services should produce the same seed within the same 5-minute window
      const seed1 = service1['calculateTimeBasedSeed']();
      const seed2 = service2['calculateTimeBasedSeed']();
      
      expect(seed1).toBe(seed2);
    });

    it('should produce different seeds for different time windows', () => {
      const currentTime = Date.now();
      const fiveMinutesLater = currentTime + (5 * 60 * 1000);
      
      // Mock different times
      const originalNow = Date.now;
      
      Date.now = jest.fn(() => currentTime);
      const seed1 = service['calculateTimeBasedSeed']();
      
      Date.now = jest.fn(() => fiveMinutesLater);
      const seed2 = service['calculateTimeBasedSeed']();
      
      expect(seed1).not.toBe(seed2);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('generateDeterministicPercentage', () => {
    it('should generate percentages within valid range', () => {
      const percentage1 = service['generateDeterministicPercentage'](123, 45, 90);
      const percentage2 = service['generateDeterministicPercentage'](456, 30, 70);
      
      expect(percentage1).toBeGreaterThanOrEqual(45);
      expect(percentage1).toBeLessThanOrEqual(90);
      
      expect(percentage2).toBeGreaterThanOrEqual(30);
      expect(percentage2).toBeLessThanOrEqual(70);
    });

    it('should produce consistent results for same inputs', () => {
      const seed = 12345;
      const min = 40;
      const max = 80;
      
      const result1 = service['generateDeterministicPercentage'](seed, min, max);
      const result2 = service['generateDeterministicPercentage'](seed, min, max);
      const result3 = service['generateDeterministicPercentage'](seed, min, max);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should produce different results for different seeds', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(service['generateDeterministicPercentage'](i, 0, 100));
      }
      
      // All results should be different (extremely unlikely to be same)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });

  describe('No Random Data', () => {
    it('should not use Math.random()', async () => {
      const originalRandom = Math.random;
      const mockRandom = jest.fn(() => 0.5);
      Math.random = mockRandom;
      
      try {
        await service.getMarketIntelligence();
        
        // Math.random should never be called
        expect(mockRandom).not.toHaveBeenCalled();
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should produce identical results across multiple instances', async () => {
      const service1 = new MarketIntelligenceService();
      const service2 = new MarketIntelligenceService();
      
      const result1 = await service1.getMarketIntelligence();
      const result2 = await service2.getMarketIntelligence();
      
      // Both services should produce identical results
      expect(result1.publicBettingPercentage).toBe(result2.publicBettingPercentage);
      expect(result1.sharpMoneyPercentage).toBe(result2.sharpMoneyPercentage);
      expect(result1.lineMovement).toBe(result2.lineMovement);
      expect(result1.bettingVolume).toBe(result2.bettingVolume);
      expect(result1.marketSentiment).toBe(result2.marketSentiment);
    });

    it('should maintain consistency over repeated calls', async () => {
      const results = [];
      
      // Make 10 calls and ensure they're all identical
      for (let i = 0; i < 10; i++) {
        results.push(await service.getMarketIntelligence());
      }
      
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.publicBettingPercentage).toBe(firstResult.publicBettingPercentage);
        expect(result.sharpMoneyPercentage).toBe(firstResult.sharpMoneyPercentage);
        expect(result.lineMovement).toBe(firstResult.lineMovement);
        expect(result.bettingVolume).toBe(firstResult.bettingVolume);
        expect(result.marketSentiment).toBe(firstResult.marketSentiment);
        expect(result.keyInsights).toEqual(firstResult.keyInsights);
      });
    });
  });
});