"use client";

import { Cpu, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CICDFlowVisualization from "@/components/landing/CICDFlowVisualization";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import { reverseMapId } from "@/lib/utils/idMapping";

export default function Home() {
  const [latestRoute, setLatestRoute] = useState("/projects/3/pipelines/2"); // 기본값: 가장 최신 예상 경로
  const { fetchProjects, getLatestProject } = useProjectStore();
  const { fetchPipelines, getLatestPipelineByProject } = usePipelineStore();

  useEffect(() => {
    const initializeLatestRoute = async () => {
      try {
        // 프로젝트 데이터 로드
        await fetchProjects();
        const latestProject = getLatestProject();

        if (latestProject) {
          // 해당 프로젝트의 파이프라인 데이터 로드
          await fetchPipelines(latestProject.projectId);
          const latestPipeline = getLatestPipelineByProject(
            latestProject.projectId
          );

          if (latestPipeline) {
            // NOTE: 데이터베이스에서도 동일한 로직으로 최신 프로젝트/파이프라인 결정 예정
            // Mock ID를 숫자 ID로 변환하여 URL 생성 (proj_3 -> 3, pipe_4 -> 4)
            const projectNumericId = reverseMapId(latestProject.projectId);
            const pipelineNumericId = reverseMapId(latestPipeline.pipelineId);

            setLatestRoute(
              `/projects/${projectNumericId}/pipelines/${pipelineNumericId}`
            );
          }
        }
      } catch (error) {
        console.error("Failed to load latest route:", error);
        // 에러 발생 시 기본값 유지
      }
    };

    initializeLatestRoute();
  }, [
    fetchProjects,
    getLatestProject,
    fetchPipelines,
    getLatestPipelineByProject,
  ]);

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
              <Link
                href={latestRoute}
                className="relative inline-flex group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 items-center gap-3 transform hover:scale-105"
              >
                <Zap className="w-6 h-6" />
                지금 시작하기
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
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
    </div>
  );
}
