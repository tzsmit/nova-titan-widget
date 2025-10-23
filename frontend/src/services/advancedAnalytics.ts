/**
 * Advanced Analytics Features - Pristine AI Engine Extensions
 * "Trend Analysis, Scenario Simulation, Comparative Analysis"
 */

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  timeframe: string;
  keyFactors: string[];
  prediction: string;
}

export interface ScenarioSimulation {
  scenario: string;
  probability: number;
  impact: string;
  keyVariables: Array<{
    variable: string;
    currentValue: number;
    projectedValue: number;
    influence: number;
  }>;
  outcomes: Array<{
    description: string;
    likelihood: number;
    value: number;
  }>;
}

export interface ComparativeAnalysis {
  primaryEntity: string;
  comparisonEntities: string[];
  metrics: Array<{
    name: string;
    primaryValue: number;
    comparisonValues: number[];
    ranking: number;
    percentile: number;
  }>;
  advantages: string[];
  disadvantages: string[];
  overallRating: number;
}

class AdvancedAnalyticsEngine {
  /**
   * Comprehensive trend analysis with statistical modeling
   */
  analyzeTrend(data: Array<{date: string, value: number}>): TrendAnalysis {
    if (data.length < 3) {
      return {
        direction: 'stable',
        magnitude: 0,
        confidence: 0,
        timeframe: 'insufficient data',
        keyFactors: ['Not enough data points for analysis'],
        prediction: 'Insufficient data for trend analysis'
      };
    }

    // Calculate linear regression
    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map(d => d.value);
    
    const xSum = xValues.reduce((sum, x) => sum + x, 0);
    const ySum = yValues.reduce((sum, y) => sum + y, 0);
    const xySum = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const xSquaredSum = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    // Calculate R-squared for confidence
    const yMean = ySum / n;
    const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = yValues.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    const confidence = Math.max(0, Math.min(100, rSquared * 100));
    
    // Determine direction and magnitude
    const direction = slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable';
    const magnitude = Math.abs(slope) * 100; // Convert to percentage
    
    // Generate key factors
    const keyFactors = this.generateTrendFactors(data, slope, confidence);
    
    // Generate prediction
    const nextValue = slope * n + intercept;
    const changePercent = ((nextValue - yValues[yValues.length - 1]) / yValues[yValues.length - 1]) * 100;
    
    return {
      direction,
      magnitude,
      confidence,
      timeframe: `Based on last ${n} data points`,
      keyFactors,
      prediction: `${confidence >= 70 ? 'Strong' : confidence >= 50 ? 'Moderate' : 'Weak'} ${direction} trend suggests ${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? 'increase' : 'decrease'} likely`
    };
  }

  /**
   * Advanced scenario simulation with Monte Carlo-style analysis
   */
  runScenarioSimulation(
    baseValue: number,
    variables: Array<{name: string, currentValue: number, volatility: number, correlation: number}>
  ): ScenarioSimulation {
    const scenarios = [
      { name: 'Optimistic', multiplier: 1.2, probability: 0.25 },
      { name: 'Expected', multiplier: 1.0, probability: 0.5 },
      { name: 'Pessimistic', multiplier: 0.8, probability: 0.25 }
    ];

    const outcomes = scenarios.map(scenario => {
      let projectedValue = baseValue;
      
      // Apply variable influences
      variables.forEach(variable => {
        const influence = variable.correlation * scenario.multiplier;
        const change = variable.currentValue * variable.volatility * influence;
        projectedValue += change;
      });

      return {
        description: `${scenario.name} scenario: ${projectedValue > baseValue ? 'Above' : 'Below'} expected performance`,
        likelihood: scenario.probability * 100,
        value: projectedValue
      };
    });

    // Calculate key variable projections
    const keyVariables = variables.map(variable => ({
      variable: variable.name,
      currentValue: variable.currentValue,
      projectedValue: variable.currentValue * (1 + variable.volatility * variable.correlation),
      influence: variable.correlation * 100
    }));

    return {
      scenario: 'Multi-variable performance projection',
      probability: 75, // Base confidence in simulation
      impact: this.calculateImpactDescription(outcomes),
      keyVariables,
      outcomes
    };
  }

  /**
   * Comprehensive comparative analysis
   */
  compareEntities(
    primaryEntity: {name: string, stats: Record<string, number>},
    comparisonEntities: Array<{name: string, stats: Record<string, number>}>
  ): ComparativeAnalysis {
    const allEntities = [primaryEntity, ...comparisonEntities];
    const metrics: ComparativeAnalysis['metrics'] = [];

    // Analyze each metric
    Object.keys(primaryEntity.stats).forEach(metric => {
      const values = allEntities.map(entity => entity.stats[metric] || 0);
      const primaryValue = primaryEntity.stats[metric];
      const comparisonValues = comparisonEntities.map(entity => entity.stats[metric] || 0);

      // Calculate ranking (1 = best)
      const sortedValues = [...values].sort((a, b) => b - a);
      const ranking = sortedValues.indexOf(primaryValue) + 1;

      // Calculate percentile
      const betterCount = values.filter(v => v < primaryValue).length;
      const percentile = (betterCount / (values.length - 1)) * 100;

      metrics.push({
        name: metric,
        primaryValue,
        comparisonValues,
        ranking,
        percentile
      });
    });

    // Identify advantages and disadvantages
    const advantages = metrics
      .filter(m => m.ranking <= 2 || m.percentile >= 75)
      .map(m => `Strong ${m.name.toLowerCase()} performance (${this.formatValue(m.primaryValue)})`);

    const disadvantages = metrics
      .filter(m => m.ranking > allEntities.length / 2 && m.percentile < 50)
      .map(m => `Below average ${m.name.toLowerCase()} (${this.formatValue(m.primaryValue)})`);

    // Calculate overall rating
    const avgPercentile = metrics.reduce((sum, m) => sum + m.percentile, 0) / metrics.length;
    const overallRating = Math.round(avgPercentile);

    return {
      primaryEntity: primaryEntity.name,
      comparisonEntities: comparisonEntities.map(e => e.name),
      metrics,
      advantages: advantages.length > 0 ? advantages : ['Consistent baseline performance across metrics'],
      disadvantages: disadvantages.length > 0 ? disadvantages : ['No significant weaknesses identified'],
      overallRating
    };
  }

  /**
   * Market movement analysis with smart money detection
   */
  analyzeMarketMovement(
    initialLine: number,
    currentLine: number,
    volume: number,
    timeElapsed: number // hours
  ): {
    movement: number;
    significance: 'low' | 'medium' | 'high';
    sharpMoney: boolean;
    velocity: number;
    recommendation: string;
  } {
    const movement = Math.abs(currentLine - initialLine);
    const velocity = movement / Math.max(timeElapsed, 1);
    
    // Determine significance based on movement size and velocity
    let significance: 'low' | 'medium' | 'high' = 'low';
    if (movement >= 2 || velocity >= 0.5) significance = 'high';
    else if (movement >= 1 || velocity >= 0.25) significance = 'medium';

    // Sharp money detection (simplified heuristic)
    const sharpMoney = movement >= 1.5 && volume > 1000000 && timeElapsed < 2;

    const recommendation = this.generateMovementRecommendation(movement, significance, sharpMoney);

    return {
      movement,
      significance,
      sharpMoney,
      velocity,
      recommendation
    };
  }

  /**
   * Player consistency scoring with variance analysis
   */
  calculateConsistencyScore(performances: number[]): {
    score: number;
    variance: number;
    reliability: 'high' | 'medium' | 'low';
    streakAnalysis: {
      currentStreak: number;
      streakType: 'above' | 'below' | 'mixed';
      longestStreak: number;
    };
  } {
    if (performances.length === 0) {
      return {
        score: 0,
        variance: 0,
        reliability: 'low',
        streakAnalysis: { currentStreak: 0, streakType: 'mixed', longestStreak: 0 }
      };
    }

    const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Consistency score (lower variance = higher consistency)
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
    const score = Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
    
    const reliability = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';

    // Streak analysis
    const streakAnalysis = this.analyzeStreaks(performances, mean);

    return {
      score,
      variance,
      reliability,
      streakAnalysis
    };
  }

  /**
   * Helper methods
   */
  private generateTrendFactors(data: any[], slope: number, confidence: number): string[] {
    const factors = [];
    
    if (confidence >= 70) {
      factors.push('Strong statistical correlation in recent data');
    }
    
    if (Math.abs(slope) > 0.2) {
      factors.push('Significant directional momentum observed');
    }
    
    if (data.length >= 10) {
      factors.push('Sufficient sample size for reliable analysis');
    }
    
    // Add more context-specific factors
    const recentChange = data[data.length - 1].value - data[data.length - 2].value;
    if (Math.abs(recentChange) > Math.abs(slope) * 2) {
      factors.push('Recent acceleration in performance trend');
    }

    return factors.length > 0 ? factors : ['Standard trend analysis applied'];
  }

  private calculateImpactDescription(outcomes: any[]): string {
    const range = Math.max(...outcomes.map(o => o.value)) - Math.min(...outcomes.map(o => o.value));
    const avgValue = outcomes.reduce((sum, o) => sum + o.value, 0) / outcomes.length;
    
    const impactMagnitude = (range / avgValue) * 100;
    
    if (impactMagnitude > 30) return 'High variance - significant impact on outcomes';
    if (impactMagnitude > 15) return 'Moderate variance - noticeable impact potential';
    return 'Low variance - stable outcome expectation';
  }

  private formatValue(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(1);
  }

  private generateMovementRecommendation(movement: number, significance: string, sharpMoney: boolean): string {
    if (sharpMoney) {
      return `Sharp money detected - ${movement.toFixed(1)} point movement suggests informed betting`;
    }
    
    if (significance === 'high') {
      return `Significant line movement (${movement.toFixed(1)} points) - monitor for value opportunities`;
    }
    
    if (significance === 'medium') {
      return `Moderate movement (${movement.toFixed(1)} points) - standard market adjustment`;
    }
    
    return `Minor movement (${movement.toFixed(1)} points) - normal market fluctuation`;
  }

  private analyzeStreaks(performances: number[], mean: number): any {
    let currentStreak = 0;
    let currentStreakType: 'above' | 'below' | 'mixed' = 'mixed';
    let longestStreak = 0;
    let tempStreak = 0;
    let lastType: 'above' | 'below' | null = null;

    for (let i = performances.length - 1; i >= 0; i--) {
      const isAbove = performances[i] > mean;
      const type = isAbove ? 'above' : 'below';
      
      if (i === performances.length - 1) {
        currentStreakType = type;
        currentStreak = 1;
        tempStreak = 1;
        lastType = type;
      } else {
        if (type === lastType) {
          if (i === performances.length - 2) currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          lastType = type;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      streakType: currentStreakType,
      longestStreak
    };
  }
}

export const advancedAnalyticsEngine = new AdvancedAnalyticsEngine();