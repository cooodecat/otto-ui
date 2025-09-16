"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw, Play } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import CICDFlowCanvas, {
  CICDFlowCanvasRef,
} from "@/components/flow/CICDFlowCanvas";
import { BaseCICDNodeData } from "@/types/cicd-node.types";
import { useProjectStore } from "@/lib/projectStore";
import { usePipelineStore } from "@/lib/pipelineStore";
import { mapProjectId, mapPipelineId } from "@/lib/utils/idMapping";

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

  // URL 파라미터에서 ID 추출 및 Mock 데이터 ID로 변환
  const rawProjectId = params.projectId as string;
  const rawPipelineId = params.pipelineId as string;

  const projectId = mapProjectId(rawProjectId);
  const _pipelineId = mapPipelineId(rawPipelineId);

  // 스토어 훅 사용
  const { fetchProjects, setSelectedProject } = useProjectStore();

  const { setCurrentProject, fetchPipelines } = usePipelineStore();

  useEffect(() => {
    setIsClient(true);

    const initializePageData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUser(user);

      // 스토어 데이터 초기화
      await fetchProjects();
      setSelectedProject(projectId);
      setCurrentProject(projectId);
      await fetchPipelines(projectId);
    };

    initializePageData();
  }, [
    router,
    projectId,
    fetchProjects,
    setSelectedProject,
    setCurrentProject,
    fetchPipelines,
  ]);

  const handleInitialize = useCallback(() => {
    // TODO: 파이프라인 초기화 로직
    console.log("🔄 Pipeline initialized!");
    window.location.reload(); // 임시 해결책
  }, []);

  const handleRunPipeline = useCallback(() => {
    console.log("🔥 Run Pipeline button clicked!");

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

      // camelCase 사용하여 구조 생성
      const result: Record<string, unknown> = {
        label: nodeData.label,
        blockType: nodeData.blockType,
        groupType: nodeData.groupType,
        blockId: nodeData.blockId || node.id,
        // success/failed 연결 설정 - 타겟 노드의 blockId 사용
        onSuccess: getTargetBlockId(successEdge?.target),
        onFailed: getTargetBlockId(failedEdge?.target),
      };

      // 다른 필드들을 camelCase로 유지
      Object.keys(nodeData).forEach((key) => {
        if (!["label", "blockType", "groupType", "blockId"].includes(key)) {
          result[key] = nodeData[key as keyof BaseCICDNodeData];
        }
      });

      return result;
    });

    console.log("🚀 Pipeline Blocks (cicd-node.types.ts format):");
    console.log(JSON.stringify(pipelineBlocks, null, 2));

    // TODO: 실제 API 호출
    alert("Pipeline triggered!");
  }, []);

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
          onClick={handleRunPipeline}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-sm font-medium text-sm"
          title="파이프라인 실행"
        >
          <Play className="w-4 h-6" />
        </button>
      </div>
      <CICDFlowCanvas
        projectId={projectId}
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
