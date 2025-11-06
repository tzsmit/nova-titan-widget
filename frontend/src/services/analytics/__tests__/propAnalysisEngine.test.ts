/**
 * Prop Analysis Engine Tests
 * Comprehensive test suite for prop analysis algorithms
 */

import { propAnalysisEngine, PlayerPropData } from '../propAnalysisEngine';

describe('PropAnalysisEngine', () => {
  const mockPropData: PlayerPropData = {
    player: 'Test Player',
    prop: 'points',
    line: 25.5,
    team: 'TEST',
    opponent: 'OPP',
    gameDate: '2025-11-07',
    isHome: true,
    lastTenGames: [28, 26, 30, 24, 27, 29, 25, 31, 26, 28],
    seasonAverage: 27.4,
    homeAverage: 28.5,
    awayAverage: 26.3,
    minutesPerGame: 35,
    injuryStatus: 'healthy',
    restDays: 1
  };

  describe('analyzeProp', () => {
    it('should return a valid prop analysis', () => {
      const analysis = propAnalysisEngine.analyzeProp(mockPropData);
      
      expect(analysis).toBeDefined();
      expect(analysis.player).toBe('Test Player');
      expect(analysis.prop).toBe('points');
      expect(analysis.line).toBe(25.5);
      expect(analysis.recommendation).toMatch(/HIGHER|LOWER|AVOID/);
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(100);
    });

    it('should calculate safety score between 0 and 100', () => {
      const analysis = propAnalysisEngine.analyzeProp(mockPropData);
      
      expect(analysis.safetyScore).toBeGreaterThanOrEqual(0);
      expect(analysis.safetyScore).toBeLessThanOrEqual(100);
    });

    it('should recommend HIGHER when recent average is above line', () => {
      const highPropData = {
        ...mockPropData,
        lastTenGames: [30, 32, 29, 31, 33, 30, 32, 31, 30, 34],
        seasonAverage: 31.0
      };
      
      const analysis = propAnalysisEngine.analyzeProp(highPropData);
      expect(analysis.recommendation).toBe('HIGHER');
    });

    it('should recommend LOWER when recent average is below line', () => {
      const lowPropData = {
        ...mockPropData,
        lastTenGames: [18, 20, 17, 19, 21, 18, 20, 19, 18, 17],
        seasonAverage: 18.7,
        line: 25.5
      };
      
      const analysis = propAnalysisEngine.analyzeProp(lowPropData);
      expect(analysis.recommendation).toBe('LOWER');
    });

    it('should recommend AVOID for high variance props', () => {
      const highVarianceProp = {
        ...mockPropData,
        lastTenGames: [10, 35, 12, 38, 15, 32, 8, 40, 11, 37],
        seasonAverage: 23.8
      };
      
      const analysis = propAnalysisEngine.analyzeProp(highVarianceProp);
      // High variance should result in low safety score or AVOID recommendation
      expect(analysis.safetyScore < 70 || analysis.recommendation === 'AVOID').toBe(true);
    });
  });

  describe('Consistency Calculation', () => {
    it('should calculate high consistency for stable performance', () => {
      const stableProp = {
        ...mockPropData,
        lastTenGames: [25, 26, 25, 26, 25, 26, 25, 26, 25, 26],
        line: 25.5
      };
      
      const analysis = propAnalysisEngine.analyzeProp(stableProp);
      expect(analysis.metrics.consistency).toBeGreaterThan(0.7);
    });

    it('should calculate low consistency for volatile performance', () => {
      const volatileProp = {
        ...mockPropData,
        lastTenGames: [10, 40, 15, 35, 12, 38, 8, 42, 11, 36],
        line: 25.5
      };
      
      const analysis = propAnalysisEngine.analyzeProp(volatileProp);
      expect(analysis.metrics.consistency).toBeLessThan(0.5);
    });
  });

  describe('Variance Calculation', () => {
    it('should calculate low variance for consistent performances', () => {
      const consistentProp = {
        ...mockPropData,
        lastTenGames: [27, 28, 27, 28, 27, 28, 27, 28, 27, 28]
      };
      
      const analysis = propAnalysisEngine.analyzeProp(consistentProp);
      expect(analysis.metrics.variance).toBeLessThan(1.5);
    });

    it('should calculate high variance for inconsistent performances', () => {
      const inconsistentProp = {
        ...mockPropData,
        lastTenGames: [10, 40, 15, 35, 8, 42, 12, 38, 11, 45]
      };
      
      const analysis = propAnalysisEngine.analyzeProp(inconsistentProp);
      expect(analysis.metrics.variance).toBeGreaterThan(10);
    });
  });

  describe('Trend Detection', () => {
    it('should detect increasing trend', () => {
      const increasingProp = {
        ...mockPropData,
        lastTenGames: [20, 22, 21, 24, 23, 26, 28, 30, 32, 34],
        seasonAverage: 25.0
      };
      
      const analysis = propAnalysisEngine.analyzeProp(increasingProp);
      expect(analysis.metrics.trend).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      const decreasingProp = {
        ...mockPropData,
        lastTenGames: [34, 32, 30, 28, 26, 24, 22, 20, 18, 16],
        seasonAverage: 25.0
      };
      
      const analysis = propAnalysisEngine.analyzeProp(decreasingProp);
      expect(analysis.metrics.trend).toBe('decreasing');
    });

    it('should detect stable trend', () => {
      const stableProp = {
        ...mockPropData,
        lastTenGames: [25, 26, 24, 27, 25, 26, 24, 27, 25, 26],
        seasonAverage: 25.5
      };
      
      const analysis = propAnalysisEngine.analyzeProp(stableProp);
      expect(analysis.metrics.trend).toBe('stable');
    });
  });

  describe('Risk Assessment', () => {
    it('should assess LOW risk for safe props', () => {
      const safeProp = {
        ...mockPropData,
        lastTenGames: [27, 28, 27, 29, 28, 27, 28, 29, 27, 28],
        seasonAverage: 27.8,
        injuryStatus: 'healthy' as const
      };
      
      const analysis = propAnalysisEngine.analyzeProp(safeProp);
      expect(analysis.risk.level).toBe('LOW');
    });

    it('should assess HIGH risk for questionable injury status', () => {
      const riskyProp = {
        ...mockPropData,
        injuryStatus: 'questionable' as const,
        lastTenGames: [10, 30, 15, 35, 12, 32, 8, 38, 11, 36]
      };
      
      const analysis = propAnalysisEngine.analyzeProp(riskyProp);
      expect(['HIGH', 'AVOID']).toContain(analysis.risk.level);
    });
  });

  describe('Batch Processing', () => {
    it('should analyze multiple props', () => {
      const props: PlayerPropData[] = [
        mockPropData,
        { ...mockPropData, player: 'Player 2', prop: 'rebounds' },
        { ...mockPropData, player: 'Player 3', prop: 'assists' }
      ];
      
      const analyses = propAnalysisEngine.analyzeMultipleProps(props);
      
      expect(analyses).toHaveLength(3);
      expect(analyses[0].player).toBe('Test Player');
      expect(analyses[1].player).toBe('Player 2');
      expect(analyses[2].player).toBe('Player 3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty lastTenGames array', () => {
      const emptyProp = {
        ...mockPropData,
        lastTenGames: []
      };
      
      const analysis = propAnalysisEngine.analyzeProp(emptyProp);
      expect(analysis.recommendation).toBe('AVOID');
    });

    it('should handle single game in lastTenGames', () => {
      const singleGameProp = {
        ...mockPropData,
        lastTenGames: [28]
      };
      
      const analysis = propAnalysisEngine.analyzeProp(singleGameProp);
      expect(analysis).toBeDefined();
      expect(analysis.recommendation).toBe('AVOID'); // Not enough data
    });

    it('should handle very high line values', () => {
      const highLineProp = {
        ...mockPropData,
        line: 100.5,
        lastTenGames: [95, 98, 92, 100, 97, 99, 96, 101, 94, 98]
      };
      
      const analysis = propAnalysisEngine.analyzeProp(highLineProp);
      expect(analysis).toBeDefined();
      expect(analysis.recommendation).toMatch(/HIGHER|LOWER|AVOID/);
    });
  });
});
