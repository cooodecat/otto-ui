'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

export default function TestGitHubPage() {
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    checkGitHubInstallations();
  }, []);

  const checkGitHubInstallations = async () => {
    try {
      // Supabase 토큰 설정
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // GitHub Installations 조회
      const response = await apiClient.getGithubInstallations();
      
      console.log('GitHub Installations Response:', response);
      setRawResponse(response.data); // 디버깅용 raw 데이터 저장
      
      if (response.error) {
        setError(response.error);
      } else {
        // 응답이 배열인지 객체인지 확인
        const data = response.data;
        if (Array.isArray(data)) {
          setInstallations(data);
        } else if (data && typeof data === 'object') {
          // 객체인 경우 installations 필드 확인
          const installationsList = data.installations || data.data || [];
          setInstallations(Array.isArray(installationsList) ? installationsList : []);
        } else {
          setInstallations([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GitHub App Installation 상태 확인</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">서버 정보:</h2>
        <p className="text-sm">API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2">GitHub Installation 확인 중...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold">에러 발생:</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Raw Response 디버깅 정보 */}
          {rawResponse && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">API 응답 (디버깅):</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
          
          <h2 className="text-xl font-semibold mb-4">
            Installations 수: {installations.length}
          </h2>
          
          {installations.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-yellow-900 font-semibold">GitHub App이 설치되지 않음</h3>
              <p className="text-yellow-700 mt-2">
                GitHub App을 설치하려면:
              </p>
              <ol className="list-decimal list-inside mt-2 text-sm text-yellow-700">
                <li>GitHub App 페이지 방문: <a href="https://github.com/apps/codecat-otto-dev" target="_blank" rel="noopener noreferrer" className="underline text-yellow-800">https://github.com/apps/codecat-otto-dev</a></li>
                <li>Install 버튼 클릭</li>
                <li>저장소 접근 권한 설정</li>
                <li>설치 완료 후 이 페이지 새로고침</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              {installations.map((installation: any, index: number) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold">Installation #{installation.id}</h3>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(installation, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={checkGitHubInstallations}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          다시 확인
        </button>
      </div>
    </div>
  );
}