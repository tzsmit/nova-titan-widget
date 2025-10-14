/**
 * Legal Disclaimer Component
 * Displays required legal information and disclaimers
 */

import React, { useState } from 'react';
import { useWidgetStore } from '../../stores/widgetStore';
import { TermsOfService } from './TermsOfService';

export const LegalDisclaimer: React.FC = () => {
  const { config } = useWidgetStore();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="p-3 text-center">
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>⚠️ Important:</strong> This is for entertainment and educational purposes only. 
          Gambling can be addictive. Please bet responsibly.
        </p>
        
        {config.minimumAge && (
          <p>
            Must be {config.minimumAge}+ years old to participate in sports betting.
          </p>
        )}
        
        <p>
          Predictions are AI-generated and should not be considered as financial advice. 
          Past performance does not guarantee future results.
        </p>
        
        <div className="border-t border-gray-300 pt-2 mt-2">
          <p className="font-medium">
            © 2025 Nova Titan Systems. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-1">
            <button 
              onClick={() => setShowTerms(true)} 
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Terms of Service
            </button>
            <span className="text-gray-400">•</span>
            <a 
              href="https://novatitan.net/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Nova Titan Systems
            </a>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mt-2">
          <a 
            href="https://www.ncpgambling.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Problem Gambling Help
          </a>
          <a 
            href="https://www.gamblersanonymous.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Gamblers Anonymous
          </a>
        </div>
      </div>
      
      {/* Terms of Service Modal */}
      <TermsOfService 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
    </div>
  );
};

export default LegalDisclaimer;