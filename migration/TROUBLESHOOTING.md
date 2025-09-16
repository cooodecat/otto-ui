# 문제 해결 가이드

migration 컴포넌트들을 새 프로젝트에 통합할 때 자주 발생하는 문제들과 해결 방법입니다.

## 🚨 자주 발생하는 문제들

### 1. Import/Export 에러

#### 문제: 모듈을 찾을 수 없음
```
Error: Cannot resolve module '../../../types'
Error: Module not found: Can't resolve 'lucide-react'
```

#### 해결 방법
```prompt
Claude에게 요청:

다음 import 에러들을 수정해주세요:
[에러 메시지 붙여넣기]

1. 상대 경로를 이 프로젝트 구조에 맞게 수정
2. 절대 경로로 변경 (예: @/components, @/types)
3. 누락된 의존성 설치
4. tsconfig.json의 paths 설정 확인

이 프로젝트의 import 규칙을 따라서 모든 경로를 수정해주세요.
```

### 2. TypeScript 타입 에러

#### 문제: 타입 충돌이나 정의 누락
```
Type 'FilterState' is not assignable to type 'ExistingFilterType'
Property 'onFiltersChange' does not exist on type 'FilterPanelProps'
```

#### 해결 방법
```prompt
Claude에게 요청:

TypeScript 타입 에러를 해결해주세요:
[에러 메시지 붙여넣기]

1. 충돌하는 타입들을 네임스페이스로 분리
2. 누락된 타입 정의 추가
3. 기존 프로젝트 타입과 호환되도록 수정
4. 타입 단언이나 제네릭 사용 최소화

이 프로젝트의 타입 시스템에 맞게 통합해주세요.
```

### 3. Styling 문제

#### 문제: CSS 스타일이 적용되지 않거나 깨짐
```
Tailwind 클래스가 적용되지 않음
Portal 드롭다운이 뒤에 숨음
반응형이 제대로 안됨
```

#### 해결 방법
```prompt
Claude에게 요청:

스타일 문제를 해결해주세요:

현재 상황:
- Tailwind CSS 버전: [버전]
- 기존 프로젝트 스타일 시스템: [정보]
- 발생하는 문제: [구체적 설명]

해결 요청:
1. Tailwind 클래스를 이 프로젝트 설정에 맞게 조정
2. z-index 충돌 해결 (Portal 드롭다운)
3. 프로젝트 색상 팔레트로 통일
4. 반응형 브레이크포인트 맞춤
5. 다크모드 지원 (있다면)

기존 페이지와 일관된 디자인이 되도록 해주세요.
```

### 4. State Management 충돌

#### 문제: Zustand와 기존 상태 관리 라이브러리 충돌
```
Multiple store providers
State not syncing between components
Hydration mismatch in SSR
```

#### 해결 방법
```prompt
Claude에게 요청:

상태 관리 충돌을 해결해주세요:

현재 프로젝트 상태 관리:
- 사용 중인 라이브러리: [Redux/Context/Zustand/기타]
- 기존 store 구조: [설명]

migration 컴포넌트들의 Zustand store를:
1. 기존 시스템에 통합하거나
2. 별도 네임스페이스로 분리하거나  
3. 기존 라이브러리로 마이그레이션

가장 적합한 방법으로 충돌 없이 통합해주세요.
```

### 5. API 연동 문제

#### 문제: API 호출 방식이 다름
```
Fetch 함수 형식이 맞지 않음
인증 헤더가 포함되지 않음
에러 처리 방식이 다름
```

#### 해결 방법
```prompt
Claude에게 요청:

API 연동을 이 프로젝트 방식에 맞게 수정해주세요:

현재 프로젝트 API 클라이언트:
- 사용 라이브러리: [axios/fetch/swr/tanstack-query]
- 인증 방식: [JWT/Cookie/Basic]
- 베이스 URL: [URL]
- 에러 처리 패턴: [설명]

migration/hooks/useLogData.ts의 API 호출을:
1. 프로젝트 API 클라이언트로 교체
2. 인증 헤더 자동 포함
3. 에러 처리 통일
4. 로딩/캐싱 전략 맞춤

실제 API 엔드포인트:
- 로그 목록: [URL]
- 로그 상세: [URL]
```

### 6. Next.js Router 이슈

#### 문제: 라우터 훅 사용 에러
```
useRouter can only be used inside Router context
useSearchParams returning null
Server/Client component mismatch
```

#### 해결 방법
```prompt
Claude에게 요청:

Next.js Router 관련 문제를 해결해주세요:

프로젝트 Next.js 버전: [버전]
현재 라우터 설정: [App Router/Pages Router]

문제 상황:
[구체적 에러 메시지]

해결 요청:
1. 'use client' 지시어 필요한 곳에 추가
2. Router 컨텍스트 확인
3. SSR/CSR 매칭 문제 해결
4. URL 파라미터 읽기/쓰기 수정

이 프로젝트의 라우팅 방식에 맞게 조정해주세요.
```

### 7. 성능 문제

#### 문제: 렌더링이 느리거나 메모리 누수
```
Large list rendering slowly
Infinite scroll laggy
Memory usage increasing
Re-renders too frequently
```

#### 해결 방법
```prompt
Claude에게 요청:

성능 문제를 진단하고 최적화해주세요:

발생하는 문제:
- 로그 [숫자]개 이상에서 느려짐
- 무한 스크롤시 버벅임
- 메모리 사용량 계속 증가
- 검색시 응답 지연

최적화 요청:
1. React.memo, useMemo, useCallback 적절히 적용
2. 가상화 고려 (react-window)
3. 디바운스 시간 조정
4. 메모리 누수 찾아서 수정
5. Bundle 분석 및 최적화

목표: 10,000개 로그도 부드럽게 처리
```

### 8. 빌드/배포 에러

#### 문제: 빌드 시 에러 발생
```
Build failed due to TypeScript errors
Dynamic imports not working
CSS purging removes needed classes
```

#### 해결 방법
```prompt
Claude에게 요청:

빌드 에러를 해결해주세요:

빌드 로그:
[에러 메시지 전체 붙여넣기]

빌드 환경:
- Node.js 버전: [버전]
- Package manager: [npm/yarn/pnpm]
- 빌드 명령어: [명령어]

해결 요청:
1. TypeScript 컴파일 에러 수정
2. Dynamic import 문법 확인
3. Tailwind purge 설정 조정
4. 번들 크기 최적화
5. Production 환경 테스트

배포 가능한 상태로 만들어주세요.
```

## 🔧 예방법

### 1. 단계별 검증

각 단계마다 다음을 확인:

```bash
# TypeScript 컴파일
npx tsc --noEmit

# Lint 검사  
npm run lint

# 빌드 테스트
npm run build

# 개발 서버 실행
npm run dev
```

### 2. 점진적 통합

```prompt
Claude에게 요청:

한 번에 모든 컴포넌트를 통합하지 말고 단계별로 진행해주세요:

1단계: ToggleSwitch만 통합하고 테스트
2단계: FilterPanel 통합하고 테스트  
3단계: PipelineLogsHeader 통합하고 테스트
4단계: 나머지 컴포넌트들 순차 통합

각 단계마다 정상 동작 확인 후 다음 단계로 진행해주세요.
```

### 3. 백업 및 버전 관리

```bash
# 통합 전 백업
git commit -m "backup: before migration integration"

# 브랜치 생성
git checkout -b feature/integrate-logs-components

# 중간 저장
git add . && git commit -m "wip: partial integration"
```

## 🆘 Claude에게 도움 요청하는 팁

### 1. 구체적인 정보 제공

❌ 나쁜 예:
```prompt
컴포넌트가 안 돼요.
```

✅ 좋은 예:
```prompt
FilterPanel 컴포넌트에서 다음 에러가 발생합니다:

에러 메시지:
Cannot read property 'timeline' of undefined

발생 위치:
src/components/FilterPanel.tsx:45

관련 코드:
const { timeline } = filters; // filters가 undefined

예상 원인:
useFilters 훅에서 초기값이 제대로 설정되지 않는 것 같습니다.

도움 요청:
초기값 설정 및 null 체크 로직을 추가해주세요.
```

### 2. 코드와 함께 요청

```prompt
다음 파일에서 에러가 발생합니다:

```tsx
// src/components/FilterPanel.tsx
import { useFilters } from '../hooks/useFilters';

export default function FilterPanel() {
  const { filters } = useFilters(); // 여기서 에러
  return <div>{filters.timeline}</div>;
}
```

`useFilters`가 undefined를 반환하는 것 같습니다. 
이 프로젝트 구조에 맞게 수정해주세요.
```

### 3. 환경 정보 포함

```prompt
다음 환경에서 작업하고 있습니다:

- Next.js: 14.2.0
- React: 18.3.0  
- TypeScript: 5.4.0
- Tailwind CSS: 3.4.0
- 상태 관리: Redux Toolkit

migration 컴포넌트들을 이 환경에 맞게 통합해주세요.
```

## 📞 추가 지원

문제가 계속 발생한다면:

1. **migration/README.md** 다시 확인
2. **migration/USAGE.md** 예제 참조  
3. **migration/INTEGRATION_GUIDE.md** 단계별 가이드 따라하기
4. **Claude에게 디버깅 요청**:

```prompt
문제 해결을 도와주세요.

시도한 것들:
1. [시도한 방법 1]
2. [시도한 방법 2]  
3. [시도한 방법 3]

여전히 발생하는 문제:
[구체적 문제 설명]

전체 파일 구조와 에러 로그를 분석해서 근본 원인을 찾아주세요.
```

이렇게 체계적으로 접근하면 대부분의 문제를 해결할 수 있습니다!