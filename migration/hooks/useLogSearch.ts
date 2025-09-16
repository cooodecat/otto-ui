import { useState, useMemo, useCallback, useEffect } from 'react';
import { LogLine, LogFilter, LogSearchResult } from '../types';
import { useDebounce } from './useDebounce';

interface UseLogSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: LogFilter;
  setFilter: (filter: LogFilter) => void;
  filteredLogs: LogLine[];
  searchResults: LogSearchResult[];
  currentResultIndex: number;
  totalResults: number;
  navigateToResult: (index: number) => void;
  nextResult: () => void;
  previousResult: () => void;
  clearSearch: () => void;
}

interface UseLogSearchOptions {
  debounceDelay?: number;
  maxResults?: number;
  minSearchLength?: number;
  maxSearchLength?: number;
  scrollToResult?: boolean;
  logContainerSelector?: string;
  itemHeight?: number;
}

export const useLogSearch = (
  logs: LogLine[], 
  options: UseLogSearchOptions = {}
): UseLogSearchResult => {
  
  const {
    debounceDelay = 300,
    maxResults = 1000,
    minSearchLength = 2,
    maxSearchLength = 100,
    scrollToResult = true,
    logContainerSelector = '.custom-scrollbar[style*="height"]',
    itemHeight = 24
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<LogFilter>({
    levels: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
    searchQuery: '',
    showTimestamps: true
  });
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // 안전한 검색어 설정 함수
  const safeSetSearchQuery = useMemo(() => {
    return (query: string) => {
      if (typeof query !== 'string') return;
      const trimmedQuery = query.slice(0, maxSearchLength);
      setSearchQuery(trimmedQuery);
    };
  }, [maxSearchLength]);

  // 디바운싱된 검색어
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    try {
      const trimmedQuery = debouncedSearchQuery.trim();
      if (!trimmedQuery || trimmedQuery.length < minSearchLength) {
        return logs.filter(log => filter.levels.includes(log.level));
      }

      return logs.filter(log => {
        // 레벨 필터
        if (!filter.levels.includes(log.level)) {
          return false;
        }
        
        // 검색 쿼리 필터
        const lowerQuery = trimmedQuery.toLowerCase();
        return log.message.toLowerCase().includes(lowerQuery) ||
               (log.source || '').toLowerCase().includes(lowerQuery);
      });
    } catch (error) {
      console.error('Error filtering logs:', error);
      return logs.filter(log => filter.levels.includes(log.level));
    }
  }, [logs, filter.levels, debouncedSearchQuery, minSearchLength]);

  // 검색 결과
  const searchResults = useMemo(() => {
    const trimmedQuery = debouncedSearchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < minSearchLength) return [];
    
    try {
      const results: LogSearchResult[] = [];
      const lowerQuery = trimmedQuery.toLowerCase();
      let resultCount = 0;
      
      for (let index = 0; index < filteredLogs.length && resultCount < maxResults; index++) {
        const log = filteredLogs[index];
        if (log) {
          if (log.message.toLowerCase().includes(lowerQuery) || 
              (log.source || '').toLowerCase().includes(lowerQuery)) {
            results.push({
              lineNumber: index,
              timestamp: log.timestamp,
              message: log.message,
              level: log.level
            });
            resultCount++;
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error creating search results:', error);
      return [];
    }
  }, [filteredLogs, debouncedSearchQuery, minSearchLength, maxResults]);

  const totalResults = searchResults.length;

  const navigateToResult = useCallback((index: number) => {
    if (searchResults.length === 0) return;
    
    const clampedIndex = Math.max(0, Math.min(index, searchResults.length - 1));
    setCurrentResultIndex(clampedIndex);
    
    // 검색 결과로 스크롤
    if (scrollToResult) {
      const result = searchResults[clampedIndex];
      if (result) {
        try {
          const logContainer = document.querySelector(logContainerSelector);
          if (logContainer) {
            const targetScrollTop = result.lineNumber * itemHeight;
            logContainer.scrollTop = targetScrollTop;
          }
        } catch (error) {
          console.error('Error scrolling to search result:', error);
        }
      }
    }
  }, [searchResults, scrollToResult, logContainerSelector, itemHeight]);

  const nextResult = useCallback(() => {
    const nextIndex = currentResultIndex + 1;
    if (nextIndex < searchResults.length) {
      navigateToResult(nextIndex);
    } else {
      navigateToResult(0); // 첫 번째 결과로 순환
    }
  }, [currentResultIndex, searchResults.length, navigateToResult]);

  const previousResult = useCallback(() => {
    const prevIndex = currentResultIndex - 1;
    if (prevIndex >= 0) {
      navigateToResult(prevIndex);
    } else {
      navigateToResult(searchResults.length - 1); // 마지막 결과로 순환
    }
  }, [currentResultIndex, searchResults.length, navigateToResult]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentResultIndex(0);
  }, []);

  // 검색어 변경 시 결과 인덱스 리셋
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setCurrentResultIndex(0);
    }
  }, [debouncedSearchQuery]);

  return {
    searchQuery,
    setSearchQuery: safeSetSearchQuery,
    filter,
    setFilter,
    filteredLogs,
    searchResults,
    currentResultIndex,
    totalResults,
    navigateToResult,
    nextResult,
    previousResult,
    clearSearch
  };
};