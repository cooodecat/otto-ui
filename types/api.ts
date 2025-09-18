// 백엔드 API (NestJS) 전용 타입 정의
// otto-handler 백엔드 프로젝트와의 통신을 위한 타입들

// 기본 엔티티 타입들
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// API 요청/응답 타입들
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 사용자 관련 API
export interface GetUserProfileResponse {
  user: User;
}

export interface UpdateUserProfileRequest {
  name?: string;
  avatar_url?: string;
}

export interface UpdateUserProfileResponse {
  user: User;
}

// JWT 토큰 관련 타입
export interface JwtPayload {
  sub: string; // 사용자 ID
  email: string;
  iat: number;
  exp: number;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// 에러 응답 타입
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// GitHub Integration API 타입들
export interface GitHubInstallation {
  installation_id: string;
  user_id: string;
  account_id: string;
  account_login: string;
  account_type: string;
  github_installation_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GitHubInstallationsResponse {
  installations: GitHubInstallation[];
  totalInstallations: number;
}

export interface GitHubInstallUrlResponse {
  installUrl: string;
  state: string;
}

export interface GitHubStatusResponse {
  hasInstallation: boolean;
  totalInstallations: number;
  totalConnectedProjects: number;
  installations: GitHubInstallation[];
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
}

export interface GitHubRepositoriesResponse {
  repositories: GitHubRepository[];
  totalRepositories: number;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubBranchesResponse {
  branches: GitHubBranch[];
  totalBranches: number;
}

// Projects API 타입들
export interface Project {
  // Snake case (from API)
  project_id: string;
  name: string;
  description?: string | null;
  github_owner: string | null;
  github_repo_id: string | null;
  github_repo_name: string | null;
  github_repo_url: string | null;
  selected_branch: string | null;
  installation_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  codebuild_status: string | null;
  codebuild_project_name: string | null;
  codebuild_project_arn: string | null;
  cloudwatch_log_group: string | null;
  codebuild_error_message: string | null;
  
  // Camel case (for UI compatibility)
  projectId?: string;
  githubOwner?: string | null;
  githubRepoId?: string | null;
  githubRepoName?: string | null;
  githubRepoUrl?: string | null;
  selectedBranch?: string | null;
  installationId?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  codebuildStatus?: string | null;
  codebuildProjectName?: string | null;
  codebuildProjectArn?: string | null;
  cloudwatchLogGroup?: string | null;
  codebuildErrorMessage?: string | null;
}

export interface ProjectsResponse {
  projects: Project[];
  totalProjects: number;
}

export interface ProjectDetailResponse {
  project: Project;
}

export interface CreateProjectWithGithubRequest {
  name: string;
  description: string;
  installationId: string;
  githubRepoId: string;
  githubRepoUrl: string;
  githubRepoName: string;
  githubOwner: string;
  selectedBranch: string;
}

export interface CreateProjectWithGithubResponse {
  project: Project;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  selectedBranch?: string;
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface DeleteProjectResponse {
  message: string;
}

export interface RetryCodeBuildResponse {
  message: string;
}

// Pipeline types
export interface PipelineNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Pipeline {
  id: string;
  pipeline_id?: string;
  pipelineId?: string;
  project_id: string;
  projectId?: string;
  name: string;
  description?: string;
  status?: string;
  blocks?: PipelineNode[];
  nodes?: PipelineNode[];
  edges?: PipelineEdge[];
  flowData?: {
    nodes: PipelineNode[];
    edges: PipelineEdge[];
  };
  artifacts?: string[];
  environment_variables?: Record<string, string>;
  cache?: { paths: string[] };
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  last_run_at?: string;
  lastRunAt?: string;
}

export interface PipelinesResponse {
  pipelines: Pipeline[];
}

export interface PipelineResponse {
  pipeline: Pipeline;
}

export interface CreatePipelineRequest {
  projectId: string;
  name?: string;
  blocks?: PipelineNode[];
  artifacts?: string[];
  environment_variables?: Record<string, string>;
  cache?: { paths: string[] };
}

export interface UpdatePipelineRequest {
  name?: string;
  blocks?: PipelineNode[];
  artifacts?: string[];
  environment_variables?: Record<string, string>;
  cache?: { paths: string[] };
}

// Build types
export interface BuildRequest {
  version: string;
  runtime: string;
  blocks: PipelineNode[];
  environment_variables?: Record<string, string>;
}

export interface BuildStatus {
  id: string;
  buildId: string;
  status: string;
  projectId: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: string[];
}

export interface Build {
  id: string;
  projectId: string;
  buildId: string;
  status: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: string[];
  error?: string;
}
