/**
 * Tests for format utility functions
 * Ensures consistent and professional number formatting
 */

import {
  formatPercentage,
  formatCurrency,
  formatLargeNumber,
  formatOdds,
  formatConfidence,
  formatDecimal,
  formatInteger
} from '../../utils/format';

describe('Format Utilities', () => {
  describe('formatPercentage', () => {
    it('should format percentages with 1 decimal place by default', () => {
      expect(formatPercentage(75.5)).toBe('75.5%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage(75.567, 2)).toBe('75.57%');
      expect(formatPercentage(75.567, 0)).toBe('76%');
    });

    it('should handle invalid values', () => {
      expect(formatPercentage(NaN)).toBe('0.0%');
      expect(formatPercentage(Infinity)).toBe('0.0%');
      expect(formatPercentage(-Infinity)).toBe('0.0%');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with $ symbol and 2 decimal places', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle invalid values', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency(Infinity)).toBe('$0.00');
    });
  });

  describe('formatLargeNumber', () => {
    it('should format numbers with K/M/B suffixes', () => {
      expect(formatLargeNumber(1000)).toBe('1.0K');
      expect(formatLargeNumber(1500)).toBe('1.5K');
      expect(formatLargeNumber(1000000)).toBe('1.0M');
      expect(formatLargeNumber(2500000)).toBe('2.5M');
      expect(formatLargeNumber(1000000000)).toBe('1.0B');
    });

    it('should not format small numbers', () => {
      expect(formatLargeNumber(999)).toBe('999');
      expect(formatLargeNumber(500)).toBe('500');
      expect(formatLargeNumber(0)).toBe('0');
    });

    it('should handle invalid values', () => {
      expect(formatLargeNumber(NaN)).toBe('0');
      expect(formatLargeNumber(Infinity)).toBe('0');
    });
  });

  describe('formatOdds', () => {
    it('should format positive odds with + sign', () => {
      expect(formatOdds(150)).toBe('+150');
      expect(formatOdds(250)).toBe('+250');
    });

    it('should format negative odds without changing sign', () => {
      expect(formatOdds(-150)).toBe('-150');
      expect(formatOdds(-200)).toBe('-200');
    });

    it('should handle even odds', () => {
      expect(formatOdds(100)).toBe('+100');
      expect(formatOdds(-100)).toBe('-100');
    });

    it('should handle edge cases', () => {
      expect(formatOdds(0)).toBe('EVEN');
      expect(formatOdds(NaN)).toBe('--');
      expect(formatOdds(Infinity)).toBe('--');
    });
  });

  describe('formatConfidence', () => {
    it('should format confidence as percentage with 1 decimal', () => {
      expect(formatConfidence(0.75)).toBe('75.0%');
      expect(formatConfidence(0.856)).toBe('85.6%');
      expect(formatConfidence(1.0)).toBe('100.0%');
    });

    it('should handle percentage format input', () => {
      expect(formatConfidence(75)).toBe('75.0%');
      expect(formatConfidence(85.6)).toBe('85.6%');
    });

    it('should clamp values to 0-100%', () => {
      expect(formatConfidence(1.5)).toBe('100.0%'); // 150% -> 100%
      expect(formatConfidence(-0.1)).toBe('0.0%'); // -10% -> 0%
    });

    it('should handle invalid values', () => {
      expect(formatConfidence(NaN)).toBe('0.0%');
      expect(formatConfidence(Infinity)).toBe('100.0%');
    });
  });

  describe('formatDecimal', () => {
    it('should format decimals with specified places', () => {
      expect(formatDecimal(3.14159, 2)).toBe('3.14');
      expect(formatDecimal(10, 1)).toBe('10.0');
      expect(formatDecimal(5.999, 2)).toBe('6.00');
    });

    it('should handle invalid values', () => {
      expect(formatDecimal(NaN, 2)).toBe('0.00');
      expect(formatDecimal(Infinity, 1)).toBe('0.0');
    });
  });

  describe('formatInteger', () => {
    it('should format integers with no decimal places', () => {
      expect(formatInteger(123.456)).toBe('123');
      expect(formatInteger(999.9)).toBe('1000');
      expect(formatInteger(-45.7)).toBe('-46');
    });

    it('should handle invalid values', () => {
      expect(formatInteger(NaN)).toBe('0');
      expect(formatInteger(Infinity)).toBe('0');
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce consistent results for the same input', () => {
      const testValue = 75.12345;
      
      // Multiple calls should produce identical results
      const result1 = formatPercentage(testValue, 2);
      const result2 = formatPercentage(testValue, 2);
      const result3 = formatPercentage(testValue, 2);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('75.12%');
    });

    it('should not use random values in formatting', () => {
      // Test that formatting is completely deterministic
      const inputs = [0, 50, 75.5, 100, 123.456, 999.999];
      
      inputs.forEach(input => {
        const results = Array.from({ length: 10 }, () => formatPercentage(input));
        const firstResult = results[0];
        
        // All results should be identical
        results.forEach(result => {
          expect(result).toBe(firstResult);
        });
      });
    });
  });
});