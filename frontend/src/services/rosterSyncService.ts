/**
 * Roster Sync Service - Populates database with real player rosters
 * Fetches complete team rosters from ESPN APIs for all sports
 */

interface PlayerData {
  id: string;
  name: string;
  position: string;
  jersey?: number;
  height?: string;
  weight?: string;
  age?: number;
  photo?: string;
  teamId: string;
  active: boolean;
}

interface TeamData {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  city: string;
  conference?: string;
  division?: string;
  logo?: string;
  sport: string;
  league: string;
}

class RosterSyncService {
  private readonly ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly BACKEND_BASE = process.env.NODE_ENV === 'production' 
    ? null // No backend in static deployment
    : '/api'; // Local development backend
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for roster data

  /**
   * Sync all rosters for all sports
   */
  async syncAllRosters(): Promise<void> {
    console.log('🔄 Starting complete roster sync for all sports...');
    
    const sports = [
      { key: 'football/nfl', league: 'NFL', sport: 'football' },
      { key: 'basketball/nba', league: 'NBA', sport: 'basketball' },
      { key: 'football/college-football', league: 'CFB', sport: 'football' },
      { key: 'hockey/nhl', league: 'NHL', sport: 'hockey' },
      { key: 'baseball/mlb', league: 'MLB', sport: 'baseball' }
    ];

    for (const sport of sports) {
      try {
        console.log(`📊 Syncing ${sport.league} rosters...`);
        await this.syncSportRosters(sport.key, sport.league, sport.sport);
        console.log(`✅ ${sport.league} rosters synced successfully`);
      } catch (error) {
        console.error(`❌ Failed to sync ${sport.league} rosters:`, error);
      }
    }

    console.log('🎯 Complete roster sync finished!');
  }

  /**
   * Sync rosters for a specific sport
   */
  private async syncSportRosters(sportKey: string, league: string, sport: string): Promise<void> {
    // Get all teams for the sport
    const teams = await this.fetchTeams(sportKey, league, sport);
    console.log(`📋 Found ${teams.length} teams in ${league}`);

    // Sync teams to database
    for (const team of teams) {
      await this.syncTeamToDatabase(team);
    }

    // Get rosters for each team
    for (const team of teams) {
      try {
        const players = await this.fetchTeamRoster(team.id, sportKey, team);
        console.log(`👥 ${team.name}: ${players.length} players found`);
        
        // Sync players to database
        for (const player of players) {
          await this.syncPlayerToDatabase(player);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to sync roster for ${team.name}:`, error);
      }
    }
  }

  /**
   * Fetch teams from ESPN API
   */
  private async fetchTeams(sportKey: string, league: string, sport: string): Promise<TeamData[]> {
    const cacheKey = `teams_${sportKey}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.ESPN_BASE}/${sportKey}/teams`;
      console.log(`🌐 Fetching teams: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      
      const teams: TeamData[] = data.sports?.[0]?.leagues?.[0]?.teams?.map((teamWrapper: any) => {
        const team = teamWrapper.team;
        return {
          id: team.id,
          name: team.name,
          displayName: team.displayName,
          abbreviation: team.abbreviation,
          city: team.location || team.name.split(' ').slice(0, -1).join(' '),
          conference: team.groups?.find((g: any) => g.parent?.name)?.parent?.name,
          division: team.groups?.find((g: any) => !g.parent)?.name,
          logo: team.logos?.[0]?.href,
          sport: sport,
          league: league
        };
      }) || [];

      this.setCache(cacheKey, teams);
      console.log(`✅ Fetched ${teams.length} teams for ${league}`);
      return teams;

    } catch (error) {
      console.error(`❌ Error fetching teams for ${sportKey}:`, error);
      return [];
    }
  }

  /**
   * Fetch team roster from ESPN API
   */
  private async fetchTeamRoster(teamId: string, sportKey: string, team: TeamData): Promise<PlayerData[]> {
    const cacheKey = `roster_${teamId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.ESPN_BASE}/${sportKey}/teams/${teamId}/roster`;
      console.log(`👥 Fetching roster: ${team.name}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`ESPN Roster API error: ${response.status}`);
      }

      const data = await response.json();
      
      const players: PlayerData[] = [];
      
      // Process athletes array
      data.athletes?.forEach((athleteGroup: any) => {
        athleteGroup.items?.forEach((athlete: any) => {
          players.push({
            id: athlete.id,
            name: athlete.fullName || athlete.displayName,
            position: athlete.position?.abbreviation || athlete.position?.displayName || 'N/A',
            jersey: athlete.jersey ? parseInt(athlete.jersey) : undefined,
            height: athlete.height,
            weight: athlete.weight ? `${athlete.weight} lbs` : undefined,
            age: athlete.age,
            photo: athlete.headshot?.href,
            teamId: team.id,
            active: athlete.active !== false
          });
        });
      });

      this.setCache(cacheKey, players);
      console.log(`✅ Fetched ${players.length} players for ${team.name}`);
      return players;

    } catch (error) {
      console.error(`❌ Error fetching roster for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Sync team data to database
   */
  private async syncTeamToDatabase(team: TeamData): Promise<void> {
    // Skip database sync in production static deployment
    if (!this.BACKEND_BASE) {
      console.log(`📊 Team data cached: ${team.name} (no database in static deployment)`);
      return;
    }

    try {
      const response = await fetch(`${this.BACKEND_BASE}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: team.id,
          name: team.name,
          displayName: team.displayName,
          abbreviation: team.abbreviation,
          city: team.city,
          conference: team.conference,
          division: team.division,
          logo: team.logo,
          sport: team.sport,
          league: team.league
        })
      });

      if (!response.ok && response.status !== 409) { // 409 = conflict (already exists)
        console.warn(`⚠️ Failed to sync team ${team.name}: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Database sync failed for team ${team.name}:`, error);
    }
  }

  /**
   * Sync player data to database
   */
  private async syncPlayerToDatabase(player: PlayerData): Promise<void> {
    // Skip database sync in production static deployment
    if (!this.BACKEND_BASE) {
      console.log(`👤 Player data cached: ${player.name} (no database in static deployment)`);
      return;
    }

    try {
      const response = await fetch(`${this.BACKEND_BASE}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: player.id,
          name: player.name,
          position: player.position,
          jersey: player.jersey,
          height: player.height,
          weight: player.weight,
          age: player.age,
          photo: player.photo,
          teamId: player.teamId,
          active: player.active
        })
      });

      if (!response.ok && response.status !== 409) { // 409 = conflict (already exists)
        console.warn(`⚠️ Failed to sync player ${player.name}: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Database sync failed for player ${player.name}:`, error);
    }
  }

  /**
   * Cache management
   */
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

  /**
   * Manual sync trigger for specific team
   */
  async syncTeamRoster(teamId: string, sport: string): Promise<void> {
    const sportMap: { [key: string]: { key: string; league: string; sport: string } } = {
      'nfl': { key: 'football/nfl', league: 'NFL', sport: 'football' },
      'nba': { key: 'basketball/nba', league: 'NBA', sport: 'basketball' },
      'cfb': { key: 'football/college-football', league: 'CFB', sport: 'football' },
      'nhl': { key: 'hockey/nhl', league: 'NHL', sport: 'hockey' },
      'mlb': { key: 'baseball/mlb', league: 'MLB', sport: 'baseball' }
    };

    const sportConfig = sportMap[sport.toLowerCase()];
    if (!sportConfig) {
      throw new Error(`Unsupported sport: ${sport}`);
    }

    console.log(`🔄 Syncing roster for team ${teamId} in ${sportConfig.league}...`);
    
    // Get team info first
    const teams = await this.fetchTeams(sportConfig.key, sportConfig.league, sportConfig.sport);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      throw new Error(`Team ${teamId} not found in ${sportConfig.league}`);
    }

    // Sync team and roster
    await this.syncTeamToDatabase(team);
    const players = await this.fetchTeamRoster(teamId, sportConfig.key, team);
    
    for (const player of players) {
      await this.syncPlayerToDatabase(player);
    }

    console.log(`✅ Successfully synced ${players.length} players for ${team.name}`);
  }
}

export const rosterSyncService = new RosterSyncService();