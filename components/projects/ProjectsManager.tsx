"use client";

import React, { useEffect, useState } from "react";
import { Search, ExternalLink, Settings, GitBranch } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";

export default function ProjectsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    selectedProjectId,
    setSelectedProject,
  } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.githubOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.githubRepoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleOpenRepository = (githubOwner: string, githubRepoName: string) => {
    window.open(`https://github.com/${githubOwner}/${githubRepoName}`, "_blank");
  };

  const handleGitHubConnect = () => {
    // GitHub OAuth 연동 로직
    window.location.href = "/auth/github";
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              프로젝트 로드 실패
            </h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchProjects()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트 관리</h1>
          <p className="text-gray-600">
            GitHub 저장소를 연동하여 새 프로젝트를 생성하거나 기존 프로젝트를 관리하세요.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - GitHub 저장소 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">GitHub 저장소</h2>
              <p className="text-gray-600 text-sm">
                프로젝트를 생성할 저장소를 선택하세요
              </p>
            </div>

            {/* GitHub 저장소 목록 */}
            <div className="space-y-3 mb-6">
              {[
                { name: "mycompany/web-app", visibility: "Public", updated: "609일 전 업데이트" },
                { name: "mycompany/mobile-app", visibility: "Private", updated: "610일 전 업데이트" },
                { name: "mycompany/api-server", visibility: "Private", updated: "611일 전 업데이트" },
                { name: "mycompany/documentation", visibility: "Public", updated: "612일 전 업데이트" },
                { name: "mycompany/infrastructure", visibility: "Private", updated: "613일 전 업데이트" },
              ].map((repo, index) => (
                <div
                  key={index}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{repo.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      repo.visibility === "Public"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {repo.visibility}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{repo.updated}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGitHubConnect}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <GitBranch className="w-5 h-5" />
              GitHub 연동하기
            </button>
          </div>

          {/* Right Column - 생성된 프로젝트 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">생성된 프로젝트</h2>
              <p className="text-gray-600 text-sm">
                이미 생성된 프로젝트를 확인하고 관리하세요
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="프로젝트 검색..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery ? "검색 결과가 없습니다" : "아직 생성된 프로젝트가 없습니다"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {searchQuery
                        ? "다른 검색어로 시도해보세요."
                        : "왼쪽에서 저장소를 선택하여 첫 프로젝트를 만들어보세요."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.projectId}
                    className={`rounded-lg border-2 p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                      selectedProjectId === project.projectId
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 bg-gray-50"
                    }`}
                    onClick={() => handleSelectProject(project.projectId)}
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <GitBranch className="w-4 h-4 mr-1" />
                          <span className="truncate">
                            {project.githubOwner}/{project.githubRepoName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRepository(project.githubOwner, project.githubRepoName);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                          title="GitHub에서 보기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 설정 모달 또는 페이지 이동
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                          title="프로젝트 설정"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        생성일: {project.createdAt ? new Date(project.createdAt).toLocaleDateString("ko-KR") : "알 수 없음"}
                      </span>
                      {selectedProjectId === project.projectId && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          선택됨
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}