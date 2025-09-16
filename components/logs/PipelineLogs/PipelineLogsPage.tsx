'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PipelineLogsPageProps, LogItem, FilterState } from '@/types/logs';
import { useDebounce } from '@/hooks/logs/useDebounce';
import PipelineLogsHeader from './components/PipelineLogsHeader';
import PipelineLogsTable from './components/PipelineLogsTable';

// 기본 샘플 데이터 (Phase 5에서 실제 API로 교체 예정)
const defaultSampleLogs: LogItem[] = [
  {
    id: '5',
    status: 'success',
    pipelineName: 'E2E Tests',
    trigger: { type: 'Push to develop', author: 'dev-team', time: '1s ago' },
    branch: 'develop',
    commit: { message: 'test: Update checkout flow tests', sha: 'e5f6789', author: 'Dev Team' },
    duration: '15m 0s',
    isNew: true,
  },
  {
    id: '4',
    status: 'pending',
    pipelineName: 'Mobile App Build',
    trigger: { type: 'Scheduled build', author: 'system', time: '50m ago' },
    branch: 'release/v2.1',
    commit: { message: 'release: Prepare v2.1.0 release', sha: 'd4e5f67', author: 'Release Bot' },
    duration: '-',
    isNew: false,
  },
  {
    id: '3',
    status: 'failed',
    pipelineName: 'Database Migration',
    trigger: { type: 'Manual trigger', author: 'admin', time: '5h ago' },
    branch: 'migration-v2',
    commit: {
      message: 'migration: Add user preferences table',
      sha: 'c3d4e5f',
      author: 'Admin User',
    },
    duration: '3m 0s',
    isNew: false,
  },
  {
    id: '2',
    status: 'success',
    pipelineName: 'Backend API',
    trigger: { type: 'PR #123 merged', author: 'jane-smith', time: '3h ago' },
    branch: 'develop',
    commit: {
      message: 'fix: Resolve authentication middleware issue',
      sha: 'b2c3d44',
      author: 'Jane Smith',
    },
    duration: '7m 0s',
    isNew: false,
  },
  {
    id: '1',
    status: 'running',
    pipelineName: 'Frontend Build',
    trigger: { type: 'Push to main', author: 'john-doe', time: '2h ago' },
    branch: 'main',
    commit: {
      message: 'feat: Add new component library integration',
      sha: 'a1b2c34',
      author: 'John Doe',
    },
    duration: '8m 32s',
    isNew: false,
  },
];

/**
 * Pipeline Logs Page Component
 * 
 * 파이프라인 로그의 메인 페이지 컴포넌트
 * 헤더, 필터링, 테이블, 무한 스크롤 등 모든 기능 통합
 */
const PipelineLogsPage: React.FC<PipelineLogsPageProps> = ({
  projectId: _projectId
}) => {
  // 상태 관리
  const [logs, setLogs] = useState<LogItem[]>(defaultSampleLogs);
  const [displayedLogs, setDisplayedLogs] = useState<LogItem[]>(defaultSampleLogs);
  const [isLive, setIsLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters] = useState<FilterState>({
    timeline: 'all-time',
    status: 'any-status',
    trigger: 'all-triggers',
    branch: 'all-branches',
    author: 'all-authors'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set(['5'])); // 최신 로그를 새로운 것으로 표시
  const [unreadCount, setUnreadCount] = useState(1);

  // 디바운싱된 검색어
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 로그 필터링 함수
  const filterLogs = useCallback((logList: LogItem[], query: string, filterState: FilterState) => {
    let filtered = logList;

    // 검색어 필터링
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(log =>
        log.pipelineName.toLowerCase().includes(lowerQuery) ||
        log.branch.toLowerCase().includes(lowerQuery) ||
        log.commit.message.toLowerCase().includes(lowerQuery) ||
        log.commit.author.toLowerCase().includes(lowerQuery) ||
        log.trigger.author.toLowerCase().includes(lowerQuery)
      );
    }

    // 상태 필터링
    if (filterState.status !== 'any-status') {
      filtered = filtered.filter(log => log.status === filterState.status);
    }

    // 브랜치 필터링
    if (filterState.branch !== 'all-branches') {
      filtered = filtered.filter(log => log.branch === filterState.branch);
    }

    // 트리거 필터링
    if (filterState.trigger !== 'all-triggers') {
      const triggerMap: Record<string, string[]> = {
        'push': ['Push to main', 'Push to develop'],
        'pr-merged': ['PR #123 merged'],
        'manual': ['Manual trigger'],
        'scheduled': ['Scheduled build']
      };
      
      const allowedTriggers = triggerMap[filterState.trigger] || [];
      if (allowedTriggers.length > 0) {
        filtered = filtered.filter(log => allowedTriggers.includes(log.trigger.type));
      }
    }

    // 작성자 필터링
    if (filterState.author !== 'all-authors') {
      filtered = filtered.filter(log => 
        log.trigger.author === filterState.author || 
        log.commit.author.toLowerCase().replace(' ', '-') === filterState.author
      );
    }

    return filtered;
  }, []);

  // 필터 및 검색어 변경 시 로그 필터링
  useEffect(() => {
    const filtered = filterLogs(logs, debouncedSearchQuery, filters);
    setDisplayedLogs(filtered);
  }, [logs, debouncedSearchQuery, filters, filterLogs]);

  // 새로운 로그 로드 (무한 스크롤)
  const loadMoreLogs = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // 실제 구현에서는 API 호출
    // const newLogs = await api.getLogs({ page: page + 1, projectId });
    
    // 시뮬레이션: 추가 로그 생성
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const additionalLogs: LogItem[] = Array.from({ length: 5 }, (_, index) => ({
      id: `page-${page}-${index}`,
      status: ['success', 'failed', 'running', 'pending'][Math.floor(Math.random() * 4)] as LogItem['status'],
      pipelineName: `Pipeline ${page}-${index}`,
      trigger: { 
        type: 'Push to main', 
        author: `user-${index}`, 
        time: `${Math.floor(Math.random() * 24)}h ago` 
      },
      branch: ['main', 'develop', 'feature/test'][Math.floor(Math.random() * 3)],
      commit: {
        message: `Commit message for build ${page}-${index}`,
        sha: Math.random().toString(36).substring(2, 9),
        author: `User ${index}`
      },
      duration: `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 60)}s`,
      isNew: false
    }));

    setLogs(prev => [...prev, ...additionalLogs]);
    setPage(prev => prev + 1);
    
    // 5페이지 후 더 이상 로드하지 않음
    if (page >= 5) {
      setHasMore(false);
    }
    
    setIsLoading(false);
  }, [isLoading, hasMore, page]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    
    // 실제 구현에서는 API 호출
    // const freshLogs = await api.getLogs({ projectId, fresh: true });
    
    // 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 새로운 로그 추가 시뮬레이션
    const newLog: LogItem = {
      id: `refresh-${Date.now()}`,
      status: 'success',
      pipelineName: 'Fresh Build',
      trigger: { type: 'Manual trigger', author: 'current-user', time: 'just now' },
      branch: 'main',
      commit: {
        message: 'feat: Fresh deployment',
        sha: Math.random().toString(36).substring(2, 9),
        author: 'Current User'
      },
      duration: '4m 15s',
      isNew: true
    };

    setLogs(prev => [newLog, ...prev]);
    setNewLogIds(prev => new Set([...prev, newLog.id]));
    setUnreadCount(prev => prev + 1);
    setIsLoading(false);
  }, []);

  // Live 모드 토글
  const handleLiveToggle = useCallback((enabled: boolean) => {
    setIsLive(enabled);
    
    if (enabled) {
      // 실제 구현에서는 WebSocket 또는 SSE 연결
      // TODO: Connect to SSE/WebSocket
    } else {
      // TODO: Disconnect from SSE/WebSocket
    }
  }, []);

  // 로그 읽음 처리
  const handleMarkAsRead = useCallback((logId: string) => {
    setNewLogIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
    
    if (newLogIds.has(logId)) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [newLogIds]);

  // 필터 변경 처리 (향후 FilterPanel과 연동 시 사용)
  // const handleFiltersChange = useCallback((newFilters: FilterState) => {
  //   setFilters(newFilters);
  // }, []);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <PipelineLogsHeader
        isLive={isLive}
        onLiveToggle={handleLiveToggle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCount={unreadCount}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
      />

      {/* 로그 테이블 */}
      <PipelineLogsTable
        logs={displayedLogs}
        newLogIds={newLogIds}
        onLoadMore={loadMoreLogs}
        hasMore={hasMore}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default PipelineLogsPage;