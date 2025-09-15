// 새로운 확장 가능한 노드 시스템
export {
  nodeTypes,
  nodeRegistry,
  nodeCategories,
  createNodeInstance,
} from "./node-registry";

// 타입 내보내기
export type { NodeConfig } from "@/types/node-config.types";
export type {
  BaseNodeData,
  StartNodeData,
  AgentNodeData,
  ApiNodeData,
  ConditionNodeData,
  FunctionNodeData,
  KnowledgeNodeData,
  DeveloperNodeData,
  NodeData,
} from "@/types/node.types";

// 기존 호환성을 위한 nodeConfigs (deprecated)
// TODO: BasicFlowCanvas에서 nodeRegistry로 마이그레이션 후 제거
export const nodeConfigs = {
  start: {
    type: "start",
    icon: "▶",
    color: "blue",
    label: "Start",
  },
  agent: {
    type: "agent",
    icon: "🤖",
    color: "purple",
    label: "Agent",
  },
  api: {
    type: "api",
    icon: "🔗",
    color: "blue",
    label: "API",
  },
  condition: {
    type: "condition",
    icon: "🔶",
    color: "orange",
    label: "Condition",
  },
  function: {
    type: "function",
    icon: "</>",
    color: "red",
    label: "Function",
  },
  knowledge: {
    type: "knowledge",
    icon: "🧠",
    color: "teal",
    label: "Knowledge",
  },
  developer: {
    type: "developer",
    icon: "👨‍💻",
    color: "green",
    label: "Developer",
  },
};

export type NodeType = keyof typeof nodeConfigs;
