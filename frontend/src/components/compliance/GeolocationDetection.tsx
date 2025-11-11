/**
 * Geolocation Detection Component
 * 
 * Features:
 * - Automatic location detection on mount
 * - Manual retry button
 * - Legal state validation
 * - Geo-blocking for illegal states
 * - State-specific disclaimers
 * - Loading and error states
 * 
 * Phase 4: Compliance & Legal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { GeolocationService } from '../../services/GeolocationService';

export interface GeolocationDetectionProps {
  autoDetect?: boolean; // Automatically detect on mount
  onDetected?: (state: string, isLegal: boolean) => void;
  onBlocked?: (state: string) => void;
}

const GeolocationDetection: React.FC<GeolocationDetectionProps> = ({
  autoDetect = true,
  onDetected,
  onBlocked,
}) => {
  const { geolocation, setGeolocation, setGeolocationError } = useComplianceStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auto-detect on mount
  useEffect(() => {
    if (autoDetect && !geolocation.isDetected) {
      detectLocation();
    }
  }, [autoDetect]);

  // Detect location
  const detectLocation = async () => {
    setIsDetecting(true);
    setShowModal(true);

    try {
      const result = await GeolocationService.getCurrentLocation();

      if (result.error) {
        setGeolocationError(result.error);
        return;
      }

      if (!result.state) {
        setGeolocationError('Unable to determine your state. Please try again.');
        return;
      }

      const isLegal = result.isLegalState || false;

      // Update store
      setGeolocation(
        result.state,
        result.latitude,
        result.longitude,
        isLegal
      );

      // Callbacks
      if (onDetected) {
        onDetected(result.state, isLegal);
      }

      if (!isLegal && onBlocked) {
        onBlocked(result.state);
      }

      // Close modal after 2 seconds if legal
      if (isLegal) {
        setTimeout(() => {
          setShowModal(false);
        }, 2000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect location';
      setGeolocationError(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  // Retry detection
  const handleRetry = () => {
    detectLocation();
  };

  return (
    <AnimatePresence>
      {showModal && !geolocation.isDetected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Detecting State */}
            {isDetecting && (
              <div className="p-6 space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <MapPin size={32} className="text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Detecting Your Location
                  </h2>
                  <p className="text-gray-400">
                    Please allow location access to verify you're in a legal betting state.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                <div className="text-xs text-gray-500">
                  This may take a few seconds...
                </div>
              </div>
            )}

            {/* Error State */}
            {!isDetecting && geolocation.error && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Location Detection Failed
                  </h2>
                  <p className="text-gray-400">{geolocation.error}</p>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-yellow-300">
                    <strong>Why we need your location:</strong>
                  </p>
                  <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                    <li>Verify you're in a state where sports betting is legal</li>
                    <li>Comply with federal and state gambling regulations</li>
                    <li>Prevent unauthorized access from restricted locations</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleRetry}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>

                  <a
                    href="https://support.google.com/chrome/answer/142065"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
                  >
                    How to enable location services
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {/* Success State (Legal) */}
            {!isDetecting && geolocation.isDetected && geolocation.isLegalState && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="p-6 space-y-4 text-center"
              >
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Location Verified
                  </h2>
                  <p className="text-gray-400">
                    You're in <strong className="text-white">{geolocation.state}</strong>, 
                    a legal sports betting state.
                  </p>
                </div>

                {geolocation.state && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                    <p className="text-xs text-gray-300">
                      {GeolocationService.getStateDisclaimer(geolocation.state)}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Closing automatically...
                </div>
              </motion.div>
            )}

            {/* Blocked State (Illegal) */}
            {!isDetecting && geolocation.isDetected && !geolocation.isLegalState && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Location Not Supported
                  </h2>
                  <p className="text-gray-400">
                    Sports betting is not currently legal in{' '}
                    <strong className="text-white">{geolocation.state}</strong>.
                  </p>
                </div>

                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-red-300">
                    <strong>We're sorry!</strong>
                  </p>
                  <p className="text-xs text-gray-300">
                    Federal and state law requires us to block access to sports betting services 
                    from states where it is not legal. This is to protect you and ensure compliance 
                    with gambling regulations.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-400 text-center">
                    Legal sports betting states include:
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {GeolocationService.LEGAL_BETTING_STATES.map((state) => (
                      <span
                        key={state}
                        className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {state}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  If you believe this is an error, please contact support.
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GeolocationDetection;
