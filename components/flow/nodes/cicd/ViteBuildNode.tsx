"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { BuildViteNodeData, CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { Zap } from "lucide-react";

const ViteBuildNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as BuildViteNodeData;
  const [mode, setMode] = useState(nodeData.mode || 'production');
  const [basePath, setBasePath] = useState(nodeData.basePath || '');
  const [outDir, setOutDir] = useState(nodeData.outputDir || '');
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.BUILD];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Zap className="w-4 h-4 text-white" />}
      minWidth={280}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">Mode</div>
          <select value={mode} onChange={(e)=>setMode(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded">
            <option value="development">development</option>
            <option value="production">production</option>
          </select>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">Base</div>
          <input value={basePath} onChange={(e)=>setBasePath(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="/" />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">OutDir</div>
          <input value={outDir} onChange={(e)=>setOutDir(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="dist" />
        </div>
      </div>
    </BaseNode>
  );
});

ViteBuildNode.displayName = "ViteBuildNode";

export default ViteBuildNode;


