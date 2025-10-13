/**
 * Age Gate Component
 * Legal compliance component for age verification
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';

export const AgeGate: React.FC = () => {
  const { config, setAgeVerified, setShowLegalModal } = useWidgetStore();
  const [birthDate, setBirthDate] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setErrorMessage('');

    if (!birthDate) {
      setHasError(true);
      setErrorMessage('Please enter your birth date');
      return;
    }

    const age = calculateAge(birthDate);
    const minimumAge = config.minimumAge || 18;

    if (age < minimumAge) {
      setHasError(true);
      setErrorMessage(`You must be at least ${minimumAge} years old to access this content`);
      return;
    }

    // Age verification passed
    setAgeVerified(true);
    setShowLegalModal(false);

    // Store verification in localStorage (expires in 24 hours)
    const verificationData = {
      verified: true,
      timestamp: Date.now(),
      age
    };
    localStorage.setItem('nova_titan_age_verification', JSON.stringify(verificationData));
  };

  const handleDecline = () => {
    // Redirect or show alternative content
    window.location.href = 'https://www.ncpgambling.org/help-treatment/';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-nova text-white px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Age Verification Required</h2>
          <p className="text-white/90 text-sm">
            You must be {config.minimumAge}+ to access this content
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="birthDate" className="form-label">
                Date of Birth
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`form-input ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
              />
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errorMessage}
                </motion.p>
              )}
            </div>

            {/* Legal Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Important Legal Notice</p>
                  <p>
                    This content is for entertainment purposes only. 
                    Gambling involves risk and should be done responsibly. 
                    Check your local laws regarding online gambling.
                  </p>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreement"
                required
                className="mt-1 h-4 w-4 text-nova-navy-600 focus:ring-nova-navy-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement" className="text-sm text-gray-600">
                I confirm that I am at least {config.minimumAge} years old and agree to use this tool for 
                entertainment purposes only. I understand that gambling involves risk.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Verify & Continue
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="btn-outline flex-1"
              >
                Exit
              </button>
            </div>
          </form>

          {/* Help Links */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help with gambling? Visit{' '}
              <a 
                href="https://www.ncpgambling.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-nova-navy-600 hover:text-nova-navy-800 underline"
              >
                ncpgambling.org
              </a>
              {' '}or call 1-800-522-4700
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgeGate;