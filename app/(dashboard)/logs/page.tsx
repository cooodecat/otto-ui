import { Suspense } from 'react';
import PipelineLogsPage from '@/components/logs/PipelineLogs/PipelineLogsPage';

/**
 * Dashboard Logs Page
 * 
 * 대시보드 레이아웃 내의 파이프라인 로그 페이지
 * 실제 Supabase 데이터를 조회합니다.
 */
export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8">
        {/* 로그 컨텐츠 */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">파이프라인 로그를 불러오는 중...</span>
            </div>
          </div>
        }>
          <PipelineLogsPage 
            useRealApi={true}
            projectId="all"
          />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Pipeline Logs | Otto Dashboard',
  description: 'Monitor pipeline builds, view detailed logs, and track build histories across all your projects',
};