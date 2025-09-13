# 프론트엔드 설정 가이드

이 가이드는 Otto UI 프론트엔드 프로젝트를 `otto-handler` 백엔드(NestJS)와 연결하는 방법을 설명합니다.

## 아키텍처 개요

### 🔐 **인증 흐름**

1. **Supabase OAuth** → GitHub 로그인
2. **JWT 토큰** → 프론트엔드에서 백엔드 API 호출 시 사용
3. **NestJS 미들웨어** → JWT 토큰 검증 및 인증 처리

### 📁 **역할 분리**

- **프론트엔드 (otto-ui)**: UI/UX, Supabase 인증, 백엔드 API 호출
- **백엔드 (otto-handler)**: NestJS API, JWT 검증, 비즈니스 로직, 데이터 관리

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 다음 정보를 확인합니다:
   - Project URL
   - Project API Keys (anon public)

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Supabase 설정 (인증용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 백엔드 API 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**예시:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 3. 백엔드 프로젝트 설정

**⚠️ 중요: DB 스키마와 API는 `otto-handler` 백엔드 프로젝트에서 관리됩니다.**

### 백엔드 프로젝트에서 해야 할 일:

1. **NestJS API 서버 설계 및 구현**

   - 인증된 사용자만 접근 가능한 API 라우트
   - JWT 토큰 검증 미들웨어
   - 비즈니스 로직 및 데이터 관리

2. **JWT 토큰 검증 및 인증 미들웨어 작성**

   - Supabase JWT 토큰 검증
   - 토큰 만료/무효 시 요청 거부

3. **Supabase 인증 연동**
   - Supabase OAuth 기능을 백엔드에서 신뢰
   - 필요시 Supabase REST API 호출

### 프론트엔드에서는 다음만 필요:

- **Supabase 클라이언트 설정** (인증용)
- **JWT 토큰 기반 백엔드 API 호출** (`lib/api.ts`)
- **타입 안전한 API 클라이언트** (`types/api.ts`)

### 참고용 스키마 (백엔드에서 구현해야 함):

Supabase 대시보드의 SQL Editor에서 다음 스키마를 실행합니다:

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

## 4. GitHub OAuth 설정

### Supabase에서 GitHub OAuth 설정:

1. Supabase 대시보드 → Authentication → Providers
2. GitHub 제공자를 활성화
3. GitHub OAuth App 정보 입력:
   - **Client ID**: GitHub OAuth App의 Client ID
   - **Client Secret**: GitHub OAuth App의 Client Secret

### GitHub에서 OAuth App 생성:

1. GitHub → Settings → Developer settings → OAuth Apps
2. "New OAuth App" 클릭
3. 다음 정보 입력:
   - **Application name**: Otto UI
   - **Homepage URL**: `http://localhost:3000` (개발용)
   - **Authorization callback URL**: `https://your-supabase-project.supabase.co/auth/v1/callback`

## 5. API 엔드포인트

**⚠️ 중요: 다음 API들은 `otto-handler` 백엔드 프로젝트에서 구현됩니다.**

### 백엔드에서 구현해야 할 API들:

#### 사용자 관련

- `GET /api/user/profile` - 사용자 프로필 조회
- `PUT /api/user/profile` - 사용자 프로필 업데이트

#### 파이프라인 관련

- `GET /api/pipelines` - 사용자의 모든 파이프라인 조회
- `POST /api/pipelines` - 새 파이프라인 생성
- `GET /api/pipelines/[id]` - 특정 파이프라인 조회
- `PUT /api/pipelines/[id]` - 파이프라인 업데이트
- `DELETE /api/pipelines/[id]` - 파이프라인 삭제
- `GET /api/pipelines/[id]/steps` - 파이프라인 스텝 조회
- `PUT /api/pipelines/[id]/steps` - 파이프라인 스텝 상태 업데이트

#### 인증 관련

- `POST /api/auth/logout` - 로그아웃 (프론트엔드에서 구현됨)

### 프론트엔드에서 구현된 API:

- `POST /api/auth/logout` - Supabase 로그아웃 처리

## 6. JWT 토큰 사용 방법

### 프론트엔드에서 백엔드 API 호출 시:

```typescript
import { setApiToken, useApi } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// 1. Supabase에서 JWT 토큰 가져오기
const supabase = createClient();
const {
  data: { session },
} = await supabase.auth.getSession();

// 2. API 클라이언트에 토큰 설정
if (session?.access_token) {
  setApiToken(session.access_token);
}

// 3. 백엔드 API 호출
const api = useApi();
const { data: pipelines, error } = await api.getPipelines();
```

### 백엔드에서 JWT 토큰 검증:

```typescript
// NestJS 미들웨어 예시
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
```

## 7. 테스트

설정이 완료되면 다음을 테스트해보세요:

1. 개발 서버 실행: `pnpm dev`
2. `http://localhost:3000` 접속
3. "GitHub으로 로그인" 버튼 클릭
4. GitHub 인증 후 대시보드 페이지로 리다이렉트되는지 확인
5. 사용자 프로필이 올바르게 표시되는지 확인

## 7. 보안 고려사항

- `.env.local` 파일은 절대 버전 관리에 포함하지 마세요
- 프로덕션 환경에서는 GitHub OAuth App의 callback URL을 실제 도메인으로 변경하세요
- Supabase의 Row Level Security (RLS)가 활성화되어 있어 사용자는 자신의 데이터만 접근할 수 있습니다

## 8. 문제 해결

### 일반적인 문제들:

1. **환경 변수 오류**: `.env.local` 파일이 올바른 위치에 있고 값이 정확한지 확인
2. **OAuth 오류**: GitHub OAuth App의 callback URL이 Supabase 설정과 일치하는지 확인
3. **데이터베이스 오류**: SQL 스키마가 올바르게 실행되었는지 확인
4. **권한 오류**: Supabase 프로젝트의 API 키가 올바른지 확인

### 로그 확인:

- 브라우저 개발자 도구의 콘솔
- Next.js 개발 서버의 터미널 출력
- Supabase 대시보드의 로그 섹션

## 9. 향후 개선사항

### 권장하는 프로젝트 구조:

```
otto-backend/          # 백엔드 전용 프로젝트
├── supabase/
│   ├── migrations/    # DB 마이그레이션
│   ├── functions/     # Edge Functions
│   └── config.toml    # Supabase 설정
├── types/
│   └── database.ts    # DB 타입 정의
└── README.md

otto-ui/               # 프론트엔드 전용 프로젝트
├── app/
├── components/
├── lib/
│   └── supabase/      # 클라이언트만
└── types/
    └── database.ts    # 백엔드에서 생성된 타입 복사
```

이렇게 하면:

- 백엔드와 프론트엔드의 책임이 명확히 분리됩니다
- 각 프로젝트를 독립적으로 배포할 수 있습니다
- 팀 개발 시 역할 분담이 쉬워집니다
