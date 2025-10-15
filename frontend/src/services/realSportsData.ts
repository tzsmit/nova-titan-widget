/**
 * Real Sports Data Service for Nova Titan AI
 * Integrates multiple free APIs for live games, scores, and upcoming events
 */

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  gameTime: string;
  gameDate: string;
  status: 'scheduled' | 'live' | 'completed';
  week?: number;
  season?: string;
  league: string;
  venue?: string;
  network?: string;
  line?: {
    spread: number;
    total: number;
    moneyline: { home: number; away: number };
  };
}

export interface PlayerProp {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  prop: string;
  line: number;
  over: number;
  under: number;
  gameId: string;
}

export interface LiveScore {
  gameId: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  status: string;
}

class RealSportsDataService {
  private readonly ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly ODDS_API_KEY = import.meta.env.VITE_PRIMARY_ODDS_API_KEY || 'your_primary_key_here';
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getNFLGames(): Promise<Game[]> {
    const cacheKey = 'nfl_games';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.ESPN_BASE}/football/nfl/scoreboard`);
      const data = await response.json();
      
      const games = data.events.map((event: any) => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName || 'TBD',
        awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName || 'TBD',
        homeScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.score || 0,
        awayScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.score || 0,
        gameTime: new Date(event.date).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZone: 'America/New_York'
        }),
        gameDate: new Date(event.date).toLocaleDateString('en-US'),
        status: this.mapGameStatus(event.status.type.name),
        week: event.week?.number || 1,
        season: event.season?.year || new Date().getFullYear(),
        league: 'NFL',
        venue: event.competitions[0].venue?.fullName || 'TBD',
        network: event.competitions[0].broadcasts?.[0]?.names?.[0] || 'TBD'
      }));

      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.warn('Failed to fetch NFL games, using sample data:', error);
      return this.getSampleNFLGames();
    }
  }

  async getCollegeFootballGames(): Promise<Game[]> {
    const cacheKey = 'cfb_games';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.ESPN_BASE}/football/college-football/scoreboard`);
      const data = await response.json();
      
      const games = data.events.slice(0, 20).map((event: any) => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName || 'TBD',
        awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName || 'TBD',
        homeScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.score || 0,
        awayScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.score || 0,
        gameTime: new Date(event.date).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZone: 'America/New_York'
        }),
        gameDate: new Date(event.date).toLocaleDateString('en-US'),
        status: this.mapGameStatus(event.status.type.name),
        week: event.week?.number || 1,
        season: event.season?.year || new Date().getFullYear(),
        league: 'College Football',
        venue: event.competitions[0].venue?.fullName || 'TBD',
        network: event.competitions[0].broadcasts?.[0]?.names?.[0] || 'TBD'
      }));

      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.warn('Failed to fetch CFB games, using sample data:', error);
      return this.getSampleCFBGames();
    }
  }

  async getNBAGames(): Promise<Game[]> {
    const cacheKey = 'nba_games';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.ESPN_BASE}/basketball/nba/scoreboard`);
      const data = await response.json();
      
      const games = data.events.map((event: any) => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName || 'TBD',
        awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName || 'TBD',
        homeScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.score || 0,
        awayScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.score || 0,
        gameTime: new Date(event.date).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZone: 'America/New_York'
        }),
        gameDate: new Date(event.date).toLocaleDateString('en-US'),
        status: this.mapGameStatus(event.status.type.name),
        league: 'NBA',
        venue: event.competitions[0].venue?.fullName || 'TBD',
        network: event.competitions[0].broadcasts?.[0]?.names?.[0] || 'TBD'
      }));

      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.warn('Failed to fetch NBA games, using sample data:', error);
      return this.getSampleNBAGames();
    }
  }

  async getUpcomingGames(league?: string): Promise<Game[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    let allGames: Game[] = [];

    if (!league || league === 'NFL') {
      const nflGames = await this.getNFLGames();
      allGames = [...allGames, ...nflGames];
    }

    if (!league || league === 'CFB') {
      const cfbGames = await this.getCollegeFootballGames();
      allGames = [...allGames, ...cfbGames];
    }

    if (!league || league === 'NBA') {
      const nbaGames = await this.getNBAGames();
      allGames = [...allGames, ...nbaGames];
    }

    // Filter for games in the next 7 days
    return allGames.filter(game => {
      const gameDate = new Date(game.gameDate + ' ' + game.gameTime);
      return gameDate >= now && gameDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).sort((a, b) => {
      const dateA = new Date(a.gameDate + ' ' + a.gameTime);
      const dateB = new Date(b.gameDate + ' ' + b.gameTime);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async getLiveGames(): Promise<Game[]> {
    const allGames = await Promise.all([
      this.getNFLGames(),
      this.getCollegeFootballGames(),
      this.getNBAGames()
    ]);

    return allGames.flat().filter(game => game.status === 'live');
  }

  async getTodaysGames(): Promise<Game[]> {
    const today = new Date().toLocaleDateString('en-US');
    const allGames = await this.getUpcomingGames();
    
    return allGames.filter(game => game.gameDate === today);
  }

  // Real-time odds integration
  async getGameOdds(gameId: string, sport: string = 'americanfootball_nfl'): Promise<any> {
    const cacheKey = `odds_${gameId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sport}/odds?` +
        `apiKey=${this.ODDS_API_KEY}&` +
        `regions=us&` +
        `markets=h2h,spreads,totals&` +
        `bookmakers=draftkings,fanduel,betmgm,caesars&` +
        `oddsFormat=american`
      );

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch live odds:', error);
    }

    return this.getSampleOdds();
  }

  private mapGameStatus(espnStatus: string): 'scheduled' | 'live' | 'completed' {
    switch (espnStatus?.toLowerCase()) {
      case 'status_scheduled':
      case 'status_postponed':
        return 'scheduled';
      case 'status_in_progress':
      case 'status_halftime':
      case 'status_end_period':
        return 'live';
      case 'status_final':
      case 'status_final_overtime':
        return 'completed';
      default:
        return 'scheduled';
    }
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Sample data fallbacks
  private getSampleNFLGames(): Game[] {
    const now = new Date();
    const games = [
      {
        id: 'nfl_1',
        homeTeam: 'Buffalo Bills',
        awayTeam: 'Kansas City Chiefs',
        gameTime: '8:20 PM',
        gameDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
        status: 'scheduled' as const,
        week: 8,
        season: '2024',
        league: 'NFL',
        venue: 'Highmark Stadium',
        network: 'NBC',
        line: {
          spread: 3,
          total: 47.5,
          moneyline: { home: 120, away: -140 }
        }
      },
      {
        id: 'nfl_2',
        homeTeam: 'Dallas Cowboys',
        awayTeam: 'Philadelphia Eagles',
        gameTime: '4:25 PM',
        gameDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
        status: 'scheduled' as const,
        week: 8,
        season: '2024',
        league: 'NFL',
        venue: 'AT&T Stadium',
        network: 'FOX'
      }
    ];
    return games;
  }

  private getSampleCFBGames(): Game[] {
    const now = new Date();
    return [
      {
        id: 'cfb_1',
        homeTeam: 'Alabama Crimson Tide',
        awayTeam: 'Georgia Bulldogs',
        gameTime: '7:00 PM',
        gameDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
        status: 'scheduled' as const,
        week: 8,
        season: '2024',
        league: 'College Football',
        venue: 'Bryant-Denny Stadium',
        network: 'ESPN'
      },
      {
        id: 'cfb_2',
        homeTeam: 'Michigan Wolverines',
        awayTeam: 'Ohio State Buckeyes',
        gameTime: '12:00 PM',
        gameDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
        status: 'scheduled' as const,
        week: 8,
        season: '2024',
        league: 'College Football',
        venue: 'Michigan Stadium',
        network: 'FOX'
      }
    ];
  }

  private getSampleNBAGames(): Game[] {
    const now = new Date();
    return [
      {
        id: 'nba_1',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        gameTime: '10:00 PM',
        gameDate: now.toLocaleDateString('en-US'),
        status: 'scheduled' as const,
        league: 'NBA',
        venue: 'Crypto.com Arena',
        network: 'TNT'
      }
    ];
  }

  private getSampleOdds() {
    return {
      moneyline: { home: 120, away: -140 },
      spread: { home: 3, away: -3, points: 3 },
      total: { over: -110, under: -110, points: 47.5 }
    };
  }
}

export const realSportsData = new RealSportsDataService();