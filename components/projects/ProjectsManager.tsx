"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Github, ExternalLink, Settings, Trash2 } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";

interface Project {
  projectId: string;
  name: string;
  githubOwner: string;
  githubRepoName: string;
  description?: string;
  createdAt: string;
}

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

  const handleCreateProject = () => {
    window.location.href = "/projects/onboarding";
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleOpenRepository = (githubOwner: string, githubRepoName: string) => {
    window.open(`https://github.com/${githubOwner}/${githubRepoName}`, "_blank");
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트</h1>
            <p className="text-gray-600">
              CI/CD 파이프라인을 관리할 프로젝트들을 확인하고 관리하세요.
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "다른 검색어로 시도해보세요."
                  : "새 프로젝트를 만들어 CI/CD 파이프라인을 시작하세요."}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  첫 프로젝트 만들기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  selectedProjectId === project.projectId
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleSelectProject(project.projectId)}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Github className="w-4 h-4 mr-1" />
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
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="GitHub에서 보기"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // 설정 모달 또는 페이지 이동
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="프로젝트 설정"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Project Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Project Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    생성일: {new Date(project.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  {selectedProjectId === project.projectId && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      선택됨
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}