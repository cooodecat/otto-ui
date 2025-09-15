"use client";

import { useCallback, useState } from "react";
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

function DropZone() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { screenToFlowPosition } = useReactFlow();

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

export default function BasicFlowCanvas() {
  return (
    <div className="h-screen w-full">
      <ReactFlowProvider>
        <DropZone />
      </ReactFlowProvider>
    </div>
  );
}
