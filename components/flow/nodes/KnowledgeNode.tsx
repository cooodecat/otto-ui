"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { KnowledgeNodeData } from "@/types/node.types";

const KnowledgeNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as KnowledgeNodeData;
  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-teal-500"
      icon={<span className="text-lg">🧠</span>}
    >
      <div className="space-y-1">
        {nodeData.knowledgeBaseId ? (
          <>
            <div className="text-sm text-gray-600">
              Knowledge Base: {nodeData.knowledgeBaseId}
            </div>
            {nodeData.topK && (
              <div className="text-xs text-gray-500">
                Top {nodeData.topK} results
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600">Configure Knowledge</div>
        )}
      </div>
    </BaseNode>
  );
});

KnowledgeNode.displayName = "KnowledgeNode";

export default KnowledgeNode;
