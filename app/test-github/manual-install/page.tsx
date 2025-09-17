'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ManualInstallPage() {
  const [installationId, setInstallationId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveInstallation = async () => {
    if (!installationId) {
      toast.error('Installation ID를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // Supabase에 직접 Installation 저장
      const { data, error } = await supabase
        .from('github_installations')
        .insert({
          installation_id: installationId,
          user_id: session.user.id,
          account_login: session.user.user_metadata?.user_name || 'unknown',
          account_type: 'User',
          repository_selection: 'selected',
          is_active: true,
          permissions: {},
          events: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving installation:', error);
        toast.error('Installation 저장 실패: ' + error.message);
      } else {
        console.log('Installation saved:', data);
        toast.success('Installation이 저장되었습니다!');
        setInstallationId('');
      }
    } catch (error) {
      console.error('Failed to save installation:', error);
      toast.error('오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GitHub App Installation 수동 등록</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-900 font-semibold mb-2">임시 해결 방법</h3>
        <p className="text-yellow-700 text-sm">
          Webhook이 구현되지 않아 Installation을 수동으로 등록해야 합니다.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Installation ID 찾는 방법:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-6">
          <li>
            GitHub 설정 페이지 방문:{' '}
            <a 
              href="https://github.com/settings/apps/codecat-otto-dev/installations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline"
            >
              https://github.com/settings/apps/codecat-otto-dev/installations
            </a>
          </li>
          <li>설치된 Installation 클릭 (예: roarjang)</li>
          <li>URL에서 Installation ID 확인</li>
          <li>예: https://github.com/settings/installations/<strong>12345678</strong></li>
        </ol>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Installation ID</label>
            <input
              type="text"
              value={installationId}
              onChange={(e) => setInstallationId(e.target.value)}
              placeholder="예: 12345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSaveInstallation}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '저장 중...' : 'Installation 저장'}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a 
          href="/test-github"
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          저장 후 Installation 확인하기 →
        </a>
      </div>
    </div>
  );
}