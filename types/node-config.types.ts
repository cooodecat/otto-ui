import { ComponentType } from "react";
import { NodeProps } from "@xyflow/react";
import { BaseNodeData } from "./node.types";

/**
 * 노드 설정 인터페이스
 */
export interface NodeConfig<T extends BaseNodeData = BaseNodeData> {
  /**
   * 노드 타입 (고유 식별자)
   */
  type: string;

  /**
   * 노드 표시 이름
   */
  label: string;

  /**
   * 노드 아이콘 (이모지 또는 컴포넌트 이름)
   */
  icon: string;

  /**
   * 노드 색상 (Tailwind 클래스)
   */
  colorClass?: string;

  /**
   * 노드 색상 (Hex)
   */
  colorHex?: string;

  /**
   * 노드 컴포넌트
   */
  component: ComponentType<NodeProps>;

  /**
   * 노드 카테고리
   */
  category:
    | "trigger"
    | "action"
    | "control"
    | "data"
    | "custom"
    | "cicd-start"
    | "cicd-prebuild"
    | "cicd-build"
    | "cicd-test"
    | "cicd-deploy"
    | "cicd-notification"
    | "cicd-utility";

  /**
   * 노드 설명
   */
  description?: string;

  /**
   * 최소 너비
   */
  minWidth?: number;

  /**
   * 삭제 가능 여부
   */
  deletable?: boolean;

  /**
   * 기본 데이터
   */
  defaultData?: Partial<T>;

  /**
   * 입력 핸들 설정
   */
  inputs?: {
    count: number;
    position?: "top" | "left" | "right" | "bottom";
  };

  /**
   * 출력 핸들 설정
   */
  outputs?: {
    count: number;
    position?: "top" | "left" | "right" | "bottom";
    ids?: string[];
  };
}

/**
 * 노드 레지스트리 인터페이스
 */
export interface NodeRegistry {
  [nodeType: string]: NodeConfig;
}
