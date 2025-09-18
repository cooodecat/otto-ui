"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw, Play, Loader2, Save } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import CICDFlowCanvas, {
  CICDFlowCanvasRef,
} from "@/components/flow/CICDFlowCanvas";
import { BaseCICDNodeData } from "@/types/cicd-node.types";
import { PipelineNode } from "@/types/api";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import {AnyPipelineBlock} from "@/types/backend-pipeline.types";

/**
 * 파이프라인 상세 페이지 컴포넌트
 * CI/CD 파이프라인을 시각적으로 구성하고 관리할 수 있는 에디터 페이지
 */
function PipelinePageContent() {
  const params = useParams();
  const router = useRouter();
  const flowCanvasRef = useRef<CICDFlowCanvasRef | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // URL 파라미터에서 ID 추출 (실제 DB ID 그대로 사용)
  const projectId = params.projectId as string;
  const pipelineId = params.pipelineId as string;

  // 스토어 훅 사용
  const {
    projects,
    fetchProjects,
    setSelectedProject
  } = useProjectStore();

  const {
    pipelines,
    setCurrentProject,
    fetchPipelines,
    getPipelinesByProject
  } = usePipelineStore();

  useEffect(() => {
    setIsClient(true);

    const initializePageData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !session) {
        router.push("/auth/signin");
        return;
      }

      setUser(user);

      // 토큰 설정
      if (session.access_token) {
        apiClient.setSupabaseToken(session.access_token);
      }

      try {
        // 1. 프로젝트 데이터 로드
        await fetchProjects();
        
        // 2. 프로젝트 유효성 검증
        const currentProjects = useProjectStore.getState().projects;
        const validProject = currentProjects.find(p => p.projectId === projectId);
        
        if (!validProject) {
          console.log('[PipelinePage] Invalid project ID, redirecting to latest project');
          // 유효하지 않은 프로젝트 ID인 경우, 최신 프로젝트로 리다이렉션
          if (currentProjects.length > 0) {
            const latestProject = currentProjects.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            })[0];
            
            // 해당 프로젝트의 파이프라인 조회
            await fetchPipelines(latestProject.projectId || latestProject.project_id);
            const projectPipelines = getPipelinesByProject(latestProject.projectId || latestProject.project_id);
            
            if (projectPipelines.length > 0) {
              const latestPipeline = projectPipelines.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
              })[0];
              router.push(`/projects/${latestProject.projectId}/pipelines/${latestPipeline.pipelineId}`);
            } else {
              router.push(`/projects/${latestProject.projectId}/pipelines`);
            }
          } else {
            router.push("/projects");
          }
          return;
        }

        // 3. 파이프라인 데이터 로드
        setSelectedProject(projectId);
        setCurrentProject(projectId);
        await fetchPipelines(projectId);
        
        // 4. 파이프라인 유효성 검증
        const projectPipelines = getPipelinesByProject(projectId);
        const validPipeline = projectPipelines.find(p => p.pipelineId === pipelineId);
        
        if (!validPipeline) {
          console.log('[PipelinePage] Invalid pipeline ID, redirecting to latest pipeline');
          // 유효하지 않은 파이프라인 ID인 경우, 최신 파이프라인으로 리다이렉션
          if (projectPipelines.length > 0) {
            const latestPipeline = projectPipelines.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            })[0];
            router.push(`/projects/${projectId}/pipelines/${latestPipeline.pipelineId}`);
          } else {
            router.push(`/projects/${projectId}/pipelines`);
          }
          return;
        }
      } catch (error) {
        console.error('[PipelinePage] Error initializing data:', error);
        toast.error("데이터 로드 중 오류가 발생했습니다.");
      }
    };

    initializePageData();
  }, [router, projectId, pipelineId]);

  const handleInitialize = useCallback(() => {
    if (!flowCanvasRef.current) {
      console.warn("❌ Flow canvas not ready");
      return;
    }

    // Pipeline Start 노드만 남기고 모든 노드 삭제
    flowCanvasRef.current.resetPipeline();
    console.log("🔄 Pipeline reset - keeping only Pipeline Start node");
  }, []);

  const handleSavePipeline = useCallback(async () => {
    setIsSaving(true);
    try {
      // 로컬스토리지에서 저장된 플로우 데이터 가져오기
      const storageKey = `pipeline-${projectId}-${pipelineId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (!savedData) {
        toast.error("저장할 데이터가 없습니다.");
        return;
      }

      const flowData = JSON.parse(savedData);

      // 서버에 저장
      const response = await fetch(`/api/pipelines/${pipelineId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flowData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save pipeline");
      }

      toast.success("파이프라인이 저장되었습니다!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [projectId, pipelineId]);

  const handleRunPipeline = useCallback(async () => {
    console.log("🔥 Run Pipeline button clicked!");

    // 먼저 저장
    try {
      await handleSavePipeline();
    } catch (error) {
      console.error("Failed to save before run:", error);
      toast.error("저장에 실패하여 실행할 수 없습니다.");
      return;
    }

    if (!flowCanvasRef.current) {
      console.warn("❌ Flow canvas not ready");
      return;
    }

    console.log("✅ Flow canvas ready, getting data...");

    const { nodes, edges } = flowCanvasRef.current.getFlowData();

    // CICD 노드만 필터링 (start 노드 제외)
    const cicdNodes = nodes.filter((node) => node.type !== "start");

    // cicd-node.types.ts 타입 구조에 맞게 데이터 구성
    const pipelineBlocks = cicdNodes.map((node) => {
      const nodeData = node.data as BaseCICDNodeData;

      // 해당 노드의 success/failed 연결 찾기
      const successEdge = edges.find(
        (edge) =>
          edge.source === node.id && edge.sourceHandle === "success-output"
      );
      const failedEdge = edges.find(
        (edge) =>
          edge.source === node.id && edge.sourceHandle === "failed-output"
      );

      // 연결된 타겟 노드들의 blockId 찾기
      const getTargetBlockId = (targetNodeId: string | undefined) => {
        if (!targetNodeId) return null;
        const targetNode = nodes.find((n) => n.id === targetNodeId);
        return targetNode?.data?.blockId || targetNodeId;
      };

      // PipelineNode 타입으로 구조 생성
      const result: AnyPipelineBlock = {
        label: nodeData.label,
        blockType: nodeData.blockType,
        groupType: nodeData.groupType as any,
        blockId: nodeData.blockId || node.id,
        // success/failed 연결 설정 - 타겟 노드의 blockId 사용
        onSuccess: getTargetBlockId(successEdge?.target),
        onFailed: getTargetBlockId(failedEdge?.target),
      } as AnyPipelineBlock;

      // 다른 필드들을 camelCase로 변환하여 추가
      Object.keys(nodeData).forEach((key) => {
        if (!["label", "blockType", "groupType", "blockId", "onSuccess", "onFailed"].includes(key)) {
          // snake_case를 camelCase로 변환
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          (result as any)[camelKey] = nodeData[key as keyof BaseCICDNodeData];
        }
      });

      return result;
    });

    console.log("🚀 Pipeline Blocks (cicd-node.types.ts format):");
    console.log(JSON.stringify(pipelineBlocks, null, 2));

    // 실제 API 호출로 빌드 시작
    try {
      setIsRunning(true);

      // Next.js API route를 통한 빌드 시작 호출
      const response = await fetch(`/api/build/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: pipelineBlocks
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const build = data.data || data;
      const buildId = build?.buildId || build?.id;
      
      toast.success(`Build #${build?.buildId || buildId?.slice(0, 8)} started successfully!`);
      
      // 빌드 로그 페이지로 이동
      router.push(`/projects/${projectId}/logs/${buildId}`);
    } catch (error) {
      console.error('Failed to start build:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start build');
    } finally {
      setIsRunning(false);
    }
  }, [projectId, router, handleSavePipeline]);

  if (!isClient || !user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* BasicFlowCanvas 스타일의 우상단 버튼들 */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button
          onClick={handleInitialize}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-medium text-sm"
          title="파이프라인 초기화"
        >
          <RotateCcw className="w-4 h-6" />
        </button>
        <button
          onClick={handleSavePipeline}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="파이프라인 저장"
        >
          <Save className="w-4 h-6" />
          {isSaving ? "저장 중..." : "저장"}
        </button>
        <button
          onClick={handleRunPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="파이프라인 실행"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Starting...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Build</span>
            </>
          )}
        </button>
      </div>
      <CICDFlowCanvas
        projectId={projectId}
        pipelineId={pipelineId}
        onRef={(ref) => {
          flowCanvasRef.current = ref;
        }}
      />
    </div>
  );
}

export default function PipelinePage() {
  return (
    <ReactFlowProvider>
      <PipelinePageContent />
    </ReactFlowProvider>
  );
}
