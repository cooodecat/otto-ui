import { create } from 'zustand';

/**
 * 프로젝트 정보 인터페이스
 */
export interface Project {
  /** 프로젝트 고유 ID */
  projectId: string;
  /** 프로젝트 이름 */
  name: string;
  /** GitHub 소유자 */
  githubOwner: string;
  /** GitHub 리포지토리 이름 */
  githubRepoName: string;
  /** 생성일 */
  createdAt?: string;
  /** 수정일 */
  updatedAt?: string;
}

/**
 * 프로젝트 스토어 상태 인터페이스
 */
interface ProjectStoreState {
  /** 프로젝트 목록 */
  projects: Project[];
  /** 현재 선택된 프로젝트 ID */
  selectedProjectId: string | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  error: string | null;
}

/**
 * 프로젝트 스토어 액션 인터페이스
 */
interface ProjectStoreActions {
  /** 프로젝트 목록 가져오기 */
  fetchProjects: () => Promise<void>;
  /** 프로젝트 선택 */
  setSelectedProject: (projectId: string) => void;
  /** 선택된 프로젝트 정보 가져오기 */
  getSelectedProject: () => Project | null;
  /** 프로젝트 추가 */
  addProject: (project: Project) => void;
  /** 프로젝트 업데이트 */
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  /** 프로젝트 삭제 */
  removeProject: (projectId: string) => void;
  /** 에러 설정 */
  setError: (error: string | null) => void;
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
}

/**
 * 프로젝트 스토어 타입
 */
type ProjectStore = ProjectStoreState & ProjectStoreActions;

/**
 * 프로젝트 관리를 위한 Zustand 스토어
 *
 * 기능:
 * - 프로젝트 목록 관리
 * - 현재 선택된 프로젝트 추적
 * - 로딩 및 에러 상태 관리
 * - CRUD 작업 지원
 */
export const useProjectStore = create<ProjectStore>((set, get) => ({
  // 초기 상태
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,

  // 액션들
  fetchProjects: async () => {
    set({ isLoading: true, error: null });

    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000)); // 가짜 로딩

      const mockProjects: Project[] = [
        {
          projectId: 'proj_1',
          name: 'Otto Frontend',
          githubOwner: 'dbswl030',
          githubRepoName: 'otto-frontend',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        },
        {
          projectId: 'proj_2',
          name: 'Otto Backend',
          githubOwner: 'dbswl030',
          githubRepoName: 'otto-backend',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        },
        {
          projectId: 'proj_3',
          name: 'Data Pipeline',
          githubOwner: 'dbswl030',
          githubRepoName: 'data-pipeline',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15'
        }
      ];

      set({
        projects: mockProjects,
        isLoading: false,
        // 첫 번째 프로젝트를 기본 선택
        selectedProjectId: mockProjects.length > 0 ? mockProjects[0].projectId : null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false
      });
    }
  },

  setSelectedProject: (projectId: string) => {
    set({ selectedProjectId: projectId });
  },

  getSelectedProject: () => {
    const { projects, selectedProjectId } = get();
    return projects.find(project => project.projectId === selectedProjectId) || null;
  },

  addProject: (project: Project) => {
    set(state => ({
      projects: [...state.projects, project]
    }));
  },

  updateProject: (projectId: string, updates: Partial<Project>) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.projectId === projectId
          ? { ...project, ...updates }
          : project
      )
    }));
  },

  removeProject: (projectId: string) => {
    set(state => {
      const newProjects = state.projects.filter(project => project.projectId !== projectId);
      return {
        projects: newProjects,
        // 삭제된 프로젝트가 선택되어 있었다면 선택 해제
        selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId
      };
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));