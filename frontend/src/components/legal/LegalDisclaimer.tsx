/**
 * Legal Disclaimer Component
 * Displays required legal information and disclaimers
 */

import React from 'react';
import { useWidgetStore } from '../../stores/widgetStore';

export const LegalDisclaimer: React.FC = () => {
  const { config } = useWidgetStore();

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
    </div>
  );
};

export default LegalDisclaimer;