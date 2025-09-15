"use client";

import { memo, ReactElement } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { Play, Code, Trash2 } from "lucide-react";

export interface UnifiedNodeData {
  label?: string;
  type?: string;
  icon?: string;
  triggerType?: string;
}

// 아이콘 맵핑
const iconMap: Record<string, () => ReactElement> = {
  "🤖": () => <span className="text-lg">🤖</span>,
  "🔗": () => <span className="text-lg">🔗</span>,
  "🔶": () => <span className="text-lg">🔶</span>,
  "</>": () => <Code className="w-4 h-4 text-white" />,
  "🧠": () => <span className="text-lg">🧠</span>,
  "⚡": () => <span className="text-white text-lg">⚡</span>,
  "▶️": () => <Play className="w-4 h-4 text-white" />,
};

// 색상 맵핑
const colorMap: Record<string, { bg: string; hex: string }> = {
  start: { bg: "bg-blue-500", hex: "#3b82f6" },
  agent: { bg: "bg-purple-500", hex: "#a855f7" },
  api: { bg: "bg-blue-500", hex: "#3b82f6" },
  condition: { bg: "bg-orange-500", hex: "#f97316" },
  function: { bg: "bg-red-500", hex: "#ef4444" },
  knowledge: { bg: "bg-teal-500", hex: "#14b8a6" },
  default: { bg: "bg-gray-500", hex: "#6b7280" },
};

const UnifiedNode = memo(({ data, id, type }: NodeProps) => {
  const { deleteElements } = useReactFlow();
  const nodeData = data as unknown as UnifiedNodeData;
  const nodeType = type || nodeData.type || "default";
  const colors = colorMap[nodeType] || colorMap.default;

  // 아이콘 결정
  let IconComponent = null;
  if (nodeType === "start") {
    IconComponent = iconMap["▶️"];
  } else if (nodeType === "condition") {
    IconComponent = iconMap["⚡"];
  } else if (nodeData.icon) {
    IconComponent = iconMap[nodeData.icon];
  }

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  // Start 노드 렌더링
  if (nodeType === "start") {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 min-w-[280px] cursor-grab active:cursor-grabbing">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${colors.bg} rounded flex items-center justify-center`}
            >
              {IconComponent && <IconComponent />}
            </div>
            <span className="font-medium text-gray-900">
              {nodeData.label || "Start"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-sm text-gray-600">Start Workflow</div>
        </div>

        {/* Handle - 아래쪽만 */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-12 !h-2 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ bottom: "-4px" }}
        />
      </div>
    );
  }

  // Condition 노드 렌더링
  if (nodeType === "condition") {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 min-w-[320px] cursor-grab active:cursor-grabbing">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${colors.bg} rounded flex items-center justify-center`}
            >
              {IconComponent && <IconComponent />}
            </div>
            <span className="font-medium text-gray-900">
              {nodeData.label || "Condition"}
            </span>
          </div>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 rounded"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* IF Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">if</span>
            <div className="flex items-center gap-1"></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">1</span>
              <code className="text-gray-600">&lt;response&gt;</code>
              <span className="text-gray-400">===</span>
              <span className="text-gray-600">true</span>
            </div>
          </div>
        </div>

        {/* ELSE Section */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">else</span>
            <div className="flex items-center gap-1"></div>
          </div>
        </div>

        {/* Handles - 좌우 */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-12 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ top: "20%", left: "-4px" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-12 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ top: "35%", right: "-4px" }}
          id="if-output"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-12 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ top: "75%", right: "-4px" }}
          id="else-output"
        />
      </div>
    );
  }

  // 기본 노드 렌더링 (agent, api, function, knowledge 등)
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 min-w-[240px] cursor-grab active:cursor-grabbing">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 ${colors.bg} rounded flex items-center justify-center`}
          >
            {IconComponent ? (
              <IconComponent />
            ) : (
              <span className="text-white text-xs">N</span>
            )}
          </div>
          <span className="font-medium text-gray-900">
            {nodeData?.label || "Node"}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-50 rounded"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-gray-600">
          Configure {nodeData?.label || "Node"}
        </div>
      </div>

      {/* Handles - 위아래만 */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-12 !h-2 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
        style={{ top: "-4px" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-12 !h-2 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
        style={{ bottom: "-4px" }}
      />
    </div>
  );
});

UnifiedNode.displayName = "UnifiedNode";

export default UnifiedNode;
