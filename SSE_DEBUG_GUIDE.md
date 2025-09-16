# SSE 데이터 전송 문제 디버깅 가이드

## 🚨 현재 문제 상황
- 백엔드: 43 event 감지 ✅
- 백엔드: 계속 호출 중 ✅  
- 프론트엔드 SSE: 데이터 수신 안됨 ❌

## 🔍 즉시 확인사항

### 1. 브라우저 개발자 도구 확인

**Network 탭에서 SSE 연결 확인:**
```
1. F12 → Network 탭
2. "stream" 검색하여 SSE 연결 찾기
3. 해당 연결 클릭 → Response 탭 확인
4. 실시간으로 데이터가 들어오는지 확인
```

**Console 탭에서 SSE 메시지 확인:**
```javascript
// 다음과 같은 로그가 나와야 함:
📡 Received X log events
🔗 SSE connected to build: otto-codebuild-project:...
```

### 2. 백엔드 서버 SSE 전송 로직 확인

**확인해야 할 백엔드 코드 부분:**
```typescript
// SSE 브로드캐스트 함수가 실제로 호출되는가?
// 수집된 로그 데이터가 SSE로 전송되는가?
// SSE 클라이언트 연결이 유지되고 있는가?
```

### 3. SSE 데이터 형식 확인

**백엔드에서 전송해야 하는 데이터 형식:**
```json
{
  "buildId": "otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83",
  "events": [
    {
      "id": "log-1",
      "status": "running",
      "pipelineName": "Build Process",
      "trigger": {...},
      "branch": "main",
      "commit": {...},
      "duration": "...",
      "isNew": true
    }
  ],
  "timestamp": 1694851200000
}
```

## 🔧 가능한 원인과 해결책

### 원인 1: SSE 브로드캐스트 함수 미호출
**확인사항:**
- 로그 수집 후 SSE.broadcast() 호출하는가?
- 수집된 데이터가 올바른 형식으로 변환되는가?

### 원인 2: SSE 클라이언트 연결 문제  
**확인사항:**
- SSE 연결이 실제로 유지되고 있는가?
- CORS 설정이 올바른가?
- SSE 헤더가 올바른가? (Content-Type: text/event-stream)

### 원인 3: 데이터 형식 변환 오류
**확인사항:**
- CloudWatch 로그 → 프론트엔드 LogItem 형식 변환
- 필수 필드들이 모두 포함되어 있는가?

### 원인 4: 네트워크/프록시 문제
**확인사항:**
- localhost:4000에서 SSE 지원하는가?
- 프록시나 방화벽에서 SSE를 차단하지 않는가?

## 🧪 디버깅 단계

### Step 1: SSE 연결 상태 확인
```bash
# curl로 SSE 연결 직접 테스트
curl -N -H "Accept: text/event-stream" \
  http://localhost:4000/api/v1/logs/builds/otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83/stream
```

### Step 2: 백엔드 로그 상세 확인
**백엔드 콘솔에서 확인해야 할 로그:**
```
✅ CloudWatch API: 43 events retrieved
✅ Data transformation: 43 events converted  
❓ SSE broadcast: sending 43 events to clients
❓ SSE clients: X connected clients
```

### Step 3: 프론트엔드 SSE 핸들러 확인
**useSSELogStream 훅에서 확인:**
```typescript
// SSE 메시지 수신 시 다음이 실행되어야 함:
eventSource.onmessage = (event) => {
  console.log('📡 SSE Raw Data:', event.data);
  const data = JSON.parse(event.data);
  console.log('📡 Parsed Events:', data.events?.length);
}
```

## 🎯 우선 확인할 것들

### 1. 브라우저에서 즉시 확인
```javascript
// 브라우저 콘솔에 붙여넣기 실행:
console.log('=== SSE Debug Info ===');
const sseConnections = performance.getEntriesByType('resource')
  .filter(entry => entry.name.includes('/stream'));
console.log('SSE Connections:', sseConnections);
```

### 2. curl로 직접 SSE 테스트
```bash
curl -v -N -H "Accept: text/event-stream" \
  "http://localhost:4000/api/v1/logs/builds/otto-codebuild-project:fa21d195-132c-4721-bd14-f618c0044a83/stream"
```

### 3. 백엔드 서버에 즉시 추가할 디버그 로그
```typescript
// SSE 브로드캐스트 함수에 추가:
console.log(`🚀 Broadcasting ${events.length} events to ${connectedClients} clients`);

// 각 SSE write 전에:
console.log(`📤 Sending SSE data:`, JSON.stringify(data).substring(0, 200));
```