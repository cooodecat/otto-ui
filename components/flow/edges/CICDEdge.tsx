"use client";

import React from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from "@xyflow/react";
import { Trash2, CheckCircle, XCircle } from "lucide-react";

interface CICDEdgeProps extends EdgeProps {
  sourceHandle?: string;
}

const CICDEdge: React.FC<CICDEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandle,
  data,
  markerEnd,
}) => {
  const { deleteElements } = useReactFlow();

  // 성공/실패에 따른 스타일 결정
  const actualSourceHandle = sourceHandle || data?.sourceHandle;
  const isSuccessPath = actualSourceHandle === "success-output";
  const isFailedPath = actualSourceHandle === "failed-output";

  const getEdgeStyle = () => {
    if (isSuccessPath) {
      return {
        stroke: "#10b981", // emerald-500
        strokeWidth: 3,
        strokeDasharray: "8,4",
      };
    } else if (isFailedPath) {
      return {
        stroke: "#ef4444", // red-500
        strokeWidth: 3,
        strokeDasharray: "8,4",
      };
    }
    // 기본 스타일
    return {
      stroke: "#6b7280", // gray-500
      strokeWidth: 2,
      strokeDasharray: "8,4",
    };
  };

  const getLabel = () => {
    if (isSuccessPath) {
      return {
        text: "✅ Success",
        bgColor: "#10b981",
        textColor: "white",
        icon: <CheckCircle className="w-3 h-3" />,
      };
    } else if (isFailedPath) {
      return {
        text: "❌ Failed",
        bgColor: "#ef4444",
        textColor: "white",
        icon: <XCircle className="w-3 h-3" />,
      };
    }
    return {
      text: "Continue",
      bgColor: "#6b7280",
      textColor: "white",
      icon: null,
    };
  };

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  const edgeStyle = getEdgeStyle();
  const label = getLabel();

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      {/* 간선 경로 */}
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
      />

      {/* 애니메이션 효과를 위한 추가 경로 */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={edgeStyle.strokeWidth}
        className="animate-pulse"
        style={{
          ...edgeStyle,
          strokeDasharray: "4,8",
          opacity: 0.6,
          animation: "dash 2s linear infinite",
        }}
      />

      {/* 라벨 렌더러 */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="flex items-center gap-1"
        >
          {/* 라벨 배지 */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm border border-white/20"
            style={{
              backgroundColor: label.bgColor,
              color: label.textColor,
            }}
          >
            {label.icon}
            <span>{label.text}</span>
          </div>

          {/* 삭제 버튼 */}
          <button
            onClick={handleDelete}
            className="p-1 bg-white hover:bg-red-50 rounded-full shadow-sm border border-gray-200 hover:border-red-300 transition-colors"
            title="Delete connection"
          >
            <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </EdgeLabelRenderer>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
    </>
  );
};

export default CICDEdge;
