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

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: "pending" | "running" | "success" | "failed";
  created_at: string;
  updated_at: string;
  pipeline_steps?: PipelineStep[];
}

export interface PipelineStep {
  id: string;
  pipeline_id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed";
  order_index: number;
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

// 파이프라인 관련 API
export interface GetPipelinesResponse {
  pipelines: Pipeline[];
}

export interface GetPipelineResponse {
  pipeline: Pipeline;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  steps: { name: string }[];
}

export interface CreatePipelineResponse {
  pipeline: Pipeline;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  status?: "pending" | "running" | "success" | "failed";
}

export interface UpdatePipelineResponse {
  pipeline: Pipeline;
}

export interface DeletePipelineResponse {
  message: string;
}

// 파이프라인 스텝 관련 API
export interface GetPipelineStepsResponse {
  steps: PipelineStep[];
}

export interface UpdatePipelineStepsRequest {
  steps: { id: string; status: string }[];
}

export interface UpdatePipelineStepsResponse {
  steps: PipelineStep[];
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
