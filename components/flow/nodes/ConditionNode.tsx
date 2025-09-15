"use client";

import { memo } from "react";
import { NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { ConditionNodeData } from "@/types/node.types";

const ConditionNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as ConditionNodeData;
  const outputHandles = [
    {
      id: "if-output",
      position: Position.Right,
      style: { top: "35%", right: "-4px" },
    },
    {
      id: "else-output",
      position: Position.Right,
      style: { top: "75%", right: "-4px" },
    },
  ];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-orange-500"
      icon={<span className="text-white text-lg">⚡</span>}
      minWidth={320}
      showOutput={false}
      outputHandles={outputHandles}
    >
      <div className="space-y-3">
        {/* IF Section */}
        <div className="border-b border-gray-100 pb-3">
          <div className="font-medium text-gray-900 mb-2">if</div>
          <div className="bg-gray-50 rounded-lg p-3">
            {nodeData.conditions && nodeData.conditions.length > 0 ? (
              nodeData.conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{index + 1}</span>
                  <code className="text-gray-600">{condition.field}</code>
                  <span className="text-gray-400">{condition.operator}</span>
                  <span className="text-gray-600">{String(condition.value)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Configure conditions</div>
            )}
          </div>
        </div>

        {/* ELSE Section */}
        <div>
          <div className="font-medium text-gray-900">else</div>
        </div>
      </div>
    </BaseNode>
  );
});

ConditionNode.displayName = "ConditionNode";

export default ConditionNode;