"use client";

import { useState, useEffect } from "react";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import { useProjects } from "@/hooks/useProjects";
import { createClient } from "@/lib/supabase/client";
import { setApiToken } from "@/lib/api";
import type {
  GitHubInstallation,
  GitHubRepository,
  GitHubBranch,
} from "@/types/api";

interface StepByStepProjectWizardProps {
  installation: GitHubInstallation;
  repository: GitHubRepository;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
}

interface CodeBuildConfig {
  name: string;
  os: string;
  timeout: number;
  artifactsBucket: string;
  retentionDays: number;
}

type WizardStep =
  | "branch-selection"
  | "project-details"
  | "codebuild-config"
  | "confirmation";

export default function StepByStepProjectWizard({
  installation,
  repository,
  onComplete,
  onCancel,
}: StepByStepProjectWizardProps) {
  const [currentStep, setCurrentStep] =
    useState<WizardStep>("branch-selection");
  const [selectedBranch, setSelectedBranch] = useState<GitHubBranch | null>(
    null
  );
  const [formData, setFormData] = useState<ProjectFormData>({
    name: repository.name,
    description: repository.description || "",
  });

  const {
    branches,
    loading: branchesLoading,
    fetchBranches,
  } = useGitHubRepositories();
  const { createProject, creating, createError } = useProjects();

  // 컴포넌트 마운트 시 토큰 설정
  useEffect(() => {
    const initAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        setApiToken(session.access_token);
      }
    };

    initAuth();
  }, []);

  // 브랜치 목록 조회
  useEffect(() => {
    const [owner] = repository.full_name.split("/");
    fetchBranches(installation.installation_id, owner, repository.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installation.installation_id, repository.full_name]); // fetchBranches 의도적 제외

  // 기본 브랜치 자동 선택
  useEffect(() => {
    if (branches?.branches && !selectedBranch) {
      const defaultBranch = branches.branches.find(
        (b) => b.name === repository.default_branch
      );
      if (defaultBranch) {
        setSelectedBranch(defaultBranch);
      }
    }
  }, [branches, selectedBranch, repository.default_branch]);

  // CodeBuild 설정 생성
  const generateCodeBuildConfig = (): CodeBuildConfig => {
    const userId = "user123"; // TODO: 실제 사용자 ID로 교체
    const projectName = formData.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    return {
      name: `otto-${projectName}-${userId}`,
      os: "LINUX_CONTAINER (Ubuntu)",
      timeout: 60,
      artifactsBucket: `otto-${projectName}-${userId}-artifacts`,
      retentionDays: 7,
    };
  };

  const codeBuildConfig = generateCodeBuildConfig();

  // 다음 단계로 이동
  const handleNext = () => {
    switch (currentStep) {
      case "branch-selection":
        if (selectedBranch) {
          setCurrentStep("project-details");
        }
        break;
      case "project-details":
        if (formData.name.trim()) {
          setCurrentStep("codebuild-config");
        }
        break;
      case "codebuild-config":
        setCurrentStep("confirmation");
        break;
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    switch (currentStep) {
      case "project-details":
        setCurrentStep("branch-selection");
        break;
      case "codebuild-config":
        setCurrentStep("project-details");
        break;
      case "confirmation":
        setCurrentStep("codebuild-config");
        break;
    }
  };

  // 프로젝트 생성
  const handleCreateProject = async () => {
    if (!selectedBranch) return;

    const [owner] = repository.full_name.split("/");

    const requestData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      installationId: installation.installation_id,
      githubRepoId: repository.id.toString(),
      githubRepoUrl: `https://github.com/${repository.full_name}`,
      githubRepoName: repository.name,
      githubOwner: owner,
      selectedBranch: selectedBranch.name,
    };

    const success = await createProject(requestData);

    if (success) {
      onComplete?.();
    }
  };

  // 단계별 유효성 검사
  const isStepValid = () => {
    switch (currentStep) {
      case "branch-selection":
        return selectedBranch !== null;
      case "project-details":
        return formData.name.trim().length > 0;
      case "codebuild-config":
        return true;
      case "confirmation":
        return true;
      default:
        return false;
    }
  };

  const stepTitles = {
    "branch-selection": "브랜치 선택",
    "project-details": "프로젝트 정보",
    "codebuild-config": "CodeBuild 설정",
    confirmation: "최종 확인",
  };

  const stepNumbers = {
    "branch-selection": 1,
    "project-details": 2,
    "codebuild-config": 3,
    confirmation: 4,
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Object.entries(stepTitles).map(([step, title], index) => {
            const stepNum = stepNumbers[step as WizardStep];
            const isActive = currentStep === step;
            const isCompleted = stepNumbers[currentStep] > stepNum;

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "text-blue-600"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? "✓" : stepNum}
                  </div>
                  <span className="text-sm font-medium">{title}</span>
                </div>

                {index < Object.keys(stepTitles).length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 저장소 정보 헤더 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900">
              {repository.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              {installation.account_login} 계정
            </p>
          </div>
        </div>
      </div>

      {/* 단계별 콘텐츠 */}
      <div className="space-y-6">
        {/* Step 1: 브랜치 선택 */}
        {currentStep === "branch-selection" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              브랜치 선택
            </h2>
            <p className="text-gray-600 mb-6">
              프로젝트에서 사용할 브랜치를 선택하세요.
            </p>

            {branchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-600">
                    브랜치 목록을 불러오는 중...
                  </span>
                </div>
              </div>
            ) : branches ? (
              <div className="space-y-3">
                {branches.branches.map((branch) => (
                  <button
                    key={branch.name}
                    onClick={() => setSelectedBranch(branch)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedBranch?.name === branch.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {branch.name}
                          </code>
                          {branch.name === repository.default_branch && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              기본 브랜치
                            </span>
                          )}
                          {branch.protected && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              🔒 보호됨
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          최신 커밋: {branch.commit.sha.substring(0, 7)}
                        </p>
                      </div>
                      {selectedBranch?.name === branch.name && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                브랜치 목록을 불러올 수 없습니다.
              </div>
            )}
          </div>
        )}

        {/* Step 2: 프로젝트 세부 정보 */}
        {currentStep === "project-details" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              프로젝트 정보
            </h2>
            <p className="text-gray-600 mb-6">
              프로젝트의 이름과 설명을 입력하세요.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="내 프로젝트"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  프로젝트 설명
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: CodeBuild 설정 */}
        {currentStep === "codebuild-config" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              CodeBuild 설정
            </h2>
            <p className="text-gray-600 mb-6">
              다음 설정으로 CodeBuild 프로젝트가 생성됩니다.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프로젝트 이름
                  </label>
                  <code className="block text-sm bg-white border rounded px-3 py-2 font-mono">
                    {codeBuildConfig.name}
                  </code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    운영체제
                  </label>
                  <div className="text-sm bg-white border rounded px-3 py-2">
                    {codeBuildConfig.os}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    빌드 제한 시간
                  </label>
                  <div className="text-sm bg-white border rounded px-3 py-2">
                    {codeBuildConfig.timeout}분
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아티팩트 보관 기간
                  </label>
                  <div className="text-sm bg-white border rounded px-3 py-2">
                    {codeBuildConfig.retentionDays}일
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  S3 아티팩트 버킷
                </label>
                <code className="block text-sm bg-white border rounded px-3 py-2 font-mono">
                  {codeBuildConfig.artifactsBucket}
                </code>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">정보</p>
                  <p>
                    CodeBuild 프로젝트와 S3 버킷이 자동으로 생성됩니다. 빌드
                    완료 후 아티팩트는 지정된 기간 동안 보관됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 최종 확인 */}
        {currentStep === "confirmation" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">최종 확인</h2>
            <p className="text-gray-600 mb-6">
              입력한 정보를 확인하고 프로젝트를 생성하세요.
            </p>

            <div className="space-y-6">
              {/* 저장소 정보 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">저장소 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">저장소:</span>
                    <span className="ml-2 font-mono">
                      {repository.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">브랜치:</span>
                    <span className="ml-2 font-mono">
                      {selectedBranch?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* 프로젝트 정보 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  프로젝트 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">이름:</span>
                    <span className="ml-2">{formData.name}</span>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-gray-600">설명:</span>
                      <span className="ml-2">{formData.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CodeBuild 정보 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  CodeBuild 설정
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">프로젝트명:</span>
                    <span className="ml-2 font-mono">
                      {codeBuildConfig.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">환경:</span>
                    <span className="ml-2">{codeBuildConfig.os}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">제한시간:</span>
                    <span className="ml-2">{codeBuildConfig.timeout}분</span>
                  </div>
                </div>
              </div>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          취소
        </button>

        <div className="flex gap-3">
          {currentStep !== "branch-selection" && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
          )}

          {currentStep === "confirmation" ? (
            <button
              onClick={handleCreateProject}
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  프로젝트 생성 중...
                </span>
              ) : (
                "프로젝트 생성"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
