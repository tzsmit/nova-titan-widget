/**
 * Line Shopping Table Component
 * 
 * Features:
 * - Compare same bet across all bookmakers
 * - Sort by best odds
 * - Savings calculator (vs worst line)
 * - Color-coded best/worst lines
 * - One-click optimization button
 * - Export to CSV functionality
 * - Real-time odds updates
 * 
 * Phase 3: Frontend UI
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Download, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';

export interface LineShoppingRow {
  bookmakerKey: string;
  bookmakerName: string;
  bookmakerLogo: string;
  odds: number; // American odds
  impliedProbability: number;
  expectedValue: number; // vs true probability
  lastUpdate: Date;
  isLive: boolean;
  affiliateUrl: string;
}

export interface LineShoppingTableProps {
  eventId: string;
  eventName: string;
  market: string;
  selection: string;
  lines: LineShoppingRow[];
  trueProbability?: number; // For EV calculation
  betAmount?: number; // Default $100
  onOptimize?: (bookmakerKey: string) => void;
  showEV?: boolean;
}

type SortField = 'odds' | 'impliedProbability' | 'expectedValue' | 'bookmaker';
type SortDirection = 'asc' | 'desc';

const LineShoppingTable: React.FC<LineShoppingTableProps> = ({
  eventId,
  eventName,
  market,
  selection,
  lines,
  trueProbability,
  betAmount = 100,
  onOptimize,
  showEV = true,
}) => {
  const [sortField, setSortField] = useState<SortField>('odds');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort lines
  const sortedLines = useMemo(() => {
    return [...lines].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'odds':
          // For American odds, -105 is better than -110
          // For positive odds, +150 is better than +120
          if (a.odds > 0 && b.odds > 0) {
            comparison = a.odds - b.odds;
          } else if (a.odds < 0 && b.odds < 0) {
            comparison = b.odds - a.odds; // Reversed for negative odds
          } else if (a.odds > 0) {
            comparison = 1; // Positive odds are better
          } else {
            comparison = -1;
          }
          break;
        case 'impliedProbability':
          comparison = a.impliedProbability - b.impliedProbability;
          break;
        case 'expectedValue':
          comparison = a.expectedValue - b.expectedValue;
          break;
        case 'bookmaker':
          comparison = a.bookmakerName.localeCompare(b.bookmakerName);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lines, sortField, sortDirection]);

  // Find best and worst lines
  const bestLine = useMemo(() => {
    return lines.reduce((best, current) => {
      if (current.odds > 0 && best.odds > 0) {
        return current.odds > best.odds ? current : best;
      } else if (current.odds < 0 && best.odds < 0) {
        return current.odds > best.odds ? current : best;
      } else if (current.odds > 0) {
        return current;
      } else {
        return best;
      }
    }, lines[0]);
  }, [lines]);

  const worstLine = useMemo(() => {
    return lines.reduce((worst, current) => {
      if (current.odds > 0 && worst.odds > 0) {
        return current.odds < worst.odds ? current : worst;
      } else if (current.odds < 0 && worst.odds < 0) {
        return current.odds < worst.odds ? current : worst;
      } else if (current.odds < 0) {
        return current;
      } else {
        return worst;
      }
    }, lines[0]);
  }, [lines]);

  // Calculate potential payout
  const calculatePayout = (odds: number, stake: number): number => {
    if (odds > 0) {
      return stake + (stake * odds / 100);
    } else {
      return stake + (stake * 100 / Math.abs(odds));
    }
  };

  // Calculate savings vs worst line
  const calculateSavings = (odds: number): number => {
    const bestPayout = calculatePayout(bestLine.odds, betAmount);
    const currentPayout = calculatePayout(odds, betAmount);
    return bestPayout - currentPayout;
  };

  // Format odds
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Bookmaker', 'Odds', 'Implied Probability', 'Payout ($100)', 'Savings vs Worst', 'Expected Value', 'Last Update'];
    const rows = sortedLines.map(line => [
      line.bookmakerName,
      formatOdds(line.odds),
      formatPercentage(line.impliedProbability),
      formatCurrency(calculatePayout(line.odds, 100)),
      formatCurrency(calculateSavings(line.odds)),
      line.expectedValue ? formatPercentage(line.expectedValue) : 'N/A',
      line.lastUpdate.toLocaleTimeString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `line-shopping-${eventId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get row color based on performance
  const getRowColor = (odds: number): string => {
    if (odds === bestLine.odds) {
      return 'bg-green-900/30 border-green-700';
    } else if (odds === worstLine.odds) {
      return 'bg-red-900/30 border-red-700';
    } else {
      return 'bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Line Shopping</h3>
          <p className="text-sm text-gray-400">
            {eventName} • {market} • {selection}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900/30 border border-green-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-400" />
            <span className="text-green-400 font-semibold text-sm">Best Line</span>
          </div>
          <p className="text-white font-bold">{bestLine.bookmakerName}</p>
          <p className="text-2xl font-bold text-green-400">{formatOdds(bestLine.odds)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Payout: {formatCurrency(calculatePayout(bestLine.odds, betAmount))}
          </p>
        </motion.div>

        {/* Worst Line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-900/30 border border-red-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-400" />
            <span className="text-red-400 font-semibold text-sm">Worst Line</span>
          </div>
          <p className="text-white font-bold">{worstLine.bookmakerName}</p>
          <p className="text-2xl font-bold text-red-400">{formatOdds(worstLine.odds)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Payout: {formatCurrency(calculatePayout(worstLine.odds, betAmount))}
          </p>
        </motion.div>

        {/* Potential Savings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/30 border border-blue-700 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-blue-400" />
            <span className="text-blue-400 font-semibold text-sm">Potential Savings</span>
          </div>
          <p className="text-white font-bold">Line Shopping</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(calculatePayout(bestLine.odds, betAmount) - calculatePayout(worstLine.odds, betAmount))}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {formatPercentage((calculatePayout(bestLine.odds, betAmount) / calculatePayout(worstLine.odds, betAmount) - 1) * 100)} better
          </p>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th
                onClick={() => handleSort('bookmaker')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  Bookmaker
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                onClick={() => handleSort('odds')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Odds
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                onClick={() => handleSort('impliedProbability')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Implied Prob
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Payout (${betAmount})
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                Savings
              </th>
              {showEV && trueProbability && (
                <th
                  onClick={() => handleSort('expectedValue')}
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    EV
                    <ArrowUpDown size={14} />
                  </div>
                </th>
              )}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                Last Update
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLines.map((line, index) => {
              const isBest = line.odds === bestLine.odds;
              const isWorst = line.odds === worstLine.odds;
              const savings = calculateSavings(line.odds);
              const payout = calculatePayout(line.odds, betAmount);

              return (
                <motion.tr
                  key={line.bookmakerKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b ${getRowColor(line.odds)} hover:bg-opacity-50 transition-all`}
                >
                  {/* Bookmaker */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{line.bookmakerLogo}</span>
                      <div>
                        <p className="text-white font-medium">{line.bookmakerName}</p>
                        {line.isLive && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Odds */}
                  <td className="px-4 py-3 text-right">
                    <span className={`text-lg font-bold ${isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-white'}`}>
                      {formatOdds(line.odds)}
                    </span>
                    {isBest && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                        BEST
                      </span>
                    )}
                    {isWorst && (
                      <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                        WORST
                      </span>
                    )}
                  </td>

                  {/* Implied Probability */}
                  <td className="px-4 py-3 text-right text-gray-300">
                    {formatPercentage(line.impliedProbability)}
                  </td>

                  {/* Payout */}
                  <td className="px-4 py-3 text-right text-white font-medium">
                    {formatCurrency(payout)}
                  </td>

                  {/* Savings */}
                  <td className="px-4 py-3 text-right">
                    <span className={savings >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
                    </span>
                  </td>

                  {/* Expected Value */}
                  {showEV && trueProbability && (
                    <td className="px-4 py-3 text-right">
                      <span className={line.expectedValue > 0 ? 'text-green-400 font-medium' : 'text-gray-400'}>
                        {line.expectedValue > 0 ? '+' : ''}{formatPercentage(line.expectedValue)}
                      </span>
                    </td>
                  )}

                  {/* Last Update */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {line.lastUpdate.toLocaleTimeString()}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onOptimize?.(line.bookmakerKey)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Select
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-xs text-gray-400">
          <strong>💡 Pro Tip:</strong> Always shop lines before placing your bet. Even small differences in odds can significantly impact your long-term profitability.
          {showEV && trueProbability && (
            <span> Positive EV (+EV) indicates a profitable bet based on true probability estimates.</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Last refreshed: {new Date().toLocaleTimeString()} • Auto-refresh every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default LineShoppingTable;
