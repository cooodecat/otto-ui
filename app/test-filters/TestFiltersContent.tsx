'use client';

import { useState } from 'react';
import { FilterPanel } from '@/components/logs';
import { FilterState } from '@/types/logs';

export default function TestFiltersContent() {
  const [filters, setFilters] = useState<FilterState | null>(null);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Filter Panel Test</h1>
          <p className="text-gray-600">
            FilterPanel 컴포넌트의 기능들을 테스트해보세요. URL 파라미터 동기화, 드롭다운, 리셋 등 모든 기능이 포함되어 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FilterPanel */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Panel</h2>
            <FilterPanel
              onFiltersChange={handleFiltersChange}
              initialFilters={{
                timeline: 'week',
                status: 'any-status'
              }}
            />
          </div>

          {/* 결과 표시 */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Results</h2>
            
            {/* 현재 필터 상태 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Filter State</h3>
              {filters ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Timeline:</span>
                      <span className="ml-2 text-sm text-gray-900">{filters.timeline}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className="ml-2 text-sm text-gray-900">{filters.status}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Trigger:</span>
                      <span className="ml-2 text-sm text-gray-900">{filters.trigger}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Branch:</span>
                      <span className="ml-2 text-sm text-gray-900">{filters.branch}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Author:</span>
                      <span className="ml-2 text-sm text-gray-900">{filters.author}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">필터를 변경하면 여기에 상태가 표시됩니다.</p>
              )}
            </div>

            {/* JSON 표시 */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">JSON Output</h3>
              <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                {filters ? JSON.stringify(filters, null, 2) : 'null'}
              </pre>
            </div>

            {/* 테스트 가이드 */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-4">🧪 Test Features</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>드롭다운 테스트:</strong> 각 필터 버튼을 클릭하여 옵션 선택</li>
                <li>• <strong>URL 동기화:</strong> 필터 변경 시 URL 파라미터 확인</li>
                <li>• <strong>Portal 렌더링:</strong> 드롭다운이 화면 밖으로 나가지 않는지 확인</li>
                <li>• <strong>외부 클릭:</strong> 드롭다운 외부를 클릭하면 닫히는지 확인</li>
                <li>• <strong>스크롤 테스트:</strong> 스크롤 시 드롭다운이 닫히는지 확인</li>
                <li>• <strong>리셋 기능:</strong> Reset Filters 버튼으로 초기 상태 복원</li>
                <li>• <strong>반응형:</strong> 브라우저 크기를 조절해보세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}