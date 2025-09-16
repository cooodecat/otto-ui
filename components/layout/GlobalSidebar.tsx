"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Settings,
  HelpCircle,
  ChevronDown,
  Copy,
  BookOpen,
  FileText,
  Home,
  Check,
} from "lucide-react";
import SettingsModal from "../settings/SettingsModal";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import { SidebarSkeleton, WorkspaceDropdownSkeleton } from "./SidebarSkeleton";

/**
 * 블록 팔레트 아이템의 인터페이스
 */
interface Block {
  /** 블록의 표시 이름 */
  name: string;
  /** 블록의 이모지 아이콘 */
  icon: string;
  /** Tailwind CSS 배경색 클래스 */
  color: string;
}

/**
 * 폴더 섹션 아이템의 인터페이스
 */
interface _Folder {
  /** 폴더의 표시 이름 */
  name: string;
  /** 폴더의 이모지 아이콘 */
  icon: string;
  /** 현재 폴더가 활성/선택 상태인지 여부 */
  isActive?: boolean;
}

/**
 * 하단 네비게이션 아이콘의 인터페이스
 */
interface BottomIcon {
  /** Lucide React 아이콘 컴포넌트 */
  icon: React.ComponentType<{ className?: string }>;
  /** 아이콘의 툴팁 제목 */
  title: string;
}

/**
 * 파이프라인 아이템의 인터페이스 (폴더 대신 사용)
 */
interface PipelineItem {
  /** 파이프라인 표시 이름 */
  name: string;
  /** 파이프라인 이모지 아이콘 */
  icon: string;
  /** 파이프라인 ID */
  pipelineId: string;
  /** 현재 파이프라인이 활성/선택 상태인지 여부 */
  isActive?: boolean;
}

/**
 * 캔버스 레이아웃이 필요한 경로 패턴 확인 함수
 *
 * 파이프라인 에디터와 파이프라인 상세 페이지에서 사이드바가 floating 모드로
 * 작동해야 하는지 결정합니다.
 *
 * @param pathname - 현재 경로 문자열
 * @returns 캔버스 레이아웃을 사용해야 하는 경로인지 여부
 *
 * @example
 * ```typescript
 * isCanvasLayoutPath('/pipelines') // true
 * isCanvasLayoutPath('/projects/123/pipelines/456') // true
 * isCanvasLayoutPath('/projects') // false
 * ```
 */
const isCanvasLayoutPath = (pathname: string): boolean => {
  if (pathname === "/pipelines") return true;
  const pipelineDetailPattern = /^\/projects\/[^/]+\/pipelines\/[^/]+$/;
  return pipelineDetailPattern.test(pathname);
};

/**
 * GlobalSidebar 컴포넌트
 *
 * 프로젝트 네비게이션과 파이프라인 관리, 블록 팔레트 기능을 제공하는 사이드바 컴포넌트입니다.
 * 경로에 따라 두 가지 레이아웃 모드로 작동:
 * 1. 캔버스 모드: 파이프라인 페이지에서 fixed positioning (floating)
 * 2. 표준 모드: 그 외 페이지에서 relative positioning (분할 레이아웃)
 *
 * 주요 기능:
 * - 검색 기능이 있는 프로젝트 헤더
 * - 파이프라인 관리 섹션
 * - 워크플로 생성을 위한 드래그 가능한 블록 팔레트
 * - 하단 네비게이션 아이콘
 * - 실시간 데이터 로딩 및 스켈레톤 UI
 *
 * @returns 사이드바를 나타내는 JSX 엘리먼트
 */
const GlobalSidebar = () => {
  const pathname = usePathname();
  const isCanvasLayout = isCanvasLayoutPath(pathname);

  /** 팔레트에서 블록 필터링을 위한 검색 쿼리 */
  const [searchBlocks, setSearchBlocks] = useState<string>("");

  /** 현재 선택된 파이프라인 ID */
  const [_selectedPipelineId, _setSelectedPipelineId] = useState<string | null>(
    null
  );

  /** 워크스페이스 드롭다운 열림/닫힘 상태 */
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] =
    useState<boolean>(false);

  // Zustand 스토어 사용
  const {
    projects,
    selectedProjectId,
    isLoading: isProjectsLoading,
    error: projectsError,
    fetchProjects,
    setSelectedProject,
    getSelectedProject,
  } = useProjectStore();

  const {
    pipelines: _pipelines,
    isLoading: isPipelinesLoading,
    error: pipelinesError,
    fetchPipelines: _fetchPipelines,
    setCurrentProject,
    getPipelinesByProject,
  } = usePipelineStore();

  /**
   * Settings 모달의 열림/닫힘 상태를 관리하는 state
   * true일 때 SettingsModal 컴포넌트가 React Portal을 통해 전체 화면에 표시됩니다
   */
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  /** 워크스페이스 드롭다운 참조 */
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // 워크스페이스 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWorkspaceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 데이터 로딩 및 초기화
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 선택된 프로젝트가 변경되면 해당 프로젝트의 파이프라인들을 가져옴
  useEffect(() => {
    if (selectedProjectId) {
      setCurrentProject(selectedProjectId);
    }
  }, [selectedProjectId, setCurrentProject]);

  /**
   * 팔레트에서 사용 가능한 블록들의 설정
   * 각 블록은 드래그하여 워크플로 노드를 생성할 수 있습니다
   */
  const blocks: Block[] = [
    { name: "Agent", icon: "🤖", color: "bg-purple-500" },
    { name: "API", icon: "🔗", color: "bg-blue-500" },
    { name: "Condition", icon: "🔶", color: "bg-orange-500" },
    { name: "Function", icon: "</>", color: "bg-red-500" },
    { name: "Knowledge", icon: "🧠", color: "bg-teal-500" },
  ];

  // 현재 선택된 프로젝트의 파이프라인들을 변환
  const currentPipelines: PipelineItem[] = selectedProjectId
    ? getPipelinesByProject(selectedProjectId).map((pipeline) => ({
        name: pipeline.name || `Pipeline ${pipeline.pipelineId.slice(-6)}`,
        icon: "🔧", // 파이프라인 기본 아이콘
        pipelineId: pipeline.pipelineId,
        isActive: pipeline.pipelineId === _selectedPipelineId,
      }))
    : [];

  /**
   * 하단 네비게이션 아이콘들의 설정
   * 일반적인 워크스페이스 기능에 빠르게 접근할 수 있게 해줍니다
   */
  const bottomIcons: BottomIcon[] = [
    { icon: Settings, title: "Settings" },
    { icon: HelpCircle, title: "Help" },
    { icon: FileText, title: "Documentation" },
    { icon: BookOpen, title: "Resources" },
    { icon: Home, title: "Home" },
  ];

  /**
   * 블록의 드래그 시작 이벤트를 처리합니다
   *
   * 팔레트에서 블록을 드래그할 때 캔버스에 드롭할 수 있도록
   * 드래그 데이터를 설정합니다. React Flow와 호환되는 형태로
   * 데이터를 전달합니다.
   *
   * @param e - React 드래그 이벤트 객체
   * @param blockType - 드래그되는 블록의 타입 (대소문자 구분 없음)
   *
   * @example
   * ```typescript
   * handleBlockDragStart(event, 'Agent') // 'agent'로 변환되어 전달
   * ```
   *
   * @see {@link https://reactflow.dev/docs/guides/drag-and-drop/} React Flow 드래그 앤 드롭 가이드
   */
  const handleBlockDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    blockType: string
  ) => {
    e.dataTransfer.setData("application/reactflow", blockType.toLowerCase());
  };

  /**
   * 파이프라인 선택 이벤트를 처리합니다
   *
   * 사용자가 파이프라인 목록에서 특정 파이프라인을 클릭했을 때
   * 해당 파이프라인 페이지로 이동합니다.
   *
   * @param pipelineId - 선택할 파이프라인의 고유 식별자
   *
   * @example
   * ```typescript
   * handlePipelineSelect('pipeline_123')
   * ```
   */
  const handlePipelineSelect = (pipelineId: string) => {
    const currentProject = getSelectedProject();
    if (currentProject) {
      window.location.href = `/projects/${currentProject.projectId}/pipelines/${pipelineId}`;
    }
  };

  /**
   * 프로젝트 선택 이벤트를 처리합니다
   *
   * 워크스페이스 드롭다운에서 프로젝트를 선택했을 때 호출되며,
   * 선택된 프로젝트를 전역 상태에 저장하고 해당 프로젝트의
   * 파이프라인들을 자동으로 로드합니다.
   *
   * @param projectId - 선택할 프로젝트의 고유 식별자
   *
   * @example
   * ```typescript
   * handleProjectSelect('project_456')
   * ```
   *
   * @see {@link useProjectStore} - 프로젝트 상태 관리
   * @see {@link usePipelineStore} - 파이프라인 상태 관리
   */
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setIsWorkspaceDropdownOpen(false);
  };

  /**
   * 워크스페이스 드롭다운의 열림/닫힘 상태를 토글합니다
   *
   * 사용자가 프로젝트 이름 영역을 클릭했을 때 드롭다운 메뉴를
   * 표시하거나 숨깁니다.
   *
   * @example
   * ```typescript
   * // 드롭다운이 닫혀있으면 열고, 열려있으면 닫음
   * handleWorkspaceDropdownToggle()
   * ```
   */
  const handleWorkspaceDropdownToggle = () => {
    setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen);
  };

  /**
   * 현재 선택된 프로젝트 정보를 가져옵니다
   *
   * 전역 상태에서 현재 활성화된 프로젝트의 상세 정보를 조회합니다.
   * 프로젝트가 선택되지 않은 경우 null을 반환합니다.
   *
   * @returns 선택된 프로젝트 객체 (name, githubOwner, githubRepoName 등 포함) 또는 null
   *
   * @example
   * ```typescript
   * const project = getSelectedProjectInfo()
   * if (project) {
   *   console.log(`Project: ${project.name} by ${project.githubOwner}`)
   * }
   * ```
   */
  const getSelectedProjectInfo = () => {
    return getSelectedProject();
  };

  // 로딩 상태 확인
  const isLoading = isProjectsLoading || isPipelinesLoading;
  // const _hasError = projectsError || pipelinesError; // 추후 에러 처리 시 사용 예정

  // 레이아웃 모드에 따라 다른 positioning 사용
  const containerClassName = isCanvasLayout
    ? "fixed left-4 top-4 w-72 z-50 flex flex-col space-y-3 h-[calc(100vh-2rem)]" // 캔버스 모드: floating
    : "relative w-full h-full flex flex-col space-y-3"; // 표준 모드: 부모 컨테이너에 맞춤

  // 로딩 중이면 스켈레톤 표시
  if (isLoading && projects.length === 0) {
    return (
      <div className={containerClassName}>
        <SidebarSkeleton />
      </div>
    );
  }

  /**
   * 검색 쿼리를 기반으로 블록 팔레트를 필터링합니다
   *
   * 사용자가 입력한 검색어에 따라 블록 목록을 실시간으로 필터링합니다.
   * 검색은 대소문자를 구분하지 않으며, 블록 이름의 일부분만 일치해도
   * 결과에 포함됩니다.
   *
   * @returns 검색 조건에 맞는 블록들의 필터링된 배열
   *
   * @example
   * ```typescript
   * // searchBlocks = 'ag' 일 때
   * getFilteredBlocks() // [{ name: 'Agent', icon: '🤖', ... }]
   *
   * // searchBlocks = '' 일 때 (빈 문자열)
   * getFilteredBlocks() // 모든 블록 반환
   * ```
   */
  const getFilteredBlocks = (): Block[] => {
    return blocks.filter((block) =>
      block.name.toLowerCase().includes(searchBlocks.toLowerCase())
    );
  };

  /**
   * 설정 버튼 클릭 이벤트를 처리합니다
   *
   * 하단 네비게이션의 설정 아이콘을 클릭했을 때 설정 모달을
   * 화면에 표시합니다. 모달은 React Portal을 통해 전체 화면에
   * 오버레이로 렌더링됩니다.
   *
   * @example
   * ```typescript
   * // 설정 아이콘 클릭 시 자동으로 호출됨
   * handleSettingsClick()
   * ```
   *
   * @see {@link SettingsModal} - 설정 모달 컴포넌트
   */
  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  /**
   * 설정 모달 닫기 이벤트를 처리합니다
   *
   * 다양한 사용자 액션에 의해 설정 모달을 닫습니다:
   * - ESC 키 누름
   * - 모달 외부 영역(백드롭) 클릭
   * - 모달 내부의 닫기 버튼 클릭
   *
   * @example
   * ```typescript
   * // SettingsModal의 onClose prop으로 전달됨
   * <SettingsModal onClose={handleSettingsModalClose} />
   * ```
   */
  const handleSettingsModalClose = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div className={containerClassName}>
      {/* Workspace Header Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1" ref={workspaceDropdownRef}>
            {/* 워크스페이스 드롭다운 버튼 */}
            <button
              onClick={handleWorkspaceDropdownToggle}
              className="flex items-center space-x-2 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {getSelectedProjectInfo()?.name || "프로젝트 선택 안됨"}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  {getSelectedProjectInfo()?.githubOwner || "소유자 없음"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isWorkspaceDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 프로젝트 드롭다운 메뉴 */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {isProjectsLoading ? (
                    <WorkspaceDropdownSkeleton />
                  ) : projects.length > 0 ? (
                    projects.map((project) => (
                      <button
                        key={project.projectId}
                        onClick={() => handleProjectSelect(project.projectId)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          project.projectId === selectedProjectId
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <div
                            className={`font-medium truncate ${
                              project.projectId === selectedProjectId
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            {project.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {project.githubOwner}/{project.githubRepoName}
                          </div>
                        </div>
                        {project.projectId === selectedProjectId && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center text-gray-500 text-sm">
                      아직 프로젝트가 없습니다
                    </div>
                  )}

                  {/* 새 프로젝트 만들기 */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() =>
                        (window.location.href = "/projects/onboarding")
                      }
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>새 프로젝트 만들기</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 복사 버튼 */}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-2">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pipelines Section Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {getSelectedProjectInfo()?.name
              ? `${getSelectedProjectInfo()?.name} Pipelines`
              : "Pipelines"}
          </h3>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {isPipelinesLoading ? (
            // 파이프라인 로딩 스켈레톤
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center p-2.5 rounded-lg border border-gray-100 animate-pulse"
              >
                <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))
          ) : currentPipelines.length > 0 ? (
            currentPipelines.map((pipeline) => (
              <div
                key={pipeline.pipelineId}
                className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  pipeline.isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-50 text-gray-700 border border-transparent"
                }`}
                onClick={() => handlePipelineSelect(pipeline.pipelineId)}
              >
                <span className="mr-3 text-lg">{pipeline.icon}</span>
                <span className="text-sm font-medium truncate">
                  {pipeline.name}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              {selectedProjectId
                ? "파이프라인이 없습니다"
                : "프로젝트를 선택하세요"}
            </div>
          )}
        </div>
      </div>

      {/* Blocks Palette Section Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="블록 검색..."
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={searchBlocks}
              onChange={(e) => setSearchBlocks(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {getFilteredBlocks().map((block) => (
            <div
              key={block.name}
              className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-sm"
              draggable
              onDragStart={(e) => handleBlockDragStart(e, block.name)}
            >
              <div
                className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform shadow-sm`}
              >
                <span className="text-white text-sm font-medium">
                  {block.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {block.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section Cards */}
      <div className="space-y-2">
        {/* Navigation Icons Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            {bottomIcons.map((item, index) => (
              <button
                key={index}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={item.title}
                onClick={
                  item.title === "Settings" ? handleSettingsClick : undefined
                }
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 
        Settings Modal - React Portal을 통해 document.body에 직접 렌더링
        전체 화면 중앙에 블러 배경과 함께 표시되며 사이드바 레이아웃 제약을 벗어남
      */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsModalClose}
      />
    </div>
  );
};

export default GlobalSidebar;
