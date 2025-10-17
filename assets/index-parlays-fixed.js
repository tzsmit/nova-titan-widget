// Nova Titan Sports - Parlays Fixed Version
// Last Updated: 2024-10-16
// Fixed: showMiniModal scope issues in all components

// Utility Functions
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
  }
};

// API Configuration
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

// Global App State
const appState = {
  currentView: 'home',
  isMobile: window.innerWidth <= 768,
  games: [],
  savedParlays: JSON.parse(localStorage.getItem('savedParlays') || '[]'),
  
  getState() {
    return {
      currentView: this.currentView,
      isMobile: this.isMobile,
      games: this.games,
      savedParlays: this.savedParlays
    };
  },
  
  setState(newState) {
    Object.assign(this, newState);
  }
};

// API Functions
const api = {
  async fetchGames(sport) {
    const url = `${API_CONFIG.baseUrl}/sports/${sport}/odds?apiKey=${API_CONFIG.apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`;
    
    try {
      console.log(`📡 Fetching ${sport} games...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API key invalid or expired');
        }
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ${sport}: ${data.length} games loaded`);
      console.log(`📈 API calls remaining: ${response.headers.get('x-requests-remaining') || 'Unknown'}`);
      
      return data || [];
    } catch (error) {
      console.error(`❌ Error fetching ${sport}:`, error.message);
      return [];
    }
  },
  
  async fetchAllGames() {
    const allGames = [];
    
    for (const sport of API_CONFIG.sports) {
      const games = await this.fetchGames(sport);
      allGames.push(...games);
      
      // Rate limiting
      if (API_CONFIG.sports.indexOf(sport) < API_CONFIG.sports.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`🎯 TOTAL REAL GAMES FOUND: ${allGames.length} across all sports`);
    return allGames;
  }
};

// Parlay Builder Logic
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
    
    // Show success notification
    if (window.showParlayNotification) {
      window.showParlayNotification(`Added ${bet.team || bet.player} ${bet.type} to parlay!`);
    }
  } catch (error) {
    console.error('❌ Error adding to parlay builder:', error);
  }
};

// Mini Modal Component
const MiniModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    onClick: onClose
  }, [
    React.createElement('div', {
      key: 'modal-content',
      className: 'bg-white rounded-lg p-6 max-w-sm mx-4 transform transition-all',
      onClick: (e) => e.stopPropagation()
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold text-gray-900 mb-2'
      }, title),
      React.createElement('div', {
        key: 'content',
        className: 'text-gray-600 mb-4'
      }, children),
      React.createElement('button', {
        key: 'close',
        className: 'w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors',
        onClick: onClose
      }, 'OK')
    ])
  ]);
};

// Game Card Component - FIXED showMiniModal scope
const GameCard = ({ game, isMobile }) => {
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedBet, setLastAddedBet] = React.useState(null);

  const handleAddToParlayBuilder = (bet) => {
    try {
      addToParlayBuilder(bet);
      setLastAddedBet(bet);
      setShowMiniModal(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding bet:', error);
    }
  };

  if (!game || !game.bookmakers || game.bookmakers.length === 0) {
    return React.createElement('div', {
      className: 'bg-gray-100 rounded-lg p-4 text-center'
    }, 'No betting data available');
  }

  const bookmaker = game.bookmakers[0];
  const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
  
  if (!h2hMarket || !h2hMarket.outcomes) {
    return React.createElement('div', {
      className: 'bg-gray-100 rounded-lg p-4 text-center'
    }, 'No odds available');
  }

  return React.createElement('div', {
    className: `bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${isMobile ? 'text-sm' : ''}`
  }, [
    // Game Header
    React.createElement('div', {
      key: 'header',
      className: 'flex justify-between items-center mb-3'
    }, [
      React.createElement('div', {
        key: 'teams',
        className: 'font-semibold text-gray-900'
      }, `${game.away_team} @ ${game.home_team}`),
      React.createElement('div', {
        key: 'time',
        className: 'text-xs text-gray-500'
      }, new Date(game.commence_time).toLocaleDateString())
    ]),

    // Betting Options
    React.createElement('div', {
      key: 'bets',
      className: 'grid grid-cols-2 gap-2'
    }, h2hMarket.outcomes.map((outcome, idx) => 
      React.createElement('button', {
        key: `bet-${idx}`,
        className: 'p-3 bg-gray-50 hover:bg-blue-50 rounded border text-center transition-colors',
        onClick: () => handleAddToParlayBuilder({
          team: outcome.name,
          type: 'Moneyline',
          odds: outcome.price,
          game: `${game.away_team} vs ${game.home_team}`,
          sport: game.sport_title
        })
      }, [
        React.createElement('div', {
          key: 'team',
          className: 'font-medium text-gray-900'
        }, outcome.name),
        React.createElement('div', {
          key: 'odds',
          className: 'text-sm font-bold text-green-600'
        }, utils.formatPrice(outcome.price))
      ])
    )),

    // Mini Modal - PROPERLY SCOPED
    React.createElement(MiniModal, {
      key: 'modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedBet ? `${lastAddedBet.team} ${lastAddedBet.type} (${utils.formatPrice(lastAddedBet.odds)}) added to parlay builder` : 'Bet added successfully!')
  ]);
};

// Player Props Dropdown Component - FIXED showMiniModal scope
const PlayerPropsDropdown = ({ games, isMobile }) => {
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [playerProps, setPlayerProps] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedProp, setLastAddedProp] = React.useState(null);

  const handleAddToParlayBuilder = (prop) => {
    try {
      console.log('Adding prop to parlay builder:', prop);
      setLastAddedProp(prop);
      setShowMiniModal(true);
      
      // Store in localStorage
      const currentBets = JSON.parse(localStorage.getItem('currentParlayBets') || '[]');
      const updatedBets = [...currentBets, prop];
      localStorage.setItem('currentParlayBets', JSON.stringify(updatedBets));
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding prop:', error);
    }
  };

  const availableGames = games.slice(0, 20); // Limit for performance

  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('h3', {
      key: 'title',
      className: `${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`
    }, '🏈 Player Props (Demo Data)'),

    // Game Selection
    React.createElement('select', {
      key: 'game-select',
      className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
      value: selectedGame ? selectedGame.id : '',
      onChange: (e) => {
        const game = availableGames.find(g => g.id === e.target.value);
        setSelectedGame(game);
        setSelectedPlayer(null);
      }
    }, [
      React.createElement('option', {
        key: 'placeholder',
        value: ''
      }, 'Select a game...'),
      ...availableGames.map(game => 
        React.createElement('option', {
          key: game.id,
          value: game.id
        }, `${game.away_team} @ ${game.home_team}`)
      )
    ]),

    // Demo Props (when game selected)
    selectedGame && React.createElement('div', {
      key: 'props-section',
      className: 'bg-white rounded-lg border border-gray-200 p-4'
    }, [
      React.createElement('h4', {
        key: 'props-title',
        className: 'font-semibold text-gray-900 mb-3'
      }, 'Available Props (Demo)'),
      
      React.createElement('div', {
        key: 'props-grid',
        className: 'grid gap-2'
      }, [
        // Demo prop buttons
        ['Passing Yards O/U 250.5', 'Rushing Yards O/U 75.5', 'Touchdowns O/U 1.5'].map((propType, idx) =>
          React.createElement('button', {
            key: `prop-${idx}`,
            className: 'p-3 bg-gray-50 hover:bg-blue-50 rounded border text-left transition-colors',
            onClick: () => handleAddToParlayBuilder({
              type: propType,
              player: 'Demo Player',
              game: `${selectedGame.away_team} vs ${selectedGame.home_team}`,
              odds: Math.random() > 0.5 ? 110 : -110,
              sport: selectedGame.sport_title
            })
          }, [
            React.createElement('div', {
              key: 'type',
              className: 'font-medium text-gray-900'
            }, propType),
            React.createElement('div', {
              key: 'odds',
              className: 'text-sm text-green-600'
            }, utils.formatPrice(Math.random() > 0.5 ? 110 : -110))
          ])
        )
      ])
    ]),

    // Mini Modal - PROPERLY SCOPED
    React.createElement(MiniModal, {
      key: 'modal',
      isOpen: showMiniModal,
      onClose: () => setShowMiniModal(false),
      title: 'Added to Parlay!'
    }, lastAddedProp ? `${lastAddedProp.type} added to parlay builder` : 'Prop added successfully!')
  ]);
};

// FIXED Parlay Builder Component - PROPERLY SCOPED showMiniModal
const ParlayBuilder = ({ isMobile }) => {
  const [parlayBets, setParlayBets] = React.useState([]);
  const [savedParlays, setSavedParlays] = React.useState(
    JSON.parse(localStorage.getItem('savedParlays') || '[]')
  );
  const [showMiniModal, setShowMiniModal] = React.useState(false);
  const [lastAddedLeg, setLastAddedLeg] = React.useState(null);

  const handleAddToParlayBuilder = (bet) => {
    try {
      console.log('🎯 Adding bet to parlay:', bet);
      setParlayBets(prev => [...prev, bet]);
      setLastAddedLeg(bet);
      setShowMiniModal(true);
      
      // Auto-hide modal after 2 seconds
      setTimeout(() => {
        setShowMiniModal(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error adding to parlay builder:', error);
    }
  };

  // Load bets from localStorage (from other components)
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
        localStorage.removeItem('currentParlayBets'); // Clear after loading
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
            key: 'current-title',
            className: 'font-semibold text-gray-900 mb-3'
          }, `Current Parlay (${parlayBets.length} bets)`),
          
          parlayBets.length === 0 ? 
            React.createElement('p', {
              key: 'empty',
              className: 'text-gray-500 text-center py-4'
            }, 'No bets added yet. Add bets from the games above!') :
            React.createElement('div', {
              key: 'bets-list',
              className: 'space-y-2'
            }, [
              ...parlayBets.map((bet, index) => 
                React.createElement('div', {
                  key: `bet-${index}`,
                  className: 'flex justify-between items-center p-3 bg-gray-50 rounded border'
                }, [
                  React.createElement('div', {
                    key: 'bet-info',
                    className: 'flex-1'
                  }, [
                    React.createElement('div', {
                      key: 'bet-details',
                      className: 'font-medium'
                    }, `${bet.team || bet.player || 'Unknown'} ${bet.type}`),
                    React.createElement('div', {
                      key: 'bet-game',
                      className: 'text-sm text-gray-600'
                    }, bet.game || 'Unknown Game')
                  ]),
                  React.createElement('div', {
                    key: 'bet-odds',
                    className: 'text-green-600 font-bold mr-2'
                  }, utils.formatPrice(bet.odds || bet.price)),
                  React.createElement('button', {
                    key: 'remove',
                    className: 'text-red-500 hover:text-red-700 text-sm font-medium',
                    onClick: () => removeBet(index)
                  }, '✕')
                ])
              ),
              
              // Parlay Summary
              parlayBets.length > 1 && React.createElement('div', {
                key: 'summary',
                className: 'border-t pt-3 mt-3'
              }, [
                React.createElement('div', {
                  key: 'odds',
                  className: 'flex justify-between font-bold text-lg'
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
                  key: 'payout',
                  className: 'flex justify-between text-sm text-gray-600'
                }, [
                  React.createElement('span', {
                    key: 'label'
                  }, 'Potential Payout ($100 bet):'),
                  React.createElement('span', {
                    key: 'value'
                  }, `$${potentialPayout}`)
                ])
              ])
            ]),

          // Action Buttons
          parlayBets.length > 0 && React.createElement('div', {
            key: 'actions',
            className: 'flex gap-2 mt-4'
          }, [
            React.createElement('button', {
              key: 'save',
              className: 'flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors',
              onClick: saveParlayBuilder
            }, '💾 Save Parlay'),
            React.createElement('button', {
              key: 'clear',
              className: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors',
              onClick: clearParlayBuilder
            }, 'Clear')
          ])
        ]),

        // Saved Parlays
        savedParlays.length > 0 && React.createElement('div', {
          key: 'saved',
          className: 'bg-white rounded-lg p-4 border border-gray-200'
        }, [
          React.createElement('h3', {
            key: 'saved-title',
            className: 'font-semibold text-gray-900 mb-3'
          }, `Saved Parlays (${savedParlays.length})`),
          
          React.createElement('div', {
            key: 'saved-list',
            className: 'space-y-2'
          }, savedParlays.slice(-5).reverse().map(parlay => 
            React.createElement('div', {
              key: `parlay-${parlay.id}`,
              className: 'p-3 bg-gray-50 rounded border'
            }, [
              React.createElement('div', {
                key: 'parlay-header',
                className: 'flex justify-between items-center mb-2'
              }, [
                React.createElement('span', {
                  key: 'date',
                  className: 'text-sm font-medium'
                }, new Date(parlay.created).toLocaleDateString()),
                React.createElement('span', {
                  key: 'info',
                  className: 'text-sm text-green-600 font-bold'
                }, `${parlay.bets.length} legs • +${Math.round((parlay.totalOdds - 1) * 100)}`)
              ]),
              React.createElement('div', {
                key: 'parlay-bets',
                className: 'text-xs text-gray-600'
              }, parlay.bets.map(bet => `${bet.team || bet.player} ${bet.type}`).join(' • '))
            ])
          ))
        ]),

        // Mini Modal - PROPERLY SCOPED
        React.createElement(MiniModal, {
          key: 'modal',
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
          onClick: () => window.location.reload()
        }, 'Reload Page')
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

  // Update mobile state on resize
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile !== state.isMobile) {
        const newState = { ...state, isMobile };
        setState(newState);
        appState.setState(newState);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isMobile]);

  // Load games on mount
  React.useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading games...');
      const fetchedGames = await api.fetchAllGames();
      
      if (fetchedGames.length === 0) {
        setError('No games available at the moment');
      } else {
        setGames(fetchedGames);
        console.log(`✅ Total games loaded: ${fetchedGames.length}`);
      }
    } catch (error) {
      console.error('❌ Error loading games:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToView = (view) => {
    const newState = { ...state, currentView: view };
    setState(newState);
    appState.setState(newState);
  };

  const renderNavigation = () => {
    return React.createElement('nav', {
      className: `bg-white border-b border-gray-200 ${state.isMobile ? 'px-4 py-3' : 'px-6 py-4'}`
    }, [
      React.createElement('div', {
        key: 'nav-container',
        className: 'flex justify-between items-center'
      }, [
        React.createElement('h1', {
          key: 'logo',
          className: `${state.isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-600`
        }, '⚡ Nova Titan Sports'),
        
        React.createElement('div', {
          key: 'nav-buttons',
          className: `flex ${state.isMobile ? 'space-x-2' : 'space-x-4'}`
        }, [
          ['home', '🏠 Home'],
          ['parlays', '🏆 Parlays']
        ].map(([view, label]) =>
          React.createElement('button', {
            key: view,
            className: `px-3 py-2 rounded transition-colors ${
              state.currentView === view 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            } ${state.isMobile ? 'text-sm' : ''}`,
            onClick: () => navigateToView(view)
          }, label)
        ))
      ])
    ]);
  };

  const renderContent = () => {
    if (state.currentView === 'parlays') {
      return React.createElement(ParlayBuilder, { isMobile: state.isMobile });
    }

    return React.createElement('div', {
      className: 'space-y-6'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'text-center'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: `${state.isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`
        }, '🔥 Live Sports Betting'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-600'
        }, 'Real odds from major sportsbooks')
      ]),

      // Games Section
      React.createElement('div', {
        key: 'games-section'
      }, [
        React.createElement('div', {
          key: 'games-header',
          className: 'flex justify-between items-center mb-4'
        }, [
          React.createElement('h3', {
            key: 'games-title',
            className: `${state.isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`
          }, `📊 Live Games (${games.length})`),
          React.createElement('button', {
            key: 'refresh',
            className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50',
            onClick: loadGames,
            disabled: isLoading
          }, isLoading ? '🔄 Loading...' : '🔄 Refresh')
        ]),

        error ? React.createElement('div', {
          key: 'error',
          className: 'text-center py-8 text-red-600 bg-red-50 rounded-lg'
        }, `❌ ${error}`) :
        isLoading ? React.createElement('div', {
          key: 'loading',
          className: 'text-center py-8'
        }, '🔄 Loading games...') :
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
      ]),

      // Player Props Section
      games.length > 0 && React.createElement('div', {
        key: 'props-section',
        className: 'border-t border-gray-200 pt-6'
      }, [
        React.createElement(PlayerPropsDropdown, {
          key: 'player-props',
          games: games,
          isMobile: state.isMobile
        })
      ])
    ]);
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gray-50'
  }, [
    renderNavigation(),
    React.createElement('main', {
      key: 'main',
      className: `${state.isMobile ? 'p-4' : 'p-6'} max-w-7xl mx-auto`
    }, renderContent())
  ]);
};

// Initialize App
const initializeApp = () => {
  console.log('🚀 Initializing Nova Titan Sports App...');
  
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
  
  const root = document.getElementById('root');
  if (root) {
    const reactRoot = ReactDOM.createRoot ? ReactDOM.createRoot(root) : null;
    
    if (reactRoot) {
      reactRoot.render(React.createElement(NovaTitanApp));
    } else {
      ReactDOM.render(React.createElement(NovaTitanApp), root);
    }
    
    console.log('✅ Nova Titan Sports App initialized successfully!');
  } else {
    console.error('❌ Root element not found');
  }
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}