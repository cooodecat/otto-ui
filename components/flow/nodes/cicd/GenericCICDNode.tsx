"use client";

import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import {
  BaseCICDNodeData,
  CICD_GROUP_COLORS,
  BLOCK_TYPE_TO_GROUP,
  CICDBlockType,
  CICDBlockGroup,
} from "@/types/cicd-node.types";

/**
 * 특정 UI가 없는 CI/CD 블록들을 위한 범용 노드
 * - 헤더/색상/삭제 등 공통 UI만 제공
 * - 데이터는 읽기용 key-value로 간략히 표시
 */
const GenericCICDNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as BaseCICDNodeData;
  const group = nodeData.blockType
    ? BLOCK_TYPE_TO_GROUP[nodeData.blockType as CICDBlockType]
    : CICDBlockGroup.UTILITY; // 기본값으로 UTILITY 사용
  const groupColors = CICD_GROUP_COLORS[group] || CICD_GROUP_COLORS[CICDBlockGroup.UTILITY];

  // 표시에서 제외할 필드
  const hiddenKeys = new Set(["label", "blockType", "groupType", "blockId"]);

  const entries = Object.entries(nodeData).filter(
    ([k, v]) => !hiddenKeys.has(k) && v !== undefined && v !== null
  );

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      minWidth={280}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-2 text-sm">
        {entries.length === 0 ? (
          <div className="text-gray-500 italic">No configuration</div>
        ) : (
          <div className="space-y-1">
            {entries.slice(0, 6).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3"
              >
                <div className="text-gray-500 font-medium capitalize">
                  {key}
                </div>
                <div className="text-gray-800 max-w-[180px] truncate">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
            ))}
            {entries.length > 6 && (
              <div className="text-xs text-gray-400">
                +{entries.length - 6} more…
              </div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

GenericCICDNode.displayName = "GenericCICDNode";

export default GenericCICDNode;
