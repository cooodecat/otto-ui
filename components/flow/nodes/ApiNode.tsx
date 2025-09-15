"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { ApiNodeData } from "@/types/node.types";

const ApiNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as ApiNodeData;
  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-blue-500"
      icon={<span className="text-lg">🔗</span>}
    >
      <div className="space-y-1">
        {nodeData.method && nodeData.url ? (
          <>
            <div className="text-xs font-mono text-gray-600">
              {nodeData.method}
            </div>
            <div className="text-xs text-gray-500 truncate">{nodeData.url}</div>
          </>
        ) : (
          <div className="text-sm text-gray-600">Configure API</div>
        )}
      </div>
    </BaseNode>
  );
});

ApiNode.displayName = "ApiNode";

export default ApiNode;
