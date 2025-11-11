/**
 * Cookie Consent Banner
 * 
 * Features:
 * - GDPR/CCPA compliant cookie consent
 * - Accept all / Reject all / Customize
 * - Cookie categories (necessary, functional, analytics, marketing)
 * - Persistent consent storage
 * - Privacy policy link
 * 
 * Phase 4: Compliance & Legal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';

export interface CookieConsentProps {
  onAccept?: () => void;
  onReject?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onReject,
}) => {
  const { agreements, acceptCookies } = useComplianceStore();
  const [isVisible, setIsVisible] = useState(!agreements.cookieConsent);
  const [showCustomize, setShowCustomize] = useState(false);
  
  // Cookie categories
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false,
  });

  // Accept all cookies
  const handleAcceptAll = () => {
    acceptCookies();
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  // Reject non-essential cookies
  const handleRejectAll = () => {
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    acceptCookies();
    setIsVisible(false);
    if (onReject) onReject();
  };

  // Save custom preferences
  const handleSavePreferences = () => {
    acceptCookies();
    setIsVisible(false);
    setShowCustomize(false);
    if (onAccept) onAccept();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto">
            {/* Main Banner */}
            {!showCustomize && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Icon and Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Cookie size={24} className="text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">We Value Your Privacy</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      We use cookies to enhance your experience, provide personalized content, 
                      analyze traffic, and improve our services. By clicking "Accept All", you 
                      consent to our use of cookies.{' '}
                      <a 
                        href="/privacy-policy" 
                        className="text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more
                      </a>
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings size={16} />
                      Customize
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Accept All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customize Panel */}
            {showCustomize && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Cookie size={24} className="text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
                  </div>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies (Always enabled) */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Necessary Cookies</h4>
                        <p className="text-sm text-gray-400">
                          These cookies are essential for the website to function properly. They enable 
                          core functionality such as security, authentication, and navigation.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Always Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Functional Cookies</h4>
                        <p className="text-sm text-gray-400">
                          These cookies enable enhanced functionality and personalization, such as 
                          remembering your preferences and settings.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Analytics Cookies</h4>
                        <p className="text-sm text-gray-400">
                          These cookies help us understand how visitors interact with our website by 
                          collecting and reporting information anonymously.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Marketing Cookies</h4>
                        <p className="text-sm text-gray-400">
                          These cookies are used to track visitors across websites to display ads that 
                          are relevant and engaging for individual users.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-300">
                    You can change your preferences at any time by clicking the "Cookie Settings" 
                    link in the footer. For more information, see our{' '}
                    <a 
                      href="/privacy-policy" 
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a 
                      href="/cookie-policy" 
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Save Preferences
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Accept All
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
