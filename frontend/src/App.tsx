import React from 'react'
import { Trophy, Activity, TrendingUp, Users } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-nova-silver-900 via-nova-silver-800 to-nova-silver-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Nova Titan Sports Widget
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Interactive Sports Data Visualization Platform
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              System Online
            </div>
          </div>
        </header>
        
        {/* Features Grid */}
        <main className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Demo Widget */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Sports Widget Demo</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-blue-400 uppercase">NFL</span>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-white font-medium">Kansas City Chiefs</div>
                  <div className="text-xs text-gray-400">vs</div>
                  <div className="text-white font-medium">Buffalo Bills</div>
                </div>
                <div className="flex justify-between text-sm bg-white/5 rounded p-2">
                  <div className="text-center flex-1">
                    <div className="text-gray-400 text-xs">Odds</div>
                    <div className="text-green-400 font-bold text-lg">1.85</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-gray-400 text-xs">Odds</div>
                    <div className="text-green-400 font-bold text-lg">1.95</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-blue-400 uppercase">NBA</span>
                  <span className="text-xs text-gray-400">Tonight</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-white font-medium">LA Lakers</div>
                  <div className="text-xs text-gray-400">vs</div>
                  <div className="text-white font-medium">Boston Celtics</div>
                </div>
                <div className="flex justify-between text-sm bg-white/5 rounded p-2">
                  <div className="text-center flex-1">
                    <div className="text-gray-400 text-xs">Odds</div>
                    <div className="text-green-400 font-bold text-lg">2.10</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-gray-400 text-xs">Odds</div>
                    <div className="text-green-400 font-bold text-lg">1.75</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Ready for API Integration
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-400">
          <p>&copy; 2024 Nova Titan Sports Widget. Built with React + TypeScript.</p>
          <p className="text-sm mt-2">Ready for live sports data integration</p>
        </footer>
      </div>
    </div>
  )
}

export default App
