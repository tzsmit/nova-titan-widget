/**
 * Enhanced Data Validation Utilities
 * Prevents false information and ensures data accuracy
 */

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
}

export interface DataSource {
  name: string;
  reliability: number; // 0-1 scale
  lastUpdated: string;
  dataType: 'odds' | 'stats' | 'predictions' | 'injuries';
}

class DataValidationService {
  private readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.85,
    MEDIUM: 0.65,
    LOW: 0.45
  };

  private readonly RELIABILITY_WEIGHTS = {
    'The Odds API': 0.95,
    'ESPN API': 0.90,
    'Enhanced Sports Data': 0.80,
    'Generated Stats': 0.60,
    'Mock Data': 0.30
  };

  /**
   * Validate AI prediction accuracy and reliability
   */
  validatePrediction(prediction: any, sources: DataSource[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let confidence = 1.0;

    // Check prediction structure
    if (!this.validatePredictionStructure(prediction)) {
      errors.push('Invalid prediction structure');
      confidence *= 0.5;
    }

    // Validate confidence scores
    if (prediction.predictions) {
      Object.entries(prediction.predictions).forEach(([type, pred]: [string, any]) => {
        if (pred.confidence > 95) {
          warnings.push(`${type} prediction confidence (${pred.confidence}%) seems unrealistically high`);
          confidence *= 0.9;
        } else if (pred.confidence < 55) {
          warnings.push(`${type} prediction confidence (${pred.confidence}%) is very low`);
          confidence *= 0.95;
        }
      });
    }

    // Check data source reliability
    const sourceReliability = this.calculateSourceReliability(sources);
    if (sourceReliability < 0.7) {
      warnings.push('Prediction based on limited or unreliable data sources');
      confidence *= sourceReliability;
    }

    // Validate reasoning quality
    if (prediction.analysis?.keyFactors) {
      const reasoningQuality = this.validateReasoning(prediction.analysis.keyFactors);
      if (reasoningQuality < 0.6) {
        warnings.push('Prediction reasoning may lack sufficient detail');
        confidence *= reasoningQuality;
      }
    }

    // Check for overly specific claims
    if (this.containsOverlySpecificClaims(prediction)) {
      warnings.push('Prediction contains overly specific claims that may not be reliable');
      confidence *= 0.85;
    }

    // Temporal validation
    const timeValidation = this.validateTimestamps(prediction);
    if (!timeValidation.isValid) {
      errors.push(...timeValidation.errors);
      confidence *= 0.8;
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, Math.min(1, confidence)),
      warnings,
      errors
    };
  }

  /**
   * Validate team statistics for accuracy
   */
  validateTeamStats(stats: any, team: string, sport: string): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let confidence = 1.0;

    if (!stats) {
      errors.push(`No statistics available for ${team}`);
      return { isValid: false, confidence: 0, warnings, errors };
    }

    // Validate win/loss records make sense
    if (stats.record) {
      const totalGames = stats.record.wins + stats.record.losses + (stats.record.ties || 0);
      if (totalGames > this.getMaxGamesForSport(sport)) {
        warnings.push(`${team} appears to have played more games than possible in ${sport}`);
        confidence *= 0.7;
      }
      
      if (stats.record.wins < 0 || stats.record.losses < 0) {
        errors.push(`Invalid win/loss record for ${team}`);
        confidence *= 0.5;
      }
    }

    // Validate scoring statistics
    if (stats.performance) {
      if (this.isUnrealisticScoringStats(stats.performance, sport)) {
        warnings.push(`${team} scoring statistics appear unrealistic for ${sport}`);
        confidence *= 0.8;
      }
    }

    // Check for consistency in home/away records
    if (stats.performance?.homeRecord && stats.performance?.awayRecord && stats.record) {
      const homeTotal = stats.performance.homeRecord.wins + stats.performance.homeRecord.losses;
      const awayTotal = stats.performance.awayRecord.wins + stats.performance.awayRecord.losses;
      const overallTotal = stats.record.wins + stats.record.losses;
      
      if (Math.abs((homeTotal + awayTotal) - overallTotal) > 2) {
        warnings.push(`Home/away record totals don't match overall record for ${team}`);
        confidence *= 0.85;
      }
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, Math.min(1, confidence)),
      warnings,
      errors
    };
  }

  /**
   * Validate odds data for consistency and realism
   */
  validateOdds(odds: any, game: any): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let confidence = 1.0;

    if (!odds) {
      errors.push('No odds data available');
      return { isValid: false, confidence: 0, warnings, errors };
    }

    // Validate moneyline odds
    if (odds.moneyline) {
      if (this.areUnrealisticOdds(odds.moneyline.home) || this.areUnrealisticOdds(odds.moneyline.away)) {
        warnings.push('Moneyline odds appear unrealistic');
        confidence *= 0.8;
      }
    }

    // Validate spread consistency
    if (odds.spread) {
      if (Math.abs(odds.spread.line) > 50) {
        warnings.push(`Spread line (${odds.spread.line}) seems unusually large`);
        confidence *= 0.7;
      }
      
      if (odds.spread.home && odds.spread.away) {
        const avgSpreadOdds = (Math.abs(odds.spread.home) + Math.abs(odds.spread.away)) / 2;
        if (avgSpreadOdds < 100 || avgSpreadOdds > 120) {
          warnings.push('Spread odds are outside typical range (-120 to -100)');
          confidence *= 0.9;
        }
      }
    }

    // Validate total
    if (odds.total) {
      const expectedRange = this.getExpectedTotalRange(game.sport);
      if (odds.total.line < expectedRange.min || odds.total.line > expectedRange.max) {
        warnings.push(`Total (${odds.total.line}) is outside expected range for ${game.sport}`);
        confidence *= 0.85;
      }
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, Math.min(1, confidence)),
      warnings,
      errors
    };
  }

  /**
   * Cross-validate multiple data sources for consistency
   */
  crossValidateData(dataSources: { source: string; data: any; type: string }[]): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    let confidence = 1.0;

    if (dataSources.length < 2) {
      warnings.push('Limited data sources available for cross-validation');
      confidence *= 0.8;
    }

    // Check for major inconsistencies between sources
    const inconsistencies = this.findDataInconsistencies(dataSources);
    if (inconsistencies.length > 0) {
      warnings.push(...inconsistencies.map(inc => `Data inconsistency: ${inc}`));
      confidence *= Math.max(0.6, 1 - (inconsistencies.length * 0.1));
    }

    // Validate data freshness
    const staleDataSources = dataSources.filter(ds => this.isDataStale(ds.data));
    if (staleDataSources.length > 0) {
      warnings.push(`${staleDataSources.length} data source(s) may be outdated`);
      confidence *= 0.9;
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(0, Math.min(1, confidence)),
      warnings,
      errors
    };
  }

  // Private validation helper methods

  private validatePredictionStructure(prediction: any): boolean {
    const requiredFields = ['id', 'gameId', 'sport', 'homeTeam', 'awayTeam', 'predictions'];
    return requiredFields.every(field => prediction.hasOwnProperty(field));
  }

  private calculateSourceReliability(sources: DataSource[]): number {
    if (sources.length === 0) return 0.3;
    
    const weightedReliability = sources.reduce((acc, source) => {
      const weight = this.RELIABILITY_WEIGHTS[source.name] || 0.5;
      return acc + (source.reliability * weight);
    }, 0);
    
    return weightedReliability / sources.length;
  }

  private validateReasoning(keyFactors: string[]): number {
    if (!Array.isArray(keyFactors) || keyFactors.length === 0) return 0.3;
    
    // Check for generic or low-quality reasoning
    const genericTerms = ['good', 'bad', 'better', 'worse', 'strong', 'weak'];
    const genericCount = keyFactors.reduce((count, factor) => {
      return count + genericTerms.reduce((termCount, term) => {
        return termCount + (factor.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
    }, 0);
    
    const qualityScore = Math.max(0.4, 1 - (genericCount / keyFactors.length));
    return qualityScore;
  }

  private containsOverlySpecificClaims(prediction: any): boolean {
    const specificClaims = [
      'will definitely', 'guaranteed', '100% chance', 'absolutely certain',
      'impossible to lose', 'sure thing', 'can\'t miss'
    ];
    
    const textContent = JSON.stringify(prediction).toLowerCase();
    return specificClaims.some(claim => textContent.includes(claim));
  }

  private validateTimestamps(prediction: any): ValidationResult {
    const errors: string[] = [];
    const now = new Date();
    
    if (prediction.generatedAt) {
      const generatedAt = new Date(prediction.generatedAt);
      if (generatedAt > now) {
        errors.push('Prediction timestamp is in the future');
      }
      
      const ageHours = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
      if (ageHours > 24) {
        errors.push('Prediction is more than 24 hours old');
      }
    }
    
    return { isValid: errors.length === 0, confidence: 1, warnings: [], errors };
  }

  private getMaxGamesForSport(sport: string): number {
    const maxGames: { [key: string]: number } = {
      'americanfootball_nfl': 17,
      'basketball_nba': 82,
      'baseball_mlb': 162,
      'americanfootball_ncaaf': 15,
      'basketball_ncaab': 35
    };
    return maxGames[sport] || 50;
  }

  private isUnrealisticScoringStats(performance: any, sport: string): boolean {
    const ranges: { [key: string]: { min: number; max: number } } = {
      'americanfootball_nfl': { min: 10, max: 50 },
      'basketball_nba': { min: 80, max: 140 },
      'baseball_mlb': { min: 2, max: 12 },
      'americanfootball_ncaaf': { min: 14, max: 55 },
      'basketball_ncaab': { min: 50, max: 100 }
    };
    
    const range = ranges[sport];
    if (!range || !performance.pointsFor) return false;
    
    const avgPoints = performance.pointsFor / 10; // Assuming 10+ games
    return avgPoints < range.min || avgPoints > range.max;
  }

  private areUnrealisticOdds(odds: number): boolean {
    return Math.abs(odds) < 100 || Math.abs(odds) > 2000;
  }

  private getExpectedTotalRange(sport: string): { min: number; max: number } {
    const ranges: { [key: string]: { min: number; max: number } } = {
      'americanfootball_nfl': { min: 30, max: 65 },
      'basketball_nba': { min: 200, max: 250 },
      'baseball_mlb': { min: 6, max: 12 },
      'americanfootball_ncaaf': { min: 35, max: 80 },
      'basketball_ncaab': { min: 120, max: 160 }
    };
    return ranges[sport] || { min: 0, max: 1000 };
  }

  private findDataInconsistencies(dataSources: { source: string; data: any; type: string }[]): string[] {
    // This would compare data between sources and identify major discrepancies
    // For now, return empty array - in production this would do detailed comparison
    return [];
  }

  private isDataStale(data: any): boolean {
    if (!data.lastUpdated && !data.generatedAt && !data.timestamp) return true;
    
    const timestamp = new Date(data.lastUpdated || data.generatedAt || data.timestamp);
    const now = new Date();
    const ageHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    return ageHours > 6; // Consider data stale if older than 6 hours
  }
}

export const dataValidationService = new DataValidationService();