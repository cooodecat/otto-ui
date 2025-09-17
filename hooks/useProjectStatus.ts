import { useState, useEffect, useRef } from "react";
import { useApi } from "@/lib/api";
import type { Project } from "@/types/api";

interface UseProjectStatusResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retryCodeBuild: () => Promise<void>;
  retrying: boolean;
}

interface UseProjectStatusOptions {
  projectId: string;
  pollingEnabled?: boolean;
  pollingInterval?: number;
}

export const useProjectStatus = ({
  projectId,
  pollingEnabled = false,
  pollingInterval = 2000,
}: UseProjectStatusOptions): UseProjectStatusResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const api = useApi();

  const fetchProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getProject(projectId);
      if (response.error) {
        setError(response.error);
        setProject(null);
      } else if (response.data) {
        setProject(response.data.project);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "프로젝트 정보 조회 실패";
      setError(errorMessage);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const retryCodeBuild = async () => {
    if (!project) return;

    setRetrying(true);

    try {
      const response = await api.retryCodeBuild(projectId);
      if (response.error) {
        setError(response.error);
      } else {
        // CodeBuild 재시도 성공 시 상태를 PENDING으로 업데이트
        setProject((prev) =>
          prev ? { ...prev, codebuild_status: "PENDING" } : null
        );
        setError(null);

        // 폴링 시작 (상태가 변경될 때까지)
        startPolling();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "CodeBuild 재시도 실패";
      setError(errorMessage);
    } finally {
      setRetrying(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      const response = await api.getProject(projectId);
      if (response.data?.project) {
        const updatedProject = response.data.project;
        setProject(updatedProject);

        // PENDING 상태가 아니면 폴링 중지
        if (updatedProject.codebuild_status !== "PENDING") {
          stopPolling();
        }
      }
    }, pollingInterval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    fetchProject();

    // 컴포넌트 언마운트 시 폴링 정리
    return () => {
      stopPolling();
    };
  }, [projectId]);

  useEffect(() => {
    // 폴링 설정이 활성화되고 프로젝트가 PENDING 상태인 경우 폴링 시작
    if (pollingEnabled && project?.codebuild_status === "PENDING") {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [pollingEnabled, project?.codebuild_status, pollingInterval]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    retryCodeBuild,
    retrying,
  };
};
