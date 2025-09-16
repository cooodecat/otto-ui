'use client';

import React, { useState } from 'react';
import { FilterPanel } from '@/components/logs';
import { PipelineLogsPage } from '@/components/logs';
import { FilterState } from '@/types/logs';

export default function TestCombinedContent() {
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('🔍 Filters applied:', newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Combined Test - Logs Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                FilterPanel과 PipelineLogsPage의 완전한 통합 테스트
              </p>
            </div>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 사이드바 - FilterPanel */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <FilterPanel
                onFiltersChange={handleFiltersChange}
                initialFilters={{
                  timeline: 'all-time',
                  status: 'any-status'
                }}
              />
              
              {/* 디버그 패널 */}
              {showDebugPanel && (
                <div className="mt-6 bg-gray-900 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-white mb-3">🐛 Debug Info</h3>
                  <div className="text-xs text-green-400 font-mono">
                    <div className="mb-2">
                      <span className="text-gray-400">Current URL:</span>
                      <br />
                      {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400">Filter State:</span>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {filters ? JSON.stringify(filters, null, 2) : 'null'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp:</span>
                      <br />
                      {new Date().toISOString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 메인 컨텐츠 - PipelineLogsPage */}
          <div className="flex-1 min-w-0">
            <PipelineLogsPage />
          </div>
        </div>
      </div>

      {/* 테스트 가이드 (하단 고정) */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">🧪 Integration Tests</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 필터 변경 시 URL 업데이트 확인</li>
            <li>• 페이지 새로고침 시 필터 상태 유지</li>
            <li>• 로그 테이블과 필터 패널 독립 동작</li>
            <li>• 반응형 레이아웃 (사이드바 + 메인)</li>
            <li>• 스크롤 성능 및 Sticky 동작</li>
            <li>• 키보드 네비게이션 및 접근성</li>
          </ul>
        </div>
      </div>

      {/* 성능 모니터링 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black text-white text-xs px-3 py-2 rounded-lg font-mono">
          <div>🚀 Dev Mode</div>
          <div>React: {React.version}</div>
          <div>Next.js: 15.5.3</div>
        </div>
      )}
    </div>
  );
}