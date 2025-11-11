/**
 * Age Verification Component
 * 
 * Features:
 * - 21+ age requirement modal
 * - Date of birth input with validation
 * - Self-declaration method
 * - Session-based verification storage
 * - Blocking modal (cannot dismiss without verification)
 * - State-specific age requirements
 * - Links to responsible gaming resources
 * 
 * Phase 4: Compliance & Legal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Shield, Calendar } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';

export interface AgeVerificationProps {
  minAge?: number; // Default 21
  onVerified?: () => void;
  onFailed?: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({
  minAge = 21,
  onVerified,
  onFailed,
}) => {
  const { ageVerification, setAgeVerified } = useComplianceStore();
  const [isOpen, setIsOpen] = useState(!ageVerification.isVerified);
  const [step, setStep] = useState<'intro' | 'form' | 'success' | 'failed'>('intro');
  
  // Form state
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor verification state
  useEffect(() => {
    if (ageVerification.isVerified) {
      setIsOpen(false);
      setStep('success');
      if (onVerified) {
        onVerified();
      }
    }
  }, [ageVerification.isVerified, onVerified]);

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate inputs
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const yearNum = parseInt(year, 10);

      if (!monthNum || monthNum < 1 || monthNum > 12) {
        throw new Error('Invalid month');
      }

      if (!dayNum || dayNum < 1 || dayNum > 31) {
        throw new Error('Invalid day');
      }

      if (!yearNum || yearNum < 1900 || yearNum > new Date().getFullYear()) {
        throw new Error('Invalid year');
      }

      // Create date
      const dob = new Date(yearNum, monthNum - 1, dayNum);

      // Validate date is valid
      if (isNaN(dob.getTime())) {
        throw new Error('Invalid date');
      }

      // Validate date is not in future
      if (dob > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }

      // Calculate age
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      // Check age requirement
      if (age < minAge) {
        setStep('failed');
        if (onFailed) {
          onFailed();
        }
        setError(`You must be at least ${minAge} years old to use this service.`);
        setIsSubmitting(false);
        return;
      }

      // Set verified
      setAgeVerified(dob, 'self-declaration');
      setStep('success');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid date of birth');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent closing modal if not verified
  const handleClose = () => {
    if (ageVerification.isVerified) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Intro Step */}
            {step === 'intro' && (
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Shield size={32} className="text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Age Verification Required
                  </h2>
                  <p className="text-gray-400">
                    You must be at least {minAge} years old to access this service.
                  </p>
                </div>

                {/* Important Information */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-blue-300">
                    <strong>Why we need this:</strong>
                  </p>
                  <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                    <li>Federal and state law requires age verification for sports betting</li>
                    <li>Protect minors from gambling-related harm</li>
                    <li>Comply with responsible gaming regulations</li>
                  </ul>
                </div>

                {/* Privacy Notice */}
                <div className="text-xs text-gray-500 text-center">
                  Your date of birth is stored locally and never shared with third parties.
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => setStep('form')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Continue to Verification
                </button>
              </div>
            )}

            {/* Form Step */}
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Calendar size={24} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Enter Your Date of Birth
                  </h2>
                  <p className="text-sm text-gray-400">
                    You must be {minAge}+ to continue
                  </p>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Month */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Month</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      placeholder="MM"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Day */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="DD"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Year</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="YYYY"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-start gap-2"
                  >
                    <AlertCircle size={18} className="text-red-400 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Age'}
                </button>

                {/* Responsible Gaming Links */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>
                    If you have a gambling problem, call{' '}
                    <a href="tel:1-800-522-4700" className="text-blue-400 hover:underline">
                      1-800-GAMBLER
                    </a>
                  </p>
                  <p>
                    <a
                      href="https://www.ncpgambling.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      National Council on Problem Gambling
                    </a>
                  </p>
                </div>
              </form>
            )}

            {/* Success Step */}
            {step === 'success' && (
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
                    Verification Complete
                  </h2>
                  <p className="text-gray-400">
                    Thank you for verifying your age. You may now access the service.
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Closing automatically...
                </div>
              </motion.div>
            )}

            {/* Failed Step */}
            {step === 'failed' && (
              <div className="p-6 space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Age Verification Failed
                  </h2>
                  <p className="text-gray-400">
                    You must be at least {minAge} years old to access this service.
                  </p>
                </div>

                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <p className="text-sm text-red-300">
                    This service is restricted to individuals who meet the minimum age requirement
                    as mandated by federal and state law.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    If you believe this is an error, please contact support.
                  </p>
                  <p className="text-xs text-gray-500">
                    For help with problem gambling, call{' '}
                    <a href="tel:1-800-522-4700" className="text-blue-400 hover:underline">
                      1-800-GAMBLER
                    </a>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerification;
