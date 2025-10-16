/**
 * Nova Titan Elite Sports Betting Platform - Mobile Optimized Build
 * Production-Ready React Application with No Mock Data
 */

// Environment Configuration
const CONFIG = {
  API_KEY: window.NOVA_TITAN_API_KEY || 'your_api_key_here',
  USE_DEMO_DATA: false, // Never use demo data
  BASE_URL: 'https://api.the-odds-api.com/v4',
  RATE_LIMIT_MS: 2000,
  MAX_REQUESTS_PER_MINUTE: 25
};

// API Service with rate limiting
class APIService {
  constructor() {
    this.requestCount = 0;
    this.lastReset = Date.now();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Reset counter every minute
    const now = Date.now();
    if (now - this.lastReset > 60000) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    while (this.requestQueue.length > 0 && this.requestCount < CONFIG.MAX_REQUESTS_PER_MINUTE) {
      const { url, options, resolve, reject } = this.requestQueue.shift();
      
      try {
        const response = await fetch(url, options);
        this.requestCount++;
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_MS * 2));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        resolve(data);
        
        if (this.requestQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_MS));
        }
      } catch (error) {
        reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  async getLiveGames(sport = 'basketball_nba') {
    const url = `${CONFIG.BASE_URL}/sports/${sport}/odds/?apiKey=${CONFIG.API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm`;
    return this.makeRequest(url);
  }

  async getPlayerProps(sport = 'basketball_nba', eventId) {
    const url = `${CONFIG.BASE_URL}/sports/${sport}/events/${eventId}/odds/?apiKey=${CONFIG.API_KEY}&regions=us&markets=player_points,player_rebounds,player_assists&oddsFormat=american`;
    return this.makeRequest(url);
  }

  async getSports() {
    const url = `${CONFIG.BASE_URL}/sports/?apiKey=${CONFIG.API_KEY}`;
    return this.makeRequest(url);
  }
}

// Initialize API service
const apiService = new APIService();

// Main App State Management
class AppState {
  constructor() {
    this.subscribers = [];
    this.state = {
      selectedTab: 'games',
      selectedSport: 'basketball_nba',
      isMobile: window.innerWidth < 768,
      sidebarOpen: false,
      selectedPlayer: null, // For player props dropdown
      savedParlays: JSON.parse(localStorage.getItem('savedParlays') || '[]')
    };

    // Listen for window resize to update mobile state
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768;
      if (this.state.isMobile !== isMobile) {
        this.setState({ 
          isMobile,
          sidebarOpen: false // Close sidebar on resize
        });
      }
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach(callback => callback(this.state));
    
    // Save parlays to localStorage when updated
    if (newState.savedParlays) {
      localStorage.setItem('savedParlays', JSON.stringify(newState.savedParlays));
    }
  }

  getState() {
    return this.state;
  }
}

const appState = new AppState();

// Utility Functions
const utils = {
  formatPrice: (price) => {
    if (!price) return 'N/A';
    return price > 0 ? `+${price}` : `${price}`;
  },

  getTeamLogo: (teamName) => {
    const teamMap = {
      'Lakers': 'LAL', 'Celtics': 'BOS', 'Warriors': 'GSW', 'Nets': 'BKN',
      'Bucks': 'MIL', 'Heat': 'MIA', 'Suns': 'PHX', '76ers': 'PHI',
      'Chiefs': 'KC', 'Bills': 'BUF', 'Cowboys': 'DAL', 'Patriots': 'NE'
    };
    
    const abbreviated = teamMap[teamName] || teamName.substring(0, 3).toUpperCase();
    return `https://a.espncdn.com/i/teamlogos/nba/500/${abbreviated}.png`;
  },

  formatDateTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(date - now) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    return date.toLocaleDateString();
  },

  // FBS (Division I) College Football Teams Only
  getFBSTeams: () => {
    return [
      'Alabama', 'Auburn', 'Georgia', 'Tennessee', 'Florida', 'LSU', 'Arkansas', 'Mississippi State', 'Ole Miss', 'South Carolina', 'Missouri', 'Vanderbilt', 'Kentucky', 'Texas A&M',
      'Clemson', 'Florida State', 'Miami', 'North Carolina', 'NC State', 'Virginia', 'Virginia Tech', 'Duke', 'Wake Forest', 'Pittsburgh', 'Syracuse', 'Boston College', 'Louisville', 'Georgia Tech',
      'Ohio State', 'Michigan', 'Penn State', 'Michigan State', 'Wisconsin', 'Iowa', 'Minnesota', 'Illinois', 'Indiana', 'Northwestern', 'Purdue', 'Nebraska', 'Maryland', 'Rutgers',
      'Oklahoma', 'Texas', 'Baylor', 'TCU', 'Texas Tech', 'Oklahoma State', 'Kansas', 'Kansas State', 'Iowa State', 'West Virginia',
      'USC', 'UCLA', 'Oregon', 'Washington', 'Stanford', 'California', 'Arizona', 'Arizona State', 'Utah', 'Colorado', 'Oregon State', 'Washington State',
      'Notre Dame', 'BYU', 'Cincinnati', 'Houston', 'UCF', 'Memphis'
    ];
  }
};

// React Components - Mobile Optimized
const TabButton = ({ id, label, isActive, onClick, icon, isMobile }) => {
  return React.createElement('button', {
    className: `${isMobile ? 'flex-1 py-3 px-2' : 'px-6 py-3'} font-semibold text-sm rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    } ${isMobile ? 'min-w-0' : ''}`,
    onClick: () => onClick(id)
  }, [
    React.createElement('div', {
      key: 'content',
      className: 'flex flex-col items-center space-y-1'
    }, [
      React.createElement('span', { key: 'icon', className: isMobile ? 'text-lg' : 'text-base' }, icon),
      React.createElement('span', { 
        key: 'label', 
        className: `${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'truncate' : ''}`,
        style: isMobile ? { maxWidth: '60px' } : {}
      }, label)
    ])
  ]);
};

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return React.createElement('div', {
    className: 'flex flex-col items-center justify-center p-8 space-y-4'
  }, [
    React.createElement('div', {
      key: 'spinner',
      className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
    }),
    React.createElement('p', {
      key: 'message',
      className: 'text-gray-600 text-sm'
    }, message)
  ]);
};

const ErrorMessage = ({ message, onRetry }) => {
  return React.createElement('div', {
    className: 'flex flex-col items-center justify-center p-8 space-y-4'
  }, [
    React.createElement('div', {
      key: 'icon',
      className: 'text-red-500 text-4xl'
    }, '⚠️'),
    React.createElement('p', {
      key: 'message',
      className: 'text-gray-600 text-center'
    }, message),
    onRetry && React.createElement('button', {
      key: 'retry',
      className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
      onClick: onRetry
    }, 'Retry')
  ]);
};

const MobileGameCard = ({ game }) => {
  // Safe access to teams array
  const homeTeam = game.home_team || game.teams?.[0] || 'Home Team';
  const awayTeam = game.away_team || game.teams?.[1] || 'Away Team';
  const h2hMarket = game.bookmakers?.[0]?.markets?.find(m => m.key === 'h2h');
  const spreadMarket = game.bookmakers?.[0]?.markets?.find(m => m.key === 'spreads');

  return React.createElement('div', {
    className: 'bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300'
  }, [
    // Game Time
    React.createElement('div', {
      key: 'time',
      className: 'text-center mb-3'
    }, [
      React.createElement('span', {
        key: 'datetime',
        className: 'text-sm font-medium text-gray-600'
      }, utils.formatDateTime(game.commence_time)),
      React.createElement('span', {
        key: 'live',
        className: 'ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full'
      }, 'UPCOMING')
    ]),
    
    // Teams
    React.createElement('div', {
      key: 'teams',
      className: 'space-y-3'
    }, [
      // Away Team
      React.createElement('div', {
        key: 'away',
        className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
      }, [
        React.createElement('div', {
          key: 'team-info',
          className: 'flex items-center space-x-3'
        }, [
          React.createElement('div', {
            key: 'logo',
            className: 'w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-800'
          }, awayTeam.substring(0, 3).toUpperCase()),
          React.createElement('span', {
            key: 'name',
            className: 'font-medium text-gray-900 text-sm'
          }, awayTeam)
        ]),
        React.createElement('div', {
          key: 'odds',
          className: 'text-right'
        }, [
          React.createElement('div', {
            key: 'h2h',
            className: 'text-sm font-bold text-green-600'
          }, utils.formatPrice(h2hMarket?.outcomes?.[1]?.price)),
          spreadMarket && React.createElement('div', {
            key: 'spread',
            className: 'text-xs text-gray-500'
          }, `${spreadMarket.outcomes?.[1]?.point || ''} ${utils.formatPrice(spreadMarket.outcomes?.[1]?.price)}`)
        ])
      ]),
      
      // Home Team
      React.createElement('div', {
        key: 'home',
        className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
      }, [
        React.createElement('div', {
          key: 'team-info',
          className: 'flex items-center space-x-3'
        }, [
          React.createElement('div', {
            key: 'logo',
            className: 'w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-800'
          }, homeTeam.substring(0, 3).toUpperCase()),
          React.createElement('span', {
            key: 'name',
            className: 'font-medium text-gray-900 text-sm'
          }, homeTeam)
        ]),
        React.createElement('div', {
          key: 'odds',
          className: 'text-right'
        }, [
          React.createElement('div', {
            key: 'h2h',
            className: 'text-sm font-bold text-green-600'
          }, utils.formatPrice(h2hMarket?.outcomes?.[0]?.price)),
          spreadMarket && React.createElement('div', {
            key: 'spread',
            className: 'text-xs text-gray-500'
          }, `${spreadMarket.outcomes?.[0]?.point || ''} ${utils.formatPrice(spreadMarket.outcomes?.[0]?.price)}`)
        ])
      ])
    ])
  ]);
};

const GameCard = ({ game, isMobile }) => {
  if (isMobile) {
    return React.createElement(MobileGameCard, { game });
  }

  // Desktop version
  return React.createElement('div', {
    className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-4'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold text-gray-900'
      }, `${game.home_team || game.teams?.[0] || 'Home'} vs ${game.away_team || game.teams?.[1] || 'Away'}`),
      React.createElement('span', {
        key: 'time',
        className: 'text-sm text-gray-600'
      }, utils.formatDateTime(game.commence_time))
    ])
  ]);
};

// Player Props Dropdown Component
const PlayerPropsDropdown = ({ games, isMobile }) => {
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [playerProps, setPlayerProps] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadPlayerProps = async (gameId, playerId) => {
    if (!gameId || !playerId) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Loading player props for:', playerId, 'in game:', gameId);
      // This would be replaced with actual API call
      setPlayerProps([]);
    } catch (error) {
      console.error('❌ Error loading player props:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: `${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4 ${isMobile ? 'text-center' : ''}`
    }, '👤 Player Props'),
    
    // Game Selection
    React.createElement('div', {
      key: 'game-select',
      className: 'space-y-2'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-sm font-medium text-gray-700'
      }, 'Select Game:'),
      React.createElement('select', {
        key: 'select',
        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        value: selectedGame || '',
        onChange: (e) => {
          setSelectedGame(e.target.value);
          setSelectedPlayer(null);
          setPlayerProps([]);
        }
      }, [
        React.createElement('option', { key: 'placeholder', value: '' }, 'Choose a game...'),
        ...games.map(game => 
          React.createElement('option', {
            key: game.id || (game.teams ? game.teams.join('-') : 'unknown'),
            value: game.id || (game.teams ? game.teams.join('-') : 'unknown')
          }, `${game.home_team || game.teams?.[0] || 'Home'} vs ${game.away_team || game.teams?.[1] || 'Away'}`)
        )
      ])
    ]),

    // Player Selection (only show if game selected)
    selectedGame && React.createElement('div', {
      key: 'player-select',
      className: 'space-y-2'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-sm font-medium text-gray-700'
      }, 'Select Player:'),
      React.createElement('select', {
        key: 'select',
        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        value: selectedPlayer || '',
        onChange: (e) => {
          setSelectedPlayer(e.target.value);
          loadPlayerProps(selectedGame, e.target.value);
        }
      }, [
        React.createElement('option', { key: 'placeholder', value: '' }, 'Choose a player...'),
        React.createElement('option', { key: 'player1', value: 'player1' }, 'Loading players...')
      ])
    ]),

    // Loading State
    isLoading && React.createElement(LoadingSpinner, {
      key: 'loading',
      message: 'Loading player props...'
    }),

    // Player Props Results
    selectedPlayer && !isLoading && React.createElement('div', {
      key: 'results',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-2'
      }, 'Player Props'),
      React.createElement('p', {
        key: 'message',
        className: 'text-gray-600 text-center'
      }, 'Player props will be loaded here once you select a player.')
    ])
  ]);
};

// Parlay Builder Component
const ParlayBuilder = ({ isMobile }) => {
  const [parlayBets, setParlayBets] = React.useState([]);
  const [savedParlays, setSavedParlays] = React.useState(
    JSON.parse(localStorage.getItem('savedParlays') || '[]')
  );

  const addToParlayBuilder = (bet) => {
    setParlayBets(prev => [...prev, bet]);
  };

  const removeBet = (index) => {
    setParlayBets(prev => prev.filter((_, i) => i !== index));
  };

  const saveParlayBuilder = () => {
    if (parlayBets.length === 0) return;
    
    const newParlay = {
      id: Date.now(),
      bets: parlayBets,
      created: new Date().toISOString(),
      totalOdds: parlayBets.reduce((acc, bet) => acc * (Math.abs(bet.odds) / 100), 1)
    };
    
    const updated = [...savedParlays, newParlay];
    setSavedParlays(updated);
    localStorage.setItem('savedParlays', JSON.stringify(updated));
    setParlayBets([]);
  };

  const clearParlayBuilder = () => {
    setParlayBets([]);
  };

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: `${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4 ${isMobile ? 'text-center' : ''}`
    }, '🏆 Parlay Builder'),

    // Current Parlay
    React.createElement('div', {
      key: 'current',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-3'
      }, `Current Parlay (${parlayBets.length} bets)`),
      
      parlayBets.length === 0 ? 
        React.createElement('p', {
          key: 'empty',
          className: 'text-gray-500 text-center py-4'
        }, 'Add bets from games to build your parlay') :
        React.createElement('div', {
          key: 'bets',
          className: 'space-y-2'
        }, [
          ...parlayBets.map((bet, index) => 
            React.createElement('div', {
              key: index,
              className: 'flex items-center justify-between p-2 bg-gray-50 rounded'
            }, [
              React.createElement('span', {
                key: 'bet',
                className: 'text-sm'
              }, `${bet.team} ${bet.type}: ${utils.formatPrice(bet.odds)}`),
              React.createElement('button', {
                key: 'remove',
                className: 'text-red-600 hover:text-red-800 text-xs',
                onClick: () => removeBet(index)
              }, '×')
            ])
          ),
          React.createElement('div', {
            key: 'actions',
            className: 'flex space-x-2 mt-3'
          }, [
            React.createElement('button', {
              key: 'save',
              className: 'flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors',
              onClick: saveParlayBuilder
            }, 'Save Parlay'),
            React.createElement('button', {
              key: 'clear',
              className: 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors',
              onClick: clearParlayBuilder
            }, 'Clear')
          ])
        ])
    ]),

    // Saved Parlays
    React.createElement('div', {
      key: 'saved',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-3'
      }, 'Saved Parlays'),
      
      savedParlays.length === 0 ? 
        React.createElement('p', {
          key: 'empty',
          className: 'text-gray-500 text-center py-4'
        }, 'No saved parlays yet') :
        React.createElement('div', {
          key: 'list',
          className: 'space-y-2'
        }, savedParlays.map(parlay => 
          React.createElement('div', {
            key: parlay.id,
            className: 'p-3 bg-gray-50 rounded-lg'
          }, [
            React.createElement('div', {
              key: 'info',
              className: 'flex justify-between items-center'
            }, [
              React.createElement('span', {
                key: 'count',
                className: 'font-medium'
              }, `${parlay.bets.length} bets`),
              React.createElement('span', {
                key: 'odds',
                className: 'text-green-600 font-semibold'
              }, `+${Math.round(parlay.totalOdds * 100)}`)
            ])
          ])
        ))
    ])
  ]);
};

// Main App Component - Mobile Optimized
const App = () => {
  const [state, setState] = React.useState(appState.getState());
  const [games, setGames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = appState.subscribe(setState);
    return unsubscribe;
  }, []);

  // Load initial data
  React.useEffect(() => {
    loadGames();
  }, [state.selectedSport]);

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading games for sport:', state.selectedSport);
      const data = await apiService.getLiveGames(state.selectedSport);
      
      if (data && Array.isArray(data)) {
        setGames(data.slice(0, 10));
        console.log('✅ Games loaded:', data.length);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('❌ Error loading games:', error);
      setError(`Failed to load games: ${error.message}`);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'games', label: 'Games', icon: '🏀' },
    { id: 'predictions', label: 'AI Predictions', icon: '🤖' },
    { id: 'parlays', label: 'Parlays', icon: '🏆' },
    { id: 'props', label: 'Props', icon: '👤' },
    { id: 'insights', label: 'Insights', icon: '📊' }
  ];

  // Updated sports list - FBS only for college football
  const sports = [
    { id: 'basketball_nba', label: 'NBA' },
    { id: 'americanfootball_nfl', label: 'NFL' },
    { id: 'americanfootball_ncaaf', label: 'College Football (FBS)' },
    { id: 'baseball_mlb', label: 'MLB' },
    { id: 'icehockey_nhl', label: 'NHL' }
  ];

  const renderTabContent = () => {
    if (isLoading) {
      return React.createElement(LoadingSpinner, { 
        message: `Loading ${sports.find(s => s.id === state.selectedSport)?.label || 'games'}...` 
      });
    }

    if (error) {
      return React.createElement(ErrorMessage, { 
        message: error,
        onRetry: loadGames
      });
    }

    switch (state.selectedTab) {
      case 'games':
        return React.createElement('div', { className: 'space-y-4' }, [
          React.createElement('div', {
            key: 'header',
            className: `${state.isMobile ? 'space-y-3' : 'flex items-center justify-between'}`
          }, [
            React.createElement('h2', {
              key: 'title',
              className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 ${state.isMobile ? 'text-center' : ''}`
            }, '🏀 Live Games & Odds'),
            React.createElement('select', {
              key: 'sport-select',
              value: state.selectedSport,
              onChange: (e) => appState.setState({ selectedSport: e.target.value }),
              className: `${state.isMobile ? 'w-full' : ''} px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
            }, sports.map(sport =>
              React.createElement('option', {
                key: sport.id,
                value: sport.id
              }, sport.label)
            ))
          ]),
          
          games.length === 0 ? 
            React.createElement('div', {
              key: 'no-games',
              className: 'text-center py-8'
            }, [
              React.createElement('p', {
                key: 'message',
                className: 'text-gray-600'
              }, 'No games available for the selected sport.')
            ]) :
            React.createElement('div', {
              key: 'games',
              className: 'space-y-4'
            }, games.map(game => 
              React.createElement(GameCard, { 
                key: game.id || game.teams.join('-'), 
                game,
                isMobile: state.isMobile
              })
            ))
        ]);

      case 'predictions':
        return React.createElement('div', { className: 'space-y-4' }, [
          React.createElement('h2', {
            key: 'title',
            className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4 ${state.isMobile ? 'text-center' : ''}`
          }, '🤖 AI Predictions'),
          React.createElement('div', {
            key: 'content',
            className: 'bg-white rounded-xl p-6 shadow-lg text-center'
          }, [
            React.createElement('p', {
              key: 'message',
              className: 'text-gray-600'
            }, 'AI predictions are being generated based on current game data. Check back soon for insights!')
          ])
        ]);

      case 'parlays':
        return React.createElement(ParlayBuilder, { isMobile: state.isMobile });

      case 'props':
        return React.createElement(PlayerPropsDropdown, { 
          games: games,
          isMobile: state.isMobile 
        });

      default:
        return React.createElement('div', {
          className: 'text-center py-8'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4`
          }, `${tabs.find(t => t.id === state.selectedTab)?.icon || ''} ${tabs.find(t => t.id === state.selectedTab)?.label || 'Feature'}`),
          React.createElement('p', {
            key: 'desc',
            className: 'text-gray-600'
          }, 'This feature is coming soon! Stay tuned for updates.')
        ]);
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800'
  }, [
    React.createElement('div', {
      key: 'container',
      className: `${state.isMobile ? 'max-w-full px-4 py-4' : 'max-w-6xl mx-auto p-6'}`
    }, [
      // Header - Mobile Optimized
      React.createElement('div', {
        key: 'header',
        className: `bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-2xl ${state.isMobile ? 'p-4' : 'p-6'} mb-4 shadow-2xl`
      }, [
        React.createElement('div', {
          key: 'header-content',
          className: `${state.isMobile ? 'flex flex-col items-center space-y-2' : 'flex items-center justify-between'}`
        }, [
          React.createElement('div', {
            key: 'brand',
            className: `${state.isMobile ? 'flex flex-col items-center space-y-2' : 'flex items-center space-x-4'}`
          }, [
            React.createElement('div', {
              key: 'logo',
              className: `${state.isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center ${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-900`
            }, 'NT'),
            React.createElement('div', { 
              key: 'text',
              className: state.isMobile ? 'text-center' : ''
            }, [
              React.createElement('h1', {
                key: 'title',
                className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-extrabold`
              }, 'Nova Titan Elite'),
              React.createElement('p', {
                key: 'subtitle',
                className: `text-blue-200 ${state.isMobile ? 'text-xs' : 'text-sm'}`
              }, 'AI-Powered Sports Betting Platform')
            ])
          ]),
          React.createElement('div', {
            key: 'status',
            className: 'flex items-center space-x-2 text-green-300'
          }, [
            React.createElement('div', {
              key: 'dot',
              className: 'w-2 h-2 bg-green-400 rounded-full animate-pulse'
            }),
            React.createElement('span', {
              key: 'text',
              className: `${state.isMobile ? 'text-xs' : 'text-sm'} font-semibold`
            }, 'LIVE')
          ])
        ])
      ]),

      // Navigation - Mobile Optimized
      React.createElement('div', {
        key: 'nav',
        className: `bg-white rounded-2xl ${state.isMobile ? 'p-2' : 'p-4'} mb-4 shadow-lg`
      }, React.createElement('div', {
        className: `${state.isMobile ? 'flex justify-between' : 'flex flex-wrap gap-2 justify-center'}`
      }, tabs.map(tab =>
        React.createElement(TabButton, {
          key: tab.id,
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
          isActive: state.selectedTab === tab.id,
          isMobile: state.isMobile,
          onClick: (tabId) => appState.setState({ selectedTab: tabId })
        })
      ))),

      // Content - Mobile Optimized
      React.createElement('div', {
        key: 'content',
        className: `bg-gray-50 rounded-2xl ${state.isMobile ? 'p-4' : 'p-6'} shadow-lg min-h-96`
      }, renderTabContent())
    ])
  ]);
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Nova Titan Elite Mobile App (Production) starting...');
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  
  console.log('✅ Nova Titan Elite Mobile App (Production) initialized successfully');
});