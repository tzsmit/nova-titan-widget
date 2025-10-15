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
/**
 * Get player headshot with fallback to generic silhouette
 */
export function getPlayerHeadshot(playerName: string, sport: string = 'NFL'): string {
  // Generic player silhouette as fallback since ESPN headshots require exact player IDs
  const genericSilhouette = `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="playerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#playerGrad)" stroke="#374151" stroke-width="2"/>
      <circle cx="24" cy="18" r="8" fill="#f1f5f9"/>
      <ellipse cx="24" cy="38" rx="12" ry="8" fill="#f1f5f9"/>
    </svg>
  `)}`;
  
  // For now, return generic silhouette since constructing ESPN URLs without player IDs leads to 404s
  console.log(`🏈 Using generic headshot for ${playerName} (${sport})`);
  return genericSilhouette;
}

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
  
  if (!rawGames || rawGames.length === 0) {
    console.log('❌ No raw games provided to process');
    return [];
  }

  const processedGames = rawGames.map((game, index) => {
    if (!game) {
      console.warn(`⚠️ Null/undefined game at index ${index}, skipping`);
      return null;
    }
    
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

    // Process odds data - FIXED to handle transformed data structure
    const odds = processOddsData(game, homeTeam, awayTeam, selectedBookmaker);

    // Get venue information
    const venue = getVenueInfo(game.venue, homeTeam);

    // Assign random network for display purposes
    const network = TV_NETWORKS[Math.floor(Math.random() * TV_NETWORKS.length)];

    const processedGame: ProcessedGame = {
      id: game.gameId || game.id || `game_${index}`,
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

    console.log(`✅ Processed game: ${awayTeam} @ ${homeTeam} - ${displayTime} (sport: ${processedGame.sport_key})`);
    return processedGame;
  }).filter(game => game !== null); // Remove any null entries

  console.log(`🔧 Final processed count: ${processedGames.length} games`);
  return processedGames;
}

/**
 * Get team logo with enhanced fallback handling
 */
export function getTeamLogo(teamName: string): string {
  // ESPN Logo mapping - user requested original ESPN logos
  const espnLogos: { [key: string]: string } = {
    // NFL Teams
    'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
    'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
    
    // NBA Teams
    'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',
    
    // MLB Teams
    'Arizona Diamondbacks': 'https://a.espncdn.com/i/teamlogos/mlb/500/ari.png',
    'Atlanta Braves': 'https://a.espncdn.com/i/teamlogos/mlb/500/atl.png',
    'Baltimore Orioles': 'https://a.espncdn.com/i/teamlogos/mlb/500/bal.png',
    'Boston Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Chicago Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Chicago White Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    'Cincinnati Reds': 'https://a.espncdn.com/i/teamlogos/mlb/500/cin.png',
    'Cleveland Guardians': 'https://a.espncdn.com/i/teamlogos/mlb/500/cle.png',
    'Colorado Rockies': 'https://a.espncdn.com/i/teamlogos/mlb/500/col.png',
    'Detroit Tigers': 'https://a.espncdn.com/i/teamlogos/mlb/500/det.png',
    'Houston Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Kansas City Royals': 'https://a.espncdn.com/i/teamlogos/mlb/500/kc.png',
    'Los Angeles Angels': 'https://a.espncdn.com/i/teamlogos/mlb/500/laa.png',
    'Los Angeles Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Miami Marlins': 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png',
    'Milwaukee Brewers': 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png',
    'Minnesota Twins': 'https://a.espncdn.com/i/teamlogos/mlb/500/min.png',
    'New York Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png',
    'New York Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'Oakland Athletics': 'https://a.espncdn.com/i/teamlogos/mlb/500/oak.png',
    'Philadelphia Phillies': 'https://a.espncdn.com/i/teamlogos/mlb/500/phi.png',
    'Pittsburgh Pirates': 'https://a.espncdn.com/i/teamlogos/mlb/500/pit.png',
    'San Diego Padres': 'https://a.espncdn.com/i/teamlogos/mlb/500/sd.png',
    'San Francisco Giants': 'https://a.espncdn.com/i/teamlogos/mlb/500/sf.png',
    'Seattle Mariners': 'https://a.espncdn.com/i/teamlogos/mlb/500/sea.png',
    'St. Louis Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'Tampa Bay Rays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tb.png',
    'Texas Rangers': 'https://a.espncdn.com/i/teamlogos/mlb/500/tex.png',
    'Toronto Blue Jays': 'https://a.espncdn.com/i/teamlogos/mlb/500/tor.png',
    'Washington Nationals': 'https://a.espncdn.com/i/teamlogos/mlb/500/wsh.png'
  };

  // Try to find ESPN logo first
  const espnLogo = espnLogos[teamName];
  if (espnLogo) {
    console.log(`🏈 Using ESPN logo for ${teamName}`);
    return espnLogo;
  }

  // For college football teams, try alternative patterns
  if (teamName.includes('State') || teamName.includes('University') || teamName.includes('Tech')) {
    const cleanName = teamName.toLowerCase()
      .replace(/university|state|tech|college/g, '')
      .trim()
      .replace(/\s+/g, '');
    const collegeLogoUrl = `https://a.espncdn.com/i/teamlogos/college-football/500/${cleanName}.png`;
    console.log(`🏈 Trying college logo pattern for ${teamName}: ${collegeLogoUrl}`);
    // Note: This may still 404, but the fallback SVG will handle it
  }

  // Fallback to enhanced SVG
  const initials = teamName
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  const validInitials = initials.length > 0 ? initials.replace(/[^A-Z0-9]/g, 'T') : 'TEAM';
  const teamColor = getTeamColor(teamName);
  
  console.log(`🏈 Creating SVG fallback for ${teamName} -> ${validInitials} (color: ${teamColor})`);
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${teamColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkenColor(teamColor)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill="url(#grad)" stroke="#374151" stroke-width="2"/>
      <text x="24" y="30" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
        ${validInitials}
      </text>
    </svg>
  `)}`;
}

// Helper function to get team colors
function getTeamColor(teamName: string): string {
  const colors: { [key: string]: string } = {
    'Pittsburgh Steelers': '#FFB612',
    'Cincinnati Bengals': '#FB4F14',
    'Kansas City Chiefs': '#E31837',
    'Buffalo Bills': '#00338D',
    'Dallas Cowboys': '#003594',
    'Philadelphia Eagles': '#004C54',
    'Green Bay Packers': '#203731',
    'Detroit Lions': '#0076B6',
    'Baltimore Ravens': '#241773',
    'Cleveland Browns': '#311D00',
    'Miami Dolphins': '#008E97',
    'New York Jets': '#125740',
    'New England Patriots': '#002244',
    'Los Angeles Lakers': '#552583',
    'Golden State Warriors': '#1D428A',
    'Boston Celtics': '#007A33',
    'Miami Heat': '#98002E',
    'Dallas Mavericks': '#00538C',
    'Denver Nuggets': '#0E2240'
  };
  
  return colors[teamName] || '#1e293b';
}

// Helper function to darken color for gradient
function darkenColor(color: string): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const darker = (val: number) => Math.max(0, Math.floor(val * 0.7));
    
    return `#${darker(r).toString(16).padStart(2, '0')}${darker(g).toString(16).padStart(2, '0')}${darker(b).toString(16).padStart(2, '0')}`;
  }
  return '#0f172a';
}

/**
 * Process game time with proper CST conversion
 */
function processGameTime(gameTime: string | undefined): { displayTime: string; displayDate: string } {
  if (!gameTime) {
    return { displayTime: 'TBD', displayDate: 'TBD' };
  }

  try {
    // Parse the ISO string directly from The Odds API
    const date = new Date(gameTime);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date after parsing');
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

    // Debug logging to check date conversion
    const cstDate = date.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    console.log(`🕰️ Time conversion: ${gameTime} -> ${displayTime} (date: ${cstDate})`);

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
    console.log(`⚠️ No bookmakers data for game: ${awayTeam} @ ${homeTeam}`);
    return null;
  }

  let oddsData = null;

  try {
    if (Array.isArray(game.bookmakers) && game.bookmakers.length > 0) {
      // Raw API format - shouldn't happen with transformed data but keep for compatibility
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
      // Transformed format from realTimeOddsService - this is what we expect
      const bookmakerKey = selectedBookmaker === 'all' 
        ? Object.keys(game.bookmakers)[0] 
        : selectedBookmaker;
      
      const bookmakerData = game.bookmakers[bookmakerKey];
      if (bookmakerData) {
        console.log(`📊 Using ${bookmakerKey} odds for ${awayTeam} @ ${homeTeam}`);
        oddsData = {
          moneyline: bookmakerData.moneyline || { home: null, away: null },
          spread: bookmakerData.spread || { home: null, away: null, line: null },
          total: bookmakerData.total || { over: null, under: null, line: null }
        };
      } else {
        // Fallback to any available bookmaker
        const availableBookmakers = Object.keys(game.bookmakers);
        if (availableBookmakers.length > 0) {
          const fallbackBookmaker = availableBookmakers[0];
          console.log(`🔄 Using fallback bookmaker ${fallbackBookmaker} for ${awayTeam} @ ${homeTeam}`);
          const fallbackData = game.bookmakers[fallbackBookmaker];
          oddsData = {
            moneyline: fallbackData.moneyline || { home: null, away: null },
            spread: fallbackData.spread || { home: null, away: null, line: null },
            total: fallbackData.total || { over: null, under: null, line: null }
          };
        }
      }
    }
  } catch (error) {
    console.warn('Error processing odds data:', error);
  }

  if (!oddsData) {
    console.log(`❌ No valid odds data found for ${awayTeam} @ ${homeTeam}`);
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

// REMOVED ALL MOCK GAMES - ONLY REAL DATA FROM THE ODDS API