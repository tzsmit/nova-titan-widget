/**
 * Injury and News Monitoring System
 * Tracks player injuries and breaking news that impact betting decisions
 */

import axios from 'axios';
import { format } from 'date-fns';

export interface InjuryReport {
  playerId: string;
  playerName: string;
  team: string;
  status: 'out' | 'questionable' | 'doubtful' | 'probable' | 'healthy';
  injury: string;
  lastUpdate: string;
  estimatedReturn: string | null;
  impactLevel: 'high' | 'medium' | 'low';
}

export interface NewsItem {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactLevel: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface MonitoringAlert {
  id: string;
  type: 'injury' | 'news' | 'lineup_change';
  severity: 'critical' | 'warning' | 'info';
  playerId: string;
  playerName: string;
  team: string;
  message: string;
  timestamp: string;
  actionable: boolean;
}

export class InjuryNewsMonitor {
  private readonly ESPN_INJURY_API = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly CACHE_TTL = 1800000; // 30 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();
  private alerts: MonitoringAlert[] = [];

  /**
   * Fetch current injury report for a sport
   */
  async getInjuryReport(sport: 'NBA' | 'NFL'): Promise<InjuryReport[]> {
    const cacheKey = `injuries_${sport}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📋 Fetching ${sport} injury report...`);
      
      // In production, fetch from ESPN API
      // For now, generate realistic injury data
      const injuries = this.generateMockInjuryData(sport);
      
      this.setCache(cacheKey, injuries);
      return injuries;
    } catch (error) {
      console.error(`Error fetching ${sport} injury report:`, error);
      return this.generateMockInjuryData(sport);
    }
  }

  /**
   * Get breaking news for players
   */
  async getPlayerNews(
    sport: 'NBA' | 'NFL',
    playerNames?: string[]
  ): Promise<NewsItem[]> {
    const cacheKey = `news_${sport}_${playerNames?.join('_') || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📰 Fetching ${sport} player news...`);
      
      // In production, integrate with news APIs (NewsAPI, Twitter, RSS)
      const news = this.generateMockNewsData(sport, playerNames);
      
      this.setCache(cacheKey, news);
      return news;
    } catch (error) {
      console.error(`Error fetching ${sport} news:`, error);
      return this.generateMockNewsData(sport, playerNames);
    }
  }

  /**
   * Check for critical alerts that impact betting decisions
   */
  async checkForAlerts(sport: 'NBA' | 'NFL'): Promise<MonitoringAlert[]> {
    console.log(`🚨 Checking for ${sport} alerts...`);
    
    const injuries = await this.getInjuryReport(sport);
    const news = await this.getPlayerNews(sport);

    const newAlerts: MonitoringAlert[] = [];

    // Check for critical injuries
    injuries
      .filter(inj => inj.status === 'out' || inj.impactLevel === 'high')
      .forEach(inj => {
        newAlerts.push({
          id: `alert_${Date.now()}_${inj.playerId}`,
          type: 'injury',
          severity: inj.status === 'out' ? 'critical' : 'warning',
          playerId: inj.playerId,
          playerName: inj.playerName,
          team: inj.team,
          message: `${inj.playerName} (${inj.team}) - ${inj.status.toUpperCase()}: ${inj.injury}`,
          timestamp: inj.lastUpdate,
          actionable: true
        });
      });

    // Check for high-impact news
    news
      .filter(item => item.impactLevel === 'high')
      .forEach(item => {
        newAlerts.push({
          id: `alert_${Date.now()}_${item.id}`,
          type: 'news',
          severity: item.sentiment === 'negative' ? 'warning' : 'info',
          playerId: item.playerId,
          playerName: item.playerName,
          team: item.team,
          message: item.headline,
          timestamp: item.publishedAt,
          actionable: item.sentiment === 'negative'
        });
      });

    // Store alerts
    this.alerts = [...newAlerts, ...this.alerts].slice(0, 50); // Keep last 50

    return newAlerts;
  }

  /**
   * Get player injury status
   */
  async getPlayerInjuryStatus(playerName: string, sport: 'NBA' | 'NFL'): Promise<InjuryReport | null> {
    const injuries = await this.getInjuryReport(sport);
    return injuries.find(inj => 
      inj.playerName.toLowerCase().includes(playerName.toLowerCase())
    ) || null;
  }

  /**
   * Assess injury impact on prop bets
   */
  assessInjuryImpact(injury: InjuryReport): {
    affectedProps: string[];
    recommendation: string;
    confidence: number;
  } {
    const affectedProps: string[] = [];
    let recommendation = '';
    let confidence = 0;

    if (injury.status === 'out') {
      affectedProps.push('all');
      recommendation = 'AVOID all props - player ruled out';
      confidence = 100;
    } else if (injury.status === 'doubtful') {
      affectedProps.push('all');
      recommendation = 'AVOID - high probability of missing game';
      confidence = 80;
    } else if (injury.status === 'questionable') {
      // Assess injury type
      const injuryLower = injury.injury.toLowerCase();
      
      if (injuryLower.includes('ankle') || injuryLower.includes('knee')) {
        affectedProps.push('points', 'rebounds', 'rushing_yards');
        recommendation = 'CAUTION on mobility-dependent props';
        confidence = 60;
      } else if (injuryLower.includes('shoulder') || injuryLower.includes('wrist')) {
        affectedProps.push('passing_yards', 'assists', 'receiving_yards');
        recommendation = 'CAUTION on upper-body props';
        confidence = 60;
      } else {
        affectedProps.push('minutes', 'usage');
        recommendation = 'MONITOR - may see reduced minutes';
        confidence = 40;
      }
    } else {
      recommendation = 'No significant impact expected';
      confidence = 20;
    }

    return { affectedProps, recommendation, confidence };
  }

  /**
   * Get all current alerts
   */
  getAllAlerts(): MonitoringAlert[] {
    return this.alerts;
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  // ============ PRIVATE METHODS ============

  private generateMockInjuryData(sport: 'NBA' | 'NFL'): InjuryReport[] {
    const injuries: InjuryReport[] = [];
    
    if (sport === 'NBA') {
      injuries.push(
        {
          playerId: 'nba_1',
          playerName: 'Kevin Durant',
          team: 'PHX',
          status: 'questionable',
          injury: 'Right ankle sprain',
          lastUpdate: new Date().toISOString(),
          estimatedReturn: format(new Date(Date.now() + 86400000 * 2), 'yyyy-MM-dd'),
          impactLevel: 'high'
        },
        {
          playerId: 'nba_2',
          playerName: 'Kawhi Leonard',
          team: 'LAC',
          status: 'out',
          injury: 'Knee management',
          lastUpdate: new Date().toISOString(),
          estimatedReturn: format(new Date(Date.now() + 86400000 * 7), 'yyyy-MM-dd'),
          impactLevel: 'high'
        },
        {
          playerId: 'nba_3',
          playerName: 'Zion Williamson',
          team: 'NOP',
          status: 'probable',
          injury: 'Hamstring tightness',
          lastUpdate: new Date().toISOString(),
          estimatedReturn: 'Today',
          impactLevel: 'low'
        }
      );
    } else {
      injuries.push(
        {
          playerId: 'nfl_1',
          playerName: 'Christian McCaffrey',
          team: 'SF',
          status: 'questionable',
          injury: 'Calf strain',
          lastUpdate: new Date().toISOString(),
          estimatedReturn: 'This week',
          impactLevel: 'high'
        },
        {
          playerId: 'nfl_2',
          playerName: 'Justin Jefferson',
          team: 'MIN',
          status: 'out',
          injury: 'Hamstring',
          lastUpdate: new Date().toISOString(),
          estimatedReturn: format(new Date(Date.now() + 86400000 * 14), 'yyyy-MM-dd'),
          impactLevel: 'high'
        }
      );
    }

    return injuries;
  }

  private generateMockNewsData(sport: 'NBA' | 'NFL', playerNames?: string[]): NewsItem[] {
    const news: NewsItem[] = [];
    
    news.push(
      {
        id: 'news_1',
        playerId: 'player_1',
        playerName: 'Luka Doncic',
        team: 'DAL',
        headline: 'Luka Doncic named Western Conference Player of the Week',
        summary: 'Averaged 32.5 points, 9.2 assists, and 8.1 rebounds over the past week',
        source: 'ESPN',
        publishedAt: new Date().toISOString(),
        sentiment: 'positive',
        impactLevel: 'medium',
        keywords: ['performance', 'award', 'hot streak']
      },
      {
        id: 'news_2',
        playerId: 'player_2',
        playerName: 'Joel Embiid',
        team: 'PHI',
        headline: 'Joel Embiid to have minutes restriction tonight',
        summary: 'Coach confirms Embiid will be on 28-minute limit as part of rest management',
        source: 'The Athletic',
        publishedAt: new Date().toISOString(),
        sentiment: 'negative',
        impactLevel: 'high',
        keywords: ['minutes', 'restriction', 'rest']
      },
      {
        id: 'news_3',
        playerId: 'player_3',
        playerName: 'Patrick Mahomes',
        team: 'KC',
        headline: 'Chiefs announce Travis Kelce will play despite ankle issue',
        summary: 'Kelce practiced fully Friday and is expected to have full workload',
        source: 'NFL Network',
        publishedAt: new Date().toISOString(),
        sentiment: 'positive',
        impactLevel: 'medium',
        keywords: ['injury', 'cleared', 'full go']
      }
    );

    if (playerNames && playerNames.length > 0) {
      return news.filter(item => 
        playerNames.some(name => 
          item.playerName.toLowerCase().includes(name.toLowerCase())
        )
      );
    }

    return news;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

// Export singleton instance
export const injuryNewsMonitor = new InjuryNewsMonitor();
