# Claude CLI 통합 가이드

migration 폴더를 새 프로젝트로 이관 후 Claude CLI로 효과적으로 통합하는 방법입니다.

## 🎯 추천 접근 방식

### 1. 폴더 이관 후 Claude CLI 시작

```bash
# 새 프로젝트에서
cp -r /path/to/otto-front/migration ./
claude .
```

### 2. 단계별 Claude 요청 시나리오

## 📋 Phase 1: 프로젝트 분석 및 준비

```prompt
안녕하세요! otto-front에서 추출한 로그 컴포넌트들을 이 프로젝트에 통합하려고 합니다.

먼저 현재 상황을 분석해주세요:

1. migration/ 폴더 구조와 내용 파악
2. 현재 프로젝트의 기술 스택과 폴더 구조 분석  
3. 의존성 충돌이나 호환성 이슈 확인
4. 통합 전략 제안

migration/README.md와 migration/USAGE.md를 먼저 읽어보시고 통합 계획을 세워주세요.
```

## 🔧 Phase 2: 의존성 및 환경 설정

```prompt
migration 컴포넌트들에 필요한 의존성을 설치하고 설정해주세요:

필요한 작업:
1. package.json에 필수 의존성 추가
2. TypeScript 설정 확인 및 조정
3. Tailwind CSS 설정 확인
4. ESLint 규칙 조정 (필요시)

다음 의존성들이 필요합니다:
- @radix-ui/react-dialog
- lucide-react  
- zustand

설치 후 버전 호환성도 확인해주세요.
```

## 🏗️ Phase 3: 타입 시스템 통합

```prompt
migration/types/index.ts의 타입 정의들을 이 프로젝트에 통합해주세요.

고려사항:
1. 기존 타입과 이름 충돌 방지
2. 프로젝트의 타입 구조에 맞게 재배치
3. 필요시 네임스페이스 사용
4. Import/export 경로 최적화

완료 후 타입 체크가 통과하는지 확인해주세요.
```

## 🛠️ Phase 4: 유틸리티 함수 통합

```prompt
migration/utils/index.ts의 유틸리티 함수들을 통합해주세요:

1. 기존 프로젝트의 utils와 중복 확인
2. 중복 함수는 더 나은 버전으로 통합
3. 이 프로젝트의 폴더 구조에 맞게 배치
4. Import 경로 업데이트

특히 다음 함수들이 중요합니다:
- formatDuration, formatTimestamp
- getStatusColor, getStatusBgColor  
- filterLogs, exportLogs
- updateURLFilters, parseURLFilters
```

## 🎣 Phase 5: 커스텀 훅 통합

```prompt
migration/hooks/ 폴더의 커스텀 훅들을 통합해주세요:

훅 목록:
- useFilters: 필터 상태 관리
- useLogData: 로그 데이터 로딩
- useLogSearch: 로그 검색 기능
- useKeyboardShortcuts: 키보드 단축키
- useDebounce: 디바운스 기능

각 훅을:
1. 이 프로젝트의 hooks 폴더로 이동
2. 프로젝트의 상태 관리 방식에 맞게 조정
3. API 클라이언트 연동 준비
4. 테스트 코드 작성 (간단한 것이라도)
```

## 🧩 Phase 6: 공통 컴포넌트 통합

```prompt
migration/components/shared/ 의 공통 컴포넌트들을 먼저 통합해주세요:

1. ToggleSwitch 컴포넌트
   - 이 프로젝트의 UI 컴포넌트 폴더로 이동
   - 기존 유사 컴포넌트와 통합 또는 대체
   - 스타일을 프로젝트 디자인 시스템에 맞게 조정

2. 공통 컴포넌트 인덱스 업데이트
3. Storybook 있다면 스토리 추가
```

## 🎛️ Phase 7: FilterPanel 컴포넌트 통합

```prompt
migration/components/FilterPanel/ 을 통합해주세요:

이것은 독립적인 필터 패널 컴포넌트입니다.

작업 내용:
1. 적절한 위치에 컴포넌트 배치
2. 프로젝트의 라우터 시스템과 연동 (useRouter, useSearchParams)
3. 스타일을 프로젝트 디자인에 맞게 조정
4. 필터 옵션을 이 프로젝트에 맞게 커스터마이징
5. 테스트 페이지 생성해서 동작 확인

특히 URL 파라미터 연동이 중요합니다.
```

## 📊 Phase 8: Pipeline Logs 컴포넌트 통합

```prompt
migration/components/PipelineLogs/ 의 로그 시스템을 통합해주세요:

컴포넌트 구성:
- PipelineLogsPage: 메인 페이지 
- PipelineLogsHeader: 헤더 (검색, Live 토글)
- PipelineLogsTable: 로그 테이블 (무한 스크롤)
- LogDetailsPanel: 상세보기 모달

작업 순서:
1. 컴포넌트들을 프로젝트 구조에 맞게 배치
2. API 연동 부분을 이 프로젝트 방식으로 수정
3. 샘플 데이터로 기본 동작 확인
4. 스타일 조정
5. 통합 테스트 페이지 생성
```

## 🔌 Phase 9: API 연동

```prompt
migration된 컴포넌트들을 실제 API와 연동해주세요:

현재 이 프로젝트의 API 구조:
[여기에 프로젝트별 API 정보 입력]

필요한 API 엔드포인트:
1. GET /logs - 로그 목록 조회 (페이징, 필터링)
2. GET /logs/:id - 로그 상세 조회
3. 실시간 업데이트 (WebSocket/SSE) - 선택사항

migration/hooks/useLogData.ts의 fetchLogData 함수를 실제 API 호출로 교체하고,
에러 처리와 로딩 상태도 프로젝트 방식에 맞게 수정해주세요.
```

## 🎨 Phase 10: 스타일 및 UX 통합

```prompt
migration된 컴포넌트들의 스타일을 완전히 통합해주세요:

1. 색상 팔레트를 프로젝트 표준으로 변경
2. 타이포그래피, 간격, 그림자 등을 일관성 있게 수정
3. 반응형 디자인 최적화
4. 다크모드 지원 (프로젝트에 있다면)
5. 접근성 개선 (ARIA 라벨, 키보드 네비게이션)

기존 페이지들과 자연스럽게 어우러지도록 해주세요.
```

## 🚀 Phase 11: 성능 최적화

```prompt
통합된 로그 시스템의 성능을 최적화해주세요:

1. 컴포넌트 메모이제이션 (React.memo, useMemo, useCallback)
2. 무한 스크롤 최적화 (Intersection Observer)
3. 검색 디바운싱 최적화
4. 가상화 고려 (대량 데이터시 react-window)
5. Bundle 크기 최적화 (dynamic import, code splitting)
6. 메모리 누수 방지
7. 이미지 최적화 (있다면)

특히 수천 개의 로그를 처리할 때도 부드럽게 동작하도록 해주세요.
```

## 🧪 Phase 12: 테스트 및 검증

```prompt
통합된 컴포넌트들의 테스트를 작성해주세요:

1. 단위 테스트 (Jest + React Testing Library)
   - 각 컴포넌트의 렌더링 테스트
   - 사용자 인터랙션 테스트
   - 훅 테스트

2. 통합 테스트
   - 필터 + 로그 목록 연동
   - API 호출 + 데이터 표시
   - URL 파라미터 + 필터 상태 동기화

3. E2E 테스트 (선택사항)
   - 전체 로그 조회 플로우
   - 검색 및 필터링 시나리오

기존 프로젝트의 테스트 패턴을 따라주세요.
```

## 📚 Phase 13: 문서화 및 정리

```prompt
통합 작업을 마무리하고 문서화해주세요:

1. migration/ 폴더 정리 (필요시 삭제)
2. 컴포넌트 사용법 문서 작성
3. README 업데이트
4. 코드 주석 정리
5. 예제 페이지 생성
6. Storybook 스토리 작성 (있다면)

이제 다른 개발자들이 쉽게 사용할 수 있도록 가이드를 만들어주세요:
- 로그 페이지 생성 방법
- 필터 패널 사용법  
- 커스터마이징 옵션
- 트러블슈팅 가이드
```

## 💡 효과적인 Claude 사용 팁

### 1. 단계별 진행
```prompt
이전 단계가 완료되었는지 확인해주세요:
- TypeScript 컴파일 에러 없음
- 기본 렌더링 정상
- 콘솔 에러 없음

확인되면 다음 단계로 진행해주세요.
```

### 2. 구체적인 요청
```prompt
❌ "컴포넌트를 통합해주세요"
✅ "FilterPanel 컴포넌트를 src/components/filters/ 폴더에 배치하고, 
   Next.js의 useRouter와 연동해서 URL 파라미터 동기화가 되도록 수정해주세요"
```

### 3. 문제 발생시 디버깅
```prompt
다음 에러가 발생했습니다:
[에러 메시지 복사]

관련 파일:
- src/components/FilterPanel.tsx
- src/hooks/useFilters.ts

원인을 파악하고 수정해주세요.
```

### 4. 점진적 개선
```prompt
기본 기능은 동작하지만 다음을 개선하고 싶습니다:
1. 로딩 속도 향상
2. 애니메이션 부드럽게  
3. 에러 처리 강화

우선순위대로 하나씩 개선해주세요.
```

## 📋 최종 체크리스트

각 단계 완료 후 Claude에게 확인 요청:

```prompt
현재까지 진행상황을 체크해주세요:

✅ 완료된 항목들
- [ ] 의존성 설치
- [ ] 타입 정의 통합  
- [ ] 유틸리티 함수 통합
- [ ] 커스텀 훅 통합
- [ ] 공통 컴포넌트 통합
- [ ] FilterPanel 통합
- [ ] PipelineLogs 통합
- [ ] API 연동
- [ ] 스타일 통합
- [ ] 성능 최적화
- [ ] 테스트 작성
- [ ] 문서화

🔍 검증 필요한 항목들
- [ ] TypeScript 컴파일 성공
- [ ] ESLint 경고 없음
- [ ] 기본 기능 정상 동작
- [ ] 반응형 디자인 OK
- [ ] 성능 이슈 없음

다음 단계는 무엇인가요?
```

이렇게 체계적으로 진행하면 migration 폴더의 컴포넌트들을 안전하고 효과적으로 새 프로젝트에 통합할 수 있습니다!