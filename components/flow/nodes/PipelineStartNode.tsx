"use client";

import { memo } from "react";
import { NodeProps, Handle, Position } from "@xyflow/react";
import { Play } from "lucide-react";
import { PipelineStartNodeData } from "@/types/cicd-node.types";

const PipelineStartNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as PipelineStartNodeData;
  
  return (
    <div className="relative bg-white border-2 border-green-300 rounded-lg shadow-lg min-w-[280px]">
      {/* Header */}
      <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Play className="w-4 h-4 text-white" />
        <h3 className="font-medium text-sm">{nodeData.label}</h3>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-gray-600">
          파이프라인 시작점
        </div>
      </div>
      
      {/* Single Success Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="success-output"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#10b981",
          border: "2px solid #059669",
          width: 12,
          height: 12,
          borderRadius: "50%",
          bottom: "-6px"
        }}
      />
    </div>
  );
});

PipelineStartNode.displayName = "PipelineStartNode";

export default PipelineStartNode;