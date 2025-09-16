import { Suspense } from 'react';
import TestRealApiContent from './TestRealApiContent';

/**
 * Real API Integration Test Page
 * 
 * 실제 Nest.js 백엔드 서버와의 API 연동 테스트 페이지
 * SSE 실시간 로그 스트리밍 및 CloudWatch 로그 수집 테스트
 */
export default function TestRealApiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading real API test...</span>
        </div>
      </div>
    }>
      <TestRealApiContent />
    </Suspense>
  );
}