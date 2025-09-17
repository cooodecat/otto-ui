import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import type { GitHubStatusResponse } from "@/types/api";

interface UseGitHubStatusResult {
  status: GitHubStatusResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGitHubStatus = (): UseGitHubStatusResult => {
  const [status, setStatus] = useState<GitHubStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getGitHubStatus();
      if (response.error) {
        setError(response.error);
        setStatus(null);
      } else if (response.data) {
        setStatus(response.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GitHub 상태 조회 실패";
      setError(errorMessage);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};
