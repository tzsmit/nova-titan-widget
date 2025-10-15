/**
 * Nova Titan Elite Sports Betting Platform - Production Build
 * Comprehensive React Application Bundle
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
      searchTerm: '',
      isLoading: false,
      games: [],
      predictions: [],
      parlays: this.loadParlays(),
      trackedInsights: this.loadTrackedInsights(),
      playerProps: [],
      error: null
    };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState() {
    return this.state;
  }

  // LocalStorage helpers
  loadParlays() {
    try {
      return JSON.parse(localStorage.getItem('novaTitanParlays') || '[]');
    } catch {
      return [];
    }
  }

  saveParlays(parlays) {
    localStorage.setItem('novaTitanParlays', JSON.stringify(parlays));
    this.setState({ parlays });
  }

  loadTrackedInsights() {
    try {
      return JSON.parse(localStorage.getItem('novaTitanTrackedInsights') || '[]');
    } catch {
      return [];
    }
  }

  saveTrackedInsights(insights) {
    localStorage.setItem('novaTitanTrackedInsights', JSON.stringify(insights));
    this.setState({ trackedInsights: insights });
  }
}

// Initialize app state
const appState = new AppState();

// Utility Functions
const utils = {
  formatOdds: (odds) => {
    if (!odds) return 'N/A';
    return odds > 0 ? `+${odds}` : `${odds}`;
  },

  calculateParlayOdds: (legs) => {
    if (!legs || legs.length === 0) return 1.0;
    
    return legs.reduce((total, leg) => {
      const odds = parseFloat(leg.odds);
      const decimal = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      return total * decimal;
    }, 1);
  },

  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
};

// React Components (simplified inline versions)
const TabButton = ({ id, label, isActive, onClick, icon }) => {
  return React.createElement('button', {
    className: `px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`,
    onClick: () => onClick(id)
  }, [icon, ' ', label]);
};

const LoadingSpinner = () => {
  return React.createElement('div', {
    className: 'flex items-center justify-center p-8'
  }, React.createElement('div', {
    className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
  }));
};

const GameCard = ({ game }) => {
  const handleTeamClick = (team) => {
    // Show team stats modal (simplified)
    alert(`Team Stats for ${team}\\n\\nThis would show detailed team statistics, recent performance, and betting insights.`);
  };

  return React.createElement('div', {
    className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300'
  }, [
    // Game header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-4'
    }, [
      React.createElement('div', {
        key: 'info',
        className: 'flex items-center space-x-2'
      }, [
        React.createElement('div', {
          key: 'dot',
          className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse'
        }),
        React.createElement('span', {
          key: 'time',
          className: 'text-sm font-medium text-gray-600'
        }, utils.formatDateTime(game.commence_time))
      ]),
      React.createElement('span', {
        key: 'live',
        className: 'px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'
      }, 'LIVE ODDS')
    ]),

    // Teams
    React.createElement('div', {
      key: 'teams',
      className: 'space-y-3 mb-4'
    }, (game.teams || []).map((team, index) => 
      React.createElement('div', {
        key: `${team}-${index}`,
        className: 'flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors',
        onClick: () => handleTeamClick(team)
      }, [
        React.createElement('img', {
          key: 'logo',
          src: utils.getTeamLogo(team),
          alt: team,
          className: 'w-8 h-8 rounded-full',
          onError: (e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }
        }),
        React.createElement('div', {
          key: 'fallback',
          className: 'w-8 h-8 bg-blue-600 rounded-full items-center justify-center text-white text-xs font-bold hidden'
        }, team ? team.substring(0, 2) : 'TM'),
        React.createElement('span', {
          key: 'name',
          className: 'font-semibold text-gray-900 hover:text-blue-600'
        }, team || 'Unknown Team')
      ])
    )),

    // Odds
    game.bookmakers && game.bookmakers[0] && game.bookmakers[0].markets && React.createElement('div', {
      key: 'odds',
      className: 'grid grid-cols-3 gap-3 mb-4'
    }, game.bookmakers[0].markets.slice(0, 3).map((market, index) => 
      React.createElement('div', {
        key: market.key || index,
        className: 'text-center p-3 bg-gray-50 rounded-lg'
      }, [
        React.createElement('div', {
          key: 'label',
          className: 'text-xs text-gray-600 mb-1'
        }, market.key === 'h2h' ? 'Moneyline' : market.key === 'spreads' ? 'Spread' : 'Total'),
        React.createElement('div', {
          key: 'value',
          className: 'font-semibold text-gray-900'
        }, market.outcomes && market.outcomes[0] ? utils.formatOdds(market.outcomes[0].price) : 'N/A')
      ])
    ))
  ]);
};

const ParlayBuilder = () => {
  const [parlayLegs, setParlayLegs] = React.useState([]);
  const [parlayName, setParlayName] = React.useState('');
  const [stake, setStake] = React.useState(10);

  const addToParlayBuilder = (bet) => {
    const newLeg = {
      id: utils.generateId(),
      game: bet.game || 'Game',
      team: bet.team || 'Team',
      market: bet.market || 'Moneyline',
      odds: bet.odds || 100,
      selection: bet.selection || 'Win'
    };
    
    setParlayLegs(prev => [...prev, newLeg]);
    
    // Show confirmation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = 'Added to Parlay Builder! 🎯';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const saveParlay = () => {
    if (!parlayName || parlayLegs.length === 0) {
      alert('Please enter a parlay name and add at least one leg.');
      return;
    }

    const newParlay = {
      id: utils.generateId(),
      name: parlayName,
      legs: parlayLegs,
      stake,
      totalOdds: utils.calculateParlayOdds(parlayLegs),
      potentialPayout: stake * utils.calculateParlayOdds(parlayLegs),
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const currentParlays = appState.getState().parlays;
    appState.saveParlays([...currentParlays, newParlay]);

    // Reset form
    setParlayLegs([]);
    setParlayName('');
    setStake(10);

    alert('Parlay saved successfully! 🏆');
  };

  // Make addToParlayBuilder globally available
  React.useEffect(() => {
    window.addToParlayBuilder = addToParlayBuilder;
  }, []);

  const totalOdds = utils.calculateParlayOdds(parlayLegs);
  const potentialPayout = stake * totalOdds;

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'text-center'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-2xl font-bold text-gray-900 mb-2'
      }, '🏆 Nova Titan Elite Parlay Builder'),
      React.createElement('p', {
        key: 'subtitle',
        className: 'text-gray-600'
      }, 'Build winning combinations with intelligent suggestions')
    ]),

    // Current Parlay
    React.createElement('div', {
      key: 'current',
      className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold text-gray-900 mb-4'
      }, 'Current Parlay'),
      
      // Parlay Name Input
      React.createElement('div', {
        key: 'name',
        className: 'mb-4'
      }, [
        React.createElement('label', {
          key: 'label',
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'Parlay Name'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          value: parlayName,
          onChange: (e) => setParlayName(e.target.value),
          placeholder: 'Enter parlay name...',
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        })
      ]),

      // Parlay Legs
      parlayLegs.length > 0 ? React.createElement('div', {
        key: 'legs',
        className: 'space-y-2 mb-4'
      }, parlayLegs.map(leg => 
        React.createElement('div', {
          key: leg.id,
          className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
        }, [
          React.createElement('div', { key: 'info' }, [
            React.createElement('div', {
              key: 'game',
              className: 'font-medium text-gray-900'
            }, `${leg.game} - ${leg.team}`),
            React.createElement('div', {
              key: 'market',
              className: 'text-sm text-gray-600'
            }, `${leg.market}: ${leg.selection}`)
          ]),
          React.createElement('div', {
            key: 'odds',
            className: 'text-right'
          }, [
            React.createElement('div', {
              key: 'price',
              className: 'font-semibold text-gray-900'
            }, utils.formatOdds(leg.odds)),
            React.createElement('button', {
              key: 'remove',
              onClick: () => setParlayLegs(prev => prev.filter(l => l.id !== leg.id)),
              className: 'text-xs text-red-600 hover:text-red-800 mt-1'
            }, 'Remove')
          ])
        ])
      )) : React.createElement('div', {
        key: 'empty',
        className: 'text-center py-8 text-gray-500'
      }, 'No legs added yet. Add bets from the Games tab!'),

      // Stake and Calculations
      parlayLegs.length > 0 && React.createElement('div', {
        key: 'calculations',
        className: 'border-t pt-4'
      }, [
        React.createElement('div', {
          key: 'stake',
          className: 'flex items-center justify-between mb-2'
        }, [
          React.createElement('label', {
            key: 'label',
            className: 'text-sm font-medium text-gray-700'
          }, 'Stake ($)'),
          React.createElement('input', {
            key: 'input',
            type: 'number',
            value: stake,
            onChange: (e) => setStake(Number(e.target.value) || 0),
            min: 1,
            className: 'w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          })
        ]),
        React.createElement('div', {
          key: 'odds',
          className: 'flex items-center justify-between mb-2'
        }, [
          React.createElement('span', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'Total Odds'),
          React.createElement('span', {
            key: 'value',
            className: 'font-semibold'
          }, `${totalOdds.toFixed(2)}x`)
        ]),
        React.createElement('div', {
          key: 'payout',
          className: 'flex items-center justify-between mb-4'
        }, [
          React.createElement('span', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'Potential Payout'),
          React.createElement('span', {
            key: 'value',
            className: 'font-bold text-green-600 text-lg'
          }, `$${potentialPayout.toFixed(2)}`)
        ]),
        React.createElement('button', {
          key: 'save',
          onClick: saveParlay,
          className: 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
        }, 'Save Parlay 💾')
      ])
    ]),

    // Saved Parlays
    React.createElement('div', {
      key: 'saved',
      className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold text-gray-900 mb-4'
      }, 'Saved Parlays'),
      
      appState.getState().parlays.length > 0 ? React.createElement('div', {
        key: 'list',
        className: 'space-y-3'
      }, appState.getState().parlays.map(parlay =>
        React.createElement('div', {
          key: parlay.id,
          className: 'p-4 border border-gray-200 rounded-lg'
        }, [
          React.createElement('div', {
            key: 'header',
            className: 'flex items-center justify-between mb-2'
          }, [
            React.createElement('span', {
              key: 'name',
              className: 'font-semibold text-gray-900'
            }, parlay.name),
            React.createElement('span', {
              key: 'status',
              className: `px-2 py-1 rounded-full text-xs ${
                parlay.status === 'active' ? 'bg-green-100 text-green-800' : 
                parlay.status === 'won' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`
            }, parlay.status.toUpperCase())
          ]),
          React.createElement('div', {
            key: 'details',
            className: 'text-sm text-gray-600'
          }, `${parlay.legs.length} legs • $${parlay.stake} stake • $${parlay.potentialPayout.toFixed(2)} potential`)
        ])
      )) : React.createElement('p', {
        key: 'empty',
        className: 'text-gray-500 text-center py-4'
      }, 'No saved parlays yet')
    ])
  ]);
};

// AI Predictions Component
const AIPredictions = () => {
  const [predictions] = React.useState([
    {
      id: '1',
      game: 'Lakers vs Celtics',
      recommendation: 'Celtics ML',
      confidence: 78.5,
      expectedValue: 8.3,
      reasoning: 'Strong home court advantage and recent form',
      timeFrame: 'Full Game'
    },
    {
      id: '2', 
      game: 'Warriors vs Nets',
      recommendation: 'Over 218.5',
      confidence: 71.2,
      expectedValue: 5.7,
      reasoning: 'Both teams averaging high scoring games',
      timeFrame: 'Full Game'
    }
  ]);

  const trackInsight = (prediction) => {
    const currentInsights = appState.getState().trackedInsights;
    const newInsight = {
      ...prediction,
      trackedAt: new Date().toISOString()
    };
    
    appState.saveTrackedInsights([...currentInsights, newInsight]);
    
    // Show confirmation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = 'Insight Tracked! 📊';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-2xl font-bold text-gray-900 text-center mb-6'
    }, '🤖 AI-Powered Predictions'),

    React.createElement('div', {
      key: 'predictions',
      className: 'space-y-4'
    }, predictions.map(prediction =>
      React.createElement('div', {
        key: prediction.id,
        className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200'
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'flex items-center justify-between mb-4'
        }, [
          React.createElement('div', { key: 'info' }, [
            React.createElement('h3', {
              key: 'game',
              className: 'font-semibold text-gray-900'
            }, prediction.game),
            React.createElement('p', {
              key: 'rec',
              className: 'text-blue-600 font-medium'
            }, prediction.recommendation)
          ]),
          React.createElement('div', {
            key: 'confidence',
            className: 'text-right'
          }, [
            React.createElement('div', {
              key: 'conf',
              className: 'text-lg font-bold text-gray-900'
            }, `${prediction.confidence}%`),
            React.createElement('div', {
              key: 'label',
              className: 'text-xs text-gray-600'
            }, 'Confidence')
          ])
        ]),
        
        React.createElement('div', {
          key: 'details',
          className: 'mb-4'
        }, [
          React.createElement('p', {
            key: 'reasoning',
            className: 'text-gray-600 mb-2'
          }, prediction.reasoning),
          React.createElement('div', {
            key: 'metrics',
            className: 'flex items-center space-x-4 text-sm'
          }, [
            React.createElement('span', {
              key: 'ev',
              className: 'text-green-600 font-medium'
            }, `+${prediction.expectedValue}% EV`),
            React.createElement('span', {
              key: 'time',
              className: 'text-gray-500'
            }, prediction.timeFrame)
          ])
        ]),

        React.createElement('button', {
          key: 'track',
          onClick: () => trackInsight(prediction),
          className: 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors'
        }, 'Track This Insight 📊')
      ])
    )),

    // Tracked Insights
    appState.getState().trackedInsights.length > 0 && React.createElement('div', {
      key: 'tracked',
      className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold text-gray-900 mb-4'
      }, 'My Tracked Insights'),
      React.createElement('div', {
        key: 'list',
        className: 'space-y-3'
      }, appState.getState().trackedInsights.map(insight =>
        React.createElement('div', {
          key: insight.id,
          className: 'p-3 bg-gray-50 rounded-lg'
        }, [
          React.createElement('div', {
            key: 'content',
            className: 'flex items-center justify-between'
          }, [
            React.createElement('div', { key: 'info' }, [
              React.createElement('span', {
                key: 'game',
                className: 'font-medium text-gray-900'
              }, insight.game),
              React.createElement('span', {
                key: 'rec',
                className: 'text-blue-600 ml-2'
              }, insight.recommendation)
            ]),
            React.createElement('button', {
              key: 'remove',
              onClick: () => {
                const updated = appState.getState().trackedInsights.filter(i => i.id !== insight.id);
                appState.saveTrackedInsights(updated);
              },
              className: 'text-red-600 hover:text-red-800 text-sm'
            }, '✕')
          ])
        ])
      ))
    ])
  ]);
};

// Player Props Component
const PlayerProps = () => {
  const [playerProps] = React.useState([
    {
      id: '1',
      player: 'LeBron James',
      team: 'Lakers',
      market: 'Points',
      line: 25.5,
      over: -110,
      under: -110,
      game: 'LAL vs BOS'
    },
    {
      id: '2',
      player: 'Jayson Tatum', 
      team: 'Celtics',
      market: 'Rebounds',
      line: 8.5,
      over: +105,
      under: -125,
      game: 'LAL vs BOS'
    }
  ]);

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-2xl font-bold text-gray-900 text-center mb-6'
    }, '👤 Player Props'),

    React.createElement('div', {
      key: 'props',
      className: 'space-y-4'
    }, playerProps.map(prop =>
      React.createElement('div', {
        key: prop.id,
        className: 'bg-white rounded-xl p-6 shadow-lg border border-gray-200'
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'flex items-center justify-between mb-4'
        }, [
          React.createElement('div', { key: 'player' }, [
            React.createElement('h3', {
              key: 'name',
              className: 'font-semibold text-gray-900'
            }, prop.player),
            React.createElement('p', {
              key: 'team',
              className: 'text-gray-600 text-sm'
            }, `${prop.team} • ${prop.game}`)
          ]),
          React.createElement('div', {
            key: 'market',
            className: 'text-right'
          }, [
            React.createElement('div', {
              key: 'type',
              className: 'font-medium text-gray-900'
            }, prop.market),
            React.createElement('div', {
              key: 'line',
              className: 'text-lg font-bold text-blue-600'
            }, prop.line)
          ])
        ]),

        React.createElement('div', {
          key: 'betting',
          className: 'grid grid-cols-2 gap-4'
        }, [
          React.createElement('button', {
            key: 'over',
            onClick: () => window.addToParlayBuilder && window.addToParlayBuilder({
              game: prop.game,
              team: prop.player,
              market: `${prop.market} Over`,
              odds: prop.over,
              selection: `Over ${prop.line}`
            }),
            className: 'bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 text-center transition-colors'
          }, [
            React.createElement('div', {
              key: 'label',
              className: 'text-sm text-gray-600 mb-1'
            }, `Over ${prop.line}`),
            React.createElement('div', {
              key: 'odds',
              className: 'font-semibold text-green-700'
            }, utils.formatOdds(prop.over))
          ]),
          React.createElement('button', {
            key: 'under',
            onClick: () => window.addToParlayBuilder && window.addToParlayBuilder({
              game: prop.game,
              team: prop.player,
              market: `${prop.market} Under`,
              odds: prop.under,
              selection: `Under ${prop.line}`
            }),
            className: 'bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-3 text-center transition-colors'
          }, [
            React.createElement('div', {
              key: 'label',
              className: 'text-sm text-gray-600 mb-1'
            }, `Under ${prop.line}`),
            React.createElement('div', {
              key: 'odds',
              className: 'font-semibold text-red-700'
            }, utils.formatOdds(prop.under))
          ])
        ])
      ])
    ))
  ]);
};

// Main App Component
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
      setGames([
        {
          id: 'demo-1',
          teams: ['Lakers', 'Celtics'],
          commence_time: new Date().toISOString(),
          bookmakers: [{
            markets: [
              { key: 'h2h', outcomes: [{ price: -150 }, { price: +130 }] },
              { key: 'spreads', outcomes: [{ price: -110 }] },
              { key: 'totals', outcomes: [{ price: -110 }] }
            ]
          }]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'games', label: 'Games', icon: '🏀' },
    { id: 'predictions', label: 'AI Predictions', icon: '🤖' },
    { id: 'parlays', label: 'Parlay Builder', icon: '🏆' },
    { id: 'props', label: 'Player Props', icon: '👤' },
    { id: 'insights', label: 'AI Insights', icon: '📊' }
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
        return React.createElement('div', { className: 'space-y-6' }, [
          React.createElement('div', {
            key: 'header',
            className: 'flex items-center justify-between'
          }, [
            React.createElement('h2', {
              key: 'title',
              className: 'text-2xl font-bold text-gray-900'
            }, '🏀 Live Games & Odds'),
            React.createElement('select', {
              key: 'sport-select',
              value: state.selectedSport,
              onChange: (e) => appState.setState({ selectedSport: e.target.value }),
              className: 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
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
          }, games.map(game => React.createElement(GameCard, { key: game.id || game.teams.join('-'), game })))
        ]);

      case 'predictions':
        return React.createElement(AIPredictions);

      case 'parlays':
        return React.createElement(ParlayBuilder);

      case 'props':
        return React.createElement(PlayerProps);

      case 'insights':
        return React.createElement('div', {
          className: 'text-center py-12'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: 'text-2xl font-bold text-gray-900 mb-4'
          }, '📊 AI Insights'),
          React.createElement('p', {
            key: 'desc',
            className: 'text-gray-600'
          }, 'Advanced betting insights and analytics coming soon!')
        ]);

      default:
        return React.createElement('div', {}, 'Select a tab to get started');
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800'
  }, [
    React.createElement('div', {
      key: 'container',
      className: 'max-w-6xl mx-auto p-6'
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white rounded-2xl p-6 mb-6 shadow-2xl'
      }, [
        React.createElement('div', {
          key: 'header-content',
          className: 'flex items-center justify-between'
        }, [
          React.createElement('div', {
            key: 'brand',
            className: 'flex items-center space-x-4'
          }, [
            React.createElement('div', {
              key: 'logo',
              className: 'w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-900'
            }, 'NT'),
            React.createElement('div', { key: 'text' }, [
              React.createElement('h1', {
                key: 'title',
                className: 'text-2xl font-extrabold'
              }, 'Nova Titan Elite'),
              React.createElement('p', {
                key: 'subtitle',
                className: 'text-blue-200 text-sm'
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
              className: 'text-sm font-semibold'
            }, 'LIVE')
          ])
        ])
      ]),

      // Navigation
      React.createElement('div', {
        key: 'nav',
        className: 'bg-white rounded-2xl p-4 mb-6 shadow-lg'
      }, React.createElement('div', {
        className: 'flex flex-wrap gap-2 justify-center'
      }, tabs.map(tab =>
        React.createElement(TabButton, {
          key: tab.id,
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
          isActive: state.selectedTab === tab.id,
          onClick: (tabId) => appState.setState({ selectedTab: tabId })
        })
      ))),

      // Content
      React.createElement('div', {
        key: 'content',
        className: 'bg-gray-50 rounded-2xl p-6 shadow-lg min-h-96'
      }, renderTabContent())
    ])
  ]);
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Nova Titan Elite App starting...');
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  
  console.log('✅ Nova Titan Elite App initialized successfully');
});