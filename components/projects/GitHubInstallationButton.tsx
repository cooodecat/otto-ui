"use client";

import { useState } from "react";
import { useApi } from "@/lib/api";
import { useGitHubStatus } from "@/hooks/useGitHubStatus";

interface GitHubInstallationButtonProps {
  returnUrl?: string;
  onInstallationStart?: () => void;
  className?: string;
}

export default function GitHubInstallationButton({
  returnUrl = "/projects",
  onInstallationStart,
  className = "",
}: GitHubInstallationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { status, refetch } = useGitHubStatus();

  const handleInstallGitHub = async () => {
    setLoading(true);
    setError(null);
    onInstallationStart?.();

    try {
      const response = await api.getGitHubInstallUrl(returnUrl);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // GitHub App 설치 페이지로 리다이렉트
        window.location.href = response.data.installUrl;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GitHub 설치 URL 생성 실패";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 이미 GitHub 설치가 있는 경우
  if (status?.hasInstallation) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          GitHub 앱이 설치되어 있습니다
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {status.totalInstallations}개의 설치, {status.totalConnectedProjects}
          개의 연결된 프로젝트
        </p>
        <button
          onClick={refetch}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          상태 새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleInstallGitHub}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            설치 중...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            GitHub 앱 설치
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            오류 닫기
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>GitHub 저장소와 연결하려면 먼저 Otto GitHub 앱을 설치해야 합니다.</p>
        <p className="mt-1">앱 설치 후 이 페이지로 자동으로 돌아옵니다.</p>
      </div>
    </div>
  );
}
