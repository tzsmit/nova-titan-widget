/**
 * Performance Tracker & Backtesting Engine
 * Track prediction accuracy and ROI over time
 */

import { format, subDays, parseISO } from 'date-fns';

export interface PickRecord {
  id: string;
  date: string;
  player: string;
  prop: string;
  line: number;
  pick: 'HIGHER' | 'LOWER';
  actualValue: number;
  result: 'WIN' | 'LOSS' | 'PUSH' | 'PENDING';
  confidence: number;
  safetyScore: number;
  odds: number;
  stake: number;
  profit: number;
}

export interface PerformanceStats {
  overall: {
    totalPicks: number;
    wins: number;
    losses: number;
    pushes: number;
    winRate: number;
    roi: string; // Percentage
    streak: {
      current: number;
      longest: number;
      type: 'win' | 'loss';
    };
    totalStaked: number;
    totalProfit: number;
  };
  byCategory: {
    [category: string]: {
      picks: number;
      winRate: number;
      roi: string;
    };
  };
  bySafety: {
    [range: string]: {
      picks: number;
      winRate: number;
      avgConfidence: number;
    };
  };
  charts: {
    dailyWinRate: Array<{ date: string; winRate: number }>;
    profitCurve: Array<{ date: string; profit: number }>;
    confidenceCalibration: Array<{ predicted: number; actual: number }>;
  };
}

export interface BacktestResult {
  period: string;
  totalPicks: number;
  winRate: number;
  roi: string;
  profitLoss: number;
  bestCategory: string;
  worstCategory: string;
  calibrationScore: number; // How well confidence matches actual performance
}

export class PerformanceTracker {
  private picks: PickRecord[] = [];
  private readonly STORAGE_KEY = 'nova_titan_performance';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new pick to track
   */
  addPick(pick: Omit<PickRecord, 'id' | 'result' | 'profit'>): string {
    const id = `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: PickRecord = {
      ...pick,
      id,
      result: 'PENDING',
      profit: 0
    };

    this.picks.push(record);
    this.saveToStorage();
    
    return id;
  }

  /**
   * Update pick result
   */
  updatePickResult(id: string, actualValue: number): void {
    const pick = this.picks.find(p => p.id === id);
    if (!pick) return;

    pick.actualValue = actualValue;

    // Determine result
    if (pick.pick === 'HIGHER') {
      if (actualValue > pick.line) {
        pick.result = 'WIN';
        pick.profit = this.calculateProfit(pick.odds, pick.stake);
      } else if (actualValue === pick.line) {
        pick.result = 'PUSH';
        pick.profit = 0;
      } else {
        pick.result = 'LOSS';
        pick.profit = -pick.stake;
      }
    } else {
      // LOWER
      if (actualValue < pick.line) {
        pick.result = 'WIN';
        pick.profit = this.calculateProfit(pick.odds, pick.stake);
      } else if (actualValue === pick.line) {
        pick.result = 'PUSH';
        pick.profit = 0;
      } else {
        pick.result = 'LOSS';
        pick.profit = -pick.stake;
      }
    }

    this.saveToStorage();
  }

  /**
   * Get overall performance statistics
   */
  getPerformanceStats(): PerformanceStats {
    const completed = this.picks.filter(p => p.result !== 'PENDING');
    
    if (completed.length === 0) {
      return this.getEmptyStats();
    }

    const wins = completed.filter(p => p.result === 'WIN').length;
    const losses = completed.filter(p => p.result === 'LOSS').length;
    const pushes = completed.filter(p => p.result === 'PUSH').length;
    
    const totalStaked = completed.reduce((sum, p) => sum + p.stake, 0);
    const totalProfit = completed.reduce((sum, p) => sum + p.profit, 0);
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    // Calculate streak
    const streak = this.calculateStreak(completed);

    return {
      overall: {
        totalPicks: completed.length,
        wins,
        losses,
        pushes,
        winRate: wins / (wins + losses),
        roi: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
        streak,
        totalStaked,
        totalProfit
      },
      byCategory: this.getStatsByCategory(completed),
      bySafety: this.getStatsBySafety(completed),
      charts: {
        dailyWinRate: this.calculateDailyWinRate(completed),
        profitCurve: this.calculateProfitCurve(completed),
        confidenceCalibration: this.calculateConfidenceCalibration(completed)
      }
    };
  }

  /**
   * Backtest algorithm on historical data
   */
  async backtestAlgorithm(days: number = 30): Promise<BacktestResult> {
    // In production, fetch real historical data
    // For now, simulate backtest results
    const period = `Last ${days} days`;
    
    const mockPicks = this.generateMockBacktestData(days);
    const wins = mockPicks.filter(p => p.result === 'WIN').length;
    const losses = mockPicks.filter(p => p.result === 'LOSS').length;
    
    const totalStaked = mockPicks.reduce((sum, p) => sum + p.stake, 0);
    const profitLoss = mockPicks.reduce((sum, p) => sum + p.profit, 0);
    const roi = (profitLoss / totalStaked) * 100;

    // Category analysis
    const byCategory = this.getStatsByCategory(mockPicks);
    const categories = Object.entries(byCategory);
    
    const bestCategory = categories.reduce((best, [cat, stats]) => 
      stats.winRate > (byCategory[best]?.winRate || 0) ? cat : best, 
      categories[0]?.[0] || 'Unknown'
    );
    
    const worstCategory = categories.reduce((worst, [cat, stats]) => 
      stats.winRate < (byCategory[worst]?.winRate || 1) ? cat : worst,
      categories[0]?.[0] || 'Unknown'
    );

    // Calibration score
    const calibrationScore = this.calculateCalibrationScore(mockPicks);

    return {
      period,
      totalPicks: mockPicks.length,
      winRate: wins / (wins + losses),
      roi: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
      profitLoss,
      bestCategory,
      worstCategory,
      calibrationScore
    };
  }

  /**
   * Get picks for a specific date range
   */
  getPicksByDateRange(startDate: string, endDate: string): PickRecord[] {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return this.picks.filter(pick => {
      const pickDate = parseISO(pick.date);
      return pickDate >= start && pickDate <= end;
    });
  }

  /**
   * Clear all performance data
   */
  clearAllData(): void {
    this.picks = [];
    this.saveToStorage();
  }

  // ============ PRIVATE METHODS ============

  private calculateProfit(americanOdds: number, stake: number): number {
    if (americanOdds > 0) {
      return (americanOdds / 100) * stake;
    } else {
      return (100 / Math.abs(americanOdds)) * stake;
    }
  }

  private calculateStreak(picks: PickRecord[]) {
    if (picks.length === 0) {
      return { current: 0, longest: 0, type: 'win' as const };
    }

    let current = 0;
    let longest = 0;
    let currentType: 'win' | 'loss' = 'win';

    // Sort by date
    const sorted = [...picks].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let streakType: 'win' | 'loss' = sorted[sorted.length - 1].result === 'WIN' ? 'win' : 'loss';
    
    // Calculate current streak (from most recent)
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].result === 'PUSH') continue;
      
      if (sorted[i].result === (streakType === 'win' ? 'WIN' : 'LOSS')) {
        current++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let tempStreak = 0;
    let tempType: 'WIN' | 'LOSS' | null = null;

    for (const pick of sorted) {
      if (pick.result === 'PUSH') continue;

      if (pick.result === tempType) {
        tempStreak++;
      } else {
        if (tempStreak > longest) {
          longest = tempStreak;
        }
        tempStreak = 1;
        tempType = pick.result;
      }
    }

    if (tempStreak > longest) {
      longest = tempStreak;
    }

    return { current, longest, type: streakType };
  }

  private getStatsByCategory(picks: PickRecord[]) {
    const categories: { [key: string]: { picks: number; wins: number; staked: number; profit: number } } = {};

    picks.forEach(pick => {
      const category = pick.prop;
      if (!categories[category]) {
        categories[category] = { picks: 0, wins: 0, staked: 0, profit: 0 };
      }

      categories[category].picks++;
      if (pick.result === 'WIN') categories[category].wins++;
      categories[category].staked += pick.stake;
      categories[category].profit += pick.profit;
    });

    const result: any = {};
    for (const [category, stats] of Object.entries(categories)) {
      result[category] = {
        picks: stats.picks,
        winRate: stats.wins / stats.picks,
        roi: `${((stats.profit / stats.staked) * 100).toFixed(1)}%`
      };
    }

    return result;
  }

  private getStatsBySafety(picks: PickRecord[]) {
    const ranges = {
      '90-100': { picks: 0, wins: 0, confidenceSum: 0 },
      '80-89': { picks: 0, wins: 0, confidenceSum: 0 },
      '70-79': { picks: 0, wins: 0, confidenceSum: 0 },
      'below70': { picks: 0, wins: 0, confidenceSum: 0 }
    };

    picks.forEach(pick => {
      let range: keyof typeof ranges;
      if (pick.safetyScore >= 90) range = '90-100';
      else if (pick.safetyScore >= 80) range = '80-89';
      else if (pick.safetyScore >= 70) range = '70-79';
      else range = 'below70';

      ranges[range].picks++;
      if (pick.result === 'WIN') ranges[range].wins++;
      ranges[range].confidenceSum += pick.confidence;
    });

    const result: any = {};
    for (const [range, stats] of Object.entries(ranges)) {
      result[range] = {
        picks: stats.picks,
        winRate: stats.picks > 0 ? stats.wins / stats.picks : 0,
        avgConfidence: stats.picks > 0 ? stats.confidenceSum / stats.picks : 0
      };
    }

    return result;
  }

  private calculateDailyWinRate(picks: PickRecord[]) {
    const byDate: { [date: string]: { wins: number; total: number } } = {};

    picks.forEach(pick => {
      const date = pick.date.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { wins: 0, total: 0 };
      }

      byDate[date].total++;
      if (pick.result === 'WIN') byDate[date].wins++;
    });

    return Object.entries(byDate)
      .map(([date, stats]) => ({
        date,
        winRate: stats.total > 0 ? stats.wins / stats.total : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateProfitCurve(picks: PickRecord[]) {
    const sorted = [...picks].sort((a, b) => a.date.localeCompare(b.date));
    
    let cumulativeProfit = 0;
    const curve: Array<{ date: string; profit: number }> = [];

    sorted.forEach(pick => {
      cumulativeProfit += pick.profit;
      curve.push({
        date: pick.date.split('T')[0],
        profit: cumulativeProfit
      });
    });

    return curve;
  }

  private calculateConfidenceCalibration(picks: PickRecord[]) {
    // Group by confidence buckets
    const buckets: { [key: number]: { predicted: number; wins: number; total: number } } = {};

    picks.forEach(pick => {
      const bucket = Math.floor(pick.confidence / 10) * 10;
      if (!buckets[bucket]) {
        buckets[bucket] = { predicted: bucket, wins: 0, total: 0 };
      }

      buckets[bucket].total++;
      if (pick.result === 'WIN') buckets[bucket].wins++;
    });

    return Object.values(buckets).map(bucket => ({
      predicted: bucket.predicted,
      actual: bucket.total > 0 ? (bucket.wins / bucket.total) * 100 : 0
    }));
  }

  private calculateCalibrationScore(picks: PickRecord[]): number {
    const calibration = this.calculateConfidenceCalibration(picks);
    
    // Calculate mean absolute error
    const mae = calibration.reduce((sum, point) => 
      sum + Math.abs(point.predicted - point.actual), 0
    ) / calibration.length;

    // Convert to 0-100 scale (lower error = higher score)
    return Math.max(0, 100 - mae);
  }

  private generateMockBacktestData(days: number): PickRecord[] {
    const mockPicks: PickRecord[] = [];
    const today = new Date();

    // Generate ~5 picks per day
    for (let i = 0; i < days; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const picksPerDay = 4 + Math.floor(Math.random() * 3);

      for (let j = 0; j < picksPerDay; j++) {
        const safetyScore = 60 + Math.random() * 40;
        const confidence = 50 + Math.random() * 45;
        
        // Higher safety/confidence = higher win rate
        const winProb = (safetyScore + confidence) / 200;
        const result = Math.random() < winProb ? 'WIN' : 'LOSS';
        
        const odds = -110;
        const stake = 100;
        const profit = result === 'WIN' ? this.calculateProfit(odds, stake) : -stake;

        mockPicks.push({
          id: `backtest_${i}_${j}`,
          date: `${date}T12:00:00Z`,
          player: `Player ${j + 1}`,
          prop: ['points', 'rebounds', 'assists', 'yards'][Math.floor(Math.random() * 4)],
          line: 10 + Math.random() * 20,
          pick: Math.random() > 0.5 ? 'HIGHER' : 'LOWER',
          actualValue: 15 + Math.random() * 10,
          result: result as 'WIN' | 'LOSS',
          confidence,
          safetyScore,
          odds,
          stake,
          profit
        });
      }
    }

    return mockPicks;
  }

  private getEmptyStats(): PerformanceStats {
    return {
      overall: {
        totalPicks: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        winRate: 0,
        roi: '+0.0%',
        streak: { current: 0, longest: 0, type: 'win' },
        totalStaked: 0,
        totalProfit: 0
      },
      byCategory: {},
      bySafety: {},
      charts: {
        dailyWinRate: [],
        profitCurve: [],
        confidenceCalibration: []
      }
    };
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.picks = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.picks));
    } catch (error) {
      console.error('Error saving performance data:', error);
    }
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
