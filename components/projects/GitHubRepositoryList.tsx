"use client";

import { useState, useEffect } from "react";
import { useGitHubStatus } from "@/hooks/useGitHubStatus";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import GitHubRepositoryCard from "./GitHubRepositoryCard";
import GitHubStatusCard from "./GitHubStatusCard";
import type { GitHubInstallation, GitHubRepository } from "@/types/api";

interface GitHubRepositoryListProps {
  onRepositorySelect?: (
    installation: GitHubInstallation,
    repository: GitHubRepository
  ) => void;
}

export default function GitHubRepositoryList({
  onRepositorySelect,
}: GitHubRepositoryListProps) {
  const [selectedInstallation, setSelectedInstallation] =
    useState<GitHubInstallation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { status: gitHubStatus, loading: statusLoading } = useGitHubStatus();
  const {
    repositories,
    loading: reposLoading,
    error,
    fetchRepositories,
  } = useGitHubRepositories();

  // 첫 번째 설치를 자동으로 선택
  useEffect(() => {
    if (gitHubStatus?.installations.length && !selectedInstallation) {
      const firstInstallation = gitHubStatus.installations[0];
      setSelectedInstallation(firstInstallation);
      fetchRepositories(firstInstallation.installation_id);
    }
  }, [gitHubStatus, selectedInstallation, fetchRepositories]);

  // 설치 변경 시 저장소 목록 조회
  const handleInstallationChange = (installation: GitHubInstallation) => {
    setSelectedInstallation(installation);
    fetchRepositories(installation.installation_id);
    setSearchTerm(""); // 검색어 초기화
  };

  // 프로젝트 생성 버튼 클릭
  const handleCreateProject = (repository: GitHubRepository) => {
    if (selectedInstallation) {
      onRepositorySelect?.(selectedInstallation, repository);
    }
  };

  // 검색 필터링
  const filteredRepositories =
    repositories?.repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // GitHub 설치가 없는 경우
  if (!gitHubStatus?.hasInstallation) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            GitHub 저장소
          </h2>
          <p className="text-gray-600">
            GitHub 저장소를 연결하여 프로젝트를 생성하세요.
          </p>
        </div>
        <GitHubStatusCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">GitHub 저장소</h2>
        <p className="text-gray-600">
          저장소를 선택하여 새 프로젝트를 생성하세요.
        </p>
      </div>

      {/* GitHub 계정 선택 */}
      {gitHubStatus.installations.length > 1 && (
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub 계정 선택
          </label>
          <select
            value={selectedInstallation?.installation_id || ""}
            onChange={(e) => {
              const installation = gitHubStatus.installations.find(
                (inst) => inst.installation_id === e.target.value
              );
              if (installation) {
                handleInstallationChange(installation);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {gitHubStatus.installations.map((installation) => (
              <option
                key={installation.installation_id}
                value={installation.installation_id}
              >
                {installation.account_login} ({installation.account_type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 현재 선택된 계정 정보 */}
      {selectedInstallation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {selectedInstallation.account_login.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                {selectedInstallation.account_login}
              </h3>
              <p className="text-sm text-blue-700">
                {selectedInstallation.account_type} 계정
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 검색바 */}
      <div className="relative">
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
          placeholder="저장소 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

      {/* 로딩 상태 */}
      {reposLoading && (
        <div className="flex items-center justify-center py-12">
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
            <span className="text-gray-600">저장소 목록을 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            저장소 목록을 불러올 수 없습니다
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() =>
              selectedInstallation &&
              fetchRepositories(selectedInstallation.installation_id)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 저장소 목록 */}
      {repositories && !reposLoading && (
        <div className="space-y-4">
          {/* 결과 요약 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {repositories.totalRepositories}개의 저장소 중{" "}
              {filteredRepositories.length}개 표시
              {searchTerm && ` (검색: "${searchTerm}")`}
            </p>
            <div className="text-xs text-gray-500">
              💡 저장소에 마우스를 올리면 프로젝트 생성 버튼이 나타납니다
            </div>
          </div>

          {/* 저장소 그리드 */}
          {filteredRepositories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              {filteredRepositories.map((repository) => (
                <GitHubRepositoryCard
                  key={repository.id}
                  repository={repository}
                  onCreateProject={handleCreateProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "검색 결과가 없습니다" : "저장소가 없습니다"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `"${searchTerm}"에 대한 저장소를 찾을 수 없습니다.`
                  : "이 계정에는 접근 가능한 저장소가 없습니다."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
