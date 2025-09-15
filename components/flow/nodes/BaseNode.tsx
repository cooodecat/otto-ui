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
}

/**
 * 모든 노드의 기본 컴포넌트
 * 확장 가능한 구조로 설계됨
 */
const BaseNode = <T extends BaseNodeData = BaseNodeData>({
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
}: BaseNodeProps<T>) => {
  const { deleteElements } = useReactFlow();

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

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
      {children && (
        <div className="p-4">
          {children}
        </div>
      )}

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
      {showOutput && !outputHandles && (
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
    </div>
  );
};

BaseNode.displayName = "BaseNode";

export default memo(BaseNode) as typeof BaseNode;