# 로그 시스템 프론트엔드 통합 완료

## 📋 구현 완료 사항

### 1. ✅ API 클라이언트 (`lib/api/unified-logs-api.ts`)
- 통합 로그 조회 API (`getUnifiedLogs`)
- 빌드 메타데이터 API (`getBuildMetadata`)
- 로그 검색 API (`searchLogs`)
- 빌드 분석 API (`getBuildAnalytics`)
- SSE 스트리밍 연결 (`createLogStream`)
- React Hook (`useLogStream`)

### 2. ✅ 핵심 컴포넌트 구현

#### UnifiedLogViewer (`components/logs/UnifiedLogViewer.tsx`)
- **기능**:
  - 실시간/아카이브 자동 전환 표시
  - 무한 스크롤 및 페이지네이션
  - 로그 레벨 필터링 (ERROR, WARN, INFO, DEBUG)
  - 자동 새로고침 옵션
  - 로그 클릭 이벤트 핸들링
- **Props**:
  - `buildId`: 빌드 ID
  - `autoRefresh`: 자동 새로고침 여부
  - `refreshInterval`: 새로고침 간격 (ms)
  - `initialLimit`: 초기 로드 개수
  - `onLogClick`: 로그 클릭 콜백

#### BuildMetadata (`components/logs/BuildMetadata.tsx`)
- **기능**:
  - 빌드 상태 및 진행 상황
  - 트리거 정보 (Manual, GitHub Push 등)
  - 리포지토리 정보 (브랜치, 커밋)
  - 빌드 단계별 상태 및 소요 시간
  - 메트릭 (에러/경고 카운트, 로그 크기)
  - 아카이브 상태 표시
- **Props**:
  - `buildId`: 빌드 ID
  - `autoRefresh`: 자동 새로고침 여부
  - `refreshInterval`: 새로고침 간격 (ms)

#### LogSearch (`components/logs/LogSearch.tsx`)
- **기능**:
  - 텍스트 및 정규식 검색
  - 로그 레벨 필터
  - 컨텍스트 라인 표시
  - 검색 결과 하이라이팅
  - 디바운스 자동 검색
  - 검색 메트릭 (매치 수, 소요 시간)
- **Props**:
  - `buildId`: 빌드 ID
  - `onSearchResults`: 검색 결과 콜백
  - `autoSearch`: 자동 검색 여부
  - `debounceMs`: 디바운스 시간 (ms)

### 3. ✅ 데모 페이지 (`app/logs/demo/page.tsx`)
- 모든 컴포넌트 통합 예시
- 3가지 뷰 모드:
  - Log Viewer: 전체 화면 로그 뷰어
  - Search: 검색 전용 뷰
  - Split View: 로그 뷰어 + 검색 분할 화면
- 사용법 가이드 포함

## 🚀 사용 방법

### 1. 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 2. 데모 페이지 접속
```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 접속
http://localhost:3000/logs/demo
```

### 3. 컴포넌트 사용 예시

```tsx
import UnifiedLogViewer from '@/components/logs/UnifiedLogViewer';
import BuildMetadata from '@/components/logs/BuildMetadata';
import LogSearch from '@/components/logs/LogSearch';

function MyLogPage({ buildId }: { buildId: string }) {
  return (
    <div>
      {/* 빌드 메타데이터 */}
      <BuildMetadata 
        buildId={buildId}
        autoRefresh={true}
      />
      
      {/* 로그 뷰어 */}
      <UnifiedLogViewer
        buildId={buildId}
        autoRefresh={true}
        onLogClick={(log) => console.log(log)}
      />
      
      {/* 로그 검색 */}
      <LogSearch
        buildId={buildId}
        onSearchResults={(results) => console.log(results)}
      />
    </div>
  );
}
```

## 📊 API 엔드포인트 매핑

| 컴포넌트 | API 엔드포인트 | 메서드 |
|---------|--------------|--------|
| UnifiedLogViewer | `/logs/builds/:buildId/unified` | GET |
| BuildMetadata | `/logs/builds/:buildId/metadata` | GET |
| LogSearch | `/logs/builds/:buildId/search` | POST |
| Analytics (추후) | `/logs/analytics/builds` | GET |
| SSE Stream | `/logs/builds/:buildId/stream` | SSE |

## 🔄 마이그레이션 가이드

### 기존 PipelineLogsPage 교체
1. 기존 `usePipelineLogs` 훅을 `useUnifiedLogs`로 교체
2. `LogFilters` 컴포넌트를 `LogSearch`로 교체
3. `CloudWatchMetrics`를 `BuildMetadata`로 교체

### 예시:
```tsx
// Before
import { usePipelineLogs } from '@/hooks/logs/usePipelineLogs';
const { logs, isLoading } = usePipelineLogs({ buildId });

// After
import { getUnifiedLogs } from '@/lib/api/unified-logs-api';
const [logs, setLogs] = useState([]);
useEffect(() => {
  getUnifiedLogs(buildId).then(res => setLogs(res.logs));
}, [buildId]);
```

## 🧪 테스트 체크리스트

- [ ] UnifiedLogViewer 로그 표시 확인
- [ ] 실시간/아카이브 자동 전환 확인
- [ ] 페이지네이션 동작 확인
- [ ] BuildMetadata 정보 표시 확인
- [ ] LogSearch 검색 기능 확인
- [ ] 정규식 검색 동작 확인
- [ ] 컨텍스트 라인 표시 확인
- [ ] SSE 연결 및 재연결 확인
- [ ] 에러 처리 확인

## 📝 추가 구현 예정 (선택사항)

### 4. Analytics Dashboard 개선
- 새로운 분석 API 연동
- 트렌드 차트 추가
- 에러 패턴 분석 표시

### 5. SSE 스트리밍 강화
- 새로운 이벤트 타입 처리 (status, phase, complete)
- 연결 상태 관리 개선
- 백오프 재연결 로직

## 🛠 트러블슈팅

### CORS 에러
백엔드에서 CORS 설정 확인:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true
});
```

### SSE 연결 실패
- 백엔드 SSE 엔드포인트 확인
- 네트워크 프록시 설정 확인
- EventSource 브라우저 지원 확인

### 타입 에러
```bash
# TypeScript 타입 체크
pnpm tsc --noEmit
```

## 📚 참고 문서
- [Backend API Documentation](../otto-server/src/logs/README.md)
- [SSE MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React Query Documentation](https://tanstack.com/query/latest)