"use client";

import { Cpu, Zap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CICDFlowVisualization from "@/components/landing/CICDFlowVisualization";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import ProjectCreationWizard from "@/components/projects/ProjectCreationWizard";
import { createClient } from "@/lib/supabase/client";
import apiClient from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchProjects } = useProjectStore();
  const { fetchPipelines, getPipelinesByProject } = usePipelineStore();

  // 페이지 로드 시에는 자동 라우팅 하지 않음 - 랜딩 페이지 유지
  useEffect(() => {
  }, []);

  const navigateToWorkspace = async () => {
    try {
      console.log('[Home] Navigating to workspace...');
      
      // 1. 프로젝트 조회
      await fetchProjects();
      
      // projects가 비동기로 업데이트되므로 store에서 직접 가져오기
      const currentProjects = useProjectStore.getState().projects;
      console.log('[Home] Current projects:', currentProjects);
      
      if (currentProjects.length === 0) {
        console.log('[Home] No projects found, showing creation wizard');
        // 프로젝트가 없으면 생성 마법사 표시
        setShowCreateWizard(true);
        setIsLoading(false);
        return;
      }

      // 2. 최근 생성된 프로젝트 선택 (created_at 기준 정렬)
      const latestProject = currentProjects.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // 최신순
      })[0];
      
      console.log('[Home] Latest project:', latestProject);
      
      // 3. 해당 프로젝트의 파이프라인 조회
      console.log('[Home] Fetching pipelines for project:', latestProject.project_id);
      await fetchPipelines(latestProject.project_id);
      
      // Store에서 직접 가져오기 (비동기 업데이트 대기)
      await new Promise(resolve => setTimeout(resolve, 500)); // 잠시 대기
      const pipelines = getPipelinesByProject(latestProject.project_id);
      console.log('[Home] Pipelines for latest project:', pipelines);
      console.log('[Home] Number of pipelines:', pipelines.length);
      
      if (pipelines.length === 0) {
        console.log('[Home] No pipelines found, navigating to pipelines page');
        // 파이프라인이 없으면 파이프라인 페이지로
        router.push(`/projects/${latestProject.project_id}/pipelines`);
        return;
      }

      // 4. 최근 생성된 파이프라인 선택 (created_at 기준 정렬)
      const latestPipeline = pipelines.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // 최신순
      })[0];
      
      console.log('[Home] Latest pipeline:', latestPipeline);

      // 5. 파이프라인 에디터로 이동
      // undefined 체크 추가 - 파이프라인 ID가 없으면 파이프라인 목록으로 이동
      if (latestPipeline?.pipeline_id) {
        router.push(`/projects/${latestProject.project_id}/pipelines/${latestPipeline.pipeline_id}`);
      } else {
        // 파이프라인 ID가 없으면 파이프라인 목록 페이지로 이동
        router.push(`/projects/${latestProject.project_id}/pipelines`);
      }
    } catch (error) {
      console.error('[Home] Navigation error:', error);
      setIsLoading(false);
      // 에러 발생 시 프로젝트 목록으로
      router.push('/projects');
    }
  };

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      console.log('[Home] Get started clicked');
      
      // 1. 로그인 확인
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 회원가입 페이지로 이동
        router.push('/signup');
        return;
      }

      // 2. 토큰 설정
      if (session.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      // 3. GitHub App 설치 확인
      console.log('[Home] Checking GitHub installation...');
      const installResponse = await apiClient.getGitHubInstallations();
      const installations = installResponse.data?.installations || [];
      
      if (installations.length === 0) {
        console.log('[Home] No GitHub installation found, redirecting to onboarding');
        // GitHub App 미설치 - 온보딩으로
        router.push('/onboarding');
        return;
      }

      // 4. GitHub App 설치됨 - 워크스페이스로 네비게이션
      await navigateToWorkspace();
    } catch (error) {
      console.error("[Home] Failed to get started:", error);
      // 에러 발생 시 온보딩으로
      router.push('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = async (projectData?: { 
    projectId: string;
    project_id?: string; 
    name: string; 
    targetUrl?: string 
  }) => {
    console.log('[Home] Project created:', projectData);
    setShowCreateWizard(false);
    
    // targetUrl이 제공되면 해당 URL로, 아니면 동적 라우팅
    if (projectData?.targetUrl) {
      router.push(projectData.targetUrl);
    } else if (projectData?.projectId || projectData?.project_id) {
      const projectId = projectData.projectId || projectData.project_id!;
      // 프로젝트 생성 완료 후 파이프라인 체크
      try {
        await fetchPipelines(projectId);
        const pipelines = getPipelinesByProject(projectId);
        
        if (pipelines.length > 0) {
          const latestPipeline = pipelines[0];
          router.push(`/projects/${projectId}/pipelines/${latestPipeline.pipeline_id}`);
        } else {
          router.push(`/projects/${projectId}/pipelines`);
        }
      } catch (error) {
        console.error("Failed to navigate after project creation:", error);
        router.push(`/projects/${projectId}/pipelines`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Header */}
      <AnimatedSection direction="down" className="relative z-50 w-full">
        <header className="w-full">
          <div className="container px-4 py-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-3 rounded-2xl shadow-lg shadow-purple-500/25 ring-2 ring-white/10">
                  <Cpu className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent tracking-tight">
                  Otto
                </span>
              </div>
            </div>
          </div>
        </header>
      </AnimatedSection>

      {/* Main Content - Centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Title */}
          <AnimatedSection delay={50}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                CI/CD 파이프라인
              </span>
              <br />
              <span className="text-white">블록으로 해결하다</span>
            </h1>
          </AnimatedSection>

          {/* Description */}
          <AnimatedSection delay={100}>
            <p className="text-xl sm:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
              답답한 타이핑에서 벗어나세요.
              <br className="hidden sm:block" />
              여러분만의 CI/CD 파이프라인을 구상하세요.
            </p>
          </AnimatedSection>

          {/* CI/CD Flow Visualization */}
          <AnimatedSection delay={150}>
            <CICDFlowVisualization />
          </AnimatedSection>

          {/* CTA Button */}
          <AnimatedSection delay={200}>
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="relative inline-flex group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 items-center gap-3 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    지금 시작하기
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* Simple Footer */}
      <AnimatedSection delay={400} direction="up" className="relative z-10">
        <footer className="py-6 text-center text-gray-600 text-sm">
          <p>&copy; 2025 Otto. All rights reserved.</p>
        </footer>
      </AnimatedSection>

      {/* Project Creation Wizard */}
      <ProjectCreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
