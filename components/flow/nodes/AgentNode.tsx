"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { AgentNodeData } from "@/types/node.types";

const AgentNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as AgentNodeData;
  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-purple-500"
      icon={<span className="text-lg">🤖</span>}
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          {nodeData.model ? `Model: ${nodeData.model}` : "Configure Agent"}
        </div>
        {nodeData.systemPrompt && (
          <div className="text-xs text-gray-500 truncate">
            {nodeData.systemPrompt}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

AgentNode.displayName = "AgentNode";

export default AgentNode;
