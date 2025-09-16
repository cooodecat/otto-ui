'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PipelineLogsPageProps, LogItem, FilterState } from '@/types/logs';
import { useDebounce } from '@/hooks/logs/useDebounce';
import { useLogData } from '@/hooks/logs/useLogData';
import { useSSELogStream } from '@/hooks/logs/useSSELogStream';
import { getMockData } from '@/lib/logs';
import { usePipelineLogs } from '@/hooks/logs/usePipelineLogs';
import PipelineLogsHeader from './components/PipelineLogsHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import PipelineLogsTable from './components/PipelineLogsTable';

/**
 * Pipeline Logs Page Component
 * 
 * 파이프라인 로그의 메인 페이지 컴포넌트
 * 헤더, 필터링, 테이블, 무한 스크롤 등 모든 기능 통합
 * 실제 Supabase 데이터와 목업 데이터를 모두 지원
 */
const PipelineLogsPage: React.FC<PipelineLogsPageProps & { 
  useRealApi?: boolean;
  buildId?: string;
  userId?: string;
}> = ({
  projectId: _projectId,
  useRealApi = false,
  buildId = 'test-build-123',
  userId
}) => {
  const { user } = useAuth();
  const scopedUserId = user?.id || 'anon';
  const scopedProjectId = _projectId || 'default';

  const makeStorageKey = (suffix: string) =>
    `pipelineLogs:${scopedUserId}:${scopedProjectId}:${buildId}:${suffix}`;

  // Pipeline Logs 데이터 관리
  const {
    logs,
    isLoading,
    error: pipelineError,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    search: searchLogs,
    filter: _filterLogs
  } = usePipelineLogs({
    userId,
    useRealData: useRealApi,
    initialLimit: 20,
    autoFetch: true
  });

  // Legacy API Integration (SSE 및 실시간 기능용)
  const {
    logData: _logData,
    loading: _apiLoading,
    error: apiError,
    refetch: _refetch,
    isCollecting,
    startCollection,
    stopCollection
  } = useLogData(buildId, {
    useRealApi: false, // Pipeline logs에서는 별도 관리
    getMockData: getMockData,
    simulateDelay: 1000
  });

  // 상태 관리
  const [displayedLogs, setDisplayedLogs] = useState<LogItem[]>(logs);
  const [isLive, setIsLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_filters] = useState<FilterState>({
    timeline: 'all-time',
    status: 'any-status',
    trigger: 'all-triggers',
    branch: 'all-branches',
    author: 'all-authors'
  });
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set()); // 새로운 로그 ID 관리
  const [unreadCount, setUnreadCount] = useState(0);
  const [initializedFromCursor, setInitializedFromCursor] = useState(false);

  // SSE Real-time Log Streaming
  const {
    connectionState,
    connect: connectSSE,
    disconnect: disconnectSSE,
    isConnected: sseConnected,
    hasError: sseHasError
  } = useSSELogStream(
    buildId,
    // 새로운 로그 수신 시 처리
    (newLogs: LogItem[]) => {
      // displayedLogs 기준으로 병합 (중복 제거)
      setDisplayedLogs(prev => {
        const existingIds = new Set(prev.map(log => log.id));
        const uniqueNewLogs = newLogs.filter(log => !existingIds.has(log.id));

        if (uniqueNewLogs.length > 0) {
          // 새 로그 ID 추가 및 뱃지 증가
          setNewLogIds(prevIds => {
            const newSet = new Set(prevIds);
            uniqueNewLogs.forEach(log => newSet.add(log.id));
            return newSet;
          });
          setUnreadCount(prev => prev + uniqueNewLogs.length);

          return [...uniqueNewLogs, ...prev];
        }
        return prev;
      });
    },
    {
      autoConnect: false, // 수동 연결
      reconnectInterval: 3000,
      maxReconnectAttempts: 5
    }
  );

  // 디바운싱된 검색어
  const debouncedSearchQuery = useDebounce(searchQuery, 300);


  // logs 변경 시 displayedLogs 업데이트
  useEffect(() => {
    setDisplayedLogs(logs);
  }, [logs]);

  // 초기 한번: lastSeenId 기반으로 unread/newLogIds 복원
  useEffect(() => {
    if (initializedFromCursor) return;
    if (!logs || logs.length === 0) return;
    try {
      const lastSeenId = typeof window !== 'undefined' 
        ? localStorage.getItem(makeStorageKey('lastSeenId'))
        : null;
      if (lastSeenId) {
        let count = 0;
        const newIds = new Set<string>();
        for (const log of logs) {
          if (log.id === lastSeenId) break;
          newIds.add(log.id);
          count += 1;
        }
        if (count > 0) {
          setUnreadCount(count);
          setNewLogIds(newIds);
        }
      }
    } catch {}
    setInitializedFromCursor(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // 검색어 변경 시 실제 검색 실행 (디바운싱 적용)
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    if (debouncedSearchQuery.trim()) {
      searchLogs(debouncedSearchQuery);
    } else if (searchQuery === '') {
      // 검색어가 비워지면 전체 목록으로 돌아감
      refresh();
    }
  }, [debouncedSearchQuery, searchQuery, searchLogs, refresh]);

  // 무한 스크롤을 위한 더 많은 로그 로드
  const loadMoreLogs = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    await refresh();
    // 새로고침 후 현재 최상단을 lastSeen으로 저장 (사용자 의도에 맞게 조정 가능)
    try {
      if (typeof window !== 'undefined' && displayedLogs[0]) {
        localStorage.setItem(makeStorageKey('lastSeenId'), displayedLogs[0].id);
      }
    } catch {}
  }, [refresh]);

  // Live 모드 토글
  const handleLiveToggle = useCallback(async (enabled: boolean) => {
    setIsLive(enabled);
    // 세션 저장 (빌드ID 단위)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(makeStorageKey('live'), String(enabled));
      }
    } catch {}
    
    if (enabled && useRealApi) {
      try {
        // 백필: 최근 로그 재동기화
        await refresh();
        // 로그 수집 시작(옵션)
        await startCollection();
        // SSE 연결 시작
        connectSSE();
        console.log('🔴 Live mode enabled - collection and streaming started');
      } catch (error) {
        console.error('Failed to start live mode:', error);
        setIsLive(false);
      }
    } else if (!enabled && useRealApi) {
      try {
        // SSE 연결 중지
        disconnectSSE();
        // 로그 수집 중지
        await stopCollection();
        console.log('⏹️ Live mode disabled - collection and streaming stopped');
        // Live 끌 때 현재 최상단을 lastSeen으로 저장
        try {
          if (typeof window !== 'undefined' && displayedLogs[0]) {
            localStorage.setItem(makeStorageKey('lastSeenId'), displayedLogs[0].id);
          }
        } catch {}
      } catch (error) {
        console.error('Failed to stop live mode:', error);
      }
    } else if (!useRealApi) {
      // 목업 모드에서의 시뮬레이션
      console.log(enabled ? '🔴 Live mode enabled (mock)' : '⏹️ Live mode disabled (mock)');
    }
  }, [useRealApi, startCollection, stopCollection, connectSSE, disconnectSSE, refresh, displayedLogs, makeStorageKey]);

  // 초기 마운트 시 저장된 Live 상태로 자동 연결 / 복원
  useEffect(() => {
    if (!useRealApi) return;
    try {
      const saved = typeof window !== 'undefined' 
        ? localStorage.getItem(makeStorageKey('live')) 
        : null;
      if (saved === 'true') {
        // 자동 Live 활성화
        handleLiveToggle(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealApi, scopedUserId, scopedProjectId, buildId]);

  // 탭 가시성에 따른 연결 관리
  useEffect(() => {
    if (!useRealApi) return;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const onVisibility = async () => {
      if (document.hidden) {
        hideTimer = setTimeout(() => {
          if (isLive) {
            disconnectSSE();
          }
        }, 30000); // 30초 후 자원 절약 차단
      } else {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        if (isLive) {
          // 복귀 시 최신 데이터 백필 후 재연결
          await refresh();
          connectSSE();
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    // 탭/창 종료 직전 현재 위치 저장
    const beforeUnload = () => {
      try {
        if (typeof window !== 'undefined' && displayedLogs[0]) {
          localStorage.setItem(makeStorageKey('lastSeenId'), displayedLogs[0].id);
        }
      } catch {}
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', beforeUnload);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [useRealApi, isLive, connectSSE, disconnectSSE, refresh, displayedLogs, makeStorageKey]);

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
      {/* API 에러 표시 */}
      {(pipelineError || apiError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-red-600 text-sm">
              <strong>API Error:</strong> {pipelineError || apiError}
            </div>
          </div>
        </div>
      )}

      {/* SSE 연결 상태 표시 (실제 API 사용 시에만) */}
      {useRealApi && (sseHasError || connectionState.error) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-800 text-sm">
              <strong>Connection Status:</strong> {connectionState.error || 'SSE connection issue'}
              {connectionState.reconnectCount > 0 && (
                <span className="ml-2">
                  (Reconnect attempts: {connectionState.reconnectCount})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* API 로딩 상태 */}
      {isLoading && !logs.length && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">
              {useRealApi ? 'Loading logs from Supabase...' : 'Loading mock data...'}
            </span>
          </div>
        </div>
      )}

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

      {/* 개발 모드 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && useRealApi && (
        <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-3 rounded-lg font-mono max-w-xs">
          <div className="text-green-400 mb-1">🚀 Real API Mode</div>
          <div>Build ID: {buildId}</div>
          <div>Collecting: {isCollecting ? '✅' : '❌'}</div>
          <div>SSE: {sseConnected ? '🟢' : '🔴'}</div>
          <div>Logs: {logs.length}</div>
          <div>Total: {totalCount}</div>
          {connectionState.lastMessageTime && (
            <div>Last SSE: {new Date(connectionState.lastMessageTime).toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineLogsPage;
