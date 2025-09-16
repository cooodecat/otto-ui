"use client";

import React from "react";
import { RefreshCw, Search } from "lucide-react";
import { PipelineLogsHeaderProps } from "@/types/logs";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

/**
 * Pipeline Logs Header Component
 *
 * 파이프라인 로그 페이지의 헤더 영역
 * Live 토글, 검색, 새로고침 기능 포함
 */
const PipelineLogsHeader: React.FC<PipelineLogsHeaderProps> = ({
  isLive,
  onLiveToggle,
  searchQuery,
  onSearchChange,
  unreadCount = 0,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Logs</h1>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {unreadCount} new build{unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ToggleSwitch label="Live" isOn={isLive} onToggle={onLiveToggle} />
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`group p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isRefreshing
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            title={isRefreshing ? "Refreshing..." : "Refresh logs"}
          >
            <RefreshCw
              className={`w-5 h-5 transition-transform duration-500 ${
                isRefreshing ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search builds, commits, branches..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
        />
      </div>
    </div>
  );
};

export default PipelineLogsHeader;
