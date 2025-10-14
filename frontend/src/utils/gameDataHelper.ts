/**
 * Game Data Helper - Enhanced data processing and validation
 */

export interface ProcessedGame {
  id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  commence_time: string;
  displayTime: string;
  displayDate: string;
  venue?: string;
  odds?: {
    moneyline: { home: number | null; away: number | null };
    spread: { home: number | null; away: number | null; line: number | null };
    total: { over: number | null; under: number | null; line: number | null };
  };
  status: 'scheduled' | 'live' | 'final';
  network?: string;
}

// Comprehensive team logos with proper fallbacks
export const TEAM_LOGOS = {
  // NFL Teams
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
  'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
  'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
  'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
  'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
  'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
  'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
  'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
  'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
  'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
  'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
  'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/was.png',

  // NBA Teams
  'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
  'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
  'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
  'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
  'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
  'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
  'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
  'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
  'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
  'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
  'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
  'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
  'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
  'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
  'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
  'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
  'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
  'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
  'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
  'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/was.png',

  // MLB Teams (selection)
  'New York Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
  'Los Angeles Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
  'Houston Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
  'Atlanta Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',

  // NHL Teams (selection)  
  'Vegas Golden Knights': 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png',
  'Colorado Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
};

// Stadium/Venue mappings
export const VENUE_MAPPINGS = {
  // NFL Stadiums
  'Arrowhead Stadium': 'Kansas City Chiefs',
  'Highmark Stadium': 'Buffalo Bills', 
  'Paycor Stadium': 'Cincinnati Bengals',
  'Heinz Field': 'Pittsburgh Steelers',
  'SoFi Stadium': 'Los Angeles Rams',
  'TIAA Bank Field': 'Jacksonville Jaguars',
  'AT&T Stadium': 'Dallas Cowboys',
  'Lincoln Financial Field': 'Philadelphia Eagles',
  'Lambeau Field': 'Green Bay Packers',
  'Ford Field': 'Detroit Lions',
  'M&T Bank Stadium': 'Baltimore Ravens',
  'FirstEnergy Stadium': 'Cleveland Browns',
  'Hard Rock Stadium': 'Miami Dolphins',
  'MetLife Stadium': 'New York Jets',
  'Gillette Stadium': 'New England Patriots',
  'Lucas Oil Stadium': 'Indianapolis Colts',
  'Nissan Stadium': 'Tennessee Titans',
  'NRG Stadium': 'Houston Texans',
  'Empower Field at Mile High': 'Denver Broncos',
  'Allegiant Stadium': 'Las Vegas Raiders',
  'Levi\'s Stadium': 'San Francisco 49ers',
  'Lumen Field': 'Seattle Seahawks',
  'State Farm Stadium': 'Arizona Cardinals',
  'U.S. Bank Stadium': 'Minnesota Vikings',
  'Soldier Field': 'Chicago Bears',
  'Mercedes-Benz Stadium': 'Atlanta Falcons',
  'Bank of America Stadium': 'Carolina Panthers',
  'Caesars Superdome': 'New Orleans Saints',
  'Raymond James Stadium': 'Tampa Bay Buccaneers',
  'FedExField': 'Washington Commanders',
  
  // NBA Arenas  
  'Crypto.com Arena': 'Los Angeles Lakers',
  'Chase Center': 'Golden State Warriors',
  'TD Garden': 'Boston Celtics',
  'FTX Arena': 'Miami Heat',
  'American Airlines Center': 'Dallas Mavericks',
  'Ball Arena': 'Denver Nuggets',
  'Footprint Center': 'Phoenix Suns',
  'Fiserv Forum': 'Milwaukee Bucks',
  'Wells Fargo Center': 'Philadelphia 76ers',
  'Barclays Center': 'Brooklyn Nets'
};

// TV Networks
export const TV_NETWORKS = ['ESPN', 'FOX', 'CBS', 'NBC', 'ABC', 'TNT', 'Prime Video', 'NFL Network', 'NBA TV'];

/**
 * Process and enhance raw game data from API
 */
export function processGameData(rawGames: any[], selectedBookmaker: string = 'all'): ProcessedGame[] {
  console.log('🔍 Processing games data:', rawGames.length, 'raw games');

  return rawGames.map((game, index) => {
    // Extract team names with multiple fallback patterns
    const homeTeam = game.home_team || 
                    game.homeTeam || 
                    (game.teams && game.teams.home) ||
                    `Home Team ${index + 1}`;
    
    const awayTeam = game.away_team || 
                    game.awayTeam || 
                    (game.teams && game.teams.away) ||
                    `Away Team ${index + 1}`;

    // Get team logos with fallbacks
    const homeTeamLogo = getTeamLogo(homeTeam);
    const awayTeamLogo = getTeamLogo(awayTeam);

    // Process game time with proper error handling
    const { displayTime, displayDate } = processGameTime(game.commence_time || game.gameTime);

    // Process odds data
    const odds = processOddsData(game, homeTeam, awayTeam, selectedBookmaker);

    // Get venue information
    const venue = getVenueInfo(game.venue, homeTeam);

    // Assign random network for display purposes
    const network = TV_NETWORKS[Math.floor(Math.random() * TV_NETWORKS.length)];

    const processedGame: ProcessedGame = {
      id: game.id || `game_${index}`,
      sport_key: game.sport_key || game.sport || 'unknown',
      home_team: homeTeam,
      away_team: awayTeam,
      homeTeamLogo,
      awayTeamLogo,
      commence_time: game.commence_time || game.gameTime || new Date().toISOString(),
      displayTime,
      displayDate,
      venue,
      odds,
      status: game.status || 'scheduled',
      network
    };

    console.log(`✅ Processed game: ${awayTeam} @ ${homeTeam} - ${displayTime}`);
    return processedGame;
  });
}

/**
 * Get team logo with fallback
 */
function getTeamLogo(teamName: string): string {
  if (TEAM_LOGOS[teamName as keyof typeof TEAM_LOGOS]) {
    return TEAM_LOGOS[teamName as keyof typeof TEAM_LOGOS];
  }
  
  // Create initials fallback
  const initials = teamName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  return `https://via.placeholder.com/64x64/1e293b/ffffff?text=${initials}`;
}

/**
 * Process game time with proper CST conversion
 */
function processGameTime(gameTime: string | undefined): { displayTime: string; displayDate: string } {
  if (!gameTime) {
    return { displayTime: 'TBD', displayDate: 'TBD' };
  }

  try {
    const date = new Date(gameTime);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const displayTime = date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' CST';
    
    const displayDate = date.toLocaleDateString('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return { displayTime, displayDate };
  } catch (error) {
    console.warn('Date parsing error for:', gameTime, error);
    return { displayTime: 'TBD', displayDate: 'TBD' };
  }
}

/**
 * Process odds data from various API formats
 */
function processOddsData(game: any, homeTeam: string, awayTeam: string, selectedBookmaker: string) {
  if (!game.bookmakers) {
    return null;
  }

  let oddsData = null;

  try {
    if (Array.isArray(game.bookmakers) && game.bookmakers.length > 0) {
      // Raw API format
      const bookmaker = selectedBookmaker === 'all' 
        ? game.bookmakers[0] 
        : game.bookmakers.find((b: any) => b.key === selectedBookmaker) || game.bookmakers[0];
      
      if (bookmaker && bookmaker.markets) {
        const h2h = bookmaker.markets.find((m: any) => m.key === 'h2h');
        const spreads = bookmaker.markets.find((m: any) => m.key === 'spreads');
        const totals = bookmaker.markets.find((m: any) => m.key === 'totals');
        
        oddsData = {
          moneyline: {
            home: h2h?.outcomes?.find((o: any) => o.name === homeTeam)?.price || null,
            away: h2h?.outcomes?.find((o: any) => o.name === awayTeam)?.price || null
          },
          spread: {
            home: spreads?.outcomes?.find((o: any) => o.name === homeTeam)?.price || null,
            away: spreads?.outcomes?.find((o: any) => o.name === awayTeam)?.price || null,
            line: spreads?.outcomes?.[0]?.point || null
          },
          total: {
            over: totals?.outcomes?.find((o: any) => o.name === 'Over')?.price || null,
            under: totals?.outcomes?.find((o: any) => o.name === 'Under')?.price || null,
            line: totals?.outcomes?.[0]?.point || null
          }
        };
      }
    } else if (typeof game.bookmakers === 'object') {
      // Transformed format
      const bookmakerKey = selectedBookmaker === 'all' 
        ? Object.keys(game.bookmakers)[0] 
        : selectedBookmaker;
      
      if (game.bookmakers[bookmakerKey]) {
        oddsData = game.bookmakers[bookmakerKey];
      }
    }
  } catch (error) {
    console.warn('Error processing odds data:', error);
  }

  return oddsData;
}

/**
 * Get venue information
 */
function getVenueInfo(venue: string | undefined, homeTeam: string): string {
  if (venue && venue !== 'undefined Stadium') {
    return venue;
  }
  
  // Try to find venue by home team
  for (const [stadium, team] of Object.entries(VENUE_MAPPINGS)) {
    if (team === homeTeam) {
      return stadium;
    }
  }
  
  return `${homeTeam} Stadium`;
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number | null): string {
  if (!odds || odds === 0) return 'N/A';
  return odds > 0 ? `+${odds}` : `${odds}`;
}

/**
 * Generate mock games for testing when API is unavailable
 */
export function generateMockGames(): ProcessedGame[] {
  const mockGames: ProcessedGame[] = [
    {
      id: 'mock_nfl_1',
      sport_key: 'americanfootball_nfl',
      home_team: 'Kansas City Chiefs',
      away_team: 'Buffalo Bills',
      homeTeamLogo: TEAM_LOGOS['Kansas City Chiefs'],
      awayTeamLogo: TEAM_LOGOS['Buffalo Bills'],
      commence_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      displayTime: '8:20 PM CST',
      displayDate: 'Sun, Oct 14',
      venue: 'Arrowhead Stadium',
      odds: {
        moneyline: { home: -140, away: +120 },
        spread: { home: -110, away: -110, line: -3.5 },
        total: { over: -110, under: -110, line: 47.5 }
      },
      status: 'scheduled',
      network: 'NBC'
    },
    {
      id: 'mock_nba_1', 
      sport_key: 'basketball_nba',
      home_team: 'Los Angeles Lakers',
      away_team: 'Golden State Warriors',
      homeTeamLogo: TEAM_LOGOS['Los Angeles Lakers'],
      awayTeamLogo: TEAM_LOGOS['Golden State Warriors'],
      commence_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      displayTime: '10:30 PM CST',
      displayDate: 'Sun, Oct 14',
      venue: 'Crypto.com Arena',
      odds: {
        moneyline: { home: -125, away: +105 },
        spread: { home: -110, away: -110, line: -2.5 },
        total: { over: -110, under: -110, line: 218.5 }
      },
      status: 'scheduled',
      network: 'ESPN'
    }
  ];

  console.log('🎭 Generated mock games for testing:', mockGames.length);
  return mockGames;
}