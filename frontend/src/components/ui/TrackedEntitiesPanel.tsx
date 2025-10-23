/**
 * Tracked Entities Panel - Player and Team Tracking Management
 * Replace Legacy AI Analysis with professional entity tracking
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  Shield,
  Star,
  Plus,
  X,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Activity,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Filter
} from 'lucide-react';
import { aiReasoningEngine } from '../../services/aiReasoningEngine';

interface TrackedPlayer {
  name: string;
  team: string;
  sport: string;
  priority: number;
}

interface TrackedTeam {
  name: string;
  sport: string;
  priority: number;
}

interface TrackedEntitiesPanelProps {
  className?: string;
}

export const TrackedEntitiesPanel: React.FC<TrackedEntitiesPanelProps> = ({ 
  className = '' 
}) => {
  const [trackedEntities, setTrackedEntities] = useState(() => aiReasoningEngine.getTrackedEntities());
  const [selectedTab, setSelectedTab] = useState<'players' | 'teams'>('players');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState('');
  
  // Form states
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityTeam, setNewEntityTeam] = useState('');
  const [newEntitySport, setNewEntitySport] = useState('NBA');

  // Refresh tracked entities from AI engine
  const refreshTrackedEntities = () => {
    setTrackedEntities(aiReasoningEngine.getTrackedEntities());
  };

  // Add new player
  const handleAddPlayer = () => {
    if (!newEntityName.trim() || !newEntityTeam.trim()) return;
    
    aiReasoningEngine.addTrackedPlayer(
      newEntityName.trim(),
      newEntityTeam.trim(),
      newEntitySport
    );
    
    refreshTrackedEntities();
    setNewEntityName('');
    setNewEntityTeam('');
    setShowAddForm(false);
  };

  // Add new team
  const handleAddTeam = () => {
    if (!newEntityName.trim()) return;
    
    aiReasoningEngine.addTrackedTeam(
      newEntityName.trim(),
      newEntitySport
    );
    
    refreshTrackedEntities();
    setNewEntityName('');
    setShowAddForm(false);
  };

  // Remove tracked entity (would need to be implemented in aiReasoningEngine)
  const handleRemoveEntity = (type: 'player' | 'team', index: number) => {
    // For now, we'll just refresh - this would need a removal method in aiReasoningEngine
    console.log(`Remove ${type} at index ${index}`);
    // refreshTrackedEntities();
  };

  // Filter entities based on search and sport
  const filteredPlayers = useMemo(() => {
    return trackedEntities.players.filter(player => {
      const matchesSearch = !searchQuery || 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = !filterSport || player.sport === filterSport;
      return matchesSearch && matchesSport;
    });
  }, [trackedEntities.players, searchQuery, filterSport]);

  const filteredTeams = useMemo(() => {
    return trackedEntities.teams.filter(team => {
      const matchesSearch = !searchQuery || 
        team.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = !filterSport || team.sport === filterSport;
      return matchesSearch && matchesSport;
    });
  }, [trackedEntities.teams, searchQuery, filterSport]);

  // Get unique sports from tracked entities
  const availableSports = useMemo(() => {
    const sports = new Set([
      ...trackedEntities.players.map(p => p.sport),
      ...trackedEntities.teams.map(t => t.sport)
    ]);
    return Array.from(sports);
  }, [trackedEntities]);

  const renderAddForm = () => (
    <AnimatePresence>
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="nova-card p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 
              className="text-base font-semibold"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              Add {selectedTab === 'players' ? 'Player' : 'Team'}
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="nova-btn-secondary p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                {selectedTab === 'players' ? 'Player Name' : 'Team Name'}
              </label>
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                placeholder={selectedTab === 'players' ? 'LeBron James' : 'Los Angeles Lakers'}
                className="nova-input w-full"
              />
            </div>
            
            {selectedTab === 'players' && (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Team
                </label>
                <input
                  type="text"
                  value={newEntityTeam}
                  onChange={(e) => setNewEntityTeam(e.target.value)}
                  placeholder="Los Angeles Lakers"
                  className="nova-input w-full"
                />
              </div>
            )}
            
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Sport
              </label>
              <select
                value={newEntitySport}
                onChange={(e) => setNewEntitySport(e.target.value)}
                className="nova-input w-full"
              >
                <option value="NBA">NBA</option>
                <option value="NFL">NFL</option>
                <option value="MLB">MLB</option>
                <option value="NHL">NHL</option>
                <option value="NCAAB">NCAAB</option>
                <option value="NCAAF">NCAAF</option>
              </select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={selectedTab === 'players' ? handleAddPlayer : handleAddTeam}
                disabled={!newEntityName.trim() || (selectedTab === 'players' && !newEntityTeam.trim())}
                className="nova-btn-primary flex-1 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedTab === 'players' ? 'Player' : 'Team'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="nova-btn-secondary px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPlayerCard = (player: TrackedPlayer, index: number) => (
    <motion.div
      key={`${player.name}-${player.team}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="nova-metric-card p-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              {player.name}
            </div>
            <div 
              className="text-xs flex items-center gap-2 mt-1"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              <Shield className="w-3 h-3" />
              {player.team}
              <span className="text-xs px-1 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {player.sport}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, player.priority) }, (_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          {/* 
          <button
            onClick={() => handleRemoveEntity('player', index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity nova-btn-secondary p-1 ml-2"
          >
            <X className="w-3 h-3" />
          </button>
          */}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-400" />
            <span style={{ color: 'var(--nova-text-secondary)' }}>
              Tracking Priority: {player.priority}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTeamCard = (team: TrackedTeam, index: number) => (
    <motion.div
      key={team.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="nova-metric-card p-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              {team.name}
            </div>
            <div 
              className="text-xs flex items-center gap-2 mt-1"
              style={{ color: 'var(--nova-text-secondary)' }}
            >
              <span className="text-xs px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">
                {team.sport}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, team.priority) }, (_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          {/* 
          <button
            onClick={() => handleRemoveEntity('team', index)}
            className="opacity-0 group-hover:opacity-100 transition-opacity nova-btn-secondary p-1 ml-2"
          >
            <X className="w-3 h-3" />
          </button>
          */}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-400" />
            <span style={{ color: 'var(--nova-text-secondary)' }}>
              Tracking Priority: {team.priority}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const currentEntities = selectedTab === 'players' ? filteredPlayers : filteredTeams;
  const totalEntities = selectedTab === 'players' 
    ? trackedEntities.players.length 
    : trackedEntities.teams.length;

  return (
    <div className={`nova-card ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--nova-purple-500) 0%, var(--nova-primary-500) 100%)' 
              }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                Tracked Entities
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Your personalized watchlist
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="nova-btn-primary p-2"
            title={`Add ${selectedTab === 'players' ? 'player' : 'team'}`}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={() => setSelectedTab('players')}
            className={`px-4 py-2 rounded-lg nova-transition ${
              selectedTab === 'players' 
                ? 'nova-btn-primary' 
                : 'nova-btn-secondary'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Players ({trackedEntities.players.length})
          </button>
          <button
            onClick={() => setSelectedTab('teams')}
            className={`px-4 py-2 rounded-lg nova-transition ${
              selectedTab === 'teams' 
                ? 'nova-btn-primary' 
                : 'nova-btn-secondary'
            }`}
          >
            <Shield className="w-4 h-4 mr-2" />
            Teams ({trackedEntities.teams.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
              style={{ color: 'var(--nova-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedTab}...`}
              className="nova-input w-full pl-10"
            />
          </div>
          
          {availableSports.length > 0 && (
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="nova-input"
            >
              <option value="">All Sports</option>
              {availableSports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Add Form */}
      <div className="p-6 pt-0">
        {renderAddForm()}

        {/* Entities List */}
        {currentEntities.length > 0 ? (
          <div className="space-y-3">
            {selectedTab === 'players' 
              ? filteredPlayers.map((player, index) => renderPlayerCard(player, index))
              : filteredTeams.map((team, index) => renderTeamCard(team, index))
            }
          </div>
        ) : (
          <div className="text-center py-12">
            {totalEntities === 0 ? (
              <>
                <Users 
                  className="w-16 h-16 mx-auto mb-4" 
                  style={{ color: 'var(--nova-text-muted)' }} 
                />
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  No {selectedTab} tracked yet
                </h4>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Add your favorite {selectedTab} to start tracking their performance
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="nova-btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedTab === 'players' ? 'Player' : 'Team'}
                </button>
              </>
            ) : (
              <>
                <Search 
                  className="w-12 h-12 mx-auto mb-4" 
                  style={{ color: 'var(--nova-text-muted)' }} 
                />
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  No results found
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Try adjusting your search or filter criteria
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};