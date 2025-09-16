import { Suspense } from 'react';
import TestCombinedContent from './TestCombinedContent';

/**
 * Combined Test Page
 * 
 * FilterPanel + PipelineLogsPage 통합 테스트 페이지
 * 실제 사용 시나리오와 동일한 레이아웃으로 구성
 */
export default function TestCombinedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading combined test...</span>
        </div>
      </div>
    }>
      <TestCombinedContent />
    </Suspense>
  );
}