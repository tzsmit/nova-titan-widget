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
      console.log(`📋 Fetching REAL ${sport} injury report from ESPN...`);
      
      // Fetch from ESPN API - REAL DATA ONLY
      const sportPath = sport === 'NBA' ? 'basketball/nba' : 'football/nfl';
      const response = await axios.get(
        `${this.ESPN_INJURY_API}/${sportPath}/injuries`,
        { timeout: 10000 }
      );
      
      const injuries = this.parseESPNInjuries(response.data);
      this.setCache(cacheKey, injuries);
      
      console.log(`✅ Fetched ${injuries.length} REAL injury reports`);
      return injuries;
    } catch (error: any) {
      console.error(`❌ Error fetching ${sport} injury report:`, error.message);
      // Return empty array instead of fake data
      return [];
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
      console.log(`📰 Fetching REAL ${sport} player news from ESPN...`);
      
      // Fetch from ESPN News API - REAL DATA ONLY
      const sportPath = sport === 'NBA' ? 'basketball/nba' : 'football/nfl';
      const response = await axios.get(
        `${this.ESPN_INJURY_API}/${sportPath}/news`,
        { timeout: 10000 }
      );
      
      const news = this.parseESPNNews(response.data, playerNames);
      this.setCache(cacheKey, news);
      
      console.log(`✅ Fetched ${news.length} REAL news items`);
      return news;
    } catch (error: any) {
      console.error(`❌ Error fetching ${sport} news:`, error.message);
      // Return empty array instead of fake data
      return [];
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

  /**
   * Parse ESPN injury data - REAL DATA ONLY
   */
  private parseESPNInjuries(data: any): InjuryReport[] {
    try {
      const injuries: InjuryReport[] = [];
      
      // Parse ESPN injury report structure
      const teams = data?.teams || [];
      
      for (const team of teams) {
        const teamInjuries = team?.injuries || [];
        
        for (const injury of teamInjuries) {
          const athlete = injury?.athlete || {};
          const status = injury?.status?.toLowerCase() || 'healthy';
          
          injuries.push({
            playerId: athlete?.id || '',
            playerName: athlete?.displayName || athlete?.name || '',
            team: team?.team?.abbreviation || '',
            status: this.normalizeInjuryStatus(status),
            injury: injury?.longComment || injury?.shortComment || injury?.details || '',
            lastUpdate: injury?.date || new Date().toISOString(),
            estimatedReturn: null,
            impactLevel: this.assessImpactLevel(status)
          });
        }
      }
      
      return injuries;
    } catch (error) {
      console.error('Error parsing ESPN injuries:', error);
      return [];
    }
  }

  /**
   * Parse ESPN news data - REAL DATA ONLY
   */
  private parseESPNNews(data: any, playerNames?: string[]): NewsItem[] {
    try {
      const news: NewsItem[] = [];
      const articles = data?.articles || [];
      
      for (const article of articles) {
        const headline = article?.headline || '';
        const description = article?.description || '';
        
        // Filter by player names if provided
        if (playerNames && playerNames.length > 0) {
          const matchesPlayer = playerNames.some(name => 
            headline.toLowerCase().includes(name.toLowerCase()) ||
            description.toLowerCase().includes(name.toLowerCase())
          );
          if (!matchesPlayer) continue;
        }
        
        news.push({
          id: article?.id || `news_${Date.now()}`,
          playerId: '', // ESPN doesn't always provide player ID in news
          playerName: this.extractPlayerName(headline),
          team: '',
          headline: headline,
          summary: description,
          source: article?.source?.name || 'ESPN',
          publishedAt: article?.published || new Date().toISOString(),
          sentiment: this.analyzeSentiment(headline + ' ' + description),
          impactLevel: this.assessNewsImpact(headline + ' ' + description),
          keywords: article?.keywords || []
        });
      }
      
      return news;
    } catch (error) {
      console.error('Error parsing ESPN news:', error);
      return [];
    }
  }

  private normalizeInjuryStatus(status: string): 'out' | 'questionable' | 'doubtful' | 'probable' | 'healthy' {
    const lower = status.toLowerCase();
    if (lower.includes('out')) return 'out';
    if (lower.includes('questionable') || lower.includes('q')) return 'questionable';
    if (lower.includes('doubtful') || lower.includes('d')) return 'doubtful';
    if (lower.includes('probable') || lower.includes('p')) return 'probable';
    return 'healthy';
  }

  private assessImpactLevel(status: string): 'high' | 'medium' | 'low' {
    const lower = status.toLowerCase();
    if (lower.includes('out') || lower.includes('doubtful')) return 'high';
    if (lower.includes('questionable')) return 'medium';
    return 'low';
  }

  private assessNewsImpact(text: string): 'high' | 'medium' | 'low' {
    const lower = text.toLowerCase();
    const highImpact = ['trade', 'injured', 'out', 'suspended', 'mvp', 'record'];
    const mediumImpact = ['questionable', 'limited', 'returns', 'starts'];
    
    if (highImpact.some(word => lower.includes(word))) return 'high';
    if (mediumImpact.some(word => lower.includes(word))) return 'medium';
    return 'low';
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lower = text.toLowerCase();
    const positive = ['returns', 'cleared', 'healthy', 'mvp', 'wins', 'scores'];
    const negative = ['injured', 'out', 'suspended', 'loses', 'struggles'];
    
    const positiveCount = positive.filter(word => lower.includes(word)).length;
    const negativeCount = negative.filter(word => lower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractPlayerName(headline: string): string {
    // Simple extraction - assumes player name is at start of headline
    const words = headline.split(' ');
    if (words.length >= 2) {
      return `${words[0]} ${words[1]}`;
    }
    return '';
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
