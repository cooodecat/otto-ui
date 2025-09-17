"use client";

import { useGitHubStatus } from "@/hooks/useGitHubStatus";
import GitHubInstallationButton from "./GitHubInstallationButton";

interface GitHubStatusCardProps {
  onInstallationComplete?: () => void;
}

export default function GitHubStatusCard({
  onInstallationComplete,
}: GitHubStatusCardProps) {
  const { status, loading, error, refetch } = useGitHubStatus();

  if (loading) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">GitHub 상태 조회 실패</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <div className="text-center text-gray-500">
          GitHub 상태를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          GitHub 연결 상태
        </h3>
        <button
          onClick={refetch}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          title="새로고침"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {status.hasInstallation ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">
                GitHub 앱이 설치되어 있습니다
              </p>
              <p className="text-sm text-green-700">
                이제 저장소를 선택하여 프로젝트를 생성할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {status.totalInstallations}
              </div>
              <div className="text-sm text-gray-600">GitHub 설치</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {status.totalConnectedProjects}
              </div>
              <div className="text-sm text-gray-600">연결된 프로젝트</div>
            </div>
          </div>

          {status.installations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                설치된 계정
              </h4>
              <div className="space-y-2">
                {status.installations.map((installation) => (
                  <div
                    key={installation.installation_id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {installation.account_login}
                      </p>
                      <p className="text-sm text-gray-600">
                        {installation.account_type}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 text-xs rounded-full ${
                        installation.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {installation.is_active ? "활성" : "비활성"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onInstallationComplete && (
            <button
              onClick={onInstallationComplete}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              프로젝트 생성 계속하기
            </button>
          )}
        </div>
      ) : (
        <GitHubInstallationButton
          returnUrl={typeof window !== 'undefined' ? `${window.location.pathname}?open_modal=true` : '/projects?open_modal=true'}
          onInstallationStart={() => {
            // 설치 시작 시 필요한 로직
          }}
        />
      )}
    </div>
  );
}
