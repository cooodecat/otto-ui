import { create } from "zustand";
import apiClient from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

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
  status?: "active" | "inactive" | "draft";
  /** 블록 데이터 */
  blocks?: Record<string, unknown>[];
  /** 아티팩트 경로 */
  artifacts?: string[];
  /** 환경 변수 */
  environment_variables?: Record<string, string>;
  /** 캐시 설정 */
  cache?: { paths: string[] };
  /** 생성일 */
  createdAt?: string;
  /** 수정일 */
  updatedAt?: string;
  /** 마지막 실행일 */
  lastRunAt?: string;
  
  // Snake case aliases for API compatibility
  pipeline_id?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
  last_run_at?: string;
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
  /** 프로젝트별 로드 상태 추적 */
  loadedProjects: Set<string>;
}

/**
 * 파이프라인 스토어 액션 인터페이스
 */
interface PipelineStoreActions {
  /** 파이프라인 목록 가져오기 */
  fetchPipelines: (projectId: string) => Promise<void>;
  /** 단일 파이프라인 가져오기 */
  fetchPipeline: (pipelineId: string) => Promise<Pipeline | null>;
  /** 현재 프로젝트 설정 */
  setCurrentProject: (projectId: string) => void;
  /** 파이프라인 선택 */
  setSelectedPipeline: (pipelineId: string) => void;
  /** 프로젝트별 파이프라인 목록 가져오기 */
  getPipelinesByProject: (projectId: string) => Pipeline[];
  /** 선택된 파이프라인 정보 가져오기 */
  getSelectedPipeline: () => Pipeline | null;
  /** 프로젝트별 최신 파이프라인 가져오기 */
  getLatestPipelineByProject: (projectId: string) => Pipeline | null;
  /** 파이프라인 추가 */
  addPipeline: (pipeline: Pipeline) => void;
  /** 파이프라인 업데이트 */
  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => Promise<void>;
  /** 파이프라인 삭제 */
  removePipeline: (pipelineId: string) => Promise<void>;
  /** 에러 설정 */
  setError: (error: string | null) => void;
  /** 로딩 상태 설정 */
  setLoading: (loading: boolean) => void;
  /** 캐시 클리어 */
  clearCache: () => void;
}

/**
 * 파이프라인 스토어 타입
 */
type PipelineStore = PipelineStoreState & PipelineStoreActions;

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
 * 파이프라인 관리를 위한 Zustand 스토어
 *
 * 기능:
 * - 프로젝트별 파이프라인 목록 관리
 * - 현재 선택된 파이프라인 추적
 * - 로딩 및 에러 상태 관리
 * - CRUD 작업 지원
 * - Supabase DB 연동
 */
export const usePipelineStore = create<PipelineStore>((set, get) => ({
  // 초기 상태
  pipelines: [],
  currentProjectId: null,
  selectedPipelineId: null,
  isLoading: false,
  error: null,
  loadedProjects: new Set(),

  // 액션들
  fetchPipelines: async (projectId: string) => {
    console.log('[PipelineStore] fetchPipelines called for projectId:', projectId);
    const { loadedProjects } = get();

    if (loadedProjects.has(projectId)) {
      // 이미 로드된 경우에도 다시 로드 (캐시 무시)
      console.log("[PipelineStore] Project already loaded, but re-fetching:", projectId);
      // return; // 캐시 무시하고 다시 로드
    }

    set({ isLoading: true, error: null, currentProjectId: projectId });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // 실제 API 호출
      console.log('[PipelineStore] Fetching pipelines from API for project:', projectId);
      const response = await apiClient.getPipelines(projectId);
      console.log('[PipelineStore] Raw API Response:', response);
      
      if (response.error) {
        console.error('[PipelineStore] API Error:', response.error);
        throw new Error(response.error);
      }

      // API 응답이 배열인지 객체인지 확인
      const pipelinesData = response.data;
      let pipelines = [];
      
      if (Array.isArray(pipelinesData)) {
        pipelines = pipelinesData;
      } else if (pipelinesData && typeof pipelinesData === 'object') {
        // 객체 응답에서 pipelines 배열 추출 시도
        if ('pipelines' in pipelinesData) {
          pipelines = Array.isArray((pipelinesData as any).pipelines) ? (pipelinesData as any).pipelines : [];
        } else if ('data' in pipelinesData) {
          pipelines = Array.isArray((pipelinesData as any).data) ? (pipelinesData as any).data : [];
        }
      }
      
      console.log('[PipelineStore] Pipeline API Response data:', response.data);
      console.log('[PipelineStore] Extracted pipelines:', pipelines);
      console.log('[PipelineStore] Number of pipelines:', pipelines?.length || 0);
      
      // 파이프라인 데이터 형식 변환 (백엔드 응답 형식에 맞게)
      const formattedPipelines: Pipeline[] = Array.isArray(pipelines)
        ? pipelines.map((pipeline: Record<string, any>) => {
          console.log('[PipelineStore] Mapping pipeline:', pipeline);
          const mapped = {
            pipelineId: pipeline.id || pipeline.pipeline_id,
            name: pipeline.name || 'Untitled Pipeline',
            projectId: pipeline.projectId || pipeline.project_id || projectId,
            description: pipeline.description,
            status: pipeline.status || (pipeline.isActive ? 'active' : 'draft'),
            blocks: pipeline.data?.blocks || pipeline.blocks || pipeline.flowData?.blocks || [],
            artifacts: pipeline.data?.artifacts || pipeline.artifacts,
            environment_variables: pipeline.data?.environment_variables || pipeline.environment_variables,
            cache: pipeline.data?.cache || pipeline.cache,
            createdAt: pipeline.createdAt || pipeline.created_at,
            updatedAt: pipeline.updatedAt || pipeline.updated_at,
            lastRunAt: pipeline.lastRunAt || pipeline.last_run_at
          };
          console.log('[PipelineStore] Mapped pipeline:', mapped);
          return mapped;
        })
      : [];
      
      console.log('[PipelineStore] Formatted pipelines:', formattedPipelines);

      set((state) => {
        // 기존 파이프라인에서 해당 프로젝트의 것들 제거하고 새로 추가
        const otherPipelines = state.pipelines.filter(p => p.projectId !== projectId);
        const newLoadedProjects = new Set(state.loadedProjects);
        newLoadedProjects.add(projectId);

        return {
          pipelines: [...otherPipelines, ...formattedPipelines],
          loadedProjects: newLoadedProjects,
          isLoading: false,
          // 첫 번째 파이프라인을 자동 선택
          selectedPipelineId: formattedPipelines.length > 0 ? formattedPipelines[0].pipelineId : null
        };
      });
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch pipelines",
        isLoading: false,
      });
    }
  },

  fetchPipeline: async (pipelineId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // 실제 API 호출
      const response = await apiClient.getPipeline(pipelineId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const pipeline = response.data;
      
      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      // 파이프라인 데이터 형식 변환
      const formattedPipeline: Pipeline = {
        pipelineId: pipeline.id || pipeline.pipeline_id,
        name: pipeline.name || 'Untitled Pipeline',
        projectId: pipeline.project_id,
        description: pipeline.description,
        status: pipeline.status || 'draft',
        blocks: pipeline.blocks || [],
        artifacts: pipeline.artifacts,
        environment_variables: pipeline.environment_variables,
        cache: pipeline.cache,
        createdAt: pipeline.created_at,
        updatedAt: pipeline.updated_at,
        lastRunAt: pipeline.last_run_at
      };

      // 스토어에 업데이트 또는 추가
      set((state) => {
        const existingIndex = state.pipelines.findIndex(p => p.pipelineId === pipelineId);
        const updatedPipelines = [...state.pipelines];
        
        if (existingIndex >= 0) {
          updatedPipelines[existingIndex] = formattedPipeline;
        } else {
          updatedPipelines.push(formattedPipeline);
        }

        return {
          pipelines: updatedPipelines,
          isLoading: false
        };
      });

      return formattedPipeline;
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch pipeline',
        isLoading: false
      });
      return null;
    }
  },

  setCurrentProject: (projectId: string) => {
    set({ currentProjectId: projectId });
  },

  setSelectedPipeline: (pipelineId: string) => {
    set({ selectedPipelineId: pipelineId });
  },

  getPipelinesByProject: (projectId: string) => {
    const { pipelines } = get();
    return pipelines.filter((pipeline) => pipeline.projectId === projectId);
  },

  getSelectedPipeline: () => {
    const { pipelines, selectedPipelineId } = get();
    return (
      pipelines.find(
        (pipeline) => pipeline.pipelineId === selectedPipelineId
      ) || null
    );
  },

  getLatestPipelineByProject: (projectId: string) => {
    const { pipelines } = get();
    const projectPipelines = pipelines.filter(p => p.projectId === projectId);
    
    if (projectPipelines.length === 0) return null;

    // 생성일 기준으로 최신 파이프라인 반환
    return projectPipelines.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // 내림차순 정렬
    })[0];
  },

  addPipeline: (pipeline: Pipeline) => {
    set((state) => ({
      pipelines: [...state.pipelines, pipeline],
    }));
  },

  updatePipeline: async (pipelineId: string, updates: Partial<Pipeline>) => {
    set({ isLoading: true, error: null });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // API 호출로 파이프라인 업데이트
      const response = await apiClient.updatePipeline(pipelineId, {
        name: updates.name,
        blocks: updates.blocks,
        artifacts: updates.artifacts,
        environment_variables: updates.environment_variables,
        cache: updates.cache
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      // 로컬 상태 업데이트
      set(state => ({
        pipelines: state.pipelines.map(pipeline =>
          pipeline.pipelineId === pipelineId
            ? { ...pipeline, ...updates, updatedAt: new Date().toISOString() }
            : pipeline
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to update pipeline:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update pipeline',
        isLoading: false
      });
      throw error;
    }
  },

  removePipeline: async (pipelineId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Supabase 토큰 설정
      await setAuthToken();
      
      // API 호출로 파이프라인 삭제
      const response = await apiClient.deletePipeline(pipelineId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      set(state => {
        const newPipelines = state.pipelines.filter(p => p.pipelineId !== pipelineId);
        return {
          pipelines: newPipelines,
          // 삭제된 파이프라인이 선택되어 있었다면 선택 해제
          selectedPipelineId: state.selectedPipelineId === pipelineId ? null : state.selectedPipelineId,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete pipeline',
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

  clearCache: () => {
    set({
      pipelines: [],
      loadedProjects: new Set(),
      currentProjectId: null,
      selectedPipelineId: null
    });
  }
}));
