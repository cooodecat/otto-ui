"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProjectStatusBadgeProps {
  status: string | null;
  errorMessage?: string | null;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case "CREATED":
      return {
        label: "생성 완료",
        colorClass: "bg-green-100 text-green-800 border-green-200",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    case "PENDING":
      return {
        label: "생성 중",
        colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <LoadingSpinner size="sm" />,
      };
    case "FAILED":
      return {
        label: "생성 실패",
        colorClass: "bg-red-100 text-red-800 border-red-200",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    default:
      return {
        label: "알 수 없음",
        colorClass: "bg-gray-100 text-gray-800 border-gray-200",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
  }
};

const getSizeClass = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "px-2 py-1 text-xs";
    case "lg":
      return "px-4 py-2 text-sm";
    default:
      return "px-2.5 py-0.5 text-xs";
  }
};

export default function ProjectStatusBadge({
  status,
  errorMessage,
  showIcon = true,
  size = "md",
}: ProjectStatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeClass = getSizeClass(size);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.colorClass} ${sizeClass}`}
      >
        {showIcon && config.icon}
        {config.label}
      </span>

      {/* 실패 시 에러 메시지 표시 */}
      {status === "FAILED" && errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
          <span className="font-medium">오류:</span> {errorMessage}
        </div>
      )}

      {/* PENDING 상태 시 추가 안내 */}
      {status === "PENDING" && (
        <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
          CodeBuild 프로젝트를 생성하고 있습니다...
        </div>
      )}
    </div>
  );
}
