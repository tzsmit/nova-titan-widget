// Kelly Criterion & Bankroll Management Utilities

import { Odds, BankrollSettings, KellyResult } from '../types/betting';
import { impliedProbability, toDecimal } from './odds';

/**
 * Calculate Kelly Criterion fraction
 * Formula: f = (bp - q) / b
 * Where:
 * - f = fraction of bankroll to bet
 * - b = net odds (decimal odds - 1)
 * - p = probability of winning
 * - q = probability of losing (1 - p)
 */
export function calculateKellyFraction(
  trueProbability: number,
  odds: Odds
): number {
  const decimal = toDecimal(odds);
  const netOdds = decimal - 1; // b
  const p = trueProbability; // p
  const q = 1 - p; // q
  
  const kellyFraction = (netOdds * p - q) / netOdds;
  
  // Kelly should be between 0 and 1
  return Math.max(0, Math.min(1, kellyFraction));
}

/**
 * Calculate fractional Kelly (more conservative)
 * Common fractions: 0.25 (quarter Kelly), 0.5 (half Kelly)
 */
export function calculateFractionalKelly(
  trueProbability: number,
  odds: Odds,
  fraction: number = 0.25
): number {
  const fullKelly = calculateKellyFraction(trueProbability, odds);
  return fullKelly * fraction;
}

/**
 * Calculate recommended stake using Kelly criterion
 */
export function calculateKellyStake(
  trueProbability: number,
  odds: Odds,
  bankroll: number,
  settings: Partial<BankrollSettings> = {}
): KellyResult {
  const {
    maxBetPercentage = 5, // 5% max bet size
    riskTolerance = 'moderate'
  } = settings;
  
  // Calculate base Kelly fraction
  let kellyFraction = calculateKellyFraction(trueProbability, odds);
  
  // Apply risk tolerance adjustments
  const riskMultiplier = {
    conservative: 0.25,
    moderate: 0.5,
    aggressive: 1.0
  };
  
  kellyFraction *= riskMultiplier[riskTolerance];
  
  // Cap at maximum bet percentage
  const maxFraction = maxBetPercentage / 100;
  kellyFraction = Math.min(kellyFraction, maxFraction);
  
  // Calculate stakes
  const recommendedStake = bankroll * kellyFraction;
  const maxStake = bankroll * maxFraction;
  
  // Determine confidence level
  const impliedProb = impliedProbability(odds);
  const edge = trueProbability - impliedProb;
  
  let confidence: 'low' | 'medium' | 'high';
  if (edge < 0.02) confidence = 'low';
  else if (edge < 0.05) confidence = 'medium';
  else confidence = 'high';
  
  return {
    kellyFraction,
    recommendedStake: Math.round(recommendedStake * 100) / 100,
    maxStake: Math.round(maxStake * 100) / 100,
    confidence
  };
}

/**
 * Calculate optimal parlay stakes using Kelly
 * More complex as it involves multiple correlated bets
 */
export function calculateParlayKelly(
  probabilities: number[],
  odds: Odds[],
  bankroll: number,
  correlation: number = 0 // -1 to 1, 0 = independent
): KellyResult {
  if (probabilities.length !== odds.length) {
    throw new Error('Probabilities and odds arrays must be same length');
  }
  
  // For independent events, combined probability is product
  let combinedProbability = probabilities.reduce((acc, p) => acc * p, 1);
  
  // Adjust for correlation (simplified approach)
  if (correlation !== 0) {
    const avgProbability = probabilities.reduce((a, b) => a + b) / probabilities.length;
    combinedProbability = combinedProbability + (correlation * avgProbability * 0.1);
    combinedProbability = Math.max(0, Math.min(1, combinedProbability));
  }
  
  // Calculate combined odds (product of decimal odds)
  const combinedDecimalOdds = odds.reduce((acc, odd) => acc * toDecimal(odd), 1);
  const combinedOdds: Odds = { format: 'decimal', value: combinedDecimalOdds };
  
  // Use fractional Kelly for parlays (more conservative)
  return calculateKellyStake(combinedProbability, combinedOdds, bankroll, {
    maxBetPercentage: 2, // Lower max for parlays
    riskTolerance: 'conservative'
  });
}

/**
 * Unit sizing system (alternative to Kelly)
 * Based on confidence levels rather than mathematical optimization
 */
export function calculateUnitStake(
  confidence: number, // 0-100
  bankroll: number,
  unitSize: number = 1 // % of bankroll per unit
): { units: number; stake: number; reasoning: string } {
  let units: number;
  let reasoning: string;
  
  if (confidence >= 80) {
    units = 3;
    reasoning = 'High confidence play - 3 units';
  } else if (confidence >= 65) {
    units = 2;
    reasoning = 'Medium-high confidence - 2 units';
  } else if (confidence >= 50) {
    units = 1;
    reasoning = 'Standard play - 1 unit';
  } else {
    units = 0.5;
    reasoning = 'Low confidence - 0.5 units';
  }
  
  const stake = (bankroll * unitSize / 100) * units;
  
  return {
    units,
    stake: Math.round(stake * 100) / 100,
    reasoning
  };
}

/**
 * Bankroll management helper - calculate safe bet sizes
 */
export function calculateSafeBetSize(
  bankroll: number,
  winRate: number,
  avgOdds: number,
  riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): { recommended: number; maximum: number; reasoning: string } {
  const riskPercentages = {
    conservative: { recommended: 1, maximum: 2 },
    moderate: { recommended: 2, maximum: 5 },
    aggressive: { recommended: 3, maximum: 10 }
  };
  
  const percentages = riskPercentages[riskLevel];
  
  // Adjust based on win rate
  let multiplier = 1;
  if (winRate > 0.6) multiplier = 1.2;
  else if (winRate < 0.45) multiplier = 0.8;
  
  const recommended = (bankroll * percentages.recommended / 100) * multiplier;
  const maximum = bankroll * percentages.maximum / 100;
  
  const reasoning = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} approach with ${(winRate * 100).toFixed(1)}% win rate`;
  
  return {
    recommended: Math.round(recommended * 100) / 100,
    maximum: Math.round(maximum * 100) / 100,
    reasoning
  };
}

/**
 * Calculate expected growth rate using Kelly
 */
export function calculateExpectedGrowth(
  trueProbability: number,
  odds: Odds,
  kellyFraction: number
): number {
  const decimal = toDecimal(odds);
  const p = trueProbability;
  const q = 1 - p;
  const b = decimal - 1;
  
  // Expected log growth per bet
  const growth = p * Math.log(1 + kellyFraction * b) + q * Math.log(1 - kellyFraction);
  
  return growth;
}

/**
 * Risk of ruin calculator
 * Probability of losing entire bankroll
 */
export function calculateRiskOfRuin(
  winRate: number,
  averageOdds: number,
  betSizePercentage: number,
  targetDrawdown: number = 50 // % of bankroll
): number {
  const p = winRate;
  const q = 1 - p;
  const b = averageOdds - 1;
  const f = betSizePercentage / 100;
  
  // Simplified risk of ruin formula
  if (p === 0.5) return 1; // Fair game always has 100% risk of ruin
  
  const advantage = p * (1 + b) - 1;
  if (advantage <= 0) return 1; // Negative expectation
  
  // This is a simplified calculation
  const riskOfRuin = Math.pow(q / p, targetDrawdown / (f * 100));
  
  return Math.min(1, riskOfRuin);
}

/**
 * Validate Kelly inputs and provide warnings
 */
export function validateKellyInputs(
  trueProbability: number,
  odds: Odds
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (trueProbability <= 0 || trueProbability >= 1) {
    warnings.push('True probability must be between 0 and 1');
  }
  
  const impliedProb = impliedProbability(odds);
  const edge = trueProbability - impliedProb;
  
  if (edge <= 0) {
    warnings.push('No positive expected value - bet not recommended');
  }
  
  if (edge < 0.02) {
    warnings.push('Very small edge - high risk of overconfidence');
  }
  
  const kellyFraction = calculateKellyFraction(trueProbability, odds);
  if (kellyFraction > 0.2) {
    warnings.push('Kelly fraction > 20% - consider fractional Kelly');
  }
  
  if (kellyFraction < 0.01) {
    warnings.push('Kelly fraction < 1% - may not be worth betting');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}