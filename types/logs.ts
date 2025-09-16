// ============================================================================
// Logs Types - Filter Panel & Pipeline Logs
// ============================================================================

// Filter Panel Types
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface FilterState {
  timeline: string;
  status: string;
  trigger: string;
  branch: string;
  author: string;
}

export interface DropdownPosition {
  timeline: 'top' | 'bottom';
  status: 'top' | 'bottom';
  trigger: 'top' | 'bottom';
  branch: 'top' | 'bottom';
  author: 'top' | 'bottom';
}

export interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  className?: string;
}

// Pipeline Logs Types
// ============================================================================

// Detailed build log data (for LogDetailsPanel)
export interface LogData {
  // 기본 정보
  buildId: string;
  buildNumber: number;
  projectName: string;
  
  // 상태 정보
  buildStatus: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED';
  deployStatus?: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED';
  overallStatus: 'SUCCESS' | 'FAILED' | 'RUNNING';
  
  // 시간 정보
  startTime: string; // ISO 8601 format
  endTime?: string;
  duration: string; // "3m 45s" format
  
  // 소스 정보
  trigger: 'Manual' | 'GitHub Push' | 'Scheduled' | 'Webhook';
  branch: string;
  commitHash: string; // 짧은 형태 (7자리)
  commitMessage: string;
  commitAuthor: string;
  
  // 파이프라인 단계
  pipeline: PipelineStage[];
  
  // 배포 정보 (옵션)
  deployment?: {
    environment: 'staging' | 'production';
    deployedVersion: string;
    rollbackAvailable: boolean;
    healthCheckStatus: 'HEALTHY' | 'UNHEALTHY';
  };
  
  // 에러 정보 (실패 시)
  errorSummary?: {
    phase: string;
    errorMessage: string;
    exitCode: number;
    failedTests?: string[];
  };
  
  // 로그 정보
  logs: {
    totalLines: number;
    recentLines: LogLine[]; // 마지막 10-15줄
    hasErrors: boolean;
    cloudWatchUrl: string;
  };
}

// Summary/list data for pipeline logs table and list fetching
export interface LogListData {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  logs: LogItem[];
  total: number;
  hasNext: boolean;
}

export interface PipelineStage {
  stage: string; // "Source Download", "Build & Test", "Deploy"
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'PENDING';
  duration: string;
  startTime: string;
  endTime?: string;
}

export interface LogLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string; // 로그 소스 (예: "npm", "docker", "aws-cli")
}

export interface LogItem {
  id: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  pipelineName: string;
  trigger: {
    type: string;
    author: string;
    time: string;
  };
  branch: string;
  commit: {
    message: string;
    sha: string;
    author: string;
  };
  duration: string;
  isNew?: boolean;
}

// Component Props Types
// ============================================================================

export interface LogDetailsPanelProps {
  buildId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void; // 키보드 네비게이션용
}

export interface PipelineLogsPageProps {
  projectId?: string;
}

export interface PipelineLogsHeaderProps {
  isLive: boolean;
  onLiveToggle: (checked: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface PipelineLogsTableProps {
  logs: LogItem[];
  newLogIds: Set<string>;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  searchQuery: string;
  onMarkAsRead: (logId: string) => void;
}

// Additional Types
// ============================================================================

export type ViewMode = 'summary' | 'expanded';

export interface LogSearchResult {
  lineNumber: number;
  timestamp: string;
  message: string;
  level: LogLine['level'];
}

export interface LogFilter {
  levels: LogLine['level'][];
  searchQuery: string;
  showTimestamps: boolean;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

// Build Log Streaming Types (SSE + REST cache)
// ============================================================================
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'UNKNOWN';
export type BuildExecStatus = 'SUCCEEDED' | 'FAILED' | 'STOPPED' | 'TIMED_OUT' | 'IN_PROGRESS' | 'UNKNOWN';

export interface RawLogEvent {
  timestamp: number;
  message: string;
  ingestionTime: number;
}

export interface NormalizedLog {
  ts: number;
  message: string;
  source?: string;
  level: LogLevel;
  phase?: string; // INSTALL | PRE_BUILD | BUILD | POST_BUILD | FINAL
  code?: string; // error/warn code if available
  buildStatus?: BuildExecStatus;
}

export interface SSEPayload {
  buildId: string;
  events: RawLogEvent[];
  normalized?: NormalizedLog[];
  timestamp: number; // server sent time
}

// Store Types (for state management)
// ============================================================================

export interface LogsState {
  // 데이터
  logs: LogItem[];
  displayedLogs: LogItem[];
  selectedLogId: string | null;
  
  // 필터 상태
  filters: FilterState;
  searchQuery: string;
  
  // UI 상태
  isLive: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  page: number;
  newLogIds: Set<string>;
  
  // 액션들
  setFilters: (filters: Partial<FilterState>) => void;
  setSearchQuery: (query: string) => void;
  setIsLive: (isLive: boolean) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (logId: string) => void;
}
