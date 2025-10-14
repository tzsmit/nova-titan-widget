/**
 * Nova Titan Logo Component
 * Sports betting-themed logo with secure branding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
// Use the deployed logo URL directly
const novaTitanLogoUrl = 'https://cdn1.genspark.ai/user-upload-image/gpt_image_edited/90a28898-de41-49b6-8ac8-ec5478c81614.png';

interface NovaTitanLogoProps {
  size?: 'small' | 'medium' | 'large';
  showBranding?: boolean;
  className?: string;
  animated?: boolean;
}

export const NovaTitanLogo: React.FC<NovaTitanLogoProps> = ({ 
  size = 'medium', 
  showBranding = true,
  className = '',
  animated = true
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  const brandingSizeClasses = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  };

  const LogoComponent = animated ? motion.div : 'div';
  const logoProps = animated ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <div className={`flex items-center gap-3 nova-titan-protected nova-titan-branding ${className}`}>
      <LogoComponent 
        className={`${sizeClasses[size]} nova-titan-logo-container rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600`}
        {...logoProps}
      >
        <img 
          src={novaTitanLogoUrl} 
          alt="Nova Titan Elite Logo" 
          className="w-full h-full object-cover nova-titan-protected"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserDrag: 'none',
            userDrag: 'none'
          }}
          onContextMenu={(e) => e.preventDefault()}
          onSelectStart={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
        />
      </LogoComponent>
      
      {showBranding && (
        <div className="nova-titan-protected">
          <h1 className={`${textSizeClasses[size]} font-bold text-slate-100 nova-titan-protected`}>
            Nova Titan Elite
          </h1>
          <div className={`flex items-center gap-2 ${brandingSizeClasses[size]} text-slate-400 nova-titan-protected`}>
            <Globe className="h-3 w-3" />
            <span>Powered by </span>
            <a 
              href="https://novatitan.net/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors nova-titan-protected"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              Nova TitanAI
            </a>
            <span className="text-slate-500 nova-titan-protected"> a product of </span>
            <span className="text-blue-400 font-medium nova-titan-protected">Nova Titan Systems</span>
          </div>
        </div>
      )}
    </div>
  );
};