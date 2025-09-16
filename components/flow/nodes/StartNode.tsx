"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import BaseNode from "./BaseNode";
import { StartNodeData } from "@/types/node.types";

const StartNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as StartNodeData;

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-blue-500"
      icon={<Play className="w-4 h-4 text-white" />}
      deletable={false}
      minWidth={280}
      showInput={false}
    >
      <div className="text-sm text-gray-600">
        {nodeData.description || "파이프라인 시작"}
      </div>
    </BaseNode>
  );
});

StartNode.displayName = "StartNode";

export default StartNode;
