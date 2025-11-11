/**
 * Disclaimer Banner Component
 * 
 * Features:
 * - Legal disclaimers (21+, gambling problem resources)
 * - State-specific disclaimers
 * - "Not financial advice" disclaimer
 * - Links to terms, privacy policy, responsible gaming
 * - Minimizable banner
 * 
 * Phase 4: Compliance & Legal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Shield, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';

export interface DisclaimerBannerProps {
  position?: 'top' | 'bottom'; // Default: bottom
  dismissible?: boolean; // Can user dismiss the banner?
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  position = 'bottom',
  dismissible = true,
}) => {
  const { geolocation } = useComplianceStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-40 bg-gray-900 border-${position === 'top' ? 'b' : 't'} border-gray-700 shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Compact View */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-300 leading-tight">
                <strong className="text-white">Must be 21+.</strong> Gambling problem?{' '}
                <a href="tel:1-800-522-4700" className="text-blue-400 hover:underline">
                  Call 1-800-GAMBLER
                </a>
                {geolocation.isDetected && geolocation.state && (
                  <span> • {geolocation.state} residents only</span>
                )}
                {!isExpanded && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="ml-2 text-blue-400 hover:underline text-xs"
                  >
                    See full disclaimer
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Expand disclaimer"
              >
                {position === 'top' ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            )}
            {dismissible && (
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-700 space-y-4"
            >
              {/* Age Restriction */}
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Age Restriction</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    You must be 21 years of age or older to use this service. By using this service, 
                    you confirm that you meet the minimum age requirement and are physically located 
                    in a jurisdiction where sports betting is legal.
                  </p>
                </div>
              </div>

              {/* State-Specific */}
              {geolocation.isDetected && geolocation.state && (
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {geolocation.state} Residents
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      You must be physically located within {geolocation.state} state borders to 
                      place bets. Attempting to place bets from outside {geolocation.state} or 
                      using location-spoofing technology is illegal and may result in account 
                      suspension and forfeiture of funds.
                    </p>
                  </div>
                </div>
              )}

              {/* Not Financial Advice */}
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Not Financial Advice</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The information provided on this platform, including odds, analytics, and 
                    recommendations, is for informational and entertainment purposes only. It does 
                    not constitute financial, investment, or gambling advice. All betting involves 
                    risk, and you should never bet more than you can afford to lose.
                  </p>
                </div>
              </div>

              {/* Problem Gambling Resources */}
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Problem Gambling Help</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">
                    If you or someone you know has a gambling problem, help is available 24/7:
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <a
                      href="tel:1-800-522-4700"
                      className="text-blue-400 hover:underline"
                    >
                      📞 1-800-GAMBLER
                    </a>
                    <a
                      href="https://www.ncpgambling.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      🌐 NCPG.org
                    </a>
                    <a
                      href="https://www.gamblersanonymous.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      🌐 Gamblers Anonymous
                    </a>
                  </div>
                </div>
              </div>

              {/* Legal Links */}
              <div className="pt-3 border-t border-gray-700">
                <div className="flex flex-wrap gap-4 text-xs">
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/responsible-gaming"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Responsible Gaming
                  </a>
                  <a
                    href="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>

              {/* Collapse Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-xs transition-colors"
                >
                  {position === 'top' ? 'Collapse' : 'Collapse'}
                  {position === 'top' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DisclaimerBanner;
