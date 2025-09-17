"use client";

import { memo, useRef, useState } from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "../BaseNode";
import {
  EnvironmentSetupNodeData,
  CICD_GROUP_COLORS,
  CICDBlockGroup,
} from "@/types/cicd-node.types";
import { Globe, Eye, EyeOff } from "lucide-react";

const EnvironmentSetupNode = memo(({ data, id }: NodeProps) => {
  const nodeData = data as unknown as EnvironmentSetupNodeData;
  const [envs, setEnvs] = useState<Record<string, string>>(
    nodeData.environmentVariables || {}
  );
  const [keyInput, setKeyInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [showValInput, setShowValInput] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPair = () => {
    const key = keyInput.trim();
    if (!key) return;
    setEnvs({ ...envs, [key]: valInput });
    setKeyInput("");
    setValInput("");
  };

  const removeKey = (k: string) => {
    const next = { ...envs };
    delete next[k];
    setEnvs(next);
    // 삭제할 때 visibility도 제거
    const newVisible = new Set(visibleKeys);
    newVisible.delete(k);
    setVisibleKeys(newVisible);
  };

  const toggleVisibility = (key: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleKeys(newVisible);
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 8));

  const groupColors = CICD_GROUP_COLORS[CICDBlockGroup.PREBUILD];

  const parseDotEnv = (content: string) => {
    const result: Record<string, string> = {};
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex <= 0) return;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key) result[key] = value;
    });
    return result;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const loaded = parseDotEnv(text);
    setEnvs({ ...envs, ...loaded });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <BaseNode
      data={{ ...nodeData, environmentVariables: envs }}
      id={id}
      colorClass={groupColors.colorClass}
      icon={<Globe className="w-4 h-4 text-white" />}
      minWidth={360}
      useCICDOutputs={true}
      cicdOutputConfig={{ canOnSuccess: true, canOnFailed: false }}
      deletable={true}
    >
      <div className={`space-y-3`}>
        <div
          className={`p-3 rounded ${groupColors.bgClass} ${groupColors.borderClass} border`}
        >
          <div className="grid grid-cols-6 gap-2">
            <input
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="KEY"
              className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="col-span-2 relative">
              <input
                type={showValInput ? "text" : "password"}
                value={valInput}
                onChange={(e) => setValInput(e.target.value)}
                placeholder="value"
                className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowValInput(!showValInput)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showValInput ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
            </div>
            <button
              onClick={addPair}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-600">Load from .env file</div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".env,text/plain"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100"
              >
                Upload .env
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {Object.keys(envs).length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No environment variables
            </div>
          )}
          {Object.entries(envs).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border rounded px-2 py-1"
            >
              <div className="font-mono text-sm text-gray-800 truncate mr-2 flex-1">
                {k}=
                <span className="text-gray-600">
                  {visibleKeys.has(k) ? v : maskValue(v)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleVisibility(k)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title={visibleKeys.has(k) ? "Hide value" : "Show value"}
                >
                  {visibleKeys.has(k) ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => removeKey(k)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
});

EnvironmentSetupNode.displayName = "EnvironmentSetupNode";

export default EnvironmentSetupNode;
