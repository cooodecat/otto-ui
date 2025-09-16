"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { TestCustomNodeData, CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { Wrench } from "lucide-react";
import { CICDBlockGroup } from "@/types/block-enum";

const TestCustomNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as TestCustomNodeData;
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.TEST];

  const [manager, setManager] = useState(nodeData.packageManager || "pnpm");
  const [script, setScript] = useState(nodeData.scriptName || "test");
  const [coverage, setCoverage] = useState(Boolean(nodeData.generateReports));

  return (
    <BaseNode
      data={{
        ...nodeData,
        packageManager: manager,
        scriptName: script,
        generateReports: coverage,
      }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Wrench className="w-4 h-4 text-white" />}
      minWidth={300}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">PackageManager</div>
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
          <div className="text-gray-600">ScriptName</div>
          <input
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded"
            placeholder="test"
          />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Generate Reports</div>
          <input
            type="checkbox"
            checked={coverage}
            onChange={(e) => setCoverage(e.target.checked)}
          />
        </div>
      </div>
    </BaseNode>
  );
});

TestCustomNode.displayName = "TestCustomNode";

export default TestCustomNode;
