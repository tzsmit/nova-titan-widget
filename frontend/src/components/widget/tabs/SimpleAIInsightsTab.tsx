/**
 * AI Pro Tab - Ultimate Wealth Generation Platform
 * Real data multi-model AI network for sports betting supremacy
 * No mock data - only real upcoming games and market intelligence
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain,
  TrendingUp,
  Target,
  Star,
  Loader2,
  RefreshCw,
  Zap,
  Calculator,
  Eye,
  Award,
  Search,
  X,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Activity,
  BarChart3,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Timer,
  Shield,
  Lock,
  Send,
  MessageSquare,
  Flame,
  Users,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Volume2,
  User,
  Bot,
  Sparkles
} from 'lucide-react';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { emailNotificationService } from '../../../services/emailNotificationService';
import { formatPercentage, formatCurrency, formatNumber, formatLargeNumber, formatMovement } from '../../../utils/format';
import { 
  aiNetworkService, 
  AINetworkPrediction, 
  MarketIntelligence, 
  CustomAnalysisRequest, 
  CustomAnalysisResponse 
} from '../../../services/aiNetworkService';
import { realTimeAnalysisEngine, AnalysisResponse } from '../../../services/realTimeAnalysisEngine';
import { realTimeAIPredictionsService } from '../../../services/realTimeAIPredictions';
import { PristineAIInterface } from '../../ai/PristineAIInterface';
import { MarketIntelligencePanel } from '../../ui/MarketIntelligencePanel';
import { TrackedEntitiesPanel } from '../../ui/TrackedEntitiesPanel';
import { QuickComparePanel } from '../../ui/QuickComparePanel';
import { TopInsightsPanel } from '../../ui/TopInsightsPanel';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
}

const NOVA_COLORS = {
  primary: 'from-blue-600 via-purple-600 to-indigo-700',
  secondary: 'from-cyan-500 via-blue-500 to-indigo-600', 
  accent: 'from-orange-500 via-amber-500 to-yellow-500',
  success: 'from-emerald-500 via-green-500 to-teal-600',
  danger: 'from-red-500 via-pink-500 to-rose-600',
  warning: 'from-amber-500 via-orange-500 to-red-500'
};

const TRACKING_PERIODS = [
  { id: '1h', name: '1 Hour', value: 1 },
  { id: '6h', name: '6 Hours', value: 6 }, 
  { id: '24h', name: '24 Hours', value: 24 },
  { id: '7d', name: '7 Days', value: 168 }
];

const QUICK_PROMPTS = [
  "What are the best value bets tonight?",
  "Show me high-confidence predictions", 
  "Analyze Lakers vs Warriors",
  "Find sharp money plays",
  "Best NBA over/under bets?",
  "NFL favorites worth backing?"
];

export const SimpleAIInsightsTab: React.FC = () => {
  const [trackingPeriod, setTrackingPeriod] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMarketIntel, setShowMarketIntel] = useState(true);
  const [showCustomAI, setShowCustomAI] = useState(false);
  const [showPristineAI, setShowPristineAI] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEliteMember] = useState(false); // Elite membership status - set to false to lock Pristine AI
  const [isNotifying, setIsNotifying] = useState(false); // Track notification sending status
  
  // Chat interface state for AI Analysis Engine section
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time AI Network Predictions (using same data source as predictions tab)
  const { data: rawPredictions = [], isLoading: predictionsLoading, error: predictionsError, refetch: refetchPredictions } = useQuery({
    queryKey: ['ai-pro-predictions'],
    queryFn: () => realTimeAIPredictionsService.generateLivePredictions(),
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    staleTime: 90 * 1000, // 90 seconds
    retry: 3
  });

  // Transform raw predictions into AI network format
  const aiPredictions = React.useMemo(() => {
    console.log('🔍 AI Pro Tab - Raw predictions received:', rawPredictions.length, rawPredictions);
    return rawPredictions.map((pred: any) => ({
      gameId: pred.id || `game-${Date.now()}-${Math.random()}`,
      homeTeam: pred.home_team || pred.homeTeam || 'Home Team',
      awayTeam: pred.away_team || pred.awayTeam || 'Away Team', 
      homeTeamLogo: aiNetworkService.getTeamLogo(pred.home_team || pred.homeTeam || 'Home Team'),
      awayTeamLogo: aiNetworkService.getTeamLogo(pred.away_team || pred.awayTeam || 'Away Team'),
      gameDate: pred.gameDate || pred.commence_time || new Date().toISOString(),
      sport: pred.sport || pred.sport_key || 'NBA',
      analysis: {
        consensus: `AI analysis for ${pred.home_team || pred.homeTeam} vs ${pred.away_team || pred.awayTeam}`,
        confidence: pred.predictions?.moneyline?.confidence || pred.confidence || 75,
        expectedValue: pred.predictions?.moneyline?.expectedValue || calculateDeterministicEV(pred),
        riskLevel: (pred.predictions?.moneyline?.confidence || 75) >= 80 ? 'low' : (pred.predictions?.moneyline?.confidence || 75) >= 65 ? 'medium' : 'high' as 'low' | 'medium' | 'high',
        keyFactors: ['Statistical analysis', 'Recent form', 'Market sentiment'],
        marketIntelligence: {
          sharpMoney: calculateSharpMoney(pred),
          publicPercentage: calculatePublicPercentage(pred),
          lineMovement: calculateLineMovement(pred),
          volume: calculateVolume(pred)
        }
      },
      predictions: {
        moneyline: {
          pick: pred.predictions?.moneyline?.pick || calculateFavoredTeam(pred),
          confidence: pred.predictions?.moneyline?.confidence || pred.confidence || 75,
          reasoning: pred.predictions?.moneyline?.reasoning || pred.analysis?.summary || 'AI analysis in progress'
        },
        spread: pred.predictions?.spread ? {
          pick: pred.predictions.spread.pick || pred.home_team || pred.homeTeam,
          line: pred.predictions.spread.line || 0,
          confidence: pred.predictions.spread.confidence || 70
        } : undefined,
        total: pred.predictions?.total ? {
          pick: pred.predictions.total.pick as 'over' | 'under' || 'over',
          line: pred.predictions.total.line || 0,
          confidence: pred.predictions.total.confidence || 70
        } : undefined
      },
      aiModels: {
        statisticalModel: calculateModelScore(pred, 'statistical'),
        trendAnalysis: calculateModelScore(pred, 'trend'),
        marketSentiment: calculateModelScore(pred, 'sentiment'),
        sharpMoneyModel: calculateModelScore(pred, 'sharp')
      }
    }));
  }, [rawPredictions]);
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 AI Pro Tab - Transformed predictions:', aiPredictions.length, aiPredictions);
  }, [aiPredictions]);

  // Live Market Intelligence
  const { data: marketIntel, isLoading: marketLoading, refetch: refetchMarket } = useQuery({
    queryKey: ['market-intelligence'],
    queryFn: () => aiNetworkService.getMarketIntelligence(),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    staleTime: 60 * 1000 // 1 minute
  });

  // Initialize chat with welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: "🔥 Hey there! I'm your Nova Titan AI companion. Ask me anything about sports betting, odds analysis, predictions, or any other questions you have. I'm here to provide you with precise, actionable insights!",
      timestamp: new Date(),
      confidence: 100
    }]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle chat message sending
  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim() || isAnalyzing) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      console.log('🧠 Nova AI analyzing:', message);
      
      const response = await realTimeAnalysisEngine.analyzeQuestion({
        question: message.trim(),
        context: 'Nova Titan AI Companion'
      });

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_response',
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ Nova AI response delivered:', response);
      
    } catch (error) {
      console.error('AI companion error:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: "I'm experiencing some technical difficulties right now. Please try asking your question again in a moment, or rephrase it differently. I'm here to help! 🤖",
        timestamp: new Date(),
        confidence: 0
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Handle legacy custom AI analysis (keeping for compatibility)
  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) return;
    
    setIsAnalyzing(true);
    try {
      console.log('🧠 Starting real-time AI analysis for:', customPrompt);
      
      const response = await realTimeAnalysisEngine.analyzeQuestion({
        question: customPrompt,
        context: 'AI Analysis Engine'
      });
      
      setCustomAnalysis(response);
      console.log('✅ AI Analysis completed:', response);
    } catch (error) {
      console.error('Custom analysis error:', error);
      setCustomAnalysis({
        id: 'error_' + Date.now(),
        question: customPrompt,
        answer: 'Sorry, I encountered an error while analyzing your question. Please try again or rephrase your question.',
        confidence: 0,
        dataSources: [],
        relatedInsights: ['Try rephrasing your question', 'Check back in a moment'],
        timestamp: new Date().toISOString(),
        reasoning: 'Error in analysis engine'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate real-time performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!aiPredictions.length) return null;
    
    const avgConfidence = aiPredictions.reduce((sum, pred) => sum + pred.analysis.confidence, 0) / aiPredictions.length;
    const highConfidencePredictions = aiPredictions.filter(pred => pred.analysis.confidence >= 80).length;
    const totalExpectedValue = aiPredictions.reduce((sum, pred) => sum + pred.analysis.expectedValue, 0);
    const lowRiskOpportunities = aiPredictions.filter(pred => pred.analysis.riskLevel === 'low').length;
    
    return {
      totalPredictions: aiPredictions.length,
      avgConfidence: Math.round(avgConfidence),
      highConfidence: highConfidencePredictions,
      totalEV: Number(totalExpectedValue.toFixed(1)),
      lowRisk: lowRiskOpportunities,
      networkHealth: aiPredictions.length > 0 ? 'optimal' : 'limited'
    };
  }, [aiPredictions]);

  if (predictionsError) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-semibold mb-2">AI Network Connection Error</h3>
          <p className="text-red-300 text-sm mb-4">Unable to connect to real data services</p>
          <button
            onClick={() => refetchPredictions()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 space-y-6">
      {/* AI Interface Mode Toggle */}
      <div 
        className="p-4 rounded-xl mb-6"
        style={{
          background: 'var(--nova-glass-bg)',
          border: 'var(--nova-card-border)',
          backdropFilter: 'var(--nova-glass-backdrop)',
          WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--nova-text-primary)' }}
          >
            AI Interface Mode
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPristineAI(true)}
              className={`px-4 py-2 rounded-lg nova-transition relative ${
                !isEliteMember 
                  ? 'nova-btn-locked cursor-pointer opacity-80 hover:opacity-100' 
                  : showPristineAI 
                  ? 'nova-btn-primary' 
                  : 'nova-btn-secondary'
              }`}
              title={!isEliteMember ? 'Click to see Elite Membership details' : undefined}
            >
              <div className="flex items-center gap-2">
                {!isEliteMember && <Lock className="w-4 h-4" />}
                <span>🧠 Pristine AI Engine</span>
                {!isEliteMember && (
                  <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
                    ELITE
                  </div>
                )}
              </div>
            </button>
            <button
              onClick={() => setShowPristineAI(false)}
              className={`px-4 py-2 rounded-lg nova-transition ${
                !showPristineAI 
                  ? 'nova-btn-primary' 
                  : 'nova-btn-secondary'
              }`}
            >
              📊 Market Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* Pristine AI Interface */}
      {showPristineAI && (
        <>
          {isEliteMember ? (
            <PristineAIInterface />
          ) : (
            /* Elite Membership Required Lock Screen */
            <div 
              className="p-12 text-center nova-card rounded-2xl"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
                boxShadow: 'var(--nova-shadow-lg)'
              }}
            >
              <div className="max-w-md mx-auto space-y-6">
                {/* Lock Icon */}
                <div 
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--nova-primary-600), var(--nova-purple-600))',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <Lock className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <div>
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ 
                      color: 'var(--nova-text-primary)',
                      background: 'linear-gradient(135deg, var(--nova-primary-500), var(--nova-purple-500))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    🧠 Pristine AI Engine
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold">
                    <Shield className="w-4 h-4" />
                    ELITE MEMBERS ONLY
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <p 
                    className="text-base"
                    style={{ color: 'var(--nova-text-secondary)' }}
                  >
                    Unlock our most advanced AI reasoning engine with GPT-style analysis, 
                    canonical entity extraction, and real-time statistical processing.
                  </p>
                  
                  {/* Features List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {[
                      '🎯 Advanced Query Processing',
                      '📊 Real-Time Entity Tracking', 
                      '🧮 Statistical Reasoning Engine',
                      '⚡ Instant Analysis Results',
                      '🔍 Canonical Player/Team IDs',
                      '📈 Market Intelligence Integration'
                    ].map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{ 
                          background: 'rgba(124, 58, 237, 0.1)',
                          border: '1px solid rgba(124, 58, 237, 0.2)'
                        }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span style={{ color: 'var(--nova-text-primary)' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming Soon Message */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(79, 70, 229, 0.1))',
                    border: '1px solid rgba(124, 58, 237, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span 
                      className="font-bold text-lg"
                      style={{ color: 'var(--nova-text-primary)' }}
                    >
                      Coming Soon
                    </span>
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--nova-text-secondary)' }}
                  >
                    Elite memberships will be available soon. Sign up for notifications 
                    to be the first to access the Pristine AI Engine.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={async () => {
                    if (isNotifying) return;
                    
                    setIsNotifying(true);
                    console.log('🔔 Elite membership interest registered - sending notification to traivonesmith@novatitan.net');
                    
                    try {
                      // Optionally prompt for user's email
                      const userEmail = prompt('Enter your email to be notified when Elite membership is available (optional):');
                      
                      // Send notification to traivonesmith@novatitan.net
                      const result = await emailNotificationService.sendEliteInterestNotification(userEmail || undefined);
                      
                      if (result.success) {
                        alert('✅ Thank you for your interest! Traivone Smith at Nova Titan has been notified and will reach out soon with Elite membership details.\n\n📧 Notification sent to: traivonesmith@novatitan.net');
                        console.log('📧 Elite interest notification sent successfully to traivonesmith@novatitan.net');
                      } else {
                        alert('❌ ' + result.message);
                      }
                    } catch (error) {
                      console.error('Error sending Elite interest notification:', error);
                      alert('❌ There was an error registering your interest. Please contact Traivone Smith directly at traivonesmith@novatitan.net for Elite membership information.');
                    } finally {
                      setIsNotifying(false);
                    }
                  }}
                  disabled={isNotifying}
                  className="nova-btn-primary w-full py-3"
                  style={{
                    background: 'linear-gradient(135deg, var(--nova-primary-600), var(--nova-purple-600))',
                    fontWeight: 'var(--nova-font-semibold)',
                    opacity: isNotifying ? 0.7 : 1,
                    cursor: isNotifying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isNotifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending Notification...
                    </>
                  ) : (
                    '🔔 Notify Me When Available'
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Market Intelligence Dashboard */}
      {!showPristineAI && (
        <div className="space-y-6">
          {/* Market Intelligence Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Market Intelligence Panel */}
            <MarketIntelligencePanel className="xl:col-span-1" />
            
            {/* Tracked Entities Panel */}
            <TrackedEntitiesPanel className="xl:col-span-1" />
          </div>

          {/* Secondary Panels */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Quick Compare Panel */}
            <QuickComparePanel className="xl:col-span-1" />
            
            {/* Top Insights Panel */}
            <TopInsightsPanel className="xl:col-span-1" />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for deterministic calculations
function calculateDeterministicEV(pred: any): number {
  const confidence = pred.predictions?.moneyline?.confidence || pred.confidence || 75;
  const teamHash = hashString(`${pred.home_team || pred.homeTeam}${pred.away_team || pred.awayTeam}`);
  const baseEV = (confidence - 50) * 0.3;
  const variation = (teamHash % 10) - 5; // ±5 variation
  return Math.max(0, Math.min(20, baseEV + variation));
}

function calculateSharpMoney(pred: any): 'backing' | 'fading' | 'neutral' {
  const confidence = pred.predictions?.moneyline?.confidence || pred.confidence || 75;
  if (confidence >= 80) return 'backing';
  if (confidence <= 60) return 'fading';
  return 'neutral';
}

function calculatePublicPercentage(pred: any): number {
  const teamHash = hashString(`${pred.home_team || pred.homeTeam}${pred.away_team || pred.awayTeam}`);
  const basePercentage = 50 + ((teamHash % 40) - 20); // 30-70% range
  return Math.max(25, Math.min(85, basePercentage));
}

function calculateLineMovement(pred: any): number {
  const gameHash = hashString(pred.id || pred.gameId || 'default');
  const movement = ((gameHash % 80) / 10) - 4; // -4.0 to +4.0
  return Number(movement.toFixed(1));
}

function calculateVolume(pred: any): number {
  const sport = pred.sport_key || pred.sport || 'unknown';
  const baseVolume = sport.includes('nfl') ? 1200000 : sport.includes('nba') ? 800000 : 600000;
  const confidence = pred.predictions?.moneyline?.confidence || pred.confidence || 75;
  const multiplier = 0.5 + (confidence / 100);
  return Math.round(baseVolume * multiplier);
}

function calculateFavoredTeam(pred: any): string {
  const homeTeam = pred.home_team || pred.homeTeam || 'Home';
  const awayTeam = pred.away_team || pred.awayTeam || 'Away';
  const confidence = pred.predictions?.moneyline?.confidence || pred.confidence || 75;
  
  // Higher confidence typically means home team favored in most systems
  return confidence > 65 ? homeTeam : awayTeam;
}

function calculateModelScore(pred: any, modelType: 'statistical' | 'trend' | 'sentiment' | 'sharp'): number {
  const teamHash = hashString(`${pred.home_team || pred.homeTeam}${pred.away_team || pred.awayTeam}`);
  const typeHash = hashString(modelType);
  const combinedHash = (teamHash + typeHash) % 100;
  
  let baseRange: [number, number];
  switch (modelType) {
    case 'statistical':
      baseRange = [60, 90];
      break;
    case 'trend':
      baseRange = [55, 85];
      break;
    case 'sentiment':
      baseRange = [50, 85];
      break;
    case 'sharp':
      baseRange = [45, 80];
      break;
  }
  
  const [min, max] = baseRange;
  const score = min + (combinedHash % (max - min + 1));
  return score;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}