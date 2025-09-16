# Filter Panel Component

GlobalSidebar에서 추출한 필터 패널 컴포넌트입니다.

## 📋 기능

- **Timeline 필터**: All time, Today, This week, This month
- **Status 필터**: Any status, Running, Success, Failed, Pending  
- **Trigger 필터**: All triggers, Push to branch, PR merged, Manual, Scheduled
- **Branch 필터**: All branches, main, develop, staging
- **Author 필터**: All authors, 사용자별 필터

## 🎯 주요 특징

- **URL 연동**: 필터 상태를 URL 파라미터와 동기화
- **Portal 드롭다운**: z-index 문제 없는 드롭다운
- **반응형 위치**: 화면 공간에 따라 위/아래 동적 배치
- **키보드 접근성**: ESC, Enter 키 지원
- **스크롤 감지**: 스크롤 시 드롭다운 자동 닫기

## 🔧 사용법

### 기본 사용

```tsx
import FilterPanel from './FilterPanel';

function LogsPage() {
  const handleFiltersChange = (filters) => {
    console.log('Filters changed:', filters);
    // 필터 적용 로직
  };

  return (
    <FilterPanel
      onFiltersChange={handleFiltersChange}
      initialFilters={{ status: 'failed' }}
    />
  );
}
```

### URL 연동 사용 (Next.js)

```tsx
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FilterPanel from './FilterPanel';

function LogsPage() {
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
        // 필터 적용 로직
      }}
    />
  );
}
```

## 📦 Props

```tsx
interface FilterPanelProps {
  // 필터 변경 콜백
  onFiltersChange?: (filters: FilterState) => void;
  // 초기 필터 값
  initialFilters?: Partial<FilterState>;
  // CSS 클래스
  className?: string;
  // URL 연동 (선택사항)
  pathname?: string;
  updateURL?: (url: string) => void;
  parseURLParams?: () => Record<string, string>;
}
```

## 🔄 필터 상태

```tsx
interface FilterState {
  timeline: string;  // 'all-time' | 'today' | 'week' | 'month'
  status: string;    // 'any-status' | 'running' | 'success' | 'failed' | 'pending'
  trigger: string;   // 'all-triggers' | 'push' | 'pr-merged' | 'manual' | 'scheduled'
  branch: string;    // 'all-branches' | 'main' | 'develop' | 'staging'
  author: string;    // 'all-authors' | 'john-doe' | 'jane-smith' | ...
}
```

## 🎨 커스터마이징

### 필터 옵션 수정

컴포넌트 내부의 옵션 배열을 수정하여 새로운 필터 값을 추가할 수 있습니다:

```tsx
const statusOptions: FilterOption[] = [
  { value: 'any-status', label: 'Any status' },
  { value: 'custom-status', label: 'Custom Status', icon: <CustomIcon /> },
  // ... 추가 옵션
];
```

### 스타일 커스터마이징

```tsx
<FilterPanel 
  className="custom-filter-panel"
  // 추가 스타일 적용
/>
```

## ⚠️ 주의사항

1. **Portal 의존성**: `document.body`에 Portal을 렌더링하므로 SSR 환경에서 주의 필요
2. **z-index**: Portal 드롭다운은 z-index 99999를 사용
3. **URL 연동**: Next.js App Router의 `useRouter`, `useSearchParams` 필요
4. **메모리 누수**: 컴포넌트 언마운트 시 이벤트 리스너 자동 정리

## 🔗 의존성

- React 18+
- lucide-react (아이콘)
- Tailwind CSS (스타일링)
- Next.js 13+ (URL 연동 시)