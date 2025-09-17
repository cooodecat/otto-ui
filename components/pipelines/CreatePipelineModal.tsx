"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { usePipelineStore } from "@/lib/pipelineStore";
import { useProjectStore } from "@/lib/projectStore";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

export default function CreatePipelineModal({ 
  isOpen, 
  onClose, 
  projectId,
  projectName 
}: CreatePipelineModalProps) {
  const [pipelineName, setPipelineName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { fetchPipelines } = usePipelineStore();
  const { projects } = useProjectStore();
  const router = useRouter();

  console.log('[CreatePipelineModal] Modal state:', { isOpen, projectId, projectName });

  if (!isOpen) return null;

  // 현재 프로젝트 정보 가져오기
  const currentProject = projects.find(p => p.project_id === projectId);
  const selectedBranch = currentProject?.selected_branch || 'main';
  const githubRepo = currentProject?.github_repo_name || '';
  const githubOwner = currentProject?.github_owner || '';

  const handleCreate = async () => {
    if (!pipelineName.trim()) {
      toast.error("파이프라인 이름을 입력해주세요.");
      return;
    }

    setIsCreating(true);

    try {
      console.log('[CreatePipelineModal] Creating pipeline:', pipelineName);
      console.log('[CreatePipelineModal] Project info:', { githubOwner, githubRepo, selectedBranch });
      
      // 파이프라인 생성 API 호출
      const response = await apiClient.createPipeline(projectId, {
        name: pipelineName,
        blocks: []  // 초기에는 빈 블록으로 시작
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('[CreatePipelineModal] Pipeline created:', response.data);
      
      // 파이프라인 목록 다시 로드
      await fetchPipelines(projectId);
      
      // 새로 생성된 파이프라인으로 이동
      if (response.data?.id || response.data?.pipeline_id) {
        const pipelineId = response.data.id || response.data.pipeline_id;
        router.push(`/projects/${projectId}/pipelines/${pipelineId}`);
      }
      
      toast.success("파이프라인이 생성되었습니다!");
      
      // 모달 닫기 및 초기화
      setPipelineName("");
      onClose();
    } catch (error) {
      console.error('[CreatePipelineModal] Failed to create pipeline:', error);
      toast.error("파이프라인 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setPipelineName("");
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                새 파이프라인 만들기
              </h2>
              {projectName && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {projectName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            파이프라인 이름
          </label>
          <input
            type="text"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: Production Deploy"
            disabled={isCreating}
            autoFocus
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            파이프라인 이름은 나중에 변경할 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !pipelineName.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                생성 중...
              </>
            ) : (
              '파이프라인 생성'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}