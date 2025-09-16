"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { TestMochaNodeData, CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { Coffee } from "lucide-react";

const TestMochaNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as TestMochaNodeData;
  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.TEST];

  const [reporter, setReporter] = useState<TestMochaNodeData["reporter"]>(nodeData.reporter || 'spec');
  const [timeout, setTimeoutMs] = useState<number>(nodeData.timeout || 300);
  const [grep, setGrep] = useState<string>(nodeData.grep || '');

  return (
    <BaseNode
      data={{ ...nodeData, reporter, timeout, grep }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Coffee className="w-4 h-4 text-white" />}
      minWidth={300}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Reporter</div>
          <select value={reporter} onChange={(e)=>setReporter(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded">
            <option value="spec">spec</option>
            <option value="json">json</option>
            <option value="html">html</option>
            <option value="tap">tap</option>
            <option value="dot">dot</option>
          </select>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Timeout</div>
          <input type="number" value={timeout} onChange={(e)=>setTimeoutMs(parseInt(e.target.value||'0'))} className="px-2 py-1 border border-gray-300 rounded" />
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <div className="text-gray-600">Grep</div>
          <input value={grep} onChange={(e)=>setGrep(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="pattern" />
        </div>
      </div>
    </BaseNode>
  );
});

TestMochaNode.displayName = "TestMochaNode";

export default TestMochaNode;


