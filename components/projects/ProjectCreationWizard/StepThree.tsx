"use client";

import React from "react";
import {
  GitBranch,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";
import { Repository, ProjectConfig } from "./types";

interface StepThreeProps {
  repository: Repository;
  selectedBranch: string;
  projectConfig: ProjectConfig;
  isCreating: boolean;
  createdProjectId: string | null;
  error: string | null;
  onCreateProject: () => void;
  onNavigateToProject: () => void;
}

export default function StepThree({
  repository,
  selectedBranch,
  projectConfig,
  isCreating,
  createdProjectId,
  error,
  onCreateProject,
  onNavigateToProject,
}: StepThreeProps) {
  return (
    <div className="p-8 space-y-6">
      {/* Success Message */}
      {createdProjectId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-900">
                프로젝트가 성공적으로 생성되었습니다!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                이제 파이프라인을 만들고 워크플로우를 구성할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToProject}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            프로젝트로 이동
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">
                프로젝트 생성 실패
              </h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Cards */}
      {!createdProjectId && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              프로젝트 생성 확인
            </h3>
            <p className="text-sm text-gray-600">
              아래 정보로 새 프로젝트를 생성합니다. 생성 후에는 프로젝트 이름을
              변경할 수 없습니다.
            </p>
          </div>

          {/* GitHub Repository Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                GitHub 저장소 정보
              </h4>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">저장소</span>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {repository.owner}/{repository.name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      repository.visibility === "Public"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {repository.visibility === "Public" ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      {repository.visibility}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">선택한 브랜치</span>
                <span className="text-sm font-medium text-gray-900 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {selectedBranch}
                </span>
              </div>
            </div>
          </div>

          {/* Project Configuration */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                프로젝트 설정
              </h4>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">프로젝트 이름</span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6">
                  {projectConfig.name}
                </p>
              </div>

              {projectConfig.description && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">프로젝트 설명</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-6 whitespace-pre-wrap">
                    {projectConfig.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onCreateProject}
              disabled={isCreating}
              className={`
                px-8 py-3 rounded-lg font-medium text-white transition-all
                flex items-center gap-2 min-w-[200px] justify-center
                ${
                  isCreating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg transform hover:scale-105"
                }
              `}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  프로젝트 생성 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  프로젝트 생성
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            프로젝트 생성 후 설정 페이지에서 추가 구성을 할 수 있습니다
          </div>
        </>
      )}
    </div>
  );
}
