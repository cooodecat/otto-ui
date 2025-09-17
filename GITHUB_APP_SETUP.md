# GitHub App 설치 가이드

## 현재 상태

- ✅ 백엔드 서버 실행 중
- ✅ Supabase 인증 작동
- ❌ GitHub App 미설치 (Installation 0개)
- ❌ GitHub 저장소 연동 불가

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
   Webhook URL: http://localhost:4000/api/v1/github/webhook
   Webhook secret: [안전한 랜덤 문자열]
   ```

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

1. 브라우저에서 `http://localhost:3000/test-github` 방문
2. "다시 확인" 버튼 클릭
3. Installation이 표시되면 성공!

## 트러블슈팅

### Installation이 여전히 0개인 경우:

1. **백엔드 로그 확인**:

   ```bash
   # 백엔드 서버 로그 확인
   tail -f /Users/roarjang/otto/otto-server/logs/*.log
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
