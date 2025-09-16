"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { InstallNodePackageNodeData, CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { Package } from "lucide-react";
import {CICDBlockGroup} from "@/types/block-enum";

const InstallPackagesNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as InstallNodePackageNodeData;
  const [manager, setManager] = useState(nodeData.package_manager);
  const [clean, setClean] = useState(Boolean(nodeData.clean_install));
  const [prodOnly, setProdOnly] = useState(Boolean(nodeData.production_only));
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.BUILD];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Package className="w-4 h-4 text-white" />}
      minWidth={300}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">PackageManager</div>
          <select
            value={manager}
            onChange={(e) => setManager(e.target.value as any)}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            <option value="npm">npm</option>
            <option value="yarn">yarn</option>
            <option value="pnpm">pnpm</option>
          </select>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">CleanInstall</div>
          <input
            type="checkbox"
            checked={clean}
            onChange={(e) => setClean(e.target.checked)}
          />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-500">ProductionOnly</div>
          <input
            type="checkbox"
            checked={prodOnly}
            onChange={(e) => setProdOnly(e.target.checked)}
          />
        </div>
      </div>
    </BaseNode>
  );
});

InstallPackagesNode.displayName = "InstallPackagesNode";

export default InstallPackagesNode;


