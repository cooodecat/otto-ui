"use client";

import React, { useCallback, useState } from "react";
import { RotateCcw, Play, Save } from "lucide-react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
  useReactFlow,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/reactflow-overrides.css";
import { nodeTypes, nodeConfigs } from "./nodes";
import { edgeTypes, defaultEdgeOptions } from "./edges";

let nodeId = 0;
const getId = () => `node_${++nodeId}`;

// Initial start node - protected from deletion
// 화면 중앙에 위치
const initialNodes: Node[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 0, y: 0 }, // fitView로 자동 중앙 정렬
    data: {
      label: "Start",
      type: "start",
    },
    selectable: false, // 선택 불가
    deletable: false, // 삭제 불가
  },
];

function DropZone({
  onInitializeReady,
}: {
  onInitializeReady: (fn: () => void) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  const handleInitialize = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
  }, []);

  React.useEffect(() => {
    onInitializeReady(handleInitialize);
  }, [handleInitialize, onInitializeReady]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "animatedDashed",
            selectable: true, // 간선 선택 가능
            deletable: true, // 간선 삭제 가능
            style: {
              stroke: "#9ca3af",
              strokeWidth: 2,
            },
          },
          eds
        )
      ),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = nodeConfigs[type as keyof typeof nodeConfigs];

      const newNode: Node = {
        id: getId(),
        type: type,
        position,
        data: {
          label: config?.label || type,
          type: type,
          icon: config?.icon,
        },
        selectable: true, // 선택 가능
        deletable: true, // Delete 키로 삭제 가능
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={{
          padding: 0.5,
          includeHiddenNodes: false,
          maxZoom: 1,
          minZoom: 0.5,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
        connectionLineStyle={{
          stroke: "#9ca3af",
          strokeWidth: 2,
          strokeDasharray: "8 4",
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={null} // Delete 키 비활성화
        selectionOnDrag={false} // 드래그로 선택 비활성화
        selectNodesOnDrag={false} // 노드 드래그 시 선택 비활성화
        nodesConnectable={true}
        nodesDraggable={true}
        elementsSelectable={true} // 간선 선택 가능
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

/**
 * BasicFlowCanvas 컴포넌트 props
 */
interface BasicFlowCanvasProps {
  /** 프로젝트 ID */
  projectId: string;
  /** 파이프라인 ID */
  pipelineId: string;
}

function FlowCanvasWithButtons({
  projectId,
  pipelineId,
}: BasicFlowCanvasProps) {
  const [handleInitialize, setHandleInitialize] = useState<(() => void) | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const onInitializeReady = useCallback((fn: () => void) => {
    setHandleInitialize(() => fn);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // 로컬스토리지에서 저장된 플로우 데이터 가져오기
      const storageKey = `pipeline-${projectId}-${pipelineId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (!savedData) {
        alert("저장할 데이터가 없습니다.");
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

      alert("파이프라인이 저장되었습니다!");
    } catch (error) {
      console.error("Save error:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [projectId, pipelineId]);

  const handleRun = useCallback(async () => {
    try {
      // 먼저 저장
      await handleSave();
      
      // 그 다음 실행
      alert("Pipeline triggered!");
    } catch (error) {
      console.error("Run error:", error);
      alert("실행에 실패했습니다.");
    }
  }, [handleSave]);

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button
          onClick={handleInitialize || (() => {})}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-medium text-sm"
          title="파이프라인 초기화"
        >
          <RotateCcw className="w-4 h-6" />
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title="파이프라인 저장"
        >
          <Save className="w-4 h-6" />
          {isSaving ? "저장 중..." : "저장"}
        </button>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-sm font-medium text-sm"
          title="파이프라인 실행"
        >
          <Play className="w-4 h-6" />
        </button>
      </div>
      <DropZone onInitializeReady={onInitializeReady} />
    </div>
  );
}

/**
 * 파이프라인 에디터 메인 컴포넌트
 * @param projectId - 프로젝트 ID
 * @param pipelineId - 파이프라인 ID
 * @returns 파이프라인 플로우 캔버스
 */
export default function BasicFlowCanvas({
  projectId,
  pipelineId,
}: BasicFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasWithButtons projectId={projectId} pipelineId={pipelineId} />
    </ReactFlowProvider>
  );
}
