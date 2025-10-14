import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
 
  Globe, 
  User, 

  Save,
  RotateCcw,
  Upload
} from 'lucide-react';

interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export const SettingsTab: React.FC = () => {
  const { config, updateConfig } = useWidgetStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeSection, setActiveSection] = useState('appearance');

  const handleSave = () => {
    updateConfig(localConfig);
    // In a real app, this would also save to backend
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    const defaultConfig = {
      colors: {
        primary: '#1a365d',
        secondary: '#2d5a87', 
        accent: '#4299e1',
        background: '#1a202c'
      },
      logo: 'https://page.gensparksite.com/v1/base64_upload/b12f5870654d8f0d2849b96fdb25cab2',
      brandName: 'Nova Titan Sports',
      theme: 'dark' as const,
      currency: 'USD',
      odds_format: 'american' as const,
      notifications: {
        enabled: true,
        sound: true,
        push: false
      },
      risk_management: {
        max_bet: 1000,
        daily_limit: 5000,
        loss_limit: 2000
      }
    };
    setLocalConfig(defaultConfig);
    updateConfig(defaultConfig);
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'performance', label: 'Performance', icon: RotateCcw },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'risk', label: 'Risk Management', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: User },
    { id: 'legal', label: 'Legal & Compliance', icon: Globe }
  ];

  const updateColors = (colorKey: keyof ColorSettings, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const updateNotifications = (key: string, value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateRiskManagement = (key: string, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      risk_management: {
        ...prev.risk_management,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <CornerHelpTooltip 
          content="Customize your Nova TitanAI widget preferences, theme settings, and view real-time system status and performance metrics."
          term="Settings"
          size="md"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: config.colors.accent }} />
            Widget Settings
          </h2>
          <p className="text-gray-400 text-sm">
            Customize your Nova Titan Sports experience
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: config.colors.accent }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Nova Titan System Branding
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Protected Logo Display */}
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={localConfig.logo} 
                            alt="Nova Titan Logo" 
                            className="h-10 w-auto"
                          />
                          <div>
                            <p className="text-white font-semibold">Nova Titan Sports</p>
                            <p className="text-gray-400 text-sm">Protected System Branding</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-400/30">
                          <Shield className="w-3 h-3" />
                          PROTECTED
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 bg-gray-900/30 rounded p-3 border-l-4 border-blue-500">
                      <p className="font-medium text-white mb-1">🛡️ Nova Titan System Branding</p>
                      <p>Logo and primary branding are protected and managed by Nova Titan System. You can customize colors and other appearance settings below.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Color Scheme</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(localConfig.colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-gray-400 text-sm block mb-2 capitalize">
                          {key} Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateColors(key as keyof ColorSettings, e.target.value)}
                            className="w-12 h-10 rounded border border-gray-600 bg-gray-700"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateColors(key as keyof ColorSettings, e.target.value)}
                            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    📊 Real-Time Status
                  </h3>
                  <div className="space-y-4">
                    {/* API Connection Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Database Connection</span>
                      </div>
                      <span className="text-green-400 text-xs">CONNECTED</span>
                    </div>

                    {/* Games Data Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Live Games Data</span>
                      </div>
                      <span className="text-blue-400 text-xs">SYNCING</span>
                    </div>

                    {/* AI Predictions Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Nova TitanAI v2.1</span>
                      </div>
                      <span className="text-purple-400 text-xs">ACTIVE</span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-white font-bold text-lg">3</div>
                        <div className="text-gray-400 text-xs">Live Games</div>
                      </div>
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-white font-bold text-lg">72%</div>
                        <div className="text-gray-400 text-xs">Avg Confidence</div>
                      </div>
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-white font-bold text-lg">5m</div>
                        <div className="text-gray-400 text-xs">Auto Refresh</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tracking */}
            {activeSection === 'performance' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-green-400" />
                    AI Performance Tracking
                  </h3>

                  {/* Overall Performance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/30 rounded-lg p-4 text-center">
                      <div className="text-green-400 text-2xl font-bold">68.7%</div>
                      <div className="text-green-300 text-sm">Win Rate</div>
                      <div className="text-gray-400 text-xs mt-1">Last 30 days</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-600/30 rounded-lg p-4 text-center">
                      <div className="text-blue-400 text-2xl font-bold">+$1,247</div>
                      <div className="text-blue-300 text-sm">Total Profit</div>
                      <div className="text-gray-400 text-xs mt-1">All time</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-lg p-4 text-center">
                      <div className="text-purple-400 text-2xl font-bold">+12.8%</div>
                      <div className="text-purple-300 text-sm">ROI</div>
                      <div className="text-gray-400 text-xs mt-1">This month</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-4 text-center">
                      <div className="text-yellow-400 text-2xl font-bold">147</div>
                      <div className="text-yellow-300 text-sm">Total Bets</div>
                      <div className="text-gray-400 text-xs mt-1">Tracked</div>
                    </div>
                  </div>

                  {/* Performance by Sport */}
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">Performance by Sport</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏀</span>
                          <span className="text-white font-medium">Basketball</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-green-400 text-sm">73% win rate</span>
                          <span className="text-blue-400 text-sm">+$487</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏈</span>
                          <span className="text-white font-medium">Football</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-green-400 text-sm">64% win rate</span>
                          <span className="text-blue-400 text-sm">+$523</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🏒</span>
                          <span className="text-white font-medium">Hockey</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-yellow-400 text-sm">58% win rate</span>
                          <span className="text-blue-400 text-sm">+$237</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Learning Progress */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🧠</span>
                      <h4 className="text-white font-medium">AI Learning Progress</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Model Accuracy</span>
                        <span className="text-purple-400">87.3%</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87.3%' }}></div>
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        Nova TitanAI has analyzed 2,847 games and is continuously improving predictions based on your betting patterns and outcomes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(localConfig.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium capitalize">
                          {key.replace('_', ' ')} Notifications
                        </label>
                        <p className="text-gray-400 text-sm">
                          {key === 'enabled' && 'Enable all notifications'}
                          {key === 'sound' && 'Play sound for notifications'}
                          {key === 'push' && 'Send push notifications'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotifications(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Management Settings */}
            {activeSection === 'risk' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Management
                  <HelpTooltip content="Set betting limits to promote responsible gambling" />
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(localConfig.risk_management).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-gray-400 text-sm block mb-2 capitalize">
                        {key.replace('_', ' ')} ($)
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => updateRiskManagement(key, Number(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400"
                        min="0"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        {key === 'max_bet' && 'Maximum amount per single bet'}
                        {key === 'daily_limit' && 'Total betting limit per day'}
                        {key === 'loss_limit' && 'Stop betting after losing this amount'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Settings */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Display Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Currency</label>
                      <select
                        value={localConfig.currency}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, currency: e.target.value }))}
                        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Odds Format</label>
                      <select
                        value={localConfig.odds_format}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, odds_format: e.target.value as 'american' | 'decimal' | 'fractional' }))}
                        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full"
                      >
                        <option value="american">American (+100, -110)</option>
                        <option value="decimal">Decimal (2.00, 1.91)</option>
                        <option value="fractional">Fractional (1/1, 10/11)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Theme</label>
                      <select
                        value={localConfig.theme}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' }))}
                        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal & Compliance Settings */}
            {activeSection === 'legal' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Legal & Compliance
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-200 font-semibold text-sm mb-1">Responsible Gaming</p>
                        <p className="text-yellow-300 text-xs">
                          This widget is for entertainment and educational purposes only. 
                          Always gamble responsibly and within your means.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Jurisdiction Settings</h4>
                    <select className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full">
                      <option value="us">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Legal Links</h4>
                    <div className="space-y-2 text-sm">
                      <a href="#" className="text-blue-400 hover:text-blue-300 block">Terms of Service</a>
                      <a href="#" className="text-blue-400 hover:text-blue-300 block">Privacy Policy</a>
                      <a href="#" className="text-blue-400 hover:text-blue-300 block">Responsible Gaming</a>
                      <a href="#" className="text-blue-400 hover:text-blue-300 block">Problem Gaming Resources</a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Theme Mode Switch */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium mb-1">Interface Theme</h4>
            <p className="text-gray-400 text-sm">Switch between light and dark mode</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${localConfig.themeMode === 'light' ? 'text-white' : 'text-gray-500'}`}>
              ☀️ Light
            </span>
            <button
              onClick={() => {
                const newTheme = localConfig.themeMode === 'dark' ? 'light' : 'dark';
                setLocalConfig(prev => ({ ...prev, themeMode: newTheme }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                localConfig.themeMode === 'dark' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig.themeMode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${localConfig.themeMode === 'dark' ? 'text-white' : 'text-gray-500'}`}>
              🌙 Dark
            </span>
          </div>
        </div>
      </div>

      {/* Nova Titan System Attribution */}
      <div className="mt-8 border-t border-gray-700 pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="https://page.gensparksite.com/v1/base64_upload/b12f5870654d8f0d2849b96fdb25cab2" 
              alt="Nova Titan Logo" 
              className="h-6 w-auto"
            />
            <span className="text-white font-semibold">Nova Titan System</span>
          </div>
          <p className="text-gray-400 text-sm">
            Powered by Nova Titan Sports Intelligence Platform
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Advanced AI predictions • Secure betting infrastructure • Professional grade analytics
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span>© 2024 Nova Titan System</span>
            <span>•</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};