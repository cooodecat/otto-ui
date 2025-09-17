"use client";

import { useState } from "react";
import type { GitHubRepository } from "@/types/api";

interface GitHubRepositoryCardProps {
  repository: GitHubRepository;
  onCreateProject: (repository: GitHubRepository) => void;
}

export default function GitHubRepositoryCard({
  repository,
  onCreateProject,
}: GitHubRepositoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const updatedAt = repository.updated_at
    ? new Date(repository.updated_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const handleCreateProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCreateProject(repository);
  };

  return (
    <div
      className="group relative p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 호버 시 프로젝트 생성 버튼 */}
      {isHovered && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCreateProject}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            프로젝트 생성
          </button>
        </div>
      )}

      {/* 레포지토리 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {repository.full_name}
            </h3>
            {repository.private && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Private
              </span>
            )}
          </div>

          {repository.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {repository.description}
            </p>
          )}
        </div>
      </div>

      {/* 저장소 메타 정보 */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        {repository.language && (
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: getLanguageColor(repository.language),
              }}
            />
            <span>{repository.language}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{repository.stargazers_count.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{repository.forks_count.toLocaleString()}</span>
        </div>

        {updatedAt && <span>업데이트: {updatedAt}</span>}
      </div>

      {/* 기본 브랜치 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            기본 브랜치:{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              {repository.default_branch}
            </code>
          </span>
        </div>

        {/* GitHub 링크 */}
        <a
          href={`https://github.com/${repository.full_name}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  );
}

// 프로그래밍 언어별 색상 (간단한 매핑)
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    "C#": "#239120",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    HTML: "#e34c26",
    CSS: "#1572B6",
    Vue: "#4FC08D",
    React: "#61DAFB",
    Angular: "#DD0031",
    default: "#6366f1",
  };

  return colors[language] || colors.default;
}
