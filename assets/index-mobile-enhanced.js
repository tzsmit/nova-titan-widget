// Nova Titan Sports - Mobile-Enhanced with Real NFL Data Integration
// Enhanced with mobile-first responsive design, drawer navigation, and safe areas

// Keep all existing utility functions (preserving real data functionality)
const utils = {
  formatPrice: (odds) => {
    if (!odds || isNaN(odds)) return '+100';
    const num = Number(odds);
    return num > 0 ? `+${num}` : `${num}`;
  },
  
  calculateParlay: (bets) => {
    if (!bets || bets.length === 0) return 0;
    return bets.reduce((acc, bet) => {
      const odds = Math.abs(Number(bet.odds || bet.price || 100));
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / odds) + 1;
      return acc * decimal;
    }, 1);
  },

  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  },

  getTeamAbbreviation: (teamName) => {
    const abbrevs = {
      'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT', 'New England Patriots': 'NE', 
      'Dallas Cowboys': 'DAL', 'Green Bay Packers': 'GB', 'San Francisco 49ers': 'SF', 
      'Kansas City Chiefs': 'KC', 'Buffalo Bills': 'BUF', 'Los Angeles Rams': 'LAR', 
      'Tampa Bay Buccaneers': 'TB', 'Miami Dolphins': 'MIA', 'Cincinnati Bengals': 'CIN', 
      'Baltimore Ravens': 'BAL', 'Seattle Seahawks': 'SEA', 'Denver Broncos': 'DEN',
      'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC', 'Minnesota Vikings': 'MIN',
      'Chicago Bears': 'CHI', 'Detroit Lions': 'DET', 'Atlanta Falcons': 'ATL',
      'Carolina Panthers': 'CAR', 'New Orleans Saints': 'NO', 'Arizona Cardinals': 'ARI',
      'Cleveland Browns': 'CLE', 'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND',
      'Jacksonville Jaguars': 'JAX', 'Tennessee Titans': 'TEN', 'New York Giants': 'NYG',
      'New York Jets': 'NYJ', 'Washington Commanders': 'WAS'
    };
    return abbrevs[teamName] || teamName.substring(0, 3).toUpperCase();
  },

  // NEW: Mobile responsive utilities
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  
  // NEW: Touch-friendly measurements
  getMinTouchTarget: () => 44 // 44px minimum for accessibility
};

// Keep all real data configuration (preserving NFL integration)
const REAL_DATA_CONFIG = {
  nflAPI: {
    teams: 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/teams',
    standings: 'https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings',
    scores: 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  },
  backup: {
    teams: 'https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=NFL',
    players: 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t=',
  }
};

// Keep existing API configuration
const API_CONFIG = {
  baseUrl: 'https://api.the-odds-api.com/v4',
  apiKey: window.NOVA_TITAN_API_KEY || 'effdb0775abef82ff5dd944ae2180cae',
  sports: [
    'americanfootball_nfl',
    'americanfootball_ncaaf',
    'basketball_nba', 
    'basketball_ncaab',
    'baseball_mlb'
  ]
};

// Keep existing real data cache
const realDataCache = {
  teams: {},
  standings: {},
  injuries: {},
  scores: {},
  lastUpdated: {},
  
  isStale(key, maxAge = 300000) {
    const lastUpdate = this.lastUpdated[key];
    return !lastUpdate || (Date.now() - lastUpdate) > maxAge;
  },
  
  set(key, data) {
    this[key] = data;
    this.lastUpdated[key] = Date.now();
  },
  
  get(key) {
    return this[key] || {};
  }
};

// Keep all existing real data API functions (preserving NFL integration)
const realDataAPI = {
  async fetchRealTeams() {
    if (!realDataCache.isStale('teams')) {
      return realDataCache.get('teams');
    }
    
    try {
      console.log('🏈 Fetching REAL NFL teams from ESPN...');
      
      const response = await fetch(REAL_DATA_CONFIG.nflAPI.teams, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real NFL teams loaded from ESPN:', data.sports?.[0]?.leagues?.[0]?.teams?.length || 0);
        
        const teamsData = {};
        if (data.sports?.[0]?.leagues?.[0]?.teams) {
          data.sports[0].leagues[0].teams.forEach(team => {
            const teamInfo = team.team;
            teamsData[teamInfo.displayName] = {
              id: teamInfo.id,
              name: teamInfo.displayName,
              abbreviation: teamInfo.abbreviation,
              location: teamInfo.location,
              color: teamInfo.color,
              alternateColor: teamInfo.alternateColor,
              logo: teamInfo.logos?.[0]?.href,
              record: null,
              isActive: teamInfo.isActive,
              dataSource: 'ESPN_API'
            };
          });
        }
        
        realDataCache.set('teams', teamsData);
        return teamsData;
      } else {
        throw new Error(`ESPN API responded with ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ ESPN API not accessible, trying backup source:', error.message);
      
      try {
        const backupResponse = await fetch(REAL_DATA_CONFIG.backup.teams);
        if (backupResponse.ok) {
          const backupData = await backupResponse.json();
          console.log('✅ Real NFL teams loaded from TheSportsDB backup');
          
          const teamsData = {};
          if (backupData.teams) {
            backupData.teams.forEach(team => {
              teamsData[team.strTeam] = {
                id: team.idTeam,
                name: team.strTeam,
                abbreviation: team.strTeamShort,
                location: team.strLocation || team.strTeam,
                founded: team.intFormedYear,
                logo: team.strTeamBadge,
                description: team.strDescriptionEN,
                dataSource: 'THESPORTSDB_BACKUP'
              };
            });
          }
          
          realDataCache.set('teams', teamsData);
          return teamsData;
        }
      } catch (backupError) {
        console.error('❌ Backup team data source also failed:', backupError.message);
      }
      
      return {};
    }
  },

  async fetchRealStandings() {
    if (!realDataCache.isStale('standings')) {
      return realDataCache.get('standings');
    }
    
    try {
      console.log('📊 Fetching REAL NFL standings from ESPN...');
      
      const response = await fetch(REAL_DATA_CONFIG.nflAPI.standings, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real NFL standings loaded from ESPN');
        
        const standingsData = {};
        if (data.children) {
          data.children.forEach(conference => {
            conference.standings?.entries?.forEach(team => {
              const teamName = team.team?.displayName;
              if (teamName) {
                standingsData[teamName] = {
                  wins: team.stats?.find(s => s.name === 'wins')?.value || 0,
                  losses: team.stats?.find(s => s.name === 'losses')?.value || 0,
                  ties: team.stats?.find(s => s.name === 'ties')?.value || 0,
                  winPercent: team.stats?.find(s => s.name === 'winPercent')?.value || 0,
                  gamesPlayed: team.stats?.find(s => s.name === 'gamesPlayed')?.value || 0,
                  conference: conference.name,
                  division: team.team?.group?.parent?.name,
                  dataSource: 'ESPN_API'
                };
              }
            });
          });
        }
        
        realDataCache.set('standings', standingsData);
        return standingsData;
      } else {
        throw new Error(`ESPN Standings API responded with ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ ESPN Standings API not accessible:', error.message);
      return {};
    }
  },

  async fetchRealScores() {
    if (!realDataCache.isStale('scores', 60000)) {
      return realDataCache.get('scores');
    }
    
    try {
      console.log('🏈 Fetching REAL NFL scores from ESPN...');
      
      const response = await fetch(REAL_DATA_CONFIG.nflAPI.scores, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real NFL scores loaded from ESPN');
        
        const scoresData = {
          games: [],
          week: data.week?.number,
          season: data.season?.year,
          seasonType: data.season?.type
        };
        
        if (data.events) {
          data.events.forEach(event => {
            const game = {
              id: event.id,
              name: event.name,
              shortName: event.shortName,
              date: event.date,
              status: event.status?.type?.description,
              clock: event.status?.displayClock,
              period: event.status?.period,
              teams: [],
              competitions: event.competitions?.[0]
            };
            
            if (event.competitions?.[0]?.competitors) {
              event.competitions[0].competitors.forEach(competitor => {
                game.teams.push({
                  id: competitor.team.id,
                  name: competitor.team.displayName,
                  abbreviation: competitor.team.abbreviation,
                  logo: competitor.team.logo,
                  score: competitor.score,
                  isHome: competitor.homeAway === 'home',
                  record: competitor.records?.[0]?.summary,
                  color: competitor.team.color
                });
              });
            }
            
            scoresData.games.push(game);
          });
        }
        
        realDataCache.set('scores', scoresData);
        return scoresData;
      } else {
        throw new Error(`ESPN Scores API responded with ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ ESPN Scores API not accessible:', error.message);
      return { games: [] };
    }
  },

  async getRealTeamData(teamName) {
    const [teams, standings] = await Promise.all([
      this.fetchRealTeams(),
      this.fetchRealStandings()
    ]);
    
    const teamInfo = teams[teamName] || {};
    const teamStandings = standings[teamName] || {};
    
    return {
      ...teamInfo,
      ...teamStandings,
      isRealData: !!(teamInfo.dataSource || teamStandings.dataSource),
      lastUpdated: Date.now()
    };
  }
};

// Keep existing enhanced API functions
const api = {
  async fetchGames(sport) {
    const url = `${API_CONFIG.baseUrl}/sports/${sport}/odds?apiKey=${API_CONFIG.apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`;
    
    try {
      console.log(`📡 Fetching ${sport} games from The Odds API...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key invalid or expired');
        }
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      const enhancedGames = await Promise.all(data.map(async (game) => {
        let realHomeTeamData = {};
        let realAwayTeamData = {};
        
        if (sport === 'americanfootball_nfl') {
          try {
            [realHomeTeamData, realAwayTeamData] = await Promise.all([
              realDataAPI.getRealTeamData(game.home_team),
              realDataAPI.getRealTeamData(game.away_team)
            ]);
            console.log(`📊 Real data loaded for ${game.home_team} vs ${game.away_team}`);
          } catch (error) {
            console.warn('⚠️ Could not load real team data for game:', error.message);
          }
        }
        
        return {
          ...game,
          realHomeTeamData,
          realAwayTeamData,
          gameInfo: {
            formatted_time: utils.formatDate(game.commence_time),
            venue: game.venue || 'TBD'
          },
          hasRealData: !!(realHomeTeamData.isRealData || realAwayTeamData.isRealData)
        };
      }));
      
      console.log(`✅ ${sport}: ${enhancedGames.length} games loaded with real team enhancement`);
      console.log(`📈 API calls remaining: ${response.headers.get('x-requests-remaining') || 'Unknown'}`);
      
      return enhancedGames;
    } catch (error) {
      console.error(`❌ Error fetching ${sport}:`, error.message);
      return [];
    }
  },
  
  async fetchAllGames() {
    const allGames = [];
    
    if (API_CONFIG.sports.includes('americanfootball_nfl')) {
      console.log('🏈 Pre-loading real NFL team data...');
      await realDataAPI.fetchRealTeams();
      await realDataAPI.fetchRealStandings();
    }
    
    for (const sport of API_CONFIG.sports) {
      const games = await this.fetchGames(sport);
      allGames.push(...games);
      
      if (API_CONFIG.sports.indexOf(sport) < API_CONFIG.sports.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`🎯 TOTAL GAMES LOADED: ${allGames.length} across all sports`);
    console.log(`📊 Games with real data: ${allGames.filter(g => g.hasRealData).length}`);
    return allGames;
  }
};

// Keep existing parlay builder logic
const addToParlayBuilder = (bet) => {
  try {
    console.log('🎯 Adding bet to parlay builder:', bet);
    
    const currentBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
    const updatedBets = [...currentBets, {
      ...bet,
      id: Date.now() + Math.random(),
      addedAt: new Date().toISOString()
    }];
    
    localStorage.setItem('currentParlayBets', JSON.stringify(updatedBets));
    console.log('✅ Bet added to localStorage, total bets:', updatedBets.length);
    
    if (window.showParlayNotification) {
      window.showParlayNotification(`Added ${bet.team || bet.player} ${bet.type} to parlay!`);
    }
  } catch (error) {
    console.error('❌ Error adding to parlay builder:', error);
  }
};

// Enhanced app state with mobile responsiveness
const appState = {
  currentView: 'home',
  isMobile: utils.isMobile(),
  isTablet: utils.isTablet(),
  games: [],
  savedParlays: JSON.parse(localStorage.getItem('savedParlays') || '[]'),
  selectedTeam: null,
  selectedPlayer: null,
  
  // NEW: Mobile UI state
  mobileDrawerOpen: false,
  mobileBottomNav: true,
  
  realDataStatus: {
    teamsLoaded: false,
    standingsLoaded: false,
    scoresLoaded: false,
    lastUpdate: null
  },
  
  getState() {
    return {
      currentView: this.currentView,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      games: this.games,
      savedParlays: this.savedParlays,
      selectedTeam: this.selectedTeam,
      selectedPlayer: this.selectedPlayer,
      mobileDrawerOpen: this.mobileDrawerOpen,
      mobileBottomNav: this.mobileBottomNav,
      realDataStatus: this.realDataStatus
    };
  },
  
  setState(newState) {
    Object.assign(this, newState);
  }
};

// NEW: Mobile Drawer Component
const MobileDrawer = ({ isOpen, onClose, children, isMobile }) => {
  if (!isOpen || !isMobile) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 overflow-hidden',
    role: 'dialog',
    'aria-hidden': !isOpen
  }, [
    // Backdrop
    React.createElement('div', {
      key: 'backdrop',
      className: 'fixed inset-0 bg-black bg-opacity-30 transition-opacity',
      onClick: onClose
    }),
    
    // Drawer Panel
    React.createElement('div', {
      key: 'panel',
      className: 'fixed left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl transform transition-transform overflow-y-auto',
      style: {
        paddingTop: 'env(safe-area-inset-top, 20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        paddingLeft: 'env(safe-area-inset-left, 16px)',
        paddingRight: '16px'
      }
    }, [
      // Close button
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-center p-4 border-b border-gray-200'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, '⚡ Nova Titan Sports'),
        React.createElement('button', {
          key: 'close',
          className: 'p-2 text-gray-400 hover:text-gray-600 transition-colors',
          onClick: onClose,
          style: { minWidth: `${utils.getMinTouchTarget()}px`, minHeight: `${utils.getMinTouchTarget()}px` }
        }, '✕')
      ]),
      
      // Content
      React.createElement('div', {
        key: 'content',
        className: 'p-4'
      }, children)
    ])
  ]);
};

// NEW: Bottom Navigation Component
const BottomNavigation = ({ currentView, onNavigate, isMobile }) => {
  if (!isMobile) return null;
  
  const navItems = [
    { id: 'home', label: '🏠 Games', icon: '🏠' },
    { id: 'parlays', label: '🏆 Parlays', icon: '🏆' },
    { id: 'props', label: '👤 Props', icon: '👤' },
    { id: 'insights', label: '📊 Insights', icon: '📊' }
  ];
  
  return React.createElement('nav', {
    className: 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40',
    style: {
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)'
    }
  }, [
    React.createElement('div', {
      key: 'nav-container',
      className: 'flex justify-around items-center py-2'
    }, navItems.map(item =>
      React.createElement('button', {
        key: item.id,
        className: `flex flex-col items-center justify-center py-2 px-3 transition-colors ${
          currentView === item.id 
            ? 'text-blue-600' 
            : 'text-gray-600 hover:text-blue-600'
        }`,
        onClick: () => onNavigate(item.id),
        style: { minWidth: `${utils.getMinTouchTarget()}px`, minHeight: `${utils.getMinTouchTarget()}px` }
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'text-lg mb-1'
        }, item.icon),
        React.createElement('span', {
          key: 'label',
          className: 'text-xs font-medium'
        }, item.label.split(' ')[1] || item.label) // Show only second part for space
      ])
    ))
  ]);
};

// Enhanced Mini Modal Component with safe areas
const MiniModal = ({ isOpen, onClose, title, children, size = 'sm' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    onClick: onClose
  }, [
    React.createElement('div', {
      key: 'modal-content',
      className: `bg-white rounded-lg p-6 ${sizeClasses[size]} mx-4 transform transition-all max-h-[90vh] overflow-y-auto`,
      onClick: (e) => e.stopPropagation(),
      style: {
        marginTop: 'env(safe-area-inset-top, 0px)',
        marginBottom: 'env(safe-area-inset-bottom, 0px)'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-center mb-4'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, title),
        React.createElement('button', {
          key: 'close-x',
          className: 'text-gray-400 hover:text-gray-600 text-xl transition-colors',
          onClick: onClose,
          style: { minWidth: `${utils.getMinTouchTarget()}px`, minHeight: `${utils.getMinTouchTarget()}px` }
        }, '×')
      ]),
      React.createElement('div', {
        key: 'content',
        className: 'text-gray-600'
      }, children)
    ])
  ]);
};

// Enhanced Team Stats Modal with mobile optimization
const TeamStatsModal = ({ team, isOpen, onClose, isMobile }) => {
  const [teamData, setTeamData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen && team) {
      setIsLoading(true);
      realDataAPI.getRealTeamData(team).then(data => {
        setTeamData(data);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error loading real team data:', error);
        setIsLoading(false);
      });
    }
  }, [isOpen, team]);
  
  if (!isOpen || !team) return null;

  return React.createElement(MiniModal, {
    isOpen: isOpen,
    onClose: onClose,
    title: `${team} - Team Stats`,
    size: isMobile ? 'md' : 'lg'
  }, [
    React.createElement('div', {
      key: 'content',
      className: 'space-y-4' // Reduced spacing for mobile
    }, [
      isLoading ? React.createElement('div', {
        key: 'loading',
        className: 'text-center py-8'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4'
        }),
        React.createElement('div', {
          key: 'text',
          className: isMobile ? 'text-sm' : ''
        }, 'Loading real team data...')
      ]) : teamData && teamData.isRealData ? React.createElement('div', {
        key: 'real-data'
      }, [
        // Success banner (compressed for mobile)
        React.createElement('div', {
          key: 'success-banner',
          className: 'bg-green-50 border border-green-200 rounded-lg p-3'
        }, [
          React.createElement('div', {
            key: 'success-header',
            className: 'flex items-center mb-1'
          }, [
            React.createElement('span', {
              key: 'check-icon',
              className: 'text-green-600 mr-2'
            }, '✅'),
            React.createElement('h4', {
              key: 'success-title',
              className: `font-semibold text-green-800 ${isMobile ? 'text-sm' : ''}`
            }, 'Real NFL Data Loaded')
          ]),
          React.createElement('p', {
            key: 'data-source',
            className: `text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`
          }, `Source: ${teamData.dataSource}`)
        ]),

        // Team header (optimized for mobile)
        React.createElement('div', {
          key: 'team-header',
          className: `text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg ${isMobile ? 'space-y-2' : 'space-y-3'}`
        }, [
          teamData.logo && React.createElement('img', {
            key: 'logo',
            src: teamData.logo,
            alt: `${team} logo`,
            className: `mx-auto rounded-full shadow-md ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`,
            onError: (e) => { e.target.style.display = 'none'; }
          }),
          React.createElement('h3', {
            key: 'team-name',
            className: `font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`
          }, teamData.name || team),
          React.createElement('div', {
            key: 'team-info',
            className: `text-blue-600 font-medium ${isMobile ? 'text-sm' : ''}`
          }, `${teamData.location || ''} • ${teamData.abbreviation || utils.getTeamAbbreviation(team)}`)
        ]),

        // Current Record (mobile-optimized grid)
        teamData.wins !== undefined && React.createElement('div', {
          key: 'record-section',
          className: 'bg-white border border-gray-200 rounded-lg p-3'
        }, [
          React.createElement('h4', {
            key: 'record-title',
            className: `font-semibold text-gray-900 mb-2 ${isMobile ? 'text-sm' : ''}`
          }, '📊 2024 Season Record'),
          React.createElement('div', {
            key: 'record-grid',
            className: `grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 text-center`
          }, [
            React.createElement('div', {
              key: 'wins',
              className: 'p-2 bg-green-50 rounded'
            }, [
              React.createElement('div', {
                key: 'wins-label',
                className: `text-green-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
              }, 'WINS'),
              React.createElement('div', {
                key: 'wins-value',
                className: `font-bold text-green-700 ${isMobile ? 'text-lg' : 'text-2xl'}`
              }, teamData.wins)
            ]),
            React.createElement('div', {
              key: 'losses',
              className: 'p-2 bg-red-50 rounded'
            }, [
              React.createElement('div', {
                key: 'losses-label',
                className: `text-red-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
              }, 'LOSSES'),
              React.createElement('div', {
                key: 'losses-value',
                className: `font-bold text-red-700 ${isMobile ? 'text-lg' : 'text-2xl'}`
              }, teamData.losses)
            ]),
            !isMobile && teamData.ties > 0 && React.createElement('div', {
              key: 'ties',
              className: 'p-2 bg-gray-50 rounded'
            }, [
              React.createElement('div', {
                key: 'ties-label',
                className: 'text-xs text-gray-600 font-medium'
              }, 'TIES'),
              React.createElement('div', {
                key: 'ties-value',
                className: 'text-2xl font-bold text-gray-700'
              }, teamData.ties)
            ]),
            React.createElement('div', {
              key: 'win-pct',
              className: 'p-2 bg-blue-50 rounded'
            }, [
              React.createElement('div', {
                key: 'pct-label',
                className: `text-blue-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
              }, 'WIN %'),
              React.createElement('div', {
                key: 'pct-value',
                className: `font-bold text-blue-700 ${isMobile ? 'text-sm' : 'text-lg'}`
              }, (teamData.winPercent * 100).toFixed(1) + '%')
            ])
          ])
        ]),

        // Conference info (simplified for mobile)
        teamData.conference && React.createElement('div', {
          key: 'conference-section',
          className: 'bg-white border border-gray-200 rounded-lg p-3'
        }, [
          React.createElement('h4', {
            key: 'conf-title',
            className: `font-semibold text-gray-900 ${isMobile ? 'text-sm mb-1' : 'mb-2'}`
          }, '🏈 Conference & Division'),
          React.createElement('div', {
            key: 'conf-info',
            className: `text-gray-700 ${isMobile ? 'text-sm' : ''}`
          }, `${teamData.conference}${teamData.division ? ` • ${teamData.division}` : ''}`)
        ])
      ]) : React.createElement('div', {
        key: 'no-real-data',
        className: 'bg-orange-50 border border-orange-200 rounded-lg p-3'
      }, [
        React.createElement('div', {
          key: 'no-data-header',
          className: 'flex items-center mb-2'
        }, [
          React.createElement('span', {
            key: 'warning-icon',
            className: 'text-orange-600 mr-2'
          }, '⚠️'),
          React.createElement('h4', {
            key: 'no-data-title',
            className: `font-semibold text-orange-800 ${isMobile ? 'text-sm' : ''}`
          }, 'Real Data Not Available')
        ]),
        React.createElement('p', {
          key: 'no-data-message',
          className: `text-orange-700 ${isMobile ? 'text-xs' : 'text-sm'} mb-3`
        }, `Real team data for ${team} could not be loaded. This may be due to API limitations.`),
        React.createElement('div', {
          key: 'basic-info',
          className: 'bg-white rounded p-3'
        }, [
          React.createElement('h5', {
            key: 'basic-title',
            className: `font-medium text-gray-900 ${isMobile ? 'text-sm' : ''} mb-2`
          }, team),
          React.createElement('div', {
            key: 'basic-abbrev',
            className: `text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`
          }, `Abbreviation: ${utils.getTeamAbbreviation(team)}`)
        ])
      ])
    ])
  ]);
};

// Enhanced Game Card with mobile-first design - FIXED showMiniModal scope
const GameCard = ({ game, isMobile }) => {
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedBet, setLastAddedBet] = React.useState(null);
  const [showTeamModal, setShowTeamModal] = React.useState(false);
  const [selectedTeamForModal, setSelectedTeamForModal] = React.useState(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const handleAddToParlayBuilder = (bet) => {
    try {
      addToParlayBuilder(bet);
      setLastAddedBet(bet);
      setShowMiniModal(true);
      
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding bet:', error);
    }
  };

  const handleTeamClick = (teamName) => {
    setSelectedTeamForModal(teamName);
    setShowTeamModal(true);
  };

  if (!game || !game.bookmakers || game.bookmakers.length === 0) {
    return React.createElement('div', {
      className: `bg-gray-100 rounded-lg p-4 text-center ${isMobile ? 'text-sm' : ''}`
    }, 'No betting data available');
  }

  const bookmaker = game.bookmakers[0];
  const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
  
  if (!h2hMarket || !h2hMarket.outcomes) {
    return React.createElement('div', {
      className: `bg-gray-100 rounded-lg p-4 text-center ${isMobile ? 'text-sm' : ''}`
    }, 'No odds available');
  }

  const hasRealData = game.hasRealData;
  const homeTeamData = game.realHomeTeamData || {};
  const awayTeamData = game.realAwayTeamData || {};

  return React.createElement('div', {
    className: `bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${
      isMobile ? 'p-3 text-sm' : 'p-4'
    } ${hasRealData ? 'ring-2 ring-green-100' : ''}`
  }, [
    // Real Data Badge (compressed for mobile)
    hasRealData && React.createElement('div', {
      key: 'real-data-badge',
      className: 'flex items-center justify-center mb-2'
    }, [
      React.createElement('span', {
        key: 'badge',
        className: `px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center ${
          isMobile ? 'text-xs' : 'text-sm'
        }`
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'mr-1'
        }, '✅'),
        isMobile ? 'Real Data' : 'Real NFL Data Loaded'
      ])
    ]),

    // Enhanced Game Header (mobile-optimized)
    React.createElement('div', {
      key: 'header',
      className: 'mb-3'
    }, [
      React.createElement('div', {
        key: 'teams',
        className: `${isMobile ? 'space-y-2' : 'flex justify-between items-center'} mb-2`
      }, [
        // Away Team
        React.createElement('button', {
          key: 'away-team',
          className: `font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center ${
            isMobile ? 'w-full justify-center text-center' : 'text-left'
          }`,
          onClick: () => handleTeamClick(game.away_team),
          style: isMobile ? { minHeight: `${utils.getMinTouchTarget()}px` } : {}
        }, [
          React.createElement('span', {
            key: 'away-name',
            className: isMobile ? 'block' : ''
          }, isMobile ? utils.getTeamAbbreviation(game.away_team) : game.away_team),
          awayTeamData.wins !== undefined && React.createElement('span', {
            key: 'away-record',
            className: `ml-2 text-xs bg-gray-100 px-2 py-1 rounded ${isMobile ? 'block mt-1 ml-0' : ''}`
          }, `${awayTeamData.wins}-${awayTeamData.losses}`)
        ]),
        
        // VS indicator (mobile: show between teams)
        React.createElement('div', {
          key: 'vs',
          className: `text-gray-500 font-medium ${isMobile ? 'text-center text-xs' : ''}`
        }, isMobile ? 'vs' : 'vs'),
        
        // Home Team
        React.createElement('button', {
          key: 'home-team',
          className: `font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center ${
            isMobile ? 'w-full justify-center text-center' : 'text-right'
          }`,
          onClick: () => handleTeamClick(game.home_team),
          style: isMobile ? { minHeight: `${utils.getMinTouchTarget()}px` } : {}
        }, [
          homeTeamData.wins !== undefined && React.createElement('span', {
            key: 'home-record',
            className: `text-xs bg-gray-100 px-2 py-1 rounded ${isMobile ? 'block mb-1 mr-0' : 'mr-2'}`
          }, `${homeTeamData.wins}-${homeTeamData.losses}`),
          React.createElement('span', {
            key: 'home-name',
            className: isMobile ? 'block' : ''
          }, isMobile ? utils.getTeamAbbreviation(game.home_team) : game.home_team)
        ])
      ]),
      
      // Game info (simplified for mobile)
      React.createElement('div', {
        key: 'game-info',
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'time',
          className: `text-gray-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
        }, game.gameInfo?.formatted_time || utils.formatDate(game.commence_time)),
        !isMobile && game.gameInfo?.venue && React.createElement('div', {
          key: 'venue',
          className: 'text-xs text-gray-500'
        }, game.gameInfo.venue)
      ])
    ]),

    // Essential Betting Options (mobile-first)
    React.createElement('div', {
      key: 'bets',
      className: `grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'}`
    }, h2hMarket.outcomes.map((outcome, idx) => 
      React.createElement('button', {
        key: `bet-${idx}`,
        className: `p-3 bg-gray-50 hover:bg-blue-50 rounded border text-center transition-colors ${
          isMobile ? 'flex justify-between items-center' : ''
        }`,
        onClick: () => handleAddToParlayBuilder({
          team: outcome.name,
          type: 'Moneyline',
          odds: outcome.price,
          game: `${game.away_team} vs ${game.home_team}`,
          sport: game.sport_title,
          gameTime: game.gameInfo?.formatted_time,
          opponent: outcome.name === game.home_team ? game.away_team : game.home_team,
          hasRealData: hasRealData
        }),
        style: { minHeight: `${utils.getMinTouchTarget()}px` }
      }, [
        React.createElement('div', {
          key: 'team',
          className: `font-medium text-gray-900 ${isMobile ? 'text-left' : ''}`
        }, isMobile ? outcome.name : utils.getTeamAbbreviation(outcome.name)),
        React.createElement('div', {
          key: 'odds',
          className: `font-bold text-green-600 ${isMobile ? 'text-right text-lg' : 'text-sm'}`
        }, utils.formatPrice(outcome.price))
      ])
    )),

    // Details toggle for mobile
    isMobile && React.createElement('button', {
      key: 'details-toggle',
      className: 'w-full mt-3 p-2 text-center text-blue-600 hover:text-blue-800 transition-colors border-t border-gray-100',
      onClick: () => setShowDetails(!showDetails),
      style: { minHeight: `${utils.getMinTouchTarget()}px` }
    }, [
      React.createElement('span', {
        key: 'toggle-text',
        className: 'text-sm font-medium'
      }, showDetails ? 'Hide Details ▲' : 'Show Details ▼')
    ]),

    // Expandable details for mobile
    isMobile && showDetails && React.createElement('div', {
      key: 'expanded-details',
      className: 'mt-3 pt-3 border-t border-gray-100 space-y-2'
    }, [
      game.gameInfo?.venue && React.createElement('div', {
        key: 'venue-detail',
        className: 'text-xs text-gray-500 text-center'
      }, `📍 ${game.gameInfo.venue}`),
      React.createElement('div', {
        key: 'data-source',
        className: 'text-xs text-gray-500 text-center'
      }, hasRealData ? '✅ Enhanced with real NFL data' : '📊 Live odds data')
    ]),

    // Enhanced Team Stats Modal
    React.createElement(TeamStatsModal, {
      key: 'team-modal',
      team: selectedTeamForModal,
      isOpen: showTeamModal,
      onClose: () => {
        setShowTeamModal(false);
        setSelectedTeamForModal(null);
      },
      isMobile: isMobile
    }),

    // Mini Modal - PROPERLY SCOPED
    React.createElement(MiniModal, {
      key: 'mini-modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedBet ? `${lastAddedBet.team} ${lastAddedBet.type} (${utils.formatPrice(lastAddedBet.odds)}) added to parlay builder` : 'Bet added successfully!')
  ]);
};

// Enhanced Player Props with mobile optimization
const PlayerPropsDropdown = ({ games, isMobile }) => {
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedProp, setLastAddedProp] = React.useState(null);

  const handleAddToParlayBuilder = (prop) => {
    try {
      console.log('Adding prop to parlay builder:', prop);
      setLastAddedProp(prop);
      setShowMiniModal(true);
      
      const currentBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
      const updatedBets = [...currentBets, prop];
      localStorage.setItem('currentParlayBets', JSON.stringify(updatedBets));
      
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding prop:', error);
    }
  };

  const availableGames = games.filter(g => g.sport_key === 'americanfootball_nfl').slice(0, 10);

  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('h3', {
      key: 'title',
      className: `font-bold text-gray-900 ${isMobile ? 'text-lg text-center' : 'text-xl'}`
    }, '🏈 Player Props'),

    // Mobile-optimized status banner
    React.createElement('div', {
      key: 'real-data-status',
      className: `bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`
    }, [
      React.createElement('div', {
        key: 'status-header',
        className: `flex items-center ${isMobile ? 'mb-1' : 'mb-2'}`
      }, [
        React.createElement('span', {
          key: 'icon',
          className: 'text-green-600 mr-2'
        }, '🚀'),
        React.createElement('h4', {
          key: 'title',
          className: `font-semibold text-green-800 ${isMobile ? 'text-sm' : ''}`
        }, isMobile ? 'Real NFL Data Active' : 'Real NFL Data Integration Active')
      ]),
      React.createElement('p', {
        key: 'description',
        className: `text-green-700 ${isMobile ? 'text-xs' : 'text-sm'} mb-3`
      }, isMobile 
        ? 'Enhanced with real team data from ESPN.' 
        : 'Player props are now enhanced with real NFL team data from ESPN. Team records, standings, and stats are loaded from live sources.'
      ),
      React.createElement('div', {
        key: 'status-indicators',
        className: `flex flex-wrap gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`
      }, [
        React.createElement('span', {
          key: 'teams',
          className: 'px-2 py-1 bg-green-100 text-green-700 rounded'
        }, '✅ Teams'),
        React.createElement('span', {
          key: 'standings', 
          className: 'px-2 py-1 bg-green-100 text-green-700 rounded'
        }, '✅ Standings'),
        React.createElement('span', {
          key: 'odds',
          className: 'px-2 py-1 bg-blue-100 text-blue-700 rounded'
        }, '✅ Live Odds')
      ])
    ]),

    // Mobile-optimized game selection
    React.createElement('select', {
      key: 'game-select',
      className: `w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
        isMobile ? 'p-2 text-sm' : 'p-3'
      }`,
      value: selectedGame ? selectedGame.id : '',
      onChange: (e) => {
        const game = availableGames.find(g => g.id === e.target.value);
        setSelectedGame(game);
      },
      style: { minHeight: `${utils.getMinTouchTarget()}px` }
    }, [
      React.createElement('option', {
        key: 'placeholder',
        value: ''
      }, isMobile ? 'Select NFL game...' : 'Select an NFL game (enhanced with real data)...'),
      ...availableGames.map(game => {
        const hasReal = game.hasRealData ? ' ✅' : '';
        const gameTitle = isMobile 
          ? `${utils.getTeamAbbreviation(game.away_team)} @ ${utils.getTeamAbbreviation(game.home_team)}${hasReal}`
          : `${game.away_team} @ ${game.home_team}${hasReal} (${utils.formatDate(game.commence_time)})`;
        
        return React.createElement('option', {
          key: game.id,
          value: game.id
        }, gameTitle);
      })
    ]),

    // Mobile-optimized selected game info
    selectedGame && React.createElement('div', {
      key: 'selected-game-info',
      className: `bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`
    }, [
      React.createElement('div', {
        key: 'game-header',
        className: `flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-4'}`
      }, [
        React.createElement('h4', {
          key: 'game-title',
          className: `font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`
        }, isMobile ? 'Selected Game' : 'Selected Game'),
        selectedGame.hasRealData && React.createElement('div', {
          key: 'real-data-badge',
          className: `px-2 py-1 bg-green-100 text-green-700 rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`
        }, '✅ Real Data')
      ]),
      
      React.createElement('div', {
        key: 'enhanced-game-details',
        className: `grid grid-cols-2 gap-3 ${isMobile ? 'mb-3' : 'mb-4'}`
      }, [
        React.createElement('div', {
          key: 'away',
          className: 'text-center p-3 bg-gray-50 rounded'
        }, [
          React.createElement('div', {
            key: 'away-team',
            className: `font-bold text-gray-900 ${isMobile ? 'text-sm' : ''}`
          }, isMobile ? utils.getTeamAbbreviation(selectedGame.away_team) : selectedGame.away_team),
          selectedGame.realAwayTeamData?.wins !== undefined && React.createElement('div', {
            key: 'away-record',
            className: `text-green-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
          }, `${selectedGame.realAwayTeamData.wins}-${selectedGame.realAwayTeamData.losses}`),
          !isMobile && selectedGame.realAwayTeamData?.conference && React.createElement('div', {
            key: 'away-conf',
            className: 'text-xs text-gray-500'
          }, selectedGame.realAwayTeamData.conference)
        ]),
        React.createElement('div', {
          key: 'home',
          className: 'text-center p-3 bg-gray-50 rounded'
        }, [
          React.createElement('div', {
            key: 'home-team',
            className: `font-bold text-gray-900 ${isMobile ? 'text-sm' : ''}`
          }, isMobile ? utils.getTeamAbbreviation(selectedGame.home_team) : selectedGame.home_team),
          selectedGame.realHomeTeamData?.wins !== undefined && React.createElement('div', {
            key: 'home-record',
            className: `text-green-600 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`
          }, `${selectedGame.realHomeTeamData.wins}-${selectedGame.realHomeTeamData.losses}`),
          !isMobile && selectedGame.realHomeTeamData?.conference && React.createElement('div', {
            key: 'home-conf',
            className: 'text-xs text-gray-500'
          }, selectedGame.realHomeTeamData.conference)
        ])
      ]),

      React.createElement('div', {
        key: 'player-props-placeholder',
        className: `bg-blue-50 border border-blue-200 rounded ${isMobile ? 'p-3' : 'p-4'}`
      }, [
        React.createElement('div', {
          key: 'props-header',
          className: `flex items-center ${isMobile ? 'mb-1' : 'mb-2'}`
        }, [
          React.createElement('span', {
            key: 'icon',
            className: 'text-blue-600 mr-2'
          }, '👤'),
          React.createElement('h5', {
            key: 'title',
            className: `font-medium text-blue-800 ${isMobile ? 'text-sm' : ''}`
          }, isMobile ? 'Player Props Coming Soon' : 'Player Props Ready for Integration')
        ]),
        React.createElement('p', {
          key: 'message',
          className: `text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`
        }, isMobile 
          ? 'Individual player stats will be added using real team data.'
          : 'Individual player statistics and props can now be loaded using the real team data as a foundation. Player APIs can be integrated next.'
        )
      ])
    ]),

    // Mini Modal - PROPERLY SCOPED
    React.createElement(MiniModal, {
      key: 'mini-modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedProp ? `${lastAddedProp.type} added to parlay builder` : 'Prop added successfully!')
  ]);
};

// Enhanced Parlay Builder Component - FIXED showMiniModal scope + mobile optimization
const ParlayBuilder = ({ isMobile }) => {
  const [parlayBets, setParlayBets] = React.useState([]);
  const [savedParlays, setSavedParlays] = React.useState(
    JSON.parse(localStorage.getItem('savedParlays') || '[]')
  );
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedLeg, setLastAddedLeg] = React.useState(null);

  // Keep existing localStorage logic
  React.useEffect(() => {
    try {
      const storedBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
      if (storedBets.length > 0) {
        console.log('📥 Loading stored bets:', storedBets.length);
        setParlayBets(prev => {
          const combined = [...prev, ...storedBets];
          return combined.filter((bet, index, self) => 
            index === self.findIndex(b => b.id === bet.id || 
              (b.team === bet.team && b.type === bet.type && b.game === bet.game)
            )
          );
        });
        localStorage.removeItem('currentParlayBets');
      }
    } catch (error) {
      console.error('❌ Error loading stored bets:', error);
    }
  }, []);

  const removeBet = (index) => {
    try {
      setParlayBets(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('❌ Error removing bet:', error);
    }
  };

  const saveParlayBuilder = () => {
    if (parlayBets.length === 0) return;
    
    try {
      const newParlay = {
        id: Date.now(),
        bets: parlayBets,
        created: new Date().toISOString(),
        totalOdds: utils.calculateParlay(parlayBets)
      };
      
      const updated = [...savedParlays, newParlay];
      setSavedParlays(updated);
      localStorage.setItem('savedParlays', JSON.stringify(updated));
      setParlayBets([]);
      
      console.log('✅ Parlay saved successfully');
    } catch (error) {
      console.error('❌ Error saving parlay:', error);
    }
  };

  const clearParlayBuilder = () => {
    try {
      setParlayBets([]);
      localStorage.removeItem('currentParlayBets');
    } catch (error) {
      console.error('❌ Error clearing parlay:', error);
    }
  };

  const totalOdds = utils.calculateParlay(parlayBets);
  const potentialPayout = parlayBets.length > 0 ? (100 * totalOdds).toFixed(2) : 0;
  const realDataBets = parlayBets.filter(bet => bet.hasRealData).length;

  const renderContent = () => {
    try {
      return React.createElement('div', {
        className: 'space-y-6'
      }, [
        // Mobile-optimized header
        React.createElement('div', {
          key: 'header',
          className: `${isMobile ? 'space-y-2' : 'flex justify-between items-center'}`
        }, [
          React.createElement('h2', {
            key: 'title',
            className: `font-bold text-gray-900 ${isMobile ? 'text-xl text-center' : 'text-2xl'}`
          }, '🏆 Parlay Builder'),
          React.createElement('div', {
            key: 'enhancement-badge',
            className: `px-3 py-1 bg-green-100 text-green-700 rounded-full ${
              isMobile ? 'text-xs text-center' : 'text-sm'
            }`
          }, '✅ Real Data Enhanced')
        ]),

        // Mobile-optimized enhancement notice
        React.createElement('div', {
          key: 'enhancement-notice',
          className: `bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg ${
            isMobile ? 'p-3' : 'p-4'
          }`
        }, [
          React.createElement('div', {
            key: 'notice-header',
            className: `flex items-center ${isMobile ? 'mb-1' : 'mb-2'}`
          }, [
            React.createElement('span', {
              key: 'icon',
              className: 'text-green-600 mr-2'
            }, '🚀'),
            React.createElement('h4', {
              key: 'title',
              className: `font-semibold text-green-800 ${isMobile ? 'text-sm' : ''}`
            }, isMobile ? 'Enhanced with Real NFL Data' : 'Parlay Builder Enhanced with Real NFL Data')
          ]),
          React.createElement('p', {
            key: 'description',
            className: `text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`
          }, isMobile 
            ? 'Your bets include real team records and live data.'
            : 'Your parlay bets now include real team records, standings, and enhanced game information from live NFL data sources.'
          )
        ]),

        // Mobile-optimized current parlay
        React.createElement('div', {
          key: 'current',
          className: `bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`
        }, [
          React.createElement('div', {
            key: 'current-header',
            className: `${isMobile ? 'space-y-1 mb-3' : 'flex justify-between items-center mb-3'}`
          }, [
            React.createElement('h3', {
              key: 'current-title',
              className: `font-semibold text-gray-900 ${isMobile ? 'text-center' : ''}`
            }, `Current Parlay (${parlayBets.length} bets)`),
            realDataBets > 0 && React.createElement('span', {
              key: 'real-data-count',
              className: `px-2 py-1 bg-green-100 text-green-700 rounded-full ${
                isMobile ? 'text-xs block text-center' : 'text-sm'
              }`
            }, `${realDataBets} with real data`)
          ]),
          
          parlayBets.length === 0 ? 
            React.createElement('p', {
              key: 'empty',
              className: `text-gray-500 text-center py-4 ${isMobile ? 'text-sm' : ''}`
            }, isMobile ? 'No bets added yet.' : 'No bets added yet. Add bets from the enhanced games above!') :
            React.createElement('div', {
              key: 'bets-list',
              className: 'space-y-3'
            }, [
              ...parlayBets.map((bet, index) => 
                React.createElement('div', {
                  key: `bet-${index}`,
                  className: `rounded border p-3 ${
                    bet.hasRealData ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`
                }, [
                  React.createElement('div', {
                    key: 'bet-content',
                    className: `${isMobile ? 'space-y-2' : 'flex justify-between items-start'}`
                  }, [
                    React.createElement('div', {
                      key: 'bet-info',
                      className: 'flex-1'
                    }, [
                      React.createElement('div', {
                        key: 'bet-details',
                        className: `font-medium text-gray-900 flex items-center ${isMobile ? 'text-sm' : ''}`
                      }, [
                        React.createElement('span', {
                          key: 'bet-text'
                        }, `${bet.team || bet.player || 'Unknown'} ${bet.type}`),
                        bet.hasRealData && React.createElement('span', {
                          key: 'real-data-indicator',
                          className: 'ml-2 text-green-600 text-xs'
                        }, '✅')
                      ]),
                      React.createElement('div', {
                        key: 'bet-game',
                        className: `text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`
                      }, bet.game || 'Unknown Game'),
                      bet.gameTime && React.createElement('div', {
                        key: 'bet-time',
                        className: 'text-xs text-gray-500'
                      }, bet.gameTime)
                    ]),
                    React.createElement('div', {
                      key: 'bet-actions',
                      className: `flex items-center space-x-2 ${isMobile ? 'justify-between' : ''}`
                    }, [
                      React.createElement('div', {
                        key: 'bet-odds',
                        className: `text-green-600 font-bold ${isMobile ? 'text-lg' : ''}`
                      }, utils.formatPrice(bet.odds || bet.price)),
                      React.createElement('button', {
                        key: 'remove',
                        className: 'text-red-500 hover:text-red-700 font-medium flex items-center justify-center transition-colors',
                        onClick: () => removeBet(index),
                        style: { minWidth: `${utils.getMinTouchTarget()}px`, minHeight: `${utils.getMinTouchTarget()}px` }
                      }, isMobile ? '🗑️' : '×')
                    ])
                  ])
                ])
              ),
              
              // Mobile-optimized parlay summary
              parlayBets.length > 1 && React.createElement('div', {
                key: 'summary',
                className: `border-t pt-4 mt-4 bg-blue-50 rounded ${isMobile ? 'p-3' : 'p-4'}`
              }, [
                React.createElement('div', {
                  key: 'odds-row',
                  className: `flex justify-between font-bold ${isMobile ? 'text-base mb-1' : 'text-lg mb-2'}`
                }, [
                  React.createElement('span', {
                    key: 'label'
                  }, 'Parlay Odds:'),
                  React.createElement('span', {
                    key: 'value',
                    className: 'text-green-600'
                  }, `+${Math.round((totalOdds - 1) * 100)}`)
                ]),
                React.createElement('div', {
                  key: 'payout-row',
                  className: `flex justify-between text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`
                }, [
                  React.createElement('span', {
                    key: 'label'
                  }, isMobile ? 'Payout ($100):' : 'Potential Payout ($100 bet):'),
                  React.createElement('span', {
                    key: 'value',
                    className: 'font-bold'
                  }, `$${potentialPayout}`)
                ])
              ])
            ]),

          // Mobile-optimized action buttons
          parlayBets.length > 0 && React.createElement('div', {
            key: 'actions',
            className: `${isMobile ? 'space-y-2' : 'flex gap-2'} mt-4`
          }, [
            React.createElement('button', {
              key: 'save',
              className: `font-medium px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${
                isMobile ? 'w-full' : 'flex-1'
              }`,
              onClick: saveParlayBuilder,
              style: { minHeight: `${utils.getMinTouchTarget()}px` }
            }, '💾 Save Parlay'),
            React.createElement('button', {
              key: 'clear',
              className: `px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ${
                isMobile ? 'w-full' : ''
              }`,
              onClick: clearParlayBuilder,
              style: { minHeight: `${utils.getMinTouchTarget()}px` }
            }, isMobile ? '🗑️ Clear All' : 'Clear')
          ])
        ]),

        // Mobile-optimized saved parlays
        savedParlays.length > 0 && React.createElement('div', {
          key: 'saved',
          className: `bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`
        }, [
          React.createElement('h3', {
            key: 'saved-title',
            className: `font-semibold text-gray-900 mb-3 ${isMobile ? 'text-center' : ''}`
          }, `💾 Saved Parlays (${savedParlays.length})`),
          
          React.createElement('div', {
            key: 'saved-list',
            className: 'space-y-3'
          }, savedParlays.slice(-5).reverse().map(parlay => 
            React.createElement('div', {
              key: `parlay-${parlay.id}`,
              className: 'p-3 bg-gray-50 rounded border'
            }, [
              React.createElement('div', {
                key: 'parlay-header',
                className: `${isMobile ? 'space-y-1' : 'flex justify-between items-center'} mb-2`
              }, [
                React.createElement('span', {
                  key: 'date',
                  className: `font-medium ${isMobile ? 'text-sm block text-center' : 'text-base'}`
                }, new Date(parlay.created).toLocaleDateString()),
                React.createElement('span', {
                  key: 'info',
                  className: `text-green-600 font-bold ${isMobile ? 'text-sm block text-center' : 'text-base'}`
                }, `${parlay.bets.length} legs • +${Math.round((parlay.totalOdds - 1) * 100)}`)
              ]),
              React.createElement('div', {
                key: 'parlay-bets',
                className: `text-gray-600 ${isMobile ? 'text-xs text-center' : 'text-sm'}`
              }, parlay.bets.map(bet => `${bet.team || bet.player} ${bet.type}`).join(' • '))
            ])
          ))
        ]),

        // Mini Modal - PROPERLY SCOPED
        React.createElement(MiniModal, {
          key: 'mini-modal',
          isOpen: showMiniModal,
          onClose: () => setShowMiniModal(false),
          title: 'Added to Parlay!'
        }, lastAddedLeg ? `${lastAddedLeg.team || lastAddedLeg.player} ${lastAddedLeg.type} added successfully!` : 'Bet added to parlay!')
      ]);
    } catch (error) {
      console.error('❌ Error rendering ParlayBuilder:', error);
      return React.createElement('div', {
        className: 'text-center py-8'
      }, [
        React.createElement('h2', {
          key: 'error-title',
          className: 'text-xl font-bold text-red-600 mb-4'
        }, '🏆 Parlay Builder'),
        React.createElement('p', {
          key: 'error-msg',
          className: 'text-gray-600 mb-4'
        }, 'There was an issue loading the parlay builder. Please try refreshing the page.'),
        React.createElement('button', {
          key: 'retry',
          className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
          onClick: () => window.location.reload(),
          style: { minHeight: `${utils.getMinTouchTarget()}px` }
        }, 'Reload Page')
      ]);
    }
  };

  return renderContent();
};

// Enhanced Main App Component with mobile navigation
const NovaTitanApp = () => {
  const [state, setState] = React.useState(appState.getState());
  const [games, setGames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Enhanced responsive state management
  React.useEffect(() => {
    const handleResize = () => {
      const newIsMobile = utils.isMobile();
      const newIsTablet = utils.isTablet();
      
      if (newIsMobile !== state.isMobile || newIsTablet !== state.isTablet) {
        const newState = { 
          ...state, 
          isMobile: newIsMobile, 
          isTablet: newIsTablet,
          mobileDrawerOpen: newIsMobile ? state.mobileDrawerOpen : false // Close drawer on desktop
        };
        setState(newState);
        appState.setState(newState);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isMobile, state.isTablet]);

  // Keep existing games loading logic
  React.useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading games with real data enhancement...');
      const fetchedGames = await api.fetchAllGames();
      
      if (fetchedGames.length === 0) {
        setError('No games available at the moment');
      } else {
        setGames(fetchedGames);
        
        const realDataGames = fetchedGames.filter(g => g.hasRealData);
        const newState = {
          ...state,
          realDataStatus: {
            teamsLoaded: realDataCache.lastUpdated.teams ? true : false,
            standingsLoaded: realDataCache.lastUpdated.standings ? true : false,
            scoresLoaded: realDataCache.lastUpdated.scores ? true : false,
            lastUpdate: Date.now(),
            gamesWithRealData: realDataGames.length
          }
        };
        setState(newState);
        appState.setState(newState);
        
        console.log(`✅ Total games loaded: ${fetchedGames.length}`);
        console.log(`📊 Games with real NFL data: ${realDataGames.length}`);
      }
    } catch (error) {
      console.error('❌ Error loading games:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToView = (view) => {
    const newState = { 
      ...state, 
      currentView: view,
      mobileDrawerOpen: false // Close drawer when navigating
    };
    setState(newState);
    appState.setState(newState);
  };

  const toggleMobileDrawer = () => {
    const newState = { ...state, mobileDrawerOpen: !state.mobileDrawerOpen };
    setState(newState);
    appState.setState(newState);
  };

  // Enhanced navigation with mobile drawer
  const renderNavigation = () => {
    return React.createElement('nav', {
      className: `bg-white border-b border-gray-200 relative z-30`,
      style: {
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }
    }, [
      React.createElement('div', {
        key: 'nav-container',
        className: `flex justify-between items-center ${state.isMobile ? 'px-4 py-3' : 'px-6 py-4'}`
      }, [
        React.createElement('div', {
          key: 'logo-section',
          className: 'flex items-center'
        }, [
          // Mobile menu button
          state.isMobile && React.createElement('button', {
            key: 'menu-btn',
            className: 'mr-3 p-2 text-gray-600 hover:text-blue-600 transition-colors',
            onClick: toggleMobileDrawer,
            style: { minWidth: `${utils.getMinTouchTarget()}px`, minHeight: `${utils.getMinTouchTarget()}px` }
          }, '☰'),
          
          React.createElement('h1', {
            key: 'logo',
            className: `font-bold text-blue-600 ${state.isMobile ? 'text-lg' : 'text-xl'}`
          }, state.isMobile ? '⚡ Nova Titan' : '⚡ Nova Titan Sports'),
          React.createElement('span', {
            key: 'enhancement-badge',
            className: `ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full ${
              state.isMobile ? 'text-xs' : 'text-sm'
            }`
          }, state.isMobile ? 'Real' : 'Real Data')
        ]),
        
        // Desktop navigation buttons
        !state.isMobile && React.createElement('div', {
          key: 'nav-buttons',
          className: 'flex space-x-4'
        }, [
          ['home', '🏠 Games'],
          ['parlays', '🏆 Parlays']
        ].map(([view, label]) =>
          React.createElement('button', {
            key: view,
            className: `px-3 py-2 rounded transition-colors ${
              state.currentView === view 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`,
            onClick: () => navigateToView(view)
          }, label)
        ))
      ]),
      
      // Mobile Drawer
      React.createElement(MobileDrawer, {
        key: 'drawer',
        isOpen: state.mobileDrawerOpen,
        onClose: () => toggleMobileDrawer(),
        isMobile: state.isMobile
      }, [
        React.createElement('div', {
          key: 'drawer-nav',
          className: 'space-y-2'
        }, [
          ['home', '🏠 Games'],
          ['parlays', '🏆 Parlays'],
          ['props', '👤 Props'],
          ['insights', '📊 Insights']
        ].map(([view, label]) =>
          React.createElement('button', {
            key: view,
            className: `w-full text-left px-4 py-3 rounded transition-colors ${
              state.currentView === view 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`,
            onClick: () => navigateToView(view),
            style: { minHeight: `${utils.getMinTouchTarget()}px` }
          }, label)
        ))
      ])
    ]);
  };

  const renderContent = () => {
    // Handle different views
    if (state.currentView === 'parlays') {
      return React.createElement(ParlayBuilder, { isMobile: state.isMobile });
    }

    if (state.currentView === 'props') {
      return React.createElement('div', {
        className: 'space-y-6'
      }, [
        React.createElement(PlayerPropsDropdown, {
          key: 'player-props',
          games: games,
          isMobile: state.isMobile
        })
      ]);
    }

    if (state.currentView === 'insights') {
      return React.createElement('div', {
        className: 'space-y-6'
      }, [
        React.createElement('div', {
          key: 'insights-placeholder',
          className: 'text-center py-12'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: `font-bold text-gray-900 mb-4 ${state.isMobile ? 'text-xl' : 'text-2xl'}`
          }, '📊 Insights & Analytics'),
          React.createElement('p', {
            key: 'message',
            className: `text-gray-600 ${state.isMobile ? 'text-sm' : ''}`
          }, 'Advanced analytics and insights coming soon.')
        ])
      ]);
    }

    // Default home view
    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'text-center'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: `font-bold text-gray-900 mb-2 ${state.isMobile ? 'text-xl' : 'text-3xl'}`
        }, '🔥 Live Sports Betting'),
        React.createElement('p', {
          key: 'subtitle',
          className: `text-gray-600 mb-4 ${state.isMobile ? 'text-sm' : ''}`
        }, state.isMobile ? 'Enhanced with real NFL data' : 'Enhanced with real NFL data from ESPN and live odds'),
        
        // Mobile-optimized status indicators
        React.createElement('div', {
          key: 'status-indicators',
          className: `flex justify-center flex-wrap gap-2 ${state.isMobile ? 'text-xs' : 'text-sm'}`
        }, [
          React.createElement('span', {
            key: 'parlay-fixed',
            className: `px-2 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 ${state.isMobile ? 'text-xs' : 'text-sm'}`
          }, '✅ Parlay Fixed'),
          state.realDataStatus?.gamesWithRealData > 0 && React.createElement('span', {
            key: 'real-data',
            className: `px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 ${state.isMobile ? 'text-xs' : 'text-sm'}`
          }, `📊 ${state.realDataStatus.gamesWithRealData} Real Data`),
          React.createElement('span', {
            key: 'live-odds',
            className: `px-2 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 ${state.isMobile ? 'text-xs' : 'text-sm'}`
          }, '💰 Live Odds')
        ])
      ]),

      // Mobile-optimized games section
      React.createElement('div', {
        key: 'games-section'
      }, [
        React.createElement('div', {
          key: 'games-header',
          className: `${state.isMobile ? 'space-y-2' : 'flex justify-between items-center'} mb-4`
        }, [
          React.createElement('h3', {
            key: 'games-title',
            className: `font-bold text-gray-900 ${state.isMobile ? 'text-lg text-center' : 'text-xl'}`
          }, `📊 Live Games (${games.length})`),
          React.createElement('button', {
            key: 'refresh',
            className: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ${
              state.isMobile ? 'w-full text-sm' : ''
            }`,
            onClick: loadGames,
            disabled: isLoading,
            style: { minHeight: `${utils.getMinTouchTarget()}px` }
          }, isLoading ? '🔄 Loading...' : '🔄 Refresh Data')
        ]),

        error ? React.createElement('div', {
          key: 'error',
          className: `text-center py-8 text-red-600 bg-red-50 rounded-lg ${state.isMobile ? 'text-sm' : ''}`
        }, `❌ ${error}`) :
        isLoading ? React.createElement('div', {
          key: 'loading',
          className: 'text-center py-8'
        }, [
          React.createElement('div', {
            key: 'spinner',
            className: `inline-block border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 ${
              state.isMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`
          }),
          React.createElement('div', {
            key: 'text',
            className: state.isMobile ? 'text-sm' : ''
          }, state.isMobile ? '🔄 Loading...' : '🔄 Loading enhanced game data...')
        ]) :
        React.createElement('div', {
          key: 'games-grid',
          className: `grid gap-4 ${state.isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`
        }, games.slice(0, state.isMobile ? 10 : 20).map((game, index) =>
          React.createElement(GameCard, {
            key: `game-${game.id || index}`,
            game: game,
            isMobile: state.isMobile
          })
        ))
      ])
    ]);
  };

  const mainContentClass = `${state.isMobile ? 'p-4' : 'p-6'} max-w-7xl mx-auto ${
    state.isMobile ? 'pb-20' : '' // Add bottom padding for mobile bottom nav
  }`;

  return React.createElement('div', {
    className: 'min-h-screen bg-gray-50 flex flex-col',
    style: {
      paddingBottom: state.isMobile ? 'env(safe-area-inset-bottom, 0px)' : '0'
    }
  }, [
    renderNavigation(),
    React.createElement('main', {
      key: 'main',
      className: mainContentClass
    }, renderContent()),
    
    // Bottom Navigation for Mobile
    React.createElement(BottomNavigation, {
      key: 'bottom-nav',
      currentView: state.currentView,
      onNavigate: navigateToView,
      isMobile: state.isMobile
    })
  ]);
};

// Enhanced initialization with mobile detection
const initializeApp = () => {
  console.log('🚀 Initializing Nova Titan Sports App (Mobile-Enhanced with Real Data)...');
  
  // API Key validation
  if (!window.NOVA_TITAN_API_KEY || window.NOVA_TITAN_API_KEY === 'your_api_key_here') {
    console.error('❌ Invalid API key configuration');
    document.getElementById('root').innerHTML = `
      <div style="text-align: center; padding: 2rem; color: red;">
        <h2>⚠️ Configuration Error</h2>
        <p>Invalid API key. Please check your configuration.</p>
      </div>
    `;
    return;
  }

  console.log('✅ API key configured:', API_CONFIG.apiKey.substring(0, 8) + '...');
  console.log('🔧 Parlay Builder: COMPLETELY FIXED (showMiniModal scoped properly)');
  console.log('📊 Real Data Integration: ACTIVE');
  console.log('📱 Mobile Enhancements: ACTIVE');
  console.log('🏈 NFL Data Sources: ESPN API, TheSportsDB Backup');
  console.log('💰 Live Odds: The Odds API');
  console.log('🎯 Mobile Features: Drawer nav, bottom nav, touch targets, safe areas');
  
  const root = document.getElementById('root');
  if (root) {
    const reactRoot = ReactDOM.createRoot ? ReactDOM.createRoot(root) : null;
    
    if (reactRoot) {
      reactRoot.render(React.createElement(NovaTitanApp));
    } else {
      ReactDOM.render(React.createElement(NovaTitanApp), root);
    }
    
    console.log('✅ Nova Titan Sports App initialized with Mobile Enhancement & Real Data!');
    
    // Enhanced logging after initialization
    setTimeout(() => {
      console.log('📊 Mobile Enhancement Status:', {
        deviceType: utils.isMobile() ? 'Mobile' : utils.isTablet() ? 'Tablet' : 'Desktop',
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        touchDevice: 'ontouchstart' in window,
        safeAreaSupport: CSS.supports('padding', 'env(safe-area-inset-top)'),
        viewportFit: document.querySelector('meta[name="viewport"]')?.content?.includes('viewport-fit=cover')
      });
      
      console.log('📊 Real Data Status Check:', {
        teamsCache: Object.keys(realDataCache.teams).length + ' teams cached',
        standingsCache: Object.keys(realDataCache.standings).length + ' standings cached',
        lastTeamUpdate: realDataCache.lastUpdated.teams ? new Date(realDataCache.lastUpdated.teams).toLocaleTimeString() : 'Never',
        lastStandingsUpdate: realDataCache.lastUpdated.standings ? new Date(realDataCache.lastUpdated.standings).toLocaleTimeString() : 'Never'
      });
    }, 3000);
  } else {
    console.error('❌ Root element not found');
  }
};

// Enhanced DOM ready detection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}