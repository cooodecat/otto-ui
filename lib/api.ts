// 백엔드 API 호출을 위한 유틸리티 함수들
// otto-handler 백엔드 프로젝트(NestJS)와 통신

import type {
  User,
  Pipeline,
  PipelineStep,
  ApiResponse,
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  GetPipelinesResponse,
  GetPipelineResponse,
  CreatePipelineRequest,
  CreatePipelineResponse,
  UpdatePipelineRequest,
  UpdatePipelineResponse,
  DeletePipelineResponse,
  GetPipelineStepsResponse,
  UpdatePipelineStepsRequest,
  UpdatePipelineStepsResponse,
  ApiError,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

// HTTP 클라이언트 클래스
class ApiClient {
  private baseUrl: string;
  private supabaseToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Supabase JWT 토큰 설정 (인증용)
  setSupabaseToken(token: string) {
    this.supabaseToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // JWT 토큰을 Authorization 헤더에 포함
    if (this.supabaseToken) {
      headers.Authorization = `Bearer ${this.supabaseToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // NestJS 에러 응답 형식 처리
        const error: ApiError = data;
        return {
          error:
            error.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // 사용자 관련 API
  async getUserProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<GetUserProfileResponse>(
      "/api/user/profile"
    );
    if (response.data) {
      return { data: response.data.user };
    }
    return { error: response.error };
  }

  async updateUserProfile(
    updates: UpdateUserProfileRequest
  ): Promise<ApiResponse<User>> {
    const response = await this.request<UpdateUserProfileResponse>(
      "/api/user/profile",
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    if (response.data) {
      return { data: response.data.user };
    }
    return { error: response.error };
  }

  // 파이프라인 관련 API
  async getPipelines(): Promise<ApiResponse<Pipeline[]>> {
    const response = await this.request<GetPipelinesResponse>("/api/pipelines");
    if (response.data) {
      return { data: response.data.pipelines };
    }
    return { error: response.error };
  }

  async getPipeline(id: string): Promise<ApiResponse<Pipeline>> {
    const response = await this.request<GetPipelineResponse>(
      `/api/pipelines/${id}`
    );
    if (response.data) {
      return { data: response.data.pipeline };
    }
    return { error: response.error };
  }

  async createPipeline(
    request: CreatePipelineRequest
  ): Promise<ApiResponse<Pipeline>> {
    const response = await this.request<CreatePipelineResponse>(
      "/api/pipelines",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
    if (response.data) {
      return { data: response.data.pipeline };
    }
    return { error: response.error };
  }

  async updatePipeline(
    id: string,
    updates: UpdatePipelineRequest
  ): Promise<ApiResponse<Pipeline>> {
    const response = await this.request<UpdatePipelineResponse>(
      `/api/pipelines/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    if (response.data) {
      return { data: response.data.pipeline };
    }
    return { error: response.error };
  }

  async deletePipeline(id: string): Promise<ApiResponse<void>> {
    const response = await this.request<DeletePipelineResponse>(
      `/api/pipelines/${id}`,
      {
        method: "DELETE",
      }
    );
    if (response.data) {
      return { data: undefined };
    }
    return { error: response.error };
  }

  // 파이프라인 스텝 관련 API
  async getPipelineSteps(
    pipelineId: string
  ): Promise<ApiResponse<PipelineStep[]>> {
    const response = await this.request<GetPipelineStepsResponse>(
      `/api/pipelines/${pipelineId}/steps`
    );
    if (response.data) {
      return { data: response.data.steps };
    }
    return { error: response.error };
  }

  async updatePipelineSteps(
    pipelineId: string,
    request: UpdatePipelineStepsRequest
  ): Promise<ApiResponse<PipelineStep[]>> {
    const response = await this.request<UpdatePipelineStepsResponse>(
      `/api/pipelines/${pipelineId}/steps`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      }
    );
    if (response.data) {
      return { data: response.data.steps };
    }
    return { error: response.error };
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient(API_BASE_URL);

// React Hook을 위한 유틸리티 함수들
export const useApi = () => {
  return {
    getUserProfile: () => apiClient.getUserProfile(),
    updateUserProfile: (updates: UpdateUserProfileRequest) =>
      apiClient.updateUserProfile(updates),
    getPipelines: () => apiClient.getPipelines(),
    getPipeline: (id: string) => apiClient.getPipeline(id),
    createPipeline: (request: CreatePipelineRequest) =>
      apiClient.createPipeline(request),
    updatePipeline: (id: string, updates: UpdatePipelineRequest) =>
      apiClient.updatePipeline(id, updates),
    deletePipeline: (id: string) => apiClient.deletePipeline(id),
    getPipelineSteps: (pipelineId: string) =>
      apiClient.getPipelineSteps(pipelineId),
    updatePipelineSteps: (
      pipelineId: string,
      request: UpdatePipelineStepsRequest
    ) => apiClient.updatePipelineSteps(pipelineId, request),
  };
};

// JWT 토큰 관리 유틸리티
export const setApiToken = (token: string) => {
  apiClient.setSupabaseToken(token);
};

export default apiClient;
