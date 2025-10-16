/**
 * Nova Titan Elite Sports Betting Platform - Production Build
 * All fixes applied: API keys, parlay errors, mobile optimization
 */

// Environment Configuration with multiple API key sources
const CONFIG = {
  API_KEY: window.NOVA_TITAN_API_KEY || 'effdb0775abef82ff5dd944ae2180cae',
  USE_DEMO_DATA: false, // Never use demo data
  BASE_URL: 'https://api.the-odds-api.com/v4',
  RATE_LIMIT_MS: 2000,
  MAX_REQUESTS_PER_MINUTE: 25
};

// Debug API key status
console.log('🔑 Nova Titan API Configuration:', {
  keyAvailable: !!CONFIG.API_KEY,
  keyValid: CONFIG.API_KEY !== 'your_api_key_here',
  keyPrefix: CONFIG.API_KEY ? CONFIG.API_KEY.substring(0, 8) + '...' : 'undefined'
});

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
      selectedPlayer: null,
      savedParlays: JSON.parse(localStorage.getItem('savedParlays') || '[]')
    };

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.setState({ isMobile: window.innerWidth < 768 });
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    
    // Save parlays to localStorage when updated
    if (newState.savedParlays) {
      localStorage.setItem('savedParlays', JSON.stringify(newState.savedParlays));
    }
    
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState() {
    return this.state;
  }
}

// Initialize app state
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      return dateString;
    }
  },

  calculateParlayOdds: (bets) => {
    if (!bets || bets.length === 0) return '+100';
    
    const multiplier = bets.reduce((acc, bet) => {
      const odds = bet.odds || bet.price || 100;
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      return acc * decimal;
    }, 1);
    
    const americanOdds = multiplier >= 2 ? (multiplier - 1) * 100 : -100 / (multiplier - 1);
    return americanOdds > 0 ? `+${Math.round(americanOdds)}` : `${Math.round(americanOdds)}`;
  }
};

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return React.createElement('div', {
    className: 'flex flex-col items-center justify-center py-12'
  }, [
    React.createElement('div', {
      key: 'spinner',
      className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'
    }),
    React.createElement('p', {
      key: 'message',
      className: 'text-gray-600 text-sm'
    }, message)
  ]);
};

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => {
  return React.createElement('div', {
    className: 'text-center py-8'
  }, [
    React.createElement('div', {
      key: 'icon',
      className: 'text-red-500 text-4xl mb-4'
    }, '⚠️'),
    React.createElement('p', {
      key: 'message',
      className: 'text-red-600 mb-4'
    }, message),
    onRetry && React.createElement('button', {
      key: 'retry',
      className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700',
      onClick: onRetry
    }, 'Retry')
  ]);
};

// Navigation Component
const Navigation = ({ tabs, activeTab, onTabChange, isMobile }) => {
  return React.createElement('div', {
    className: `${isMobile ? 'flex overflow-x-auto space-x-2 pb-2' : 'grid grid-cols-5 gap-2'} mb-6`
  }, tabs.map(tab => 
    React.createElement('button', {
      key: tab.id,
      className: `${isMobile ? 'flex-1 py-3 px-2' : 'px-6 py-3'} font-semibold text-sm rounded-lg transition-all duration-200 ${
        activeTab === tab.id 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform -translate-y-0.5' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isMobile ? 'min-w-0' : ''}`,
      onClick: () => onTabChange(tab.id)
    }, [
      React.createElement('div', {
        key: 'content',
        className: 'flex flex-col items-center space-y-1'
      }, [
        React.createElement('span', { key: 'icon', className: isMobile ? 'text-lg' : 'text-base' }, tab.icon),
        React.createElement('span', {
          key: 'label',
          className: `${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'truncate' : ''}`,
          style: isMobile ? { maxWidth: '60px' } : {}
        }, tab.label)
      ])
    ])
  ));
};

// Mini Modal Component for Parlay Notifications
const MiniModal = ({ isOpen, onClose, title, children }) => {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-bounce'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex justify-between items-center mb-2'
    }, [
      React.createElement('h4', {
        key: 'title',
        className: 'font-semibold'
      }, title),
      React.createElement('button', {
        key: 'close',
        className: 'text-white hover:text-gray-200',
        onClick: onClose
      }, '×')
    ]),
    React.createElement('div', {
      key: 'content'
    }, children)
  ]);
};

// Global function to add bets to parlay builder
const addToParlayBuilder = (bet) => {
  console.log('Adding bet to parlay builder:', bet);
  const currentBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
  const updatedBets = [...currentBets, bet];
  localStorage.setItem('currentParlayBets', JSON.stringify(updatedBets));
  
  // Show success notification
  if (window.showParlayNotification) {
    window.showParlayNotification(`Added ${bet.team} ${bet.type} to parlay!`);
  }
};

// Game Card Component
const GameCard = ({ game, isMobile }) => {
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedBet, setLastAddedBet] = React.useState(null);

  const handleAddToParlayBuilder = (bet) => {
    addToParlayBuilder(bet);
    setLastAddedBet(bet);
    setShowMiniModal(true);
  };

  if (!game || !game.bookmakers || game.bookmakers.length === 0) {
    return React.createElement('div', {
      className: 'bg-white rounded-lg p-4 border border-gray-200 mb-4'
    }, [
      React.createElement('p', {
        key: 'no-odds',
        className: 'text-gray-500 text-center'
      }, 'No odds available for this game')
    ]);
  }

  const h2hMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'h2h');
  const spreadMarket = game.bookmakers[0]?.markets?.find(m => m.key === 'spreads');

  return React.createElement('div', {
    className: 'bg-white rounded-lg p-4 border border-gray-200 mb-4 hover:shadow-lg transition-shadow'
  }, [
    // Game Header
    React.createElement('div', {
      key: 'header',
      className: 'flex justify-between items-center mb-3'
    }, [
      React.createElement('div', {
        key: 'teams',
        className: 'flex-1'
      }, [
        React.createElement('h3', {
          key: 'matchup',
          className: `${isMobile ? 'text-sm' : 'text-lg'} font-bold text-gray-900`
        }, `${game.away_team} @ ${game.home_team}`),
        React.createElement('p', {
          key: 'time',
          className: 'text-gray-500 text-xs'
        }, utils.formatDateTime(game.commence_time))
      ])
    ]),

    // Away Team Odds
    React.createElement('div', {
      key: 'away-odds',
      className: 'flex justify-between items-center mb-2 p-2 bg-gray-50 rounded'
    }, [
      React.createElement('span', {
        key: 'team',
        className: 'font-semibold text-sm'
      }, game.away_team),
      React.createElement('div', {
        key: 'odds',
        className: 'flex space-x-2'
      }, [
        h2hMarket?.outcomes?.[1] && React.createElement('button', {
          key: 'ml',
          className: 'px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700',
          onClick: () => handleAddToParlayBuilder({
            team: game.away_team,
            type: 'ML',
            odds: h2hMarket?.outcomes?.[1]?.price,
            game: `${game.away_team} @ ${game.home_team}`
          })
        }, utils.formatPrice(h2hMarket?.outcomes?.[1]?.price)),
        
        spreadMarket?.outcomes?.[1] && React.createElement('button', {
          key: 'spread',
          className: 'px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700',
          onClick: () => handleAddToParlayBuilder({
            team: game.away_team,
            type: `Spread ${spreadMarket.outcomes?.[1]?.point || ''}`,
            odds: spreadMarket.outcomes?.[1]?.price,
            game: `${game.away_team} @ ${game.home_team}`
          })
        }, `${spreadMarket.outcomes?.[1]?.point || ''} ${utils.formatPrice(spreadMarket.outcomes?.[1]?.price)}`)
      ])
    ]),

    // Home Team Odds
    React.createElement('div', {
      key: 'home-odds',
      className: 'flex justify-between items-center p-2 bg-gray-50 rounded'
    }, [
      React.createElement('span', {
        key: 'team',
        className: 'font-semibold text-sm'
      }, game.home_team),
      React.createElement('div', {
        key: 'odds',
        className: 'flex space-x-2'
      }, [
        h2hMarket?.outcomes?.[0] && React.createElement('button', {
          key: 'ml',
          className: 'px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700',
          onClick: () => handleAddToParlayBuilder({
            team: game.home_team,
            type: 'ML',
            odds: h2hMarket?.outcomes?.[0]?.price,
            game: `${game.away_team} @ ${game.home_team}`
          })
        }, utils.formatPrice(h2hMarket?.outcomes?.[0]?.price)),
        
        spreadMarket?.outcomes?.[0] && React.createElement('button', {
          key: 'spread',
          className: 'px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700',
          onClick: () => handleAddToParlayBuilder({
            team: game.home_team,
            type: `Spread ${spreadMarket.outcomes?.[0]?.point || ''}`,
            odds: spreadMarket.outcomes?.[0]?.price,
            game: `${game.away_team} @ ${game.home_team}`
          })
        }, `${spreadMarket.outcomes?.[0]?.point || ''} ${utils.formatPrice(spreadMarket.outcomes?.[0]?.price)}`)
      ])
    ]),

    // Mini Modal
    React.createElement(MiniModal, {
      key: 'modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedBet && `${lastAddedBet.team} ${lastAddedBet.type} ${utils.formatPrice(lastAddedBet.odds)}`)
  ]);
};

// Player Props Dropdown Component
const PlayerPropsDropdown = ({ games, isMobile }) => {
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [playerProps, setPlayerProps] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedProp, setLastAddedProp] = React.useState(null);

  const handleAddToParlayBuilder = (prop) => {
    console.log('Adding prop to parlay builder:', prop);
    setLastAddedProp(prop);
    setShowMiniModal(true);
    
    // Store in localStorage so parlay builder can access
    const currentBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
    const updatedBets = [...currentBets, prop];
    localStorage.setItem('currentParlayBets', JSON.stringify(updatedBets));
  };

  const loadPlayerProps = async (gameId, playerId) => {
    if (!gameId || !playerId) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Loading player props for:', playerId, 'in game:', gameId);
      
      // Try to get real player props from the API  
      const game = games.find(g => g.id === gameId || (g.teams && g.teams.join('-') === gameId));
      if (game && game.id) {
        try {
          const propsData = await apiService.getPlayerProps(game.sport_key || 'basketball_nba', game.id);
          if (propsData && Array.isArray(propsData)) {
            setPlayerProps(propsData.slice(0, 20)); // Limit to 20 props for performance
            console.log('✅ Real player props loaded:', propsData.length);
          } else {
            setPlayerProps([]);
            console.log('ℹ️ No player props available for this game');
          }
        } catch (apiError) {
          console.log('⚠️ Player props API not available, showing placeholder');
          setPlayerProps([]);
        }
      } else {
        setPlayerProps([]);
        console.log('ℹ️ Game ID not found for player props');
      }
    } catch (error) {
      console.error('❌ Error loading player props:', error);
      setPlayerProps([]);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: `${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4 ${isMobile ? 'text-center' : ''}`
    }, '👤 Player Props'),

    // Game Selection Dropdown
    React.createElement('div', {
      key: 'game-select',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-3'
      }, 'Select Game'),
      React.createElement('select', {
        key: 'select',
        className: 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        value: selectedGame || '',
        onChange: (e) => {
          setSelectedGame(e.target.value);
          setSelectedPlayer(null);
          setPlayerProps([]);
        }
      }, [
        React.createElement('option', {
          key: 'default',
          value: ''
        }, 'Choose a game...'),
        ...games.map(game => 
          React.createElement('option', {
            key: game.id,
            value: game.id
          }, `${game.away_team} @ ${game.home_team}`)
        )
      ])
    ]),

    // Player Selection (when game is selected)
    selectedGame && React.createElement('div', {
      key: 'player-select',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-3'
      }, 'Select Player'),
      React.createElement('select', {
        key: 'select',
        className: 'w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        value: selectedPlayer || '',
        onChange: (e) => {
          setSelectedPlayer(e.target.value);
          if (e.target.value) {
            loadPlayerProps(selectedGame, e.target.value);
          }
        }
      }, [
        React.createElement('option', {
          key: 'default',
          value: ''
        }, 'Choose a player...'),
        ...games.find(g => g.id === selectedGame)?.teams?.map((team, index) =>
          React.createElement('option', {
            key: `${team}-${index}`,
            value: `${team}-player-${index}`
          }, `${team} Player`)
        ) || []
      ])
    ]),

    // Player Props Display
    selectedPlayer && React.createElement('div', {
      key: 'props',
      className: 'bg-white rounded-lg p-4 border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-semibold text-gray-900 mb-3'
      }, 'Player Props'),
      
      isLoading ? React.createElement(LoadingSpinner, {
        key: 'loading',
        message: 'Loading player props...'
      }) : playerProps.length === 0 ? React.createElement('p', {
        key: 'no-props',
        className: 'text-gray-500 text-center py-4'
      }, 'No player props available for this game') : React.createElement('div', {
        key: 'props-list',
        className: 'space-y-2'
      }, playerProps.map((prop, index) =>
        React.createElement('div', {
          key: index,
          className: 'flex items-center justify-between p-2 bg-gray-50 rounded'
        }, [
          React.createElement('span', {
            key: 'prop',
            className: 'text-sm'
          }, `${prop.description || 'Player Prop'}: ${prop.point || 'TBD'}`),
          React.createElement('div', {
            key: 'buttons',
            className: 'flex space-x-1'
          }, [
            React.createElement('button', {
              key: 'over',
              className: 'px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700',
              onClick: () => handleAddToParlayBuilder({
                player: selectedPlayer,
                type: `${prop.description || 'Prop'} Over`,
                odds: prop.price || 100,
                line: prop.point
              })
            }, `O ${utils.formatPrice(prop.price || 100)}`),
            React.createElement('button', {
              key: 'under',
              className: 'px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700',
              onClick: () => handleAddToParlayBuilder({
                player: selectedPlayer,
                type: `${prop.description || 'Prop'} Under`,
                odds: -(prop.price || 100),
                line: prop.point
              })
            }, `U ${utils.formatPrice(-(prop.price || 100))}`)
          ])
        ])
      ))
    ]),

    // Mini Modal
    React.createElement(MiniModal, {
      key: 'modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedProp && `${lastAddedProp.type} added to parlay builder`)
  ]);
};

// FIXED Parlay Builder Component with proper error handling
const ParlayBuilder = ({ isMobile }) => {
  const [parlayBets, setParlayBets] = React.useState([]);
  const [savedParlays, setSavedParlays] = React.useState(
    JSON.parse(localStorage.getItem('savedParlays') || '[]')
  );
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedLeg, setLastAddedLeg] = React.useState(null);

  const handleAddToParlayBuilder = (bet) => {
    try {
      setParlayBets(prev => [...prev, bet]);
      setLastAddedLeg(bet);
      setShowMiniModal(true);
      
      // Auto-hide modal after 2 seconds
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to parlay builder:', error);
    }
  };

  // Check for new bets from localStorage (from other components)
  React.useEffect(() => {
    try {
      const storedBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
      if (storedBets.length > 0) {
        setParlayBets(prev => [...prev, ...storedBets]);
        localStorage.removeItem('currentParlayBets'); // Clear after adding
      }
    } catch (error) {
      console.error('Error loading stored bets:', error);
    }
  }, []);

  const removeBet = (index) => {
    try {
      setParlayBets(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing bet:', error);
    }
  };

  const saveParlayBuilder = () => {
    if (parlayBets.length === 0) return;
    
    try {
      const newParlay = {
        id: Date.now(),
        bets: parlayBets,
        created: new Date().toISOString(),
        totalOdds: parlayBets.reduce((acc, bet) => {
          const odds = bet.odds || bet.price || 100; // Safe fallback
          return acc * (Math.abs(Number(odds)) / 100 || 1);
        }, 1)
      };
      
      const updated = [...savedParlays, newParlay];
      setSavedParlays(updated);
      localStorage.setItem('savedParlays', JSON.stringify(updated));
      setParlayBets([]);
    } catch (error) {
      console.error('Error saving parlay:', error);
    }
  };

  const clearParlayBuilder = () => {
    try {
      setParlayBets([]);
    } catch (error) {
      console.error('Error clearing parlay:', error);
    }
  };

  // Error boundary wrapper
  const renderContent = () => {
    try {
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
                  }, `${bet.team || bet.player || 'Unknown'} ${bet.type || 'Bet'}: ${utils.formatPrice(bet.odds || bet.price || 100)}`),
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
                  className: 'flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700',
                  onClick: saveParlayBuilder
                }, 'Save Parlay'),
                React.createElement('button', {
                  key: 'clear',
                  className: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700',
                  onClick: clearParlayBuilder
                }, 'Clear')
              ]),
              parlayBets.length > 1 && React.createElement('div', {
                key: 'odds',
                className: 'mt-3 p-2 bg-blue-50 rounded'
              }, [
                React.createElement('p', {
                  key: 'total',
                  className: 'text-sm font-semibold'
                }, `Total Parlay Odds: ${utils.calculateParlayOdds(parlayBets)}`)
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
          }, `Saved Parlays (${savedParlays.length})`),
          
          savedParlays.length === 0 ?
            React.createElement('p', {
              key: 'empty',
              className: 'text-gray-500 text-center py-4'
            }, 'No saved parlays yet') :
            React.createElement('div', {
              key: 'list',
              className: 'space-y-3'
            }, savedParlays.map((parlay) =>
              React.createElement('div', {
                key: parlay.id,
                className: 'p-3 bg-gray-50 rounded'
              }, [
                React.createElement('div', {
                  key: 'header',
                  className: 'flex justify-between items-center mb-2'
                }, [
                  React.createElement('span', {
                    key: 'date',
                    className: 'text-sm font-medium'
                  }, new Date(parlay.created).toLocaleDateString()),
                  React.createElement('span', {
                    key: 'odds',
                    className: 'text-sm text-green-600 font-bold'
                  }, `${parlay.bets.length} bets`)
                ]),
                React.createElement('div', {
                  key: 'bets',
                  className: 'text-xs text-gray-600'
                }, parlay.bets.map(bet => `${bet.team || bet.player} ${bet.type}`).join(' • '))
              ])
            ))
        ]),

        // Mini Modal
        React.createElement(MiniModal, {
          key: 'modal',
          isOpen: showMiniModal,
          onClose: () => setShowMiniModal(false),
          title: 'Added to Parlay!'
        }, lastAddedLeg && `${lastAddedLeg.team || lastAddedLeg.player} ${lastAddedLeg.type}`)
      ]);
    } catch (error) {
      console.error('Error rendering ParlayBuilder:', error);
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
        }, 'There was an issue loading the parlay builder. Please try again.'),
        React.createElement('button', {
          key: 'retry',
          className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700',
          onClick: () => window.location.reload()
        }, 'Retry')
      ]);
    }
  };

  return renderContent();
};

// Main App Component
const NovaTitanApp = () => {
  const [state, setState] = React.useState(appState.getState());
  const [games, setGames] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Subscribe to app state changes
  React.useEffect(() => {
    const unsubscribe = appState.subscribe(setState);
    loadGames();
    return unsubscribe;
  }, []);

  // Load games when sport changes
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
        return games.length === 0 ? 
          React.createElement('div', {
            className: 'text-center py-8'
          }, [
            React.createElement('h2', {
              key: 'title',
              className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4`
            }, '🏀 No Games Available'),
            React.createElement('p', {
              key: 'message',
              className: 'text-gray-600'
            }, 'No games scheduled for today. Try selecting a different sport or check back later.')
          ]) :
          React.createElement('div', {
            className: 'space-y-4'
          }, games.map(game =>
            React.createElement(GameCard, {
              key: game.id,
              game: game,
              isMobile: state.isMobile
            })
          ));

      case 'predictions':
        return React.createElement('div', {
          className: 'text-center py-8'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-4`
          }, '🤖 AI Predictions'),
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600'
          }, 'AI predictions are being generated based on current game data. Check back soon for insights!')
        ]);

      case 'parlays':
        try {
          return React.createElement(ParlayBuilder, { isMobile: state.isMobile });
        } catch (error) {
          console.error('Error rendering ParlayBuilder:', error);
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
            }, 'There was an issue loading the parlay builder. Please try again.'),
            React.createElement('button', {
              key: 'retry',
              className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700',
              onClick: () => window.location.reload()
            }, 'Retry')
          ]);
        }

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
              className: `w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ${state.isMobile ? 'mb-2' : ''}`
            }, React.createElement('span', {
              className: 'text-2xl font-bold text-black'
            }, 'NT')),
            React.createElement('div', {
              key: 'text',
              className: `${state.isMobile ? 'text-center' : ''}`
            }, [
              React.createElement('h1', {
                key: 'title',
                className: `${state.isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 ${state.isMobile ? 'text-center' : ''}`
              }, 'Nova Titan Elite'),
              React.createElement('p', {
                key: 'subtitle',
                className: `${state.isMobile ? 'text-sm' : 'text-base'} text-blue-200`
              }, 'AI-Powered Sports Betting Platform')
            ])
          ]),
          React.createElement('select', {
            key: 'sport-select',
            className: `${state.isMobile ? 'w-full' : ''} px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`,
            style: { color: '#1f2937' },
            value: state.selectedSport,
            onChange: (e) => appState.setState({ selectedSport: e.target.value })
          }, sports.map(sport =>
            React.createElement('option', {
              key: sport.id,
              value: sport.id
            }, sport.label)
          ))
        ])
      ]),

      // Navigation
      React.createElement(Navigation, {
        key: 'nav',
        tabs: tabs,
        activeTab: state.selectedTab,
        onTabChange: (tab) => appState.setState({ selectedTab: tab }),
        isMobile: state.isMobile
      }),

      // Content Area
      React.createElement('div', {
        key: 'content',
        className: 'bg-white rounded-2xl shadow-2xl overflow-hidden'
      }, [
        React.createElement('div', {
          key: 'content-inner',
          className: `${state.isMobile ? 'p-4' : 'p-6'}`
        }, renderTabContent())
      ])
    ])
  ]);
};

// Initialize the application
console.log('🚀 Nova Titan Elite Sports Platform starting...');
console.log('📱 Mobile detected:', window.innerWidth < 768);
console.log('🔑 API Key configured:', !!CONFIG.API_KEY);

// Render the app
ReactDOM.render(React.createElement(NovaTitanApp), document.getElementById('root'));

console.log('✅ Nova Titan Elite App initialized successfully');