import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Trophy, Activity, TrendingUp, Users, Wifi, WifiOff } from 'lucide-react'

const queryClient = new QueryClient()

// Define the types we need
interface GameOdds {
  id: string
  sport_title: string
  home_team: string
  away_team: string
  commence_time: string
  bookmakers: Array<{
    title: string
    markets: Array<{
      key: string
      outcomes: Array<{
        name: string
        price: number
      }>
    }>
  }>
}

interface SportsApiResponse {
  demo?: boolean
  data: GameOdds[]
}

// Sample sports data hook
function useSportsData() {
  return useQuery({
    queryKey: ['sports-odds'],
    queryFn: async (): Promise<SportsApiResponse> => {
      // Using demo data for now
      return {
        demo: true,
        data: [
          {
            id: '1',
            sport_title: 'NFL',
            home_team: 'Kansas City Chiefs',
            away_team: 'Buffalo Bills',
            commence_time: new Date().toISOString(),
            bookmakers: [
              {
                title: 'DraftKings',
                markets: [
                  {
                    key: 'h2h',
                    outcomes: [
                      { name: 'Kansas City Chiefs', price: 1.85 },
                      { name: 'Buffalo Bills', price: 1.95 }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: '2',
            sport_title: 'NBA',
            home_team: 'Los Angeles Lakers',
            away_team: 'Boston Celtics',
            commence_time: new Date().toISOString(),
            bookmakers: [
              {
                title: 'FanDuel',
                markets: [
                  {
                    key: 'h2h',
                    outcomes: [
                      { name: 'Los Angeles Lakers', price: 2.10 },
                      { name: 'Boston Celtics', price: 1.75 }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: '3',
            sport_title: 'Premier League',
            home_team: 'Manchester City',
            away_team: 'Arsenal',
            commence_time: new Date().toISOString(),
            bookmakers: [
              {
                title: 'Bet365',
                markets: [
                  {
                    key: 'h2h',
                    outcomes: [
                      { name: 'Manchester City', price: 1.65 },
                      { name: 'Arsenal', price: 2.25 }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  })
}

function SportsWidget() {
  const { data, isLoading, error, isSuccess } = useSportsData()
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (isSuccess && data) {
      setIsLive(true)
      const interval = setInterval(() => {
        setIsLive(prev => !prev)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isSuccess, data])

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-white/20 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
        <div className="flex items-center text-red-400 mb-4">
          <WifiOff className="w-5 h-5 mr-2" />
          <span>Connection Failed</span>
        </div>
        <p className="text-red-300">Using demo data mode.</p>
      </div>
    )
  }

  const games = data?.data || []

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Live Sports Odds</h2>
        <div className="flex items-center text-green-400">
          <Wifi className={`w-4 h-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
          <span className="text-sm">{data?.demo ? 'Demo Mode' : 'Live Data'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {games.map((game, index) => (
          <div key={game.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-blue-400 uppercase">
                {game.sport_title}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(game.commence_time).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <div className="text-white font-medium">{game.away_team}</div>
              <div className="text-xs text-gray-400">vs</div>
              <div className="text-white font-medium">{game.home_team}</div>
            </div>
            
            {game.bookmakers?.[0] && (
              <div className="flex justify-between text-sm bg-white/5 rounded p-2">
                <div className="text-center flex-1">
                  <div className="text-gray-400 text-xs">{game.bookmakers[0].title}</div>
                  <div className="text-green-400 font-bold text-lg">
                    {game.bookmakers[0].markets[0]?.outcomes[0]?.price || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-300">{game.away_team}</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-gray-400 text-xs">{game.bookmakers[0].title}</div>
                  <div className="text-green-400 font-bold text-lg">
                    {game.bookmakers[0].markets[0]?.outcomes[1]?.price || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-300">{game.home_team}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          <Activity className="w-4 h-4 mr-2" />
          Updates every 30 seconds
        </div>
      </div>
    </div>
  )
}

function App() {
  const features = [
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Live Scores",
      description: "Real-time sports scores and updates"
    },
    {
      icon: <Activity className="w-8 h-8 text-green-400" />,
      title: "Live Data",
      description: "Dynamic data feeds and statistics"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
      title: "Analytics",
      description: "Advanced sports analytics and insights"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: "Team Stats",
      description: "Comprehensive team and player statistics"
    }
  ]

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-nova-silver-900 via-nova-silver-800 to-nova-silver-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-nova-blue-500 to-nova-blue-700 rounded-full mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-nova-silver-300 bg-clip-text text-transparent">
              Nova Titan Sports Widget
            </h1>
            <p className="text-xl text-nova-silver-300 max-w-2xl mx-auto">
              Live Sports Data & Real-Time Odds
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                System Online
              </div>
            </div>
          </header>
          
          {/* Features Grid */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 text-center"
                >
                  <div className="flex justify-center mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-nova-silver-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Live Sports Widget */}
          <main className="max-w-4xl mx-auto">
            <SportsWidget />
          </main>

          {/* Footer */}
          <footer className="text-center mt-12 text-nova-silver-400">
            <p>&copy; 2024 Nova Titan Sports Widget. Real-time sports data integration.</p>
            <p className="text-sm mt-2">Demo mode active - Configure API keys for live data</p>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
