"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { TestJestNodeData } from "@/types/cicd-node.types";
import { CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { TestTube } from "lucide-react";
import {CICDBlockGroup} from "@/types/block-enum";

const TestJestNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as TestJestNodeData;
  const [coverage, setCoverage] = useState<boolean>(Boolean(nodeData.coverage));
  const [watch, setWatch] = useState<boolean>(Boolean(nodeData.watch_mode));
  const [workers, setWorkers] = useState<number | ''>(nodeData.max_workers || '');

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.TEST];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<TestTube className="w-4 h-4 text-white" />}
      minWidth={280}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Config File</div>
          <input className="px-2 py-1 border border-gray-300 rounded" defaultValue={nodeData.config_file || ''} />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Test Pattern</div>
          <input className="px-2 py-1 border border-gray-300 rounded" defaultValue={nodeData.test_pattern || ''} />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Coverage</div>
          <input type="checkbox" checked={coverage} onChange={(e)=>setCoverage(e.target.checked)} />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Watch</div>
          <input type="checkbox" checked={watch} onChange={(e)=>setWatch(e.target.checked)} />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Workers</div>
          <input type="number" className="px-2 py-1 border border-gray-300 rounded" value={workers as any} onChange={(e)=>setWorkers(e.target.value ? parseInt(e.target.value) : '')} />
        </div>
      </div>
    </BaseNode>
  );
});

TestJestNode.displayName = "TestJestNode";

export default TestJestNode;