"use client";

import Link from "next/link";
import ProjectStatusBadge from "./ProjectStatusBadge";
import { useProjectStatus } from "@/hooks/useProjectStatus";
import type { Project } from "@/types/api";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const {
    project: currentProject,
    retryCodeBuild,
    retrying,
  } = useProjectStatus({
    projectId: project.project_id,
    pollingEnabled: project.codebuild_status === "PENDING",
  });

  // 실시간 상태가 있으면 사용, 없으면 props 사용
  const displayProject = currentProject || project;

  const createdAt = new Date(displayProject.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const handleRetryCodeBuild = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await retryCodeBuild();
  };

  return (
    <Link href={`/projects/${displayProject.project_id}`}>
      <div className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {displayProject.name}
            </h3>
            {displayProject.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {displayProject.description}
              </p>
            )}
          </div>

          {/* CodeBuild 상태 */}
          <div className="flex flex-col items-end gap-2">
            {displayProject.codebuild_status && (
              <ProjectStatusBadge
                status={displayProject.codebuild_status}
                errorMessage={displayProject.codebuild_error_message}
                size="sm"
              />
            )}

            {/* CodeBuild 재시도 버튼 (실패 시에만) */}
            {displayProject.codebuild_status === "FAILED" && (
              <button
                onClick={handleRetryCodeBuild}
                disabled={retrying}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {retrying ? "재시도 중..." : "재시도"}
              </button>
            )}
          </div>
        </div>

        {/* GitHub 정보 */}
        {displayProject.github_repo_name && (
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-700 truncate">
              {displayProject.github_owner}/{displayProject.github_repo_name}
            </span>
            {displayProject.selected_branch && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {displayProject.selected_branch}
                </span>
              </>
            )}
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>생성일: {createdAt}</span>

          {/* CodeBuild 프로젝트명 */}
          {displayProject.codebuild_project_name && (
            <span className="truncate ml-2">
              빌드: {displayProject.codebuild_project_name}
            </span>
          )}
        </div>

        {/* 추가 링크 */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          {displayProject.github_repo_url && (
            <a
              href={displayProject.github_repo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              GitHub
            </a>
          )}

          <Link
            href={`/projects/${displayProject.project_id}/logs`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            로그
          </Link>
        </div>
      </div>
    </Link>
  );
}
