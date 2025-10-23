// Import will be dynamic to avoid circular dependencies
// import { nbaDataService } from './nbaDataService';

interface PlayerData {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
  team: string;
  stats?: {
    points?: number;
    rebounds?: number;
    assists?: number;
    rushingYards?: number;
    passingYards?: number;
    touchdowns?: number;
    fieldGoalPercentage?: number;
    threePointPercentage?: number;
    freeThrowPercentage?: number;
    battingAverage?: number;
    homeRuns?: number;
    era?: number;
    strikeouts?: number;
  };
}

interface TeamRoster {
  teamId: string;
  teamName: string;
  players: PlayerData[];
  starters: PlayerData[];
  bench: PlayerData[];
}

interface PlayerProp {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  description: string;
}

class PlayerDataService {
  private rosterCache: Map<string, TeamRoster> = new Map();
  private playerPropsCache: Map<string, PlayerProp[]> = new Map();

  // Real NBA team rosters with actual player names
  private getNBAPlayers(teamName: string): PlayerData[] {
    const rosters: Record<string, PlayerData[]> = {
      'Los Angeles Lakers': [
        { id: 'lal_lebron', name: 'LeBron James', position: 'SF', jerseyNumber: 23, team: 'Los Angeles Lakers', stats: { points: 25.3, rebounds: 7.3, assists: 7.3 } },
        { id: 'lal_davis', name: 'Anthony Davis', position: 'PF/C', jerseyNumber: 3, team: 'Los Angeles Lakers', stats: { points: 24.7, rebounds: 12.6, assists: 3.5 } },
        { id: 'lal_reaves', name: 'Austin Reaves', position: 'SG', jerseyNumber: 15, team: 'Los Angeles Lakers', stats: { points: 15.9, rebounds: 4.4, assists: 5.5 } },
        { id: 'lal_russell', name: 'D\'Angelo Russell', position: 'PG', jerseyNumber: 1, team: 'Los Angeles Lakers', stats: { points: 18.0, rebounds: 3.1, assists: 6.3 } },
        { id: 'lal_hachimura', name: 'Rui Hachimura', position: 'PF', jerseyNumber: 28, team: 'Los Angeles Lakers', stats: { points: 13.6, rebounds: 4.3, assists: 1.2 } },
        { id: 'lal_hayes', name: 'Jaxson Hayes', position: 'C', jerseyNumber: 11, team: 'Los Angeles Lakers', stats: { points: 5.0, rebounds: 4.2, assists: 0.5 } },
        { id: 'lal_christie', name: 'Max Christie', position: 'SG', jerseyNumber: 12, team: 'Los Angeles Lakers', stats: { points: 4.2, rebounds: 2.1, assists: 1.0 } },
        { id: 'lal_vincent', name: 'Gabe Vincent', position: 'PG', jerseyNumber: 7, team: 'Los Angeles Lakers', stats: { points: 3.1, rebounds: 1.1, assists: 1.0 } },
      ],
      'Boston Celtics': [
        { id: 'bos_tatum', name: 'Jayson Tatum', position: 'SF', jerseyNumber: 0, team: 'Boston Celtics', stats: { points: 27.0, rebounds: 8.4, assists: 4.9 } },
        { id: 'bos_brown', name: 'Jaylen Brown', position: 'SG', jerseyNumber: 7, team: 'Boston Celtics', stats: { points: 23.0, rebounds: 5.5, assists: 3.6 } },
        { id: 'bos_porzingis', name: 'Kristaps Porzingis', position: 'C', jerseyNumber: 8, team: 'Boston Celtics', stats: { points: 20.1, rebounds: 7.2, assists: 1.9 } },
        { id: 'bos_holiday', name: 'Jrue Holiday', position: 'PG', jerseyNumber: 4, team: 'Boston Celtics', stats: { points: 12.5, rebounds: 5.4, assists: 4.8 } },
        { id: 'bos_white', name: 'Derrick White', position: 'SG', jerseyNumber: 9, team: 'Boston Celtics', stats: { points: 15.2, rebounds: 4.2, assists: 5.2 } },
        { id: 'bos_horford', name: 'Al Horford', position: 'C', jerseyNumber: 42, team: 'Boston Celtics', stats: { points: 8.8, rebounds: 6.8, assists: 2.3 } },
        { id: 'bos_hauser', name: 'Sam Hauser', position: 'SF', jerseyNumber: 30, team: 'Boston Celtics', stats: { points: 9.0, rebounds: 3.5, assists: 1.1 } },
        { id: 'bos_pritchard', name: 'Payton Pritchard', position: 'PG', jerseyNumber: 11, team: 'Boston Celtics', stats: { points: 8.6, rebounds: 2.8, assists: 2.3 } },
      ],
      'Golden State Warriors': [
        { id: 'gsw_curry', name: 'Stephen Curry', position: 'PG', jerseyNumber: 30, team: 'Golden State Warriors', stats: { points: 26.4, rebounds: 4.5, assists: 5.1 } },
        { id: 'gsw_thompson', name: 'Klay Thompson', position: 'SG', jerseyNumber: 11, team: 'Golden State Warriors', stats: { points: 17.9, rebounds: 3.3, assists: 2.3 } },
        { id: 'gsw_wiggins', name: 'Andrew Wiggins', position: 'SF', jerseyNumber: 22, team: 'Golden State Warriors', stats: { points: 13.2, rebounds: 4.5, assists: 2.3 } },
        { id: 'gsw_green', name: 'Draymond Green', position: 'PF', jerseyNumber: 23, team: 'Golden State Warriors', stats: { points: 8.5, rebounds: 7.2, assists: 6.0 } },
        { id: 'gsw_looney', name: 'Kevon Looney', position: 'C', jerseyNumber: 5, team: 'Golden State Warriors', stats: { points: 7.0, rebounds: 9.3, assists: 2.5 } },
        { id: 'gsw_poole', name: 'Jordan Poole', position: 'SG', jerseyNumber: 3, team: 'Golden State Warriors', stats: { points: 20.4, rebounds: 2.7, assists: 4.5 } },
        { id: 'gsw_kuminga', name: 'Jonathan Kuminga', position: 'SF', jerseyNumber: 0, team: 'Golden State Warriors', stats: { points: 9.9, rebounds: 3.4, assists: 2.0 } },
        { id: 'gsw_moody', name: 'Moses Moody', position: 'SG', jerseyNumber: 4, team: 'Golden State Warriors', stats: { points: 4.8, rebounds: 2.1, assists: 1.0 } },
      ],
      'Miami Heat': [
        { id: 'mia_butler', name: 'Jimmy Butler', position: 'SF', jerseyNumber: 22, team: 'Miami Heat', stats: { points: 20.8, rebounds: 5.3, assists: 5.0 } },
        { id: 'mia_adebayo', name: 'Bam Adebayo', position: 'C', jerseyNumber: 13, team: 'Miami Heat', stats: { points: 19.3, rebounds: 10.4, assists: 3.4 } },
        { id: 'mia_herro', name: 'Tyler Herro', position: 'SG', jerseyNumber: 14, team: 'Miami Heat', stats: { points: 20.7, rebounds: 5.4, assists: 4.2 } },
        { id: 'mia_rozier', name: 'Terry Rozier', position: 'PG', jerseyNumber: 2, team: 'Miami Heat', stats: { points: 16.9, rebounds: 4.2, assists: 4.6 } },
        { id: 'mia_love', name: 'Kevin Love', position: 'PF', jerseyNumber: 42, team: 'Miami Heat', stats: { points: 8.8, rebounds: 6.8, assists: 2.1 } },
        { id: 'mia_jovic', name: 'Nikola Jovic', position: 'PF', jerseyNumber: 5, team: 'Miami Heat', stats: { points: 7.7, rebounds: 4.2, assists: 2.8 } },
        { id: 'mia_robinson', name: 'Duncan Robinson', position: 'SG', jerseyNumber: 55, team: 'Miami Heat', stats: { points: 12.9, rebounds: 2.9, assists: 1.5 } },
        { id: 'mia_richardson', name: 'Josh Richardson', position: 'SG', jerseyNumber: 1, team: 'Miami Heat', stats: { points: 9.9, rebounds: 2.8, assists: 2.5 } },
      ]
    };

    return rosters[teamName] || this.generateGenericPlayers(teamName, 'NBA');
  }

  // Real NFL team rosters with actual player names
  private getNFLPlayers(teamName: string): PlayerData[] {
    const rosters: Record<string, PlayerData[]> = {
      'Kansas City Chiefs': [
        { id: 'kc_mahomes', name: 'Patrick Mahomes', position: 'QB', jerseyNumber: 15, team: 'Kansas City Chiefs', stats: { passingYards: 4183, touchdowns: 27 } },
        { id: 'kc_kelce', name: 'Travis Kelce', position: 'TE', jerseyNumber: 87, team: 'Kansas City Chiefs', stats: { touchdowns: 5 } },
        { id: 'kc_hill', name: 'Tyreek Hill', position: 'WR', jerseyNumber: 10, team: 'Kansas City Chiefs', stats: { touchdowns: 7 } },
        { id: 'kc_edwards', name: 'Clyde Edwards-Helaire', position: 'RB', jerseyNumber: 25, team: 'Kansas City Chiefs', stats: { rushingYards: 803, touchdowns: 4 } },
        { id: 'kc_jones', name: 'Chris Jones', position: 'DT', jerseyNumber: 95, team: 'Kansas City Chiefs', stats: {} },
        { id: 'kc_bolton', name: 'Nick Bolton', position: 'LB', jerseyNumber: 32, team: 'Kansas City Chiefs', stats: {} },
        { id: 'kc_sneed', name: 'L\'Jarius Sneed', position: 'CB', jerseyNumber: 38, team: 'Kansas City Chiefs', stats: {} },
        { id: 'kc_mcduffie', name: 'Trent McDuffie', position: 'CB', jerseyNumber: 21, team: 'Kansas City Chiefs', stats: {} },
      ],
      'Buffalo Bills': [
        { id: 'buf_allen', name: 'Josh Allen', position: 'QB', jerseyNumber: 17, team: 'Buffalo Bills', stats: { passingYards: 4306, rushingYards: 524, touchdowns: 29 } },
        { id: 'buf_diggs', name: 'Stefon Diggs', position: 'WR', jerseyNumber: 14, team: 'Buffalo Bills', stats: { touchdowns: 11 } },
        { id: 'buf_cook', name: 'James Cook', position: 'RB', jerseyNumber: 4, team: 'Buffalo Bills', stats: { rushingYards: 1122, touchdowns: 2 } },
        { id: 'buf_davis', name: 'Gabe Davis', position: 'WR', jerseyNumber: 13, team: 'Buffalo Bills', stats: { touchdowns: 7 } },
        { id: 'buf_knox', name: 'Dawson Knox', position: 'TE', jerseyNumber: 88, team: 'Buffalo Bills', stats: { touchdowns: 3 } },
        { id: 'buf_oliver', name: 'Ed Oliver', position: 'DT', jerseyNumber: 91, team: 'Buffalo Bills', stats: {} },
        { id: 'buf_milano', name: 'Matt Milano', position: 'LB', jerseyNumber: 58, team: 'Buffalo Bills', stats: {} },
        { id: 'buf_white', name: 'Tre\'Davious White', position: 'CB', jerseyNumber: 27, team: 'Buffalo Bills', stats: {} },
      ],
      'San Francisco 49ers': [
        { id: 'sf_purdy', name: 'Brock Purdy', position: 'QB', jerseyNumber: 13, team: 'San Francisco 49ers', stats: { passingYards: 4280, touchdowns: 31 } },
        { id: 'sf_mccaffrey', name: 'Christian McCaffrey', position: 'RB', jerseyNumber: 23, team: 'San Francisco 49ers', stats: { rushingYards: 1459, touchdowns: 21 } },
        { id: 'sf_samuel', name: 'Deebo Samuel', position: 'WR', jerseyNumber: 19, team: 'San Francisco 49ers', stats: { touchdowns: 7 } },
        { id: 'sf_aiyuk', name: 'Brandon Aiyuk', position: 'WR', jerseyNumber: 11, team: 'San Francisco 49ers', stats: { touchdowns: 7 } },
        { id: 'sf_kittle', name: 'George Kittle', position: 'TE', jerseyNumber: 85, team: 'San Francisco 49ers', stats: { touchdowns: 2 } },
        { id: 'sf_bosa', name: 'Nick Bosa', position: 'DE', jerseyNumber: 97, team: 'San Francisco 49ers', stats: {} },
        { id: 'sf_warner', name: 'Fred Warner', position: 'LB', jerseyNumber: 54, team: 'San Francisco 49ers', stats: {} },
        { id: 'sf_ward', name: 'Charvarius Ward', position: 'CB', jerseyNumber: 7, team: 'San Francisco 49ers', stats: {} },
      ],
      'Dallas Cowboys': [
        { id: 'dal_prescott', name: 'Dak Prescott', position: 'QB', jerseyNumber: 4, team: 'Dallas Cowboys', stats: { passingYards: 4516, touchdowns: 36 } },
        { id: 'dal_elliott', name: 'Ezekiel Elliott', position: 'RB', jerseyNumber: 21, team: 'Dallas Cowboys', stats: { rushingYards: 876, touchdowns: 12 } },
        { id: 'dal_lamb', name: 'CeeDee Lamb', position: 'WR', jerseyNumber: 88, team: 'Dallas Cowboys', stats: { touchdowns: 9 } },
        { id: 'dal_cooper', name: 'Amari Cooper', position: 'WR', jerseyNumber: 19, team: 'Dallas Cowboys', stats: { touchdowns: 8 } },
        { id: 'dal_schultz', name: 'Dalton Schultz', position: 'TE', jerseyNumber: 86, team: 'Dallas Cowboys', stats: { touchdowns: 5 } },
        { id: 'dal_parsons', name: 'Micah Parsons', position: 'LB', jerseyNumber: 11, team: 'Dallas Cowboys', stats: {} },
        { id: 'dal_lawrence', name: 'DeMarcus Lawrence', position: 'DE', jerseyNumber: 90, team: 'Dallas Cowboys', stats: {} },
        { id: 'dal_diggs', name: 'Trevon Diggs', position: 'CB', jerseyNumber: 7, team: 'Dallas Cowboys', stats: {} },
      ]
    };

    return rosters[teamName] || this.generateGenericPlayers(teamName, 'NFL');
  }

  // Real MLB team rosters with actual player names
  private getMLBPlayers(teamName: string): PlayerData[] {
    const rosters: Record<string, PlayerData[]> = {
      'Los Angeles Dodgers': [
        { id: 'lad_betts', name: 'Mookie Betts', position: 'RF', jerseyNumber: 50, team: 'Los Angeles Dodgers', stats: { battingAverage: 0.269, homeRuns: 19 } },
        { id: 'lad_freeman', name: 'Freddie Freeman', position: '1B', jerseyNumber: 5, team: 'Los Angeles Dodgers', stats: { battingAverage: 0.331, homeRuns: 8 } },
        { id: 'lad_turner', name: 'Trea Turner', position: 'SS', jerseyNumber: 6, team: 'Los Angeles Dodgers', stats: { battingAverage: 0.298, homeRuns: 4 } },
        { id: 'lad_muncy', name: 'Max Muncy', position: '3B', jerseyNumber: 13, team: 'Los Angeles Dodgers', stats: { battingAverage: 0.196, homeRuns: 15 } },
        { id: 'lad_smith', name: 'Will Smith', position: 'C', jerseyNumber: 16, team: 'Los Angeles Dodgers', stats: { battingAverage: 0.261, homeRuns: 19 } },
        { id: 'lad_kershaw', name: 'Clayton Kershaw', position: 'P', jerseyNumber: 22, team: 'Los Angeles Dodgers', stats: { era: 2.28, strikeouts: 137 } },
        { id: 'lad_buehler', name: 'Walker Buehler', position: 'P', jerseyNumber: 21, team: 'Los Angeles Dodgers', stats: { era: 3.26, strikeouts: 150 } },
        { id: 'lad_urias', name: 'Julio Urias', position: 'P', jerseyNumber: 7, team: 'Los Angeles Dodgers', stats: { era: 4.19, strikeouts: 99 } },
      ],
      'New York Yankees': [
        { id: 'nyy_judge', name: 'Aaron Judge', position: 'RF', jerseyNumber: 99, team: 'New York Yankees', stats: { battingAverage: 0.267, homeRuns: 58 } },
        { id: 'nyy_torres', name: 'Gleyber Torres', position: '2B', jerseyNumber: 25, team: 'New York Yankees', stats: { battingAverage: 0.273, homeRuns: 25 } },
        { id: 'nyy_rizzo', name: 'Anthony Rizzo', position: '1B', jerseyNumber: 48, team: 'New York Yankees', stats: { battingAverage: 0.224, homeRuns: 31 } },
        { id: 'nyy_stanton', name: 'Giancarlo Stanton', position: 'DH', jerseyNumber: 27, team: 'New York Yankees', stats: { battingAverage: 0.211, homeRuns: 31 } },
        { id: 'nyy_higashioka', name: 'Kyle Higashioka', position: 'C', jerseyNumber: 66, team: 'New York Yankees', stats: { battingAverage: 0.198, homeRuns: 7 } },
        { id: 'nyy_cole', name: 'Gerrit Cole', position: 'P', jerseyNumber: 45, team: 'New York Yankees', stats: { era: 3.50, strikeouts: 222 } },
        { id: 'nyy_cortes', name: 'Nestor Cortes', position: 'P', jerseyNumber: 65, team: 'New York Yankees', stats: { era: 4.97, strikeouts: 130 } },
        { id: 'nyy_holmes', name: 'Clay Holmes', position: 'P', jerseyNumber: 35, team: 'New York Yankees', stats: { era: 3.14, strikeouts: 68 } },
      ]
    };

    return rosters[teamName] || this.generateGenericPlayers(teamName, 'MLB');
  }

  private generateGenericPlayers(teamName: string, sport: string): PlayerData[] {
    const positions = this.getPositionsForSport(sport);
    const firstNames = ['James', 'John', 'Michael', 'David', 'Chris', 'Mike', 'Kevin', 'Ryan', 'Alex', 'Brandon', 'Tyler', 'Jordan', 'Justin', 'Anthony', 'Daniel', 'Matthew', 'Andrew', 'Josh', 'Jake', 'Nick'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

    return positions.slice(0, 8).map((position, index) => ({
      id: `${teamName.replace(/\s+/g, '_').toLowerCase()}_${index}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      position,
      jerseyNumber: Math.floor(Math.random() * 99) + 1,
      team: teamName,
      stats: this.generateStatsForPosition(position, sport)
    }));
  }

  private getPositionsForSport(sport: string): string[] {
    switch (sport.toLowerCase()) {
      case 'nba':
      case 'basketball':
        return ['PG', 'SG', 'SF', 'PF', 'C', 'PG', 'SG', 'SF'];
      case 'nfl':
      case 'football':
        return ['QB', 'RB', 'WR', 'WR', 'TE', 'K', 'DEF', 'RB'];
      case 'mlb':
      case 'baseball':
        return ['C', '1B', '2B', 'SS', '3B', 'OF', 'OF', 'P'];
      default:
        return ['Player', 'Player', 'Player', 'Player', 'Player', 'Player', 'Player', 'Player'];
    }
  }

  private generateStatsForPosition(position: string, sport: string): any {
    const stats: any = {};
    
    if (sport.toLowerCase() === 'nba' || sport.toLowerCase() === 'basketball') {
      stats.points = Math.floor(Math.random() * 25) + 5;
      stats.rebounds = Math.floor(Math.random() * 10) + 2;
      stats.assists = Math.floor(Math.random() * 8) + 1;
      stats.fieldGoalPercentage = Math.random() * 0.3 + 0.4;
      stats.threePointPercentage = Math.random() * 0.2 + 0.3;
      stats.freeThrowPercentage = Math.random() * 0.2 + 0.7;
    } else if (sport.toLowerCase() === 'nfl' || sport.toLowerCase() === 'football') {
      if (position === 'QB') {
        stats.passingYards = Math.floor(Math.random() * 2000) + 2000;
        stats.touchdowns = Math.floor(Math.random() * 20) + 15;
      } else if (position === 'RB') {
        stats.rushingYards = Math.floor(Math.random() * 800) + 400;
        stats.touchdowns = Math.floor(Math.random() * 10) + 3;
      } else {
        stats.touchdowns = Math.floor(Math.random() * 8) + 1;
      }
    } else if (sport.toLowerCase() === 'mlb' || sport.toLowerCase() === 'baseball') {
      if (position === 'P') {
        stats.era = (Math.random() * 2 + 2.5).toFixed(2);
        stats.strikeouts = Math.floor(Math.random() * 100) + 80;
      } else {
        stats.battingAverage = (Math.random() * 0.15 + 0.22).toFixed(3);
        stats.homeRuns = Math.floor(Math.random() * 25) + 5;
      }
    }
    
    return stats;
  }

  async getTeamRoster(teamName: string, sport: string): Promise<TeamRoster> {
    const cacheKey = `${teamName}_${sport}`;
    
    if (this.rosterCache.has(cacheKey)) {
      return this.rosterCache.get(cacheKey)!;
    }

    let players: PlayerData[] = [];
    
    switch (sport.toLowerCase()) {
      case 'basketball_nba':
      case 'nba':
        console.log(`🏀 Fetching REAL NBA roster for ${teamName}`);
        players = await this.getRealNBAPlayers(teamName);
        break;
      case 'americanfootball_nfl':
      case 'nfl':
        players = this.getNFLPlayers(teamName);
        break;
      case 'baseball_mlb':
      case 'mlb':
        players = this.getMLBPlayers(teamName);
        break;
      default:
        players = this.generateGenericPlayers(teamName, sport);
    }

    const roster: TeamRoster = {
      teamId: teamName.replace(/\s+/g, '_').toLowerCase(),
      teamName,
      players,
      starters: players.slice(0, 5),
      bench: players.slice(5)
    };

    this.rosterCache.set(cacheKey, roster);
    return roster;
  }

  // NEW: Get real NBA players from our NBA data service
  private async getRealNBAPlayers(teamName: string): Promise<PlayerData[]> {
    try {
      console.log(`🔄 Loading real NBA data for ${teamName}`);
      const { nbaDataService } = await import('./nbaDataService');
      const nbaTeam = await nbaDataService.getTeamData(teamName);
      
      if (nbaTeam && nbaTeam.players.length > 0) {
        console.log(`✅ Found ${nbaTeam.players.length} REAL players for ${teamName}`);
        
        // Convert NBA players to our PlayerData format
        return nbaTeam.players.map(nbaPlayer => ({
          id: nbaPlayer.id.toString(),
          name: nbaPlayer.fullName,
          position: nbaPlayer.position,
          jerseyNumber: parseInt(nbaPlayer.jersey) || 0,
          team: nbaTeam.name,
          stats: {
            points: nbaPlayer.stats?.points || 0,
            rebounds: nbaPlayer.stats?.rebounds || 0,
            assists: nbaPlayer.stats?.assists || 0,
            fieldGoalPercentage: (nbaPlayer.stats?.fieldGoalPercentage || 0) / 100,
            threePointPercentage: (nbaPlayer.stats?.threePointPercentage || 0) / 100,
            freeThrowPercentage: (nbaPlayer.stats?.freeThrowPercentage || 0) / 100
          }
        }));
      } else {
        console.warn(`⚠️ No NBA data found for ${teamName}, using fallback`);
        return this.getNBAPlayers(teamName);
      }
    } catch (error) {
      console.error(`❌ Error loading NBA data for ${teamName}:`, error);
      return this.getNBAPlayers(teamName);
    }
  }

  async getPlayerProps(gameId: string, teamName: string, sport: string): Promise<PlayerProp[]> {
    const cacheKey = `${gameId}_${teamName}_props`;
    
    if (this.playerPropsCache.has(cacheKey)) {
      return this.playerPropsCache.get(cacheKey)!;
    }

    const roster = await this.getTeamRoster(teamName, sport);
    const props: PlayerProp[] = [];

    // Generate realistic player props for starters
    roster.starters.forEach(player => {
      const playerProps = this.generatePlayerProps(player, sport);
      props.push(...playerProps);
    });

    this.playerPropsCache.set(cacheKey, props);
    return props;
  }

  private generatePlayerProps(player: PlayerData, sport: string): PlayerProp[] {
    const props: PlayerProp[] = [];
    
    if (sport.toLowerCase() === 'basketball_nba' || sport.toLowerCase() === 'nba') {
      // Points prop
      const pointsLine = (player.stats?.points || 15) + Math.random() * 4 - 2;
      props.push({
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        team: player.team,
        propType: 'points',
        line: Math.round(pointsLine * 2) / 2, // Round to nearest 0.5
        overOdds: -110 + Math.floor(Math.random() * 20) - 10,
        underOdds: -110 + Math.floor(Math.random() * 20) - 10,
        description: `${player.name} Total Points`
      });

      // Rebounds prop
      if (player.position.includes('C') || player.position.includes('PF')) {
        const reboundsLine = (player.stats?.rebounds || 6) + Math.random() * 2 - 1;
        props.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          propType: 'rebounds',
          line: Math.round(reboundsLine * 2) / 2,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Total Rebounds`
        });
      }

      // Assists prop
      if (player.position.includes('PG') || player.position.includes('SG')) {
        const assistsLine = (player.stats?.assists || 3) + Math.random() * 2 - 1;
        props.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          propType: 'assists',
          line: Math.round(assistsLine * 2) / 2,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Total Assists`
        });
      }
    } else if (sport.toLowerCase() === 'americanfootball_nfl' || sport.toLowerCase() === 'nfl') {
      if (player.position === 'QB') {
        // Passing yards
        const passingLine = (player.stats?.passingYards || 250) / 16 + Math.random() * 50 - 25;
        props.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          propType: 'passing_yards',
          line: Math.round(passingLine / 5) * 5, // Round to nearest 5
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Passing Yards`
        });

        // Passing TDs
        props.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          propType: 'passing_touchdowns',
          line: 1.5 + Math.random() * 1,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Passing Touchdowns`
        });
      } else if (player.position === 'RB') {
        // Rushing yards
        const rushingLine = (player.stats?.rushingYards || 70) / 16 + Math.random() * 30 - 15;
        props.push({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          team: player.team,
          propType: 'rushing_yards',
          line: Math.round(rushingLine / 5) * 5,
          overOdds: -110 + Math.floor(Math.random() * 20) - 10,
          underOdds: -110 + Math.floor(Math.random() * 20) - 10,
          description: `${player.name} Rushing Yards`
        });
      }
    }

    return props;
  }

  // Search players across all teams
  searchPlayers(query: string, sport?: string): PlayerData[] {
    console.log(`🔍 PlayerDataService: Searching for "${query}" in sport: ${sport || 'all'}`);
    const results: PlayerData[] = [];
    
    // Search in cached rosters
    for (const [cacheKey, roster] of this.rosterCache.entries()) {
      if (sport && !cacheKey.includes(sport)) continue;
      
      roster.players.forEach(player => {
        if (
          player.name.toLowerCase().includes(query.toLowerCase()) ||
          player.position.toLowerCase().includes(query.toLowerCase()) ||
          player.team.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(player);
        }
      });
    }
    
    // Fallback: Include popular players for demonstration
    const popularPlayers = this.getPopularPlayers();
    popularPlayers.forEach(player => {
      if (
        player.name.toLowerCase().includes(query.toLowerCase()) &&
        !results.some(r => r.id === player.id)
      ) {
        results.push(player);
      }
    });
    
    console.log(`✅ Found ${results.length} players matching "${query}"`);
    return results.slice(0, 10); // Limit results
  }

  private getPopularPlayers(): PlayerData[] {
    return [
      {
        id: 'lebron-james',
        name: 'LeBron James',
        position: 'SF',
        team: 'Los Angeles Lakers',
        jerseyNumber: 23,
        stats: { points: 25.3, rebounds: 7.3, assists: 7.3 }
      },
      {
        id: 'stephen-curry',
        name: 'Stephen Curry',
        position: 'PG',
        team: 'Golden State Warriors',
        jerseyNumber: 30,
        stats: { points: 29.5, rebounds: 5.1, assists: 6.2, threePointPercentage: 0.427 }
      },
      {
        id: 'kevin-durant',
        name: 'Kevin Durant',
        position: 'SF',
        team: 'Phoenix Suns',
        jerseyNumber: 35,
        stats: { points: 29.1, rebounds: 6.7, assists: 5.0 }
      },
      {
        id: 'giannis-antetokounmpo',
        name: 'Giannis Antetokounmpo',
        position: 'PF',
        team: 'Milwaukee Bucks',
        jerseyNumber: 34,
        stats: { points: 31.1, rebounds: 11.8, assists: 5.7 }
      },
      {
        id: 'luka-doncic',
        name: 'Luka Doncic',
        position: 'PG',
        team: 'Dallas Mavericks',
        jerseyNumber: 77,
        stats: { points: 32.4, rebounds: 8.6, assists: 8.0 }
      },
      {
        id: 'joel-embiid',
        name: 'Joel Embiid',
        position: 'C',
        team: 'Philadelphia 76ers',
        jerseyNumber: 21,
        stats: { points: 33.1, rebounds: 10.2, assists: 4.2 }
      },
      {
        id: 'patrick-mahomes',
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'Kansas City Chiefs',
        jerseyNumber: 15,
        stats: { passingYards: 4183, touchdowns: 31 }
      },
      {
        id: 'josh-allen',
        name: 'Josh Allen',
        position: 'QB',
        team: 'Buffalo Bills',
        jerseyNumber: 17,
        stats: { passingYards: 4306, touchdowns: 29 }
      },
      {
        id: 'derrick-henry',
        name: 'Derrick Henry',
        position: 'RB',
        team: 'Tennessee Titans',
        jerseyNumber: 22,
        stats: { rushingYards: 1538, touchdowns: 13 }
      },
      {
        id: 'travis-kelce',
        name: 'Travis Kelce',
        position: 'TE',
        team: 'Kansas City Chiefs',
        jerseyNumber: 87,
        stats: { points: 92.7 }
      }
    ];
  }
}

export const playerDataService = new PlayerDataService();
export type { PlayerData, TeamRoster, PlayerProp };