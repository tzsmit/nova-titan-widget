/**
 * Dashboard Hero Component
 * Welcome banner with performance stats and CTAs
 */

import React from 'react';
import './DashboardHero.css';

export interface DashboardStats {
  currentStreak: number;
  accuracy: string;
  winRate: string;
  totalPicks: number;
  roi: string;
  picksToday: number;
}

interface DashboardHeroProps {
  stats: DashboardStats;
  userName?: string;
  onBuildStreak?: () => void;
  onViewAnalytics?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  stats,
  userName = 'Champion',
  onBuildStreak,
  onViewAnalytics
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <div className="dashboard-hero">
      {/* Background Decoration */}
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>
      
      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          {getGreeting()}, {userName} 🏆
        </h1>
        <p className="hero-subtitle">
          {stats.currentStreak > 0 ? (
            <>
              You're on a <strong className="highlight">{stats.currentStreak}-game win streak</strong> 
            </>
          ) : (
            <>
              Ready to build your next <strong className="highlight">winning streak</strong>
            </>
          )}
          {' • '}
          Your models are <strong className="highlight">{stats.accuracy} accurate</strong> this week
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="hero-stats">
        <HeroStatCard 
          label="Win Rate (30D)" 
          value={stats.winRate} 
          change="+4.2%" 
          icon="📈" 
          trend="up"
        />
        <HeroStatCard 
          label="Total Picks" 
          value={stats.totalPicks.toString()} 
          change={`+${stats.picksToday} today`} 
          icon="🎯"
        />
        <HeroStatCard 
          label="ROI" 
          value={stats.roi} 
          change="+18.4%" 
          icon="💰" 
          trend="up"
        />
        <HeroStatCard 
          label="Current Streak" 
          value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'Win' : 'Wins'}`} 
          icon="🔥"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="hero-actions">
        <button 
          className="hero-cta hero-cta--primary"
          onClick={onBuildStreak}
        >
          🚀 Build Today's Streak
        </button>
        <button 
          className="hero-cta hero-cta--secondary"
          onClick={onViewAnalytics}
        >
          📊 View Analytics
        </button>
      </div>
    </div>
  );
};

/**
 * Hero Stat Card
 */
interface HeroStatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: string;
  trend?: 'up' | 'down';
}

const HeroStatCard: React.FC<HeroStatCardProps> = ({ 
  label, 
  value, 
  change, 
  icon,
  trend 
}) => {
  return (
    <div className="hero-stat-card">
      <div className="hero-stat-card__icon">{icon}</div>
      <div className="hero-stat-card__content">
        <div className="hero-stat-card__label">{label}</div>
        <div className="hero-stat-card__value">{value}</div>
        {change && (
          <div className={`hero-stat-card__change ${trend ? `trend-${trend}` : ''}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHero;
