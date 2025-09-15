import { ComponentType } from "react";
import { NodeTypes, NodeProps } from "@xyflow/react";
import { NodeRegistry } from "@/types/node-config.types";
import {
  StartNodeData,
  AgentNodeData,
  ApiNodeData,
  ConditionNodeData,
  FunctionNodeData,
  KnowledgeNodeData,
  DeveloperNodeData,
} from "@/types/node.types";

// 노드 컴포넌트들 import
import StartNode from "./StartNode";
import AgentNode from "./AgentNode";
import ApiNode from "./ApiNode";
import ConditionNode from "./ConditionNode";
import FunctionNode from "./FunctionNode";
import KnowledgeNode from "./KnowledgeNode";
import DeveloperNode from "./DeveloperNode";

/**
 * 노드 설정 레지스트리
 * 새로운 노드를 추가하려면 이곳에 설정을 추가하면 됨
 */
export const nodeRegistry: NodeRegistry = {
  start: {
    type: "start",
    label: "Start",
    icon: "▶️",
    colorClass: "bg-blue-500",
    colorHex: "#3b82f6",
    component: StartNode as ComponentType<NodeProps>,
    category: "trigger",
    description: "Workflow starting point",
    minWidth: 280,
    deletable: false,
    defaultData: {
      label: "Start",
      triggerType: "manual",
    } as Partial<StartNodeData>,
    inputs: { count: 0 },
    outputs: { count: 1, position: "bottom" },
  },
  agent: {
    type: "agent",
    label: "Agent",
    icon: "🤖",
    colorClass: "bg-purple-500",
    colorHex: "#a855f7",
    component: AgentNode as ComponentType<NodeProps>,
    category: "action",
    description: "AI Agent for processing",
    defaultData: {
      label: "Agent",
      model: "gpt-4",
    } as Partial<AgentNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  api: {
    type: "api",
    label: "API",
    icon: "🔗",
    colorClass: "bg-blue-500",
    colorHex: "#3b82f6",
    component: ApiNode as ComponentType<NodeProps>,
    category: "action",
    description: "External API call",
    defaultData: {
      label: "API",
      method: "GET",
    } as Partial<ApiNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  condition: {
    type: "condition",
    label: "Condition",
    icon: "🔶",
    colorClass: "bg-orange-500",
    colorHex: "#f97316",
    component: ConditionNode as ComponentType<NodeProps>,
    category: "control",
    description: "Conditional branching",
    minWidth: 320,
    defaultData: {
      label: "Condition",
      logicalOperator: "AND",
    } as Partial<ConditionNodeData>,
    inputs: { count: 1, position: "left" },
    outputs: {
      count: 2,
      position: "right",
      ids: ["if-output", "else-output"],
    },
  },
  function: {
    type: "function",
    label: "Function",
    icon: "</>",
    colorClass: "bg-red-500",
    colorHex: "#ef4444",
    component: FunctionNode as ComponentType<NodeProps>,
    category: "action",
    description: "Custom function",
    defaultData: {
      label: "Function",
      language: "javascript",
    } as Partial<FunctionNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  knowledge: {
    type: "knowledge",
    label: "Knowledge",
    icon: "🧠",
    colorClass: "bg-teal-500",
    colorHex: "#14b8a6",
    component: KnowledgeNode as ComponentType<NodeProps>,
    category: "data",
    description: "Knowledge base query",
    defaultData: {
      label: "Knowledge",
      topK: 5,
    } as Partial<KnowledgeNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
  developer: {
    type: "developer",
    label: "Developer",
    icon: "👨‍💻",
    colorClass: "bg-green-500",
    colorHex: "#10b981",
    component: DeveloperNode as ComponentType<NodeProps>,
    category: "custom",
    description: "Developer assignment",
    defaultData: {
      label: "Developer",
      skills: ["TypeScript", "React"],
      experience: 3,
    } as Partial<DeveloperNodeData>,
    inputs: { count: 1, position: "top" },
    outputs: { count: 1, position: "bottom" },
  },
};

/**
 * React Flow에서 사용할 nodeTypes 객체 생성
 */
export const nodeTypes: NodeTypes = Object.entries(nodeRegistry).reduce(
  (acc, [key, config]) => ({
    ...acc,
    [key]: config.component,
  }),
  {} as NodeTypes
);

/**
 * 드래그 앤 드롭 UI에서 사용할 노드 목록
 */
export const nodeCategories = {
  trigger: Object.values(nodeRegistry).filter((n) => n.category === "trigger"),
  action: Object.values(nodeRegistry).filter((n) => n.category === "action"),
  control: Object.values(nodeRegistry).filter((n) => n.category === "control"),
  data: Object.values(nodeRegistry).filter((n) => n.category === "data"),
  custom: Object.values(nodeRegistry).filter((n) => n.category === "custom"),
};

/**
 * 새로운 노드 인스턴스 생성 헬퍼
 */
export const createNodeInstance = (
  type: string,
  position: { x: number; y: number },
  id?: string
) => {
  const config = nodeRegistry[type];
  if (!config) {
    throw new Error(`Unknown node type: ${type}`);
  }

  return {
    id: id || `${type}_${Date.now()}`,
    type,
    position,
    data: {
      ...config.defaultData,
      label: config.label,
    },
    selectable: true,
    deletable: config.deletable !== false,
  };
};
