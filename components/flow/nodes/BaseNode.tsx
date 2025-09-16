/**
 * Base Node Component
 *
 * 모든 플로우 노드의 기본 컴포넌트로, 다음과 같은 기능을 제공합니다:
 *
 * 주요 기능:
 * - 표준화된 노드 UI 레이아웃 (헤더, 콘텐츠, 핸들)
 * - 삭제 기능
 * - 입력/출력 핸들 관리
 * - CI/CD 전용 success/failed 출력 핸들 지원
 *
 * 핸들 시스템:
 * - 입력 핸들: 상단 중앙에 위치
 * - 기본 출력 핸들: 하단 중앙에 위치
 * - 다중 출력 핸들: Condition 노드 등을 위한 커스텀 위치
 * - CICD 출력 핸들: success(초록)/failed(빨간) 2개 핸들
 *
 * 사용 방법:
 * ```tsx
 * <BaseNode
 *   data={nodeData}
 *   id={id}
 *   colorClass="bg-blue-500"
 *   useCICDOutputs={true}
 * >
 *   <NodeContent />
 * </BaseNode>
 * ```
 */
"use client";

import { memo, ReactNode } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { BaseNodeData } from "@/types/node.types";

export interface BaseNodeProps<T extends BaseNodeData = BaseNodeData> {
  /**
   * 노드 데이터
   */
  data: T;

  /**
   * 노드 ID
   */
  id: string;

  /**
   * 헤더 색상 클래스
   */
  colorClass: string;

  /**
   * 아이콘 컴포넌트
   */
  icon?: ReactNode;

  /**
   * 커스텀 컨텐츠
   */
  children?: ReactNode;

  /**
   * 삭제 가능 여부
   */
  deletable?: boolean;

  /**
   * 최소 너비
   */
  minWidth?: number;

  /**
   * 입력 핸들 표시 여부
   */
  showInput?: boolean;

  /**
   * 출력 핸들 표시 여부
   */
  showOutput?: boolean;

  /**
   * 출력 핸들 ID 배열 (Condition 노드처럼 여러 출력이 필요한 경우)
   */
  outputHandles?: Array<{
    id: string;
    position: Position;
    style?: React.CSSProperties;
  }>;

  /**
   * CI/CD 노드의 success/failed 출력 사용 여부
   */
  useCICDOutputs?: boolean;

  /**
   * CI/CD outputs 세부 제어 옵션
   */
  cicdOutputConfig?: {
    canOnSuccess?: boolean; // success-output handle 생성 여부 (기본값: true)
    canOnFailed?: boolean; // failed-output handle 생성 여부 (기본값: true)
  };
}

/**
 * 모든 노드의 기본 컴포넌트
 * 확장 가능한 구조로 설계됨
 */
function BaseNode<T extends BaseNodeData = BaseNodeData>({
  data,
  id,
  colorClass,
  icon,
  children,
  deletable = true,
  minWidth = 240,
  showInput = true,
  showOutput = true,
  outputHandles,
  useCICDOutputs = false,
  cicdOutputConfig = { canOnSuccess: true, canOnFailed: true },
}: BaseNodeProps<T>) {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  // CI/CD 노드의 성공/실패 출력 핸들 (config에 따라 제어)
  const cicdOutputHandles = useCICDOutputs
    ? (() => {
        const handles = [];
        const { canOnSuccess = true, canOnFailed = true } = cicdOutputConfig;

        if (canOnSuccess) {
          handles.push({
            id: "success-output",
            position: Position.Bottom,
            style: {
              left: canOnFailed ? "30%" : "50%", // failed가 없으면 중앙에 위치
              backgroundColor: "#10b981", // 초록색
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              bottom: "-6px",
            },
          });
        }

        if (canOnFailed) {
          handles.push({
            id: "failed-output",
            position: Position.Bottom,
            style: {
              left: canOnSuccess ? "70%" : "50%", // success가 없으면 중앙에 위치
              backgroundColor: "#ef4444", // 빨간색
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              bottom: "-6px",
            },
          });
        }

        return handles;
      })()
    : [];

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 border-gray-200 cursor-grab active:cursor-grabbing`}
      style={{ minWidth: `${minWidth}px` }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={`w-8 h-8 ${colorClass} rounded flex items-center justify-center`}
            >
              {icon}
            </div>
          )}
          <span className="font-medium text-gray-900">{data.label}</span>
        </div>
        {deletable && (
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-50 rounded transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Content */}
      {children && <div className="p-4">{children}</div>}

      {/* Input Handle */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-12 !h-2 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ top: "-4px" }}
        />
      )}

      {/* Output Handles */}
      {showOutput && !outputHandles && !useCICDOutputs && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-12 !h-2 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={{ bottom: "-4px" }}
        />
      )}

      {/* Multiple Output Handles (for Condition nodes) */}
      {outputHandles?.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          className="!w-2 !h-12 !bg-gray-300 !rounded-sm !border-none hover:!bg-gray-400 !cursor-crosshair transition-colors duration-150"
          style={handle.style}
        />
      ))}

      {/* CI/CD Success/Failed Output Handles */}
      {cicdOutputHandles?.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type="source"
          position={handle.position}
          className="!border-2 !border-white hover:!scale-110 !cursor-crosshair transition-all duration-150"
          style={handle.style}
        />
      ))}
    </div>
  );
}

BaseNode.displayName = "BaseNode";

export default memo(BaseNode) as typeof BaseNode;
