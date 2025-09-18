"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";

export default function NotFound() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const { fetchProjects } = useProjectStore();
  const { fetchPipelines, getPipelinesByProject } = usePipelineStore();

  const handleGoHome = async () => {
    setRedirecting(true);
    
    try {
      // 프로젝트 목록 가져오기
      await fetchProjects();
      const projects = useProjectStore.getState().projects;
      
      if (projects.length > 0) {
        // 최신 프로젝트 선택
        const latestProject = projects.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })[0];
        
        // 파이프라인 가져오기
        const projectId = latestProject.projectId || latestProject.project_id!;
        await fetchPipelines(projectId);
        const pipelines = getPipelinesByProject(projectId);
        
        if (pipelines.length > 0) {
          const latestPipeline = pipelines.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })[0];
          
          // 파이프라인 에디터로 이동
          router.push(`/projects/${projectId}/pipelines/${latestPipeline.pipelineId}`);
        } else {
          router.push(`/projects/${projectId}/pipelines`);
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to navigate:", error);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 숫자 */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-4">
          404
        </h1>
        
        {/* 메시지 */}
        <h2 className="text-2xl font-bold text-white mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        
        <p className="text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나, 잘못된 경로입니다.
          <br />
          올바른 URL을 입력했는지 확인해주세요.
        </p>
        
        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            이전 페이지
          </button>
          
          <button
            onClick={handleGoHome}
            disabled={redirecting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redirecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                이동 중...
              </>
            ) : (
              <>
                <Home className="w-5 h-5" />
                워크스페이스로 이동
              </>
            )}
          </button>
        </div>
        
        {/* 추가 도움말 */}
        <div className="mt-12 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            자주 발생하는 문제:
          </p>
          <ul className="mt-2 text-sm text-gray-500 text-left list-disc list-inside space-y-1">
            <li>프로젝트 또는 파이프라인 ID가 잘못됨</li>
            <li>삭제된 프로젝트나 파이프라인에 접근</li>
            <li>URL 오타 또는 잘못된 경로</li>
          </ul>
        </div>
      </div>
    </div>
  );
}