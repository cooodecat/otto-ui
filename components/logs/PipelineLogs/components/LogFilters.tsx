'use client';

import React, { useState } from 'react';
import { Search, Filter, X, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: LogFilterState) => void;
  totalLogs: number;
  filteredLogs: number;
}

export interface LogFilterState {
  levels: Set<string>;
  statuses: Set<string>;
  timeRange: string;
  regex: boolean;
}

const LogFilters: React.FC<LogFiltersProps> = ({
  searchQuery,
  onSearchChange,
  onFilterChange,
  totalLogs,
  filteredLogs
}) => {
  const [filters, setFilters] = useState<LogFilterState>({
    levels: new Set(['ERROR', 'WARN', 'INFO', 'DEBUG']),
    statuses: new Set(['success', 'failed', 'running', 'pending']),
    timeRange: 'all',
    regex: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLevel = (level: string) => {
    const newLevels = new Set(filters.levels);
    if (newLevels.has(level)) {
      newLevels.delete(level);
    } else {
      newLevels.add(level);
    }
    const newFilters = { ...filters, levels: newLevels };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = new Set(filters.statuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    const newFilters = { ...filters, statuses: newStatuses };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const levelButtons = [
    { value: 'ERROR', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
    { value: 'WARN', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
    { value: 'INFO', icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { value: 'DEBUG', icon: CheckCircle2, color: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100' }
  ];

  const statusButtons = [
    { value: 'success', label: 'Success', color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
    { value: 'failed', label: 'Failed', color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
    { value: 'running', label: 'Running', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100' }
  ];

  const timeRangeOptions = [
    { value: 'all', label: 'All time' },
    { value: '1h', label: 'Last hour' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={filters.regex ? "Filter logs... (regex enabled)" : "Filter logs..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors cursor-pointer",
              isExpanded 
                ? "bg-blue-50 border-blue-300 text-blue-700" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {(filteredLogs !== totalLogs) && (
              <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {filteredLogs}/{totalLogs}
              </span>
            )}
          </button>

          <label className="flex items-center gap-2 px-3">
            <input
              type="checkbox"
              checked={filters.regex}
              onChange={(e) => {
                const newFilters = { ...filters, regex: e.target.checked };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Regex</span>
          </label>
        </div>
      </div>

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Log Level Filters */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Log Levels
            </label>
            <div className="flex gap-2 flex-wrap">
              {levelButtons.map(({ value, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => toggleLevel(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium cursor-pointer",
                    filters.levels.has(value)
                      ? color
                      : "bg-white border-gray-300 text-gray-400 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Pipeline Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {statusButtons.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border transition-all text-sm font-medium cursor-pointer",
                    filters.statuses.has(value)
                      ? color
                      : "bg-white border-gray-300 text-gray-400 hover:bg-gray-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Time Range
            </label>
            <div className="flex gap-2 flex-wrap">
              {timeRangeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    const newFilters = { ...filters, timeRange: value };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border transition-all text-sm font-medium cursor-pointer",
                    filters.timeRange === value
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                const newFilters = {
                  levels: new Set(['ERROR']),
                  statuses: new Set(['failed']),
                  timeRange: '24h',
                  regex: false
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Show Errors Only
            </button>
            <button
              onClick={() => {
                const newFilters = {
                  levels: new Set(['ERROR', 'WARN', 'INFO', 'DEBUG']),
                  statuses: new Set(['success', 'failed', 'running', 'pending']),
                  timeRange: 'all',
                  regex: false
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
                onSearchChange('');
              }}
              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilters;