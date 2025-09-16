import { useState, useEffect } from 'react';
import { LogListData, LogItem } from '@/types/logs';
import { fetchLogData, logsApi, LogsApiError } from '@/lib/api/logs-api';

interface UseLogDataResult {
  logData: LogListData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isCollecting: boolean;
  startCollection: () => Promise<void>;
  stopCollection: () => Promise<void>;
}

interface UseLogDataOptions {
  // API 호출 함수 (새 프로젝트에서 구현)
  fetchLogData?: (buildId: string) => Promise<LogItem[]>;
  // 모킹 데이터 함수 (개발용)
  getMockData?: (buildId: string) => LogListData | null;
  // 로딩 딜레이 (개발용)
  simulateDelay?: number;
  // 실제 API 사용 여부
  useRealApi?: boolean;
}

export const useLogData = (
  buildId: string, 
  options: UseLogDataOptions = {}
): UseLogDataResult => {
  const { 
    fetchLogData: customFetchLogData, 
    getMockData, 
    simulateDelay = 1000,
    useRealApi = false
  } = options;
  
  const [logData, setLogData] = useState<LogListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  // 로그 수집 상태 확인
  const checkCollectionStatus = async () => {
    if (!useRealApi) return;
    
    try {
      const status = await logsApi.getLogStatus(buildId);
      setIsCollecting(status.isActive);
    } catch (err) {
      console.warn('Failed to check collection status:', err);
    }
  };

  const loadLogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 사용하는 경우
      if (useRealApi) {
        const logItems = customFetchLogData 
          ? await customFetchLogData(buildId)
          : await fetchLogData(buildId);
        
        // LogItem[] 배열을 LogData 형식으로 변환
        const logData: LogListData = {
          id: buildId,
          name: `Pipeline ${buildId}`,
          status: 'running',
          logs: logItems,
          total: logItems.length,
          hasNext: false // SSE로 실시간 업데이트되므로 페이지네이션 불필요
        };
        
        setLogData(logData);
        await checkCollectionStatus();
        return;
      }

      // 모킹 데이터 사용 (개발용)
      if (getMockData) {
        // 시뮬레이션 딜레이
        if (simulateDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, simulateDelay));
        }

        const mockData = getMockData(buildId);
        if (mockData) {
          setLogData(mockData);
        } else {
          throw new Error(`Build with ID ${buildId} not found`);
        }
        return;
      }

      // 기본 에러 (API 함수나 모킹 데이터가 없는 경우)
      throw new Error('No data source provided for useLogData hook');

    } catch (err) {
      const errorMessage = err instanceof LogsApiError 
        ? `API Error (${err.status}): ${err.message}`
        : err instanceof Error 
        ? err.message 
        : 'Failed to fetch log data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 로그 수집 시작
  const startCollection = async () => {
    if (!useRealApi) return;
    
    try {
      setError(null);
      await logsApi.startLogCollection(buildId);
      setIsCollecting(true);
      console.log(`🚀 Started log collection for build: ${buildId}`);
    } catch (err) {
      const errorMessage = err instanceof LogsApiError
        ? `Failed to start collection: ${err.message}`
        : 'Failed to start log collection';
      setError(errorMessage);
      throw err;
    }
  };

  // 로그 수집 중지
  const stopCollection = async () => {
    if (!useRealApi) return;
    
    try {
      setError(null);
      await logsApi.stopLogCollection(buildId);
      setIsCollecting(false);
      console.log(`⏹️ Stopped log collection for build: ${buildId}`);
    } catch (err) {
      const errorMessage = err instanceof LogsApiError
        ? `Failed to stop collection: ${err.message}`
        : 'Failed to stop log collection';
      setError(errorMessage);
      throw err;
    }
  };

  const refetch = () => {
    loadLogData();
  };

  useEffect(() => {
    if (buildId) {
      loadLogData();
    }
  }, [buildId, useRealApi]);

  return {
    logData,
    loading,
    error,
    refetch,
    isCollecting,
    startCollection,
    stopCollection,
  };
};
