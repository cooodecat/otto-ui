"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProjectList from "@/components/projects/ProjectList";
import GitHubRepositoryList from "@/components/projects/GitHubRepositoryList";
import StepByStepProjectWizard from "@/components/projects/StepByStepProjectWizard";
import { setApiToken } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { GitHubInstallation, GitHubRepository } from "@/types/api";

type ViewMode = "projects" | "repositories" | "wizard";

export default function ProjectsPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("projects");

  // 프로젝트 생성 마법사 상태
  const [selectedInstallation, setSelectedInstallation] =
    useState<GitHubInstallation | null>(null);
  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);

  const searchParams = useSearchParams();
  const supabase = createClient();

  // URL 파라미터에서 GitHub 설치 관련 정보 확인
  useEffect(() => {
    const status = searchParams.get("status");
    const githubInstalled = searchParams.get("github_installed");
    const openModal = searchParams.get("open_modal");
    const installationId = searchParams.get("installation_id");
    const accountLogin = searchParams.get("account_login");

    if (status === "success" && githubInstalled === "true") {
      // GitHub 설치 성공 알림
      console.log(
        `GitHub 앱 설치가 완료되었습니다. 계정: ${accountLogin}, 설치 ID: ${installationId}`
      );

      // URL 파라미터 정리 (새로고침 시 다시 알림이 뜨지 않도록)
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      url.searchParams.delete("github_installed");
      url.searchParams.delete("open_modal");
      url.searchParams.delete("installation_id");
      url.searchParams.delete("account_login");
      window.history.replaceState({}, "", url.toString());
    }

    if (openModal === "true") {
      // 프로젝트 생성 모달 자동으로 열기 (미래 기능)
      console.log("프로젝트 생성 모달을 열어야 합니다.");
    }
  }, [searchParams]);

  // 인증 상태 확인 및 API 토큰 설정
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          setApiToken(session.access_token);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // 인증되지 않은 경우 로그인 페이지로 리다이렉트
          window.location.href = "/auth/login";
        }
      } catch (error) {
        console.error("인증 확인 중 오류:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setApiToken(session.access_token);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 레포지토리 선택 시 마법사 모드로 전환
  const handleRepositorySelect = (
    installation: GitHubInstallation,
    repository: GitHubRepository
  ) => {
    setSelectedInstallation(installation);
    setSelectedRepository(repository);
    setViewMode("wizard");
  };

  // 마법사 완료 시 프로젝트 목록으로 돌아가기
  const handleWizardComplete = () => {
    setViewMode("projects");
    setSelectedInstallation(null);
    setSelectedRepository(null);
  };

  // 마법사 취소 시 이전 화면으로
  const handleWizardCancel = () => {
    setViewMode("repositories");
    setSelectedInstallation(null);
    setSelectedRepository(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {viewMode === "projects" && "프로젝트"}
                {viewMode === "repositories" && "GitHub 저장소"}
                {viewMode === "wizard" && "프로젝트 생성"}
              </h1>
              <p className="text-gray-600 mt-1">
                {viewMode === "projects" &&
                  "GitHub 저장소와 연결된 CI/CD 프로젝트를 관리하세요."}
                {viewMode === "repositories" &&
                  "프로젝트로 연결할 저장소를 선택하세요."}
                {viewMode === "wizard" && "단계별로 새 프로젝트를 생성하세요."}
              </p>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("projects")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "projects"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                내 프로젝트
              </button>
              <button
                onClick={() => setViewMode("repositories")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "repositories"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                새 프로젝트
              </button>
            </div>
          </div>

          {/* 검색바 (프로젝트 목록에서만 표시) */}
          {viewMode === "projects" && (
            <div className="mt-4">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 뷰 모드별 콘텐츠 */}
        {viewMode === "projects" && <ProjectList searchTerm={searchTerm} />}

        {viewMode === "repositories" && (
          <GitHubRepositoryList onRepositorySelect={handleRepositorySelect} />
        )}

        {viewMode === "wizard" &&
          selectedInstallation &&
          selectedRepository && (
            <StepByStepProjectWizard
              installation={selectedInstallation}
              repository={selectedRepository}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          )}
      </div>
    </div>
  );
}