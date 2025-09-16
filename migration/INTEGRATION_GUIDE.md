# 새 프로젝트 통합 가이드

migration 폴더를 새 프로젝트로 이관하고 Claude CLI로 통합하는 단계별 가이드입니다.

## 🚚 1단계: 파일 이관

### 방법 A: 직접 복사
```bash
# 현재 otto-front 디렉토리에서
cp -r migration /path/to/new-project/

# 또는 새 프로젝트 디렉토리에서
cp -r /path/to/otto-front/migration ./
```

### 방법 B: Git 활용
```bash
# otto-front에서 migration 브랜치 생성
git checkout -b migration/logs-components
git add migration/
git commit -m "feat: extract logs and filter components for migration"

# 새 프로젝트에서 파일만 가져오기
git remote add otto-front /path/to/otto-front
git fetch otto-front migration/logs-components
git checkout otto-front/migration/logs-components -- migration/
```

## 🔧 2단계: 의존성 설치

```bash
# 새 프로젝트에서 필수 의존성 설치
npm install @radix-ui/react-dialog lucide-react zustand
# 또는
pnpm add @radix-ui/react-dialog lucide-react zustand
```

### package.json 업데이트
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.0",
    "lucide-react": "^0.400.0", 
    "zustand": "^4.5.0",
    "react": "^18.0.0",
    "next": "^14.0.0"
  }
}
```

## 🎯 3단계: Claude CLI 통합

### 새 프로젝트에서 Claude CLI 설정

```bash
# 새 프로젝트 디렉토리에서
cd /path/to/new-project

# Claude CLI로 프로젝트 열기
claude .
```

### Claude에게 통합 요청

```prompt
migration 폴더의 컴포넌트들을 이 프로젝트에 통합하고 싶습니다.

현재 프로젝트 구조:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- [기존 프로젝트 정보 추가]

다음과 같이 진행해주세요:
1. migration 폴더 구조 분석
2. 기존 프로젝트와 충돌 확인
3. 필요한 설정 파일 업데이트
4. 통합 후 테스트 페이지 생성
```

## 📝 4단계: 단계별 통합 요청

### 4-1. 타입 정의 통합
```prompt
migration/types/index.ts의 타입 정의들을 이 프로젝트의 타입 시스템에 통합해주세요.
기존 타입과 충돌이 있다면 네임스페이스나 prefix를 사용해주세요.
```

### 4-2. 유틸리티 함수 통합
```prompt
migration/utils/index.ts의 유틸리티 함수들을 이 프로젝트에 통합해주세요.
중복되는 함수가 있다면 최적화해주세요.
```

### 4-3. 훅 통합
```prompt
migration/hooks/ 폴더의 커스텀 훅들을 통합해주세요.
이 프로젝트의 상태 관리 방식에 맞게 조정해주세요.
```

### 4-4. 컴포넌트 통합
```prompt
migration/components/ 폴더의 컴포넌트들을 통합해주세요.

우선순위:
1. FilterPanel - 독립적으로 사용 가능하게
2. PipelineLogsPage - 메인 로그 페이지로
3. 공통 컴포넌트들

각 컴포넌트에 대해:
- 이 프로젝트의 폴더 구조에 맞게 배치
- 임포트 경로 수정
- API 연동 부분 이 프로젝트 방식으로 수정
```

## 🧪 5단계: 테스트 페이지 생성

```prompt
통합된 컴포넌트들을 테스트할 수 있는 페이지를 생성해주세요:

1. /test-logs - 로그 페이지 테스트
2. /test-filters - 필터 패널 테스트  
3. /test-combined - 통합 테스트

각 페이지에서:
- 기본 기능 동작 확인
- 샘플 데이터로 테스트
- 콘솔에 상태 변화 로그 출력
```

## 🔗 6단계: API 연동

```prompt
migration된 컴포넌트들을 이 프로젝트의 API와 연동해주세요:

현재 API 구조:
[여기에 새 프로젝트의 API 정보 입력]

필요한 연동:
1. 로그 목록 조회 API
2. 로그 상세 조회 API  
3. 필터링 API
4. 실시간 업데이트 (WebSocket/SSE)

migration/hooks/useLogData.ts의 fetchLogData 함수를 실제 API 호출로 교체해주세요.
```

## 🎨 7단계: 스타일 통합

```prompt
migration된 컴포넌트들의 스타일을 이 프로젝트의 디자인 시스템에 맞게 조정해주세요:

현재 디자인 시스템:
- 색상 팔레트: [정보 입력]
- 컴포넌트 라이브러리: [정보 입력]
- 스타일 가이드: [정보 입력]

다음 항목들을 조정:
1. 색상 코드를 프로젝트 표준으로 변경
2. 폰트, 간격, 그림자 등을 통일
3. 기존 컴포넌트와 일관성 있게 수정
```

## 🚀 8단계: 성능 최적화

```prompt
통합된 컴포넌트들의 성능을 최적화해주세요:

1. 불필요한 리렌더링 방지 (React.memo, useMemo, useCallback)
2. 무한 스크롤 최적화
3. 검색 디바운싱 최적화
4. Bundle 크기 최적화 (dynamic import)
5. 메모리 누수 방지

특히 대량의 로그 데이터를 처리할 때 성능 이슈가 없도록 해주세요.
```

## 🧹 9단계: 정리 및 문서화

```prompt
통합 작업을 마무리해주세요:

1. 사용하지 않는 migration 폴더 정리
2. 새 프로젝트 구조에 맞게 README 업데이트
3. 컴포넌트 사용법 문서화
4. 타입 정의 정리
5. 예제 코드 생성

최종적으로 이 프로젝트에서 로그 기능을 어떻게 사용하는지 간단한 가이드를 만들어주세요.
```

## 📋 체크리스트

통합 완료 후 다음 항목들을 확인하세요:

### 기능 테스트
- [ ] 필터 패널이 정상 동작하는가?
- [ ] 로그 목록이 제대로 로드되는가?
- [ ] 검색이 정상 작동하는가?
- [ ] 무한 스크롤이 동작하는가?
- [ ] 로그 상세보기가 열리는가?
- [ ] URL 파라미터 연동이 되는가?
- [ ] 키보드 단축키가 작동하는가?

### 기술적 검증
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음
- [ ] 콘솔 에러 없음
- [ ] 메모리 누수 없음
- [ ] 성능 이슈 없음

### 사용성 검증
- [ ] 반응형 디자인 정상
- [ ] 접근성 (키보드 네비게이션)
- [ ] 로딩 상태 표시
- [ ] 에러 상태 처리
- [ ] 빈 상태 처리

## 🆘 문제 해결

### 자주 발생하는 이슈

1. **임포트 에러**
```prompt
migration 컴포넌트에서 임포트 에러가 발생합니다. 
경로를 이 프로젝트 구조에 맞게 수정해주세요.
```

2. **타입 충돌**
```prompt
기존 타입과 migration 타입이 충돌합니다.
네임스페이스나 별칭을 사용해서 해결해주세요.
```

3. **스타일 깨짐**
```prompt
migration 컴포넌트의 스타일이 깨집니다.
이 프로젝트의 Tailwind 설정과 맞지 않는 부분을 수정해주세요.
```

4. **API 연동 문제**
```prompt
API 호출이 실패합니다. 
이 프로젝트의 API 클라이언트 방식에 맞게 수정해주세요.
```

## 💡 팁

- **단계별 진행**: 한 번에 모든 것을 통합하지 말고 컴포넌트별로 단계적으로 진행
- **테스트 우선**: 각 단계마다 테스트 페이지로 동작 확인
- **백업**: 통합 전 현재 프로젝트 상태를 git commit으로 백업
- **점진적 개선**: 기본 동작 확인 후 성능 최적화와 스타일 개선 진행