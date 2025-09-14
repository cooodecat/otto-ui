import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // 개발 환경에서만 디버깅 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth callback debug:', {
        origin,
        code: code?.substring(0, 10) + '...',
        error: error?.message,
        NODE_ENV: process.env.NODE_ENV,
        APP_URL: process.env.NEXT_PUBLIC_APP_URL
      })
    }

    if (!error) {
      // 프로덕션 URL이 환경 변수로 설정되어 있으면 사용
      const productionUrl = process.env.NEXT_PUBLIC_APP_URL

      if (productionUrl) {
        // 명시적으로 설정된 프로덕션 URL 사용
        return NextResponse.redirect(`${productionUrl}${next}`)
      }

      // Fallback: 기존 로직
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}