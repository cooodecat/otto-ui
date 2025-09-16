"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  Settings,
  GitBranch,
  X,
  Plus,
} from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import ProjectCreationWizard from "./ProjectCreationWizard";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 새 프로젝트 생성 모달
 * /projects 페이지의 기능을 모달로 제공
 */
export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepository, setSelectedRepository] = useState<{
    name: string;
    owner: string;
    visibility: "Public" | "Private";
    updated: string;
  } | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    selectedProjectId,
    setSelectedProject,
  } = useProjectStore();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  /** 검색 조건에 맞는 프로젝트 필터링 */
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.githubOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.githubRepoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** 프로젝트 선택 처리 */
  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);

    // 선택 효과를 보여주고 잠시 후 모달 닫기
    setTimeout(() => {
      onClose();
    }, 300); // 0.3초 후 닫기
  };

  /** GitHub 리포지토리를 새 탭에서 열기 */
  const handleOpenRepository = (
    githubOwner: string,
    githubRepoName: string
  ) => {
    window.open(
      `https://github.com/${githubOwner}/${githubRepoName}`,
      "_blank"
    );
  };

  /** GitHub 저장소 선택 시 마법사 열기 */
  const handleRepositorySelect = (repo: {
    name: string;
    owner: string;
    visibility: "Public" | "Private";
    updated: string;
  }) => {
    setSelectedRepository(repo);
    setIsWizardOpen(true);
  };

  /** 마법사 닫기 */
  const handleWizardClose = () => {
    setIsWizardOpen(false);
    setSelectedRepository(null);
    // 마법사에서 프로젝트가 생성되었으면 모달도 닫기
    fetchProjects(); // 프로젝트 목록 새로고침
  };


  /** 백드롭 클릭 시 모달 닫기 */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 키 이벤트 처리
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      // 모달이 닫힐 때 body 스크롤 복원
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 모달 JSX
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-modal-title"
    >
      {/* 백드롭 - 블러 효과와 반투명 배경 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2
              id="create-project-modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              새 프로젝트 만들기
            </h2>
            <p className="text-gray-600 mt-1">
              GitHub 저장소를 연동하여 새 프로젝트를 생성하거나 기존 프로젝트를
              관리하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="프로젝트 생성 모달 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && projects.length === 0 ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                프로젝트 로드 실패
              </h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchProjects()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : (
            /* Two Column Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - GitHub 저장소 */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    GitHub 저장소
                  </h3>
                  <p className="text-gray-600 text-sm">
                    프로젝트를 생성할 저장소를 선택하세요
                  </p>
                </div>

                {/* GitHub 저장소 목록 */}
                <div className="space-y-3 mb-6">
                  {[
                    {
                      name: "web-app",
                      owner: "mycompany",
                      visibility: "Public" as const,
                      updated: "609일 전 업데이트",
                    },
                    {
                      name: "mobile-app",
                      owner: "mycompany",
                      visibility: "Private" as const,
                      updated: "610일 전 업데이트",
                    },
                    {
                      name: "api-server",
                      owner: "mycompany",
                      visibility: "Private" as const,
                      updated: "611일 전 업데이트",
                    },
                    {
                      name: "documentation",
                      owner: "mycompany",
                      visibility: "Public" as const,
                      updated: "612일 전 업데이트",
                    },
                    {
                      name: "infrastructure",
                      owner: "mycompany",
                      visibility: "Private" as const,
                      updated: "613일 전 업데이트",
                    },
                  ].map((repo, index) => (
                    <div
                      key={index}
                      className="group relative bg-white hover:bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {repo.owner}/{repo.name}
                          </span>
                        </div>

                        {/* Hover 시 나타나는 생성 버튼 - 70% 위치에 배치 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepositorySelect(repo);
                          }}
                          className="absolute left-[65%] top-5 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl z-10"
                          title="프로젝트 생성"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-base">생성</span>
                        </button>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            repo.visibility === "Public"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {repo.visibility}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{repo.updated}</p>
                    </div>
                  ))}
                </div>

                {/* 저장소가 없을 때 */}
                {false && ( // TODO: 실제로는 repositories.length === 0 조건 사용
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      연결된 저장소가 없습니다
                    </h4>
                    <p className="text-gray-600 text-sm">
                      GitHub 계정을 연결하여 저장소를 불러오세요
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - 생성된 프로젝트 */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 min-w-0">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    생성된 프로젝트
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    이미 생성된 프로젝트를 확인하고 관리하세요
                  </p>

                  {/* Search */}
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
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4">
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-white rounded-lg p-6 border border-gray-200 mx-2">
                        <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchQuery
                            ? "검색 결과가 없습니다"
                            : "아직 생성된 프로젝트가 없습니다"}
                        </h4>
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
                        className={`rounded-lg border-2 p-4 hover:shadow-md transition-all duration-300 cursor-pointer mx-2 ${
                          selectedProjectId === project.projectId
                            ? "border-purple-300 bg-purple-50 shadow-lg scale-[1.005]"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:scale-[1.005]"
                        }`}
                        onClick={() => handleSelectProject(project.projectId)}
                      >
                        {/* Project Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                              {project.name}
                            </h4>
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
                                handleOpenRepository(
                                  project.githubOwner,
                                  project.githubRepoName
                                );
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                              title="GitHub에서 보기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                            생성일:{" "}
                            {project.createdAt
                              ? new Date(project.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )
                              : "알 수 없음"}
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
          )}
        </div>
      </div>
    </div>
  );

  // React Portal을 사용하여 document.body에 렌더링
  // 이를 통해 사이드바나 다른 컴포넌트의 z-index 제약을 벗어남
  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(modalContent, document.body)}

      {/* 프로젝트 생성 마법사 */}
      {selectedRepository && (
        <ProjectCreationWizard
          isOpen={isWizardOpen}
          onClose={handleWizardClose}
          repository={selectedRepository}
        />
      )}
    </>
  );
}
