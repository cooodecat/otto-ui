import { Suspense } from 'react';
import PipelineLogsPage from '@/components/logs/PipelineLogs/PipelineLogsPage';

/**
 * 독립적인 Logs 페이지
 * 
 * 프로젝트와 무관하게 전체 파이프라인 로그를 표시
 * 모든 프로젝트의 로그를 통합하여 관리
 * 
 * URL 파라미터를 통해 필터링 지원:
 * - /logs - 모든 로그
 * - /projects/[projectId]/logs - 프로젝트별 로그
 * - /projects/[projectId]/pipelines/[pipelineId]/logs - 파이프라인별 로그
 */
export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">로그 로딩 중...</span>
            </div>
          </div>
        }>
          <PipelineLogsPage 
            projectId={params?.projectId}
          />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Pipeline Logs | Otto UI',
  description: '모든 파이프라인 빌드 로그 보기 및 관리',
};