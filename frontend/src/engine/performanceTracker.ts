/**
 * Performance Tracker & Backtesting Engine
 * Tracks betting performance and validates algorithms
 */

import { PropAnalysis } from './analysisEngine';

export interface TrackedPick {
  id: string;
  date: Date;
  player: string;
  prop: string;
  line: number;
  recommendation: 'HIGHER' | 'LOWER' | 'AVOID';
  safetyScore: number;
  confidence: number;
  status: 'pending' | 'win' | 'loss';
  settledAt?: Date;
  actualResult?: number;
}

export interface PerformanceStats {
  totalPicks: number;
  wins: number;
  losses: number;
  winRate: string;
  roi: string;
  currentStreak: number;
  longestStreak: number;
}

export interface CategoryStats {
  category: string;
  picks: number;
  wins: number;
  winRate: string;
}

/**
 * Performance Tracker
 * Logs and analyzes betting performance over time
 */
export class PerformanceTracker {
  private picks: TrackedPick[] = [];
  
  /**
   * Log a new pick
   */
  async logPick(pick: PropAnalysis): Promise<string> {
    const trackedPick: TrackedPick = {
      id: this.generateId(),
      date: new Date(),
      player: pick.player,
      prop: pick.prop,
      line: pick.line,
      recommendation: pick.recommendation,
      safetyScore: pick.safetyScore,
      confidence: pick.confidence,
      status: 'pending',
    };
    
    this.picks.push(trackedPick);
    this.saveToDisk();
    
    return trackedPick.id;
  }
  
  /**
   * Update pick result
   */
  async updatePickResult(pickId: string, result: 'win' | 'loss', actualResult?: number): Promise<void> {
    const pick = this.picks.find(p => p.id === pickId);
    
    if (pick) {
      pick.status = result;
      pick.settledAt = new Date();
      pick.actualResult = actualResult;
      this.saveToDisk();
    }
  }
  
  /**
   * Get overall statistics for a time period
   */
  async getOverallStats(days: number = 30): Promise<PerformanceStats> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const picks = this.picks.filter(p => 
      p.date >= since && (p.status === 'win' || p.status === 'loss')
    );
    
    const wins = picks.filter(p => p.status === 'win').length;
    const total = picks.length;
    
    return {
      totalPicks: total,
      wins: wins,
      losses: total - wins,
      winRate: total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '0%',
      roi: this.calculateROI(picks),
      currentStreak: this.calculateCurrentStreak(),
      longestStreak: this.calculateLongestStreak()
    };
  }
  
  /**
   * Get statistics by category (prop type)
   */
  async getStatsByCategory(): Promise<CategoryStats[]> {
    const picks = this.picks.filter(p => p.status === 'win' || p.status === 'loss');
    
    const byProp: Record<string, { picks: number; wins: number }> = {};
    
    for (const pick of picks) {
      if (!byProp[pick.prop]) {
        byProp[pick.prop] = { picks: 0, wins: 0 };
      }
      byProp[pick.prop].picks++;
      if (pick.status === 'win') {
        byProp[pick.prop].wins++;
      }
    }
    
    return Object.entries(byProp).map(([prop, stats]) => ({
      category: prop,
      picks: stats.picks,
      wins: stats.wins,
      winRate: stats.picks > 0 ? `${((stats.wins / stats.picks) * 100).toFixed(1)}%` : '0%'
    }));
  }
  
  /**
   * Get statistics by safety score range
   */
  async getBySafetyScore(): Promise<CategoryStats[]> {
    const picks = this.picks.filter(p => p.status === 'win' || p.status === 'loss');
    
    const ranges: Record<string, { picks: number; wins: number }> = {
      '90-100': { picks: 0, wins: 0 },
      '80-89': { picks: 0, wins: 0 },
      '70-79': { picks: 0, wins: 0 },
      'below70': { picks: 0, wins: 0 },
    };
    
    for (const pick of picks) {
      let range: string;
      if (pick.safetyScore >= 90) range = '90-100';
      else if (pick.safetyScore >= 80) range = '80-89';
      else if (pick.safetyScore >= 70) range = '70-79';
      else range = 'below70';
      
      ranges[range].picks++;
      if (pick.status === 'win') {
        ranges[range].wins++;
      }
    }
    
    return Object.entries(ranges).map(([range, stats]) => ({
      category: range,
      picks: stats.picks,
      wins: stats.wins,
      winRate: stats.picks > 0 ? `${((stats.wins / stats.picks) * 100).toFixed(1)}%` : 'N/A'
    }));
  }
  
  /**
   * Calculate ROI
   */
  private calculateROI(picks: TrackedPick[]): string {
    // Simplified ROI calculation
    // Assuming $100 per bet, -110 odds
    const wins = picks.filter(p => p.status === 'win').length;
    const losses = picks.filter(p => p.status === 'loss').length;
    
    const profit = (wins * 90.91) - (losses * 100); // -110 odds = win $90.91 per $100
    const invested = picks.length * 100;
    
    const roi = invested > 0 ? (profit / invested) * 100 : 0;
    
    return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
  }
  
  /**
   * Calculate current streak
   */
  private calculateCurrentStreak(): number {
    let streak = 0;
    const sorted = [...this.picks]
      .filter(p => p.status === 'win' || p.status === 'loss')
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (sorted.length === 0) return 0;
    
    const lastStatus = sorted[0].status;
    
    for (const pick of sorted) {
      if (pick.status === lastStatus) {
        streak++;
      } else {
        break;
      }
    }
    
    return lastStatus === 'win' ? streak : -streak;
  }
  
  /**
   * Calculate longest streak
   */
  private calculateLongestStreak(): number {
    const sorted = [...this.picks]
      .filter(p => p.status === 'win' || p.status === 'loss')
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let longest = 0;
    let current = 0;
    let lastStatus: 'win' | 'loss' | null = null;
    
    for (const pick of sorted) {
      if (pick.status === lastStatus) {
        current++;
      } else {
        current = 1;
        lastStatus = pick.status;
      }
      
      if (lastStatus === 'win' && current > longest) {
        longest = current;
      }
    }
    
    return longest;
  }
  
  /**
   * Save to localStorage or database
   */
  private saveToDisk(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('nova_titan_picks', JSON.stringify(this.picks));
    }
  }
  
  /**
   * Load from localStorage
   */
  loadFromDisk(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem('nova_titan_picks');
      if (data) {
        this.picks = JSON.parse(data);
        // Convert date strings back to Date objects
        this.picks.forEach(pick => {
          pick.date = new Date(pick.date);
          if (pick.settledAt) {
            pick.settledAt = new Date(pick.settledAt);
          }
        });
      }
    }
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get all picks
   */
  getAllPicks(): TrackedPick[] {
    return [...this.picks];
  }
  
  /**
   * Export data
   */
  exportData(): string {
    return JSON.stringify(this.picks, null, 2);
  }
}

/**
 * Backtesting Engine
 * Validates algorithm performance on historical data
 */
export class BacktestingEngine {
  /**
   * Run backtest on historical data
   */
  async backtest(
    algorithm: any,
    historicalData: any[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    console.log(`Running backtest from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    
    const results: any[] = [];
    
    const dateRange = this.getDateRange(startDate, endDate);
    
    for (const day of dateRange) {
      // Get games for this day
      const games = historicalData.filter(g => 
        new Date(g.date).toDateString() === day.toDateString()
      );
      
      // Run algorithm on this day's data
      for (const game of games) {
        const analysis = algorithm.analyze(game);
        const actual = this.getActualOutcome(game);
        const result = this.gradePick(analysis, actual);
        results.push(result);
      }
    }
    
    return this.calculateBacktestMetrics(results);
  }
  
  /**
   * Calculate backtest metrics
   */
  private calculateBacktestMetrics(results: any[]): any {
    const total = results.length;
    const wins = results.filter(r => r.correct).length;
    
    return {
      totalPicks: total,
      wins: wins,
      losses: total - wins,
      winRate: total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : '0%',
      
      // By safety score
      bySafety: this.groupBySafety(results),
      
      // By prop type
      byProp: this.groupByProp(results),
      
      // Calibration (predicted vs actual)
      calibration: this.calculateCalibration(results),
      
      // Profit curve over time
      profitCurve: this.calculateProfitCurve(results),
    };
  }
  
  /**
   * Group results by safety score
   */
  private groupBySafety(results: any[]): any[] {
    const buckets: Record<string, any[]> = {
      '90-100': [],
      '80-89': [],
      '70-79': [],
      '60-69': [],
    };
    
    for (const result of results) {
      let bucket: string;
      if (result.safetyScore >= 90) bucket = '90-100';
      else if (result.safetyScore >= 80) bucket = '80-89';
      else if (result.safetyScore >= 70) bucket = '70-79';
      else bucket = '60-69';
      
      buckets[bucket].push(result.correct ? 1 : 0);
    }
    
    return Object.entries(buckets).map(([range, results]) => {
      const wins = results.filter(r => r === 1).length;
      const total = results.length;
      return {
        range,
        picks: total,
        wins,
        winRate: total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : 'N/A'
      };
    });
  }
  
  /**
   * Group results by prop type
   */
  private groupByProp(results: any[]): any[] {
    const byProp: Record<string, any[]> = {};
    
    for (const result of results) {
      if (!byProp[result.prop]) {
        byProp[result.prop] = [];
      }
      byProp[result.prop].push(result.correct ? 1 : 0);
    }
    
    return Object.entries(byProp).map(([prop, results]) => {
      const wins = results.filter(r => r === 1).length;
      const total = results.length;
      return {
        prop,
        picks: total,
        wins,
        winRate: total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : 'N/A'
      };
    });
  }
  
  /**
   * Calculate calibration (confidence vs actual hit rate)
   */
  private calculateCalibration(results: any[]): any[] {
    const buckets: Record<string, number[]> = {
      '90-100': [],
      '80-89': [],
      '70-79': [],
      '60-69': [],
    };
    
    for (const result of results) {
      let bucket: string;
      if (result.confidence >= 90) bucket = '90-100';
      else if (result.confidence >= 80) bucket = '80-89';
      else if (result.confidence >= 70) bucket = '70-79';
      else bucket = '60-69';
      
      buckets[bucket].push(result.correct ? 1 : 0);
    }
    
    return Object.entries(buckets).map(([range, results]) => {
      const avg = results.length > 0 
        ? (results.reduce((a, b) => a + b, 0) / results.length) * 100 
        : 0;
      const [min, max] = range.split('-').map(Number);
      const predicted = (min + max) / 2;
      
      return {
        bucket: range,
        predicted: `${predicted}%`,
        actual: `${avg.toFixed(1)}%`,
        delta: `${(avg - predicted).toFixed(1)}%`,
        samples: results.length
      };
    });
  }
  
  /**
   * Calculate profit curve
   */
  private calculateProfitCurve(results: any[]): number[] {
    const curve: number[] = [];
    let running = 0;
    
    for (const result of results) {
      if (result.correct) {
        running += 90.91; // Win amount at -110 odds
      } else {
        running -= 100; // Loss amount
      }
      curve.push(running);
    }
    
    return curve;
  }
  
  /**
   * Get actual outcome from game
   */
  private getActualOutcome(game: any): number {
    return game.actualResult || 0;
  }
  
  /**
   * Grade a pick
   */
  private gradePick(analysis: any, actual: number): any {
    const correct = analysis.recommendation === 'HIGHER' 
      ? actual > analysis.line 
      : actual < analysis.line;
    
    return {
      ...analysis,
      correct,
      actualResult: actual
    };
  }
  
  /**
   * Get date range
   */
  private getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }
}
