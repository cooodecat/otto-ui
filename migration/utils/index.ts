// ============================================================================
// Migration Utils - Utility Functions
// ============================================================================

// Time & Date Utils
// ============================================================================

export const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const isRecent = (timestamp: string, thresholdMinutes: number = 5): boolean => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  return diffMs < thresholdMinutes * 60 * 1000;
};

// Status Utils
// ============================================================================

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
    case 'in_progress':
      return 'text-blue-600';
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return 'bg-green-50 border-green-200';
    case 'failed':
      return 'bg-red-50 border-red-200';
    case 'running':
    case 'in_progress':
      return 'bg-blue-50 border-blue-200';
    case 'pending':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

// Log Formatting Utils
// ============================================================================

export const formatLogLevel = (level: string): string => {
  return level.toUpperCase().padEnd(5, ' ');
};

export const getLogLevelColor = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'text-red-600';
    case 'WARN':
      return 'text-yellow-600';
    case 'INFO':
      return 'text-blue-600';
    case 'DEBUG':
      return 'text-gray-500';
    default:
      return 'text-gray-700';
  }
};

export const getLogLevelBgColor = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return 'bg-red-50';
    case 'WARN':
      return 'bg-yellow-50';
    case 'INFO':
      return 'bg-blue-50';
    case 'DEBUG':
      return 'bg-gray-50';
    default:
      return 'bg-white';
  }
};

// Text Utils
// ============================================================================

export const highlightSearchText = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
};

export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const truncateMessage = (message: string, maxLength: number = 100): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

export const formatCommitHash = (hash: string): string => {
  return hash.substring(0, 7);
};

// Parsing Utils
// ============================================================================

export const parseLogLine = (line: string) => {
  // 기본 로그 파싱 (timestamp, level, message 추출)
  const timestampMatch = line.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  const levelMatch = line.match(/\[(ERROR|WARN|INFO|DEBUG)\]/i);
  
  return {
    timestamp: timestampMatch ? timestampMatch[0] : '',
    level: levelMatch ? levelMatch[1].toUpperCase() : 'INFO',
    message: line.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?\[(ERROR|WARN|INFO|DEBUG)\]\s*/i, '').trim(),
    original: line,
  };
};

// Error Analysis Utils
// ============================================================================

export const getErrorContext = (logs: string[], errorLineIndex: number, contextLines: number = 3) => {
  const start = Math.max(0, errorLineIndex - contextLines);
  const end = Math.min(logs.length, errorLineIndex + contextLines + 1);
  
  return logs.slice(start, end).map((line, index) => ({
    lineNumber: start + index + 1,
    content: line,
    isError: start + index === errorLineIndex,
  }));
};

export const findErrorLines = (logs: string[]): number[] => {
  return logs
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /\[(ERROR|FATAL)\]|error:|exception:|failed:/i.test(line))
    .map(({ index }) => index);
};

export const getLogPreview = (logs: string[], maxLines: number = 10): string[] => {
  if (logs.length <= maxLines) return logs;
  
  // 에러가 있으면 에러 주변을 우선적으로 보여줌
  const errorLines = findErrorLines(logs);
  if (errorLines.length > 0) {
    const lastError = errorLines[errorLines.length - 1];
    const start = Math.max(0, lastError - Math.floor(maxLines / 2));
    const end = Math.min(logs.length, start + maxLines);
    return logs.slice(start, end);
  }
  
  // 에러가 없으면 마지막 라인들을 보여줌
  return logs.slice(-maxLines);
};

// Export Utils
// ============================================================================

export const exportLogs = (logs: any[], filename: string = 'pipeline-logs') => {
  const data = logs.map(log => ({
    timestamp: log.trigger?.time || '',
    pipeline: log.pipelineName,
    status: log.status,
    branch: log.branch,
    commit: log.commit?.sha || '',
    duration: log.duration,
    author: log.commit?.author || log.trigger?.author || '',
  }));
  
  const csv = [
    // CSV 헤더
    'Timestamp,Pipeline,Status,Branch,Commit,Duration,Author',
    // CSV 데이터
    ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// URL Utils
// ============================================================================

export const updateURLFilters = (filters: Record<string, string>, pathname: string) => {
  const params = new URLSearchParams();
  
  const defaultValues: Record<string, string> = {
    timeline: 'all-time',
    status: 'any-status',
    trigger: 'all-triggers',
    branch: 'all-branches',
    author: 'all-authors'
  };
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== defaultValues[key]) {
      params.set(key, value);
    }
  });
  
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
};

export const parseURLFilters = (searchParams: URLSearchParams) => {
  return {
    timeline: searchParams.get('timeline') || 'all-time',
    status: searchParams.get('status') || 'any-status',
    trigger: searchParams.get('trigger') || 'all-triggers',
    branch: searchParams.get('branch') || 'all-branches',
    author: searchParams.get('author') || 'all-authors',
  };
};