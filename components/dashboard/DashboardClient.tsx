"use client";

import { useRef, useEffect, useState } from "react";
import CICDFlowCanvas, { CICDFlowCanvasRef } from "@/components/flow/CICDFlowCanvas";
import { BaseCICDNodeData } from "@/types/cicd-node.types";

export default function DashboardClient() {
  const flowCanvasRef = useRef<CICDFlowCanvasRef | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [projectId] = useState(() => crypto.randomUUID()); // 임시 프로젝트 ID

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSavePipeline = async () => {
    console.log("💾 Save Pipeline button clicked!");
    
    if (!flowCanvasRef.current) {
      console.warn("❌ Flow canvas not ready");
      return;
    }
    
    const { nodes, edges } = flowCanvasRef.current.getFlowData();
    
    const pipelineData = {
      projectId,
      name: `Pipeline ${new Date().toLocaleString()}`,
      description: "Saved pipeline from dashboard",
      flowData: { nodes, edges }
    };
    
    try {
      console.log("💾 Saving pipeline to server:", pipelineData);
      
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelineData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedPipeline = await response.json();
      console.log("✅ Pipeline saved successfully:", savedPipeline);
      
    } catch (error) {
      console.error("❌ Failed to save pipeline:", error);
    }
  };

  const handleRunPipeline = async () => {
    console.log("🔥 Run Pipeline button clicked!");
    
    if (!flowCanvasRef.current) {
      console.warn("❌ Flow canvas not ready");
      return;
    }
    
    console.log("✅ Flow canvas ready, getting data...");

    const { nodes, edges } = flowCanvasRef.current.getFlowData();
    
    // 먼저 서버에 저장
    await handleSavePipeline();
    
    // 디버깅: 노드와 엣지 정보 출력
    console.log("🔍 Raw nodes data:", nodes.map(n => ({ 
      id: n.id, 
      type: n.type, 
      label: n.data.label, 
      blockId: n.data.blockId 
    })));
    console.log("🔍 Raw edges data:", edges.map(e => ({ 
      source: e.source, 
      target: e.target, 
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    })));
    
    // Pipeline Start 노드만 별도 디버깅
    const pipelineStartNode = nodes.find(n => n.type === 'pipeline_start');
    if (pipelineStartNode) {
      const startConnections = edges.filter(e => e.source === pipelineStartNode.id);
      console.log("🏁 Pipeline Start connections:", startConnections);
    }
    
    // CICD 노드만 필터링 (일반 start 노드 제외, pipeline_start는 포함)
    const cicdNodes = nodes.filter(node => node.type !== 'start');

    // cicd-node.types.ts 타입 구조에 맞게 데이터 구성
    const pipelineBlocks = cicdNodes.map(node => {
      const nodeData = node.data as BaseCICDNodeData;
      
      // 해당 노드의 success/failed 연결 찾기
      const successEdge = edges.find(edge => 
        edge.source === node.id && (
          edge.sourceHandle === 'success-output' || 
          !edge.sourceHandle || // 기본 output handle (Pipeline Start 등)
          edge.sourceHandle === 'default'
        )
      );
      const failedEdge = edges.find(edge => 
        edge.source === node.id && edge.sourceHandle === 'failed-output'
      );
      
      // 개별 노드 연결 디버깅
      console.log(`🔗 ${node.type} (${node.id}):`, {
        successEdge: successEdge ? `${successEdge.target}(${successEdge.sourceHandle})` : null,
        failedEdge: failedEdge ? `${failedEdge.target}(${failedEdge.sourceHandle})` : null
      });

      // 연결된 타겟 노드들의 block_id 찾기
      const getTargetBlockId = (targetNodeId: string | undefined) => {
        if (!targetNodeId) return null;
        const targetNode = nodes.find(n => n.id === targetNodeId);
        return targetNode?.data?.blockId || targetNodeId;
      };

      // snake_case만 사용하여 구조 생성
      const result: any = {
        label: nodeData.label,
        blockType: nodeData.blockType,
        groupType: nodeData.groupType,
        blockId: nodeData.blockId || node.id,
        // success/failed 연결 설정 - 타겟 노드의 blockId 사용
        onSuccess: getTargetBlockId(successEdge?.target),
        onFailed: getTargetBlockId(failedEdge?.target),
      };

      // 다른 필드들을 camelCase로 유지
      Object.keys(nodeData).forEach(key => {
        if (!['label', 'blockType', 'groupType', 'blockId'].includes(key)) {
          result[key] = nodeData[key as keyof BaseCICDNodeData];
        }
      });

      return result;
    });

    // 배열 형태로 출력
    console.log("🚀 Pipeline Blocks Array (cicd-node.types.ts format):");
    console.log(JSON.stringify(pipelineBlocks, null, 2));
    
    // 추후 실제 API 호출
    // await fetch('/api/pipeline/run', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ blocks: pipelineBlocks })
    // });
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CI/CD Pipeline Builder</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage your CI/CD pipelines with drag-and-drop blocks
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 파이프라인 액션 버튼들 */}
            <button 
              onClick={handleSavePipeline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Pipeline
            </button>
            <button 
              onClick={handleRunPipeline}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Run Pipeline
            </button>
          </div>
        </div>
      </header>

      {/* CI/CD 플로우 캔버스 */}
      <div className="h-[calc(100vh-80px)]">
        {isClient ? (
          <CICDFlowCanvas 
            projectId={projectId}
            onRef={(ref) => { flowCanvasRef.current = ref; }} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading flow canvas...
          </div>
        )}
      </div>
    </div>
  );
}