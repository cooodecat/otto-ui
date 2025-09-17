/**
 * Unified Logs System API Client
 * Backend API integration for log viewing, searching, and analytics
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ============================================================================
// Type Definitions
// ============================================================================

export interface LogEntry {
  timestamp: number;
  level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  source?: string;
  ingestionTime?: number;
  lineNumber?: number;
}

export interface UnifiedLogsResponse {
  source: 'realtime' | 'archive';
  logs: LogEntry[];
  metadata?: {
    totalLines: number;
    errorCount: number;
    warningCount: number;
    buildStatus: string;
    startTime: number;
    endTime?: number;
    duration?: string;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface BuildMetadata {
  buildId: string;
  buildNumber: number;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'STOPPED';
  trigger: {
    type: 'Manual' | 'GitHub Push' | 'Scheduled' | 'Webhook';
    author: string;
    timestamp: number;
  };
  repository: {
    branch: string;
    commitHash: string;
    commitMessage: string;
  };
  phases: Array<{
    name: string;
    status: string;
    startTime: number;
    endTime?: number;
    duration?: string;
  }>;
  metrics: {
    totalLines: number;
    errorCount: number;
    warningCount: number;
    fileSize: number;
  };
  isArchived: boolean;
  archivedAt?: number;
}

export interface SearchLogsRequest {
  query: string;
  regex?: boolean;
  levels?: string[];
  timeRange?: {
    start?: number;
    end?: number;
  };
  includeContext?: boolean;
  contextLines?: number;
}

export interface SearchLogsResponse {
  results: Array<{
    lineNumber: number;
    timestamp: number;
    level: string;
    message: string;
    matches: Array<{
      start: number;
      end: number;
    }>;
    context?: {
      before: LogEntry[];
      after: LogEntry[];
    };
  }>;
  totalMatches: number;
  searchTime: number;
}

export interface BuildAnalyticsResponse {
  summary: {
    totalBuilds: number;
    successCount: number;
    failedCount: number;
    successRate: number;
    averageDuration: string;
    totalLogLines: number;
    totalErrors: number;
    totalWarnings: number;
  };
  trends: Array<{
    timestamp: number;
    successCount: number;
    failedCount: number;
    averageDuration: number;
  }>;
  errorPatterns: Array<{
    pattern: string;
    count: number;
    lastOccurrence: number;
    affectedBuilds: string[];
  }>;
  phaseMetrics: Array<{
    phase: string;
    averageDuration: string;
    successRate: number;
    commonErrors: string[];
  }>;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Fetch unified logs (automatically switches between realtime and archive)
 */
export async function getUnifiedLogs(
  buildId: string,
  params?: {
    limit?: number;
    offset?: number;
    levels?: string[];
    search?: string;
    regex?: boolean;
    timeRange?: string;
  }
): Promise<UnifiedLogsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  if (params?.levels) params.levels.forEach(level => queryParams.append('levels', level));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.regex) queryParams.append('regex', params.regex.toString());
  if (params?.timeRange) queryParams.append('timeRange', params.timeRange);

  const response = await fetch(
    `${API_BASE_URL}/logs/builds/${buildId}/unified?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch build metadata
 */
export async function getBuildMetadata(buildId: string): Promise<BuildMetadata> {
  const response = await fetch(
    `${API_BASE_URL}/logs/builds/${buildId}/metadata`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch build metadata: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search logs with advanced filtering
 */
export async function searchLogs(
  buildId: string,
  request: SearchLogsRequest
): Promise<SearchLogsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/logs/builds/${buildId}/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search logs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get build analytics and statistics
 */
export async function getBuildAnalytics(params?: {
  projectId?: string;
  userId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}): Promise<BuildAnalyticsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
  if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

  const response = await fetch(
    `${API_BASE_URL}/logs/analytics/builds?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create SSE connection for real-time log streaming
 */
// SSE Event data types
export interface SSELogData {
  timestamp: number;
  level?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  lineNumber?: number;
  source?: string;
  ingestionTime?: number;
}

export interface SSEStatusData {
  status: string;
  timestamp: number;
}

export interface SSEPhaseData {
  phase: string;
  progress?: number;
  timestamp: number;
}

export interface SSECompleteData {
  totalLogs: number;
  duration: string;
  timestamp: number;
}

export type SSEEvent = 
  | { type: 'log'; data: SSELogData }
  | { type: 'status'; data: SSEStatusData }
  | { type: 'phase'; data: SSEPhaseData }
  | { type: 'complete'; data: SSECompleteData };

export function createLogStream(
  buildId: string,
  onMessage: (event: SSEEvent) => void,
  onError?: (error: Error) => void
): EventSource {
  const eventSource = new EventSource(
    `${API_BASE_URL}/logs/builds/${buildId}/stream`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse SSE message:', error);
      }
      onError?.(error as Error);
    }
  };

  eventSource.addEventListener('log', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: 'log', data });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse log event:', error);
      }
      onError?.(error as Error);
    }
  });

  eventSource.addEventListener('status', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: 'status', data });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse status event:', error);
      }
      onError?.(error as Error);
    }
  });

  eventSource.addEventListener('phase', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: 'phase', data });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse phase event:', error);
      }
      onError?.(error as Error);
    }
  });

  eventSource.addEventListener('complete', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: 'complete', data });
      eventSource.close();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse complete event:', error);
      }
      onError?.(error as Error);
    }
  });

  eventSource.onerror = (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('SSE connection error:', error);
    }
    onError?.(new Error('SSE connection failed'));
  };

  return eventSource;
}

// ============================================================================
// React Hooks (without dependencies for now)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing SSE log streaming
 */
export function useLogStream(
  buildId: string,
  enabled: boolean = false
) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<string>('');
  const [phase, setPhase] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !buildId) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      eventSource = createLogStream(
        buildId,
        (event) => {
          switch (event.type) {
            case 'log':
              const logData = event.data as SSELogData;
              const logEntry: LogEntry = {
                timestamp: logData.timestamp,
                level: logData.level,
                message: logData.message,
                source: logData.source,
                ingestionTime: logData.ingestionTime,
                lineNumber: logData.lineNumber
              };
              setLogs((prev) => [...prev, logEntry]);
              break;
            case 'status':
              setStatus((event.data as SSEStatusData).status);
              break;
            case 'phase':
              setPhase((event.data as SSEPhaseData).phase);
              break;
            case 'complete':
              setIsConnected(false);
              break;
          }
        },
        (error) => {
          setError(error);
          setIsConnected(false);
          
          // Auto-reconnect after 5 seconds
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 5000);
        }
      );

      setIsConnected(true);
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [buildId, enabled]);

  const clear = useCallback(() => {
    setLogs([]);
    setStatus('');
    setPhase('');
    setError(null);
  }, []);

  return {
    logs,
    status,
    phase,
    isConnected,
    error,
    clear,
  };
}