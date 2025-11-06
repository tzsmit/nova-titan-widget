/**
 * Player Prop Card - THE STAR COMPONENT
 * Displays comprehensive prop analysis with all metrics
 */

import React from 'react';
import { PropAnalysis } from '../../engine/analysisEngine';
import './PlayerPropCard.css';

interface PlayerPropCardProps {
  prop: PropAnalysis;
  onAddToStreak?: () => void;
  onViewDetails?: () => void;
}

export const PlayerPropCard: React.FC<PlayerPropCardProps> = ({
  prop,
  onAddToStreak,
  onViewDetails
}) => {
  return (
    <div 
      className="prop-card" 
      data-safety={prop.safetyScore >= 90 ? 'elite' : 'normal'}
      data-risk={prop.risk.level.toLowerCase()}
    >
      {/* Header with Player Info and Safety Badge */}
      <div className="prop-card__header">
        <div className="prop-card__player">
          {prop.display.playerImage && (
            <img 
              src={prop.display.playerImage} 
              alt={prop.player}
              className="prop-card__avatar" 
            />
          )}
          {!prop.display.playerImage && (
            <div className="prop-card__avatar-placeholder">
              {prop.player.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div className="prop-card__player-info">
            <h4 className="prop-card__name">{prop.player}</h4>
            <span className="prop-card__matchup">
              {prop.team} vs {prop.opponent}
            </span>
          </div>
        </div>
        <SafetyBadge score={prop.safetyScore} />
      </div>
      
      {/* Main Stat Display */}
      <div className="prop-card__stat">
        <div className="prop-card__stat-header">
          <span className="prop-card__stat-icon">{prop.display.statIcon}</span>
          <span className="prop-card__stat-type">{formatPropName(prop.prop)}</span>
        </div>
        
        <div className="prop-card__stat-line">
          <span className="prop-card__line-label">Line</span>
          <span className="prop-card__line-value">{prop.line}</span>
          <button 
            className={`rec-btn rec-btn--${prop.recommendation.toLowerCase()}`}
            disabled={prop.recommendation === 'AVOID'}
          >
            {prop.recommendation === 'HIGHER' && '▲'}
            {prop.recommendation === 'LOWER' && '▼'}
            {prop.recommendation === 'AVOID' && '⊘'}
            {' '}
            {prop.recommendation}
          </button>
        </div>
        
        <div className="prop-card__confidence">
          <div className="confidence-bar">
            <div 
              className="confidence-bar__fill"
              style={{ width: `${prop.confidence}%` }}
            />
          </div>
          <span className="confidence-label">{prop.confidence}% Confidence</span>
        </div>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="prop-card__quick-stats">
        {prop.display.quickStats.map((stat, index) => (
          <div key={index} className="quick-stat">
            <span className="quick-stat__label">{stat.label}</span>
            <span className="quick-stat__value">{stat.value}</span>
          </div>
        ))}
      </div>
      
      {/* Sparkline Chart */}
      <div className="prop-card__sparkline">
        <div className="sparkline-header">
          <span className="sparkline-label">Last 10 Games</span>
          <span className="sparkline-trend">
            {prop.metrics.trend === 'increasing' && '📈 Trending Up'}
            {prop.metrics.trend === 'decreasing' && '📉 Trending Down'}
            {prop.metrics.trend === 'stable' && '➡️ Stable'}
          </span>
        </div>
        <Sparkline data={prop.display.sparklineData} line={prop.line} />
      </div>
      
      {/* Context & Risk Info */}
      {prop.risk.warnings.length > 0 && (
        <div className="prop-card__warnings">
          {prop.risk.warnings.map((warning, index) => (
            <div key={index} className="warning-item">
              {warning}
            </div>
          ))}
        </div>
      )}
      
      {prop.context.injuryStatus !== 'healthy' && (
        <div className="prop-card__injury-alert">
          🚨 {prop.context.injuryStatus}
        </div>
      )}
      
      {/* Footer Actions */}
      <div className="prop-card__footer">
        <button 
          className="btn-ghost btn-sm"
          onClick={onViewDetails}
        >
          View Details
        </button>
        <button 
          className="btn-primary btn-sm"
          onClick={onAddToStreak}
          disabled={prop.risk.level === 'AVOID'}
        >
          Add to Streak
        </button>
      </div>
    </div>
  );
};

/**
 * Safety Badge Component
 */
interface SafetyBadgeProps {
  score: number;
}

const SafetyBadge: React.FC<SafetyBadgeProps> = ({ score }) => {
  const getLevel = (score: number) => {
    if (score >= 90) return 'elite';
    if (score >= 80) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };
  
  const getEmoji = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '✅';
    if (score >= 70) return '⚠️';
    return '🚫';
  };
  
  const level = getLevel(score);
  const emoji = getEmoji(score);
  
  return (
    <div className={`safety-badge safety-badge--${level}`}>
      <span className="safety-badge__emoji">{emoji}</span>
      <span className="safety-badge__score">{score}</span>
      <span className="safety-badge__label">Safety</span>
    </div>
  );
};

/**
 * Sparkline Chart Component
 */
interface SparklineProps {
  data: number[];
  line: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, line }) => {
  if (data.length === 0) return null;
  
  const max = Math.max(...data, line);
  const min = Math.min(...data, line);
  const range = max - min || 1;
  
  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range * 80) - 10;
    return `${x},${y}`;
  }).join(' ');
  
  // Calculate line position
  const lineY = 100 - ((line - min) / range * 80) - 10;
  
  return (
    <div className="sparkline-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Reference line */}
        <line
          x1="0"
          y1={lineY}
          x2="100"
          y2={lineY}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
        
        {/* Data line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#sparkline-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / range * 80) - 10;
          const isAboveLine = value > line;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={isAboveLine ? '#4caf50' : '#f44336'}
              opacity="0.8"
            />
          );
        })}
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Value labels */}
      <div className="sparkline-labels">
        <span className="sparkline-label-min">{min.toFixed(1)}</span>
        <span className="sparkline-label-max">{max.toFixed(1)}</span>
      </div>
    </div>
  );
};

/**
 * Format prop name for display
 */
function formatPropName(prop: string): string {
  return prop
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default PlayerPropCard;
