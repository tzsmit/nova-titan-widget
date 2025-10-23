/**
 * User Tracking Panel - Personalized AI Insights
 * "AI prioritizes user's tracked teams/players in answers"
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Users, 
  User, 
  Plus, 
  X, 
  Search,
  TrendingUp,
  Target,
  Settings,
  Trash2,
  Edit3
} from 'lucide-react';
import { aiReasoningEngine } from '../../services/aiReasoningEngine';

interface TrackedEntity {
  name: string;
  team?: string;
  sport: string;
  priority: number;
  addedAt: string;
}

interface UserTrackingPanelProps {
  className?: string;
}

export const UserTrackingPanel: React.FC<UserTrackingPanelProps> = ({ className = '' }) => {
  const [trackedPlayers, setTrackedPlayers] = useState<TrackedEntity[]>([]);
  const [trackedTeams, setTrackedTeams] = useState<TrackedEntity[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPlayer, setNewPlayer] = useState({ name: '', team: '', sport: 'NBA' });
  const [newTeam, setNewTeam] = useState({ name: '', sport: 'NBA' });

  // Load tracked entities on mount
  useEffect(() => {
    loadTrackedEntities();
  }, []);

  const loadTrackedEntities = () => {
    const entities = aiReasoningEngine.getTrackedEntities();
    setTrackedPlayers(entities.players.map(p => ({
      name: p.name,
      team: p.team,
      sport: p.sport,
      priority: p.priority,
      addedAt: new Date().toISOString() // Fallback
    })));
    setTrackedTeams(entities.teams.map(t => ({
      name: t.name,
      sport: t.sport,
      priority: t.priority,
      addedAt: new Date().toISOString() // Fallback
    })));
  };

  const handleAddPlayer = () => {
    if (newPlayer.name.trim() && newPlayer.team.trim()) {
      aiReasoningEngine.addTrackedPlayer(newPlayer.name, newPlayer.team, newPlayer.sport);
      loadTrackedEntities();
      setNewPlayer({ name: '', team: '', sport: 'NBA' });
      setShowAddPlayer(false);
    }
  };

  const handleAddTeam = () => {
    if (newTeam.name.trim()) {
      aiReasoningEngine.addTrackedTeam(newTeam.name, newTeam.sport);
      loadTrackedEntities();
      setNewTeam({ name: '', sport: 'NBA' });
      setShowAddTeam(false);
    }
  };

  const removeTrackedPlayer = (playerName: string) => {
    // This would need to be implemented in aiReasoningEngine
    console.log('Remove player:', playerName);
    // For now, just reload
    loadTrackedEntities();
  };

  const removeTrackedTeam = (teamName: string) => {
    // This would need to be implemented in aiReasoningEngine
    console.log('Remove team:', teamName);
    // For now, just reload
    loadTrackedEntities();
  };

  const popularPlayers = [
    { name: 'LeBron James', team: 'Lakers', sport: 'NBA' },
    { name: 'Stephen Curry', team: 'Warriors', sport: 'NBA' },
    { name: 'Kevin Durant', team: 'Suns', sport: 'NBA' },
    { name: 'Giannis Antetokounmpo', team: 'Bucks', sport: 'NBA' },
    { name: 'Luka Doncic', team: 'Mavericks', sport: 'NBA' },
    { name: 'Nikola Jokic', team: 'Nuggets', sport: 'NBA' }
  ];

  const popularTeams = [
    { name: 'Lakers', sport: 'NBA' },
    { name: 'Warriors', sport: 'NBA' },
    { name: 'Celtics', sport: 'NBA' },
    { name: 'Heat', sport: 'NBA' },
    { name: 'Nets', sport: 'NBA' },
    { name: 'Clippers', sport: 'NBA' }
  ];

  const filteredPlayers = popularPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = popularTeams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`w-full max-w-4xl mx-auto ${className}`}
      style={{ 
        fontFamily: 'var(--nova-font-family)',
        color: 'var(--nova-text-primary)'
      }}
    >
      {/* Header */}
      <div 
        className="p-6 rounded-2xl mb-6 nova-animate-fade-in"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
          boxShadow: 'var(--nova-shadow-lg)'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold nova-text-gradient">
              🎯 Personalized Tracking
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Track your favorite players and teams for prioritized AI insights
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="p-3 rounded-lg text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--nova-glass-border)'
            }}
          >
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--nova-primary-400)' }}
            >
              {trackedPlayers.length}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Tracked Players
            </div>
          </div>
          <div 
            className="p-3 rounded-lg text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--nova-glass-border)'
            }}
          >
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--nova-success)' }}
            >
              {trackedTeams.length}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Tracked Teams
            </div>
          </div>
          <div 
            className="p-3 rounded-lg text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--nova-glass-border)'
            }}
          >
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--nova-warning)' }}
            >
              AI Priority
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Enhanced
            </div>
          </div>
          <div 
            className="p-3 rounded-lg text-center"
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--nova-glass-border)'
            }}
          >
            <div 
              className="text-lg font-bold"
              style={{ color: 'var(--nova-purple-500)' }}
            >
              Insights
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              Personalized
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Players Section */}
      <div 
        className="nova-card mb-6"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-green-400" />
            Tracked Players ({trackedPlayers.length})
          </h3>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="nova-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {/* Player List */}
        {trackedPlayers.length > 0 ? (
          <div className="space-y-3">
            {trackedPlayers.map((player, index) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg nova-transition"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--nova-glass-border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: 'var(--nova-text-primary)' }}
                    >
                      {player.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--nova-text-secondary)' }}
                    >
                      {player.team} • {player.sport}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: 'var(--nova-success)'
                    }}
                  >
                    Priority {player.priority}
                  </div>
                  <button
                    onClick={() => removeTrackedPlayer(player.name)}
                    className="p-1 rounded hover:bg-red-500/20 nova-transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p 
              className="text-sm"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              No tracked players. Add players to get personalized AI insights.
            </p>
          </div>
        )}
      </div>

      {/* Tracked Teams Section */}
      <div 
        className="nova-card mb-6"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Tracked Teams ({trackedTeams.length})
          </h3>
          <button
            onClick={() => setShowAddTeam(true)}
            className="nova-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Team
          </button>
        </div>

        {/* Team List */}
        {trackedTeams.length > 0 ? (
          <div className="space-y-3">
            {trackedTeams.map((team, index) => (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg nova-transition"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--nova-glass-border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: 'var(--nova-text-primary)' }}
                    >
                      {team.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--nova-text-secondary)' }}
                    >
                      {team.sport}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: 'var(--nova-primary-400)'
                    }}
                  >
                    Priority {team.priority}
                  </div>
                  <button
                    onClick={() => removeTrackedTeam(team.name)}
                    className="p-1 rounded hover:bg-red-500/20 nova-transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p 
              className="text-sm"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              No tracked teams. Add teams to get personalized AI insights.
            </p>
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      <AnimatePresence>
        {showAddPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPlayer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="nova-card max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Player to Track</h3>
                <button
                  onClick={() => setShowAddPlayer(false)}
                  className="p-1 rounded hover:bg-gray-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Popular Players */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search popular players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg nova-transition"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--nova-glass-border)',
                      color: 'var(--nova-text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Popular Players */}
              <div className="mb-4 max-h-40 overflow-y-auto">
                {filteredPlayers.map((player) => (
                  <button
                    key={player.name}
                    onClick={() => {
                      aiReasoningEngine.addTrackedPlayer(player.name, player.team, player.sport);
                      loadTrackedEntities();
                      setShowAddPlayer(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-500/20 nova-transition"
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-400">{player.team} • {player.sport}</div>
                  </button>
                ))}
              </div>

              {/* Manual Entry */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Player name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--nova-glass-border)',
                    color: 'var(--nova-text-primary)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Team name"
                  value={newPlayer.team}
                  onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--nova-glass-border)',
                    color: 'var(--nova-text-primary)'
                  }}
                />
                <select
                  value={newPlayer.sport}
                  onChange={(e) => setNewPlayer({...newPlayer, sport: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--nova-glass-border)',
                    color: 'var(--nova-text-primary)'
                  }}
                >
                  <option value="NBA">NBA</option>
                  <option value="NFL">NFL</option>
                  <option value="MLB">MLB</option>
                </select>
                <button
                  onClick={handleAddPlayer}
                  className="w-full nova-btn-primary"
                >
                  Add Player
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Team Modal */}
      <AnimatePresence>
        {showAddTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddTeam(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="nova-card max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Team to Track</h3>
                <button
                  onClick={() => setShowAddTeam(false)}
                  className="p-1 rounded hover:bg-gray-500/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Popular Teams */}
              <div className="mb-4 max-h-40 overflow-y-auto">
                {filteredTeams.map((team) => (
                  <button
                    key={team.name}
                    onClick={() => {
                      aiReasoningEngine.addTrackedTeam(team.name, team.sport);
                      loadTrackedEntities();
                      setShowAddTeam(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-500/20 nova-transition"
                  >
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-gray-400">{team.sport}</div>
                  </button>
                ))}
              </div>

              {/* Manual Entry */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--nova-glass-border)',
                    color: 'var(--nova-text-primary)'
                  }}
                />
                <select
                  value={newTeam.sport}
                  onChange={(e) => setNewTeam({...newTeam, sport: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--nova-glass-border)',
                    color: 'var(--nova-text-primary)'
                  }}
                >
                  <option value="NBA">NBA</option>
                  <option value="NFL">NFL</option>
                  <option value="MLB">MLB</option>
                </select>
                <button
                  onClick={handleAddTeam}
                  className="w-full nova-btn-primary"
                >
                  Add Team
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};