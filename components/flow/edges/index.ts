import { EdgeTypes } from "@xyflow/react";
import AnimatedDashedEdge from "./AnimatedDashedEdge";
import CICDEdge from "./CICDEdge";

export const edgeTypes: EdgeTypes = {
  animatedDashed: AnimatedDashedEdge,
  cicdEdge: CICDEdge,
};

export const defaultEdgeOptions = {
  type: "animatedDashed",
  animated: false, // 우리가 직접 애니메이션 처리
  style: {
    stroke: "#9ca3af",
    strokeWidth: 2,
  },
};

// CI/CD 전용 간선 옵션
export const cicdEdgeOptions = {
  type: "cicdEdge",
  animated: false,
  selectable: true,
  deletable: true,
  style: {
    stroke: "#10b981", // 기본 성공 색상
    strokeWidth: 3,
  },
};
