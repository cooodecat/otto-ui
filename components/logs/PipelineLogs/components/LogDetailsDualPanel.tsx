"use client";

import React, { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ExternalLink,
  Copy,
  Download,
  Play,
  Square,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Clock,
  GitBranch,
  User,
  Hash,
  Filter,
  Search,
} from "lucide-react";
import { LogDetailsPanelProps, ViewMode } from "@/types/logs";
import { useBuildLogs } from "@/hooks/logs/useBuildLogs";
import { useKeyboardShortcuts } from "@/hooks/logs/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import CloudWatchMetrics from "./CloudWatchMetrics";

interface LogDetailsDualPanelProps extends LogDetailsPanelProps {
  buildMetadata?: {
    pipeline: string;
    branch: string;
    commit: string;
    author: string;
    duration?: string;
    status: string;
  };
}

const LogDetailsDualPanel: React.FC<LogDetailsDualPanelProps> = ({
  buildId,
  isOpen,
  onClose,
  onNavigate,
  buildMetadata,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("expanded");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 실시간 빌드 로그
  const {
    logs,
    isLive,
    isConnecting,
    isConnected,
    error,
    buildStatus,
    autoScroll,
    setAutoScroll,
    start,
    stop,
    reconnect,
    containerRef,
  } = useBuildLogs(buildId, { autoScroll: true, idleCheckSeconds: 20 });

  // 필터링된 로그
  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      !filterQuery ||
      log.message.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.source?.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesLevel = !selectedLevel || log.level === selectedLevel;
    return matchesQuery && matchesLevel;
  });

  // 로그 통계
  const logStats = {
    total: logs.length,
    errors: logs.filter((l) => l.level === "ERROR").length,
    warnings: logs.filter((l) => l.level === "WARN").length,
    info: logs.filter((l) => l.level === "INFO").length,
    debug: logs.filter((l) => l.level === "DEBUG").length,
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "summary" ? "expanded" : "summary"));
  };

  const handleOpenInNewWindow = () => {
    const url = `/logs/${buildId}?mode=expanded`;
    window.open(url, "_blank", "width=1400,height=900");
  };

  const copyBuildId = () => {
    navigator.clipboard.writeText(buildId);
  };

  const downloadLogs = () => {
    const content = filteredLogs
      .map((line) => {
        const ts = new Date(line.ts).toISOString();
        const lvl = line.level || "INFO";
        const src = line.source ? `[${line.source}] ` : "";
        return `[${ts}] ${lvl}: ${src}${line.message}`;
      })
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `build-${buildId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 키보드 단축키
  useKeyboardShortcuts({
    isOpen,
    viewMode,
    onClose,
    onToggleViewMode: toggleViewMode,
    onNavigate: onNavigate || (() => {}),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenInNewWindow: handleOpenInNewWindow,
  });

  const levelColors = {
    ERROR: "bg-red-100 text-red-700 border-red-200",
    WARN: "bg-yellow-100 text-yellow-700 border-yellow-200",
    INFO: "bg-blue-100 text-blue-700 border-blue-200",
    DEBUG: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[90vw] h-[85vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Build #{buildId.slice(0, 8)}
                </Dialog.Title>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    Full ID: {buildId}
                  </span>
                  <button
                    onClick={copyBuildId}
                    className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title="Copy Build ID"
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={isPanelCollapsed ? "Show panel" : "Hide panel"}
              >
                {isPanelCollapsed ? (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>

              <button
                onClick={() => (isLive ? stop() : start())}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={isLive ? "Stop live" : "Start live"}
              >
                {isLive ? (
                  <Square className="w-4 h-4 text-red-600" />
                ) : (
                  <Play className="w-4 h-4 text-green-600" />
                )}
              </button>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={autoScroll ? "Autoscroll on" : "Autoscroll off"}
              >
                <ArrowDownToLine
                  className={cn(
                    "w-4 h-4",
                    autoScroll ? "text-blue-600" : "text-gray-600"
                  )}
                />
              </button>

              <button
                onClick={handleOpenInNewWindow}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={downloadLogs}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Download logs"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>

              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Metadata & Controls */}
            <div
              className={cn(
                "border-r border-gray-200 bg-gray-50 transition-all duration-300",
                isPanelCollapsed ? "w-0 overflow-hidden" : "w-80"
              )}
            >
              <div className="h-full overflow-y-auto p-6 space-y-6">
                {/* Build Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Build Information
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            buildStatus === "SUCCEEDED"
                              ? "bg-green-100 text-green-700"
                              : buildStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {buildStatus || buildMetadata?.status || "Running"}
                        </span>
                      </div>
                    </div>

                    {buildMetadata && (
                      <>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <GitBranch className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Branch:</span>
                            <span className="font-mono text-gray-900">
                              {buildMetadata.branch}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Commit:</span>
                            <span className="font-mono text-gray-900">
                              {buildMetadata.commit.slice(0, 7)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Author:</span>
                            <span className="text-gray-900">
                              {buildMetadata.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Duration:</span>
                            <span className="text-gray-900">
                              {buildMetadata.duration || "In progress..."}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Log Statistics */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Log Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer",
                        !selectedLevel
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      Total: {logStats.total}
                    </button>
                    <button
                      onClick={() => setSelectedLevel("ERROR")}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer",
                        selectedLevel === "ERROR"
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      Errors: {logStats.errors}
                    </button>
                    <button
                      onClick={() => setSelectedLevel("WARN")}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer",
                        selectedLevel === "WARN"
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      Warnings: {logStats.warnings}
                    </button>
                    <button
                      onClick={() => setSelectedLevel("INFO")}
                      className={cn(
                        "p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer",
                        selectedLevel === "INFO"
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      Info: {logStats.info}
                    </button>
                  </div>
                </div>

                {/* Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Filter Logs
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Filter logs..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Connection Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Connection
                  </h3>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isConnected
                            ? "bg-green-500 animate-pulse"
                            : isConnecting
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        )}
                      />
                      <span className="text-sm text-gray-600">
                        {isConnected
                          ? "Live connected"
                          : isConnecting
                          ? "Connecting..."
                          : "Disconnected"}
                      </span>
                    </div>
                    {error && (
                      <div className="mt-2 text-xs text-red-600">{error}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* CloudWatch Metrics */}
              <CloudWatchMetrics buildId={buildId} />
            </div>

            {/* Right Panel - Log Stream */}
            <div className="flex-1 flex flex-col bg-black">
              {/* Log Header Bar */}
              <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Showing {filteredLogs.length} of {logs.length} logs
                  </span>
                  {selectedLevel && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full border",
                        levelColors[selectedLevel as keyof typeof levelColors]
                      )}
                    >
                      {selectedLevel} only
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {isLive && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>LIVE</span>
                    </div>
                  )}
                  {autoScroll && (
                    <span className="text-blue-400">↓ Auto-scroll</span>
                  )}
                </div>
              </div>

              {/* Log Content */}
              <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-100"
              >
                {filteredLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No logs match your filter</p>
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((line, idx) => {
                    const levelColor =
                      line.level === "ERROR"
                        ? "text-red-400"
                        : line.level === "WARN"
                        ? "text-yellow-300"
                        : line.level === "DEBUG"
                        ? "text-gray-400"
                        : "text-blue-300";
                    const phaseColor =
                      line.phase === "BUILD"
                        ? "bg-indigo-700/40"
                        : line.phase === "PRE_BUILD"
                        ? "bg-sky-700/40"
                        : line.phase === "POST_BUILD"
                        ? "bg-teal-700/40"
                        : line.phase === "INSTALL"
                        ? "bg-emerald-700/40"
                        : line.phase === "FINAL"
                        ? "bg-purple-700/40"
                        : "bg-gray-700/40";

                    return (
                      <div
                        key={`${line.ts}-${idx}`}
                        className="mb-1 whitespace-pre-wrap break-words hover:bg-gray-900/50 px-2 py-0.5 rounded"
                      >
                        <span className="text-gray-500">
                          [{new Date(line.ts).toLocaleTimeString()}]
                        </span>
                        <span className={`ml-2 ${levelColor}`}>
                          {line.level}
                        </span>
                        {line.phase && (
                          <span
                            className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs ${phaseColor}`}
                          >
                            {line.phase}
                          </span>
                        )}
                        {line.source && (
                          <span className="ml-2 text-cyan-400">
                            [{line.source}]
                          </span>
                        )}
                        <span className="ml-2 text-gray-100">
                          {line.message}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LogDetailsDualPanel;
