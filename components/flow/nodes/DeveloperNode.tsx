"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { DeveloperNodeData } from "@/types/node.types";

/**
 * 개발자 노드 - 새로운 노드 추가 예시
 * BaseNode를 활용하여 쉽게 새로운 노드를 만들 수 있음
 */
const DeveloperNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as DeveloperNodeData;
  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass="bg-green-500"
      icon={<span className="text-lg">👨‍💻</span>}
    >
      <div className="space-y-2">
        {nodeData.developerId ? (
          <>
            <div className="text-sm text-gray-600">
              Developer: {nodeData.developerId}
            </div>
            {nodeData.skills && nodeData.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {nodeData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {nodeData.experience && (
              <div className="text-xs text-gray-500">
                {nodeData.experience} years experience
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-600">Configure Developer</div>
        )}
      </div>
    </BaseNode>
  );
});

DeveloperNode.displayName = "DeveloperNode";

export default DeveloperNode;
