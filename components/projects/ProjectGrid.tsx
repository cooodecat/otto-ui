"use client";

import { useRouter } from "next/navigation";
import { Calendar, GitBranch, Activity } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Project {
  project_id: string;
  name: string;
  description?: string;
  github_owner?: string;
  github_repo_name?: string;
  selected_branch?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}/pipelines`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {projects.map((project) => (
        <div
          key={project.project_id}
          onClick={() => handleProjectClick(project.project_id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>

          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            {project.github_repo_name && (
              <div className="flex items-center gap-2 text-gray-600">
                <GitBranch className="w-4 h-4" />
                <span>
                  {project.github_owner}/{project.github_repo_name}
                </span>
              </div>
            )}

            {project.selected_branch && (
              <div className="flex items-center gap-2 text-gray-600">
                <GitBranch className="w-4 h-4" />
                <span>브랜치: {project.selected_branch}</span>
              </div>
            )}

            {project.created_at && (
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {(() => {
                    try {
                      const date = new Date(project.created_at);
                      if (isNaN(date.getTime())) {
                        return "날짜 없음";
                      }
                      return format(date, "yyyy년 MM월 dd일", {
                        locale: ko,
                      });
                    } catch {
                      return "날짜 없음";
                    }
                  })()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {project.updated_at ? (
                  <>
                    최근 업데이트:{" "}
                    {(() => {
                      try {
                        const date = new Date(project.updated_at);
                        if (isNaN(date.getTime())) {
                          return "날짜 없음";
                        }
                        return format(date, "MM월 dd일", {
                          locale: ko,
                        });
                      } catch {
                        return "날짜 없음";
                      }
                    })()}
                  </>
                ) : (
                  "업데이트 정보 없음"
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.project_id);
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                파이프라인 보기 →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}