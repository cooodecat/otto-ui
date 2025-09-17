// Supabase Database 타입 정의 (reference.prisma 기반)
// Pipeline Logs 및 프로젝트 관리를 위한 전체 DB 스키마

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum 타입들
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type CollectionStatus = 'ACTIVE' | 'STOPPED' | 'ERROR';

export interface Database {
  public: {
    Tables: {
      // 빌드 기록 (CodeBuild 단위)
      build_histories: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          aws_build_id: string;
          build_execution_status: string;
          build_spec: Json;
          environment_variables: Json | null;
          start_time: string | null;
          end_time: string | null;
          duration_seconds: number | null;
          logs_url: string | null;
          build_error_message: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          aws_build_id: string;
          build_execution_status: string;
          build_spec: Json;
          environment_variables?: Json | null;
          start_time?: string | null;
          end_time?: string | null;
          duration_seconds?: number | null;
          logs_url?: string | null;
          build_error_message?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          aws_build_id?: string;
          build_execution_status?: string;
          build_spec?: Json;
          environment_variables?: Json | null;
          start_time?: string | null;
          end_time?: string | null;
          duration_seconds?: number | null;
          logs_url?: string | null;
          build_error_message?: string | null;
          updated_at?: string | null;
        };
      };
      
      // 빌드 실행 단계 (INSTALL/BUILD/FINALIZE 등)
      build_execution_phases: {
        Row: {
          id: string;
          build_history_id: string;
          phase_type: string;
          phase_status: string;
          phase_start_time: string | null;
          phase_end_time: string | null;
          phase_duration_seconds: number | null;
          phase_context_message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          build_history_id: string;
          phase_type: string;
          phase_status: string;
          phase_start_time?: string | null;
          phase_end_time?: string | null;
          phase_duration_seconds?: number | null;
          phase_context_message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          build_history_id?: string;
          phase_type?: string;
          phase_status?: string;
          phase_start_time?: string | null;
          phase_end_time?: string | null;
          phase_duration_seconds?: number | null;
          phase_context_message?: string | null;
        };
      };
      
      // 실행 로그 (CloudWatch에서 수집된 각 로그 이벤트)
      job_execution_logs: {
        Row: {
          id: string;
          execution_id: string;
          event_id: string;
          timestamp: string;
          phase: string | null;
          state: string | null;
          level: LogLevel;
          message: string;
          log_stream: string | null;
          raw_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          event_id: string;
          timestamp: string;
          phase?: string | null;
          state?: string | null;
          level: LogLevel;
          message: string;
          log_stream?: string | null;
          raw_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          event_id?: string;
          timestamp?: string;
          phase?: string | null;
          state?: string | null;
          level?: LogLevel;
          message?: string;
          log_stream?: string | null;
          raw_data?: Json | null;
        };
      };
      
      // 로그 실행 단위 (Job Execution 단위, CodeBuild 빌드 단위와 유사)
      job_executions: {
        Row: {
          id: string;
          execution_id: string;
          provider: string;
          external_id: string;
          project_name: string;
          status: string | null;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          provider: string;
          external_id: string;
          project_name: string;
          status?: string | null;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          provider?: string;
          external_id?: string;
          project_name?: string;
          status?: string | null;
          started_at?: string;
          ended_at?: string | null;
        };
      };
      
      // 로그 수집 상태 (last_token 기반 추적)
      log_collection_state: {
        Row: {
          execution_id: string;
          last_token: string;
          last_collected_at: string | null;
          collection_status: CollectionStatus;
          error_message: string;
          updated_at: string | null;
        };
        Insert: {
          execution_id: string;
          last_token: string;
          last_collected_at?: string | null;
          collection_status: CollectionStatus;
          error_message: string;
          updated_at?: string | null;
        };
        Update: {
          execution_id?: string;
          last_token?: string;
          last_collected_at?: string | null;
          collection_status?: CollectionStatus;
          error_message?: string;
          updated_at?: string | null;
        };
      };
      
      // Supabase 프로젝트와 연결된 pipelines 정의 (JSON 기반)
      pipelines: {
        Row: {
          pipeline_id: string;
          project_id: string;
          created_at: string;
          data: Json | null;
          env: Json | null;
        };
        Insert: {
          pipeline_id?: string;
          project_id: string;
          created_at?: string;
          data?: Json | null;
          env?: Json | null;
        };
        Update: {
          pipeline_id?: string;
          project_id?: string;
          data?: Json | null;
          env?: Json | null;
        };
      };
      
      // 사용자 프로필 정보 (auth.users를 확장)
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          github_username: string | null;
          github_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          github_username?: string | null;
          github_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          github_username?: string | null;
          github_id?: string | null;
          updated_at?: string | null;
        };
      };
      
      // 프로젝트 정보 (빌드 대상 저장소 등)
      projects: {
        Row: {
          project_id: string;
          name: string;
          description: string | null;
          github_owner: string;
          github_repo_id: string;
          github_repo_name: string;
          github_repo_url: string;
          installation_id: string | null;
          user_id: string;
          selected_branch: string | null;
          created_at: string;
          updated_at: string;
          codebuild_project_name: string | null;
          build_image: string;
          compute_type: string;
          build_timeout: number;
          artifact_bucket: string | null;
          artifact_retention_days: number | null;
          cloudwatch_log_group: string | null;
          codebuild_status: string | null;
          codebuild_error_message: string | null;
        };
        Insert: {
          project_id?: string;
          name: string;
          description?: string | null;
          github_owner: string;
          github_repo_id: string;
          github_repo_name: string;
          github_repo_url: string;
          installation_id?: string | null;
          user_id: string;
          selected_branch?: string | null;
          created_at?: string;
          updated_at?: string;
          codebuild_project_name?: string | null;
          build_image?: string;
          compute_type?: string;
          build_timeout?: number;
          artifact_bucket?: string | null;
          artifact_retention_days?: number | null;
          cloudwatch_log_group?: string | null;
          codebuild_status?: string | null;
          codebuild_error_message?: string | null;
        };
        Update: {
          project_id?: string;
          name?: string;
          description?: string | null;
          github_owner?: string;
          github_repo_id?: string;
          github_repo_name?: string;
          github_repo_url?: string;
          installation_id?: string | null;
          user_id?: string;
          selected_branch?: string | null;
          updated_at?: string;
          codebuild_project_name?: string | null;
          build_image?: string;
          compute_type?: string;
          build_timeout?: number;
          artifact_bucket?: string | null;
          artifact_retention_days?: number | null;
          cloudwatch_log_group?: string | null;
          codebuild_status?: string | null;
          codebuild_error_message?: string | null;
        };
      };
      
      // GitHub Installation 정보 (user와 연결)
      github_installations: {
        Row: {
          installation_id: string;
          user_id: string;
          account_id: string;
          account_login: string;
          account_type: string;
          github_installation_id: string;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          installation_id?: string;
          user_id: string;
          account_id: string;
          account_login: string;
          account_type: string;
          github_installation_id: string;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          installation_id?: string;
          user_id?: string;
          account_id?: string;
          account_login?: string;
          account_type?: string;
          github_installation_id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
        };
      };
      
      // GitHub Push 이벤트 수신 기록
      push_events: {
        Row: {
          event_id: string;
          project_id: string;
          commit_sha: string;
          commit_message: string | null;
          commit_author_name: string | null;
          pushed_at: string;
          branch_name: string | null;
          created_at: string | null;
        };
        Insert: {
          event_id?: string;
          project_id: string;
          commit_sha: string;
          commit_message?: string | null;
          commit_author_name?: string | null;
          pushed_at: string;
          branch_name?: string | null;
          created_at?: string | null;
        };
        Update: {
          event_id?: string;
          project_id?: string;
          commit_sha?: string;
          commit_message?: string | null;
          commit_author_name?: string | null;
          pushed_at?: string;
          branch_name?: string | null;
        };
      };
    };
  };
}
