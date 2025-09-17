"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Settings,
  HelpCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Home,
  Check,
  ScrollText,
  Filter,
  BookOpen,
  Pencil,
  X,
} from 'lucide-react';
import { cicdCategories, nodeRegistry } from '@/components/flow/nodes/node-registry';
import SettingsModal from '../settings/SettingsModal';
import { useProjectStore } from '@/lib/projectStore';
import { usePipelineStore } from '@/lib/pipelineStore';
import { SidebarSkeleton, WorkspaceDropdownSkeleton } from './SidebarSkeleton';
import { mapProjectId, mapPipelineId } from '@/lib/utils/idMapping';
import CreateProjectModal from "../projects/CreateProjectModal";
import CreatePipelineModal from "../pipelines/CreatePipelineModal";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";


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
 * isCanvasLayoutPath('/projects/1/pipelines/1') // true
 * ```
 */
const isCanvasLayoutPath = (pathname: string): boolean => {
  if (pathname === "/pipelines") return true;
  const pipelineDetailPattern = /^\/projects\/[^/]+\/pipelines\/[^/]+$/;
  return pipelineDetailPattern.test(pathname);
};

/**
 * 블록 팔레트를 표시해야 하는 경로인지 확인하는 함수
 * 
 * 파이프라인 에디터 관련 페이지에서만 블록 팔레트를 표시합니다.
 * 로그 페이지나 대시보드 페이지에서는 블록 팔레트를 숨깁니다.
 * 
 * @param pathname - 현재 경로 문자열
 * @returns 블록 팔레트를 표시해야 하는지 여부
 */
const shouldShowBlockPalette = (pathname: string): boolean => {
  // 파이프라인 에디터 페이지
  if (pathname === '/pipelines' || pathname === '/flow-editor') return true;
  
  // 파이프라인 상세 페이지
  const pipelineDetailPattern = /^\/projects\/[^/]+\/pipelines\/[^/]+$/;
  if (pipelineDetailPattern.test(pathname)) return true;
  
  // 로그 페이지나 기타 페이지에서는 표시하지 않음
  return false;
};

/**
 * 로그 페이지인지 확인하는 함수
 * 
 * @param pathname - 현재 경로 문자열
 * @returns 로그 페이지인지 여부
 */
const isLogsPage = (pathname: string): boolean => {
  // 독립적인 /logs 페이지
  if (pathname === '/logs' || pathname.startsWith('/logs/')) return true;
  
  // 프로젝트별 로그 페이지 (나중에 추가될 수 있음)
  if (pathname.includes('/logs')) return true;
  
  return false;
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
  const router = useRouter();
  const isCanvasLayout = isCanvasLayoutPath(pathname);
  const showBlockPalette = shouldShowBlockPalette(pathname);
  const isOnLogsPage = isLogsPage(pathname);
  
  /** 로그 페이지 필터 상태 */
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  /** 글로벌 워크스페이스 검색용 쿼리 */
  const [searchQuery, setSearchQuery] = useState<string>("");

  /** 팔레트에서 블록 필터링을 위한 검색 쿼리 */
  const [searchBlocks, setSearchBlocks] = useState<string>("");

  /** 현재 선택된 파이프라인 ID */
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
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
    error: _projectsError,
    fetchProjects,
    setSelectedProject,
    getSelectedProject,
  } = useProjectStore();

  const {
    pipelines,
    isLoading: isPipelinesLoading,
    error: _pipelinesError,
    fetchPipelines,
    setCurrentProject,
    getPipelinesByProject,
    getLatestPipelineByProject,
  } = usePipelineStore();

  /**
   * Settings 모달의 열림/닫힘 상태를 관리하는 state
   * true일 때 SettingsModal 컴포넌트가 React Portal을 통해 전체 화면에 표시됩니다
   */
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  /** CreateProject 모달 열림/닫힘 상태 */
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState<boolean>(false);
  
  /** CreatePipeline 모달 열림/닫힘 상태 */
  const [isCreatePipelineModalOpen, setIsCreatePipelineModalOpen] =
    useState<boolean>(false);
  
  /** 편집 중인 파이프라인 ID */
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null);
  
  /** 편집 중인 파이프라인 이름 */
  const [editingPipelineName, setEditingPipelineName] = useState<string>("");

  /** 카드 표시/숨김 상태 */
  const [showPipelinesPalette, setShowPipelinesPalette] = useState<boolean>(true);
  
  /** 파이프라인 드롭다운 열림/닫힘 상태 */
  const [isPipelinesDropdownOpen, setIsPipelinesDropdownOpen] = useState<boolean>(false);

  /** 워크스페이스 드롭다운 참조 */
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  
  /** 파이프라인 드롭다운 참조 */
  const pipelinesDropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWorkspaceDropdownOpen(false);
      }
      if (
        pipelinesDropdownRef.current &&
        !pipelinesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPipelinesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 데이터 로딩 및 초기화 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    console.log('[GlobalSidebar] Fetching projects on mount...');
    fetchProjects();
  }, []); // 의존성 배열을 빈 배열로 변경하여 무한 루프 방지
  
  // projects 변경 모니터링
  // Projects가 업데이트될 때 실행
  useEffect(() => {
    // 프로젝트 목록이 업데이트되면 자동으로 UI에 반영됨
  }, [projects]);

  // 선택된 프로젝트가 변경되면 해당 프로젝트의 파이프라인들을 가져옴
  useEffect(() => {
    if (selectedProjectId) {
      setCurrentProject(selectedProjectId);
      fetchPipelines(selectedProjectId);
    }
  }, [selectedProjectId]); // setCurrentProject와 fetchPipelines는 stable하므로 제외

  // 현재 URL 파라미터에서 프로젝트 ID와 파이프라인 ID 추출 및 동기화
  useEffect(() => {
    const pipelineDetailPattern = /^\/projects\/([^/]+)\/pipelines\/([^/]+)$/;
    const match = pathname.match(pipelineDetailPattern);

    if (match) {
      const urlProjectId = match[1];
      const urlPipelineId = match[2];

      // URL에서 추출한 프로젝트 ID로 상태 동기화 (중복 호출 방지)
      if (urlProjectId !== selectedProjectId) {
        setSelectedProject(urlProjectId);
        setCurrentProject(urlProjectId);
        // 프로젝트가 변경되었을 때 파이프라인 다시 로드
        fetchPipelines(urlProjectId);
      }

      setSelectedPipelineId(urlPipelineId);
    } else {
      setSelectedPipelineId(null);
    }
  }, [pathname]);

  /**
   * CI/CD 노드 카테고리에서 검색을 위해 플랫 목록 생성
   */
  const getAllCicdNodes = () => {
    return Object.values(cicdCategories).flatMap((category) => category.nodes);
  };

  // 현재 선택된 프로젝트의 파이프라인들을 변환
  const currentPipelines: PipelineItem[] = useMemo(() => {
    const projectPipelines = selectedProjectId ? getPipelinesByProject(selectedProjectId) : [];
    
    return projectPipelines.map((pipeline) => ({
      name: pipeline.name || `Pipeline ${pipeline.pipelineId?.slice(-6) || 'Unknown'}`,
      pipelineId: pipeline.pipelineId,
      isActive: pipeline.pipelineId === selectedPipelineId,
    }));
  }, [selectedProjectId, selectedPipelineId, pipelines]); // pipelines 추가하여 데이터 변경 시 리렌더링

  /**
   * 하단 네비게이션 아이콘들의 설정
   * 일반적인 워크스페이스 기능에 빠르게 접근할 수 있게 해줍니다
   */
  const bottomIcons: BottomIcon[] = [
    { icon: Settings, title: 'Settings' },
    { icon: HelpCircle, title: 'Help' },
    { icon: ScrollText, title: 'Pipeline Logs' },
    { icon: BookOpen, title: 'Resources' },
    { icon: Home, title: 'Home' },
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
    nodeType: string
  ) => {
    // node-registry에서 정의된 타입 문자열을 그대로 전달해야 함
    e.dataTransfer.setData("application/reactflow", nodeType);
  };

  /**
   * 파이프라인 선택 이벤트를 처리합니다
   *
   * 사용자가 파이프라인 목록에서 특정 파이프라인을 클릭했을 때
   * 해당 파이프라인 페이지로 네비게이션합니다.
   *
   * @param pipelineId - 선택할 파이프라인의 고유 식별자
   *
   * @example
   * ```typescript
   * handlePipelineSelect('pipeline_123')
   * ```
   */
  const handlePipelineSelect = (pipelineId: string) => {
    if (selectedProjectId) {
      const targetUrl = `/projects/${selectedProjectId}/pipelines/${pipelineId}`;
      router.push(targetUrl);
    }
  };

  /**
   * 파이프라인 이름 편집 시작
   */
  const handleEditPipelineName = (pipelineId: string, currentName: string) => {
    setEditingPipelineId(pipelineId);
    setEditingPipelineName(currentName);
  };

  /**
   * 파이프라인 이름 업데이트
   */
  const handleUpdatePipelineName = async () => {
    if (!editingPipelineId || !editingPipelineName.trim()) {
      setEditingPipelineId(null);
      setEditingPipelineName("");
      return;
    }

    try {
      // API 호출하여 파이프라인 이름 업데이트
      const response = await apiClient.updatePipeline(editingPipelineId, {
        name: editingPipelineName
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 스토어 업데이트
      const { updatePipeline } = usePipelineStore.getState();
      await updatePipeline(editingPipelineId, { name: editingPipelineName });

      toast.success("파이프라인 이름이 변경되었습니다.");
    } catch (error) {
      console.error('Failed to update pipeline name:', error);
      toast.error("파이프라인 이름 변경에 실패했습니다.");
    } finally {
      setEditingPipelineId(null);
      setEditingPipelineName("");
    }
  };

  /**
   * 프로젝트 선택 이벤트를 처리합니다
   *
   * 워크스페이스 드롭다운에서 프로젝트를 선택했을 때 호출되며,
   * 선택된 프로젝트를 전역 상태에 저장하고 해당 프로젝트의
   * 최신 파이프라인으로 자동 이동합니다.
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
  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId);
    setIsWorkspaceDropdownOpen(false);

    // 해당 프로젝트의 파이프라인을 먼저 로드
    setCurrentProject(projectId);

    // 잠시 기다린 후 최신 파이프라인 찾기
    setTimeout(() => {
      const latestPipeline = getLatestPipelineByProject(projectId);

      if (latestPipeline) {
        // 최신 파이프라인으로 이동
        router.push(
          `/projects/${projectId}/pipelines/${latestPipeline.pipelineId}`
        );
      } else {
        // 파이프라인이 없는 경우 프로젝트의 첫 번째 파이프라인 페이지로 이동 (기본값 사용)
        router.push(`/projects/${projectId}/pipelines/pipe_1`);
      }
    }, 100); // 파이프라인 로딩을 위한 짧은 지연
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
  const getFilteredNodes = () => {
    const query = searchBlocks.toLowerCase();
    if (!query) return [];
    return getAllCicdNodes().filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
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

  /** CreateProject 모달 열기 및 드롭다운 닫기 */
  const handleCreateProjectClick = () => {
    setIsCreateProjectModalOpen(true);
    setIsWorkspaceDropdownOpen(false); // 드롭다운도 닫기
  };

  /** CreateProject 모달 닫기 */
  const handleCreateProjectModalClose = () => {
    setIsCreateProjectModalOpen(false);
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
              className='flex items-center space-x-2 w-full text-left hover:bg-gray-50 hover:cursor-pointer rounded-lg p-2 -m-2 transition-colors'
            >
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {getSelectedProjectInfo()?.name || "프로젝트 선택 안됨"}
                </h1>
                {getSelectedProjectInfo()?.githubOwner && (
                  <p className="text-xs text-gray-500 truncate">
                    {getSelectedProjectInfo()?.githubOwner}
                  </p>
                )}
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
                  ) : projects && projects.length > 0 ? (
                    projects.map((project) => {
                      console.log('[GlobalSidebar] Rendering project:', project);
                      return (
                        <button
                          key={project.projectId}
                          onClick={() => handleProjectSelect(project.projectId)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-gray-50 hover:cursor-pointer transition-colors ${
                            project.projectId === selectedProjectId ? 'bg-blue-50' : ''
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
                      );
                    })
                  ) : (
                    <div className="px-3 py-6 text-center text-gray-500 text-sm">
                      아직 프로젝트가 없습니다
                    </div>
                  )}

                  {/* 새 프로젝트 만들기 */}
                  <div className='border-t border-gray-100 mt-1 pt-1'>
                    <button
                      onClick={handleCreateProjectClick}
                      className='w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:cursor-pointer transition-colors'
                    >
                      <Plus className="w-4 h-4" />
                      <span>새 프로젝트 만들기</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 카드 숨기기/표시 버튼 */}
          <button 
            onClick={() => setShowPipelinesPalette(!showPipelinesPalette)}
            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:cursor-pointer rounded-lg ml-2 transition-colors'
            title={showPipelinesPalette ? "카드 숨기기" : "카드 보이기"}
          >
            {showPipelinesPalette ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
          </button>
        </div>
      </div>

      {/* Pipelines Section Card - 숨김 가능 */}
      {showPipelinesPalette && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Pipelines</h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  if (selectedProjectId) {
                    setIsCreatePipelineModalOpen(true);
                  } else {
                    toast.error("먼저 프로젝트를 선택해주세요.");
                  }
                }}
                className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:cursor-pointer rounded-lg transition-colors'
                title="새 파이프라인 만들기"
              >
                <Plus className='w-3 h-3' />
              </button>
            </div>
          </div>

          {/* 파이프라인 드롭다운 */}
          <div className="relative" ref={pipelinesDropdownRef}>
            <button
              onClick={() => setIsPipelinesDropdownOpen(!isPipelinesDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 truncate">
                {selectedPipelineId && currentPipelines.find(p => p.isActive)?.name || "파이프라인 선택"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isPipelinesDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isPipelinesDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                <div className="py-1">
                  {isPipelinesLoading ? (
                    // 파이프라인 로딩 스켈레톤
                    Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center px-3 py-2.5 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                    ))
                  ) : currentPipelines.length > 0 ? (
                    currentPipelines.map((pipeline) => (
                      <div
                        key={pipeline.pipelineId}
                        className={`group flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          pipeline.isActive ? "bg-blue-50" : ""
                        }`}
                      >
                        {editingPipelineId === pipeline.pipelineId ? (
                          <input
                            type="text"
                            value={editingPipelineName}
                            onChange={(e) => setEditingPipelineName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdatePipelineName();
                              } else if (e.key === 'Escape') {
                                setEditingPipelineId(null);
                                setEditingPipelineName("");
                              }
                            }}
                            onBlur={handleUpdatePipelineName}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => {
                              handlePipelineSelect(pipeline.pipelineId);
                              setIsPipelinesDropdownOpen(false);
                            }}
                            className={`flex-1 text-left truncate ${
                              pipeline.isActive ? "text-blue-700 font-medium" : "text-gray-700"
                            }`}
                          >
                            {pipeline.name}
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-2">
                          {editingPipelineId !== pipeline.pipelineId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPipelineName(pipeline.pipelineId, pipeline.name);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="이름 변경"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {pipeline.isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-sm text-gray-500">
                      파이프라인이 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block Palette Card - 파이프라인 에디터에서만 표시 & 숨김 가능 */}
      {showBlockPalette && showPipelinesPalette && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Block Palette</h3>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-3 h-3" />
            </button>
          </div>

          {/* 블록 검색 */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blocks..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchBlocks}
                onChange={(e) => setSearchBlocks(e.target.value)}
              />
            </div>
          </div>

          {/* 블록 리스트 */}
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 500px)' }}>
            {searchBlocks ? (
              // 검색 결과
              <div className="space-y-2">
                {getFilteredNodes().map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleBlockDragStart(e, node.type)}
                    className="flex items-center p-2 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg mr-2">{node.icon}</span>
                    <span className="text-sm text-gray-700">{node.label}</span>
                  </div>
                ))}
                {getFilteredNodes().length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No blocks found
                  </div>
                )}
              </div>
            ) : (
              // 카테고리별 표시
              Object.entries(cicdCategories)
                .filter(([key]) => key !== 'start')
                .map(([key, category]) => (
                  <div key={key} className="space-y-2">
                    <div className={`flex items-center gap-2 p-2 rounded ${category.bgClass} ${category.borderClass} border`}>
                      <span className="text-base">{category.icon}</span>
                      <h3 className={`text-sm font-medium ${category.textClass}`}>{category.name}</h3>
                      <span className={`text-xs ${category.textClass} opacity-70`}>({category.nodes.length})</span>
                    </div>

                    <div className="space-y-1 ml-2">
                      {category.nodes.map((node) => (
                        <div
                          key={node.type}
                          className="flex items-center p-3 bg-white border border-gray-200 rounded cursor-grab hover:shadow-sm transition-shadow"
                          draggable
                          onDragStart={(e) => handleBlockDragStart(e, node.type)}
                        >
                          <div className={`w-8 h-8 ${node.colorClass} rounded flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-sm">{node.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0 ml-3">
                            <div className="text-sm font-medium text-gray-900 truncate">{node.label}</div>
                            <div className="text-xs text-gray-500 truncate">{node.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}



      {/* Filter - 로그 페이지 전용 */}
      {isOnLogsPage && (
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4'>
          <div className='mb-4'>
            <h3 className='text-sm font-semibold text-gray-800'>Filter</h3>
          </div>

          {/* Filter Buttons */}
          <div className='space-y-2'>
            {[
              { id: 'all', label: '전체 로그', desc: '모든 파이프라인 로그' },
              { id: 'failed', label: '실패한 빌드', desc: 'Status: failed' },
              { id: 'running', label: '실행 중', desc: 'Status: running' },
              { id: '24h', label: '최근 24시간', desc: '지난 24시간 내 로그' },
            ].map((filter) => (
              <button 
                key={filter.id}
                onClick={() => {
                  setActiveFilterId(filter.id);
                  // 필터 적용 로직 - 나중에 로그 페이지와 연동
                  console.log('[GlobalSidebar] Filter selected:', filter.id);
                  // TODO: 로그 페이지로 필터 정보 전달
                }}
                className={`w-full flex items-center p-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeFilterId === filter.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                }`}
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{filter.label}</div>
                  <div className='text-xs text-gray-500 mt-0.5'>{filter.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section Cards */}
      <div className="space-y-2">
        {/* Navigation Icons Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            {bottomIcons.map((item, index) => (
              <button
                key={index}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:cursor-pointer rounded-lg transition-colors'
                title={item.title}
                onClick={
                  item.title === 'Settings' 
                    ? handleSettingsClick 
                    : item.title === 'Pipeline Logs'
                    ? () => {
                        // 프로젝트 단위로 로그 페이지 이동
                        if (selectedProjectId) {
                          router.push(`/projects/${selectedProjectId}/logs`);
                        } else {
                          router.push('/logs');
                        }
                      }
                    : undefined
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

      {/* CreateProject Modal - /projects 페이지의 기능을 모달로 제공 */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={handleCreateProjectModalClose}
      />
      
      {/* CreatePipeline Modal - 파이프라인 생성 */}
      {selectedProjectId && (
        <CreatePipelineModal
          isOpen={isCreatePipelineModalOpen}
          onClose={() => setIsCreatePipelineModalOpen(false)}
          projectId={selectedProjectId}
          projectName={getSelectedProjectInfo()?.name}
        />
      )}
    </div>
  );
};

export default GlobalSidebar;
