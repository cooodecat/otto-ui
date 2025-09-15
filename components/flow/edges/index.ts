import { EdgeTypes } from "@xyflow/react";
import AnimatedDashedEdge from "./AnimatedDashedEdge";

export const edgeTypes: EdgeTypes = {
  animatedDashed: AnimatedDashedEdge,
};

export const defaultEdgeOptions = {
  type: "animatedDashed",
  animated: false, // 우리가 직접 애니메이션 처리
  style: {
    stroke: "#9ca3af",
    strokeWidth: 2,
  },
};
