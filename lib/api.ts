// 백엔드 API 호출을 위한 유틸리티 함수들
// otto-handler 백엔드 프로젝트(NestJS)와 통신

import type {
  User,
  ApiResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  ApiError,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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
    const response = await this.request<{ data?: { user: User }, user?: User }>(
      "/auth/profile"
    );
    if (response.data) {
      // 백엔드 응답 형식에 맞게 수정
      return { data: response.data.data?.user || response.data.user };
    }
    return { error: response.error };
  }

  async updateUserProfile(
    updates: UpdateUserProfileRequest
  ): Promise<ApiResponse<User>> {
    const response = await this.request<UpdateUserProfileResponse>(
      "/auth/profile",
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

  // 프로젝트 관련 API
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/projects");
  }

  async getProject(projectId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/projects/${projectId}`);
  }

  async createProject(data: {
    name: string;
    description?: string;
    github_owner?: string;
    github_repo_name?: string;
    selected_branch?: string;
    github_installation_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createProjectWithGithub(data: {
    name: string;
    description: string;
    installationId: string;
    githubRepoId: string;
    githubRepoUrl: string;
    githubRepoName: string;
    githubOwner: string;
    selectedBranch: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/projects/with-github", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // GitHub 관련 API
  async getGithubInstallations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/projects/github-installations");
  }

  async getGithubRepositories(installationId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/projects/github-installations/${installationId}/repositories`
    );
  }

  async getGithubBranches(
    installationId: string,
    owner: string,
    repo: string
  ): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/projects/github-installations/${installationId}/repositories/${owner}/${repo}/branches`
    );
  }

  // 파이프라인 관련 API
  async getPipelines(projectId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/pipelines/project/${projectId}`);
  }

  async getPipeline(pipelineId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/pipelines/${pipelineId}`);
  }

  async createPipeline(projectId: string, data: {
    name?: string;
    blocks?: any[];
    artifacts?: string[];
    environment_variables?: Record<string, string>;
    cache?: { paths: string[] };
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/pipelines`, {
      method: "POST",
      body: JSON.stringify({
        projectId: projectId,
        name: data.name,
        flowData: {
          nodes: data.blocks || [],
          edges: []
        }
      }),
    });
  }

  async updatePipeline(
    pipelineId: string,
    data: {
      name?: string;
      blocks?: any[];
      artifacts?: string[];
      environment_variables?: Record<string, string>;
      cache?: { paths: string[] };
    }
  ): Promise<ApiResponse<any>> {
    const requestBody: any = {};
    
    // name 필드가 있으면 추가
    if (data.name !== undefined) {
      requestBody.name = data.name;
    }
    
    // flow 데이터가 있으면 추가
    if (data.blocks !== undefined) {
      requestBody.flowData = {
        nodes: data.blocks,
        edges: []
      };
    }
    
    return this.request<any>(`/pipelines/${pipelineId}`, {
      method: "PUT",
      body: JSON.stringify(requestBody),
    });
  }

  async deletePipeline(pipelineId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/pipelines/${pipelineId}`, {
      method: "DELETE",
    });
  }

  // 빌드 관련 API
  async startBuild(
    projectId: string,
    data: {
      version: string;
      runtime: string;
      blocks: any[];
      environment_variables?: Record<string, string>;
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/codebuild/${projectId}/start-flow`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getBuildStatus(buildId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/codebuild/status/${buildId}`);
  }

  async getProjectBuilds(projectId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/builds/projects/${projectId}`);
  }

  async getBuild(buildId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/builds/${buildId}`);
  }

  async getBuildStats(projectId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/builds/stats/summary?projectId=${projectId}`);
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
  };
};

// JWT 토큰 관리 유틸리티
export const setApiToken = (token: string) => {
  apiClient.setSupabaseToken(token);
};

export default apiClient;
