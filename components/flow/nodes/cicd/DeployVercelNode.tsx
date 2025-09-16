"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
//import { DeployVercelNodeData } from "@/types/cicd-node.types";
import { CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { Triangle, Settings, Globe } from "lucide-react";
import { CICDBlockGroup } from "@/types/block-enum";

const DeployVercelNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as any; //as unknown as DeployVercelNodeData;
  const [isExpanded, setIsExpanded] = useState(false);

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.DEPLOY];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Triangle className="w-4 h-4 text-white fill-white" />}
      minWidth={280}
      deletable={true}
      useCICDOutputs={true}
    >
      <div className="space-y-3">
        {/* 기본 정보 */}
        <div
          className={`p-3 rounded ${groupColors.bgClass} ${groupColors.borderClass} border`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`text-sm font-medium ${groupColors.textClass} flex items-center gap-2`}
            >
              <span>▲</span>
              Vercel Deploy
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
              title="설정 보기"
            >
              <Settings size={14} className="text-gray-500" />
            </button>
          </div>

          {/* 프로젝트 정보 */}
          <div className="space-y-1">
            {nodeData.projectName && (
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-mono text-gray-800">
                  {nodeData.projectName}
                </span>
              </div>
            )}

            {nodeData.buildCommand && (
              <div className="text-xs">
                <span className="text-gray-600">Build:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {nodeData.buildCommand}
                </span>
              </div>
            )}

            {nodeData.outputDirectory && (
              <div className="text-xs">
                <span className="text-gray-600">Output:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {nodeData.outputDirectory}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 확장 정보 */}
        {isExpanded && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 환경 변수 */}
            {nodeData.environmentVariables &&
              Object.keys(nodeData.environmentVariables).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment Variables
                  </label>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {Object.entries(nodeData.environmentVariables).map(
                      ([key, value], idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white px-2 py-1 rounded border"
                        >
                          <span className="text-xs font-mono text-gray-700">
                            {key}
                          </span>
                          <span className="text-xs text-gray-500 truncate ml-2 max-w-20">
                            {typeof value === "string" && value.length > 10
                              ? `${value.substring(0, 10)}...`
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* 배포 설정 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-600 mb-1">
                  Deployment Settings
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Platform:</span>
                    <span className="font-medium">Vercel</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Auto Deploy:</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Preview URLs:</span>
                    <span className="text-blue-600">Generated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 실행 정보 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Timeout:</span>
                <span className="ml-1">{nodeData.timeout || 600}s</span>
              </div>
              <div>
                <span className="text-gray-600">Retry:</span>
                <span className="ml-1">{nodeData.retryCount || 1}</span>
              </div>
            </div>

            {/* 연결 정보 */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <div>
                  On Success: {nodeData.onSuccess || "Pipeline complete"}
                </div>
                <div>On Failed: {nodeData.onFailed || "Rollback & notify"}</div>
              </div>
            </div>
          </div>
        )}

        {/* 상태 표시 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Serverless Deployment</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            Ready
          </span>
        </div>
      </div>
    </BaseNode>
  );
});

DeployVercelNode.displayName = "DeployVercelNode";

export default DeployVercelNode;
