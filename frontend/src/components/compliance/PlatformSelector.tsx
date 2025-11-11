/**
 * Platform Selector Component
 * 
 * Features:
 * - Switch between Traditional Sports Betting and Social Gaming (Sweepstakes)
 * - Shows which platforms are available in user's state
 * - Explains difference between platform types
 * - Updates compliance validation automatically
 * 
 * Phase 4: Compliance & Legal (Texas Support)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Check, Info, MapPin } from 'lucide-react';
import { useComplianceStore, PlatformType } from '../../store/complianceStore';
import { GeolocationService } from '../../services/GeolocationService';

export interface PlatformSelectorProps {
  onChange?: (platformType: PlatformType) => void;
  showExplanation?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  onChange,
  showExplanation = true,
}) => {
  const { platformType, setPlatformType, geolocation } = useComplianceStore();
  const [showDetails, setShowDetails] = useState(false);

  const handleSelect = (type: PlatformType, isAvailable: boolean) => {
    if (!isAvailable) {
      // Show alert explaining why it's locked
      alert(`This platform is not available in ${geolocation.state || 'your state'}. Please use the ${type === 'traditional' ? 'Social Gaming' : 'Traditional'} option instead.`);
      return;
    }
    
    setPlatformType(type);
    if (onChange) {
      onChange(type);
    }
  };

  // Check which platforms are available in user's state
  const availablePlatforms = geolocation.state 
    ? GeolocationService.getAvailablePlatforms(geolocation.state)
    : ['traditional', 'sweepstakes'] as PlatformType[];

  const isTraditionalAvailable = availablePlatforms.includes('traditional');
  const isSweepstakesAvailable = availablePlatforms.includes('sweepstakes');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Platform Type</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
        >
          <Info size={16} />
          {showDetails ? 'Hide Details' : 'What\'s the difference?'}
        </button>
      </div>

      {/* Platform Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional Sports Betting */}
        <motion.button
          whileHover={{ scale: isTraditionalAvailable ? 1.02 : 1 }}
          whileTap={{ scale: isTraditionalAvailable ? 0.98 : 1 }}
          onClick={() => handleSelect('traditional', isTraditionalAvailable)}
          className={`relative p-6 rounded-lg border-2 transition-all text-left ${
            platformType === 'traditional'
              ? 'border-blue-500 bg-blue-900/30'
              : isTraditionalAvailable
              ? 'border-gray-700 bg-gray-800 hover:border-gray-600 cursor-pointer'
              : 'border-red-700/50 bg-gray-900/80 cursor-not-allowed'
          }`}
        >
          {/* Selected Badge */}
          {platformType === 'traditional' && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check size={14} />
              Active
            </div>
          )}

          {/* Unavailable Badge */}
          {!isTraditionalAvailable && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              🔒 Locked
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isTraditionalAvailable ? 'bg-blue-600' : 'bg-gray-700'
            }`}>
              <Trophy size={24} className={isTraditionalAvailable ? 'text-white' : 'text-gray-500'} />
            </div>
            <div>
              <h4 className={isTraditionalAvailable ? 'text-white font-bold' : 'text-gray-400 font-bold'}>Traditional</h4>
              <p className="text-xs text-gray-400">Sports Betting</p>
            </div>
          </div>

          <p className={`text-sm mb-3 ${isTraditionalAvailable ? 'text-gray-300' : 'text-gray-500'}`}>
            Real money sports betting with licensed bookmakers like DraftKings, FanDuel, BetMGM.
          </p>

          <div className="space-y-1">
            <div className={`flex items-center gap-2 text-xs ${isTraditionalAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isTraditionalAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>Regulated sportsbooks</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${isTraditionalAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isTraditionalAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>Real money wagering</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${isTraditionalAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isTraditionalAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>21+ only, 22 states</span>
            </div>
          </div>

          {geolocation.state && !isTraditionalAvailable && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-xs font-semibold text-red-300 mb-1">Not Available in {geolocation.state}</p>
                  <p className="text-xs text-gray-400">
                    Traditional sports betting is not yet legal in your state. Use Social Gaming instead!
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.button>

        {/* Social Gaming / Sweepstakes */}
        <motion.button
          whileHover={{ scale: isSweepstakesAvailable ? 1.02 : 1 }}
          whileTap={{ scale: isSweepstakesAvailable ? 0.98 : 1 }}
          onClick={() => handleSelect('sweepstakes', isSweepstakesAvailable)}
          className={`relative p-6 rounded-lg border-2 transition-all text-left ${
            platformType === 'sweepstakes'
              ? 'border-purple-500 bg-purple-900/30'
              : isSweepstakesAvailable
              ? 'border-gray-700 bg-gray-800 hover:border-gray-600 cursor-pointer'
              : 'border-red-700/50 bg-gray-900/80 cursor-not-allowed'
          }`}
        >
          {/* Selected Badge */}
          {platformType === 'sweepstakes' && (
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check size={14} />
              Active
            </div>
          )}

          {/* Recommended Badge */}
          {isSweepstakesAvailable && !isTraditionalAvailable && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Recommended
            </div>
          )}

          {/* Unavailable Badge */}
          {!isSweepstakesAvailable && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              🔒 Locked
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isSweepstakesAvailable ? 'bg-purple-600' : 'bg-gray-700'
            }`}>
              <Sparkles size={24} className={isSweepstakesAvailable ? 'text-white' : 'text-gray-500'} />
            </div>
            <div>
              <h4 className={isSweepstakesAvailable ? 'text-white font-bold' : 'text-gray-400 font-bold'}>Social Gaming</h4>
              <p className="text-xs text-gray-400">Sweepstakes Model</p>
            </div>
          </div>

          <p className={`text-sm mb-3 ${isSweepstakesAvailable ? 'text-gray-300' : 'text-gray-500'}`}>
            Skill-based gaming and sweepstakes platforms like Stake.us, Underdog, PrizePicks.
          </p>

          <div className="space-y-1">
            <div className={`flex items-center gap-2 text-xs ${isSweepstakesAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isSweepstakesAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>Sweepstakes model</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${isSweepstakesAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isSweepstakesAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>No purchase necessary</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${isSweepstakesAvailable ? 'text-gray-400' : 'text-gray-600'}`}>
              <Check size={14} className={isSweepstakesAvailable ? 'text-green-400' : 'text-gray-600'} />
              <span>18+ (varies), 46+ states</span>
            </div>
          </div>

          {geolocation.state && geolocation.state === 'TX' && isSweepstakesAvailable && (
            <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded text-xs text-green-300 flex items-center gap-1">
              <MapPin size={12} />
              <span>✅ Legal in Texas!</span>
            </div>
          )}

          {geolocation.state && !isSweepstakesAvailable && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="text-xs font-semibold text-red-300 mb-1">Not Available in {geolocation.state}</p>
                  <p className="text-xs text-gray-400">
                    Social gaming is restricted in your state ({geolocation.state}). Try Traditional betting if available.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Explanation Section */}
      {showExplanation && showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4"
        >
          <h4 className="text-white font-semibold">Understanding Platform Types</h4>

          {/* Traditional Sports Betting */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-blue-400" />
              <h5 className="text-blue-400 font-semibold text-sm">Traditional Sports Betting</h5>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Traditional sports betting involves real money wagering on sporting events through 
              state-licensed and regulated sportsbooks. These platforms require strict licensing, 
              regulatory oversight, and are only legal in specific states where sports betting has 
              been legalized (currently 22 states).
            </p>
            <div className="bg-gray-700/50 rounded p-2 space-y-1">
              <p className="text-xs text-gray-400">
                <strong className="text-white">Examples:</strong> DraftKings, FanDuel, BetMGM, Caesars, PointsBet
              </p>
              <p className="text-xs text-gray-400">
                <strong className="text-white">Requirements:</strong> Must be 21+, physically located in legal state
              </p>
              <p className="text-xs text-gray-400">
                <strong className="text-white">Legal States:</strong> AZ, CO, CT, IL, IN, IA, KS, LA, MI, NJ, NY, PA, TN, VA, WV, WY, AR, MD, MA, NV, OH, RI
              </p>
            </div>
          </div>

          {/* Social Gaming / Sweepstakes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-purple-400" />
              <h5 className="text-purple-400 font-semibold text-sm">Social Gaming / Sweepstakes</h5>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Social gaming platforms operate under a sweepstakes model where users can participate 
              without making a purchase (no purchase necessary). These platforms are legal in most 
              states because they're classified as skill-based games or promotional sweepstakes rather 
              than traditional gambling. Popular in states like Texas where traditional sports betting 
              isn't yet legal.
            </p>
            <div className="bg-gray-700/50 rounded p-2 space-y-1">
              <p className="text-xs text-gray-400">
                <strong className="text-white">Examples:</strong> Stake.us, Underdog Fantasy, PrizePicks, Fliff
              </p>
              <p className="text-xs text-gray-400">
                <strong className="text-white">Requirements:</strong> Usually 18+ (some states 19+), physically located in legal state
              </p>
              <p className="text-xs text-gray-400">
                <strong className="text-white">Key Feature:</strong> "No purchase necessary" - can enter with free play
              </p>
              <p className="text-xs text-gray-400">
                <strong className="text-white">Legal States:</strong> 46+ states including TX, CA, FL, GA, NC (except WA, ID, NV, MT)
              </p>
            </div>
          </div>

          {/* Texas Specific Info */}
          {geolocation.state === 'TX' && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-green-400" />
                <h5 className="text-green-400 font-semibold text-sm">Texas Residents</h5>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                While traditional sports betting isn't currently legal in Texas, you can legally 
                access social gaming and sweepstakes platforms like Stake.us, Underdog Fantasy, 
                and PrizePicks. These operate under a different legal framework and are fully 
                compliant with Texas state law. You must be 18+ to participate.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Current State Info */}
      {geolocation.state && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
          <p className="text-xs text-gray-300">
            <strong className="text-white">Your Location:</strong> {geolocation.state} • 
            {isTraditionalAvailable && isSweepstakesAvailable && ' Both platform types available'}
            {isTraditionalAvailable && !isSweepstakesAvailable && ' Traditional sports betting only'}
            {!isTraditionalAvailable && isSweepstakesAvailable && ' Social gaming only'}
            {!isTraditionalAvailable && !isSweepstakesAvailable && ' No platforms available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
