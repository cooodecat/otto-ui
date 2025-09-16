"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { BuildWebpackNodeData } from "@/types/cicd-node.types";
import { CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { Settings, Zap } from "lucide-react";

const BuildWebpackNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as BuildWebpackNodeData;
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState(nodeData.mode || 'production');
  const [config, setConfig] = useState(nodeData.configFile || 'webpack.config.js');
  const [out, setOut] = useState(nodeData.outputPath || '');

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.BUILD];

  const getModeColor = (mode: string) => {
    return mode === 'production' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
  };

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
      <div className="space-y-3">
        {/* 기본 정보 */}
        <div className={`p-3 rounded ${groupColors.bgClass} ${groupColors.borderClass} border`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${groupColors.textClass}`}>
              Webpack Build
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
              title="설정 보기"
            >
              <Settings size={14} className="text-gray-500" />
            </button>
          </div>
          
          {/* 모드 표시 */}
          <div className="grid grid-cols-2 items-center gap-2 text-sm mb-2">
            <div className="text-gray-600">Mode</div>
            <select value={mode} onChange={(e)=>setMode(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded">
              <option value="development">development</option>
              <option value="production">production</option>
            </select>
          </div>

          {/* 기본 설정 */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 items-center gap-2 text-sm">
              <div className="text-gray-600">Config</div>
              <input value={config} onChange={(e)=>setConfig(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="webpack.config.js" />
            </div>
            <div className="grid grid-cols-2 items-center gap-2 text-sm">
              <div className="text-gray-600">Output</div>
              <input value={out} onChange={(e)=>setOut(e.target.value)} className="px-2 py-1 border border-gray-300 rounded" placeholder="dist" />
            </div>
          </div>
        </div>

        {/* 확장 정보 */}
        {isExpanded && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 추가 옵션 */}
            {nodeData.additionalOptions && nodeData.additionalOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Options
                </label>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {nodeData.additionalOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono bg-white px-2 py-1 rounded border"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실행 정보 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Timeout:</span>
                <span className="ml-1">{nodeData.timeout || 300}s</span>
              </div>
              <div>
                <span className="text-gray-600">Retry:</span>
                <span className="ml-1">{nodeData.retryCount || 0}</span>
              </div>
            </div>

            {/* 연결 정보 */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <div>On Success: {nodeData.onSuccess || 'Next step'}</div>
                <div>On Failed: {nodeData.onFailed || 'Stop pipeline'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 빠른 정보 제거 요청: 상태 표시 숨김 */}
      </div>
    </BaseNode>
  );
});

BuildWebpackNode.displayName = "BuildWebpackNode";

export default BuildWebpackNode;