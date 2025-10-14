// ML Prediction Types

export interface ModelFeatures {
  // Team-level features
  homeTeamElo: number;
  awayTeamElo: number;
  eloSpread: number;
  
  // Recent form (last 5 games)
  homeTeamForm: number; // wins out of last 5
  awayTeamForm: number;
  
  // Rest and travel
  homeTeamRestDays: number;
  awayTeamRestDays: number;
  
  // Season context
  homeTeamRecord: { wins: number; losses: number };
  awayTeamRecord: { wins: number; losses: number };
  
  // Advanced metrics
  homeTeamOffRating?: number;
  homeTeamDefRating?: number;
  awayTeamOffRating?: number;
  awayTeamDefRating?: number;
  
  // Situational
  isPlayoff: boolean;
  isBackToBack: boolean;
  venueAdvantage: number;
  
  // Weather (if applicable)
  temperature?: number;
  windSpeed?: number;
  precipitation?: boolean;
  
  // Injuries/availability
  homeTeamInjuryImpact?: number; // 0-1 scale
  awayTeamInjuryImpact?: number;
}

export interface PredictionInput {
  gameId: string;
  features: ModelFeatures;
  requestedPredictions: PredictionType[];
}

export type PredictionType = 
  | 'win_probability'
  | 'spread'
  | 'total_points'
  | 'player_performance';

export interface Prediction {
  gameId: string;
  type: PredictionType;
  prediction: number | string;
  confidence: number; // 0-100%
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number; // e.g., 95 for 95% CI
  };
  modelInfo: {
    name: string;
    version: string;
    lastTrained: string;
    features: string[];
  };
  featureImportance?: FeatureImportance[];
  createdAt: string;
}

export interface WinProbabilityPrediction extends Prediction {
  type: 'win_probability';
  prediction: number; // 0-100% chance home team wins
  impliedOdds: {
    home: Odds;
    away: Odds;
  };
}

export interface SpreadPrediction extends Prediction {
  type: 'spread';
  prediction: number; // points home team favored by
}

export interface TotalPointsPrediction extends Prediction {
  type: 'total_points';
  prediction: number; // predicted total points
}

export interface PlayerPerformancePrediction extends Prediction {
  type: 'player_performance';
  playerId: string;
  statType: string; // 'points', 'rebounds', 'assists', etc.
  prediction: number;
  overUnderLine?: number;
  overProbability?: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0-1 scale
  impact: 'positive' | 'negative';
  description: string;
}

export interface ModelPerformance {
  accuracy: number;
  logLoss: number;
  brierScore: number;
  calibration: number; // 0-1, closer to 0 is better
  auc: number;
  sharpeRatio?: number; // for betting performance
  roi?: number; // return on investment if betting
  lastEvaluated: string;
  sampleSize: number;
}

export interface PredictionExplanation {
  mainFactors: string[];
  supportingFactors: string[];
  riskFactors: string[];
  historicalComparison?: {
    similarGames: number;
    averageOutcome: number;
    accuracy: number;
  };
  confidence: {
    level: 'low' | 'medium' | 'high';
    reasoning: string;
  };
}