// Odds Conversion Utilities

import { Odds, AmericanOdds, DecimalOdds, FractionalOdds, OddsFormat } from '../types/betting';

/**
 * Convert American odds to decimal format
 */
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

/**
 * Convert decimal odds to American format
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Convert American odds to fractional format
 */
export function americanToFractional(american: number): { numerator: number; denominator: number } {
  if (american > 0) {
    return { numerator: american, denominator: 100 };
  } else {
    return { numerator: 100, denominator: Math.abs(american) };
  }
}

/**
 * Convert fractional odds to American format
 */
export function fractionalToAmerican(numerator: number, denominator: number): number {
  const decimal = (numerator / denominator) + 1;
  return decimalToAmerican(decimal);
}

/**
 * Convert fractional odds to decimal format
 */
export function fractionalToDecimal(numerator: number, denominator: number): number {
  return (numerator / denominator) + 1;
}

/**
 * Convert decimal odds to fractional format
 */
export function decimalToFractional(decimal: number): { numerator: number; denominator: number } {
  const fractionalValue = decimal - 1;
  
  // Convert to simplest fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  
  // Handle common decimal values
  if (fractionalValue === 0.5) return { numerator: 1, denominator: 2 };
  if (fractionalValue === 1) return { numerator: 1, denominator: 1 };
  if (fractionalValue === 1.5) return { numerator: 3, denominator: 2 };
  
  // Convert to fraction with reasonable precision
  const precision = 100;
  const numerator = Math.round(fractionalValue * precision);
  const denominator = precision;
  const divisor = gcd(numerator, denominator);
  
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
}

/**
 * Convert any odds format to decimal
 */
export function toDecimal(odds: Odds): number {
  switch (odds.format) {
    case 'american':
      return americanToDecimal(odds.value);
    case 'decimal':
      return odds.value;
    case 'fractional':
      return fractionalToDecimal(odds.numerator, odds.denominator);
  }
}

/**
 * Convert any odds format to American
 */
export function toAmerican(odds: Odds): number {
  switch (odds.format) {
    case 'american':
      return odds.value;
    case 'decimal':
      return decimalToAmerican(odds.value);
    case 'fractional':
      return fractionalToAmerican(odds.numerator, odds.denominator);
  }
}

/**
 * Convert any odds format to fractional
 */
export function toFractional(odds: Odds): { numerator: number; denominator: number } {
  switch (odds.format) {
    case 'american':
      return americanToFractional(odds.value);
    case 'decimal':
      return decimalToFractional(odds.value);
    case 'fractional':
      return { numerator: odds.numerator, denominator: odds.denominator };
  }
}

/**
 * Convert odds to specified format
 */
export function convertOdds(odds: Odds, targetFormat: OddsFormat): Odds {
  switch (targetFormat) {
    case 'american':
      return { format: 'american', value: toAmerican(odds) };
    case 'decimal':
      return { format: 'decimal', value: toDecimal(odds) };
    case 'fractional':
      const frac = toFractional(odds);
      return { format: 'fractional', numerator: frac.numerator, denominator: frac.denominator };
  }
}

/**
 * Calculate implied probability from odds (0-1 scale)
 */
export function impliedProbability(odds: Odds): number {
  const decimal = toDecimal(odds);
  return 1 / decimal;
}

/**
 * Calculate implied probability as percentage (0-100 scale)
 */
export function impliedProbabilityPercent(odds: Odds): number {
  return impliedProbability(odds) * 100;
}

/**
 * Calculate potential payout for a given stake
 */
export function calculatePayout(odds: Odds, stake: number): number {
  const decimal = toDecimal(odds);
  return stake * decimal;
}

/**
 * Calculate profit for a given stake (payout - stake)
 */
export function calculateProfit(odds: Odds, stake: number): number {
  return calculatePayout(odds, stake) - stake;
}

/**
 * Remove vig (bookmaker margin) from odds to get true odds
 * Assumes equal vig on both sides
 */
export function removeVig(odds1: Odds, odds2: Odds): { odds1: Odds; odds2: Odds } {
  const prob1 = impliedProbability(odds1);
  const prob2 = impliedProbability(odds2);
  const totalProb = prob1 + prob2;
  
  // Normalize probabilities
  const trueProb1 = prob1 / totalProb;
  const trueProb2 = prob2 / totalProb;
  
  // Convert back to odds
  const trueOdds1: DecimalOdds = { format: 'decimal', value: 1 / trueProb1 };
  const trueOdds2: DecimalOdds = { format: 'decimal', value: 1 / trueProb2 };
  
  return {
    odds1: convertOdds(trueOdds1, odds1.format),
    odds2: convertOdds(trueOdds2, odds2.format)
  };
}

/**
 * Calculate expected value given true probability and odds
 */
export function expectedValue(trueProbability: number, odds: Odds, stake: number = 1): number {
  const payout = calculatePayout(odds, stake);
  const profit = payout - stake;
  return (trueProbability * profit) - ((1 - trueProbability) * stake);
}

/**
 * Format odds for display
 */
export function formatOdds(odds: Odds, includeSign: boolean = true): string {
  switch (odds.format) {
    case 'american':
      const sign = includeSign && odds.value > 0 ? '+' : '';
      return `${sign}${odds.value}`;
    case 'decimal':
      return odds.value.toFixed(2);
    case 'fractional':
      return `${odds.numerator}/${odds.denominator}`;
  }
}

/**
 * Check if odds represent a favorite (implied probability > 50%)
 */
export function isFavorite(odds: Odds): boolean {
  return impliedProbability(odds) > 0.5;
}

/**
 * Find the best odds from multiple bookmakers
 */
export function findBestOdds(oddsArray: Odds[]): Odds {
  if (oddsArray.length === 0) throw new Error('No odds provided');
  
  return oddsArray.reduce((best, current) => {
    const bestDecimal = toDecimal(best);
    const currentDecimal = toDecimal(current);
    return currentDecimal > bestDecimal ? current : best;
  });
}