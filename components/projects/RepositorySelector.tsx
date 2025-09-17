"use client";

import { useState, useEffect } from "react";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import type {
  GitHubInstallation,
  GitHubRepository,
  GitHubBranch,
} from "@/types/api";

interface RepositorySelectorProps {
  installations: GitHubInstallation[];
  selectedInstallation: GitHubInstallation | null;
  selectedRepository: GitHubRepository | null;
  selectedBranch: GitHubBranch | null;
  onInstallationChange: (installation: GitHubInstallation | null) => void;
  onRepositoryChange: (repository: GitHubRepository | null) => void;
  onBranchChange: (branch: GitHubBranch | null) => void;
}

export default function RepositorySelector({
  installations,
  selectedInstallation,
  selectedRepository,
  selectedBranch,
  onInstallationChange,
  onRepositoryChange,
  onBranchChange,
}: RepositorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    repositories,
    branches,
    loading,
    error,
    fetchRepositories,
    fetchBranches,
    resetBranches,
  } = useGitHubRepositories();

  // 설치 변경 시 저장소 목록 조회
  useEffect(() => {
    if (selectedInstallation) {
      fetchRepositories(selectedInstallation.installation_id);
      onRepositoryChange(null);
      onBranchChange(null);
    } else {
      resetBranches();
      onRepositoryChange(null);
      onBranchChange(null);
    }
  }, [
    selectedInstallation,
    fetchRepositories,
    resetBranches,
    onRepositoryChange,
    onBranchChange,
  ]);

  // 저장소 변경 시 브랜치 목록 조회
  useEffect(() => {
    if (selectedInstallation && selectedRepository) {
      const [owner, repo] = selectedRepository.full_name.split("/");
      fetchBranches(selectedInstallation.installation_id, owner, repo);
      onBranchChange(null);
    } else {
      onBranchChange(null);
    }
  }, [selectedRepository, selectedInstallation, fetchBranches, onBranchChange]);

  const filteredRepositories =
    repositories?.repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  return (
    <div className="space-y-6">
      {/* GitHub 계정 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GitHub 계정 선택
        </label>
        <select
          value={selectedInstallation?.installation_id || ""}
          onChange={(e) => {
            const installation = installations.find(
              (inst) => inst.installation_id === e.target.value
            );
            onInstallationChange(installation || null);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">계정을 선택하세요</option>
          {installations.map((installation) => (
            <option
              key={installation.installation_id}
              value={installation.installation_id}
            >
              {installation.account_login} ({installation.account_type})
            </option>
          ))}
        </select>
      </div>

      {/* 저장소 선택 */}
      {selectedInstallation && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            저장소 선택
          </label>

          {loading && !repositories && (
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
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
              저장소 목록을 불러오는 중...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() =>
                  fetchRepositories(selectedInstallation.installation_id)
                }
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {repositories && (
            <div className="space-y-3">
              {/* 검색 입력 */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
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
                <input
                  type="text"
                  placeholder="저장소 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 저장소 목록 */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredRepositories.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm
                      ? "검색 결과가 없습니다."
                      : "저장소가 없습니다."}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRepositories.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => onRepositoryChange(repo)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedRepository?.id === repo.id
                            ? "bg-blue-50 border-r-2 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {repo.full_name}
                              </h4>
                              {repo.private && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Private
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  {repo.language}
                                </span>
                              )}
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>🍴 {repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                총 {repositories.totalRepositories}개의 저장소 중{" "}
                {filteredRepositories.length}개 표시
              </div>
            </div>
          )}
        </div>
      )}

      {/* 브랜치 선택 */}
      {selectedRepository && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            브랜치 선택
          </label>

          {loading && !branches && (
            <div className="flex items-center justify-center py-4">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600"
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
              브랜치 목록을 불러오는 중...
            </div>
          )}

          {branches && (
            <div className="space-y-2">
              <select
                value={selectedBranch?.name || ""}
                onChange={(e) => {
                  const branch = branches.branches.find(
                    (b) => b.name === e.target.value
                  );
                  onBranchChange(branch || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">브랜치를 선택하세요</option>
                {branches.branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                    {branch.name === selectedRepository.default_branch &&
                      " (기본)"}
                    {branch.protected && " 🔒"}
                  </option>
                ))}
              </select>

              {selectedBranch && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      선택된 브랜치: {selectedBranch.name}
                    </span>
                    {selectedBranch.protected && (
                      <span className="text-amber-600 flex items-center gap-1">
                        🔒 보호된 브랜치
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    최신 커밋: {selectedBranch.commit.sha.substring(0, 7)}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                총 {branches.totalBranches}개의 브랜치
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
