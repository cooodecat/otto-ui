"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { NodeVersionNodeData, CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { Package } from "lucide-react";
import {CICDBlockGroup} from "@/types/block-enum";

const NodeVersionNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as NodeVersionNodeData;

  const [version, setVersion] = useState(nodeData.version || "18");
  const [pkgManager, setPkgManager] = useState<NodeVersionNodeData["packageManager"]>(nodeData.packageManager || "pnpm");

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD];

  return (
    <BaseNode
      data={{ ...nodeData, version, packageManager: pkgManager }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Package className="w-4 h-4 text-white" />}
      minWidth={320}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3">
        <div className={`p-3 rounded ${groupColors.bgClass} ${groupColors.borderClass} border`}>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 18"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Package Manager</label>
              <select
                value={pkgManager}
                onChange={(e) => setPkgManager(e.target.value as any)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="pnpm">pnpm</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
});

NodeVersionNode.displayName = "NodeVersionNode";

export default NodeVersionNode;


