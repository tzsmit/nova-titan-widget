/**
 * Simplified Settings Tab - Easy Configuration
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { 
  Settings,
  Save,
  RotateCcw,
  Moon,
  Sun,
  DollarSign,
  Bell,
  Shield
} from 'lucide-react';

export const SimpleSettingsTab: React.FC = () => {
  const { config, updateConfig } = useWidgetStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
    updateConfig(localConfig);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleReset = () => {
    const defaultConfig = {
      ...config,
      theme: 'dark' as const,
      currency: 'USD',
      odds_format: 'american' as const,
      timezone: 'America/Chicago',
      notifications: true,
      autoRefresh: false
    };
    setLocalConfig(defaultConfig);
  };

  return (
    <div className="w-full max-w-screen-sm sm:max-w-screen-md mx-auto p-2 sm:p-4 flex flex-col gap-4">
      {/* Simple Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-white">Settings</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm box-border"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm box-border ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save className="h-4 w-4" />
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="w-full flex flex-col gap-4">
          
        {/* Theme Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4"
          >
          <div className="flex items-center gap-3 mb-4">
            <Moon className="h-5 w-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Theme</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {[
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'light', label: 'Light', icon: Sun }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setLocalConfig({...localConfig, theme: value as any})}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all text-sm box-border ${
                  localConfig.theme === value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4"
          >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Display</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Currency</label>
              <select
                value={localConfig.currency}
                onChange={(e) => setLocalConfig({...localConfig, currency: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 box-border"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Odds Format</label>
              <select
                value={localConfig.odds_format}
                onChange={(e) => setLocalConfig({...localConfig, odds_format: e.target.value as any})}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 box-border"
              >
                <option value="american">American (+/-)</option>
                <option value="decimal">Decimal (1.50)</option>
                <option value="fractional">Fractional (1/2)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Timezone Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4"
          >
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-purple-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Time & Location</h2>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={localConfig.timezone}
              onChange={(e) => setLocalConfig({...localConfig, timezone: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 box-border"
            >
              <option value="America/Chicago">Central Time (CST)</option>
              <option value="America/New_York">Eastern Time (EST)</option>
              <option value="America/Los_Angeles">Pacific Time (PST)</option>
              <option value="America/Denver">Mountain Time (MST)</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4"
          >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium text-sm sm:text-base">Push Notifications</div>
                <div className="text-xs sm:text-sm text-slate-400">Get alerts for important updates</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.notifications || false}
                  onChange={(e) => setLocalConfig({...localConfig, notifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium text-sm sm:text-base">Auto Refresh</div>
                <div className="text-xs sm:text-sm text-slate-400">Automatically update data</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.autoRefresh || false}
                  onChange={(e) => setLocalConfig({...localConfig, autoRefresh: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4"
          >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-green-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Brand Name</label>
              <input
                type="text"
                value={localConfig.brandName}
                onChange={(e) => setLocalConfig({...localConfig, brandName: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 box-border"
                placeholder="Nova Titan Sports"
              />
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-blue-300">Elite Membership</span>
              </div>
              <p className="text-xs text-slate-400">
                Full access to all premium features and AI insights
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Simple Footer */}
      <div className="text-center p-4 border-t border-slate-700">
        <div className="text-slate-500 text-sm">
          Settings for{' '}
          <a 
            href="https://novatitan.net/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            novatitan.net
          </a>
        </div>
      </div>
    </div>
  );
};