import { useState, useCallback } from "react";
import { useApi } from "@/lib/api";
import type {
  GitHubRepositoriesResponse,
  GitHubBranchesResponse,
} from "@/types/api";

interface UseGitHubRepositoriesResult {
  repositories: GitHubRepositoriesResponse | null;
  branches: GitHubBranchesResponse | null;
  loading: boolean;
  error: string | null;
  fetchRepositories: (installationId: string) => Promise<void>;
  fetchBranches: (
    installationId: string,
    owner: string,
    repo: string
  ) => Promise<void>;
  resetBranches: () => void;
}

export const useGitHubRepositories = (): UseGitHubRepositoriesResult => {
  const [repositories, setRepositories] =
    useState<GitHubRepositoriesResponse | null>(null);
  const [branches, setBranches] = useState<GitHubBranchesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchRepositories = useCallback(
    async (installationId: string) => {
      setLoading(true);
      setError(null);
      setBranches(null); // 새 저장소 조회 시 브랜치 초기화

      try {
        const response = await api.getGitHubRepositories(installationId);
        if (response.error) {
          setError(response.error);
          setRepositories(null);
        } else if (response.data) {
          setRepositories(response.data);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "저장소 목록 조회 실패";
        setError(errorMessage);
        setRepositories(null);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const fetchBranches = useCallback(
    async (installationId: string, owner: string, repo: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getGitHubBranches(
          installationId,
          owner,
          repo
        );
        if (response.error) {
          setError(response.error);
          setBranches(null);
        } else if (response.data) {
          setBranches(response.data);
          setError(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "브랜치 목록 조회 실패";
        setError(errorMessage);
        setBranches(null);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const resetBranches = useCallback(() => {
    setBranches(null);
  }, []);

  return {
    repositories,
    branches,
    loading,
    error,
    fetchRepositories,
    fetchBranches,
    resetBranches,
  };
};
