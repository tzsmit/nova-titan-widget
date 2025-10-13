import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Trophy, Shield, Zap, TrendingUp, Users, Activity, Wifi } from 'lucide-react'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-nova-gradient">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Nova Titan Branding */}
          <header className="text-center mb-12">
            {/* Nova Titan Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-nova-metallic rounded-full mb-8 shadow-nova-lg">
              <div className="relative">
                <Shield className="w-12 h-12 text-nova-gold-500" />
                <Trophy className="w-6 h-6 text-white absolute -top-1 -right-1" />
              </div>
            </div>
            
            {/* Brand Title */}
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-nova-silver-200 to-nova-gold-400 bg-clip-text text-transparent">
              NOVA TITAN
            </h1>
            <div className="text-2xl font-semibold text-nova-blue-300 mb-4">
              SPORTS WIDGET
            </div>
            
            {/* Tagline */}
            <p className="text-xl text-nova-silver-300 max-w-3xl mx-auto mb-8">
              Advanced Sports Intelligence • Real-Time Data Analytics • Professional Grade Performance
            </p>
            
            {/* Status Indicators */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                <Wifi className="w-4 h-4 mr-2 animate-pulse" />
                System Online
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-nova-gold-500/20 text-nova-gold-400 rounded-full text-sm font-medium border border-nova-gold-500/30">
                <Zap className="w-4 h-4 mr-2" />
                Real-Time Ready
              </div>
            </div>
          </header>
          
          {/* Core Features Grid */}
          <section className="max-w-6xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Core Capabilities
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Trophy className="w-10 h-10 text-nova-gold-400" />,
                  title: "Live Scores",
                  description: "Real-time game scores and match updates",
                  gradient: "from-nova-gold-500 to-nova-gold-600"
                },
                {
                  icon: <Activity className="w-10 h-10 text-green-400" />,
                  title: "Live Data Feeds",
                  description: "Dynamic statistics and performance metrics",
                  gradient: "from-green-500 to-green-600"
                },
                {
                  icon: <TrendingUp className="w-10 h-10 text-nova-blue-400" />,
                  title: "Advanced Analytics",
                  description: "AI-powered insights and trend analysis",
                  gradient: "from-nova-blue-500 to-nova-blue-600"
                },
                {
                  icon: <Users className="w-10 h-10 text-purple-400" />,
                  title: "Team Intelligence",
                  description: "Comprehensive team and player profiles",
                  gradient: "from-purple-500 to-purple-600"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 text-center shadow-nova"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-4 group-hover:shadow-lg transition-all`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-nova-silver-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Main Sports Widget Demo */}
          <main className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-nova-lg overflow-hidden">
              {/* Widget Header */}
              <div className="bg-nova-metallic p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sports Intelligence Dashboard</h2>
                    <p className="text-nova-silver-300">Live odds and real-time match data</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">LIVE</span>
                  </div>
                </div>
              </div>
              
              {/* Sports Data Grid */}
              <div className="p-6">
                <div className="grid gap-4">
                  {[
                    {
                      league: "NFL",
                      home: "Kansas City Chiefs",
                      away: "Buffalo Bills",
                      time: "Live • Q3 8:45",
                      homeOdds: "1.85",
                      awayOdds: "1.95",
                      status: "live"
                    },
                    {
                      league: "NBA",
                      home: "Los Angeles Lakers",
                      away: "Boston Celtics", 
                      time: "Tonight • 8:00 PM",
                      homeOdds: "2.10",
                      awayOdds: "1.75",
                      status: "upcoming"
                    },
                    {
                      league: "Premier League",
                      home: "Manchester City",
                      away: "Arsenal",
                      time: "Tomorrow • 3:00 PM",
                      homeOdds: "1.65",
                      awayOdds: "2.25",
                      status: "upcoming"
                    }
                  ].map((match, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                      {/* League and Status */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-nova-blue-400 uppercase tracking-wide">
                          {match.league}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-nova-gold-500'}`}></div>
                          <span className="text-xs text-nova-silver-400">
                            {match.time}
                          </span>
                        </div>
                      </div>
                      
                      {/* Teams */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-white font-semibold text-lg">{match.away}</div>
                        <div className="text-nova-silver-400 text-sm font-medium">VS</div>
                        <div className="text-white font-semibold text-lg">{match.home}</div>
                      </div>
                      
                      {/* Odds */}
                      <div className="flex justify-between">
                        <div className="flex-1 bg-white/5 rounded p-3 text-center mr-2">
                          <div className="text-nova-silver-400 text-xs mb-1">Away Win</div>
                          <div className="text-nova-gold-400 font-bold text-xl">{match.awayOdds}</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded p-3 text-center ml-2">
                          <div className="text-nova-silver-400 text-xs mb-1">Home Win</div>
                          <div className="text-nova-gold-400 font-bold text-xl">{match.homeOdds}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Widget Footer */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-center">
                    <div className="inline-flex items-center px-6 py-3 bg-nova-blue-500/20 text-nova-blue-400 rounded-full border border-nova-blue-500/30">
                      <Activity className="w-5 h-5 mr-3 animate-pulse" />
                      <span className="font-medium">Updates every 30 seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="text-center mt-12">
            <div className="text-nova-silver-400 mb-4">
              <p className="text-lg">&copy; 2024 Nova Titan Sports Intelligence</p>
              <p className="text-sm">Professional Sports Data • Real-Time Analytics • Enterprise Grade</p>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-nova-silver-500">
              <span>React + TypeScript</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>TanStack Query</span>
            </div>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App