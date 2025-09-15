"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { Code } from "lucide-react";
import BaseNode from "./BaseNode";
import { FunctionNodeData } from "@/types/node.types";

const FunctionNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as FunctionNodeData;
  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-red-500"
      icon={<Code className="w-4 h-4 text-white" />}
    >
      <div className="space-y-1">
        {nodeData.functionName ? (
          <>
            <div className="text-sm font-mono text-gray-700">
              {nodeData.functionName}()
            </div>
            {nodeData.language && (
              <div className="text-xs text-gray-500">
                Language: {nodeData.language}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600">Configure Function</div>
        )}
      </div>
    </BaseNode>
  );
});

FunctionNode.displayName = "FunctionNode";

export default FunctionNode;
