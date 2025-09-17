"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/projectStore";
import { apiClient } from "@/lib/api";
import StepIndicator from "./StepIndicator";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import {
  WizardState,
  ProjectCreationWizardProps,
  Repository,
  Branch,
  ProjectConfig,
} from "./types";

// Mock data - 실제로는 GitHub API를 호출해야 합니다
const mockBranches: Branch[] = [
  {
    name: "main",
    commit: {
      sha: "abc123",
      message: "Initial commit",
      date: "2024-01-15",
      author: "John Doe",
    },
  },
  {
    name: "develop",
    commit: {
      sha: "def456",
      message: "Add new feature",
      date: "2024-01-14",
      author: "Jane Smith",
    },
  },
  {
    name: "feature/auth",
    commit: {
      sha: "ghi789",
      message: "Implement authentication",
      date: "2024-01-13",
      author: "Bob Johnson",
    },
  },
];

// Mock repository data
const mockRepository: Repository = {
  name: "",
  owner: "",
  description: "A modern web application built with Next.js",
  defaultBranch: "main",
  languages: {
    TypeScript: 65234,
    JavaScript: 23456,
    CSS: 12345,
    HTML: 5432,
  },
  updatedAt: "2일 전",
  stars: 128,
  forks: 24,
  visibility: "Public",
};

export default function ProjectCreationWizard({
  isOpen,
  onClose,
  repository: repoInfo,
}: ProjectCreationWizardProps) {
  const router = useRouter();
  const { createProject } = useProjectStore();

  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    repository: null,
    selectedBranch: "main",
    branches: [],
    projectConfig: {
      name: "",
      description: "",
    },
    validation: {
      isNameValid: false,
      nameError: null,
      isChecking: false,
    },
    isLoading: false,
    isCreating: false,
    createdProjectId: null,
    createdProjectNumericId: null,
  });

  const [error, setError] = useState<string | null>(null);

  // 프로젝트 이름 검증 (useEffect보다 먼저 정의)
  const validateProjectName = useCallback(async (name: string) => {
    setState((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        isChecking: true,
      },
    }));

    // 실제로는 API를 호출하여 중복 검사
    setTimeout(() => {
      const isValid =
        name.length >= 3 && name.length <= 50 && /^[a-z0-9-]+$/.test(name);
      const nameError = !isValid
        ? "프로젝트 이름 형식이 올바르지 않습니다"
        : null;

      setState((prev) => ({
        ...prev,
        validation: {
          isNameValid: isValid && !nameError,
          nameError,
          isChecking: false,
        },
      }));
    }, 500);
  }, []);

  // 저장소 정보 초기화
  useEffect(() => {
    if (isOpen && repoInfo) {
      const initialProjectName = repoInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      setState((prev) => ({
        ...prev,
        repository: {
          ...mockRepository,
          name: repoInfo.name,
          owner: repoInfo.owner,
          visibility: repoInfo.visibility,
        },
        projectConfig: {
          name: initialProjectName,
          description: mockRepository.description,
        },
        validation: {
          isNameValid: true, // 초기값은 유효하다고 가정
          nameError: null,
          isChecking: false,
        },
      }));

      // 초기 이름에 대한 유효성 검사 실행
      validateProjectName(initialProjectName);
    }
  }, [isOpen, repoInfo, validateProjectName]);

  // 브랜치 목록 로드
  const loadBranches = useCallback(async () => {
    if (!state.repository || !repoInfo?.installationId) {
      console.error("Repository or installationId not found");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      const response = await apiClient.getGitHubBranches(
        repoInfo.installationId.toString(),
        state.repository.owner,
        state.repository.name
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.branches) {
        const branches: Branch[] = response.data.branches
          .filter((branch: any) => branch.commit)
          .map((branch: any) => ({
            name: branch.name,
            commit: {
              sha: branch.commit.sha,
              message: branch.commit.commit?.message || "No message",
              date: branch.commit.commit?.author?.date
                ? new Date(
                    branch.commit.commit.author.date
                  ).toLocaleDateString()
                : "Unknown date",
              author: branch.commit.commit?.author?.name || "Unknown author",
            },
          }));

        setState((prev) => ({
          ...prev,
          branches,
          isLoading: false,
        }));
      } else {
        throw new Error("브랜치 데이터를 찾을 수 없습니다");
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
      setError(
        err instanceof Error ? err.message : "브랜치를 불러오는데 실패했습니다"
      );
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.repository, repoInfo?.installationId]);

  // 프로젝트 생성
  const handleCreateProject = async () => {
    setState((prev) => ({ ...prev, isCreating: true }));
    setError(null);

    try {
      // 실제로는 API를 호출하여 프로젝트 생성
      // URL에서 사용할 수 있는 숫자 ID 생성
      const numericProjectId = Math.floor(Math.random() * 1000) + 4; // 4번부터 시작 (기존 1,2,3 피하기)
      const newProject = {
        projectId: `proj_${numericProjectId}`,
        name: state.projectConfig.name,
        description: state.projectConfig.description,
        githubOwner: state.repository?.owner || "",
        githubRepoName: state.repository?.name || "",
        defaultBranch: state.selectedBranch,
        createdAt: new Date().toISOString(),
      };

      // Zustand store에 프로젝트 추가
      createProject(newProject);

      setState((prev) => ({
        ...prev,
        isCreating: false,
        createdProjectId: newProject.projectId,
        createdProjectNumericId: numericProjectId,
      }));
    } catch (err) {
      setError("프로젝트 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      setState((prev) => ({ ...prev, isCreating: false }));
    }
  };

  // 프로젝트로 이동
  const handleNavigateToProject = () => {
    if (state.createdProjectNumericId) {
      // 생성된 프로젝트로 이동 (첫 번째 파이프라인으로 이동)
      const projectId = state.createdProjectNumericId;
      const pipelineId = "1"; // 새 프로젝트의 첫 번째 파이프라인
      router.push(`/projects/${projectId}/pipelines/${pipelineId}`);
      onClose();
    }
  };

  // Step 이동
  const handleStepChange = (step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const handleNext = () => {
    if (state.currentStep < 3) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as 1 | 2 | 3,
      }));
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep - 1) as 1 | 2 | 3,
      }));
    }
  };

  // 취소 확인
  const handleClose = () => {
    if (state.createdProjectId) {
      onClose();
      return;
    }

    const confirmClose = window.confirm(
      "정말 취소하시겠습니까? 입력한 정보가 저장되지 않습니다."
    );
    if (confirmClose) {
      onClose();
    }
  };

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, state.createdProjectId]);

  if (!isOpen) return null;

  // 다음 버튼 활성화 조건
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.selectedBranch !== "";
      case 2:
        // 이름이 있고, 검사 중이 아니며, (유효하거나 아직 검사하지 않은 경우)
        return (
          state.projectConfig.name.length > 0 &&
          !state.validation.isChecking &&
          (state.validation.isNameValid || state.validation.nameError === null)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              프로젝트 생성 마법사
            </h2>
            <p className="text-gray-600 mt-1">
              {state.repository?.owner}/{state.repository?.name} 저장소로 새
              프로젝트를 만듭니다
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <StepIndicator
          currentStep={state.currentStep}
          onStepClick={handleStepChange}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {state.currentStep === 1 && state.repository && (
            <StepOne
              repository={state.repository}
              branches={state.branches}
              selectedBranch={state.selectedBranch}
              onBranchChange={(branch) =>
                setState((prev) => ({ ...prev, selectedBranch: branch }))
              }
              isLoading={state.isLoading}
              onLoadBranches={loadBranches}
              error={error}
            />
          )}

          {state.currentStep === 2 && (
            <StepTwo
              projectConfig={state.projectConfig}
              onConfigChange={(config) =>
                setState((prev) => ({ ...prev, projectConfig: config }))
              }
              validation={state.validation}
              onValidateName={validateProjectName}
              defaultName={state.repository?.name || ""}
              defaultDescription={state.repository?.description || ""}
            />
          )}

          {state.currentStep === 3 && state.repository && (
            <StepThree
              repository={state.repository}
              selectedBranch={state.selectedBranch}
              projectConfig={state.projectConfig}
              isCreating={state.isCreating}
              createdProjectId={state.createdProjectId}
              error={error}
              onCreateProject={handleCreateProject}
              onNavigateToProject={handleNavigateToProject}
            />
          )}
        </div>

        {/* Footer Navigation */}
        {!state.createdProjectId && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handlePrevious}
              disabled={state.currentStep === 1}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${
                  state.currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>

            <div className="text-sm text-gray-500">
              {state.currentStep} / 3 단계
            </div>

            {state.currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                  ${
                    canProceed()
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-24"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
