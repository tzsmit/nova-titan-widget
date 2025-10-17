/**
 * Nova Titan Elite Sports Betting Platform - Mobile Optimized Build
 * Comprehensive React Application Bundle with Mobile-First Design
 */

// Environment Configuration
const CONFIG = {
  API_KEY: window.NOVA_TITAN_API_KEY || 'demo_key_replace_with_real_key',
  USE_DEMO_DATA: !window.NOVA_TITAN_API_KEY,
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
          // Rate limit hit, wait and retry
          await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_MS * 2));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        resolve(data);
        
        // Rate limit between requests
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
      sidebarOpen: false
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
  }

  getState() {
    return this.state;
  }
}

const appState = new AppState();

// Demo Data with Mobile-Friendly Structure
const DEMO_DATA = {
  games: [
    {
      id: 'demo-1',
      teams: ['Lakers', 'Celtics'],
      commence_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      bookmakers: [{
        key: 'fanduel',
        title: 'FanDuel',
        markets: [
          { 
            key: 'h2h', 
            outcomes: [
              { name: 'Lakers', price: -150 }, 
              { name: 'Celtics', price: +130 }
            ] 
          },
          { 
            key: 'spreads', 
            outcomes: [
              { name: 'Lakers', price: -110, point: -3.5 }, 
              { name: 'Celtics', price: -110, point: +3.5 }
            ] 
          },
          { 
            key: 'totals', 
            outcomes: [
              { name: 'Over', price: -110, point: 225.5 }, 
              { name: 'Under', price: -110, point: 225.5 }
            ] 
          }
        ]
      }]
    },
    {
      id: 'demo-2', 
      teams: ['Warriors', 'Nets'],
      commence_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      bookmakers: [{
        key: 'draftkings',
        title: 'DraftKings',
        markets: [
          { 
            key: 'h2h', 
            outcomes: [
              { name: 'Warriors', price: +120 }, 
              { name: 'Nets', price: -140 }
            ] 
          }
        ]
      }]
    }
  ],
  predictions: [
    {
      game: 'Lakers vs Celtics',
      confidence: 85,
      prediction: 'Lakers -3.5',
      reasoning: 'Strong offensive rating and home advantage'
    }
  ]
};

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

const LoadingSpinner = () => {
  return React.createElement('div', {
    className: 'flex items-center justify-center p-8'
  }, React.createElement('div', {
    className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
  }));
};

const MobileGameCard = ({ game }) => {
  const homeTeam = game.teams[0];
  const awayTeam = game.teams[1];
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
        className: 'ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'
      }, 'LIVE')
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
            className: 'font-medium text-gray-900'
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
            className: 'font-medium text-gray-900'
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

  // Desktop version (keep existing desktop layout)
  return React.createElement('div', {
    className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-4'
    }, [
      React.createElement('div', {
        key: 'teams',
        className: 'flex items-center space-x-2'
      }, [
        React.createElement('div', {
          key: 'indicator',
          className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse'
        }),
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold text-gray-900'
        }, `${game.teams[0]} vs ${game.teams[1]}`),
        React.createElement('span', {
          key: 'live',
          className: 'px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'
        }, 'LIVE')
      ])
    ]),
    React.createElement('div', {
      key: 'content',
      className: 'space-y-3 mb-4'
    }, [
      React.createElement('div', {
        key: 'time',
        className: 'text-sm text-gray-600'
      }, `Game Time: ${utils.formatDateTime(game.commence_time)}`)
    ])
  ]);
};

// Main App Component - Mobile Optimized
const App = () => {
  const [state, setState] = React.useState(appState.getState());
  const [games, setGames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

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
    try {
      console.log('🔄 Loading games for sport:', state.selectedSport);
      const data = await apiService.getLiveGames(state.selectedSport);
      
      if (data && Array.isArray(data)) {
        setGames(data.slice(0, 5)); // Limit to 5 games for performance
        console.log('✅ Games loaded:', data.length);
      }
    } catch (error) {
      console.error('❌ Error loading games:', error);
      // Use demo data on error
      setGames(DEMO_DATA.games);
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

  const sports = [
    { id: 'basketball_nba', label: 'NBA' },
    { id: 'americanfootball_nfl', label: 'NFL' },
    { id: 'baseball_mlb', label: 'MLB' },
    { id: 'icehockey_nhl', label: 'NHL' }
  ];

  const renderTabContent = () => {
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
          
          isLoading ? React.createElement(LoadingSpinner) : 
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
            className: 'bg-white rounded-xl p-6 shadow-lg'
          }, [
            React.createElement('div', {
              key: 'prediction',
              className: 'text-center'
            }, [
              React.createElement('div', {
                key: 'confidence',
                className: 'text-3xl font-bold text-green-600 mb-2'
              }, '85%'),
              React.createElement('div', {
                key: 'game',
                className: 'text-lg font-semibold text-gray-900 mb-2'
              }, 'Lakers vs Celtics'),
              React.createElement('div', {
                key: 'pick',
                className: 'text-xl font-bold text-blue-600 mb-4'
              }, 'Lakers -3.5'),
              React.createElement('p', {
                key: 'reason',
                className: 'text-gray-600'
              }, 'Strong offensive rating and home advantage')
            ])
          ])
        ]);

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
  console.log('🚀 Nova Titan Elite Mobile App starting...');
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  
  console.log('✅ Nova Titan Elite Mobile App initialized successfully');
});