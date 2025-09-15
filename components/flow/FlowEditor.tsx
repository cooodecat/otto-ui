"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
  ReactFlowInstance,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

let nodeId = 0;
const getId = () => `node_${++nodeId}`;

const nodeColorMap: Record<string, string> = {
  agent: "#a855f7",
  api: "#3b82f6",
  condition: "#f97316",
  function: "#ef4444",
  knowledge: "#14b8a6",
  default: "#6b7280",
};

function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type || !reactFlowInstance || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const labelMap: Record<string, string> = {
        agent: "🤖 Agent",
        api: "🔗 API",
        condition: "🔶 Condition",
        function: "</> Function",
        knowledge: "🧠 Knowledge",
      };

      const newNode: Node = {
        id: getId(),
        type: "default",
        position,
        data: {
          label: labelMap[type] || type,
          type: type,
        },
        style: {
          backgroundColor: nodeColorMap[type] || "#ffffff",
          color: type ? "#ffffff" : "#374151",
          border: "2px solid rgba(0,0,0,0.1)",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "10px 15px",
          minWidth: "120px",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        connectionMode={ConnectionMode.Loose}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Controls showZoom={true} showFitView={true} showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as { type?: string };
            return nodeColorMap[nodeData?.type || "default"] || "#6b7280";
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
          style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <div className="fixed inset-0 bg-gray-50">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}
