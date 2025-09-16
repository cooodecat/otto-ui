'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PipelineLogsPageProps, LogItem, FilterState } from '../../types';
import PipelineLogsHeader from './components/PipelineLogsHeader';
import PipelineLogsTable from './components/PipelineLogsTable';

// 기본 샘플 데이터 (새 프로젝트에서 API 호출로 교체)
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
    pipelineName: 'Frontend Deploy',
    trigger: { type: 'Push to main', author: 'john-doe', time: '2h ago' },
    branch: 'main',
    commit: {
      message: 'feat: Add new user dashboard component',
      sha: 'a1b2c34',
      author: 'John Doe',
    },
    duration: '19m 33s',
    isNew: false,
  },
];

interface PipelineLogsPageOptions {
  // 데이터 소스 함수들 (새 프로젝트에서 구현)
  fetchLogs?: (params: {
    page: number;
    limit: number;
    filters: FilterState;
    searchQuery?: string;
  }) => Promise<{ data: LogItem[]; hasMore: boolean }>;
  
  // 모킹 데이터 (개발용)
  mockData?: LogItem[];
  
  // 설정
  logsPerPage?: number;
  maxLogs?: number;
  pollInterval?: number; // Live 모드 폴링 간격 (ms)
}

interface PipelineLogsPageInternalProps extends PipelineLogsPageProps {
  options?: PipelineLogsPageOptions;
  // 외부에서 주입되는 필터 (FilterPanel에서)
  externalFilters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
}

/**
 * Pipeline Logs Page Component
 * 
 * 파이프라인 로그를 표시하는 메인 페이지 컴포넌트
 * 헤더, 필터, 테이블, 무한 스크롤 등의 기능 포함
 */
const PipelineLogsPage: React.FC<PipelineLogsPageInternalProps> = ({
  projectId,
  options = {},
  externalFilters,
  onFiltersChange
}) => {
  const {
    fetchLogs,
    mockData = defaultSampleLogs,
    logsPerPage = 10,
    maxLogs = 50,
    pollInterval = 5000
  } = options;

  // 상태 관리
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLogIds, setNewLogIds] = useState(new Set(['5']));
  const [displayedLogs, setDisplayedLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 현재 필터 상태 (외부 필터 또는 기본값)
  const currentFilters = externalFilters || {
    timeline: 'all-time',
    status: 'any-status',
    trigger: 'all-triggers',
    branch: 'all-branches',
    author: 'all-authors'
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initialLogs = mockData.slice(0, logsPerPage);
    setDisplayedLogs(initialLogs);
    setPage(1);
    setNewLogIds(new Set(['5']));
  }, [mockData, logsPerPage]);

  // 필터 조건에 따른 로그 필터링
  const filterLogsByFilters = useCallback((logs: LogItem[], filters: FilterState) => {
    return logs.filter((log) => {
      // Status 필터링
      if (filters.status !== 'any-status' && log.status !== filters.status) {
        return false;
      }

      // Trigger 필터링
      if (filters.trigger !== 'all-triggers') {
        const triggerMap: { [key: string]: string } = {
          'push': 'Push to',
          'pr-merged': 'PR #',
          'manual': 'Manual trigger',
          'scheduled': 'Scheduled'
        };
        const triggerType = triggerMap[filters.trigger];
        if (triggerType && !log.trigger.type.includes(triggerType)) {
          return false;
        }
      }

      // Branch 필터링
      if (filters.branch !== 'all-branches' && log.branch !== filters.branch) {
        return false;
      }

      // Author 필터링
      if (filters.author !== 'all-authors') {
        const authorMatch = log.trigger.author === filters.author || 
                          log.commit.author.toLowerCase().includes(filters.author.replace('-', ' '));
        if (!authorMatch) {
          return false;
        }
      }

      // Timeline 필터링 (샘플 구현)
      // 실제 구현 시 log.trigger.time을 파싱해서 날짜 비교 필요
      
      return true;
    });
  }, []);

  // 검색 필터링
  const filterLogsBySearch = useCallback((logs: LogItem[], query: string) => {
    if (!query.trim()) return logs;

    const searchTerm = query.toLowerCase().trim();
    return logs.filter(
      (log) =>
        log.pipelineName.toLowerCase().includes(searchTerm) ||
        log.trigger.type.toLowerCase().includes(searchTerm) ||
        log.trigger.author.toLowerCase().includes(searchTerm) ||
        log.branch.toLowerCase().includes(searchTerm) ||
        log.commit.message.toLowerCase().includes(searchTerm) ||
        log.commit.author.toLowerCase().includes(searchTerm) ||
        log.commit.sha.toLowerCase().includes(searchTerm) ||
        log.status.toLowerCase().includes(searchTerm)
    );
  }, []);

  // 최종 필터링된 로그
  const filteredByFilters = filterLogsByFilters(displayedLogs, currentFilters);
  const finalFilteredLogs = filterLogsBySearch(filteredByFilters, searchQuery);

  // 더 많은 데이터 로드
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      if (fetchLogs) {
        // 실제 API 호출
        const result = await fetchLogs({
          page,
          limit: logsPerPage,
          filters: currentFilters,
          searchQuery
        });
        
        if (result.data.length > 0) {
          setDisplayedLogs(prev => [...prev, ...result.data]);
          setPage(prev => prev + 1);
          setHasMore(result.hasMore);
        } else {
          setHasMore(false);
        }
      } else {
        // 모킹 데이터 사용
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const startIndex = page * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        const newLogs = mockData.slice(startIndex, endIndex);

        if (newLogs.length > 0) {
          setDisplayedLogs(prev => [...prev, ...newLogs]);
          setPage(prev => prev + 1);

          if (displayedLogs.length + newLogs.length >= maxLogs || endIndex >= mockData.length) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, displayedLogs.length, fetchLogs, logsPerPage, currentFilters, searchQuery, mockData, maxLogs]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (fetchLogs) {
        // 실제 API 호출
        const result = await fetchLogs({
          page: 0,
          limit: logsPerPage,
          filters: currentFilters,
          searchQuery
        });
        
        setDisplayedLogs(result.data);
        setPage(1);
        setHasMore(result.hasMore);
      } else {
        // 모킹 데이터 새로고침
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const initialLogs = mockData.slice(0, logsPerPage);
        setDisplayedLogs(initialLogs);
        setPage(1);
        setHasMore(true);
      }
      
      setNewLogIds(new Set(['5'])); // 새 로그 하이라이트 리셋
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchLogs, logsPerPage, currentFilters, searchQuery, mockData]);

  // Live 모드 폴링
  useEffect(() => {
    if (isLive && pollInterval > 0) {
      const interval = setInterval(() => {
        // 실제 구현에서는 새로운 로그를 fetch하고
        // 새 로그가 있으면 newLogIds에 추가
        console.log('Polling for new logs...');
      }, pollInterval);
      return () => clearInterval(interval);
    }
  }, [isLive, pollInterval]);

  // 이벤트 핸들러들
  const handleLiveToggle = (checked: boolean) => {
    setIsLive(checked);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleMarkAsRead = (logId: string) => {
    setNewLogIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
  };

  return (
    <div className='h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 flex flex-col overflow-hidden'>
      <div className='flex gap-6 flex-1 max-w-[1600px] mx-auto w-full overflow-hidden'>
        {/* 메인 콘텐츠 */}
        <div className='flex-1 flex flex-col gap-6 min-w-0 overflow-hidden'>
          {/* 헤더 - 고정 */}
          <div className='shrink-0'>
            <PipelineLogsHeader
              isLive={isLive}
              onLiveToggle={handleLiveToggle}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              unreadCount={newLogIds.size}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* 로그 테이블 - 스크롤 가능 */}
          <div className='flex-1 overflow-hidden'>
            <PipelineLogsTable
              logs={finalFilteredLogs}
              newLogIds={newLogIds}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineLogsPage;