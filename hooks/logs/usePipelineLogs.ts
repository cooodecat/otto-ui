import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllUserBuildHistories, transformBuildToLogItem, searchBuildHistories } from '@/lib/api/pipeline-logs';
import type { LogItem, FilterState } from '@/types/logs';

interface UsePipelineLogsOptions {
  userId?: string;
  projectId?: string;
  useRealData?: boolean;
  initialLimit?: number;
  autoFetch?: boolean;
}

interface UsePipelineLogsReturn {
  logs: LogItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
  filter: (filters: FilterState) => Promise<void>;
}

/**
 * Pipeline Logs 데이터 관리를 위한 커스텀 훅
 * 실제 Supabase 데이터와 목업 데이터를 모두 지원
 */
export function usePipelineLogs(options: UsePipelineLogsOptions): UsePipelineLogsReturn {
  const {
    userId,
    projectId,
    useRealData = false,
    initialLimit = 20,
    autoFetch = true
  } = options;

  // 상태 관리
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    timeline: 'all-time',
    status: 'any-status',
    trigger: 'all-triggers',
    branch: 'all-branches',
    author: 'all-authors'
  });
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  // Supabase 클라이언트
  const supabase = createClient();

  // 현재 사용자 ID 가져오기
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);

  useEffect(() => {
    if (!userId && useRealData) {
      // 사용자 인증 정보 가져오기
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      };
      getUser();
    }
  }, [userId, useRealData, supabase.auth]);

  // 실제 데이터 로드 함수
  const fetchRealData = useCallback(async (
    offset: number = 0,
    limit: number = initialLimit,
    searchQuery: string = '',
    filters: FilterState = currentFilters,
    append: boolean = false
  ) => {
    if (!currentUserId) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let result;
      
      if (searchQuery.trim()) {
        // 검색 모드
        result = await searchBuildHistories(currentUserId, searchQuery, {
          limit,
          offset,
          status: filters.status,
          projectId: projectId
        });
        
        const transformedLogs = result.builds.map(build => transformBuildToLogItem(build));
        
        if (append) {
          setLogs(prev => [...prev, ...transformedLogs]);
        } else {
          setLogs(transformedLogs);
        }
        
        setHasMore(result.hasMore);
      } else {
        // 일반 로드
        result = await getAllUserBuildHistories(currentUserId, {
          limit,
          offset,
          status: filters.status,
          projectId: projectId || (filters.branch !== 'all-branches' ? filters.branch : undefined)
        });

        const transformedLogs = result.builds.map(build => transformBuildToLogItem(build));
        
        if (append) {
          setLogs(prev => [...prev, ...transformedLogs]);
        } else {
          setLogs(transformedLogs);
        }
        
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      }

      setCurrentOffset(offset + limit);
      
    } catch (err) {
      console.error('Error fetching pipeline logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, initialLimit, currentFilters]);

  // 목업 데이터 로드 함수 (기존 로직)
  const fetchMockData = useCallback(async (append: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // 목업 데이터 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLogs: LogItem[] = [
        {
          id: '1',
          status: 'success',
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
        {
          id: '2',
          status: 'failed',
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
      ];

      if (append) {
        setLogs(prev => [...prev, ...mockLogs]);
      } else {
        setLogs(mockLogs);
      }
      
      setHasMore(false); // 목업 데이터는 추가 로드 없음
      setTotalCount(mockLogs.length);
    } catch {
      setError('Failed to load mock data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!autoFetch) return;
    if (useRealData && !currentUserId) return;
    
    const initialLoad = async () => {
      if (useRealData) {
        await fetchRealData(
          0,
          initialLimit,
          currentSearchQuery,
          currentFilters,
          false
        );
      } else {
        await fetchMockData(false);
      }
    };
    
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, currentUserId, useRealData]); // 안전한 의존성만 포함

  // 더 많은 로그 로드
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    if (useRealData) {
      await fetchRealData(
        currentOffset,
        initialLimit,
        currentSearchQuery,
        currentFilters,
        true
      );
    } else {
      await fetchMockData(true);
    }
  }, [isLoading, hasMore, useRealData, fetchRealData, fetchMockData, currentOffset, initialLimit, currentSearchQuery, currentFilters]);

  // 새로고침
  const refresh = useCallback(async () => {
    setCurrentOffset(0);
    
    if (useRealData) {
      await fetchRealData(
        0,
        initialLimit,
        currentSearchQuery,
        currentFilters,
        false
      );
    } else {
      await fetchMockData(false);
    }
  }, [useRealData, fetchRealData, fetchMockData, initialLimit, currentSearchQuery, currentFilters]);

  // 검색
  const search = useCallback(async (query: string) => {
    setCurrentSearchQuery(query);
    setCurrentOffset(0);
    
    if (useRealData) {
      await fetchRealData(0, initialLimit, query, currentFilters, false);
    } else {
      // 목업 데이터에서는 검색 기능 시뮬레이션
      await fetchMockData(false);
    }
  }, [useRealData, fetchRealData, fetchMockData, initialLimit, currentFilters]);

  // 필터링
  const filter = useCallback(async (filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentOffset(0);
    
    if (useRealData) {
      await fetchRealData(0, initialLimit, currentSearchQuery, filters, false);
    } else {
      // 목업 데이터에서는 필터 기능 시뮬레이션
      await fetchMockData(false);
    }
  }, [useRealData, fetchRealData, fetchMockData, initialLimit, currentSearchQuery]);

  return {
    logs,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    search,
    filter
  };
}
