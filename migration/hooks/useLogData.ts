import { useState, useEffect } from 'react';
import { LogData } from '../types';

interface UseLogDataResult {
  logData: LogData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseLogDataOptions {
  // API 호출 함수 (새 프로젝트에서 구현)
  fetchLogData?: (buildId: string) => Promise<LogData>;
  // 모킹 데이터 함수 (개발용)
  getMockData?: (buildId: string) => LogData | null;
  // 로딩 딜레이 (개발용)
  simulateDelay?: number;
}

export const useLogData = (
  buildId: string, 
  options: UseLogDataOptions = {}
): UseLogDataResult => {
  const { 
    fetchLogData, 
    getMockData, 
    simulateDelay = 1000 
  } = options;
  
  const [logData, setLogData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // API 호출 함수가 제공된 경우
      if (fetchLogData) {
        const data = await fetchLogData(buildId);
        setLogData(data);
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
      setError(err instanceof Error ? err.message : 'Failed to fetch log data');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadLogData();
  };

  useEffect(() => {
    if (buildId) {
      loadLogData();
    }
  }, [buildId]);

  return {
    logData,
    loading,
    error,
    refetch,
  };
};