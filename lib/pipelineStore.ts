import { create } from "zustand";

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
  status: "active" | "inactive" | "draft";
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
  /** 프로젝트별 최신 파이프라인 가져오기 (숫자가 클수록 최신) */
  getLatestPipelineByProject: (projectId: string) => Pipeline | null;
  /** 전체에서 가장 최신 파이프라인 가져오기 (숫자가 클수록 최신) */
  getLatestPipeline: () => Pipeline | null;
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
    const { pipelines } = get();

    // 이미 해당 프로젝트의 파이프라인이 로드되어 있는지 확인
    const existingPipelines = pipelines.filter(
      (p) => p.projectId === projectId
    );
    if (existingPipelines.length > 0) {
      // 이미 로드된 경우 중복 호출 방지
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 mock 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 800)); // 가짜 로딩

      // NOTE: 데이터베이스에서도 동일한 규칙 적용 예정
      // 파이프라인 ID는 프로젝트별로 1부터 시작 (proj_1: pipe_1,pipe_2 / proj_2: pipe_1 / proj_3: pipe_1,pipe_2)
      const mockPipelines: Pipeline[] = [
        // proj_1의 파이프라인들
        {
          pipelineId: "pipe_1",
          name: "CI/CD Pipeline",
          projectId: "proj_1",
          description: "Continuous integration and deployment",
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-20",
          lastRunAt: "2024-01-22",
        },
        {
          pipelineId: "pipe_2",
          name: "Data Processing",
          projectId: "proj_1",
          description: "Daily data processing pipeline",
          status: "active",
          createdAt: "2024-01-16",
          updatedAt: "2024-01-21",
          lastRunAt: "2024-01-23",
        },
        // proj_2의 파이프라인
        {
          pipelineId: "pipe_1",
          name: "Testing Pipeline",
          projectId: "proj_2",
          description: "Automated testing workflow",
          status: "active",
          createdAt: "2024-01-20",
          updatedAt: "2024-01-25",
        },
        // proj_3의 파이프라인들 (가장 최신 프로젝트)
        {
          pipelineId: "pipe_1",
          name: "Staging Pipeline",
          projectId: "proj_3",
          description: "Staging environment deployment",
          status: "active",
          createdAt: "2024-01-25",
          updatedAt: "2024-01-28",
        },
        {
          pipelineId: "pipe_2",
          name: "Production Pipeline",
          projectId: "proj_3",
          description: "Production deployment automation",
          status: "active",
          createdAt: "2024-01-26",
          updatedAt: "2024-01-30",
        },
      ];

      // 요청된 프로젝트의 파이프라인만 필터링
      const projectPipelines = mockPipelines.filter(
        (pipeline) => pipeline.projectId === projectId
      );

      set((state) => ({
        pipelines: [
          // 다른 프로젝트의 파이프라인은 유지하고, 현재 프로젝트 파이프라인만 업데이트
          ...state.pipelines.filter((p) => p.projectId !== projectId),
          ...projectPipelines,
        ],
        isLoading: false,
        currentProjectId: projectId,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch pipelines",
        isLoading: false,
      });
    }
  },

  setCurrentProject: (projectId: string) => {
    const { fetchPipelines, currentProjectId } = get();

    // 이미 동일한 프로젝트가 선택되어 있으면 중복 호출 방지
    if (currentProjectId === projectId) {
      return;
    }

    set({ currentProjectId: projectId });
    fetchPipelines(projectId);
  },

  setSelectedPipeline: (pipelineId: string) => {
    set({ selectedPipelineId: pipelineId });
  },

  getPipelinesByProject: (projectId: string) => {
    const { pipelines } = get();
    return pipelines.filter((pipeline) => pipeline.projectId === projectId);
  },

  getLatestPipelineByProject: (projectId: string) => {
    const { pipelines } = get();
    const projectPipelines = pipelines.filter(
      (pipeline) => pipeline.projectId === projectId
    );

    if (projectPipelines.length === 0) return null;

    // NOTE: 데이터베이스에서도 동일한 로직 적용 예정
    // 숫자가 클수록 최신 파이프라인 (pipe_4 > pipe_3 > pipe_2 > pipe_1)
    return projectPipelines.sort((a, b) => {
      const numA = parseInt(a.pipelineId.replace("pipe_", ""));
      const numB = parseInt(b.pipelineId.replace("pipe_", ""));
      return numB - numA; // 내림차순 정렬
    })[0];
  },

  getLatestPipeline: () => {
    const { pipelines } = get();
    if (pipelines.length === 0) return null;

    // NOTE: 데이터베이스에서도 동일한 로직 적용 예정
    // 전체 파이프라인 중 숫자가 가장 큰 것 (pipe_4 > pipe_3 > pipe_2 > pipe_1)
    return pipelines.sort((a, b) => {
      const numA = parseInt(a.pipelineId.replace("pipe_", ""));
      const numB = parseInt(b.pipelineId.replace("pipe_", ""));
      return numB - numA; // 내림차순 정렬
    })[0];
  },

  getSelectedPipeline: () => {
    const { pipelines, selectedPipelineId } = get();
    return (
      pipelines.find(
        (pipeline) => pipeline.pipelineId === selectedPipelineId
      ) || null
    );
  },

  addPipeline: (pipeline: Pipeline) => {
    set((state) => ({
      pipelines: [...state.pipelines, pipeline],
    }));
  },

  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => {
    set((state) => ({
      pipelines: state.pipelines.map((pipeline) =>
        pipeline.pipelineId === pipelineId
          ? { ...pipeline, ...updates }
          : pipeline
      ),
    }));
  },

  removePipeline: (pipelineId: string) => {
    set((state) => {
      const newPipelines = state.pipelines.filter(
        (pipeline) => pipeline.pipelineId !== pipelineId
      );
      return {
        pipelines: newPipelines,
        // 삭제된 파이프라인이 선택되어 있었다면 선택 해제
        selectedPipelineId:
          state.selectedPipelineId === pipelineId
            ? null
            : state.selectedPipelineId,
      };
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
