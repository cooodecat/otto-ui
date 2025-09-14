# Otto 프로젝트 백엔드 연동 가이드

이 문서는 **백엔드 개발자**를 위한 `otto-handler` (NestJS) 프로젝트 구현 가이드입니다.  
프론트엔드 `otto-ui` (Next.js)와의 연동을 위한 모든 필요한 정보를 포함합니다.

## 📋 **프로젝트 개요**

### 🏗️ **아키텍처**

```
┌─────────────────┐    JWT Token    ┌─────────────────┐
│   otto-ui       │ ──────────────► │   otto-handler  │
│   (Next.js)     │                 │   (NestJS)      │
│                 │                 │                 │
│ • Supabase Auth │                 │ • API Server    │
│ • UI Components │                 │ • JWT Verify    │
│ • API Client    │                 │ • Business Logic│
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Supabase      │                 │   PostgreSQL    │
│   (Auth Only)   │                 │   (Data)        │
└─────────────────┘                 └─────────────────┘
```

### 🔐 **인증 흐름**

1. **사용자** → GitHub OAuth 로그인
2. **Supabase** → JWT 토큰 발급
3. **프론트엔드** → JWT 토큰으로 백엔드 API 호출
4. **백엔드** → JWT 토큰 검증 후 비즈니스 로직 실행

### 📁 **역할 분리**

| 구분       | otto-ui (프론트엔드)             | otto-handler (백엔드)                            |
| ---------- | -------------------------------- | ------------------------------------------------ |
| **책임**   | UI/UX, Supabase 인증, API 호출   | NestJS API, JWT 검증, 비즈니스 로직, 데이터 관리 |
| **기술**   | Next.js 15, React 19, TypeScript | NestJS, PostgreSQL, TypeScript                   |
| **인증**   | Supabase OAuth (GitHub)          | JWT 토큰 검증                                    |
| **데이터** | API 호출만                       | 직접 DB 접근                                     |

## 🚀 **현재 프론트엔드 구현 상태**

### ✅ **이미 구현된 것들**

1. **Supabase 인증 설정**

   - GitHub OAuth 로그인 구현
   - JWT 토큰 관리
   - 인증 상태 관리 (`AuthProvider`)

2. **API 클라이언트 구현**

   - `lib/api.ts`: 백엔드 API 호출용 HTTP 클라이언트
   - `types/api.ts`: API 요청/응답 타입 정의
   - JWT 토큰 자동 헤더 설정

3. **UI 컴포넌트**
   - 랜딩 페이지 (`app/page.tsx` - 루트 경로)
   - 인증 컴포넌트 (`components/auth/`)
   - 대시보드 페이지 (`app/dashboard/`)

### 📋 **백엔드에서 가져가야 할 정보**

#### 1. **환경 변수 (프론트엔드용)**

```env
# Supabase 설정 (인증용)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 백엔드 API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

#### 2. **Supabase 프로젝트 정보**

- **Project URL**: `https://your-project.supabase.co`
- **API Key (anon)**: Supabase 대시보드에서 확인
- **JWT Secret**: Supabase 대시보드 → Settings → API에서 확인

#### 3. **GitHub OAuth 설정**

- **Client ID**: GitHub OAuth App의 Client ID
- **Client Secret**: GitHub OAuth App의 Client Secret
- **Callback URL**: `https://your-project.supabase.co/auth/v1/callback`

## 🎯 **백엔드 개발자가 해야 할 일**

### 📋 **1단계: NestJS 프로젝트 초기 설정**

```bash
# NestJS 프로젝트 생성
nest new otto-handler
cd otto-handler

# 필요한 패키지 설치
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @supabase/supabase-js
npm install class-validator class-transformer
```

### 📋 **2단계: 환경 변수 설정**

백엔드 프로젝트 루트에 `.env` 파일 생성:

```env
# Supabase 설정
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret

# 데이터베이스 설정
DATABASE_URL=postgresql://username:password@localhost:5432/otto_db

# 서버 설정
PORT=4000
NODE_ENV=development

# CORS 설정
FRONTEND_URL=http://localhost:3000
```

### 📋 **3단계: JWT 인증 가드 구현**

```typescript
// src/auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase;

  constructor(private jwtService: JwtService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      // Supabase JWT 토큰 검증
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException("Invalid token");
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Token verification failed");
    }
  }
}
```

### 📋 **4단계: 필요한 API 엔드포인트 구현**

프론트엔드에서 호출할 API들을 구현해야 합니다:

#### **사용자 관련 API**

- `GET /api/user/profile` - 사용자 프로필 조회
- `PUT /api/user/profile` - 사용자 프로필 업데이트

#### **파이프라인 관련 API**

- `GET /api/pipelines` - 사용자의 모든 파이프라인 조회
- `POST /api/pipelines` - 새 파이프라인 생성
- `GET /api/pipelines/:id` - 특정 파이프라인 조회
- `PUT /api/pipelines/:id` - 파이프라인 업데이트
- `DELETE /api/pipelines/:id` - 파이프라인 삭제
- `GET /api/pipelines/:id/steps` - 파이프라인 스텝 조회
- `PUT /api/pipelines/:id/steps` - 파이프라인 스텝 상태 업데이트

### 📋 **5단계: 데이터베이스 스키마 설정**

PostgreSQL 데이터베이스에 다음 스키마를 생성합니다:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pipeline_steps table
CREATE TABLE IF NOT EXISTS public.pipeline_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for pipelines table
CREATE POLICY "Users can view own pipelines" ON public.pipelines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pipelines" ON public.pipelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipelines" ON public.pipelines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pipelines" ON public.pipelines
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for pipeline_steps table
CREATE POLICY "Users can view pipeline steps for own pipelines" ON public.pipeline_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_steps.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pipeline steps for own pipelines" ON public.pipeline_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_steps.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pipeline steps for own pipelines" ON public.pipeline_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_steps.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pipeline steps for own pipelines" ON public.pipeline_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_steps.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_steps_updated_at
  BEFORE UPDATE ON public.pipeline_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 📋 **6단계: CORS 설정**

NestJS에서 프론트엔드 도메인을 허용하도록 설정:

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
```

### 📋 **7단계: API 응답 형식 통일**

프론트엔드에서 기대하는 응답 형식을 맞춰야 합니다:

```typescript
// 응답 인터페이스
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// 성공 응답 예시
{
  "data": {
    "id": "uuid",
    "name": "Pipeline Name",
    "status": "running"
  }
}

// 에러 응답 예시
{
  "error": {
    "message": "Pipeline not found",
    "code": "PIPELINE_NOT_FOUND"
  }
}
```

## 🔧 **프론트엔드 연동 정보**

### **API 클라이언트 사용법**

프론트엔드에서는 다음과 같이 백엔드 API를 호출합니다:

```typescript
// 1. JWT 토큰 설정
import { setApiToken } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const {
  data: { session },
} = await supabase.auth.getSession();

if (session?.access_token) {
  setApiToken(session.access_token); // 백엔드에서 이 토큰을 검증해야 함
}

// 2. API 호출
import { useApi } from "@/lib/api";
const api = useApi();

const { data: pipelines, error } = await api.getPipelines();
```

### **요청 헤더 형식**

```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### **기대하는 엔드포인트**

프론트엔드에서 호출하는 모든 API는 `http://localhost:4000/api/` 경로로 시작해야 합니다.

## 📚 **상세 API 명세**

### **사용자 관련 API**

#### `GET /api/user/profile`

- **목적**: 현재 로그인한 사용자의 프로필 정보 조회
- **인증**: JWT 토큰 필요
- **응답**: 사용자 정보 (id, email, name, avatar_url 등)

#### `PUT /api/user/profile`

- **목적**: 사용자 프로필 정보 업데이트
- **인증**: JWT 토큰 필요
- **요청 본문**: `{ name?: string, avatar_url?: string }`

### **파이프라인 관련 API**

#### `GET /api/pipelines`

- **목적**: 현재 사용자의 모든 파이프라인 목록 조회
- **인증**: JWT 토큰 필요
- **응답**: 파이프라인 배열

#### `POST /api/pipelines`

- **목적**: 새 파이프라인 생성
- **인증**: JWT 토큰 필요
- **요청 본문**: `{ name: string, description?: string }`

#### `GET /api/pipelines/:id`

- **목적**: 특정 파이프라인 상세 정보 조회
- **인증**: JWT 토큰 필요
- **응답**: 파이프라인 상세 정보

#### `PUT /api/pipelines/:id`

- **목적**: 파이프라인 정보 업데이트
- **인증**: JWT 토큰 필요
- **요청 본문**: `{ name?: string, description?: string, status?: string }`

#### `DELETE /api/pipelines/:id`

- **목적**: 파이프라인 삭제
- **인증**: JWT 토큰 필요

#### `GET /api/pipelines/:id/steps`

- **목적**: 파이프라인의 모든 스텝 조회
- **인증**: JWT 토큰 필요
- **응답**: 파이프라인 스텝 배열

#### `PUT /api/pipelines/:id/steps`

- **목적**: 파이프라인 스텝 상태 업데이트
- **인증**: JWT 토큰 필요
- **요청 본문**: 스텝 업데이트 정보

## 🧪 **테스트 및 검증**

### **1단계: 백엔드 서버 테스트**

```bash
# 백엔드 서버 실행
cd otto-handler
npm run start:dev

# 서버가 4000 포트에서 실행되는지 확인
curl http://localhost:4000/api/user/profile
# 응답: {"error":{"message":"No token provided"}} (정상)
```

### **2단계: 프론트엔드 연동 테스트**

```bash
# 프론트엔드 서버 실행
cd otto-ui
pnpm dev

# 브라우저에서 http://localhost:3000 접속
# GitHub 로그인 후 대시보드로 이동되는지 확인
```

### **3단계: API 호출 테스트**

브라우저 개발자 도구에서 다음을 확인:

1. **네트워크 탭**: API 호출이 `http://localhost:4000/api/`로 가는지 확인
2. **콘솔**: 에러 메시지가 없는지 확인
3. **Application 탭**: JWT 토큰이 저장되어 있는지 확인

## 🚨 **문제 해결 가이드**

### **자주 발생하는 문제들**

#### 1. **CORS 에러**

```
Access to fetch at 'http://localhost:4000/api/pipelines'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결방법**: 백엔드에서 CORS 설정 확인

#### 2. **JWT 토큰 검증 실패**

```
{"error":{"message":"Invalid token"}}
```

**해결방법**:

- Supabase JWT Secret이 올바른지 확인
- 토큰 만료 시간 확인

#### 3. **API 엔드포인트 404**

```
{"error":{"message":"Cannot GET /api/pipelines"}}
```

**해결방법**: NestJS 라우터 설정 확인

### **디버깅 팁**

1. **백엔드 로그 확인**:

   ```bash
   # NestJS 서버 로그에서 요청/응답 확인
   npm run start:dev
   ```

2. **프론트엔드 네트워크 탭**:

   - 요청 헤더에 `Authorization: Bearer <token>` 있는지 확인
   - 응답 상태 코드 확인 (200, 401, 404 등)

3. **Supabase 대시보드**:
   - Authentication → Users에서 사용자 정보 확인
   - Logs에서 인증 관련 로그 확인

## 📋 **체크리스트**

백엔드 개발 완료 후 확인사항:

- [ ] NestJS 서버가 4000 포트에서 실행됨
- [ ] JWT 토큰 검증이 정상 작동함
- [ ] 모든 API 엔드포인트가 구현됨
- [ ] CORS 설정이 프론트엔드 도메인을 허용함
- [ ] 데이터베이스 스키마가 생성됨
- [ ] API 응답 형식이 프론트엔드와 일치함
- [ ] 에러 처리가 적절히 구현됨

## 🔄 **협업 워크플로우**

1. **프론트엔드 개발자**: API 클라이언트 구현 완료
2. **백엔드 개발자**: 이 문서를 참고하여 NestJS 서버 구현
3. **통합 테스트**: 양쪽 서버를 동시에 실행하여 연동 테스트
4. **배포**: 각각 독립적으로 배포 가능

## 📞 **지원 및 문의**

- **프론트엔드 관련**: `otto-ui` 프로젝트 담당자
- **백엔드 관련**: `otto-handler` 프로젝트 담당자
- **인증 관련**: Supabase 설정 문제 시 공동 해결
