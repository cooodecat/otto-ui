"use client";

import React from "react";
import { LayoutGrid, List, GitCommit } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "cards" | "table" | "timeline";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange("cards")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
          currentView === "cards"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-sm font-medium">카드</span>
      </button>
      <button
        onClick={() => onViewChange("table")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
          currentView === "table"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <List className="w-4 h-4" />
        <span className="text-sm font-medium">테이블</span>
      </button>
      <button
        onClick={() => onViewChange("timeline")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
          currentView === "timeline"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <GitCommit className="w-4 h-4" />
        <span className="text-sm font-medium">타임라인</span>
      </button>
    </div>
  );
};

export default ViewToggle;
