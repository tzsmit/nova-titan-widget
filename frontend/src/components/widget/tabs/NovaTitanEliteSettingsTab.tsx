/**
 * Nova Titan Elite Settings Tab - Coming Soon Interface
 * Disabled for testing with professional coming soon design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Lock,
  Sparkles,
  Crown,
  Zap,
  User,
  Bell,
  Shield,
  Palette
} from 'lucide-react';

export const NovaTitanEliteSettingsTab: React.FC = () => {
  const comingSoonFeatures = [
    {
      icon: User,
      title: 'Account Management',
      description: 'Personal profile and preferences',
      badge: 'Soon'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Custom alerts and betting notifications',
      badge: 'Soon'
    },
    {
      icon: Palette,
      title: 'Themes & Customization',
      description: 'Personalize your Nova Titan experience',
      badge: 'Soon'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Advanced privacy and security controls',
      badge: 'Soon'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Settings & Account</h1>
            <p className="text-slate-400 text-sm">Customize your Nova Titan Elite experience</p>
          </div>
        </motion.div>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-full"
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-yellow-300 font-medium text-sm">Coming Soon</span>
          <Crown className="h-4 w-4 text-yellow-400" />
        </motion.div>
      </div>

      {/* Protected Branding Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Nova Titan Elite Branding</h3>
        </div>
        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Lock className="h-5 w-5" />
            <div>
              <div className="font-medium text-slate-300">Protected Branding Elements</div>
              <div className="text-sm">Logo and branding are secured and cannot be modified</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coming Soon Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {comingSoonFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 relative overflow-hidden group"
            >
              {/* Disabled Overlay */}
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] z-10 rounded-xl" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700 rounded-lg opacity-50">
                      <Icon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-300">{feature.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{feature.description}</p>
                    </div>
                  </div>
                  
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-600/30">
                    {feature.badge}
                  </span>
                </div>
                
                <div className="text-xs text-slate-500 opacity-75">
                  Available in future updates
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Development Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-blue-400" />
          <span className="text-blue-300 font-semibold">Currently in Testing Phase</span>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Settings and account features are being developed and will be available in the next major update. 
          The current focus is on perfecting the core sports analytics and prediction capabilities.
        </p>
        
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Core Features: Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Settings: In Development</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};