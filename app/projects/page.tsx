"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectGrid from "@/components/projects/ProjectGrid";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectCreationWizard from "@/components/projects/ProjectCreationWizard";
import { useProjectStore } from "@/lib/projectStore";
import { createClient } from "@/lib/supabase/client";
import apiClient from "@/lib/api";
import { CheckCircle, X } from "lucide-react";

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, isLoading: loading, fetchProjects } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    initializeAuth();
    checkInstallationStatus();
  }, []);

  const initializeAuth = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      apiClient.setSupabaseToken(session.access_token);
    }

    fetchProjects();
  };

  const checkInstallationStatus = () => {
    // GitHub App 설치 완료 후 리다이렉트 처리
    const status = searchParams.get("status");
    const githubInstalled = searchParams.get("github_installed");
    const accountLogin = searchParams.get("account_login");
    const openModal = searchParams.get("open_modal");

    if (status === "success" && githubInstalled === "true") {
      setNotificationMessage(
        `GitHub App이 성공적으로 설치되었습니다${
          accountLogin ? ` (${accountLogin})` : ""
        }`
      );
      setNotificationType("success");
      setShowNotification(true);

      // 프로젝트 생성 모달 자동 오픈
      if (openModal === "true") {
        setTimeout(() => {
          setIsWizardOpen(true);
        }, 1500);
      }

      // URL 파라미터 정리
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      url.searchParams.delete("github_installed");
      url.searchParams.delete("account_login");
      url.searchParams.delete("open_modal");
      url.searchParams.delete("installation_id");
      window.history.replaceState({}, "", url.toString());
    } else if (status === "error") {
      const reason = searchParams.get("reason");
      let errorMessage = "GitHub App 설치 중 오류가 발생했습니다";

      switch (reason) {
        case "missing_state":
          errorMessage = "인증 상태 정보가 누락되었습니다. 다시 시도해주세요.";
          break;
        case "invalid_state":
          errorMessage = "잘못된 인증 상태입니다. 다시 시도해주세요.";
          break;
        case "missing_installation_id":
          errorMessage = "설치 정보가 누락되었습니다. 다시 시도해주세요.";
          break;
        case "github_api_failed":
          errorMessage =
            "GitHub API 연동에 실패했습니다. 잠시 후 다시 시도해주세요.";
          break;
        case "installation_failed":
          errorMessage = "설치 정보 저장에 실패했습니다. 다시 시도해주세요.";
          break;
      }

      setNotificationMessage(errorMessage);
      setNotificationType("error");
      setShowNotification(true);

      // URL 파라미터 정리
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleCreateProject = () => {
    setIsWizardOpen(true);
  };

  const handleProjectCreated = () => {
    fetchProjects();
    setIsModalOpen(false);
    setIsWizardOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 알림 메시지 */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in-right ${
            notificationType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notificationType === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span className="font-medium">{notificationMessage}</span>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-4 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <ProjectHeader onCreateProject={handleCreateProject} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              프로젝트가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 프로젝트를 생성하여 CI/CD 파이프라인을 구축해보세요
            </p>
            <button
              onClick={handleCreateProject}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              프로젝트 생성하기
            </button>
          </div>
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </div>

      {/* Project Creation Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Creation Wizard */}
      <ProjectCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
