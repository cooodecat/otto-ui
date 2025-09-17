"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import {
  OSPackageNodeData,
  CICD_GROUP_COLORS,
  CICDBlockGroup,
} from "@/types/cicd-node.types";
import { Edit3, Package } from "lucide-react";

const OSPackageNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as OSPackageNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [packages, setPackages] = useState<string[]>(
    nodeData.installPackages || []
  );
  const [packageManager, setPackageManager] = useState(
    nodeData.packageManager || "apt"
  );
  const [updateList, setUpdateList] = useState<boolean>(
    nodeData.updatePackageList ?? true
  );
  const [newPackage, setNewPackage] = useState("");

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD];

  const handleAddPackage = () => {
    if (newPackage.trim() && !packages.includes(newPackage.trim())) {
      setPackages([...packages, newPackage.trim()]);
      setNewPackage("");
    }
  };

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPackage();
    }
  };

  return (
    <BaseNode
      data={{
        ...nodeData,
        installPackages: packages,
        packageManager: packageManager,
        updatePackageList: updateList,
      }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Package className="w-4 h-4 text-white" />}
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
              {packageManager} ({packages.length} packages)
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 hover:bg-gray-100 rounded"
              title="편집"
            >
              <Edit3 size={14} className="text-gray-500" />
            </button>
          </div>

          {/* 패키지 목록 미리보기 */}
          {!isEditing && (
            <div className="space-y-1">
              {packages.slice(0, 3).map((pkg, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded"
                >
                  {pkg}
                </div>
              ))}
              {packages.length > 3 && (
                <div className="text-xs text-gray-500 italic">
                  +{packages.length - 3} more packages...
                </div>
              )}
            </div>
          )}
        </div>

        {/* 편집 모드 */}
        {isEditing && (
          <div className="space-y-3 p-3 bg-gray-50 rounded border">
            {/* 패키지 매니저 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Manager
              </label>
              <select
                value={packageManager}
                onChange={(e) => setPackageManager(e.target.value as any)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="apt">apt (Ubuntu/Debian)</option>
                <option value="yum">yum (CentOS/RHEL)</option>
                <option value="dnf">dnf (Fedora)</option>
                <option value="apk">apk (Alpine)</option>
                <option value="brew">brew (macOS)</option>
                <option value="pacman">pacman (Arch)</option>
              </select>
            </div>

            {/* 업데이트 리스트 토글 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update package list
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updateList}
                  onChange={(e) => setUpdateList(e.target.checked)}
                />
                <span className="text-sm text-gray-600">
                  {updateList ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* 패키지 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Package
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPackage}
                  onChange={(e) => setNewPackage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter package name"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddPackage}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 패키지 목록 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Packages ({packages.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded border"
                  >
                    <span className="text-sm font-mono text-gray-700">
                      {pkg}
                    </span>
                    <button
                      onClick={() => handleRemovePackage(idx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="text-sm text-gray-500 italic text-center py-2">
                    No packages added
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 설정 옵션 */}
        <div className="text-xs text-gray-500">
          <div>Update package list: {updateList ? "Yes" : "No"}</div>
          {nodeData.timeout && <div>Timeout: {nodeData.timeout}s</div>}
        </div>
      </div>
    </BaseNode>
  );
});

OSPackageNode.displayName = "OSPackageNode";

export default OSPackageNode;
