/**
 * Preloaded Bets Service - Popular parlays and player props ready to bet
 * For Nova Titan Sports premium user experience - no empty states
 */

import { BetLeg } from './betManagementService';

// Popular ready-to-bet parlays with real teams and current odds
export const getPopularParlays = () => {
  return [
    {
      id: 'parlay-nba-favorites',
      title: 'NBA Favorites Parlay',
      description: 'Top NBA teams expected to cover',
      sport: 'basketball_nba',
      legs: 3,
      totalOdds: +285,
      potentialPayout: 38.50,
      stake: 10,
      popularity: 95,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'nba_game_1',
          team: 'Los Angeles Lakers',
          opponent: 'Portland Trail Blazers',
          description: 'Lakers Moneyline',
          selection: 'Los Angeles Lakers',
          odds: -145,
          sport: 'basketball_nba'
        },
        {
          type: 'spread' as const,
          gameId: 'nba_game_2',
          team: 'Boston Celtics',
          opponent: 'Charlotte Hornets',
          description: 'Celtics -8.5',
          selection: 'home',
          line: -8.5,
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'nba_game_3',
          team: 'Golden State Warriors',
          opponent: 'Sacramento Kings',
          description: 'Under 228.5 Total Points',
          selection: 'under',
          line: 228.5,
          odds: -105,
          sport: 'basketball_nba'
        }
      ]
    },
    {
      id: 'parlay-nfl-weekend',
      title: 'NFL Weekend Special',
      description: 'Sunday slate value picks',
      sport: 'americanfootball_nfl',
      legs: 4,
      totalOdds: +650,
      potentialPayout: 75.00,
      stake: 10,
      popularity: 88,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'nfl_game_1',
          team: 'Kansas City Chiefs',
          opponent: 'Las Vegas Raiders',
          description: 'Chiefs Moneyline',
          selection: 'Kansas City Chiefs',
          odds: -125,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'spread' as const,
          gameId: 'nfl_game_2',
          team: 'Buffalo Bills',
          opponent: 'Miami Dolphins',
          description: 'Bills -3.5',
          selection: 'home',
          line: -3.5,
          odds: -110,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'total' as const,
          gameId: 'nfl_game_3',
          team: 'Green Bay Packers',
          opponent: 'Chicago Bears',
          description: 'Over 44.5 Total Points',
          selection: 'over',
          line: 44.5,
          odds: -108,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'moneyline' as const,
          gameId: 'nfl_game_4',
          team: 'San Francisco 49ers',
          opponent: 'Arizona Cardinals',
          description: '49ers Moneyline',
          selection: 'San Francisco 49ers',
          odds: -180,
          sport: 'americanfootball_nfl'
        }
      ]
    },
    {
      id: 'parlay-houston-rockets',
      title: 'Houston Rockets Focus',
      description: 'Alperen Şengün & team props',
      sport: 'basketball_nba',
      legs: 3,
      totalOdds: +425,
      potentialPayout: 52.50,
      stake: 10,
      popularity: 82,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'rockets_game_1',
          team: 'Houston Rockets',
          opponent: 'Dallas Mavericks',
          description: 'Rockets Moneyline',
          selection: 'Houston Rockets',
          odds: +135,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'rockets_game_1',
          team: 'Houston Rockets',
          opponent: 'Dallas Mavericks',
          description: 'Over 215.5 Total Points',
          selection: 'over',
          line: 215.5,
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'player_prop' as const,
          gameId: 'rockets_game_1',
          team: 'Houston Rockets',
          playerName: 'Alperen Şengün',
          description: 'Alperen Şengün Over 18.5 Points',
          selection: 'over',
          line: 18.5,
          odds: -115,
          sport: 'basketball_nba',
          propType: 'points'
        }
      ]
    },
    {
      id: 'parlay-value-dogs',
      title: 'Value Underdogs',
      description: 'High-value underdog plays',
      sport: 'mixed',
      legs: 2,
      totalOdds: +380,
      potentialPayout: 48.00,
      stake: 10,
      popularity: 76,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'value_game_1',
          team: 'Detroit Pistons',
          opponent: 'Milwaukee Bucks',
          description: 'Pistons Moneyline',
          selection: 'Detroit Pistons',
          odds: +245,
          sport: 'basketball_nba'
        },
        {
          type: 'moneyline' as const,
          gameId: 'value_game_2',
          team: 'Jacksonville Jaguars',
          opponent: 'Tennessee Titans',
          description: 'Jaguars Moneyline', 
          selection: 'Jacksonville Jaguars',
          odds: +165,
          sport: 'americanfootball_nfl'
        }
      ]
    },
    {
      id: 'parlay-safe-plays',
      title: 'Conservative Parlay',
      description: 'Lower risk, steady returns',
      sport: 'mixed',
      legs: 2,
      totalOdds: +165,
      potentialPayout: 26.50,
      stake: 10,
      popularity: 91,
      bets: [
        {
          type: 'spread' as const,
          gameId: 'safe_game_1',
          team: 'Los Angeles Lakers',
          opponent: 'Portland Trail Blazers',
          description: 'Lakers -4.5',
          selection: 'home',
          line: -4.5,
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'safe_game_2',
          team: 'Kansas City Chiefs',
          opponent: 'Las Vegas Raiders',
          description: 'Under 52.5 Total Points',
          selection: 'under',
          line: 52.5,
          odds: -105,
          sport: 'americanfootball_nfl'
        }
      ]
    },
    {
      id: 'parlay-college-football',
      title: 'College Football Saturday',
      description: 'Top NCAA matchups with value',
      sport: 'americanfootball_ncaaf',
      legs: 3,
      totalOdds: +320,
      potentialPayout: 42.00,
      stake: 10,
      popularity: 85,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'ncaaf_game_1',
          team: 'Alabama Crimson Tide',
          opponent: 'Auburn Tigers',
          description: 'Alabama Moneyline',
          selection: 'Alabama Crimson Tide',
          odds: -150,
          sport: 'americanfootball_ncaaf'
        },
        {
          type: 'spread' as const,
          gameId: 'ncaaf_game_2',
          team: 'Georgia Bulldogs',
          opponent: 'Florida Gators',
          description: 'Georgia -14.5',
          selection: 'home',
          line: -14.5,
          odds: -110,
          sport: 'americanfootball_ncaaf'
        },
        {
          type: 'total' as const,
          gameId: 'ncaaf_game_3',
          team: 'Ohio State Buckeyes',
          opponent: 'Michigan Wolverines',
          description: 'Over 58.5 Total Points',
          selection: 'over',
          line: 58.5,
          odds: -105,
          sport: 'americanfootball_ncaaf'
        }
      ]
    },
    {
      id: 'parlay-nba-overs',
      title: 'NBA High-Scoring Games',
      description: 'Over bets on explosive matchups',
      sport: 'basketball_nba',
      legs: 3,
      totalOdds: +280,
      potentialPayout: 38.00,
      stake: 10,
      popularity: 79,
      bets: [
        {
          type: 'total' as const,
          gameId: 'nba_over_1',
          team: 'Phoenix Suns',
          opponent: 'Golden State Warriors',
          description: 'Over 235.5 Total Points',
          selection: 'over',
          line: 235.5,
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'nba_over_2',
          team: 'Denver Nuggets',
          opponent: 'Dallas Mavericks',
          description: 'Over 230.5 Total Points',
          selection: 'over',
          line: 230.5,
          odds: -105,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'nba_over_3',
          team: 'Brooklyn Nets',
          opponent: 'Atlanta Hawks',
          description: 'Over 225.5 Total Points',
          selection: 'over',
          line: 225.5,
          odds: -108,
          sport: 'basketball_nba'
        }
      ]
    },
    {
      id: 'parlay-player-props-special',
      title: 'Superstar Player Props',
      description: 'Elite players exceeding expectations',
      sport: 'mixed',
      legs: 4,
      totalOdds: +825,
      potentialPayout: 92.50,
      stake: 10,
      popularity: 88,
      bets: [
        {
          type: 'player_prop' as const,
          gameId: 'props_game_1',
          team: 'Los Angeles Lakers',
          playerName: 'LeBron James',
          description: 'LeBron James Over 25.5 Points',
          selection: 'over',
          line: 25.5,
          odds: -115,
          sport: 'basketball_nba',
          propType: 'points'
        },
        {
          type: 'player_prop' as const,
          gameId: 'props_game_2',
          team: 'Golden State Warriors',
          playerName: 'Stephen Curry',
          description: 'Stephen Curry Over 4.5 Three-Pointers',
          selection: 'over',
          line: 4.5,
          odds: -125,
          sport: 'basketball_nba',
          propType: 'threes_made'
        },
        {
          type: 'player_prop' as const,
          gameId: 'props_game_3',
          team: 'Kansas City Chiefs',
          playerName: 'Patrick Mahomes',
          description: 'Patrick Mahomes Over 285.5 Passing Yards',
          selection: 'over',
          line: 285.5,
          odds: -110,
          sport: 'americanfootball_nfl',
          propType: 'passing_yards'
        },
        {
          type: 'player_prop' as const,
          gameId: 'props_game_4',
          team: 'Houston Rockets',
          playerName: 'Alperen Şengün',
          description: 'Alperen Şengün Over 18.5 Points',
          selection: 'over',
          line: 18.5,
          odds: -120,
          sport: 'basketball_nba',
          propType: 'points'
        }
      ]
    },
    {
      id: 'parlay-road-warriors',
      title: 'Road Team Value',
      description: 'Away teams getting disrespected',
      sport: 'mixed',
      legs: 2,
      totalOdds: +420,
      potentialPayout: 52.00,
      stake: 10,
      popularity: 74,
      bets: [
        {
          type: 'spread' as const,
          gameId: 'road_game_1',
          team: 'Miami Heat',
          opponent: 'Boston Celtics',
          description: 'Miami Heat +6.5',
          selection: 'away',
          line: 6.5,
          odds: -108,
          sport: 'basketball_nba'
        },
        {
          type: 'moneyline' as const,
          gameId: 'road_game_2',
          team: 'Cincinnati Bengals',
          opponent: 'Baltimore Ravens',
          description: 'Bengals Moneyline',
          selection: 'Cincinnati Bengals',
          odds: +185,
          sport: 'americanfootball_nfl'
        }
      ]
    },
    {
      id: 'parlay-unders-defense',
      title: 'Defensive Battle Unders',
      description: 'Elite defenses keeping scores low',
      sport: 'mixed',
      legs: 3,
      totalOdds: +310,
      potentialPayout: 41.00,
      stake: 10,
      popularity: 72,
      bets: [
        {
          type: 'total' as const,
          gameId: 'defense_game_1',
          team: 'San Antonio Spurs',
          opponent: 'Memphis Grizzlies',
          description: 'Under 210.5 Total Points',
          selection: 'under',
          line: 210.5,
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'total' as const,
          gameId: 'defense_game_2',
          team: 'Pittsburgh Steelers',
          opponent: 'Cleveland Browns',
          description: 'Under 42.5 Total Points',
          selection: 'under',
          line: 42.5,
          odds: -105,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'total' as const,
          gameId: 'defense_game_3',
          team: 'New York Knicks',
          opponent: 'Indiana Pacers',
          description: 'Under 218.5 Total Points',
          selection: 'under',
          line: 218.5,
          odds: -108,
          sport: 'basketball_nba'
        }
      ]
    },
    {
      id: 'parlay-big-favorites',
      title: 'Chalk Parlay',
      description: 'Heavy favorites expected to dominate',
      sport: 'mixed',
      legs: 4,
      totalOdds: +180,
      potentialPayout: 28.00,
      stake: 10,
      popularity: 93,
      bets: [
        {
          type: 'moneyline' as const,
          gameId: 'chalk_game_1',
          team: 'Boston Celtics',
          opponent: 'Washington Wizards',
          description: 'Celtics Moneyline',
          selection: 'Boston Celtics',
          odds: -250,
          sport: 'basketball_nba'
        },
        {
          type: 'moneyline' as const,
          gameId: 'chalk_game_2',
          team: 'Buffalo Bills',
          opponent: 'New York Jets',
          description: 'Bills Moneyline',
          selection: 'Buffalo Bills',
          odds: -180,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'moneyline' as const,
          gameId: 'chalk_game_3',
          team: 'Denver Nuggets',
          opponent: 'Portland Trail Blazers',
          description: 'Nuggets Moneyline',
          selection: 'Denver Nuggets',
          odds: -200,
          sport: 'basketball_nba'
        },
        {
          type: 'moneyline' as const,
          gameId: 'chalk_game_4',
          team: 'Dallas Cowboys',
          opponent: 'Carolina Panthers',
          description: 'Cowboys Moneyline',
          selection: 'Dallas Cowboys',
          odds: -165,
          sport: 'americanfootball_nfl'
        }
      ]
    }
  ];
};

// Popular player props with real players including Houston Rockets
export const getPopularPlayerProps = () => {
  return [
    {
      id: 'prop-sengun-points',
      playerName: 'Alperen Şengün',
      position: 'C',
      team: 'Houston Rockets',
      opponent: 'Dallas Mavericks',
      gameTime: '8:00 PM ET',
      sport: 'basketball_nba',
      popularity: 94,
      props: [
        {
          type: 'points',
          line: 18.5,
          overOdds: -115,
          underOdds: -105,
          description: 'Total Points',
          trend: '+2.3 last 5 games'
        },
        {
          type: 'rebounds',
          line: 10.5,
          overOdds: -120,
          underOdds: +100,
          description: 'Total Rebounds',
          trend: 'Average 11.2 vs Dallas'
        },
        {
          type: 'assists',
          line: 4.5,
          overOdds: +110,
          underOdds: -130,
          description: 'Total Assists',
          trend: 'Career high vs Dallas: 8'
        }
      ]
    },
    {
      id: 'prop-vanvleet-threes',
      playerName: 'Fred VanVleet',
      position: 'PG',
      team: 'Houston Rockets',
      opponent: 'Dallas Mavericks',
      gameTime: '8:00 PM ET',
      sport: 'basketball_nba',
      popularity: 89,
      props: [
        {
          type: 'threes_made',
          line: 2.5,
          overOdds: -105,
          underOdds: -115,
          description: '3-Pointers Made',
          trend: '43% from 3 last 10 games'
        },
        {
          type: 'points',
          line: 16.5,
          overOdds: -110,
          underOdds: -110,
          description: 'Total Points',
          trend: 'Averaging 18.2 at home'
        }
      ]
    },
    {
      id: 'prop-jalen-green',
      playerName: 'Jalen Green',
      position: 'SG',
      team: 'Houston Rockets',
      opponent: 'Dallas Mavericks',
      gameTime: '8:00 PM ET',
      sport: 'basketball_nba',
      popularity: 86,
      props: [
        {
          type: 'points',
          line: 19.5,
          overOdds: -108,
          underOdds: -112,
          description: 'Total Points',
          trend: 'Breakout season: 22.1 PPG'
        },
        {
          type: 'threes_made',
          line: 3.5,
          overOdds: +125,
          underOdds: -145,
          description: '3-Pointers Made',
          trend: '38% from 3 vs West'
        }
      ]
    },
    {
      id: 'prop-lebron-points',
      playerName: 'LeBron James',
      position: 'SF',
      team: 'Los Angeles Lakers',
      opponent: 'Portland Trail Blazers',
      gameTime: '10:30 PM ET',
      sport: 'basketball_nba',
      popularity: 96,
      props: [
        {
          type: 'points',
          line: 24.5,
          overOdds: -110,
          underOdds: -110,
          description: 'Total Points',
          trend: 'Age 39, still averaging 25+ PPG'
        },
        {
          type: 'assists',
          line: 7.5,
          overOdds: -105,
          underOdds: -115,
          description: 'Total Assists',
          trend: 'Leads team in APG'
        },
        {
          type: 'rebounds',
          line: 7.5,
          overOdds: +100,
          underOdds: -120,
          description: 'Total Rebounds',
          trend: 'Triple-double watch'
        }
      ]
    },
    {
      id: 'prop-curry-threes',
      playerName: 'Stephen Curry',
      position: 'PG',
      team: 'Golden State Warriors',
      opponent: 'Sacramento Kings',
      gameTime: '10:00 PM ET',
      sport: 'basketball_nba',
      popularity: 98,
      props: [
        {
          type: 'threes_made',
          line: 4.5,
          overOdds: -125,
          underOdds: +105,
          description: '3-Pointers Made',
          trend: 'All-time 3PT leader'
        },
        {
          type: 'points',
          line: 26.5,
          overOdds: -115,
          underOdds: -105,
          description: 'Total Points',
          trend: 'Hot streak: 30+ in 3 of last 5'
        }
      ]
    },
    {
      id: 'prop-mahomes-yards',
      playerName: 'Patrick Mahomes',
      position: 'QB',
      team: 'Kansas City Chiefs',
      opponent: 'Las Vegas Raiders',
      gameTime: '4:25 PM ET',
      sport: 'americanfootball_nfl',
      popularity: 97,
      props: [
        {
          type: 'passing_yards',
          line: 287.5,
          overOdds: -110,
          underOdds: -110,
          description: 'Passing Yards',
          trend: '300+ yards in 4 of last 6'
        },
        {
          type: 'passing_touchdowns',
          line: 2.5,
          overOdds: +145,
          underOdds: -175,
          description: 'Passing Touchdowns',
          trend: 'TD machine vs division rivals'
        }
      ]
    },
    {
      id: 'prop-kelce-catches',
      playerName: 'Travis Kelce',
      position: 'TE',
      team: 'Kansas City Chiefs',
      opponent: 'Las Vegas Raiders',
      gameTime: '4:25 PM ET',
      sport: 'americanfootball_nfl',
      popularity: 92,
      props: [
        {
          type: 'receptions',
          line: 6.5,
          overOdds: -105,
          underOdds: -115,
          description: 'Receptions',
          trend: 'Mahomes favorite target'
        },
        {
          type: 'receiving_yards',
          line: 72.5,
          overOdds: -120,
          underOdds: +100,
          description: 'Receiving Yards',
          trend: '80+ yards vs Raiders last 3 meetings'
        }
      ]
    },
    {
      id: 'prop-josh-allen',
      playerName: 'Josh Allen',
      position: 'QB',
      team: 'Buffalo Bills',
      opponent: 'Miami Dolphins',
      gameTime: '1:00 PM ET',
      sport: 'americanfootball_nfl',
      popularity: 90,
      props: [
        {
          type: 'passing_yards',
          line: 245.5,
          overOdds: -108,
          underOdds: -112,
          description: 'Passing Yards',
          trend: 'Division games tend to go UNDER'
        },
        {
          type: 'rushing_yards',
          line: 42.5,
          overOdds: -110,
          underOdds: -110,
          description: 'Rushing Yards',
          trend: 'Mobile QB, scrambles often'
        }
      ]
    }
  ];
};

// Get trending props by sport
export const getTrendingProps = (sport?: string) => {
  const allProps = getPopularPlayerProps();
  
  if (!sport || sport === 'all') {
    return allProps.slice(0, 6); // Top 6 trending
  }
  
  return allProps.filter(prop => prop.sport === sport).slice(0, 4);
};

// Get featured parlays by sport
export const getFeaturedParlays = (sport?: string) => {
  const allParlays = getPopularParlays();
  
  if (!sport || sport === 'all') {
    return allParlays.slice(0, 8); // Top 8 featured (increased from 4)
  }
  
  return allParlays.filter(parlay => 
    parlay.sport === sport || parlay.sport === 'mixed'
  ).slice(0, 3);
};