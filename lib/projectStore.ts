import { create } from 'zustand';
import apiClient from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Project, CreateProjectWithGithubRequest } from '@/types/api';

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
  /** 가장 최신 프로젝트 가져오기 */
  getLatestProject: () => Project | null;
  /** 프로젝트 추가 */
  addProject: (project: Project) => void;
  /** 프로젝트 생성 (GitHub 연동) */
  createProjectWithGithub: (data: CreateProjectWithGithubRequest) => Promise<void>;
  /** 프로젝트 업데이트 */
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  /** 프로젝트 삭제 */
  removeProject: (projectId: string) => Promise<void>;
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
 * Supabase 토큰 설정 헬퍼 함수
 */
async function setAuthToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    apiClient.setSupabaseToken(session.access_token);
  }
}

/**
 * 프로젝트 관리를 위한 Zustand 스토어
 *
 * 기능:
 * - 프로젝트 목록 관리
 * - 현재 선택된 프로젝트 추적
 * - 로딩 및 에러 상태 관리
 * - CRUD 작업 지원
 * - Supabase DB 연동
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
      // Supabase 토큰 설정
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[ProjectStore] Session:', session);
      console.log('[ProjectStore] User ID:', session?.user?.id);
      console.log('[ProjectStore] Access Token exists:', !!session?.access_token);
      
      if (session?.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }
      
      // 실제 API 호출
      console.log('[ProjectStore] Fetching projects from API...');
      const response = await apiClient.getProjects();
      console.log('[ProjectStore] Raw API Response:', response);
      
      if (response.error) {
        console.error('[ProjectStore] API Error:', response.error);
        throw new Error(response.error);
      }

      // API 응답이 배열인지 확인 (백엔드가 객체로 래핑해서 보낼 수 있음)
      const projectsData = response.data;
      const projects = Array.isArray(projectsData) 
        ? projectsData 
        : (projectsData?.projects || []);
      
      console.log('[ProjectStore] API Response data:', response.data);
      console.log('[ProjectStore] Extracted projects:', projects);
      console.log('[ProjectStore] Number of projects:', projects?.length || 0);
      
      // 프로젝트 데이터를 그대로 사용 (API Project 타입과 일치)
      const formattedProjects: Project[] = Array.isArray(projects) ? projects : [];
      
      console.log('[ProjectStore] Formatted projects:', formattedProjects);

      set((state) => ({
        projects: formattedProjects,
        isLoading: false,
        // 기존 선택된 프로젝트가 있으면 유지, 없으면 첫 번째 선택
        selectedProjectId: state.selectedProjectId ||
          (formattedProjects.length > 0 ? formattedProjects[0].project_id : null)
      }));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
        isLoading: false,
      });
    }
  },

  setSelectedProject: (projectId: string) => {
    set({ selectedProjectId: projectId });
  },

  getSelectedProject: () => {
    const { projects, selectedProjectId } = get();
    return (
      projects.find((project) => project.project_id === selectedProjectId) ||
      null
    );
  },

  getLatestProject: () => {
    const { projects } = get();
    if (projects.length === 0) return null;

    // 생성일 기준으로 최신 프로젝트 반환
    return projects.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // 내림차순 정렬
    })[0];
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  createProjectWithGithub: async (data: CreateProjectWithGithubRequest) => {
    set({ isLoading: true, error: null });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // API 호출로 프로젝트 생성 (파이프라인도 자동 생성됨)
      const response = await apiClient.createProjectWithGithub(data);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const createdProject = response.data;
      
      // 생성된 프로젝트를 스토어에 추가
      const newProject: Project = {
        project_id: createdProject.project_id,
        name: createdProject.name,
        description: createdProject.description,
        github_owner: data.githubOwner,
        github_repo_name: data.githubRepoName,
        github_repo_id: data.githubRepoId,
        github_repo_url: data.githubRepoUrl,
        selected_branch: data.selectedBranch,
        installation_id: data.installationId,
        user_id: createdProject.user_id,
        created_at: createdProject.created_at,
        updated_at: createdProject.updated_at,
        codebuild_status: null,
        codebuild_project_name: null,
        codebuild_project_arn: null,
        cloudwatch_log_group: null,
        codebuild_error_message: null
      };

      set(state => ({
        projects: [...state.projects, newProject],
        selectedProjectId: newProject.project_id, // 생성된 프로젝트를 자동 선택
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to create project:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false
      });
      throw error; // 상위에서 에러 처리할 수 있도록 다시 던짐
    }
  },

  updateProject: (projectId: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.project_id === projectId ? { ...project, ...updates } : project
      ),
    }));
  },

  removeProject: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // API 호출로 프로젝트 삭제
      const response = await apiClient.deleteProject(projectId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      set(state => {
        const newProjects = state.projects.filter(project => project.project_id !== projectId);
        return {
          projects: newProjects,
          // 삭제된 프로젝트가 선택되어 있었다면 선택 해제
          selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false
      });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
