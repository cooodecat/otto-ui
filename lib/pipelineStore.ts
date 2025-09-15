import { create } from 'zustand';

/**
 * 파이프라인 정보 인터페이스
 */
export interface Pipeline {
  /** 파이프라인 고유 ID */
  pipelineId: string;
  /** 파이프라인 이름 */
  name: string;
  /** 소속 프로젝트 ID */
  projectId: string;
  /** 파이프라인 설명 */
  description?: string;
  /** 파이프라인 상태 */
  status: 'active' | 'inactive' | 'draft';
  /** 생성일 */
  createdAt?: string;
  /** 수정일 */
  updatedAt?: string;
  /** 마지막 실행일 */
  lastRunAt?: string;
}

/**
 * 파이프라인 스토어 상태 인터페이스
 */
interface PipelineStoreState {
  /** 파이프라인 목록 */
  pipelines: Pipeline[];
  /** 현재 프로젝트 ID */
  currentProjectId: string | null;
  /** 현재 선택된 파이프라인 ID */
  selectedPipelineId: string | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  error: string | null;
}

/**
 * 파이프라인 스토어 액션 인터페이스
 */
interface PipelineStoreActions {
  /** 파이프라인 목록 가져오기 */
  fetchPipelines: (projectId: string) => Promise<void>;
  /** 현재 프로젝트 설정 */
  setCurrentProject: (projectId: string) => void;
  /** 파이프라인 선택 */
  setSelectedPipeline: (pipelineId: string) => void;
  /** 프로젝트별 파이프라인 목록 가져오기 */
  getPipelinesByProject: (projectId: string) => Pipeline[];
  /** 선택된 파이프라인 정보 가져오기 */
  getSelectedPipeline: () => Pipeline | null;
  /** 파이프라인 추가 */
  addPipeline: (pipeline: Pipeline) => void;
  /** 파이프라인 업데이트 */
  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => void;
  /** 파이프라인 삭제 */
  removePipeline: (pipelineId: string) => void;
  /** 에러 설정 */
  setError: (error: string | null) => void;
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
}

/**
 * 파이프라인 스토어 타입
 */
type PipelineStore = PipelineStoreState & PipelineStoreActions;

/**
 * 파이프라인 관리를 위한 Zustand 스토어
 *
 * 기능:
 * - 프로젝트별 파이프라인 목록 관리
 * - 현재 선택된 파이프라인 추적
 * - 로딩 및 에러 상태 관리
 * - CRUD 작업 지원
 */
export const usePipelineStore = create<PipelineStore>((set, get) => ({
  // 초기 상태
  pipelines: [],
  currentProjectId: null,
  selectedPipelineId: null,
  isLoading: false,
  error: null,

  // 액션들
  fetchPipelines: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 800)); // 가짜 로딩

      const mockPipelines: Pipeline[] = [
        {
          pipelineId: 'pipe_1',
          name: 'CI/CD Pipeline',
          projectId: 'proj_1',
          description: 'Continuous integration and deployment',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          lastRunAt: '2024-01-22'
        },
        {
          pipelineId: 'pipe_2',
          name: 'Data Processing',
          projectId: 'proj_1',
          description: 'Daily data processing pipeline',
          status: 'active',
          createdAt: '2024-01-16',
          updatedAt: '2024-01-21',
          lastRunAt: '2024-01-22'
        },
        {
          pipelineId: 'pipe_3',
          name: 'Testing Pipeline',
          projectId: 'proj_2',
          description: 'Automated testing workflow',
          status: 'inactive',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        },
        {
          pipelineId: 'pipe_4',
          name: 'Deployment Pipeline',
          projectId: 'proj_3',
          description: 'Production deployment automation',
          status: 'draft',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15'
        }
      ];

      // 요청된 프로젝트의 파이프라인만 필터링
      const projectPipelines = mockPipelines.filter(pipeline => pipeline.projectId === projectId);

      set(state => ({
        pipelines: [
          // 다른 프로젝트의 파이프라인은 유지하고, 현재 프로젝트 파이프라인만 업데이트
          ...state.pipelines.filter(p => p.projectId !== projectId),
          ...projectPipelines
        ],
        isLoading: false,
        currentProjectId: projectId
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch pipelines',
        isLoading: false
      });
    }
  },

  setCurrentProject: (projectId: string) => {
    const { fetchPipelines } = get();
    set({ currentProjectId: projectId });
    fetchPipelines(projectId);
  },

  setSelectedPipeline: (pipelineId: string) => {
    set({ selectedPipelineId: pipelineId });
  },

  getPipelinesByProject: (projectId: string) => {
    const { pipelines } = get();
    return pipelines.filter(pipeline => pipeline.projectId === projectId);
  },

  getSelectedPipeline: () => {
    const { pipelines, selectedPipelineId } = get();
    return pipelines.find(pipeline => pipeline.pipelineId === selectedPipelineId) || null;
  },

  addPipeline: (pipeline: Pipeline) => {
    set(state => ({
      pipelines: [...state.pipelines, pipeline]
    }));
  },

  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => {
    set(state => ({
      pipelines: state.pipelines.map(pipeline =>
        pipeline.pipelineId === pipelineId
          ? { ...pipeline, ...updates }
          : pipeline
      )
    }));
  },

  removePipeline: (pipelineId: string) => {
    set(state => {
      const newPipelines = state.pipelines.filter(pipeline => pipeline.pipelineId !== pipelineId);
      return {
        pipelines: newPipelines,
        // 삭제된 파이프라인이 선택되어 있었다면 선택 해제
        selectedPipelineId: state.selectedPipelineId === pipelineId ? null : state.selectedPipelineId
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