import { useState, useCallback, useEffect } from 'react';
import { FilterState } from '../types';

interface UseFiltersOptions {
  // 초기 필터 값
  initialFilters?: Partial<FilterState>;
  // URL 연동 여부
  syncWithURL?: boolean;
  // URL 업데이트 함수 (Next.js router 등)
  updateURL?: (filters: FilterState, pathname: string) => void;
  // URL 파라미터 파싱 함수
  parseURLParams?: () => Partial<FilterState>;
  // 현재 경로
  pathname?: string;
}

interface UseFiltersResult {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  isDefaultFilters: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  timeline: 'all-time',
  status: 'any-status',
  trigger: 'all-triggers',
  branch: 'all-branches',
  author: 'all-authors'
};

export const useFilters = (options: UseFiltersOptions = {}): UseFiltersResult => {
  const {
    initialFilters = {},
    syncWithURL = false,
    updateURL,
    parseURLParams,
    pathname = ''
  } = options;

  // 초기 필터 상태 설정
  const [filters, setFiltersState] = useState<FilterState>(() => {
    if (syncWithURL && parseURLParams) {
      const urlFilters = parseURLParams();
      return { ...DEFAULT_FILTERS, ...initialFilters, ...urlFilters };
    }
    return { ...DEFAULT_FILTERS, ...initialFilters };
  });

  // URL에서 필터 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    if (syncWithURL && parseURLParams) {
      const urlFilters = parseURLParams();
      setFiltersState(prev => ({ ...prev, ...urlFilters }));
    }
  }, [syncWithURL, parseURLParams]);

  // 단일 필터 업데이트
  const setFilter = useCallback((key: keyof FilterState, value: string) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // URL 업데이트
      if (syncWithURL && updateURL && pathname) {
        updateURL(newFilters, pathname);
      }
      
      return newFilters;
    });
  }, [syncWithURL, updateURL, pathname]);

  // 다중 필터 업데이트
  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      
      // URL 업데이트
      if (syncWithURL && updateURL && pathname) {
        updateURL(updatedFilters, pathname);
      }
      
      return updatedFilters;
    });
  }, [syncWithURL, updateURL, pathname]);

  // 필터 리셋
  const resetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    setFiltersState(resetFilters);
    
    // URL 업데이트 (기본값으로 리셋)
    if (syncWithURL && updateURL && pathname) {
      updateURL(resetFilters, pathname);
    }
  }, [initialFilters, syncWithURL, updateURL, pathname]);

  // 기본 필터 상태인지 확인
  const isDefaultFilters = Object.keys(DEFAULT_FILTERS).every(
    key => filters[key as keyof FilterState] === DEFAULT_FILTERS[key as keyof FilterState]
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    isDefaultFilters
  };
};