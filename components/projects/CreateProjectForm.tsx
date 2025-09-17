"use client";

import { useState } from "react";
import { useGitHubStatus } from "@/hooks/useGitHubStatus";
import { useProjects } from "@/hooks/useProjects";
import RepositorySelector from "./RepositorySelector";
import GitHubStatusCard from "./GitHubStatusCard";
import type {
  GitHubInstallation,
  GitHubRepository,
  GitHubBranch,
} from "@/types/api";

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
}

export default function CreateProjectForm({
  onSuccess,
  onCancel,
}: CreateProjectFormProps) {
  const [step, setStep] = useState<
    "github-status" | "repository-selection" | "project-details"
  >("github-status");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });

  // 선택된 GitHub 데이터
  const [selectedInstallation, setSelectedInstallation] =
    useState<GitHubInstallation | null>(null);
  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<GitHubBranch | null>(
    null
  );

  const { status: gitHubStatus, loading: gitHubLoading } = useGitHubStatus();
  const { createProject, creating, createError } = useProjects();

  // GitHub 설치 완료 후 다음 단계로
  const handleGitHubInstallationComplete = () => {
    setStep("repository-selection");
  };

  // 저장소 선택 완료 후 다음 단계로
  const handleRepositorySelectionComplete = () => {
    if (selectedRepository && selectedBranch) {
      // 저장소명으로 프로젝트명 자동 설정
      setFormData((prev) => ({
        ...prev,
        name: prev.name || selectedRepository.name,
        description: prev.description || selectedRepository.description || "",
      }));
      setStep("project-details");
    }
  };

  // 프로젝트 생성 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstallation || !selectedRepository || !selectedBranch) {
      return;
    }

    const [owner, repo] = selectedRepository.full_name.split("/");

    const success = await createProject({
      name: formData.name.trim(),
      description: formData.description.trim(),
      installationId: selectedInstallation.installation_id,
      githubRepoId: selectedRepository.id.toString(),
      githubRepoUrl: `https://github.com/${selectedRepository.full_name}`,
      githubRepoName: selectedRepository.name,
      githubOwner: owner,
      selectedBranch: selectedBranch.name,
    });

    if (success) {
      onSuccess?.();
    }
  };

  // 뒤로 가기
  const handleBack = () => {
    if (step === "project-details") {
      setStep("repository-selection");
    } else if (step === "repository-selection") {
      setStep("github-status");
    }
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      formData.name.trim().length > 0 &&
      selectedInstallation &&
      selectedRepository &&
      selectedBranch
    );
  };

  if (gitHubLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 ${
              step === "github-status" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "github-status"
                  ? "bg-blue-600 text-white"
                  : gitHubStatus?.hasInstallation
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">GitHub 연결</span>
          </div>

          <div
            className={`w-16 h-0.5 ${
              gitHubStatus?.hasInstallation ? "bg-green-600" : "bg-gray-200"
            }`}
          ></div>

          <div
            className={`flex items-center gap-2 ${
              step === "repository-selection"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "repository-selection"
                  ? "bg-blue-600 text-white"
                  : selectedRepository && selectedBranch
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">저장소 선택</span>
          </div>

          <div
            className={`w-16 h-0.5 ${
              selectedRepository && selectedBranch
                ? "bg-green-600"
                : "bg-gray-200"
            }`}
          ></div>

          <div
            className={`flex items-center gap-2 ${
              step === "project-details" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "project-details"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <span className="text-sm font-medium">프로젝트 설정</span>
          </div>
        </div>
      </div>

      {/* Step 1: GitHub 연결 상태 */}
      {step === "github-status" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              GitHub 연결
            </h2>
            <p className="text-gray-600">
              프로젝트를 생성하려면 먼저 GitHub 앱을 설치해야 합니다.
            </p>
          </div>

          <GitHubStatusCard
            onInstallationComplete={handleGitHubInstallationComplete}
          />
        </div>
      )}

      {/* Step 2: 저장소 선택 */}
      {step === "repository-selection" && gitHubStatus?.hasInstallation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                저장소 선택
              </h2>
              <p className="text-gray-600">
                프로젝트로 연결할 GitHub 저장소와 브랜치를 선택하세요.
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 이전
            </button>
          </div>

          <RepositorySelector
            installations={gitHubStatus.installations}
            selectedInstallation={selectedInstallation}
            selectedRepository={selectedRepository}
            selectedBranch={selectedBranch}
            onInstallationChange={setSelectedInstallation}
            onRepositoryChange={setSelectedRepository}
            onBranchChange={setSelectedBranch}
          />

          {selectedRepository && selectedBranch && (
            <div className="flex justify-end">
              <button
                onClick={handleRepositorySelectionComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다음 단계 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: 프로젝트 세부 설정 */}
      {step === "project-details" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                프로젝트 설정
              </h2>
              <p className="text-gray-600">
                프로젝트의 이름과 설명을 입력하세요.
              </p>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 이전
            </button>
          </div>

          {/* 선택된 저장소 정보 */}
          {selectedRepository && selectedBranch && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">선택된 저장소</h3>
              <div className="text-sm text-blue-800">
                <p>
                  <strong>저장소:</strong> {selectedRepository.full_name}
                </p>
                <p>
                  <strong>브랜치:</strong> {selectedBranch.name}
                </p>
                <p>
                  <strong>언어:</strong>{" "}
                  {selectedRepository.language || "감지되지 않음"}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
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
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
