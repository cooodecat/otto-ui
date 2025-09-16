"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import { NotificationSlackNodeData } from "@/types/cicd-node.types";
import { CICD_GROUP_COLORS } from "@/types/cicd-node.types";
import { MessageSquare, Settings, Hash } from "lucide-react";
import { CICDBlockGroup } from "@/types/block-enum";

const NotificationSlackNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as NotificationSlackNodeData;
  const [isExpanded, setIsExpanded] = useState(false);

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.NOTIFICATION];

  const getTriggerText = () => {
    if (nodeData.onSuccessOnly) return "Success only";
    if (nodeData.onFailureOnly) return "Failure only";
    return "Success & Failure";
  };

  const getTriggerColor = () => {
    if (nodeData.onSuccessOnly) return "text-green-600 bg-green-50";
    if (nodeData.onFailureOnly) return "text-red-600 bg-red-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <BaseNode
      data={nodeData}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<MessageSquare className="w-4 h-4 text-white" />}
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
              <span>💬</span>
              Slack Notify
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
              title="설정 보기"
            >
              <Settings size={14} className="text-gray-500" />
            </button>
          </div>

          {/* 채널 정보 */}
          {nodeData.channel && (
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-mono text-gray-800">
                {nodeData.channel}
              </span>
            </div>
          )}

          {/* 트리거 조건 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Trigger:</span>
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${getTriggerColor()}`}
            >
              {getTriggerText()}
            </span>
          </div>
        </div>

        {/* 확장 정보 */}
        {isExpanded && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 메시지 템플릿 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template
              </label>
              <div className="text-xs bg-white p-2 rounded border font-mono max-h-20 overflow-y-auto">
                {nodeData.messageTemplate ||
                  "Pipeline {status}: {project} - {branch}"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Variables:{" "}
                {"{status}, {project}, {branch}, {commit}, {duration}"}
              </div>
            </div>

            {/* Webhook 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Configuration
              </label>
              <div className="p-2 bg-white rounded border">
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-600">URL Env Var:</span>
                    <span className="ml-1 font-mono text-gray-800">
                      {nodeData.webhookUrlEnv}
                    </span>
                  </div>
                  {nodeData.channel && (
                    <div>
                      <span className="text-gray-600">Channel:</span>
                      <span className="ml-1 font-mono text-gray-800">
                        #{nodeData.channel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-600 mb-1">
                  Success Notifications
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      !nodeData.onFailureOnly ? "bg-green-400" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-xs">
                    {!nodeData.onFailureOnly ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="text-xs text-gray-600 mb-1">
                  Failure Notifications
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      !nodeData.onSuccessOnly ? "bg-red-400" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-xs">
                    {!nodeData.onSuccessOnly ? "Enabled" : "Disabled"}
                  </span>
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
                <span className="ml-1">{nodeData.retryCount || 3}</span>
              </div>
            </div>

            {/* 연결 정보 */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <div>On Success: {nodeData.onSuccess || "Continue"}</div>
                <div>On Failed: {nodeData.onFailed || "Continue anyway"}</div>
              </div>
            </div>
          </div>
        )}

        {/* 상태 표시 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Team Communication</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Ready
          </span>
        </div>
      </div>
    </BaseNode>
  );
});

NotificationSlackNode.displayName = "NotificationSlackNode";

export default NotificationSlackNode;
