/**
 * Date Selector Component
 * Allows selection of dates up to 14 days in the future for games
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  className?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateSelect,
  className = ''
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate array of next 14 days in CST to match game filtering
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate YYYY-MM-DD string directly from CST date to match filtering logic
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); // YYYY-MM-DD format
      
      const displayDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Chicago'
      });
      
      console.log(`📅 DateSelector generating: ${dateStr} (${displayDate})`);
      
      dates.push({
        value: dateStr,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : displayDate,
        fullDate: date
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();
  const selectedDateLabel = dateOptions.find(d => d.value === selectedDate)?.label || 'Today';

  const handleDateSelect = (date: string) => {
    onDateSelect(date);
    setShowDatePicker(false);
  };

  const getCurrentDateIndex = () => {
    return dateOptions.findIndex(d => d.value === selectedDate) || 0;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentDateIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(dateOptions.length - 1, currentIndex + 1);
    }
    
    handleDateSelect(dateOptions[newIndex].value);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Date Navigation Bar */}
      <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-2 border border-slate-600">
        {/* Previous Day Button */}
        <button
          onClick={() => navigateDate('prev')}
          disabled={getCurrentDateIndex() === 0}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Current Date Display */}
        <motion.button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors min-w-[140px] justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="h-4 w-4 text-blue-400" />
          <span className="font-medium">{selectedDateLabel}</span>
        </motion.button>

        {/* Next Day Button */}
        <button
          onClick={() => navigateDate('next')}
          disabled={getCurrentDateIndex() === dateOptions.length - 1}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown Date Picker */}
      <AnimatePresence>
        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              {dateOptions.map((date, index) => (
                <motion.button
                  key={date.value}
                  onClick={() => handleDateSelect(date.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedDate === date.value
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{date.label}</div>
                      <div className="text-xs text-slate-400">
                        {date.fullDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    {selectedDate === date.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};