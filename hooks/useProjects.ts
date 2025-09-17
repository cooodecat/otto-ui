import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import type {
  ProjectsResponse,
  CreateProjectWithGithubRequest,
} from "@/types/api";

interface UseProjectsResult {
  projects: ProjectsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (request: CreateProjectWithGithubRequest) => Promise<boolean>;
  creating: boolean;
  createError: string | null;
}

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const api = useApi();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getProjects();
      if (response.error) {
        setError(response.error);
        setProjects(null);
      } else if (response.data) {
        setProjects(response.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "프로젝트 목록 조회 실패";
      setError(errorMessage);
      setProjects(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createProject = useCallback(
    async (request: CreateProjectWithGithubRequest): Promise<boolean> => {
      setCreating(true);
      setCreateError(null);

      try {
        const response = await api.createProjectWithGitHub(request);
        if (response.error) {
          setCreateError(response.error);
          return false;
        } else if (response.data) {
          // 프로젝트 생성 성공 후 목록 다시 조회
          await fetchProjects();
          setCreateError(null);
          return true;
        }
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "프로젝트 생성 실패";
        setCreateError(errorMessage);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [api, fetchProjects]
  );

  useEffect(() => {
    fetchProjects();
  }, []); // fetchProjects 제거하여 무한루프 방지

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    creating,
    createError,
  };
};
