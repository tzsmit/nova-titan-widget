// Sports Data Types

export type SportType = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer';

export type LeagueType = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'MLS' | 'NCAAB' | 'NCAAF';

export interface Team {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  logo?: string;
  city: string;
  conference?: string;
  division?: string;
  record?: {
    wins: number;
    losses: number;
    ties?: number;
  };
}

export interface Player {
  id: string;
  name: string;
  position: string;
  jersey: number;
  team: Team;
  stats: PlayerStats[];
  photo?: string;
  height?: string;
  weight?: string;
  age?: number;
}

export interface PlayerStats {
  gameId: string;
  date: string;
  opponent: string;
  minutes?: number;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  threePointersMade?: number;
  threePointersAttempted?: number;
  freeThrowsMade?: number;
  freeThrowsAttempted?: number;
  // NFL specific
  passingYards?: number;
  rushingYards?: number;
  receivingYards?: number;
  touchdowns?: number;
  interceptions?: number;
  fumbles?: number;
  tackles?: number;
  sacks?: number;
}

export interface GameStatus {
  type: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled';
  period?: number;
  clock?: string;
  displayClock?: string;
}

export interface Game {
  id: string;
  sport: SportType;
  league: LeagueType;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: GameStatus;
  venue?: {
    name: string;
    city: string;
    state?: string;
  };
  weather?: {
    temperature?: number;
    conditions?: string;
    windSpeed?: number;
    humidity?: number;
  };
  score?: {
    home: number;
    away: number;
  };
  season: {
    year: number;
    type: 'preseason' | 'regular' | 'postseason';
    week?: number;
  };
}

export interface TeamSeasonStats {
  teamId: string;
  season: number;
  games: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  // Advanced stats
  offensiveRating?: number;
  defensiveRating?: number;
  netRating?: number;
  pace?: number;
  homeRecord?: { wins: number; losses: number };
  awayRecord?: { wins: number; losses: number };
  lastFiveRecord?: { wins: number; losses: number };
  streak?: { type: 'W' | 'L'; count: number };
  restDays?: number;
}