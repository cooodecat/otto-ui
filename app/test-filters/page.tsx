import { Suspense } from 'react';
import TestFiltersContent from './TestFiltersContent';

/**
 * Filter Panel Test Page
 * 
 * FilterPanel 컴포넌트 단독 테스트용 페이지
 */
export default function TestFiltersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading test page...</span>
        </div>
      </div>
    }>
      <TestFiltersContent />
    </Suspense>
  );
}