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
                사용자 대시보드
              </h2>
              <p className="text-gray-600">사용자 정보를 확인할 수 있습니다.</p>
            </div>

            {/* 기존 대시보드 정보 */}
            <div className="grid gap-6 lg:grid-cols-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    사용자 정보
                  </h3>
                  <UserProfile />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
