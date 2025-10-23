/**
 * ResponsiveHeader Component
 * Mobile-first responsive header with hamburger menu, bet slip toggle, and proper navigation
 * Addresses: Header/Nav refactoring for 3-column desktop, 2-column tablet, 1-column mobile
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Bell, 
  Settings,
  User,
  Search,
  TrendingUp,
  Star,
  RefreshCw,
  ChevronDown,
  Trophy
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface HeaderAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface ResponsiveHeaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  onMenuToggle?: (isOpen: boolean) => void;
  onBetSlipToggle?: (isOpen: boolean) => void;
  onSearch?: (query: string) => void;
  actions?: HeaderAction[];
  betSlipCount?: number;
  notificationCount?: number;
  isMenuOpen?: boolean;
  isBetSlipOpen?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'transparent';
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title = 'Nova Titan',
  subtitle = 'Sports Betting Intelligence',
  logoUrl,
  onMenuToggle,
  onBetSlipToggle,
  onSearch,
  actions = [],
  betSlipCount = 0,
  notificationCount = 0,
  isMenuOpen = false,
  isBetSlipOpen = false,
  className,
  variant = 'default',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Media queries for responsive behavior
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Default actions if none provided
  const defaultActions: HeaderAction[] = [
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: () => window.location.reload(),
      variant: 'ghost'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Star className="w-4 h-4" />,
      onClick: () => {},
      variant: 'ghost'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {},
      variant: 'ghost'
    }
  ];

  const headerActions = actions.length > 0 ? actions : defaultActions;

  return (
    <header
      className={cn(
        'nova-header nova-glass sticky top-0 z-50 w-full nova-transition',
        variant === 'compact' && 'py-2',
        className
      )}
      role="banner"
    >
      <div className="max-w-content mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Section: Menu Toggle (Mobile/Tablet) + Logo + Title */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Hamburger Menu - Mobile & Tablet only */}
            {(isMobile || isTablet) && (
              <button
                onClick={() => onMenuToggle?.(!isMenuOpen)}
                className="nova-nav-item p-2 lg:hidden"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </button>
            )}

            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${title} logo`}
                  className="h-8 w-auto flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Title & Subtitle - Hidden on mobile when search is focused */}
              <div className={cn(
                'min-w-0 transition-opacity duration-200',
                isMobile && isSearchFocused && 'opacity-0 pointer-events-none'
              )}>
                <h1 className="nova-logo-text text-lg sm:text-xl truncate">
                  {title}
                </h1>
                {subtitle && !isMobile && (
                  <p className="text-xs truncate" style={{ color: 'var(--nova-text-secondary)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Center Section: Search (Desktop) */}
          {isDesktop && (
            <div className="flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search teams, games, players..."
                  className="nova-search-input pl-10 pr-4 text-sm"
                  aria-label="Search sports content"
                />
              </form>
            </div>
          )}

          {/* Right Section: Actions + Bet Slip */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Search Button (Mobile/Tablet only) */}
            {!isDesktop && (
              <button
                onClick={() => setIsSearchFocused(!isSearchFocused)}
                className="btn-base bg-transparent hover:bg-neutral-100 text-neutral-700 p-2"
                aria-label="Toggle search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Action Buttons - Responsive display */}
            <div className="hidden sm:flex items-center space-x-1">
              {headerActions.slice(0, isTablet ? 2 : 3).map((action) => (
                <motion.button
                  key={action.id}
                  onClick={action.onClick}
                  className={cn(
                    'btn-base text-sm px-3 py-2 relative',
                    action.variant === 'primary' && 'bg-primary-600 hover:bg-primary-700 text-white',
                    action.variant === 'secondary' && 'bg-secondary-600 hover:bg-secondary-700 text-white',
                    action.variant === 'ghost' && 'bg-transparent hover:bg-neutral-100 text-neutral-700'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={action.label}
                  aria-label={action.label}
                >
                  {action.icon}
                  {!isMobile && (
                    <span className="ml-2 hidden lg:inline">{action.label}</span>
                  )}
                  
                  {/* Badge for notifications */}
                  {action.badge && action.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {action.badge > 99 ? '99+' : action.badge}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Notifications */}
            {notificationCount > 0 && (
              <motion.button
                className="btn-base bg-transparent hover:bg-neutral-100 text-neutral-700 p-2 relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${notificationCount} notifications`}
              >
                <Bell className="w-4 h-4" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </motion.span>
              </motion.button>
            )}

            {/* Bet Slip Toggle */}
            <motion.button
              onClick={() => onBetSlipToggle?.(!isBetSlipOpen)}
              className={cn(
                'btn-base relative p-2 lg:px-4 lg:py-2',
                isBetSlipOpen 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Bet slip with ${betSlipCount} items`}
              aria-pressed={isBetSlipOpen}
            >
              <ShoppingCart className="w-4 h-4" />
              {!isMobile && (
                <span className="ml-2 hidden lg:inline font-medium">
                  Bet Slip
                </span>
              )}
              
              {/* Bet count badge */}
              {betSlipCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold',
                    isBetSlipOpen 
                      ? 'bg-white text-primary-600' 
                      : 'bg-primary-600 text-white'
                  )}
                >
                  {betSlipCount > 99 ? '99+' : betSlipCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu (Desktop only) */}
            {isDesktop && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="btn-base bg-transparent hover:bg-neutral-100 text-neutral-700 p-2 flex items-center space-x-1"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-dropdown"
                      onBlur={() => setShowUserMenu(false)}
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="font-medium text-neutral-900">User</p>
                        <p className="text-sm text-neutral-600">Premium Member</p>
                      </div>
                      <div className="py-1">
                        <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                          Account Settings
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                          Betting History
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {(isMobile || isTablet) && isSearchFocused && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-neutral-200 px-4 py-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams, games, players..."
                  className="nova-search-input pl-10 pr-4 text-sm"
                  autoFocus
                  aria-label="Search sports content"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default ResponsiveHeader;