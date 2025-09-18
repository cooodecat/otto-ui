'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function GitHubInstallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    setUserId(user.id);
  };

  const handleInstallGitHub = () => {
    if (!userId) {
      alert('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    // state 파라미터 생성
    const stateData = {
      userId: userId,
      returnUrl: '/projects',
      timestamp: Date.now()
    };
    const state = btoa(JSON.stringify(stateData));

    // GitHub App 설치 URL 생성
    const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'codecat-otto-prod';
    const installUrl = `https://github.com/apps/${appName}/installations/new?state=${encodeURIComponent(state)}`;
    
    // GitHub App 설치 페이지로 이동
    window.location.href = installUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-purple-100 p-4 rounded-full">
            <Github className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">
          GitHub App 설치
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Otto가 GitHub 저장소에 접근하려면 GitHub App 설치가 필요합니다.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-700">실제 GitHub 저장소 연동</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-700">브랜치 자동 감지</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-700">실제 코드로 CI/CD 빌드</p>
          </div>
        </div>

        {userId ? (
          <button
            onClick={handleInstallGitHub}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                GitHub로 이동 중...
              </>
            ) : (
              <>
                <Github className="w-5 h-5" />
                GitHub App 설치하기
              </>
            )}
          </button>
        ) : (
          <div className="text-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            사용자 정보 확인 중...
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  );
}