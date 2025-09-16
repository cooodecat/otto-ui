import { Suspense } from 'react';
import { PipelineLogsPage } from '@/components/logs';

/**
 * Logs Page
 * 
 * 파이프라인 로그 메인 페이지
 */
export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading logs...</span>
            </div>
          </div>
        }>
          <PipelineLogsPage />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Pipeline Logs | Otto UI',
  description: 'View and manage pipeline build logs with filtering and search capabilities',
};