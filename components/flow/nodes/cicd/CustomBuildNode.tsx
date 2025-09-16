"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { BuildCustomNodeData, CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { Hammer } from "lucide-react";

const CustomBuildNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as BuildCustomNodeData;
  const [manager, setManager] = useState(nodeData.packageManager);
  const [script, setScript] = useState(nodeData.scriptName || 'build');
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.BUILD];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Hammer className="w-4 h-4 text-white" />}
      minWidth={300}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">PackageManager</div>
          <select value={manager} onChange={(e)=>setManager(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded">
            <option value="npm">npm</option>
            <option value="yarn">yarn</option>
            <option value="pnpm">pnpm</option>
          </select>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">ScriptName</div>
          <input value={script} onChange={(e)=>setScript(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="build" />
        </div>
      </div>
    </BaseNode>
  );
});

CustomBuildNode.displayName = "CustomBuildNode";

export default CustomBuildNode;


