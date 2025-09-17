import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // UUID 패턴 정의 (간단한 검증)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // 프로젝트 관련 경로 패턴
  const projectPattern = /^\/projects\/([^\/]+)(\/.*)?$/;
  const match = pathname.match(projectPattern);
  
  if (match) {
    const projectId = match[1];
    const subPath = match[2];
    
    // 프로젝트 ID가 UUID 형식이 아닌 경우
    if (!uuidPattern.test(projectId)) {
      console.log('[Middleware] Invalid project UUID format:', projectId);
      // 404 페이지로 리다이렉트 (Next.js가 자동으로 not-found.tsx를 보여줌)
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    
    // 파이프라인 경로 검증
    if (subPath) {
      const pipelinePattern = /^\/pipelines\/([^\/]+)(\/.*)?$/;
      const pipelineMatch = subPath.match(pipelinePattern);
      
      if (pipelineMatch) {
        const pipelineId = pipelineMatch[1];
        
        // 파이프라인 ID가 UUID 형식이 아닌 경우
        if (!uuidPattern.test(pipelineId)) {
          console.log('[Middleware] Invalid pipeline UUID format:', pipelineId);
          return NextResponse.rewrite(new URL('/not-found', request.url));
        }
      }
    }
  }
  
  // Supabase 세션 업데이트 및 기본 미들웨어 처리
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/v1 (Supabase auth endpoints)
     * - api/ (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/v1|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
