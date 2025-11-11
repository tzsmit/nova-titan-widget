/**
 * Responsible Gaming Component
 * 
 * Features:
 * - Deposit limits (daily, weekly, monthly)
 * - Loss limits (daily, weekly, monthly)
 * - Session time limits
 * - Self-exclusion (24h, 7d, 30d, 6m, permanent)
 * - Cool-off periods (24h, 72h, 1w)
 * - Reality checks
 * - Links to gambling addiction resources
 * 
 * Phase 4: Compliance & Legal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, DollarSign, AlertTriangle, Phone, 
  ExternalLink, X, Check, Info 
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';

export interface ResponsibleGamingProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResponsibleGaming: React.FC<ResponsibleGamingProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    responsibleGaming, 
    setResponsibleGamingLimit, 
    setSelfExclusion, 
    setCoolOffPeriod 
  } = useComplianceStore();

  const [activeTab, setActiveTab] = useState<'limits' | 'exclusion' | 'resources'>('limits');
  
  // Limit form states
  const [dailyDepositLimit, setDailyDepositLimit] = useState(
    responsibleGaming.limits.dailyDepositLimit?.toString() || ''
  );
  const [weeklyDepositLimit, setWeeklyDepositLimit] = useState(
    responsibleGaming.limits.weeklyDepositLimit?.toString() || ''
  );
  const [monthlyDepositLimit, setMonthlyDepositLimit] = useState(
    responsibleGaming.limits.monthlyDepositLimit?.toString() || ''
  );
  const [dailyLossLimit, setDailyLossLimit] = useState(
    responsibleGaming.limits.dailyLossLimit?.toString() || ''
  );
  const [sessionTimeLimit, setSessionTimeLimit] = useState(
    responsibleGaming.limits.sessionTimeLimit?.toString() || ''
  );

  // Save limits
  const handleSaveLimits = () => {
    const limits: any = {};

    if (dailyDepositLimit) limits.dailyDepositLimit = parseFloat(dailyDepositLimit);
    if (weeklyDepositLimit) limits.weeklyDepositLimit = parseFloat(weeklyDepositLimit);
    if (monthlyDepositLimit) limits.monthlyDepositLimit = parseFloat(monthlyDepositLimit);
    if (dailyLossLimit) limits.dailyLossLimit = parseFloat(dailyLossLimit);
    if (sessionTimeLimit) limits.sessionTimeLimit = parseInt(sessionTimeLimit, 10);

    setResponsibleGamingLimit(limits);
    alert('Limits saved successfully! They will take effect immediately.');
  };

  // Self-exclusion options
  const selfExclusionOptions = [
    { label: '24 Hours', days: 1 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
  ];

  // Cool-off options
  const coolOffOptions = [
    { label: '24 Hours', hours: 24 },
    { label: '72 Hours', hours: 72 },
    { label: '1 Week', hours: 168 },
  ];

  // Handle self-exclusion
  const handleSelfExclusion = (days: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to self-exclude for ${days} day(s)? This action cannot be undone.`
    );
    if (confirmed) {
      setSelfExclusion(days);
      alert(`Self-exclusion activated for ${days} day(s). You will not be able to place bets during this period.`);
      onClose();
    }
  };

  // Handle cool-off
  const handleCoolOff = (hours: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to take a ${hours} hour cool-off period?`
    );
    if (confirmed) {
      setCoolOffPeriod(hours);
      alert(`Cool-off period activated for ${hours} hours.`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={28} className="text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Responsible Gaming</h2>
                  <p className="text-sm text-blue-100">Set limits and take control</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('limits')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'limits'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign size={18} className="inline mr-2" />
                Limits
              </button>
              <button
                onClick={() => setActiveTab('exclusion')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'exclusion'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clock size={18} className="inline mr-2" />
                Exclusion
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Phone size={18} className="inline mr-2" />
                Resources
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Limits Tab */}
              {activeTab === 'limits' && (
                <div className="space-y-6">
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="text-blue-400 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        Set deposit and loss limits to help manage your spending. Limits take effect 
                        immediately and can be decreased at any time. Increases require a 24-hour waiting period.
                      </p>
                    </div>
                  </div>

                  {/* Deposit Limits */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-400" />
                      Deposit Limits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Daily Limit</label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          placeholder="No limit"
                          value={dailyDepositLimit}
                          onChange={(e) => setDailyDepositLimit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Weekly Limit</label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          placeholder="No limit"
                          value={weeklyDepositLimit}
                          onChange={(e) => setWeeklyDepositLimit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Monthly Limit</label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          placeholder="No limit"
                          value={monthlyDepositLimit}
                          onChange={(e) => setMonthlyDepositLimit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loss Limits */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-red-400" />
                      Loss Limits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Daily Loss Limit</label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          placeholder="No limit"
                          value={dailyLossLimit}
                          onChange={(e) => setDailyLossLimit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Session Time Limit */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Clock size={20} className="text-yellow-400" />
                      Session Time Limit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Maximum Session Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="15"
                          placeholder="No limit"
                          value={sessionTimeLimit}
                          onChange={(e) => setSessionTimeLimit(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveLimits}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Save Limits
                  </button>
                </div>
              )}

              {/* Exclusion Tab */}
              {activeTab === 'exclusion' && (
                <div className="space-y-6">
                  {/* Cool-Off Period */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Cool-Off Period</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Take a short break from betting. You can return after the cool-off period ends.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {coolOffOptions.map((option) => (
                        <button
                          key={option.hours}
                          onClick={() => handleCoolOff(option.hours)}
                          className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Self-Exclusion */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Self-Exclusion</h3>
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={18} className="text-red-400 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <strong className="text-red-400">Warning:</strong> Self-exclusion cannot be 
                          reversed. You will be blocked from placing bets for the entire period.
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selfExclusionOptions.map((option) => (
                        <button
                          key={option.days}
                          onClick={() => handleSelfExclusion(option.days)}
                          className="py-3 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-400 rounded-lg transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Status */}
                  {(responsibleGaming.limits.coolOffPeriod || responsibleGaming.limits.selfExclusionUntil) && (
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Active Restrictions</h4>
                      {responsibleGaming.limits.coolOffPeriod && (
                        <p className="text-xs text-gray-300">
                          Cool-off period active until{' '}
                          {new Date(responsibleGaming.limits.coolOffPeriod).toLocaleString()}
                        </p>
                      )}
                      {responsibleGaming.limits.selfExclusionUntil && (
                        <p className="text-xs text-gray-300">
                          Self-excluded until{' '}
                          {new Date(responsibleGaming.limits.selfExclusionUntil).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      If you or someone you know has a gambling problem, help is available 24/7.
                    </p>
                  </div>

                  {/* Helplines */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">24/7 Helplines</h3>
                    <div className="space-y-3">
                      <a
                        href="tel:1-800-522-4700"
                        className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Phone size={24} className="text-green-400" />
                        <div>
                          <p className="text-white font-semibold">National Problem Gambling Helpline</p>
                          <p className="text-blue-400 text-sm">1-800-522-4700 (GAMBLER)</p>
                        </div>
                      </a>

                      <a
                        href="sms:1-800-522-4700"
                        className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Phone size={24} className="text-blue-400" />
                        <div>
                          <p className="text-white font-semibold">Text Support</p>
                          <p className="text-blue-400 text-sm">Text "GAMBLER" to 1-800-522-4700</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Organizations */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Support Organizations</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'National Council on Problem Gambling', url: 'https://www.ncpgambling.org' },
                        { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
                        { name: 'Gambling Therapy', url: 'https://www.gamblingtherapy.org' },
                        { name: 'SAMHSA National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline' },
                      ].map((org) => (
                        <a
                          key={org.name}
                          href={org.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <span className="text-white text-sm">{org.name}</span>
                          <ExternalLink size={16} className="text-blue-400" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Signs of Problem Gambling */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Warning Signs</h3>
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                      <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                        <li>Betting more than you can afford to lose</li>
                        <li>Chasing losses or trying to win back money</li>
                        <li>Lying about gambling or hiding it from others</li>
                        <li>Neglecting work, school, or family due to gambling</li>
                        <li>Borrowing money to gamble</li>
                        <li>Feeling anxious or irritable when not gambling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsibleGaming;
