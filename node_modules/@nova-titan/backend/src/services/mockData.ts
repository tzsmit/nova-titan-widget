// Mock Data Generator for Development and Demo
import { Game, Team, Player, PlayerStats, Market, Outcome } from '@nova-titan/shared';
import { v4 as uuidv4 } from 'uuid';

// NBA Teams
const NBA_TEAMS = [
  { name: 'Boston Celtics', abbreviation: 'BOS', city: 'Boston', conference: 'Eastern' },
  { name: 'Miami Heat', abbreviation: 'MIA', city: 'Miami', conference: 'Eastern' },
  { name: 'Philadelphia 76ers', abbreviation: 'PHI', city: 'Philadelphia', conference: 'Eastern' },
  { name: 'Milwaukee Bucks', abbreviation: 'MIL', city: 'Milwaukee', conference: 'Eastern' },
  { name: 'Brooklyn Nets', abbreviation: 'BKN', city: 'Brooklyn', conference: 'Eastern' },
  { name: 'New York Knicks', abbreviation: 'NYK', city: 'New York', conference: 'Eastern' },
  { name: 'Atlanta Hawks', abbreviation: 'ATL', city: 'Atlanta', conference: 'Eastern' },
  { name: 'Chicago Bulls', abbreviation: 'CHI', city: 'Chicago', conference: 'Eastern' },
  { name: 'Golden State Warriors', abbreviation: 'GSW', city: 'San Francisco', conference: 'Western' },
  { name: 'Los Angeles Lakers', abbreviation: 'LAL', city: 'Los Angeles', conference: 'Western' },
  { name: 'Phoenix Suns', abbreviation: 'PHX', city: 'Phoenix', conference: 'Western' },
  { name: 'Denver Nuggets', abbreviation: 'DEN', city: 'Denver', conference: 'Western' },
  { name: 'Memphis Grizzlies', abbreviation: 'MEM', city: 'Memphis', conference: 'Western' },
  { name: 'Sacramento Kings', abbreviation: 'SAC', city: 'Sacramento', conference: 'Western' },
  { name: 'Los Angeles Clippers', abbreviation: 'LAC', city: 'Los Angeles', conference: 'Western' },
  { name: 'Portland Trail Blazers', abbreviation: 'POR', city: 'Portland', conference: 'Western' }
];

// NFL Teams
const NFL_TEAMS = [
  { name: 'New England Patriots', abbreviation: 'NE', city: 'Foxborough', conference: 'AFC' },
  { name: 'Buffalo Bills', abbreviation: 'BUF', city: 'Buffalo', conference: 'AFC' },
  { name: 'Miami Dolphins', abbreviation: 'MIA', city: 'Miami', conference: 'AFC' },
  { name: 'New York Jets', abbreviation: 'NYJ', city: 'New York', conference: 'AFC' },
  { name: 'Kansas City Chiefs', abbreviation: 'KC', city: 'Kansas City', conference: 'AFC' },
  { name: 'Cincinnati Bengals', abbreviation: 'CIN', city: 'Cincinnati', conference: 'AFC' },
  { name: 'Baltimore Ravens', abbreviation: 'BAL', city: 'Baltimore', conference: 'AFC' },
  { name: 'Pittsburgh Steelers', abbreviation: 'PIT', city: 'Pittsburgh', conference: 'AFC' },
  { name: 'Dallas Cowboys', abbreviation: 'DAL', city: 'Dallas', conference: 'NFC' },
  { name: 'Philadelphia Eagles', abbreviation: 'PHI', city: 'Philadelphia', conference: 'NFC' },
  { name: 'New York Giants', abbreviation: 'NYG', city: 'New York', conference: 'NFC' },
  { name: 'Washington Commanders', abbreviation: 'WAS', city: 'Washington', conference: 'NFC' },
  { name: 'San Francisco 49ers', abbreviation: 'SF', city: 'San Francisco', conference: 'NFC' },
  { name: 'Seattle Seahawks', abbreviation: 'SEA', city: 'Seattle', conference: 'NFC' },
  { name: 'Los Angeles Rams', abbreviation: 'LAR', city: 'Los Angeles', conference: 'NFC' },
  { name: 'Arizona Cardinals', abbreviation: 'ARI', city: 'Arizona', conference: 'NFC' }
];

// Star Players with realistic stats
const STAR_PLAYERS = {
  NBA: [
    { name: 'Jayson Tatum', position: 'F', jersey: 0, team: 'BOS', avgPoints: 28.5, avgRebounds: 8.2, avgAssists: 4.9 },
    { name: 'Jimmy Butler', position: 'F', jersey: 22, team: 'MIA', avgPoints: 22.1, avgRebounds: 6.5, avgAssists: 5.3 },
    { name: 'Joel Embiid', position: 'C', jersey: 21, team: 'PHI', avgPoints: 33.1, avgRebounds: 10.2, avgAssists: 4.2 },
    { name: 'Giannis Antetokounmpo', position: 'F', jersey: 34, team: 'MIL', avgPoints: 31.1, avgRebounds: 11.8, avgAssists: 5.7 },
    { name: 'Stephen Curry', position: 'G', jersey: 30, team: 'GSW', avgPoints: 29.5, avgRebounds: 6.1, avgAssists: 6.3 },
    { name: 'LeBron James', position: 'F', jersey: 6, team: 'LAL', avgPoints: 28.9, avgRebounds: 8.3, avgAssists: 6.8 },
    { name: 'Kevin Durant', position: 'F', jersey: 35, team: 'PHX', avgPoints: 29.7, avgRebounds: 6.7, avgAssists: 5.0 },
    { name: 'Nikola Jokic', position: 'C', jersey: 15, team: 'DEN', avgPoints: 24.5, avgRebounds: 11.8, avgAssists: 9.8 }
  ],
  NFL: [
    { name: 'Mac Jones', position: 'QB', jersey: 10, team: 'NE', avgPassingYards: 248.5, avgTouchdowns: 1.8 },
    { name: 'Josh Allen', position: 'QB', jersey: 17, team: 'BUF', avgPassingYards: 289.2, avgTouchdowns: 2.4 },
    { name: 'Tua Tagovailoa', position: 'QB', jersey: 1, team: 'MIA', avgPassingYards: 252.7, avgTouchdowns: 1.9 },
    { name: 'Aaron Rodgers', position: 'QB', jersey: 8, team: 'NYJ', avgPassingYards: 267.3, avgTouchdowns: 2.1 },
    { name: 'Patrick Mahomes', position: 'QB', jersey: 15, team: 'KC', avgPassingYards: 316.2, avgTouchdowns: 2.8 },
    { name: 'Joe Burrow', position: 'QB', jersey: 9, team: 'CIN', avgPassingYards: 285.4, avgTouchdowns: 2.3 },
    { name: 'Lamar Jackson', position: 'QB', jersey: 8, team: 'BAL', avgPassingYards: 221.5, avgTouchdowns: 1.7 },
    { name: 'Russell Wilson', position: 'QB', jersey: 3, team: 'PIT', avgPassingYards: 234.8, avgTouchdowns: 1.9 }
  ]
};

export class MockDataGenerator {
  
  /**
   * Generate mock teams for a given sport/league
   */
  static generateTeams(sport: 'basketball' | 'football', league: string, count: number = 8): Team[] {
    const sourceTeams = sport === 'basketball' ? NBA_TEAMS : NFL_TEAMS;
    
    return sourceTeams.slice(0, count).map(teamData => ({
      id: uuidv4(),
      name: teamData.name,
      displayName: teamData.name,
      abbreviation: teamData.abbreviation,
      city: teamData.city,
      conference: teamData.conference,
      logo: `/logos/${teamData.abbreviation.toLowerCase()}.png`,
      sport,
      league,
      record: {
        wins: Math.floor(Math.random() * 25) + 35, // 35-60 wins
        losses: Math.floor(Math.random() * 25) + 22, // 22-47 losses
        ties: sport === 'football' ? Math.floor(Math.random() * 2) : undefined
      }
    }));
  }

  /**
   * Generate mock games for today and upcoming days
   */
  static generateGames(teams: Team[], count: number = 5, daysAhead: number = 7): Game[] {
    const games: Game[] = [];
    
    for (let i = 0; i < count; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam = teams[Math.floor(Math.random() * teams.length)];
      
      // Ensure away team is different from home team
      while (awayTeam.id === homeTeam.id) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      }

      // Random date within next week
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * daysAhead));
      startTime.setHours(19 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60));

      const statuses = ['scheduled', 'live', 'final'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      games.push({
        id: uuidv4(),
        sport: homeTeam.sport,
        league: homeTeam.league,
        homeTeam,
        awayTeam,
        startTime: startTime.toISOString(),
        status: {
          type: status as any,
          period: status === 'live' ? Math.floor(Math.random() * 4) + 1 : undefined,
          clock: status === 'live' ? `${Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined
        },
        venue: {
          name: `${homeTeam.city} Arena`,
          city: homeTeam.city,
          state: 'Unknown' // Would be populated with real data
        },
        score: status === 'live' || status === 'final' ? {
          home: Math.floor(Math.random() * 50) + 80, // 80-130 for NBA, would adjust for NFL
          away: Math.floor(Math.random() * 50) + 80
        } : undefined,
        season: {
          year: new Date().getFullYear(),
          type: 'regular',
          week: homeTeam.sport === 'football' ? Math.floor(Math.random() * 18) + 1 : undefined
        }
      });
    }

    return games;
  }

  /**
   * Generate mock player stats for the last 5 games
   */
  static generatePlayerStats(playerId: string, sport: 'basketball' | 'football', count: number = 5): PlayerStats[] {
    const stats: PlayerStats[] = [];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 3)); // Every 3 days
      
      if (sport === 'basketball') {
        stats.push({
          gameId: uuidv4(),
          date: date.toISOString().split('T')[0],
          opponent: NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)].abbreviation,
          minutes: Math.floor(Math.random() * 15) + 28, // 28-43 minutes
          points: Math.floor(Math.random() * 25) + 15, // 15-40 points
          rebounds: Math.floor(Math.random() * 10) + 3, // 3-13 rebounds
          assists: Math.floor(Math.random() * 8) + 2, // 2-10 assists
          steals: Math.floor(Math.random() * 3), // 0-3 steals
          blocks: Math.floor(Math.random() * 3), // 0-3 blocks
          turnovers: Math.floor(Math.random() * 4) + 1, // 1-5 turnovers
          fieldGoalsMade: Math.floor(Math.random() * 12) + 6, // 6-18 FGM
          fieldGoalsAttempted: Math.floor(Math.random() * 8) + 15, // 15-23 FGA
          threePointersMade: Math.floor(Math.random() * 6) + 1, // 1-7 3PM
          threePointersAttempted: Math.floor(Math.random() * 6) + 4, // 4-10 3PA
          freeThrowsMade: Math.floor(Math.random() * 6) + 2, // 2-8 FTM
          freeThrowsAttempted: Math.floor(Math.random() * 4) + 3 // 3-7 FTA
        });
      } else {
        // NFL stats
        stats.push({
          gameId: uuidv4(),
          date: date.toISOString().split('T')[0],
          opponent: NFL_TEAMS[Math.floor(Math.random() * NFL_TEAMS.length)].abbreviation,
          passingYards: Math.floor(Math.random() * 200) + 150, // 150-350 yards
          rushingYards: Math.floor(Math.random() * 100) + 20, // 20-120 yards  
          receivingYards: Math.floor(Math.random() * 120) + 40, // 40-160 yards
          touchdowns: Math.floor(Math.random() * 4) + 1, // 1-5 TDs
          interceptions: Math.floor(Math.random() * 2), // 0-2 INTs
          fumbles: Math.floor(Math.random() * 2) // 0-2 fumbles
        });
      }
    }

    return stats;
  }

  /**
   * Generate mock betting odds for a game
   */
  static generateOdds(game: Game): Market[] {
    const markets: Market[] = [];
    const bookmakers = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet'];
    
    // Moneyline odds
    const homeML = Math.floor(Math.random() * 200) - 300; // -300 to -100 for favorites
    const awayML = Math.floor(Math.random() * 300) + 110; // +110 to +410 for underdogs
    
    markets.push({
      id: uuidv4(),
      gameId: game.id,
      type: 'moneyline',
      name: 'Moneyline',
      outcomes: [
        {
          id: uuidv4(),
          name: game.homeTeam.name,
          odds: { format: 'american', value: homeML },
          bookmaker: bookmakers[0],
          impliedProbability: this.calculateImpliedProbability(homeML)
        },
        {
          id: uuidv4(),
          name: game.awayTeam.name,
          odds: { format: 'american', value: awayML },
          bookmaker: bookmakers[0],
          impliedProbability: this.calculateImpliedProbability(awayML)
        }
      ],
      lastUpdated: new Date().toISOString(),
      status: 'active'
    });

    // Spread
    const spread = (Math.floor(Math.random() * 14) + 1) * (Math.random() > 0.5 ? 1 : -1); // -14 to +14
    
    markets.push({
      id: uuidv4(),
      gameId: game.id,
      type: 'spread',
      name: 'Point Spread',
      outcomes: [
        {
          id: uuidv4(),
          name: `${game.homeTeam.abbreviation} ${spread > 0 ? '+' : ''}${spread}`,
          odds: { format: 'american', value: -110 },
          point: spread,
          bookmaker: bookmakers[1],
          impliedProbability: 52.4
        },
        {
          id: uuidv4(),
          name: `${game.awayTeam.abbreviation} ${-spread > 0 ? '+' : ''}${-spread}`,
          odds: { format: 'american', value: -110 },
          point: -spread,
          bookmaker: bookmakers[1],
          impliedProbability: 52.4
        }
      ],
      lastUpdated: new Date().toISOString(),
      status: 'active'
    });

    // Total (Over/Under)
    const total = game.sport === 'basketball' ? 
      Math.floor(Math.random() * 40) + 200 : // NBA: 200-240
      Math.floor(Math.random() * 20) + 42; // NFL: 42-62

    markets.push({
      id: uuidv4(),
      gameId: game.id,
      type: 'total',
      name: 'Total Points',
      outcomes: [
        {
          id: uuidv4(),
          name: `Over ${total}`,
          odds: { format: 'american', value: -105 },
          point: total,
          bookmaker: bookmakers[2],
          impliedProbability: 51.2
        },
        {
          id: uuidv4(),
          name: `Under ${total}`,
          odds: { format: 'american', value: -115 },
          point: total,
          bookmaker: bookmakers[2],
          impliedProbability: 53.5
        }
      ],
      lastUpdated: new Date().toISOString(),
      status: 'active'
    });

    return markets;
  }

  /**
   * Calculate implied probability from American odds
   */
  private static calculateImpliedProbability(americanOdds: number): number {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100) * 100;
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100) * 100;
    }
  }

  /**
   * Generate a complete mock dataset for development
   */
  static generateMockDataset() {
    // Generate teams
    const nbaTeams = this.generateTeams('basketball', 'NBA', 16);
    const nflTeams = this.generateTeams('football', 'NFL', 16);
    
    // Generate games
    const nbaGames = this.generateGames(nbaTeams, 8);
    const nflGames = this.generateGames(nflTeams, 6);
    
    const allGames = [...nbaGames, ...nflGames];
    
    // Generate odds for each game
    const allOdds = allGames.map(game => this.generateOdds(game)).flat();
    
    // Generate players
    const allPlayers: Player[] = [];
    
    // NBA players
    STAR_PLAYERS.NBA.forEach(playerData => {
      const team = nbaTeams.find(t => t.abbreviation === playerData.team);
      if (team) {
        allPlayers.push({
          id: uuidv4(),
          name: playerData.name,
          position: playerData.position,
          jersey: playerData.jersey,
          team,
          height: "6'8\"",
          weight: "220 lbs",
          age: Math.floor(Math.random() * 10) + 22, // 22-32 years old
          photo: `/players/${playerData.name.toLowerCase().replace(' ', '-')}.jpg`
        });
      }
    });

    // NFL players  
    STAR_PLAYERS.NFL.forEach(playerData => {
      const team = nflTeams.find(t => t.abbreviation === playerData.team);
      if (team) {
        allPlayers.push({
          id: uuidv4(),
          name: playerData.name,
          position: playerData.position,
          jersey: playerData.jersey,
          team,
          height: "6'2\"",
          weight: "215 lbs",
          age: Math.floor(Math.random() * 8) + 24, // 24-32 years old
          photo: `/players/${playerData.name.toLowerCase().replace(' ', '-')}.jpg`
        });
      }
    });

    return {
      teams: [...nbaTeams, ...nflTeams],
      games: allGames,
      players: allPlayers,
      odds: allOdds
    };
  }
}

export default MockDataGenerator;