/**
 * CI/CD Flow Canvas Component
 *
 * 이 컴포넌트는 CI/CD 파이프라인을 시각적으로 구성할 수 있는 드래그 앤 드롭 인터페이스를 제공합니다.
 * React Flow 라이브러리를 기반으로 구축되었으며, 다음과 같은 주요 기능을 포함합니다:
 *
 * 주요 기능:
 * - 드래그 앤 드롭으로 블록 추가
 * - success/failed 경로를 가진 조건부 연결
 * - 실시간 플로우 데이터 추출
 * - 1:1 연결 제한 (각 output handle당 최대 1개 연결)
 *
 * 사용되는 블록 그룹:
 * - PREBUILD: 환경 설정 (OS Packages, Node Version, Environment)
 * - BUILD: 빌드 프로세스 (Install Packages, Webpack/Vite Build, Custom Build)
 * - TEST: 테스팅 (Jest, Mocha, Vitest, Playwright, Custom Tests)
 * - NOTIFICATION: 알림 (Slack, Email)
 * - UTILITY: 유틸리티 (Condition, Parallel, Custom Command)
 *
 * 주의: DEPLOY 블록은 현재 비활성화되어 있음
 */
"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
import { nodeTypes, createNodeInstance } from "./nodes/node-registry";
import { edgeTypes, cicdEdgeOptions } from "./edges";

/**
 * 초기 노드 구성 - 빈 캔버스에서 시작
 */
const initialNodes: Node[] = [];

function CICDDropZone({
  projectId,
  onRef,
}: {
  projectId: string;
  onRef?: (ref: CICDFlowCanvasRef) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const initializedRef = useRef(false);

  // localStorage에서 파이프라인 데이터 불러오기
  useEffect(() => {
    if (!initializedRef.current && projectId) {
      const storageKey = `pipeline-${projectId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        try {
          const { nodes: savedNodes, edges: savedEdges } =
            JSON.parse(savedData);
          console.log(
            `📁 Loading pipeline from localStorage (${storageKey}):`,
            { nodes: savedNodes.length, edges: savedEdges.length }
          );

          setNodes(savedNodes);
          setEdges(savedEdges);
        } catch (error) {
          console.error("❌ Failed to parse saved pipeline data:", error);
          // 파싱 실패시 기본 노드 생성
          createDefaultPipelineStart();
        }
      } else {
        // 저장된 데이터가 없으면 기본 노드 생성
        createDefaultPipelineStart();
      }

      initializedRef.current = true;
    }
  }, [projectId]);

  const createDefaultPipelineStart = () => {
    console.log("🏁 Creating default Pipeline Start node...");
    const pipelineStartNode = createNodeInstance("pipeline_start", {
      x: 100,
      y: 100,
    });

    // 삭제 불가능하도록 설정
    pipelineStartNode.selectable = false;
    pipelineStartNode.deletable = false;

    console.log("🏁 Pipeline Start node created:", pipelineStartNode);
    setNodes([pipelineStartNode]);
  };

  // localStorage 저장 함수
  const saveToLocalStorage = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (
        initializedRef.current &&
        projectId &&
        (currentNodes.length > 0 || currentEdges.length > 0)
      ) {
        const storageKey = `pipeline-${projectId}`;
        const pipelineData = { nodes: currentNodes, edges: currentEdges };
        localStorage.setItem(storageKey, JSON.stringify(pipelineData));
        console.log(`💾 Saved to localStorage (${storageKey}):`, {
          nodes: currentNodes.length,
          edges: currentEdges.length,
        });
      }
    },
    [projectId]
  );

  // localStorage에 자동 저장 (상태 변경 감지)
  useEffect(() => {
    saveToLocalStorage(nodes, edges);
  }, [nodes, edges, saveToLocalStorage]);

  // Ref 등록
  React.useEffect(() => {
    if (onRef) {
      console.log(
        "🔗 CICDFlowCanvas: Registering ref with",
        nodes.length,
        "nodes and",
        edges.length,
        "edges"
      );
      onRef({
        getFlowData: () => {
          console.log(
            "📊 getFlowData called - returning",
            nodes.length,
            "nodes and",
            edges.length,
            "edges"
          );
          return { nodes, edges };
        },
      });
    }
  }, [onRef, nodes, edges]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => {
      // 연결 전 한 번 더 검증 (현재 edges 상태 사용)
      const { source, sourceHandle } = params;

      // 1:1 연결 제한 검증
      if (
        sourceHandle === "success-output" ||
        sourceHandle === "failed-output" ||
        !sourceHandle ||
        sourceHandle === "default"
      ) {
        const existingConnection = eds.find(
          (edge) => edge.source === source && edge.sourceHandle === sourceHandle
        );

        if (existingConnection) {
          console.warn(
            "⚠️ Connection blocked: Already has a connection from this handle"
          );
          return eds; // 기존 상태 유지 (연결 차단)
        }
      }

      // 연결 허용
      return addEdge(
        {
          ...params,
          ...cicdEdgeOptions, // CI/CD 전용 간선 사용
          data: {
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
          },
        },
        eds
      );
    });
  }, []);

  // 연결 유효성 검사: 각 output handle당 최대 1개 연결만 허용
  const isValidConnection = useCallback(
    (connection: any) => {
      const { source, sourceHandle } = connection;

      // 모든 출력 핸들에 1:1 연결 제한 적용
      if (
        sourceHandle === "success-output" ||
        sourceHandle === "failed-output" ||
        !sourceHandle || // 기본 output handle
        sourceHandle === "default"
      ) {
        // 이미 해당 소스 핸들로 연결된 간선이 있는지 확인
        const existingConnection = edges.find(
          (edge) => edge.source === source && edge.sourceHandle === sourceHandle
        );

        // 이미 연결이 있으면 새로운 연결 차단
        return !existingConnection;
      }

      // 기타 핸들은 제한 없음 (다중 출력이 필요한 특수한 경우)
      return true;
    },
    [edges]
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

      try {
        const newNode = createNodeInstance(type, position);
        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error("Failed to create node:", error);
      }
    },
    [screenToFlowPosition]
  );

  return (
    <div className="flex h-full">
      {/* 플로우 캔버스 (팔레트는 GlobalSidebar 사용) */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={cicdEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          isValidConnection={isValidConnection}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
            maxZoom: 1,
            minZoom: 0.3,
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
          connectionLineStyle={{
            stroke: "#10b981",
            strokeWidth: 2,
            strokeDasharray: "8 4",
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          deleteKeyCode={null}
          selectionOnDrag={false}
          selectNodesOnDrag={false}
          nodesConnectable={true}
          nodesDraggable={true}
          elementsSelectable={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls
            className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm"
            position="bottom-right"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export interface CICDFlowCanvasRef {
  getFlowData: () => { nodes: any[]; edges: any[] };
}

export default function CICDFlowCanvas({
  projectId,
  onRef,
}: {
  projectId: string;
  onRef?: (ref: CICDFlowCanvasRef) => void;
}) {
  return (
    <div className="h-screen w-full bg-gray-50">
      <ReactFlowProvider>
        <CICDDropZone projectId={projectId} onRef={onRef} />
      </ReactFlowProvider>
    </div>
  );
}
