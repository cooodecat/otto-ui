'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { searchLogs, SearchLogsRequest, SearchLogsResponse } from '@/lib/api/unified-logs-api';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/logs/useDebounce';
import {
  Search,
  X,
  Regex,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
  FileText,
  Settings
} from 'lucide-react';

interface LogSearchProps {
  buildId: string;
  onSearchResults?: (results: SearchLogsResponse['results']) => void;
  className?: string;
  autoSearch?: boolean;
  debounceMs?: number;
}

const LogSearch: React.FC<LogSearchProps> = ({
  buildId,
  onSearchResults,
  className,
  autoSearch = true,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['ERROR', 'WARN', 'INFO', 'DEBUG']);
  const [includeContext, setIncludeContext] = useState(false);
  const [contextLines, setContextLines] = useState(3);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchLogsResponse['results']>([]);
  const [searchMetrics, setSearchMetrics] = useState<{
    totalMatches: number;
    searchTime: number;
  } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const debouncedQuery = useDebounce(query, debounceMs);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearchMetrics(null);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const request: SearchLogsRequest = {
        query: debouncedQuery,
        regex: isRegex,
        levels: selectedLevels,
        includeContext,
        contextLines: includeContext ? contextLines : undefined
      };

      const response = await searchLogs(buildId, request);
      setResults(response.results);
      setSearchMetrics({
        totalMatches: response.totalMatches,
        searchTime: response.searchTime
      });
      onSearchResults?.(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setSearchMetrics(null);
    } finally {
      setIsSearching(false);
    }
  }, [
    buildId,
    debouncedQuery,
    isRegex,
    selectedLevels,
    includeContext,
    contextLines,
    onSearchResults
  ]);

  useEffect(() => {
    if (autoSearch && debouncedQuery) {
      performSearch();
    }
  }, [autoSearch, debouncedQuery, performSearch]);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const toggleResultExpansion = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const highlightMatches = (text: string, matches: Array<{ start: number; end: number }>) => {
    if (!matches || matches.length === 0) return text;

    const parts: Array<{ text: string; highlighted: boolean }> = [];
    let lastEnd = 0;

    matches.forEach(match => {
      if (match.start > lastEnd) {
        parts.push({ text: text.slice(lastEnd, match.start), highlighted: false });
      }
      parts.push({ text: text.slice(match.start, match.end), highlighted: true });
      lastEnd = match.end;
    });

    if (lastEnd < text.length) {
      parts.push({ text: text.slice(lastEnd), highlighted: false });
    }

    return (
      <>
        {parts.map((part, i) => (
          <span
            key={i}
            className={part.highlighted ? 'bg-yellow-300 text-black px-0.5' : ''}
          >
            {part.text}
          </span>
        ))}
      </>
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600';
      case 'WARN': return 'text-yellow-600';
      case 'INFO': return 'text-blue-600';
      case 'DEBUG': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRegex ? "Enter regex pattern..." : "Search logs..."}
              className={cn(
                "w-full pl-10 pr-10 py-2 border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                error ? "border-red-300" : "border-gray-300"
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !autoSearch) {
                  performSearch();
                }
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearchMetrics(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsRegex(!isRegex)}
            className={cn(
              "px-3 py-2 border rounded-lg transition-colors flex items-center gap-2",
              isRegex
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            )}
            title="Toggle regex mode"
          >
            <Regex className="w-4 h-4" />
            <span className="text-sm font-medium">Regex</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {!autoSearch && (
            <button
              onClick={performSearch}
              disabled={isSearching || !query}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors",
                "hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              )}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          )}
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* Log Levels */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Log Levels</label>
              <div className="flex gap-2">
                {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={cn(
                      "px-3 py-1 rounded text-sm font-medium transition-colors",
                      selectedLevels.includes(level)
                        ? `${getLevelColor(level)} bg-opacity-10 border`
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Lines */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Include context</span>
              </label>
              
              {includeContext && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Lines:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={contextLines}
                    onChange={(e) => setContextLines(parseInt(e.target.value) || 3)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Metrics */}
        {searchMetrics && (
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Found <strong>{searchMetrics.totalMatches}</strong> matches
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {searchMetrics.searchTime}ms
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold">Search Results</h3>
          </div>
          <div className="max-h-96 overflow-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleResultExpansion(index)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-500 font-mono min-w-[4rem]">
                      Line {result.lineNumber}
                    </span>
                    <span className={cn('text-sm font-medium min-w-[4rem]', getLevelColor(result.level))}>
                      {result.level}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-mono break-all">
                        {highlightMatches(result.message, result.matches)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedResults.has(index) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Context */}
                {expandedResults.has(index) && result.context && (
                  <div className="px-4 pb-4 bg-gray-50">
                    {result.context.before.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Context before:</p>
                        {result.context.before.map((log, i) => (
                          <p key={i} className="text-sm font-mono text-gray-600 pl-4">
                            {log.message}
                          </p>
                        ))}
                      </div>
                    )}
                    {result.context.after.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Context after:</p>
                        {result.context.after.map((log, i) => (
                          <p key={i} className="text-sm font-mono text-gray-600 pl-4">
                            {log.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      )}

      {/* No Results */}
      {!isSearching && query && results.length === 0 && searchMetrics && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No matches found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default LogSearch;