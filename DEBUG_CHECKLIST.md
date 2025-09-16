# 실시간 로그 스트리밍 디버그 체크리스트

## 🔍 현재 상황
- SSE 연결: ✅ 정상 (좌측 하단 디버그 패널 확인됨)
- 로그 데이터: ❌ 없음 (Logs: 0)
- Build ID: `otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83`

## 📋 확인해야 할 사항들

### 1. CloudWatch Logs 확인
```bash
# AWS CLI로 로그 그룹 확인
aws logs describe-log-groups --log-group-name-prefix "otto-codebuild-project"

# 특정 스트림 확인
aws logs describe-log-streams --log-group-name "otto-codebuild-project" --log-stream-name-prefix "fa21d195-132c-4721-bd14-f618c0044a83"

# 실제 로그 이벤트 확인
aws logs get-log-events --log-group-name "otto-codebuild-project" --log-stream-name "fa21d195-132c-4721-bd14-f618c0044a83"
```

### 2. 백엔드 서버 상태 확인
```bash
# API 엔드포인트 직접 테스트
curl http://localhost:4000/api/v1/logs/builds/otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83/status

curl http://localhost:4000/api/v1/logs/builds/otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83/recent?limit=10

# 로그 수집 시작
curl -X POST http://localhost:4000/api/v1/logs/builds/otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83/start
```

### 3. 데이터 저장 방식 확인

**백엔드 시스템이 사용하는 저장 방식:**
- ❓ **메모리 캐시**: 서버 메모리에만 저장 (재시작 시 소실)
- ❓ **데이터베이스**: 영구 저장소에 저장
- ❓ **실시간 스트리밍**: CloudWatch에서 직접 스트리밍

## 🛠️ 디버깅 단계별 확인

### Step 1: 백엔드 서버 로그 확인
```bash
# 백엔드 서버 콘솔에서 확인해야 할 내용:
- CloudWatch API 호출 성공/실패 로그
- 로그 수집 시작/중지 메시지
- SSE 연결 시 클라이언트 연결 로그
- 메모리 캐시에 저장된 로그 개수
```

### Step 2: 브라우저 개발자 도구 확인
```javascript
// 브라우저 콘솔에서 실행하여 SSE 메시지 확인
// 1. Network 탭에서 SSE 연결 확인
// 2. Console에서 SSE 메시지 수신 로그 확인
// 3. API 호출 응답 확인
```

### Step 3: 실제 빌드 상태 확인
- Build ID가 실제로 존재하는가?
- 해당 빌드가 현재 실행 중인가?
- CloudWatch에 로그가 실제로 쌓이고 있는가?

## 🔧 가능한 원인과 해결책

### 원인 1: CloudWatch에 로그가 없음
**해결책**: 
- 실제 빌드를 실행하여 로그 생성
- 올바른 Build ID 확인
- CloudWatch Logs 권한 확인

### 원인 2: 백엔드 수집이 시작되지 않음
**해결책**:
- `/start` API 호출 확인
- 백엔드 서버 에러 로그 확인
- CloudWatch API 권한 확인

### 원인 3: 메모리 캐시가 비어있음
**해결책**:
- 서버 재시작 후 다시 수집 시작
- 캐시 크기 및 보관 정책 확인

### 원인 4: Build ID 형식 문제
**현재 ID**: `otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83`
**확인사항**:
- CloudWatch Log Group 이름이 `otto-codebuild-project`인가?
- Log Stream 이름이 `fa21d195-132c-4721-bd14-f618c0044a83`인가?

## 📊 추가 디버그 도구

### 백엔드 서버에 추가할 디버그 엔드포인트
```typescript
// GET /api/v1/debug/cache-status
// 메모리 캐시 상태 확인

// GET /api/v1/debug/cloudwatch-test/{buildId}
// CloudWatch 직접 조회 테스트
```

### 프론트엔드 추가 디버그 정보
- API 응답 상태 코드
- SSE 메시지 내용 상세 로그
- 재연결 시도 횟수