"use client";

import { useRef, useEffect, useState } from "react";
import CICDFlowCanvas, { CICDFlowCanvasRef } from "@/components/flow/CICDFlowCanvas";
import { BaseCICDNodeData } from "@/types/cicd-node.types";

export default function DashboardClient() {
  const flowCanvasRef = useRef<CICDFlowCanvasRef | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRunPipeline = () => {
    console.log("🔥 Run Pipeline button clicked!");
    
    if (!flowCanvasRef.current) {
      console.warn("❌ Flow canvas not ready");
      return;
    }
    
    console.log("✅ Flow canvas ready, getting data...");

    const { nodes, edges } = flowCanvasRef.current.getFlowData();
    
    // CICD 노드만 필터링 (start 노드 제외)
    const cicdNodes = nodes.filter(node => node.type !== 'start');
    
    // Node ID를 UUID로 매핑
    const nodeIdMap = new Map<string, string>();
    cicdNodes.forEach(node => {
      nodeIdMap.set(node.id, crypto.randomUUID());
    });

    // cicd-node.types.ts 타입 구조에 맞게 데이터 구성
    const pipelineBlocks = cicdNodes.map(node => {
      const nodeData = node.data as BaseCICDNodeData;
      
      // 해당 노드의 success/failed 연결 찾기
      const successEdge = edges.find(edge => 
        edge.source === node.id && edge.sourceHandle === 'success-output'
      );
      const failedEdge = edges.find(edge => 
        edge.source === node.id && edge.sourceHandle === 'failed-output'
      );

      // snake_case만 사용하여 구조 생성
      const result: any = {
        label: nodeData.label,
        block_type: nodeData.block_type,
        group_type: nodeData.group_type,
        block_id: nodeIdMap.get(node.id), // UUID 사용
        // success/failed 연결을 UUID로 변환
        on_success: successEdge ? nodeIdMap.get(successEdge.target) || null : null,
        on_failed: failedEdge ? nodeIdMap.get(failedEdge.target) || null : null,
      };

      // 다른 필드들을 snake_case로 변환
      Object.keys(nodeData).forEach(key => {
        if (!['label', 'block_type', 'group_type', 'block_id'].includes(key)) {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          result[snakeKey] = nodeData[key as keyof BaseCICDNodeData];
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
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
          <CICDFlowCanvas onRef={(ref) => { flowCanvasRef.current = ref; }} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading flow canvas...
          </div>
        )}
      </div>
    </div>
  );
}