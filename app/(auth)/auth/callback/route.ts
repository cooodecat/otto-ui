import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 사용자 인증 성공 후 프로젝트 데이터 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          // TODO: 실제 API 호출로 대체 예정
          // NOTE: 데이터베이스에서도 동일한 로직으로 최신 프로젝트/파이프라인 결정 예정
          // 현재는 Mock 데이터 기준으로 가장 최신 프로젝트/파이프라인으로 결정
          const latestProjectNumericId = "3"; // proj_3에 해당하는 숫자 ID
          const latestPipelineNumericId = "2"; // proj_3의 pipe_2 (가장 최신)

          // 가장 최신 프로젝트의 가장 최신 파이프라인으로 리다이렉트
          const redirectPath = `/projects/${latestProjectNumericId}/pipelines/${latestPipelineNumericId}`;

          const forwardedHost = request.headers.get("x-forwarded-host");
          const isLocalEnv = process.env.NODE_ENV === "development";

          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${redirectPath}`);
          } else if (forwardedHost) {
            return NextResponse.redirect(
              `https://${forwardedHost}${redirectPath}`
            );
          } else {
            return NextResponse.redirect(`${origin}${redirectPath}`);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // 에러 발생시 기본 경로로 리다이렉트 (가장 최신 프로젝트/파이프라인)
          return NextResponse.redirect(`${origin}/projects/3/pipelines/2`);
        }
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
