import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserProfile from "@/components/auth/UserProfile";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/landing");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  Otto UI Dashboard
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                CI/CD 파이프라인 대시보드
              </h2>
              <p className="text-gray-600">
                실시간 CI/CD 파이프라인 실행 상태를 모니터링할 수 있습니다.
              </p>
            </div>


            {/* 기존 대시보드 정보 */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    사용자 정보
                  </h3>
                  <UserProfile />
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    대시보드 기능
                  </h3>
                  <div className="mt-4">
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✅ GitHub OAuth 인증 완료</li>
                      <li>✅ 사용자 세션 관리</li>
                      <li>✅ 보호된 라우트 접근</li>
                      <li>✅ 미들웨어 기반 인증 검사</li>
                      <li>✅ 자동 로그아웃 기능</li>
                      <li>✅ CI/CD 파이프라인 모니터링</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-blue-50 overflow-hidden rounded-lg border border-blue-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        CI/CD 파이프라인 정보
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          위의 파이프라인은 실시간으로 실행 상태를
                          시뮬레이션합니다.
                        </p>
                        <p>
                          자동 재생 버튼을 클릭하여 파이프라인 진행을 제어할 수
                          있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
