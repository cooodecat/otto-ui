'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUnifiedLogs, LogEntry, UnifiedLogsResponse } from '@/lib/api/unified-logs-api';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bug,
  Loader2,
  Archive,
  Radio,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface UnifiedLogViewerProps {
  buildId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialLimit?: number;
  className?: string;
  onLogClick?: (log: LogEntry) => void;
}

const UnifiedLogViewer: React.FC<UnifiedLogViewerProps> = ({
  buildId,
  autoRefresh = false,
  refreshInterval = 5000,
  initialLimit = 100,
  className,
  onLogClick
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'realtime' | 'archive' | null>(null);
  const [metadata, setMetadata] = useState<UnifiedLogsResponse['metadata']>();
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: initialLimit,
    total: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({
    levels: ['ERROR', 'WARN', 'INFO', 'DEBUG'] as string[],
    search: '',
    regex: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch logs function
  const fetchLogs = useCallback(async (append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getUnifiedLogs(buildId, {
        limit: pagination.limit,
        offset: append ? pagination.offset + pagination.limit : 0,
        levels: filters.levels,
        search: filters.search || undefined,
        regex: filters.regex
      });

      setLogs(prev => append ? [...prev, ...response.logs] : response.logs);
      setSource(response.source);
      setMetadata(response.metadata);
      setPagination({
        offset: append ? pagination.offset + pagination.limit : 0,
        limit: pagination.limit,
        total: response.pagination.total,
        hasMore: response.pagination.hasMore
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching logs:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildId, pagination.offset, pagination.limit, filters]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [buildId, filters.levels, filters.search, filters.regex]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || source === 'archive') return;

    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, source, fetchLogs]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !pagination.hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchLogs(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [pagination.hasMore, isLoading, fetchLogs]);

  // Get level icon and color
  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'WARN':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Build Logs</h3>
          {source && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
              source === 'realtime' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            )}>
              {source === 'realtime' ? (
                <>
                  <Radio className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <Archive className="w-3 h-3" />
                  <span>Archived</span>
                </>
              )}
            </div>
          )}
        </div>

        {metadata && (
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Total:</span>
              <span className="font-mono">{metadata.totalLines.toLocaleString()}</span>
            </div>
            {metadata.errorCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">{metadata.errorCount}</span>
              </div>
            )}
            {metadata.warningCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600">{metadata.warningCount}</span>
              </div>
            )}
            <button
              onClick={() => fetchLogs()}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
        <span className="text-sm text-gray-600">Levels:</span>
        {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
          <button
            key={level}
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                levels: prev.levels.includes(level)
                  ? prev.levels.filter(l => l !== level)
                  : [...prev.levels, level]
              }));
            }}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              filters.levels.includes(level)
                ? getLevelColor(level)
                : 'bg-white text-gray-400 border border-gray-300'
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Logs Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-900 p-4 font-mono text-sm"
      >
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => fetchLogs()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : logs.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No logs found
          </div>
        ) : (
          <>
            {logs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className={cn(
                  'flex items-start gap-3 py-1 hover:bg-gray-800 cursor-pointer rounded px-2',
                  'transition-colors duration-150'
                )}
                onClick={() => onLogClick?.(log)}
              >
                {/* Line Number */}
                <span className="text-gray-600 min-w-[4rem] text-right select-none">
                  {log.lineNumber ?? index + 1}
                </span>

                {/* Timestamp */}
                <span className="text-gray-400 min-w-[10rem] select-none">
                  {formatTimestamp(log.timestamp)}
                </span>

                {/* Level Icon */}
                <span className="min-w-[1.5rem]">
                  {getLevelIcon(log.level)}
                </span>

                {/* Message */}
                <span className={cn(
                  'flex-1 break-all',
                  log.level === 'ERROR' && 'text-red-400',
                  log.level === 'WARN' && 'text-yellow-400',
                  log.level === 'INFO' && 'text-gray-200',
                  log.level === 'DEBUG' && 'text-gray-500',
                  !log.level && 'text-gray-300'
                )}>
                  {log.message}
                </span>

                {/* Source */}
                {log.source && (
                  <span className="text-gray-600 text-xs">
                    [{log.source}]
                  </span>
                )}
              </div>
            ))}

            {/* Load More Indicator */}
            {pagination.hasMore && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-4"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                ) : (
                  <button
                    onClick={() => fetchLogs(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Load more logs</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div>
          Showing {logs.length} of {pagination.total} logs
        </div>
        {metadata?.duration && (
          <div>
            Duration: {metadata.duration}
          </div>
        )}
        {metadata?.buildStatus && (
          <div className={cn(
            'px-2 py-1 rounded',
            metadata.buildStatus === 'SUCCESS' && 'bg-green-900/30 text-green-400',
            metadata.buildStatus === 'FAILED' && 'bg-red-900/30 text-red-400',
            metadata.buildStatus === 'RUNNING' && 'bg-blue-900/30 text-blue-400',
            metadata.buildStatus === 'PENDING' && 'bg-yellow-900/30 text-yellow-400'
          )}>
            {metadata.buildStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogViewer;