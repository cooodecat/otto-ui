import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import type { LogItem } from '@/types/logs';

// Supabase 타입 추출
type BuildHistoryRow = Database['public']['Tables']['build_histories']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

/**
 * Pipeline Logs API Functions
 * Supabase에서 실제 빌드 기록 데이터를 조회하는 함수들
 */

/**
 * API 요청 재시도 헬퍼 함수
 */
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error; // 마지막 시도에서도 실패하면 에러 던지기
      }
      
      // 지수적 백오프로 대기
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * 사용자의 프로젝트 목록 조회
 */
export async function getUserProjects(userId: string): Promise<ProjectRow[]> {
  const supabase = createClient();
  
  const { data, error } = await retryApiCall(async () => {
    return await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  });

  if (error) {
    console.error('Error fetching user projects:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data || [];
}

/**
 * 특정 프로젝트의 빌드 기록 조회
 */
export async function getProjectBuildHistories(
  projectId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}
): Promise<{ builds: BuildHistoryRow[]; hasMore: boolean }> {
  const supabase = createClient();
  const { limit = 20, offset = 0, status } = options;

  // 먼저 프로젝트 정보 조회
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('name, github_repo_name, selected_branch, github_owner')
    .eq('project_id', projectId)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
    throw new Error(`Failed to fetch project: ${projectError.message}`);
  }

  let query = supabase
    .from('build_histories')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit);

  if (status && status !== 'any-status') {
    query = query.eq('build_execution_status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching build histories:', error);
    throw new Error(`Failed to fetch build histories: ${error.message}`);
  }

  const hasMore = count ? offset + limit < count : false;

  // 빌드 데이터에 프로젝트 정보 추가
  const buildsWithProject = (data || []).map((build: BuildHistoryRow) => ({
    ...build,
    projects: project ? {
      name: (project as { name: string }).name,
      github_repo_name: (project as { github_repo_name: string | null }).github_repo_name,
      selected_branch: (project as { selected_branch: string | null }).selected_branch,
      github_owner: (project as { github_owner: string }).github_owner
    } : undefined
  }));

  return {
    builds: buildsWithProject,
    hasMore
  };
}

/**
 * 모든 사용자 프로젝트의 빌드 기록 조회 (통합 뷰)
 */
export async function getAllUserBuildHistories(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    projectId?: string;
  } = {}
): Promise<{ builds: BuildHistoryRow[]; hasMore: boolean; totalCount: number }> {
  const supabase = createClient();
  const { limit = 20, offset = 0, status, projectId } = options;

  // 먼저 사용자의 프로젝트 ID들을 조회 (재시도 로직 적용)
  type ProjectSelect = Pick<ProjectRow, 'project_id' | 'name' | 'github_repo_name' | 'selected_branch' | 'github_owner'>;
  const result = await retryApiCall(async () => {
    return await supabase
      .from('projects')
      .select('project_id, name, github_repo_name, selected_branch, github_owner')
      .eq('user_id', userId);
  });
  const { data: projects, error: projectsError } = result as { data: ProjectSelect[] | null; error: any };

  if (projectsError) {
    console.error('Error fetching user projects:', projectsError);
    throw new Error(`Failed to fetch user projects: ${projectsError.message}`);
  }

  if (!projects || projects.length === 0) {
    return { builds: [], hasMore: false, totalCount: 0 };
  }

  const projectIds = projects.map(p => p.project_id);

  // 빌드 기록 조회
  let query = supabase
    .from('build_histories')
    .select('*', { count: 'exact' })
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'any-status') {
    query = query.eq('build_execution_status', status);
  }

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching all build histories:', error);
    throw new Error(`Failed to fetch build histories: ${error.message}`);
  }

  const hasMore = count ? offset + limit < count : false;

  // 빌드 데이터에 해당 프로젝트 정보 추가
  const buildsWithProject = (data || []).map((build: BuildHistoryRow) => {
    const project = projects?.find((p) => p.project_id === build.project_id);
    return {
      ...build,
      projects: project ? {
        name: project.name,
        github_repo_name: project.github_repo_name,
        selected_branch: project.selected_branch,
        github_owner: project.github_owner
      } : undefined
    };
  });

  return {
    builds: buildsWithProject,
    hasMore,
    totalCount: count || 0
  };
}

/**
 * Supabase 빌드 데이터를 LogItem 형태로 변환
 */
export function transformBuildToLogItem(
  build: BuildHistoryRow & {
    projects?: {
      name: string;
      github_repo_name: string;
      selected_branch: string | null;
      github_owner?: string;
    };
  }
): LogItem {
  // 빌드 상태 매핑
  const statusMap: Record<string, LogItem['status']> = {
    'SUCCEEDED': 'success',
    'FAILED': 'failed',
    'IN_PROGRESS': 'running',
    'STOPPED': 'failed',
    'FAULT': 'failed',
    'TIMED_OUT': 'failed',
    'PENDING': 'pending',
    'success': 'success',
    'failed': 'failed',
    'running': 'running',
    'pending': 'pending'
  };

  const status = statusMap[build.build_execution_status] || 'pending';

  // 실행 시간 계산
  const getDuration = () => {
    if (build.duration_seconds) {
      const minutes = Math.floor(build.duration_seconds / 60);
      const seconds = build.duration_seconds % 60;
      return `${minutes}m ${seconds}s`;
    }
    
    if (build.start_time && build.end_time) {
      const start = new Date(build.start_time);
      const end = new Date(build.end_time);
      const diffMs = end.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      return `${minutes}m ${seconds}s`;
    }

    return status === 'running' ? 'Running...' : '-';
  };

  // 시간 표시 (상대 시간)
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return {
    id: build.id,
    status,
    pipelineName: build.projects?.name || 'Unknown Project',
    trigger: {
      type: 'Push to ' + (build.projects?.selected_branch || 'main'),
      author: build.projects?.github_owner || 'system',
      time: getTimeAgo(build.created_at)
    },
    branch: build.projects?.selected_branch || 'main',
    commit: {
      message: 'Build triggered', // 실제로는 push_events에서 가져와야 함
      sha: build.aws_build_id.substring(0, 7), // AWS Build ID 일부 사용
      author: build.projects?.github_owner || 'Unknown'
    },
    duration: getDuration(),
    isNew: false // 새로운 로그 여부는 클라이언트에서 관리
  };
}

/**
 * 특정 빌드의 상세 로그 조회
 */
export async function getBuildLogs(buildId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('job_execution_logs')
    .select('*')
    .eq('execution_id', buildId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching build logs:', error);
    throw new Error(`Failed to fetch build logs: ${error.message}`);
  }

  return data || [];
}

/**
 * 검색 기능을 포함한 빌드 기록 조회
 */
export async function searchBuildHistories(
  userId: string,
  searchQuery: string,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    projectId?: string;
  } = {}
): Promise<{ builds: BuildHistoryRow[]; hasMore: boolean }> {
  const supabase = createClient();
  const { limit = 20, offset = 0, status, projectId } = options;

  // 먼저 사용자의 프로젝트 ID들을 조회
  type ProjectSearch = Pick<ProjectRow, 'project_id' | 'name' | 'github_repo_name' | 'selected_branch' | 'github_owner'>;
  const searchResult = await supabase
    .from('projects')
    .select('project_id, name, github_repo_name, selected_branch, github_owner')
    .eq('user_id', userId)
    .or(`name.ilike.%${searchQuery}%,github_repo_name.ilike.%${searchQuery}%`);
  const { data: projects, error: projectsError } = searchResult as { data: ProjectSearch[] | null; error: any };

  if (projectsError) {
    console.error('Error searching projects:', projectsError);
    throw new Error(`Failed to search projects: ${projectsError.message}`);
  }

  if (!projects || projects.length === 0) {
    return { builds: [], hasMore: false };
  }

  const projectIds = projects.map(p => p.project_id);

  // 빌드 기록 조회
  let query = supabase
    .from('build_histories')
    .select('*')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'any-status') {
    query = query.eq('build_execution_status', status);
  }

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching build histories:', error);
    throw new Error(`Failed to search build histories: ${error.message}`);
  }

  const hasMore = count ? offset + limit < count : false;

  // 빌드 데이터에 해당 프로젝트 정보 추가
  const buildsWithProject = (data || []).map((build: BuildHistoryRow) => {
    const project = projects?.find((p) => p.project_id === build.project_id);
    return {
      ...build,
      projects: project ? {
        name: project.name,
        github_repo_name: project.github_repo_name,
        selected_branch: project.selected_branch,
        github_owner: project.github_owner
      } : undefined
    };
  });

  return {
    builds: buildsWithProject,
    hasMore
  };
}
