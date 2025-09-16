"use client";

import { memo, useState } from "react";
import { NodeProps, Position } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { ConditionBranchNodeData, CICD_GROUP_COLORS, CICDBlockGroup } from "@/types/cicd-node.types";
import { GitBranch, Settings, CheckCircle, XCircle } from "lucide-react";

const ConditionBranchNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as ConditionBranchNodeData;
  const [isExpanded, setIsExpanded] = useState(false);

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.UTILITY];

  const getConditionTypeIcon = (type: string) => {
    switch (type) {
      case 'environment': return '🌍';
      case 'file_exists': return '📁';
      case 'command_output': return '💻';
      case 'custom': return '🔧';
      default: return '❓';
    }
  };

  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case 'environment': return 'Environment Variable';
      case 'file_exists': return 'File Exists';
      case 'command_output': return 'Command Output';
      case 'custom': return 'Custom Script';
      default: return 'Unknown';
    }
  };

  // 다중 출력 핸들 정의 (TRUE/FALSE)
  const outputHandles = [
    {
      id: "success-output",
      position: Position.Right,
      style: { top: "30%", right: "-8px" }
    },
    {
      id: "failed-output", 
      position: Position.Right,
      style: { top: "70%", right: "-8px" }
    }
  ];

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<GitBranch className="w-4 h-4 text-white" />}
      minWidth={320}
      deletable={true}
      showOutput={false} // 기본 출력 핸들 비활성화
      outputHandles={outputHandles} // 커스텀 다중 출력 사용
      useCICDOutputs={true}
    >
      <div className="space-y-3">
        {/* 기본 정보 */}
        <div className={`p-3 rounded ${groupColors.bgClass} ${groupColors.borderClass} border`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${groupColors.textClass} flex items-center gap-2`}>
              <span>{getConditionTypeIcon(nodeData.conditionType)}</span>
              Condition Branch
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
              title="설정 보기"
            >
              <Settings size={14} className="text-gray-500" />
            </button>
          </div>
          
          {/* 조건 타입 */}
          <div className="text-xs text-gray-600 mb-2">
            Type: {getConditionTypeLabel(nodeData.conditionType)}
          </div>

          {/* 조건 요약 */}
          <div className="space-y-1">
            {nodeData.conditionConfig.environmentVar && (
              <div className="text-xs">
                <span className="text-gray-600">Env:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {nodeData.conditionConfig.environmentVar}
                </span>
                {nodeData.conditionConfig.expectedValue && (
                  <>
                    <span className="mx-1 text-gray-500">=</span>
                    <span className="font-mono text-gray-800">
                      {nodeData.conditionConfig.expectedValue}
                    </span>
                  </>
                )}
              </div>
            )}
            
            {nodeData.conditionConfig.filePath && (
              <div className="text-xs">
                <span className="text-gray-600">File:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {nodeData.conditionConfig.filePath}
                </span>
              </div>
            )}
            
            {nodeData.conditionConfig.command && (
              <div className="text-xs">
                <span className="text-gray-600">Command:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {nodeData.conditionConfig.command}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 출력 라벨 (TRUE/FALSE) */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1 text-xs">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-green-600 font-medium">TRUE</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-600 font-medium">FALSE</span>
          </div>
        </div>

        {/* 확장 정보 */}
        {isExpanded && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 조건 설정 상세 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Configuration
              </label>
              <div className="p-2 bg-white rounded border space-y-1">
                <div className="text-xs">
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-1 font-medium">{getConditionTypeLabel(nodeData.conditionType)}</span>
                </div>
                
                {Object.entries(nodeData.conditionConfig).map(([key, value]) => (
                  value && (
                    <div key={key} className="text-xs">
                      <span className="text-gray-600">{key}:</span>
                      <span className="ml-1 font-mono text-gray-800">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* 분기 정보 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  On TRUE
                </div>
                <div className="text-xs font-mono text-gray-800">
                  {nodeData.onConditionTrue || 'Next step'}
                </div>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  On FALSE
                </div>
                <div className="text-xs font-mono text-gray-800">
                  {nodeData.onConditionFalse || 'Skip or end'}
                </div>
              </div>
            </div>

            {/* 실행 정보 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Timeout:</span>
                <span className="ml-1">{nodeData.timeout || 30}s</span>
              </div>
              <div>
                <span className="text-gray-600">Retry:</span>
                <span className="ml-1">{nodeData.retryCount || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* 상태 표시 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Conditional Logic</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Ready
          </span>
        </div>
      </div>
    </BaseNode>
  );
});

ConditionBranchNode.displayName = "ConditionBranchNode";

export default ConditionBranchNode;