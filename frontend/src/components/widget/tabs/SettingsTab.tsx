import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
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
    <div className="space-y-6">
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
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Brand Customization
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Logo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={localConfig.logo}
                          onChange={(e) => setLocalConfig(prev => ({ ...prev, logo: e.target.value }))}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400"
                          placeholder="https://example.com/logo.png"
                        />
                        <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded border border-gray-600 hover:bg-gray-600">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Brand Name</label>
                      <input
                        type="text"
                        value={localConfig.brandName}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, brandName: e.target.value }))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400"
                        placeholder="Nova Titan Sports"
                      />
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
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div 
                    className="rounded-lg p-4 border-2"
                    style={{ 
                      backgroundColor: localConfig.colors.background,
                      borderColor: localConfig.colors.primary
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {localConfig.logo && (
                        <img 
                          src={localConfig.logo} 
                          alt="Logo" 
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="text-white font-semibold">{localConfig.brandName}</span>
                    </div>
                    <button 
                      className="px-4 py-2 rounded text-white font-medium"
                      style={{ backgroundColor: localConfig.colors.accent }}
                    >
                      Sample Button
                    </button>
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
    </div>
  );
};