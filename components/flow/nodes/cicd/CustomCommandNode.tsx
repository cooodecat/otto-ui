"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import {
  CustomCommandNodeData,
  CICD_GROUP_COLORS,
  CICDBlockGroup,
} from "@/types/cicd-node.types";
import { Edit3, Terminal } from "lucide-react";

const CustomCommandNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as CustomCommandNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [commands, setCommands] = useState<string[]>(
    nodeData.commands || []
  );
  const [shell, setShell] = useState(
    nodeData.shell || "bash"
  );
  const [workingDirectory, setWorkingDirectory] = useState(
    nodeData.workingDirectory || ""
  );
  const [ignoreErrors, setIgnoreErrors] = useState<boolean>(
    nodeData.ignoreErrors ?? false
  );
  const [newCommand, setNewCommand] = useState("");

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.UTILITY];

  const handleAddCommand = () => {
    if (newCommand.trim() && !commands.includes(newCommand.trim())) {
      setCommands([...commands, newCommand.trim()]);
      setNewCommand("");
    }
  };

  const handleRemoveCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCommand();
    }
  };

  return (
    <BaseNode
      data={{
        ...nodeData,
        commands: commands,
        shell: shell,
        workingDirectory: workingDirectory,
        ignoreErrors: ignoreErrors,
      }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Terminal className="w-4 h-4 text-white" />}
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
            <div className={`text-sm font-medium ${groupColors.textClass}`}>
              {shell} ({commands.length} commands)
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 hover:bg-gray-100 rounded"
              title="편집"
            >
              <Edit3 size={14} className="text-gray-500" />
            </button>
          </div>

          {/* 명령어 목록 미리보기 */}
          {!isEditing && (
            <div className="space-y-1">
              {commands.slice(0, 3).map((cmd, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded"
                >
                  {cmd.length > 40 ? `${cmd.slice(0, 40)}...` : cmd}
                </div>
              ))}
              {commands.length > 3 && (
                <div className="text-xs text-gray-500 italic">
                  +{commands.length - 3} more commands...
                </div>
              )}
              {commands.length === 0 && (
                <div className="text-xs text-gray-500 italic">
                  No commands configured
                </div>
              )}
            </div>
          )}
        </div>

        {/* 편집 모드 */}
        {isEditing && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 셸 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shell
              </label>
              <select
                value={shell}
                onChange={(e) => setShell(e.target.value as any)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bash">bash</option>
                <option value="sh">sh</option>
                <option value="zsh">zsh</option>
                <option value="fish">fish</option>
              </select>
            </div>

            {/* 작업 디렉토리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Directory (optional)
              </label>
              <input
                type="text"
                value={workingDirectory}
                onChange={(e) => setWorkingDirectory(e.target.value)}
                placeholder="e.g., ./src"
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 오류 무시 토글 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Handling
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ignoreErrors}
                  onChange={(e) => setIgnoreErrors(e.target.checked)}
                />
                <span className="text-sm text-gray-600">
                  {ignoreErrors ? "Continue on error" : "Stop on error"}
                </span>
              </div>
            </div>

            {/* 명령어 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Command
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter shell command"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCommand}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 명령어 목록 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commands ({commands.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {commands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded border"
                  >
                    <span className="text-sm font-mono text-gray-700 flex-1 mr-2">
                      {cmd}
                    </span>
                    <button
                      onClick={() => handleRemoveCommand(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {commands.length === 0 && (
                  <div className="text-sm text-gray-500 italic text-center py-2">
                    No commands added
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 설정 옵션 */}
        <div className="text-xs text-gray-500">
          {workingDirectory && <div>Working dir: {workingDirectory}</div>}
          <div>Error handling: {ignoreErrors ? "Continue" : "Stop on error"}</div>
          {nodeData.timeout && <div>Timeout: {nodeData.timeout}s</div>}
        </div>
      </div>
    </BaseNode>
  );
});

CustomCommandNode.displayName = "CustomCommandNode";

export default CustomCommandNode;