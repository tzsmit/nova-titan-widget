// Betting Types & Odds

export type OddsFormat = 'american' | 'decimal' | 'fractional';

export type BetType = 
  | 'moneyline' 
  | 'spread' 
  | 'total' 
  | 'player_prop'
  | 'team_prop'
  | 'quarter'
  | 'half';

export interface AmericanOdds {
  format: 'american';
  value: number; // e.g., +150 or -110
}

export interface DecimalOdds {
  format: 'decimal';
  value: number; // e.g., 2.50
}

export interface FractionalOdds {
  format: 'fractional';
  numerator: number;
  denominator: number; // e.g., 3/2
}

export type Odds = AmericanOdds | DecimalOdds | FractionalOdds;

export interface Market {
  id: string;
  gameId: string;
  type: BetType;
  name: string;
  description?: string;
  outcomes: Outcome[];
  lastUpdated: string;
  status: 'active' | 'suspended' | 'settled';
}

export interface Outcome {
  id: string;
  name: string;
  odds: Odds;
  point?: number; // For spreads and totals
  description?: string;
  // Bookmaker info
  bookmaker: string;
  impliedProbability: number; // 0-100%
}

export interface Bet {
  id: string;
  outcomeId: string;
  market: Market;
  odds: Odds;
  stake: number;
  potentialPayout: number;
  impliedProbability: number;
  expectedValue?: number;
  confidence?: number;
}

export interface Parlay {
  id: string;
  bets: Bet[];
  totalOdds: Odds;
  totalStake: number;
  potentialPayout: number;
  combinedProbability: number;
  expectedValue: number;
  type: 'max_probability' | 'max_payout';
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

export interface KellyResult {
  kellyFraction: number;
  recommendedStake: number;
  maxStake: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface BankrollSettings {
  totalBankroll: number;
  maxBetPercentage: number; // 1-10%
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  unitSize: number;
}

export interface BettingRecommendation {
  bet: Bet;
  kelly: KellyResult;
  reasoning: string[];
  confidence: number; // 0-100%
  expectedValue: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}