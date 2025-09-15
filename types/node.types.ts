/**
 * 기본 노드 데이터 인터페이스
 */
export interface BaseNodeData {
  label: string;
  icon?: string;
}

/**
 * Start 노드 데이터
 */
export interface StartNodeData extends BaseNodeData {
  triggerType?: "manual" | "schedule" | "webhook";
  description?: string;
}

/**
 * Agent 노드 데이터
 */
export interface AgentNodeData extends BaseNodeData {
  agentId?: string;
  agentName?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * API 노드 데이터
 */
export interface ApiNodeData extends BaseNodeData {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Condition 노드 데이터
 */
export interface ConditionNodeData extends BaseNodeData {
  conditions?: Array<{
    id: string;
    field: string;
    operator:
      | "==="
      | "!=="
      | ">"
      | "<"
      | ">="
      | "<="
      | "contains"
      | "startsWith"
      | "endsWith";
    value: any;
  }>;
  logicalOperator?: "AND" | "OR";
}

/**
 * Function 노드 데이터
 */
export interface FunctionNodeData extends BaseNodeData {
  functionName?: string;
  code?: string;
  language?: "javascript" | "python" | "typescript";
  inputs?: Array<{ name: string; type: string }>;
  outputs?: Array<{ name: string; type: string }>;
}

/**
 * Knowledge 노드 데이터
 */
export interface KnowledgeNodeData extends BaseNodeData {
  knowledgeBaseId?: string;
  query?: string;
  topK?: number;
  similarityThreshold?: number;
}

/**
 * Developer 노드 데이터 (예시 - 쉽게 추가 가능)
 */
export interface DeveloperNodeData extends BaseNodeData {
  developerId?: string;
  skills?: string[];
  experience?: number;
  assignedTasks?: string[];
}

/**
 * 모든 노드 데이터 타입 유니온
 */
export type NodeData =
  | StartNodeData
  | AgentNodeData
  | ApiNodeData
  | ConditionNodeData
  | FunctionNodeData
  | KnowledgeNodeData
  | DeveloperNodeData;
