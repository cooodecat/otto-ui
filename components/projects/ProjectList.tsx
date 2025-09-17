"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import CreateProjectForm from "./CreateProjectForm";
import type { Project } from "@/types/api";

interface ProjectListProps {
  searchTerm?: string;
}

export default function ProjectList({ searchTerm = "" }: ProjectListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { projects, loading, error, refetch } = useProjects();

  // 검색어 필터링
  const filteredProjects =
    projects?.projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description &&
          project.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (project.github_repo_name &&
          project.github_repo_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    ) || [];

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <CreateProjectForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (loading && !projects) {
    return (
      <div className="space-y-6">
        {/* 로딩 헤더 */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>

        {/* 로딩 카드들 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
          프로젝트 목록을 불러올 수 없습니다
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 프로젝트가 없는 경우
  if (!projects || projects.totalProjects === 0) {
    return (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 프로젝트가 없습니다
        </h3>
        <p className="text-gray-600 mb-6">
          첫 번째 프로젝트를 생성하여 시작해보세요.
        </p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          프로젝트 생성
        </button>
      </div>
    );
  }

  // 검색 결과가 없는 경우
  if (searchTerm && filteredProjects.length === 0) {
    return (
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
          검색 결과가 없습니다
        </h3>
        <p className="text-gray-600 mb-4">
          &quot;{searchTerm}&quot;에 대한 프로젝트를 찾을 수 없습니다.
        </p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 프로젝트 생성
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            프로젝트 ({filteredProjects.length})
          </h1>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-1">
              &quot;{searchTerm}&quot; 검색 결과
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          새 프로젝트
        </button>
      </div>

      {/* 프로젝트 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.project_id} project={project} />
        ))}
      </div>

      {/* 더 많은 프로젝트가 있는 경우 */}
      {!searchTerm && projects.totalProjects > filteredProjects.length && (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            {projects.totalProjects - filteredProjects.length}개의 프로젝트가 더
            있습니다.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            모두 불러오기
          </button>
        </div>
      )}
    </div>
  );
}
