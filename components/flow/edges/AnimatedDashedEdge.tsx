"use client";

import { FC, useState } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";

const AnimatedDashedEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const { deleteElements } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  const handleDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? "#3b82f6" : "#9ca3af",
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray: "8 4",
          animation: "dash 1s linear infinite",
        }}
      />
      <EdgeLabelRenderer>
        <style>
          {`
            @keyframes dash {
              from {
                stroke-dashoffset: 0;
              }
              to {
                stroke-dashoffset: -12;
              }
            }
          `}
        </style>
        {selected && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleDelete}
              className={`
                flex items-center justify-center w-6 h-6
                bg-white border-2 border-red-500 rounded-full
                hover:bg-red-500 hover:border-red-600
                transition-all duration-200 shadow-lg
                ${isHovered ? "scale-110" : ""}
              `}
              title="Delete edge"
            >
              <X
                className={`w-3 h-3 ${
                  isHovered ? "text-white" : "text-red-500"
                }`}
              />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default AnimatedDashedEdge;
