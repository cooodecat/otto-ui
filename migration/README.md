# Migration Guide - Logs & Filter Panel Components

이 폴더는 otto-front 프로젝트에서 다른 프로젝트로 이관할 컴포넌트들을 정리한 폴더입니다.

## 📁 폴더 구조

```
migration/
├── components/
│   ├── FilterPanel/         # GlobalSidebar에서 추출한 필터 패널
│   ├── PipelineLogs/        # 파이프라인 로그 관련 컴포넌트들
│   └── shared/              # 공통으로 사용되는 컴포넌트들
├── types/                   # TypeScript 타입 정의들
├── hooks/                   # 커스텀 React 훅들
├── utils/                   # 유틸리티 함수들
└── README.md               # 이 파일
```

## 🎯 이관 대상

### 1. Filter Panel
- **소스**: `app/components/layout/GlobalSidebar.tsx` (lines 104-1410)
- **기능**: Timeline, Status, Trigger, Branch, Author 필터링
- **특징**: URL 파라미터 연동, Portal 드롭다운, 반응형

### 2. Pipeline Logs
- **소스**: `app/components/pipeline-logs/`
- **포함**: 
  - PipelineLogsPage (메인 페이지)
  - PipelineLogsHeader (헤더)
  - PipelineLogsTable (테이블)
  - LogDetailsPanel (상세 패널)

## 🔧 주요 의존성

### 필수 Dependencies
```json
{
  "@radix-ui/react-dialog": "^1.x.x",
  "lucide-react": "^0.x.x",
  "zustand": "^4.x.x",
  "next": "^15.x.x"
}
```

### Next.js Router 의존성
- `useRouter` - 라우팅
- `useSearchParams` - URL 파라미터
- `usePathname` - 현재 경로

## ⚠️ 이관 시 주의사항

1. **API 의존성 제거**: Otto SDK 관련 코드 수정 필요
2. **상태 관리**: Zustand store 재구성 필요
3. **Portal 렌더링**: z-index 및 CSS 스타일 조정
4. **URL 파라미터**: 새 프로젝트 라우팅 구조에 맞춤

## 📋 이관 순서

1. ✅ 타입 정의 (types/)
2. ✅ 유틸리티 함수 (utils/)
3. ✅ 커스텀 훅 (hooks/)
4. ✅ 공통 컴포넌트 (shared/)
5. ✅ Filter Panel (FilterPanel/)
6. ✅ Pipeline Logs (PipelineLogs/)
7. ✅ 통합 테스트

## 🚀 사용법

### 빠른 시작

```tsx
import { FilterPanel, PipelineLogsPage } from './migration';

function App() {
  return (
    <div className="flex h-screen">
      <div className="w-80">
        <FilterPanel onFiltersChange={(filters) => console.log(filters)} />
      </div>
      <div className="flex-1">
        <PipelineLogsPage />
      </div>
    </div>
  );
}
```

### 상세 가이드

- [사용법 가이드](./USAGE.md) - 상세한 사용 방법과 예제
- [Filter Panel 가이드](./components/FilterPanel/README.md)
- [Pipeline Logs 가이드](./components/PipelineLogs/README.md)

## 📦 포함된 파일들

```
migration/
├── components/
│   ├── FilterPanel/
│   │   ├── FilterPanel.tsx     # 메인 필터 패널
│   │   ├── README.md
│   │   └── index.ts
│   ├── PipelineLogs/
│   │   ├── PipelineLogsPage.tsx    # 메인 페이지
│   │   ├── components/
│   │   │   ├── PipelineLogsHeader.tsx
│   │   │   ├── PipelineLogsTable.tsx
│   │   │   └── LogDetailsPanel.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── ToggleSwitch.tsx    # 공통 토글 스위치
│   │   └── index.ts
│   └── index.ts
├── types/
│   └── index.ts                # 모든 TypeScript 타입 정의
├── hooks/
│   ├── useFilters.ts           # 필터 상태 관리
│   ├── useLogData.ts           # 로그 데이터 로딩
│   ├── useLogSearch.ts         # 로그 검색
│   ├── useKeyboardShortcuts.ts # 키보드 단축키
│   ├── useDebounce.ts          # 디바운스
│   └── index.ts
├── utils/
│   └── index.ts                # 유틸리티 함수들
├── index.ts                    # 메인 진입점
├── README.md                   # 이 파일
└── USAGE.md                    # 상세 사용 가이드
```