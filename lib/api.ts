// 백엔드 API 호출을 위한 유틸리티 함수들
// otto-handler 백엔드 프로젝트(NestJS)와 통신

import type {
  User,
  ApiResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  ApiError,
  GitHubInstallationsResponse,
  GitHubInstallUrlResponse,
  GitHubStatusResponse,
  GitHubRepositoriesResponse,
  GitHubBranchesResponse,
  ProjectsResponse,
  ProjectDetailResponse,
  CreateProjectWithGithubRequest,
  CreateProjectWithGithubResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectResponse,
  RetryCodeBuildResponse,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const API_VERSION = "/api/v1";

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

    // Cache-Control 헤더 추가 (GitHub API의 경우)
    if (endpoint.includes("/github")) {
      headers["Cache-Control"] = "no-cache";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // 응답이 JSON이 아닐 수 있으므로 확인
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let data;
      if (isJson) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // 인증 실패 시 특별 처리
        if (response.status === 401) {
          return {
            error: "인증이 만료되었습니다. 다시 로그인해 주세요.",
          };
        }

        // NestJS 에러 응답 형식 처리
        const error: ApiError = data;
        return {
          error:
            error.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      // 네트워크 오류 또는 백엔드 서버 다운
      if (error instanceof Error && error.message.includes("fetch")) {
        return {
          error:
            "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해 주세요.",
        };
      }

      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // 사용자 관련 API
  async getUserProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<{ data?: { user: User }; user?: User }>(
      "/api/v1/auth/profile"
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
      "/api/v1/auth/profile",
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

  // GitHub Integration API
  async getGitHubInstallations(): Promise<
    ApiResponse<GitHubInstallationsResponse>
  > {
    return this.request<GitHubInstallationsResponse>(
      "/api/v1/projects/github-installations"
    );
  }

  // Legacy method name for compatibility
  async getGithubInstallations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/v1/projects/github-installations");
  }

  async getGitHubInstallUrl(
    returnUrl: string = "/projects"
  ): Promise<ApiResponse<GitHubInstallUrlResponse>> {
    return this.request<GitHubInstallUrlResponse>(
      `/api/v1/projects/github/install-url?returnUrl=${encodeURIComponent(
        returnUrl
      )}`
    );
  }

  async getGitHubStatus(): Promise<ApiResponse<GitHubStatusResponse>> {
    return this.request<GitHubStatusResponse>("/api/v1/projects/github/status");
  }

  async getGitHubRepositories(
    installationId: string
  ): Promise<ApiResponse<GitHubRepositoriesResponse>> {
    return this.request<GitHubRepositoriesResponse>(
      `/api/v1/projects/github-installations/${installationId}/repositories`
    );
  }

  // Legacy method name for compatibility
  async getGithubRepositories(installationId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/api/v1/projects/github-installations/${installationId}/repositories`
    );
  }

  async getGitHubBranches(
    installationId: string,
    owner: string,
    repo: string
  ): Promise<ApiResponse<GitHubBranchesResponse>> {
    return this.request<GitHubBranchesResponse>(
      `/api/v1/projects/github-installations/${installationId}/repositories/${owner}/${repo}/branches`
    );
  }

  // Legacy method name for compatibility
  async getGithubBranches(
    installationId: string,
    owner: string,
    repo: string
  ): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(
      `/api/v1/projects/github-installations/${installationId}/repositories/${owner}/${repo}/branches`
    );
  }

  async getTestRepos(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(
      "/api/v1/projects/github/test-repos"
    );
  }

  // Projects API
  async getProjects(): Promise<ApiResponse<ProjectsResponse>> {
    return this.request<ProjectsResponse>("/api/v1/projects");
  }

  async getProject(
    projectId: string
  ): Promise<ApiResponse<ProjectDetailResponse>> {
    return this.request<ProjectDetailResponse>(`/api/v1/projects/${projectId}`);
  }

  async createProjectWithGitHub(
    request: CreateProjectWithGithubRequest
  ): Promise<ApiResponse<CreateProjectWithGithubResponse>> {
    return this.request<CreateProjectWithGithubResponse>(
      "/api/v1/projects/with-github",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  // Legacy method name for compatibility
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
    return this.request<any>("/api/v1/projects/with-github", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    projectId: string,
    updates: UpdateProjectRequest
  ): Promise<ApiResponse<UpdateProjectResponse>> {
    return this.request<UpdateProjectResponse>(
      `/api/v1/projects/${projectId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteProject(
    projectId: string
  ): Promise<ApiResponse<DeleteProjectResponse>> {
    return this.request<DeleteProjectResponse>(
      `/api/v1/projects/${projectId}`,
      {
        method: "DELETE",
      }
    );
  }

  async retryCodeBuild(
    projectId: string
  ): Promise<ApiResponse<RetryCodeBuildResponse>> {
    return this.request<RetryCodeBuildResponse>(
      `/api/v1/projects/${projectId}/retry-codebuild`,
      {
        method: "POST",
      }
    );
  }

  // 파이프라인 관련 API
  async getPipelines(projectId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/pipelines/project/${projectId}`);
  }

  async getPipeline(pipelineId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/pipelines/${pipelineId}`);
  }

  async createPipeline(projectId: string, data: {
    name?: string;
    blocks?: any[];
    artifacts?: string[];
    environment_variables?: Record<string, string>;
    cache?: { paths: string[] };
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/pipelines`, {
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
    
    return this.request<any>(`/api/v1/pipelines/${pipelineId}`, {
      method: "PUT",
      body: JSON.stringify(requestBody),
    });
  }

  async deletePipeline(pipelineId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/pipelines/${pipelineId}`, {
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
    return this.request<any>(`/api/v1/codebuild/${projectId}/start-flow`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getBuildStatus(buildId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/codebuild/status/${buildId}`);
  }

  async getProjectBuilds(projectId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/builds/projects/${projectId}`);
  }

  async getBuild(buildId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/builds/${buildId}`);
  }

  async getBuildStats(projectId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/builds/stats/summary?projectId=${projectId}`);
  }
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient(API_BASE_URL);

// React Hook을 위한 유틸리티 함수들
export const useApi = () => {
  return {
    // 사용자 관련
    getUserProfile: () => apiClient.getUserProfile(),
    updateUserProfile: (updates: UpdateUserProfileRequest) =>
      apiClient.updateUserProfile(updates),

    // GitHub Integration
    getGitHubInstallations: () => apiClient.getGitHubInstallations(),
    getGitHubInstallUrl: (returnUrl?: string) =>
      apiClient.getGitHubInstallUrl(returnUrl),
    getGitHubStatus: () => apiClient.getGitHubStatus(),
    getGitHubRepositories: (installationId: string) =>
      apiClient.getGitHubRepositories(installationId),
    getGitHubBranches: (installationId: string, owner: string, repo: string) =>
      apiClient.getGitHubBranches(installationId, owner, repo),
    getTestRepos: () => apiClient.getTestRepos(),

    // Projects
    getProjects: () => apiClient.getProjects(),
    getProject: (projectId: string) => apiClient.getProject(projectId),
    createProjectWithGitHub: (request: CreateProjectWithGithubRequest) =>
      apiClient.createProjectWithGitHub(request),
    updateProject: (projectId: string, updates: UpdateProjectRequest) =>
      apiClient.updateProject(projectId, updates),
    deleteProject: (projectId: string) => apiClient.deleteProject(projectId),
    retryCodeBuild: (projectId: string) => apiClient.retryCodeBuild(projectId),
  };
};

// JWT 토큰 관리 유틸리티
export const setApiToken = (token: string) => {
  apiClient.setSupabaseToken(token);
};

export default apiClient;
