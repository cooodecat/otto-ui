# Migration Package Usage Guide

이 패키지는 otto-front에서 추출한 Filter Panel과 Pipeline Logs 컴포넌트들을 포함합니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install @radix-ui/react-dialog lucide-react zustand
# or
pnpm add @radix-ui/react-dialog lucide-react zustand
```

### 2. 기본 사용법

```tsx
import React from 'react';
import { 
  FilterPanel, 
  PipelineLogsPage, 
  useFilters 
} from './migration';

function LogsPage() {
  // 필터 상태 관리
  const { filters, setFilters } = useFilters({
    initialFilters: { status: 'failed' }
  });

  return (
    <div className="flex h-screen">
      {/* 사이드바: 필터 패널 */}
      <div className="w-80 p-4">
        <FilterPanel
          onFiltersChange={setFilters}
          initialFilters={filters}
        />
      </div>
      
      {/* 메인: 로그 페이지 */}
      <div className="flex-1">
        <PipelineLogsPage 
          externalFilters={filters}
          options={{
            // 새 프로젝트의 API 함수 주입
            fetchLogs: async (params) => {
              return await yourApiClient.getLogs(params);
            },
            logsPerPage: 20,
            maxLogs: 100
          }}
        />
      </div>
    </div>
  );
}
```

### 3. Next.js App Router와 URL 연동

```tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FilterPanel } from './migration';

function LogsPageWithURL() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateURL = (url: string) => {
    router.replace(url, { scroll: false });
  };

  const parseURLParams = () => {
    return {
      timeline: searchParams.get('timeline') || 'all-time',
      status: searchParams.get('status') || 'any-status',
      trigger: searchParams.get('trigger') || 'all-triggers',
      branch: searchParams.get('branch') || 'all-branches',
      author: searchParams.get('author') || 'all-authors',
    };
  };

  return (
    <FilterPanel
      pathname={pathname}
      updateURL={updateURL}
      parseURLParams={parseURLParams}
      onFiltersChange={(filters) => {
        console.log('Filters:', filters);
      }}
    />
  );
}
```

## 📦 주요 컴포넌트

### FilterPanel
- **기능**: Timeline, Status, Trigger, Branch, Author 필터링
- **특징**: URL 연동, Portal 드롭다운, 반응형

### PipelineLogsPage
- **기능**: 파이프라인 로그 메인 페이지
- **포함**: 헤더, 테이블, 무한 스크롤, Live 모드

### LogDetailsPanel
- **기능**: 로그 상세보기 모달
- **특징**: Summary/Expanded 뷰, 키보드 단축키

## 🔧 커스터마이징

### API 연동

```tsx
// API 클라이언트 구현 예시
const apiClient = {
  async getLogs(params) {
    const response = await fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

// 컴포넌트에 주입
<PipelineLogsPage 
  options={{
    fetchLogs: apiClient.getLogs,
    logsPerPage: 25
  }}
/>
```

### 스타일 커스터마이징

```tsx
// Tailwind CSS 클래스 오버라이드
<FilterPanel 
  className="custom-filter-panel bg-slate-100"
/>

// CSS 모듈 사용
import styles from './CustomLogs.module.css';

<PipelineLogsPage 
  className={styles.customLogsPage}
/>
```

### 필터 옵션 수정

```tsx
// FilterPanel.tsx 내부의 옵션 배열 수정
const statusOptions = [
  { value: 'any-status', label: 'Any status' },
  { value: 'custom-status', label: 'Custom Status' },
  // 새 옵션 추가
];
```

## 🎯 타입 정의

### FilterState
```tsx
interface FilterState {
  timeline: string;
  status: string;
  trigger: string;
  branch: string;
  author: string;
}
```

### LogItem
```tsx
interface LogItem {
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
```

## ⚡ 성능 최적화

### 1. 메모이제이션
```tsx
import { useMemo } from 'react';

const memoizedLogs = useMemo(() => {
  return filterLogs(logs, filters);
}, [logs, filters]);
```

### 2. 가상화 (대량 데이터)
```tsx
import { FixedSizeList } from 'react-window';

// 대량 로그 처리 시 가상화 적용
```

### 3. 디바운스 검색
```tsx
import { useDebounce } from './migration/hooks';

const debouncedQuery = useDebounce(searchQuery, 300);
```

## 🔍 문제 해결

### 1. Portal 렌더링 문제
```tsx
// SSR 환경에서 Portal 사용 시
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Portal 렌더링 전 마운트 확인
{isMounted && createPortal(...)}
```

### 2. URL 파라미터 동기화 이슈
```tsx
// searchParams 변경 감지
useEffect(() => {
  const urlFilters = parseURLParams();
  setFilters(urlFilters);
}, [searchParams]);
```

### 3. z-index 충돌
```tsx
// Portal 드롭다운의 z-index 조정
.portal-dropdown {
  z-index: 99999 !important;
}
```

## 📚 추가 자료

- [Filter Panel 상세 가이드](./components/FilterPanel/README.md)
- [Pipeline Logs 컴포넌트 가이드](./components/PipelineLogs/README.md)
- [타입 정의 참조](./types/index.ts)
- [유틸리티 함수 참조](./utils/index.ts)