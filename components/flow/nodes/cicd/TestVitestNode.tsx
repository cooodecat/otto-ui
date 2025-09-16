"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { TestVitestNodeData, CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { FlaskConical } from "lucide-react";
import {CICDBlockGroup} from "@/types/block-enum";

const TestVitestNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as TestVitestNodeData;
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.TEST];

  const [env, setEnv] = useState<TestVitestNodeData["environment"]>(nodeData.environment || 'node');
  const [watch, setWatch] = useState<boolean>(Boolean(nodeData.watchMode));
  const [coverage, setCoverage] = useState<boolean>(Boolean(nodeData.coverage));

  return (
    <BaseNode
      data={{ ...nodeData, environment: env, watchMode: watch, coverage }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<FlaskConical className="w-4 h-4 text-white" />}
      minWidth={300}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Environment</div>
          <select value={env} onChange={(e)=>setEnv(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded">
            <option value="node">node</option>
            <option value="jsdom">jsdom</option>
            <option value="happy-dom">happy-dom</option>
          </select>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Watch</div>
          <input type="checkbox" checked={watch} onChange={(e)=>setWatch(e.target.checked)} />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Coverage</div>
          <input type="checkbox" checked={coverage} onChange={(e)=>setCoverage(e.target.checked)} />
        </div>
      </div>
    </BaseNode>
  );
});

TestVitestNode.displayName = "TestVitestNode";

export default TestVitestNode;


