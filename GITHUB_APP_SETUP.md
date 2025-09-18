# GitHub App 설치 가이드

## 현재 상태

- ✅ 백엔드 서버 실행 중  
- ✅ Supabase 인증 작동
- ✅ Supabase Edge Function 배포됨
- ⚠️ GitHub App Callback URL 설정 필요
- ❌ GitHub 저장소 연동 불가 (App 설정 필요)

## GitHub App 설치 절차

### 1. 백엔드 팀원에게 확인 필요

다음 정보를 백엔드 개발자에게 요청하세요:

1. **GitHub App 이름**: Otto App의 정확한 이름
2. **GitHub App URL**: `https://github.com/apps/[app-name]`
3. **App ID**: 백엔드 `.env.development` 파일의 `OTTO_GITHUB_APP_ID`
4. **설치 상태**: GitHub App이 이미 생성되었는지 확인

### 2. GitHub App 생성 (아직 생성하지 않은 경우)

#### 2.1 GitHub에서 App 생성

1. GitHub 로그인
2. Settings → Developer settings → GitHub Apps → New GitHub App
3. 다음 정보 입력:
   ```
   App name: otto-ci-cd (또는 원하는 이름)
   Homepage URL: http://localhost:3000
   
   # ⚠️ 중요: Callback URL (설치 후 리다이렉트)
   Callback URL: https://yodwrmwzkghrpyuarhet.supabase.co/functions/v1/github-callback
   
   # Webhook URL (이벤트 수신용) - 두 가지 중 선택
   # 옵션 1: Supabase Edge Function (권장)
   Webhook URL: https://yodwrmwzkghrpyuarhet.supabase.co/functions/v1/github-webhook/webhooks/github
   
   # 옵션 2: 로컬 백엔드 서버 (개발용)
   # Webhook URL: http://localhost:4000/api/v1/github/webhook
   Webhook secret: [안전한 랜덤 문자열]
   ```
   
   **주의**: Callback URL은 GitHub App 설치 후 사용자를 리다이렉트할 Supabase Edge Function URL입니다.
   이 URL이 정확하지 않으면 설치 정보가 DB에 저장되지 않습니다.

#### 2.2 권한 설정 (Permissions)

Repository permissions:

- Contents: Read & Write
- Metadata: Read
- Pull requests: Read & Write
- Actions: Read
- Issues: Read & Write

Account permissions:

- Email addresses: Read

#### 2.3 Subscribe to events

- Push
- Pull request
- Installation
- Installation repositories

#### 2.4 Where can this GitHub App be installed?

- Any account (또는 Only on this account)

### 3. 백엔드 서버 설정

생성된 GitHub App 정보를 백엔드 `.env`에 추가:

```env
# GitHub App Configuration
OTTO_GITHUB_APP_ID=123456
OTTO_GITHUB_APP_NAME=otto-ci-cd
OTTO_GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
[Private Key 내용]
-----END RSA PRIVATE KEY-----"
OTTO_GITHUB_APP_CLIENT_ID=Iv1.xxxxx
OTTO_GITHUB_APP_CLIENT_SECRET=xxxxx
OTTO_GITHUB_APP_WEBHOOK_SECRET=your-webhook-secret
```

### 4. GitHub App 설치

1. **App 페이지 방문**: `https://github.com/apps/[your-app-name]`
2. **Install 버튼 클릭**
3. **계정/조직 선택**
4. **저장소 접근 권한 선택**:
   - All repositories (모든 저장소)
   - Selected repositories (특정 저장소만)
5. **Install 클릭**

### 5. 설치 확인

1. 브라우저에서 `http://localhost:3000/projects` 방문
2. "새 프로젝트 만들기" 버튼 클릭
3. GitHub 연동이 표시되면 성공!

## 트러블슈팅

### ⚠️ 중요: GitHub App이 설치되었지만 DB에 저장되지 않는 경우

**문제**: GitHub App을 설치했지만 프로젝트 생성 마법사에서 "설치된 GitHub App이 없습니다"라고 표시됨

**원인**: GitHub App의 Callback URL이 잘못 설정되어 있음

**해결 방법**:
1. GitHub App 설정 페이지로 이동: https://github.com/settings/apps/[your-app-name]
2. "General" 탭에서 다음 URL 확인 및 수정:
   - **Callback URL**: `https://yodwrmwzkghrpyuarhet.supabase.co/functions/v1/github-callback`
3. 변경사항 저장
4. GitHub App을 다시 설치:
   - https://github.com/settings/installations 에서 기존 설치 제거
   - GitHub App 페이지에서 다시 설치

### Installation이 여전히 0개인 경우:

1. **백엔드 로그 확인**:

   ```bash
   # 백엔드 서버 로그 확인
   tail -f /Users/roarjang/otto/otto-server/logs/*.log
   ```

## 📌 중요 설정 체크리스트

GitHub App이 정상적으로 작동하려면 다음 설정이 모두 올바르게 구성되어야 합니다:

### GitHub App 설정 (https://github.com/settings/apps/[your-app-name])
- [ ] **Callback URL**: `https://yodwrmwzkghrpyuarhet.supabase.co/functions/v1/github-callback`
- [ ] **Webhook URL**: `https://yodwrmwzkghrpyuarhet.supabase.co/functions/v1/github-webhook/webhooks/github`
- [ ] **Request user authorization (OAuth) during installation**: ✅ 체크됨
- [ ] **권한 설정**: Repository permissions 설정 완료
- [ ] **이벤트 구독**: Push, Pull request, Installation 등 구독

### 환경 변수 설정
**Frontend (.env.development)**:
```env
NEXT_PUBLIC_GITHUB_APP_NAME=codecat-otto-dev
```

**Backend (.env)**:
```env
OTTO_GITHUB_APP_ID=[App ID]
OTTO_GITHUB_APP_PRIVATE_KEY=[Private Key]
OTTO_GITHUB_APP_CLIENT_ID=[Client ID]
OTTO_GITHUB_APP_CLIENT_SECRET=[Client Secret]
```

**Supabase Edge Function**:
- Edge Function이 배포되어 있고 접근 가능한지 확인
- 환경 변수가 Supabase 프로젝트에 설정되어 있는지 확인

### 설치 후 확인
1. GitHub App 설치 후 DB의 `github_installations` 테이블 확인
2. 프로젝트 생성 마법사에서 GitHub 저장소 목록이 표시되는지 확인
3. 문제 발생시 Supabase Edge Function 로그 확인
   ```

2. **Webhook 이벤트 확인**:

   - GitHub App 설정 페이지 → Advanced → Recent Deliveries
   - Installation 이벤트가 전송되었는지 확인

3. **데이터베이스 확인**:
   Supabase Dashboard에서 `github_installations` 테이블 확인

### 일반적인 문제:

1. **401 Unauthorized**: GitHub App Private Key가 잘못됨
2. **404 Not Found**: App ID가 잘못됨
3. **Installation not found**: App이 설치되지 않았거나 DB에 저장되지 않음

## 다음 단계

GitHub App 설치 후:

1. 프로젝트 생성 마법사에서 실제 GitHub 저장소 선택 가능
2. 저장소의 실제 브랜치 목록 조회 가능
3. CI/CD 파이프라인에서 실제 소스코드로 빌드 실행

## 참고 자료

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps)
- [Installing GitHub Apps](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app)
